from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "erp_db")

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db["erp_users"]
tasks_collection = db["erp_tasks"]
attendance_collection = db["erp_attendance"]
notifications_collection = db["erp_notifications"]
invite_tokens_collection = db["erp_invite_tokens"]


async def create_indexes():
    """Create MongoDB indexes for performance."""
    await users_collection.create_index("email", unique=True)
    await tasks_collection.create_index("assigned_to")
    await attendance_collection.create_index([("member_id", 1), ("date", 1)])
    await notifications_collection.create_index("user_id")
    await invite_tokens_collection.create_index("token", unique=True)
    await invite_tokens_collection.create_index("email", unique=True)
