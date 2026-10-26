from sqlalchemy import Column, DateTime, Integer, LargeBinary, String, func
from sqlalchemy.orm import deferred

from app.database import Base


class StoredFile(Base):
    """Загруженная картинка (аватар, фото машины или записи). Хранится в БД, а не на диске:
    файловая система на Render эфемерна и стирается при каждом перезапуске."""

    __tablename__ = "stored_files"

    id = Column(String(32), primary_key=True)  # uuid4().hex — не угадывается, как и раньше имя файла
    kind = Column(String(32), nullable=False)  # avatars | cars | appointments
    content_type = Column(String(64), nullable=False)
    size = Column(Integer, nullable=False)
    data = deferred(Column(LargeBinary, nullable=False))  # байты не тянем, пока не нужны
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
