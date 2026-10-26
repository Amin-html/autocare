import os
import uuid

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.stored_file import StoredFile

FILES_PREFIX = "/files/"
LEGACY_UPLOAD_ROOT = "uploads"  # старые файлы на диске (до перехода на хранение в БД)
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_IMAGE_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def _looks_like(content_type: str, data: bytes) -> bool:
    """Проверяем сигнатуру файла, а не только заголовок Content-Type от клиента."""
    if content_type == "image/jpeg":
        return data.startswith(b"\xff\xd8\xff")
    if content_type == "image/png":
        return data.startswith(b"\x89PNG\r\n\x1a\n")
    if content_type == "image/webp":
        return data[:4] == b"RIFF" and data[8:12] == b"WEBP"
    return False


async def save_image(file: UploadFile, kind: str, db: Session) -> str:
    """Кладёт картинку в таблицу stored_files и возвращает URL вида /files/<id>.

    Коммит делает вызывающий код: строка файла и ссылка на неё сохраняются одной транзакцией.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Поддерживаются только JPEG, PNG и WEBP")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Файл пустой")
    if len(data) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Файл не должен превышать 5 МБ")
    if not _looks_like(file.content_type, data):
        raise HTTPException(status_code=400, detail="Содержимое файла не похоже на изображение")

    file_id = uuid.uuid4().hex
    db.add(
        StoredFile(
            id=file_id,
            kind=kind,
            content_type=file.content_type,
            size=len(data),
            data=data,
        )
    )
    db.flush()
    return f"{FILES_PREFIX}{file_id}"


def delete_upload(url: str | None, db: Session) -> None:
    """Удаляет ранее загруженную картинку. Коммит — на вызывающем коде.

    Понимает и новые URL (/files/<id>), и старые (/uploads/...): для старых удаляет файл с диска, если он ещё есть.
    """
    if not url:
        return

    if url.startswith(FILES_PREFIX):
        file_id = url[len(FILES_PREFIX):]
        db.query(StoredFile).filter(StoredFile.id == file_id).delete(synchronize_session=False)
        return

    if url.startswith(f"/{LEGACY_UPLOAD_ROOT}/"):
        root = os.path.abspath(LEGACY_UPLOAD_ROOT)
        path = os.path.abspath(url.lstrip("/"))
        if path.startswith(root + os.sep) and os.path.isfile(path):
            os.remove(path)
