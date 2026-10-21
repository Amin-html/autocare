from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.uploads import delete_upload, save_image
from app.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User, UserRole
from app.schemas.appointment import AppointmentOut

router = APIRouter(prefix="/appointments", tags=["appointments"])

# Клиент может менять фото, пока работа не началась. Admin — всегда.
CLIENT_EDITABLE = (AppointmentStatus.pending, AppointmentStatus.confirmed)


def _get_editable(db: Session, appointment_id: int, user: User) -> Appointment:
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Запись не найдена")

    is_admin = user.role == UserRole.admin
    if appt.client_id != user.id and not is_admin:
        raise HTTPException(status_code=403, detail="Нет доступа к этой записи")
    if not is_admin and appt.status not in CLIENT_EDITABLE:
        raise HTTPException(
            status_code=409,
            detail="Фото можно менять только до начала работ по записи",
        )
    return appt


@router.post("/{appointment_id}/photo", response_model=AppointmentOut)
async def upload_appointment_photo(
    appointment_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = _get_editable(db, appointment_id, current_user)

    new_url = await save_image(file, "appointments")
    old_url = appt.photo_url
    appt.photo_url = new_url
    db.commit()
    db.refresh(appt)
    delete_upload(old_url)
    return appt


@router.delete("/{appointment_id}/photo", response_model=AppointmentOut)
def delete_appointment_photo(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appt = _get_editable(db, appointment_id, current_user)

    old_url = appt.photo_url
    appt.photo_url = None
    db.commit()
    db.refresh(appt)
    delete_upload(old_url)
    return appt
