import uuid

from fastapi import UploadFile

from app.database import get_supabase


BUCKET_NAME = "documents"


async def upload_file(tenant_id: uuid.UUID, file: UploadFile) -> str:
    """Upload file to Supabase Storage. Returns the storage path."""
    supabase = get_supabase()
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
    path = f"{tenant_id}/{uuid.uuid4()}.{ext}"

    content = await file.read()
    supabase.storage.from_(BUCKET_NAME).upload(path, content)
    return path


def get_download_url(path: str) -> str:
    """Get a signed download URL for a stored file."""
    supabase = get_supabase()
    res = supabase.storage.from_(BUCKET_NAME).create_signed_url(path, 3600)
    return res.get("signedURL", "")


def delete_file(path: str) -> None:
    """Delete a file from storage."""
    supabase = get_supabase()
    supabase.storage.from_(BUCKET_NAME).remove([path])
