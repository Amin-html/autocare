from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import require_role
from app.models.user import UserRole
from app.models.bay import Bay
from app.schemas.bay import BayCreate, BayOut

router = APIRouter(prefix="/bays", tags=["bays"])

@router.get("", response_model=list[BayOut])
def list_bays(db: Session = Depends(get_db)):
    return db.query(Bay).filter(Bay.is_active == True).all()

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