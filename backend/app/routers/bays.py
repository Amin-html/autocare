from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import require_role
from app.models.user import UserRole
from app.models.bay import Bay
from app.models.appointment import Appointment
from app.schemas.bay import BayCreate, BayUpdate, BayOut

router = APIRouter(prefix="/bays", tags=["bays"])


@router.get("", response_model=list[BayOut])
def list_bays(db: Session = Depends(get_db)):
    return db.query(Bay).filter(Bay.is_active == True).all()


@router.get("/all", response_model=list[BayOut])
def list_all_bays(
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    return db.query(Bay).all()


@router.post("", response_model=BayOut, status_code=status.HTTP_201_CREATED)
def create_bay(
    bay_in: BayCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    bay = Bay(**bay_in.model_dump())
    db.add(bay)
    db.commit()
    db.refresh(bay)
    return bay


@router.patch("/{bay_id}", response_model=BayOut)
def update_bay(
    bay_id: int,
    data: BayUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    bay = db.query(Bay).filter(Bay.id == bay_id).first()
    if not bay:
        raise HTTPException(status_code=404, detail="Пост не найден")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(bay, field, value)

    db.commit()
    db.refresh(bay)
    return bay


@router.delete("/{bay_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bay(
    bay_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    bay = db.query(Bay).filter(Bay.id == bay_id).first()
    if not bay:
        raise HTTPException(status_code=404, detail="Пост не найден")

    has_history = db.query(Appointment).filter(Appointment.bay_id == bay_id).first()
    if has_history:
        raise HTTPException(
            status_code=409,
            detail="Нельзя удалить пост, на который есть записи. Деактивируйте его вместо удаления.",
        )

    db.delete(bay)
    db.commit()