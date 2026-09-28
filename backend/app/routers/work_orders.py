from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.car import Car
from app.models.appointment import Appointment, AppointmentStatus
from app.models.work_order import WorkOrder, WorkOrderStatus
from app.models.work_item import WorkItem
from app.schemas.work_order import WorkOrderCreate, WorkOrderOut, WorkItemCreate

router = APIRouter(prefix="/work-orders", tags=["work_orders"])


def _check_master_or_admin(appt: Appointment, current_user: User):
    if current_user.role != UserRole.admin and appt.master_id != current_user.id:
        raise HTTPException(status_code=403, detail="Изменять заказ-наряд может только назначенный мастер")

@router.post("/appointments/{appointment_id}", response_model=WorkOrderOut, status_code=status.HTTP_201_CREATED)
def create_work_order(
    appointment_id: int,
    data: WorkOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    _check_master_or_admin(appt, current_user)

    if appt.status != AppointmentStatus.in_progress:
        raise HTTPException(status_code=409, detail="Заказ-наряд можно создать только для записи в работе")

    existing = db.query(WorkOrder).filter(WorkOrder.appointment_id == appointment_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Заказ-наряд для этой записи уже существует")

    car = db.query(Car).filter(Car.id == appt.car_id).first()
    if data.mileage < car.mileage:
        raise HTTPException(status_code=400, detail="Пробег не может быть меньше последнего зафиксированного значения")

    work_order = WorkOrder(
        appointment_id=appointment_id,
        mileage=data.mileage,
        status=WorkOrderStatus.open,
        total=Decimal("0"),
    )
    db.add(work_order)
    car.mileage = data.mileage
    db.commit()
    db.refresh(work_order)
    return work_order

@router.post("/{work_order_id}/items", response_model=WorkOrderOut)
def add_work_item(
    work_order_id: int,
    item_in: WorkItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    work_order = db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()
    if not work_order:
        raise HTTPException(status_code=404, detail="Заказ-наряд не найден")

    appt = db.query(Appointment).filter(Appointment.id == work_order.appointment_id).first()
    _check_master_or_admin(appt, current_user)

    if work_order.status == WorkOrderStatus.closed:
        raise HTTPException(status_code=409, detail="Закрытый заказ-наряд нельзя изменять")

    item = WorkItem(
        order_id=work_order.id,
        title=item_in.title,
        quantity=item_in.quantity,
        unit_price=item_in.unit_price,
    )
    db.add(item)
    db.flush()
    db.refresh(work_order)

    work_order.total = sum(i.unit_price * i.quantity for i in work_order.items)

    db.commit()
    db.refresh(work_order)
    return work_order

@router.post("/{work_order_id}/close", response_model=WorkOrderOut)
def close_work_order(
    work_order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    work_order = db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()
    if not work_order:
        raise HTTPException(status_code=404, detail="Заказ-наряд не найден")

    appt = db.query(Appointment).filter(Appointment.id == work_order.appointment_id).first()
    _check_master_or_admin(appt, current_user)

    if work_order.status == WorkOrderStatus.closed:
        raise HTTPException(status_code=409, detail="Заказ-наряд уже закрыт")
    if not work_order.items:
        raise HTTPException(status_code=400, detail="Нельзя закрыть заказ-наряд без работ")

    work_order.status = WorkOrderStatus.closed
    appt.status = AppointmentStatus.completed
    db.commit()
    db.refresh(work_order)
    return work_order

@router.get("/{work_order_id}", response_model=WorkOrderOut)
def get_work_order(
    work_order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    work_order = db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()
    if not work_order:
        raise HTTPException(status_code=404, detail="Заказ-наряд не найден")

    appt = db.query(Appointment).filter(Appointment.id == work_order.appointment_id).first()
    # видит владелец авто, назначенный мастер или админ/менеджер
    is_owner = appt.client_id == current_user.id
    is_master = appt.master_id == current_user.id
    is_staff = current_user.role in (UserRole.manager, UserRole.admin)
    if not (is_owner or is_master or is_staff):
        raise HTTPException(status_code=403, detail="Нет доступа к этому заказ-наряду")

    return work_order

@router.get("/by-appointment/{appointment_id}", response_model=WorkOrderOut | None)
def get_work_order_by_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Запись не найдена")

    is_owner = appt.client_id == current_user.id
    is_master = appt.master_id == current_user.id
    is_staff = current_user.role in (UserRole.manager, UserRole.admin)
    if not (is_owner or is_master or is_staff):
        raise HTTPException(status_code=403, detail="Нет доступа к этой записи")

    return db.query(WorkOrder).filter(WorkOrder.appointment_id == appointment_id).first()