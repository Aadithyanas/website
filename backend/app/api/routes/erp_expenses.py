from fastapi import APIRouter, HTTPException, Depends
from app.core.database import expenses_collection
from app.core.dependencies import get_current_user
from app.schemas.erp_schemas import ExpenseCreate, ExpenseUpdate, ExpenseOut
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter(prefix="/api/erp/expenses", tags=["ERP Expenses"])

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
        "created_at": exp["created_at"],
        "updated_at": exp["updated_at"]
    }

@router.get("/", response_model=List[ExpenseOut])
async def list_expenses(current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    expenses = []
    cursor = expenses_collection.find({"org_id": org_id}).sort("created_at", -1)
    async for exp in cursor:
        expenses.append(serialize_expense(exp))
    return expenses

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

@router.put("/{expense_id}", response_model=ExpenseOut)
async def update_expense(expense_id: str, body: ExpenseUpdate, current_user: dict = Depends(get_current_user)):
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
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    try:
        oid = ObjectId(expense_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid expense ID")
        
    result = await expenses_collection.delete_one({"_id": oid, "org_id": org_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    return {"message": "Expense deleted"}
