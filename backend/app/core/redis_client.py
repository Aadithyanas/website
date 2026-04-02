import os
import logging
from redis import asyncio as aioredis
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("erp_backend")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Singleton Redis client
redis = aioredis.from_url(
    REDIS_URL, 
    encoding="utf8", 
    decode_responses=True,
    # Standard connection pool settings
    max_connections=20,
    retry_on_timeout=True
)

async def check_redis_connection():
    try:
        await redis.ping()
        logger.info("Successfully connected to Redis")
        return True
    except Exception as e:
        logger.error(f"Failed to connect to Redis at {REDIS_URL}: {e}")
        return False
