import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.domains.legal.schemas.schemas import LegalContractCreate


class LegalApplicationService:
    @staticmethod
    async def process_contract(session: AsyncSession, organization_id: str, data: LegalContractCreate) -> dict:
        contract_id = str(uuid.uuid4())
        return {
            "id": contract_id,
            "organization_id": organization_id,
            "title": data.title,
            "party_name": data.party_name,
            "contract_type": data.contract_type,
            "status": "DRAFT",
        }
