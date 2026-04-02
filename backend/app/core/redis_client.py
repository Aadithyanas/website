import os
import logging
import asyncio
from redis import asyncio as aioredis
from dotenv import load_dotenv

# Use absolute path for .env file
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
load_dotenv(dotenv_path=env_path, override=True)

logger = logging.getLogger("erp_backend")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
print(f"--- [REDIS DEBUG] Connecting to: {REDIS_URL.split('@')[-1]} ---")

# SSL settings for Upstash/Production
# We use ssl_cert_reqs='none' (or None) if it's a 'rediss://' URL (SSL enabled)
is_ssl = REDIS_URL.startswith("rediss://")

# Singleton Redis client
redis = aioredis.from_url(
    REDIS_URL,
    encoding="utf8",
    decode_responses=True,
    max_connections=20,
    retry_on_timeout=True,
    # Crucial for Upstash/Render SSL issues:
    # Use ssl_cert_reqs='none' as a STRING for redis-py
    ssl_cert_reqs="none" if is_ssl else None,
    socket_timeout=5.0,
    socket_connect_timeout=5.0
)

async def check_redis_connection():
    try:
        # Extra short timeout for the initial ping
        await asyncio.wait_for(redis.ping(), timeout=3.0)
        logger.info("Successfully reached Redis")
        print("--- [REDIS DEBUG] Connection established! ---")
        return True
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        print(f"--- [REDIS DEBUG] FAILED to connect: {e} ---")
        return False
