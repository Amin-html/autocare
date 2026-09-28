from datetime import datetime, timedelta, timezone, date
from sqlalchemy import func

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.car import Car
from app.models.service import Service
from app.models.bay import Bay
from app.models.appointment import Appointment, AppointmentStatus
from app.schemas.appointment import AppointmentCreate, AppointmentOut

router = APIRouter(prefix="/appointments", tags=["appointments"])

BUSY_STATUSES = (
    AppointmentStatus.pending,
    AppointmentStatus.confirmed,
    AppointmentStatus.in_progress,
)

@router.post("", response_model=AppointmentOut, status_code=status.HTTP_201_CREATED)
def create_appointment(
    data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    car = db.query(Car).filter(Car.id == data.car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    if car.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нельзя записать чужой автомобиль")

    service = db.query(Service).filter(Service.id == data.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Услуга не найдена")

    bay = db.query(Bay).filter(Bay.id == data.bay_id, Bay.is_active == True).first()  # noqa: E712
    if not bay:
        raise HTTPException(status_code=404, detail="Пост не найден или неактивен")

    if data.start_at.tzinfo is None:
        raise HTTPException(status_code=400, detail="Время должно быть указано с часовым поясом")

    if data.start_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Нельзя выбрать прошедшую дату")

    end_at = data.start_at + timedelta(minutes=service.duration_minutes)

    conflicting = (
        db.query(Appointment)
        .filter(
            Appointment.bay_id == data.bay_id,
            Appointment.status.in_(BUSY_STATUSES),
            Appointment.start_at < end_at,
            Appointment.end_at > data.start_at,
        )
        # .with_for_update()
        .first()
    )
    if conflicting:
        raise HTTPException(status_code=409, detail="Это время уже занято")

    appointment = Appointment(
        client_id=current_user.id,
        car_id=data.car_id,
        service_id=data.service_id,
        bay_id=data.bay_id,
        start_at=data.start_at,
        end_at=end_at,
        status=AppointmentStatus.pending,
        complaint=data.complaint,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return appointment

@router.get("", response_model=list[AppointmentOut])
def list_appointments(
    on_date: date | None = None,
    db: Session = Depends(get_db),
    _staff=Depends(require_role(UserRole.manager, UserRole.admin)),
):
    query = db.query(Appointment)
    if on_date:
        query = query.filter(func.date(Appointment.start_at) == on_date)
    return query.order_by(Appointment.start_at).all()

@router.get("/my", response_model=list[AppointmentOut])
def my_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Appointment).filter(Appointment.client_id == current_user.id).all()

@router.post("/{appointment_id}/confirm", response_model=AppointmentOut)
def confirm_appointment(
    appointment_id: int,
    master_id: int | None = None,
    db: Session = Depends(get_db),
    _manager=Depends(require_role(UserRole.manager, UserRole.admin)),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    if appt.status != AppointmentStatus.pending:
        raise HTTPException(status_code=409, detail="Подтвердить можно только запись в статусе 'ожидает'")

    appt.status = AppointmentStatus.confirmed
    if master_id:
        appt.master_id = master_id
    db.commit()
    db.refresh(appt)
    return appt

@router.post("/{appointment_id}/start", response_model=AppointmentOut)
def start_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    if current_user.role not in (UserRole.admin,) and appt.master_id != current_user.id:
        raise HTTPException(status_code=403, detail="Изменять может только назначенный мастер")
    if appt.status != AppointmentStatus.confirmed:
        raise HTTPException(status_code=409, detail="Начать работу можно только после подтверждения")

    appt.status = AppointmentStatus.in_progress
    db.commit()
    db.refresh(appt)
    return appt

@router.post("/{appointment_id}/cancel", response_model=AppointmentOut)
def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    if appt.client_id != current_user.id and current_user.role not in (UserRole.manager, UserRole.admin):
        raise HTTPException(status_code=403, detail="Нет прав на отмену этой записи")
    if appt.status not in (AppointmentStatus.pending, AppointmentStatus.confirmed):
        raise HTTPException(status_code=409, detail="Эту запись уже нельзя отменить")

    appt.status = AppointmentStatus.cancelled
    db.commit()
    db.refresh(appt)
    return appt