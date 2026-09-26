import enum
from sqlalchemy import Column, Integer, ForeignKey, Enum, Numeric, String
from sqlalchemy.orm import relationship
from app.database import Base

class WorkOrderStatus(str, enum.Enum):
    open = "open"
    closed = "closed"

class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True, nullable=False)
    mileage = Column(Integer, nullable=False)
    status = Column(Enum(WorkOrderStatus), nullable=False, default=WorkOrderStatus.open)
    total = Column(Numeric(10, 2), nullable=False, default=0)

    appointment = relationship("Appointment", back_populates="work_order")
    items = relationship("WorkItem", back_populates="work_order")