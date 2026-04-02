from fastapi import FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from app.api.routes import contact
from app.api.routes import erp_auth, erp_members, erp_tasks, erp_attendance, erp_notifications, erp_settings, erp_salary, erp_payroll, erp_ws, erp_clients, erp_invoices, erp_expenses, erp_projects, erp_chat
from app.core.database import create_indexes

app = FastAPI(title="Portfolio + ERP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.core.middleware import SecurityHeadersMiddleware, RequestProtectionMiddleware
from app.core.rate_limit import limiter, rate_limit_exceeded_handler

# Security Middlewares
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestProtectionMiddleware)

# Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Existing routes
app.include_router(contact.router)

# ERP routes
app.include_router(erp_auth.router)
app.include_router(erp_members.router)
app.include_router(erp_tasks.router)
app.include_router(erp_attendance.router)
app.include_router(erp_notifications.router)
app.include_router(erp_settings.router)
app.include_router(erp_salary.router)
app.include_router(erp_payroll.router)
app.include_router(erp_clients.router)
app.include_router(erp_invoices.router)
app.include_router(erp_expenses.router)
app.include_router(erp_projects.router)
app.include_router(erp_chat.router)
app.include_router(erp_ws.router)


@app.on_event("startup")
async def on_startup():
    await create_indexes()
    
    # Initialize Redis Cache with token-aware key builder
    from starlette.requests import Request
    from starlette.responses import Response

    def custom_key_builder(func, namespace: str = "", request: Request = None, response: Response = None, *args, **kwargs):
        token = request.headers.get("Authorization", "") if request else ""
        return ":".join([
            namespace,
            request.method.lower() if request else "none",
            request.url.path if request else func.__name__,
            repr(sorted(request.query_params.items())) if request else "",
            token
        ])
        
    redis = aioredis.from_url("redis://localhost:6379", encoding="utf8", decode_responses=True)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache", key_builder=custom_key_builder)