from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
import logging
from starlette.responses import JSONResponse

logger = logging.getLogger("erp_backend")

def get_user_or_ip(request: Request) -> str:
    """
    Extracts the user ID from the Authorization header if available.
    Otherwise, falls back to the client's IP address.
    """
    token = request.headers.get("Authorization")
    if token and token.startswith("Bearer "):
        try:
            return token.split(" ")[1]
        except Exception:
            pass
    return get_remote_address(request)

import os
from dotenv import load_dotenv
load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Global SlowAPI Limiter with Redis storage
limiter = Limiter(
    key_func=get_user_or_ip, 
    default_limits=["200/minute"],
    storage_uri=REDIS_URL
)

def rate_limit_exceeded_handler(request: Request, exc: Exception):
    logger.warning(f"Rate limit exceeded for {get_user_or_ip(request)} on {request.url.path}")
    return JSONResponse(
        status_code=429,
        content={"detail": "Too Many Requests. Please slow down and try again later."},
    )
