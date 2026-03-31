import os
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from ..config import settings
from ..supabase_http import storage_upload_object


router = APIRouter(prefix="/uploads", tags=["uploads"])


def _get_bearer_token(request: Request) -> str | None:
    auth = request.headers.get("authorization")
    if not auth:
        return None
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1]


@router.post("/image")
async def upload_image(request: Request, file: UploadFile = File(...)):
    token = _get_bearer_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Solo imágenes")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]:
        ext = ""

    object_path = f"images/{uuid4().hex}{ext}"

    file_bytes = await file.read()

    try:
        public_url = await storage_upload_object(
            access_token=token,
            bucket=settings.SUPABASE_STORAGE_BUCKET,
            object_path=object_path,
            file_bytes=file_bytes,
            content_type=file.content_type,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error subiendo imagen: {e}")

    return {"url": public_url, "path": object_path}

