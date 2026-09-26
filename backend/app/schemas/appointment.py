from datetime import datetime
from pydantic import BaseModel

from app.models.appointment import AppointmentStatus

class AppointmentCreate(BaseModel):
    car_id: int
    service_id: int
    bay_id: int
    start_at: datetime
    complaint: str | None = None

class AppointmentOut(BaseModel):
    id: int
    client_id: int
    car_id: int
    service_id: int
    bay_id: int
    master_id: int | None
    start_at: datetime
    end_at: datetime
    status: AppointmentStatus
    complaint: str | None

    class Config:
        from_attributes = True