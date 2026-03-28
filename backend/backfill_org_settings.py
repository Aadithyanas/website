import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "erp_db")

async def backfill():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    users_col = db["erp_users"]
    orgs_col = db["erp_orgs"]
    
    # Get all unique org_ids from users
    org_ids = await users_col.distinct("org_id")
    print(f"Found {len(org_ids)} organizations to backfill.")
    
    for oid in org_ids:
        if not oid: continue
        
        # Check if settings already exist
        exists = await orgs_col.find_one({"org_id": oid})
        if not exists:
            # Get org name from one of the users
            user = await users_col.find_one({"org_id": oid})
            org_name = user.get("org_name", "Unknown Org") if user else "Unknown Org"
            
            await orgs_col.insert_one({
                "org_id": oid,
                "org_name": org_name,
                "positions": ["Developer", "Designer", "Manager", "HR", "Tester"],
                "teams": ["IT", "Robotics", "Social Media", "Marketing"],
                "sprints": ["Backlog", "Q1-Sprint-1", "Q1-Sprint-2"],
                "created_at": datetime.utcnow()
            })
            print(f"Initialized settings for {org_name} ({oid})")
        else:
            print(f"Settings already exist for {exists.get('org_name')} ({oid})")

    print("Backfill complete!")

if __name__ == "__main__":
    asyncio.run(backfill())
