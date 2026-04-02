import os
import logging
from redis import asyncio as aioredis
from dotenv import load_dotenv

# Use absolute path for .env file
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env')
load_dotenv(dotenv_path=env_path, override=True)

logger = logging.getLogger("erp_backend")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
print(f"--- [REDIS DEBUG] Using URL: {REDIS_URL} ---")

# Singleton Redis client
redis = aioredis.from_url(
    REDIS_URL, 
    encoding="utf8", 
    decode_responses=True,
    # Standard connection pool settings
    max_connections=20,
    retry_on_timeout=True,
    ssl=True
)

async def check_redis_connection():
    try:
        await redis.ping()
        logger.info("Successfully connected to Redis")
        return True
    except Exception as e:
        logger.error(f"Failed to connect to Redis at {REDIS_URL}: {e}")
        return False
