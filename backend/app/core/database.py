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
orgs_collection = db["erp_orgs"]


async def create_indexes():
    """Create MongoDB indexes for performance and multi-tenant constraints."""
    # Composite unique index allows same email in DIFFERENT organizations
    await users_collection.create_index([("email", 1), ("org_id", 1)], unique=True)
    await tasks_collection.create_index("assigned_to")
    await attendance_collection.create_index([("member_id", 1), ("date", 1)])
    await notifications_collection.create_index("user_id")
    await invite_tokens_collection.create_index("token", unique=True)
    # Allows multiple invites for same email to different organizations
    await invite_tokens_collection.create_index([("email", 1), ("org_id", 1)], unique=True)
