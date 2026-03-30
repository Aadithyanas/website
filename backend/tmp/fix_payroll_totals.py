import asyncio
import os
import sys
from bson import ObjectId
from datetime import datetime

# Add the project root to the path so we can import app modules
sys.path.append(os.getcwd())

from app.core.database import db, users_collection
from app.api.routes.erp_payroll import calculate_member_net_salary

async def migrate_payroll_totals():
    payroll_collection = db.payroll
    print("--- Starting Payroll Totals Migration ---")
    
    # Find all 'paid' records that have net_salary as 0 or missing
    cursor = payroll_collection.find({
        "status": "paid",
        "$or": [{"net_salary": {"$exists": False}}, {"net_salary": 0}, {"net_salary": 0.0}]
    })
    
    records = await cursor.to_list(length=1000)
    print(f"Found {len(records)} records to fix.")
    
    for doc in records:
        member_id = doc["member_id"]
        org_id = doc["org_id"]
        month = doc["month"]
        year = doc["year"]
        
        print(f"Fixing record for member {member_id} ({month}/{year})...")
        
        try:
            net_salary = await calculate_member_net_salary(str(member_id), org_id, month, year)
            
            await payroll_collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"net_salary": net_salary}}
            )
            print(f"  Success: Fixed with net_salary {net_salary}")
        except Exception as e:
            print(f"  Error fixing record {doc['_id']}: {str(e)}")
            
    print("--- Migration Finished ---")

if __name__ == "__main__":
    asyncio.run(migrate_payroll_totals())
