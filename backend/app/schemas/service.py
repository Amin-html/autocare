from decimal import Decimal
from pydantic import BaseModel, Field

class ServiceCreate(BaseModel):
    name: str
    base_price: Decimal = Field(gt=0)
    duration_minutes: int = Field(gt=0)

class ServiceUpdate(BaseModel):
    name: str | None = None
    base_price: Decimal | None = Field(default=None, gt=0)
    duration_minutes: int | None = Field(default=None, gt=0)
    is_active: bool | None = None

class ServiceOut(BaseModel):
    id: int
    name: str
    base_price: Decimal
    duration_minutes: int
    is_active: bool

    class Config:
        from_attributes = True