import logging
import uuid
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, Request, Response, status, Depends
from fastapi.responses import JSONResponse

from app.config import settings
import app.models  # Register all declarative models
from app.database import AsyncSessionLocal, init_db, get_db
from app.core.seeder import SeederService
from app.middleware.tenant import TenantMiddleware
from app.middleware.dynamic_cors import DynamicCORSMiddleware, DEFAULT_EXPOSE_HEADERS, ALL_METHODS

# Clean Router Architecture
from app.routers.auth import router as auth_router, get_my_profile
from app.routers.organizations import router as organizations_router
from app.routers.users import router as users_router
from app.routers.invitations import router as invitations_router
from app.routers.domains import router as domains_router
from app.routers.departments import router as departments_router
from app.routers.modules import router as modules_router
from app.routers.packs import router as packs_router
from app.routers.roles import router as roles_router
from app.routers.permissions import router as permissions_router
from app.routers.navigation import router as navigation_router
from app.routers.workspace import router as workspace_router
from app.routers.dashboard import router as dashboard_router
from app.routers.rag import router as rag_router
from app.routers.documents import router as documents_router
from app.routers.knowledge import router as knowledge_router
from app.routers.audit import router as audit_router
from app.routers.health import router as health_router, health_check
from app.routers.settings import router as settings_router
from app.routers.finance import router as finance_router
from app.routers.hr import router as hr_router
from app.routers.it import router as it_router
from app.routers.legal import router as legal_router
from app.routers.operations import router as operations_router
from app.routers.chat import router as chat_router
from app.routers.ai_config import router as ai_config_router

from app.dependencies.auth import get_current_user

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexusrag")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing NexusRAG Platform Engine...")
    try:
        await init_db()
        logger.info("Database schema initialized.")
        
        # Run Seeder
        async with AsyncSessionLocal() as session:
            seeder = SeederService(session)
            await seeder.seed_all()
            logger.info("Seeder executed successfully.")
    except Exception as e:
        logger.warning(f"Database initialization warning: {e}")

    yield
    logger.info("Shutting down NexusRAG Platform Engine...")


app = FastAPI(
    title="NexusRAG Multi-Domain Enterprise Platform",
    version="2.0.0",
    description="Configuration-Driven Multi-Tenant RAG Platform with Pure Vector/Hybrid Retrieval & Strict ACL Isolation",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Security Headers & Request ID Middleware
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    req_id = request.headers.get("x-request-id") or f"req_{uuid.uuid4().hex[:12]}"
    request.state.request_id = req_id

    response = await call_next(request)

    response.headers["X-Request-ID"] = req_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if not getattr(settings, "DEBUG", False):
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

    return response

# 2. Subdomain & Tenant Context Middleware
app.add_middleware(TenantMiddleware)

# 3. Dynamic Database-Backed CORS Middleware
app.add_middleware(
    DynamicCORSMiddleware,
    allow_methods=ALL_METHODS,
    allow_headers=["*"],
    expose_headers=DEFAULT_EXPOSE_HEADERS,
    allow_credentials=True,
)

# 4. Mount Unified Routers with /api/v1 prefix
API_PREFIX = "/api/v1"

# 1. Platform / SuperAdmin
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(organizations_router, prefix=API_PREFIX)
app.include_router(modules_router, prefix=API_PREFIX)
app.include_router(packs_router, prefix=API_PREFIX)
app.include_router(permissions_router, prefix=API_PREFIX)
app.include_router(audit_router, prefix=API_PREFIX)
app.include_router(health_router, prefix=API_PREFIX)
app.include_router(settings_router, prefix=API_PREFIX)

# 2. Organization Admin
app.include_router(users_router, prefix=API_PREFIX)
app.include_router(invitations_router, prefix=API_PREFIX)
app.include_router(domains_router, prefix=API_PREFIX)
app.include_router(departments_router, prefix=API_PREFIX)
app.include_router(roles_router, prefix=API_PREFIX)

# 3. Application / Workspace / Knowledge / RAG / Domain Workflows
app.include_router(workspace_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)
app.include_router(rag_router, prefix=API_PREFIX)
app.include_router(documents_router, prefix=API_PREFIX)
app.include_router(knowledge_router, prefix=API_PREFIX)
app.include_router(navigation_router, prefix=API_PREFIX)
app.include_router(finance_router, prefix=API_PREFIX)
app.include_router(hr_router, prefix=API_PREFIX)
app.include_router(it_router, prefix=API_PREFIX)
app.include_router(legal_router, prefix=API_PREFIX)
app.include_router(operations_router, prefix=API_PREFIX)
app.include_router(chat_router, prefix=API_PREFIX)
app.include_router(ai_config_router, prefix=API_PREFIX)

# Direct shortcuts for /health, /me, and /me/access
from app.services.access_service import AccessService
from app.schemas.access import UserAccessResponse

@app.get("/health", tags=["Health"])
@app.get(f"{API_PREFIX}/health", tags=["Health"])
async def root_health_check():
    return await health_check()


@app.get("/me", tags=["Identity & Authentication"])
@app.get(f"{API_PREFIX}/me", tags=["Identity & Authentication"])
async def root_me(current_user=Depends(get_current_user), db=Depends(get_db)):
    return await get_my_profile(current_user, db)


@app.get("/me/access", response_model=UserAccessResponse, tags=["Identity & Authentication"])
@app.get(f"{API_PREFIX}/me/access", response_model=UserAccessResponse, tags=["Identity & Authentication"])
@app.get("/access", response_model=UserAccessResponse, tags=["Identity & Authentication"])
@app.get(f"{API_PREFIX}/access", response_model=UserAccessResponse, tags=["Identity & Authentication"])
async def root_me_access(current_user=Depends(get_current_user), db=Depends(get_db)):
    return await AccessService.get_user_access(db, current_user)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
