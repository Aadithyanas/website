from fastapi import APIRouter, HTTPException, Depends, File, UploadFile
from fastapi.responses import FileResponse
from app.core.database import expenses_collection
from app.core.dependencies import get_current_user, require_permission
from app.schemas.erp_schemas import ExpenseCreate, ExpenseUpdate, ExpenseOut
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
import os
import uuid
import shutil

router = APIRouter(prefix="/api/erp/expenses", tags=["ERP Expenses"])

UPLOAD_DIR = "uploads/expenses"

def serialize_expense(exp: dict) -> dict:
    return {
        "id": str(exp["_id"]),
        "org_id": str(exp["org_id"]),
        "title": exp["title"],
        "amount": exp["amount"],
        "category": exp["category"],
        "date": exp["date"],
        "description": exp.get("description"),
        "status": exp.get("status", "pending"),
        "bill_image": exp.get("bill_image"),
        "created_at": exp["created_at"],
        "updated_at": exp["updated_at"]
    }

@router.get("/", response_model=List[ExpenseOut])
async def list_expenses(
    month: Optional[int] = None, 
    year: Optional[int] = None, 
    current_user: dict = Depends(get_current_user)
):
    org_id = current_user.get("org_id")
    query = {"org_id": org_id}
    
    # If no month/year provided, default to current month
    if month is None and year is None:
        now = datetime.utcnow()
        month = now.month
        year = now.year

    if month and year:
        # Match date string "YYYY-MM-DD" or similar
        regex = f"^{year}-{month:02d}-"
        query["date"] = {"$regex": regex}
    elif year:
        regex = f"^{year}-"
        query["date"] = {"$regex": regex}

    expenses = []
    cursor = expenses_collection.find(query).sort("date", -1)
    async for exp in cursor:
        expenses.append(serialize_expense(exp))
    return expenses

@router.get("/summary")
async def get_expense_summary(current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    now = datetime.utcnow()
    curr_month_regex = f"^{now.year}-{now.month:02d}-"
    curr_year_regex = f"^{now.year}-"

    # Monthly Total
    month_cursor = expenses_collection.find({"org_id": org_id, "date": {"$regex": curr_month_regex}})
    month_total = 0
    async for exp in month_cursor:
        month_total += exp.get("amount", 0)

    # Yearly Total
    year_cursor = expenses_collection.find({"org_id": org_id, "date": {"$regex": curr_year_regex}})
    year_total = 0
    async for exp in year_cursor:
        year_total += exp.get("amount", 0)

    return {
        "monthly_total": month_total,
        "yearly_total": year_total,
        "month": now.month,
        "year": now.year
    }

@router.post("/", response_model=ExpenseOut)
async def create_expense(body: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    now = datetime.utcnow()
    
    expense_doc = body.dict()
    expense_doc["org_id"] = org_id
    expense_doc["created_at"] = now
    expense_doc["updated_at"] = now
    
    result = await expenses_collection.insert_one(expense_doc)
    expense_doc["_id"] = result.inserted_id
    
    return serialize_expense(expense_doc)

@router.post("/{expense_id}/upload")
async def upload_expense_bill(expense_id: str, file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(expense_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid expense ID")
    
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1]
    file_name = f"bill_{expense_id}_{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"/api/erp/expenses/attachments/{file_name}"
    await expenses_collection.update_one({"_id": oid, "org_id": current_user.get("org_id")}, {"$set": {"bill_image": image_url, "updated_at": datetime.utcnow()}})
    
    return {"message": "Bill uploaded", "url": image_url}

@router.get("/attachments/{filename}")
async def get_expense_attachment(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

@router.put("/{expense_id}", response_model=ExpenseOut)
async def update_expense(expense_id: str, body: ExpenseUpdate, current_user: dict = Depends(require_permission("manage_payroll"))):
    org_id = current_user.get("org_id")
    try:
        oid = ObjectId(expense_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid expense ID")
        
    existing = await expenses_collection.find_one({"_id": oid, "org_id": org_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    updates = {k: v for k, v in body.dict(exclude_unset=True).items()}
    updates["updated_at"] = datetime.utcnow()
    
    await expenses_collection.update_one({"_id": oid}, {"$set": updates})
    updated = await expenses_collection.find_one({"_id": oid})
    
    return serialize_expense(updated)

@router.delete("/{expense_id}")
async def delete_expense(expense_id: str, current_user: dict = Depends(require_permission("manage_payroll"))):
    org_id = current_user.get("org_id")
    try:
        oid = ObjectId(expense_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid expense ID")
        
    result = await expenses_collection.delete_one({"_id": oid, "org_id": org_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    return {"message": "Expense deleted"}

