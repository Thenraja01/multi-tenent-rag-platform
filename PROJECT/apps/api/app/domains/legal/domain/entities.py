from dataclasses import dataclass
from typing import Optional
from datetime import date


@dataclass
class LegalContractEntity:
    id: str
    organization_id: str
    title: str
    party_name: str
    contract_type: str
    status: str
    effective_date: Optional[date] = None
    expiry_date: Optional[date] = None
