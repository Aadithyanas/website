from fastapi import APIRouter, HTTPException, Depends, Request
from app.core.database import users_collection, attendance_collection, orgs_collection, db
from app.core.dependencies import get_current_user, require_admin
from app.schemas.erp_schemas import PayrollStatusUpdate
from bson import ObjectId
from datetime import datetime
import calendar
import razorpay
import os

router = APIRouter(prefix="/api/erp/payroll", tags=["ERP Payroll"])

# Collection name for payroll records
payroll_collection = db.payroll
from app.services.email_service import send_salary_payslip_email
from app.api.routes.erp_salary import get_salary_report

# Initialize Razorpay Client
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_YOUR_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "YOUR_KEY_SECRET")

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

async def calculate_member_net_salary(member_id: str, org_id: str, month: int, year: int) -> float:
    user = await users_collection.find_one({"_id": ObjectId(member_id), "org_id": org_id})
    if not user:
        return 0.0
        
    settings = await orgs_collection.find_one({"org_id": org_id}) or {}
    casual_limit = int(settings.get("casual_leave_limit", 2))
    medical_limit = int(settings.get("medical_leave_limit", 1))
    working_days = settings.get("working_days", [1, 2, 3, 4, 5])
    if not isinstance(working_days, list):
        working_days = [1, 2, 3, 4, 5]
    
    base_salary = float(user.get("base_salary", 0))
    _, num_days = calendar.monthrange(year, month)
    
    actual_work_days = 0
    for d in range(1, num_days + 1):
        if (datetime(year, month, d).weekday() + 1) % 7 in working_days:
            actual_work_days += 1
            
    daily_rate = base_salary / actual_work_days if actual_work_days > 0 else 0.0
    
    month_start = f"{year}-{month:02d}-01"
    month_end = f"{year}-{month:02d}-{num_days:02d}"
    
    attendance_cursor = attendance_collection.find({
        "member_id": member_id,
        "status": "approved",
        "date": {"$gte": month_start, "$lte": month_end}
    })
    
    leaves = await attendance_cursor.to_list(length=31)
    valid_leaves = []
    for l in leaves:
        ldt = datetime.strptime(l["date"], "%Y-%m-%d")
        if (ldt.weekday() + 1) % 7 in working_days:
            valid_leaves.append(l)
            
    casual_count = sum(1 for l in valid_leaves if l.get("leave_type") == "casual")
    medical_count = sum(1 for l in valid_leaves if l.get("leave_type") == "medical")
    
    unpaid_casual = max(0, casual_count - casual_limit)
    unpaid_medical = max(0, medical_count - medical_limit)
    deduction = (unpaid_casual + unpaid_medical) * daily_rate
    return round(base_salary - deduction, 2)

@router.get("/summary")
async def get_payroll_summary(month: int, year: int, admin: dict = Depends(require_admin)):
    org_id = admin.get("org_id")
    
    # 1. Get all members of the organization
    cursor = users_collection.find({"org_id": org_id})
    members = await cursor.to_list(length=200)
    
    # 2. Get existing payroll records for this month to check 'paid' status
    payroll_cursor = payroll_collection.find({"org_id": org_id, "month": month, "year": year})
    existing_records = {str(r["member_id"]): r for r in await payroll_cursor.to_list(length=200)}
    
    # 3. Get org settings for leave limits and working days
    settings = await orgs_collection.find_one({"org_id": org_id}) or {}
    casual_limit = settings.get("casual_leave_limit", 2)
    medical_limit = settings.get("medical_leave_limit", 1)
    working_days = settings.get("working_days", [1, 2, 3, 4, 5])
    
    summary = []
    
    for m in members:
        member_id_str = str(m["_id"])
        base_salary = m.get("base_salary", 0)
        
        # Calculate working days in month
        _, num_days = calendar.monthrange(year, month)
        actual_work_days = 0
        for d in range(1, num_days + 1):
            if (datetime(year, month, d).weekday() + 1) % 7 in working_days:
                actual_work_days += 1
        
        daily_rate = base_salary / actual_work_days if actual_work_days > 0 else 0
        
        # Get approved leaves on working days
        month_start = f"{year}-{month:02d}-01"
        month_end = f"{year}-{month:02d}-{num_days:02d}"
        
        attendance_cursor = attendance_collection.find({
            "member_id": member_id_str,
            "status": "approved",
            "date": {"$gte": month_start, "$lte": month_end}
        })
        
        leaves = await attendance_cursor.to_list(length=31)
        valid_leaves = []
        for l in leaves:
            ldt = datetime.strptime(l["date"], "%Y-%m-%d")
            if (ldt.weekday() + 1) % 7 in working_days:
                valid_leaves.append(l)
                
        casual_count = sum(1 for l in valid_leaves if l.get("leave_type") == "casual")
        medical_count = sum(1 for l in valid_leaves if l.get("leave_type") == "medical")
        
        unpaid_casual = max(0, casual_count - casual_limit)
        unpaid_medical = max(0, medical_count - medical_limit)
        deduction = (unpaid_casual + unpaid_medical) * daily_rate
        net_salary = base_salary - deduction
        
        record = existing_records.get(member_id_str, {})
        
        summary.append({
            "member_id": member_id_str,
            "member_name": m.get("name"),
            "member_email": m.get("email"),
            "avatar": m.get("avatar"),
            "base_salary": base_salary,
            "net_salary": round(net_salary, 2),
            "status": record.get("status", "unpaid"),
            "leaves_count": len(valid_leaves)
        })
        
    return summary

@router.put("/status/{member_id}")
async def update_payroll_status(
    member_id: str, 
    month: int, 
    year: int, 
    body: PayrollStatusUpdate, 
    admin: dict = Depends(require_admin)
):
    status = body.status
    update_data: dict = {
        "status": status,
        "updated_at": datetime.utcnow()
    }
    
    if status == "paid":
        net_salary = await calculate_member_net_salary(member_id, org_id, month, year)
        update_data["net_salary"] = net_salary

    await payroll_collection.update_one(
        {"org_id": org_id, "member_id": member_id, "month": month, "year": year},
        {"$set": update_data},
        upsert=True
    )
    
    return {"message": f"Payroll status for member updated to {body.status}"}

@router.post("/razorpay/order/{member_id}")
async def create_razorpay_order(
    member_id: str,
    month: int,
    year: int,
    admin: dict = Depends(require_admin)
):
    org_id = admin.get("org_id")
    
    net_salary = await calculate_member_net_salary(member_id, org_id, month, year)
    
    if net_salary is None:
        raise HTTPException(status_code=404, detail="Member not found")
        
    if float(net_salary) <= 0:
        raise HTTPException(status_code=400, detail="Salary amount must be greater than 0")

    # Razorpay amount is in Paise (1 INR = 100 Paise)
    amount_paise = int(float(net_salary) * 100)
    
    # Fetch user to get bank details for Razorpay notes
    user = await users_collection.find_one({"_id": ObjectId(member_id), "org_id": org_id})
    if not user:
        raise HTTPException(status_code=404, detail="Member not found")

    try:
        order_data = {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"receipt_{member_id}_{month}_{year}",
            "notes": {
                "member_id": member_id,
                "month": month,
                "year": year,
                "org_id": org_id,
                "bank_name": user.get("bank_name", "N/A"),
                "account_number": user.get("account_number", "N/A"),
                "ifsc_code": user.get("ifsc_code", "N/A")
            }
        }
        order = razorpay_client.order.create(data=order_data)
        return order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/razorpay/verify")
async def verify_razorpay_payment(
    request: Request,
    admin: dict = Depends(require_admin)
):
    body = await request.json()
    org_id = admin.get("org_id")
    
    razorpay_order_id = body.get("razorpay_order_id")
    razorpay_payment_id = body.get("razorpay_payment_id")
    razorpay_signature = body.get("razorpay_signature")
    
    member_id = body.get("member_id")
    month = body.get("month")
    year = body.get("year")

    # Verify signature
    params_dict = {
        'razorpay_order_id': razorpay_order_id,
        'razorpay_payment_id': razorpay_payment_id,
        'razorpay_signature': razorpay_signature
    }

    try:
        razorpay_client.utility.verify_payment_signature(params_dict)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    net_salary = await calculate_member_net_salary(member_id, org_id, month, year)

    # Update payroll status to paid
    await payroll_collection.update_one(
        {"org_id": org_id, "member_id": member_id, "month": month, "year": year},
        {
            "$set": {
                "status": "paid",
                "net_salary": net_salary,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_order_id": razorpay_order_id,
                "updated_at": datetime.utcnow()
            }
        },
        upsert=True
    )

    # 5. Generate and send payslip email
    try:
        user = await users_collection.find_one({"_id": ObjectId(member_id)})
        if user:
            # Get full salary report for the email
            salary_data = await get_salary_report(member_id, int(month), int(year), admin)
            month_name = calendar.month_name[int(month)]
            await send_salary_payslip_email(
                to_email=user["email"],
                name=user["name"],
                month_name=month_name,
                year=int(year),
                salary_data=salary_data,
                org_name=admin.get("org_name", "Company ERP")
            )
    except Exception as e:
        print(f"Failed to send payslip email: {str(e)}")

@router.get("/paid-invoices")
async def get_paid_salary_invoices(admin: dict = Depends(require_admin)):
    org_id = admin.get("org_id")
    
    # Fetch all records with 'paid' status for this org
    cursor = payroll_collection.find({"org_id": org_id, "status": "paid"}).sort("updated_at", -1)
    
    results = []
    async for doc in cursor:
        user = await users_collection.find_one({"_id": ObjectId(doc["member_id"])})
        if user:
            # Map payroll fields to invoice context
            month_name = calendar.month_name[doc["month"]]
            results.append({
                "id": str(doc["_id"]),
                "client_name": user.get("name", "Unknown Member"), # Alias for UI consistency
                "invoice_number": f"PAY-{doc['year']}-{doc['month']:02d}-{str(doc['member_id'])[:4].upper()}",
                "total": doc.get("net_salary", 0.0),
                "status": "paid",
                "due_date": f"{month_name} {doc['year']}",
                "created_at": doc.get("updated_at", datetime.utcnow()).isoformat(),
                "is_salary": True
            })
            
    return results
