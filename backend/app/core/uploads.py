import os
import uuid

from fastapi import HTTPException, UploadFile

UPLOAD_ROOT = "uploads"
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


async def save_image(file: UploadFile, subdir: str) -> str:
    """Сохраняет картинку в uploads/<subdir>/ и возвращает URL вида /uploads/<subdir>/<имя>."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Поддерживаются только JPEG, PNG и WEBP")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Файл пустой")
    if len(data) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Файл не должен превышать 5 МБ")
    if not _looks_like(file.content_type, data):
        raise HTTPException(status_code=400, detail="Содержимое файла не похоже на изображение")

    folder = os.path.join(UPLOAD_ROOT, subdir)
    os.makedirs(folder, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.{ALLOWED_IMAGE_TYPES[file.content_type]}"
    with open(os.path.join(folder, filename), "wb") as f:
        f.write(data)
    return f"/{UPLOAD_ROOT}/{subdir}/{filename}"


def delete_upload(url: str | None) -> None:
    """Удаляет ранее загруженный файл. Ничего не делает, если путь вне uploads/."""
    if not url or not url.startswith(f"/{UPLOAD_ROOT}/"):
        return
    root = os.path.abspath(UPLOAD_ROOT)
    path = os.path.abspath(url.lstrip("/"))
    if path.startswith(root + os.sep) and os.path.isfile(path):
        os.remove(path)