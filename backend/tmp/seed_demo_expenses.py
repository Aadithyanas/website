import asyncio
from datetime import datetime
from app.core.database import users_collection, expenses_collection

async def seed_expenses():
    admin_email = "adithyanas2694@gmail.com"
    user = await users_collection.find_one({"email": admin_email})
    if not user:
        print(f"User {admin_email} not found.")
        return
    
    org_id = user["org_id"]
    now = datetime.utcnow()
    
    demo_expenses = [
        {"title": "AWS Hosting", "amount": 450.00, "category": "Infrastructure", "date": "2026-03-15", "status": "approved", "org_id": org_id, "created_at": now, "updated_at": now},
        {"title": "Google Workspace", "amount": 120.00, "category": "SaaS", "date": "2026-03-20", "status": "approved", "org_id": org_id, "created_at": now, "updated_at": now},
        {"title": "Office Rent", "amount": 2500.00, "category": "Office", "date": "2026-03-01", "status": "approved", "org_id": org_id, "created_at": now, "updated_at": now},
        {"title": "New Monitors", "amount": 840.00, "category": "Hardware", "date": "2026-03-25", "status": "pending", "org_id": org_id, "created_at": now, "updated_at": now},
    ]
    
    # Check if they already exist
    existing_count = await expenses_collection.count_documents({"org_id": org_id})
    if existing_count == 0:
        await expenses_collection.insert_many(demo_expenses)
        print(f"Seeded {len(demo_expenses)} demo expenses for org_id: {org_id}")
    else:
        print(f"Expenses already exist for org_id: {org_id}. Skipping seed.")

if __name__ == "__main__":
    asyncio.run(seed_expenses())
