import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "erp_db")

async def migrate():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print(f"Connecting to {DATABASE_NAME}...")
    
    # Drop old indexes in erp_users
    try:
        await db["erp_users"].drop_index("email_1")
        print("Dropped unique email index from erp_users")
    except Exception as e:
        print(f"Note: Could not drop email_1 from erp_users: {e}")

    # Drop old indexes in erp_invite_tokens
    try:
        await db["erp_invite_tokens"].drop_index("email_1")
        print("Dropped unique email index from erp_invite_tokens")
    except Exception as e:
        print(f"Note: Could not drop email_1 from erp_invite_tokens: {e}")

    # Create new composite indexes
    await db["erp_users"].create_index([("email", 1), ("org_id", 1)], unique=True)
    print("Created composite unique index (email, org_id) on erp_users")
    
    await db["erp_invite_tokens"].create_index([("email", 1), ("org_id", 1)], unique=True)
    print("Created composite unique index (email, org_id) on erp_invite_tokens")

    print("Migration complete!")

if __name__ == "__main__":
    asyncio.run(migrate())
