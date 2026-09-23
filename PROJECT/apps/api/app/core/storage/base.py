from abc import ABC, abstractmethod
from typing import Optional


class BaseStorageProvider(ABC):
    """Abstract base class for object storage providers (Local, MinIO, S3)."""

    @abstractmethod
    async def save_file(self, storage_key: str, file_data: bytes, mime_type: str) -> str:
        pass

    @abstractmethod
    async def read_file(self, storage_key: str) -> Optional[bytes]:
        pass

    @abstractmethod
    def generate_download_url(self, storage_key: str, expires_seconds: int = 3600) -> str:
        pass
