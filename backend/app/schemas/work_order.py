from decimal import Decimal
from pydantic import BaseModel, Field

from app.models.work_order import WorkOrderStatus

class WorkItemCreate(BaseModel):
    title: str
    quantity: int = Field(gt=0, default=1)
    unit_price: Decimal = Field(gt=0)

class WorkItemOut(BaseModel):
    id: int
    title: str
    quantity: int
    unit_price: Decimal

    class Config:
        from_attributes = True

class WorkOrderCreate(BaseModel):
    mileage: int = Field(ge=0)

class WorkOrderOut(BaseModel):
    id: int
    appointment_id: int
    mileage: int
    status: WorkOrderStatus
    total: Decimal
    items: list[WorkItemOut] = []

    class Config:
        from_attributes = True