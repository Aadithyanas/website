from fastapi import APIRouter, HTTPException, Depends
from app.core.database import users_collection, attendance_collection, orgs_collection
from app.core.dependencies import get_current_user, require_admin
from bson import ObjectId
from datetime import datetime, timedelta
import calendar

router = APIRouter(prefix="/api/erp/salary", tags=["ERP Salary"])

@router.get("/report/{member_id}")
async def get_salary_report(member_id: str, month: int, year: int, current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    
    # Auth: Admin/HR or self
    if current_user.get("role") not in ["admin", "hr", "manager"] and str(current_user["_id"]) != member_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    user = await users_collection.find_one({"_id": ObjectId(member_id), "org_id": org_id})
    if not user:
        raise HTTPException(status_code=404, detail="Member not found")

    settings = await orgs_collection.find_one({"org_id": org_id}) or {}
    casual_limit = settings.get("casual_leave_limit", 2)
    medical_limit = settings.get("medical_leave_limit", 1)
    period_months = settings.get("period_months", 2)
    working_days = settings.get("working_days", [1, 2, 3, 4, 5]) # Default Mon-Fri

    base_salary = user.get("base_salary", 0)
    
    # Calculate working days in month
    _, num_days = calendar.monthrange(year, month)
    
    actual_working_days_count = 0
    for d in range(1, num_days + 1):
        dt = datetime(year, month, d)
        # Python's weekday(): 0=Mon, 6=Sun. My setting: 0=Sun, 1=Mon...6=Sat
        my_day_index = (dt.weekday() + 1) % 7
        if my_day_index in working_days:
            actual_working_days_count += 1
            
    daily_rate = base_salary / actual_working_days_count if actual_working_days_count > 0 else 0

    # Get approved leaves for the specific month
    month_start = f"{year}-{month:02d}-01"
    month_end = f"{year}-{month:02d}-{num_days:02d}"
    
    cursor = attendance_collection.find({
        "member_id": member_id,
        "org_id": org_id,
        "status": "approved",
        "date": {"$gte": month_start, "$lte": month_end}
    })
    
    month_leaves = []
    async for l in cursor:
        # Only count leaves if the date falls on a working day
        ldt = datetime.strptime(l["date"], "%Y-%m-%d")
        if (ldt.weekday() + 1) % 7 in working_days:
            month_leaves.append(l)

    # To calculate deductions, we need to check the entire period (period_months)
    # For simplicity, we check the current month's leaves against the limit
    # A fully accurate system would check a rolling window, but here we'll follow "per period"
    
    casual_count = sum(1 for l in month_leaves if l.get("leave_type") == "casual")
    medical_count = sum(1 for l in month_leaves if l.get("leave_type") == "medical")

    unpaid_casual = max(0, casual_count - casual_limit)
    unpaid_medical = max(0, medical_count - medical_limit)
    total_unpaid_leaves = unpaid_casual + unpaid_medical

    deduction = total_unpaid_leaves * daily_rate
    net_salary = base_salary - deduction

    return {
        "member_id": member_id,
        "member_name": user.get("name"),
        "month": month,
        "year": year,
        "base_salary": base_salary,
        "working_days_count": actual_working_days_count,
        "daily_rate": round(daily_rate, 2),
        "total_approved_leaves": len(month_leaves),
        "casual_leaves": casual_count,
        "medical_leaves": medical_count,
        "unpaid_leaves": total_unpaid_leaves,
        "deductions": round(deduction, 2),
        "net_salary": round(net_salary, 2),
        "leave_policy": {
            "casual_limit": casual_limit,
            "medical_limit": medical_limit,
            "period_months": period_months
        }
    }

@router.put("/member/{member_id}/salary")
async def update_member_salary(member_id: str, base_salary: float, admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(member_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid member ID")
        
    result = await users_collection.update_one(
        {"_id": oid, "org_id": admin.get("org_id")},
        {"$set": {"base_salary": base_salary}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
        
    return {"message": "Salary updated successfully"}
