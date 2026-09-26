from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class Bay(Base):
    __tablename__ = "bays"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)