from sqlalchemy import Column, Integer, String, Numeric
from app.database import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    base_price = Column(Numeric(10, 2), nullable=False)
    duration_minutes = Column(Integer, nullable=False)