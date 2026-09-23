from dataclasses import dataclass
from typing import Optional


@dataclass
class ITTicketEntity:
    id: str
    organization_id: str
    title: str
    priority: str
    status: str
    description: Optional[str] = None
