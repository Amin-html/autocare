from pydantic import BaseModel
from app.models.user import UserRole


class RoleUpdate(BaseModel):
    role: UserRole


class ProfileUpdate(BaseModel):
    full_name: str