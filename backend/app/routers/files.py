import re

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.stored_file import StoredFile

router = APIRouter(prefix="/files", tags=["files"])

_ID_RE = re.compile(r"^[0-9a-f]{32}$")


@router.get("/{file_id}")
def get_file(file_id: str, request: Request, db: Session = Depends(get_db)):
    """Публичная отдача картинки (как раньше /uploads): <img> не умеет слать токен.
    Идентификатор — случайный uuid, содержимое по нему не меняется, поэтому кэшируем надолго."""
    if not _ID_RE.match(file_id):
        raise HTTPException(status_code=404, detail="Файл не найден")

    meta = db.query(StoredFile.content_type).filter(StoredFile.id == file_id).first()
    if not meta:
        raise HTTPException(status_code=404, detail="Файл не найден")

    etag = f'"{file_id}"'
    headers = {
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": etag,
        "X-Content-Type-Options": "nosniff",
    }
    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers=headers)

    data = db.query(StoredFile.data).filter(StoredFile.id == file_id).scalar()
    return Response(content=data, media_type=meta.content_type, headers=headers)
