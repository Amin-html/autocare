from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User, UserRole
from app.schemas.auth import UserOut
from app.schemas.user import RoleUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    _admin=Depends(require_role(UserRole.admin)),
):
    return db.query(User).order_by(User.id).all()


@router.patch("/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    data: RoleUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_role(UserRole.admin)),
):
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Нельзя изменить свою собственную роль")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    user.role = data.role
    db.commit()
    db.refresh(user)
    return user