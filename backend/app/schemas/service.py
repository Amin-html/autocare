from decimal import Decimal
from pydantic import BaseModel, Field

class ServiceCreate(BaseModel):
    name: str
    base_price: Decimal = Field(gt=0)
    duration_minutes: int = Field(gt=0)


class ServiceOut(BaseModel):
    id: int
    name: str
    base_price: Decimal
    duration_minutes: int

    class Config:
        from_attributes = True