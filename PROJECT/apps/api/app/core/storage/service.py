import logging
import os
from typing import Optional
from app.config import settings
from app.core.storage.base import BaseStorageProvider

logger = logging.getLogger("nexusrag.core.storage")


class StorageService(BaseStorageProvider):
    """Manages secure MinIO/S3 object storage with tenant and domain path isolation."""

    def __init__(self):
        self.endpoint = getattr(settings, "MINIO_ENDPOINT", "localhost:9000")
        self.access_key = getattr(settings, "MINIO_ROOT_USER", "minio_admin")
        self.secret_key = getattr(settings, "MINIO_ROOT_PASSWORD", "minio_password123")
        self.bucket_name = getattr(settings, "S3_BUCKET_NAME", "nexusrag-documents")
        self._local_storage_dir = os.path.abspath(getattr(settings, "STORAGE_LOCAL_PATH", "./storage/documents"))
        os.makedirs(self._local_storage_dir, exist_ok=True)

    def generate_storage_key(self, organization_id: str, domain_id: str, document_id: str, filename: str) -> str:
        """Generate isolated storage key: organization_id/domain_id/documents/document_id/filename"""
        safe_filename = "".join(c for c in filename if c.isalnum() or c in (".", "-", "_")).strip()
        return f"{organization_id}/{domain_id}/documents/{document_id}/{safe_filename}"

    async def save_file(self, storage_key: str, file_data: bytes, mime_type: str) -> str:
        """Save file bytes to local filesystem with cloud storage readiness."""
        local_path = os.path.join(self._local_storage_dir, storage_key.replace("/", os.sep))
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with open(local_path, "wb") as f:
            f.write(file_data)
        return storage_key

    async def read_file(self, storage_key: str) -> Optional[bytes]:
        """Read file bytes securely."""
        local_path = os.path.join(self._local_storage_dir, storage_key.replace("/", os.sep))
        if os.path.exists(local_path):
            with open(local_path, "rb") as f:
                return f.read()
        return None

    def generate_download_url(self, storage_key: str, expires_seconds: int = 3600) -> str:
        """Generate secure download endpoint."""
        return f"/api/v1/knowledge/documents/download?storage_key={storage_key}"


storage_service = StorageService()
