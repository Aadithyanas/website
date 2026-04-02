from fastapi import Request
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response, JSONResponse

logger = logging.getLogger("erp_backend")

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src * data: blob:;"
        return response

class RequestProtectionMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_upload_size: int = 20 * 1024 * 1024):
        super().__init__(app)
        self.max_upload_size = max_upload_size # e.g. 20MB limit

    async def dispatch(self, request: Request, call_next) -> Response:
        # Check payload size (mitigate large payloads)
        content_length = request.headers.get("Content-Length")
        if content_length and int(content_length) > self.max_upload_size:
            return JSONResponse(
                status_code=413,
                content={"detail": "Request entity too large"}
            )

        start_time = time.time()
        try:
            response = await call_next(request)
        except Exception as e:
            logger.error(f"Request failed: {request.url.path} - Exception: {str(e)}")
            raise e
            
        process_time = time.time() - start_time
        
        # Log slow requests (> 1 second)
        if process_time > 1.0:
            logger.warning(f"Slow request detected: {request.method} {request.url.path} took {process_time:.2f}s")
            
        response.headers["X-Process-Time"] = str(process_time)
        return response
