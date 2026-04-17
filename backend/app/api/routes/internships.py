from fastapi import APIRouter, HTTPException, Depends
from app.schemas.internship_schema import InternshipCreate, InternshipOut, RazorpayOrderResponse, PaymentVerification
from app.services.razorpay_service import create_razorpay_order, verify_razorpay_payment
from app.services.email_service import (
    send_internship_invoice_email, 
    send_internship_pending_email, 
    send_internship_complete_email
)
from app.core.database import internships_collection
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter(prefix="/api/internships", tags=["Internships"])

def serialize_internship(doc: dict) -> dict:
    return {
        **{k: v for k, v in doc.items() if k != "_id"},
        "id": str(doc["_id"]),
        "created_at": doc.get("created_at", datetime.utcnow())
    }

@router.post("/create-order", response_model=RazorpayOrderResponse)
async def create_order(amount: int):
    try:
        # amount coming from frontend is in Rupees, convert to Paise for Razorpay
        order = create_razorpay_order(amount)
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Razorpay order creation failed: {str(e)}")

async def generate_reg_id():
    count = await internships_collection.count_documents({})
    year = datetime.now().strftime("%y")
    month = datetime.now().strftime("%m")
    return f"ITN-{year}{month}-{1001 + count}"

@router.post("/verify-payment")
async def verify_payment(data: PaymentVerification):
    # 1. Verify Razorpay Signature
    is_valid = verify_razorpay_payment(
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature
    )
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    
    # 2. Save to Database
    internship_doc = data.internship_data.dict()
    internship_doc["status"] = "paid"
    internship_doc["payment_id"] = data.razorpay_payment_id
    internship_doc["order_id"] = data.razorpay_order_id
    internship_doc["created_at"] = datetime.utcnow()
    
    reg_id = await generate_reg_id()
    internship_doc["registration_id"] = reg_id
    
    # Amount is now passed directly from frontend
    amount_paid = internship_doc.get("amount", 0)
    
    result = await internships_collection.insert_one(internship_doc)
    
    # 3. Send Email Invoice
    try:
        await send_internship_invoice_email(
            to_email=data.internship_data.email,
            student_name=data.internship_data.name,
            amount=amount_paid,
            registration_id=reg_id
        )
    except Exception as e:
        print(f"Failed to send email: {e}")
    
    return {"status": "success", "id": str(result.inserted_id), "registration_id": reg_id}

@router.get("/list", response_model=List[dict])
async def list_internships():
    try:
        cursor = internships_collection.find().sort("created_at", -1)
        results = []
        async for doc in cursor:
            results.append(serialize_internship(doc))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database or Serialization error: {str(e)}")

@router.delete("/{internship_id}")
async def delete_internship(internship_id: str):
    result = await internships_collection.delete_one({"_id": ObjectId(internship_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
    return {"status": "success", "message": "Registration deleted"}

@router.patch("/{internship_id}")
async def update_internship(internship_id: str, data: dict):
    # Basic update logic - in production you'd want a proper schema for updates
    if "_id" in data: del data["_id"]
    if "id" in data: del data["id"]
    
    result = await internships_collection.update_one(
        {"_id": ObjectId(internship_id)},
        {"$set": data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registration not found")
    return {"status": "success", "message": "Registration updated"}

@router.post("/submit-manual")
async def submit_manual(data: InternshipCreate):
    # 1. Prepare Document
    internship_doc = data.dict()
    internship_doc["status"] = "pending"
    internship_doc["created_at"] = datetime.utcnow()
    
    reg_id = await generate_reg_id()
    internship_doc["registration_id"] = reg_id
    
    # 2. Save to Database
    result = await internships_collection.insert_one(internship_doc)
    
    # 3. Send Pending Email
    try:
        await send_internship_pending_email(
            to_email=data.email,
            student_name=data.name,
            registration_id=reg_id,
            amount=data.amount
        )
    except Exception as e:
        print(f"Failed to send pending email: {e}")
    
    return {"status": "success", "id": str(result.inserted_id), "registration_id": reg_id}

@router.post("/{id}/send-success-email")
async def send_success_email(id: str):
    # 1. Fetch registration
    reg = await internships_collection.find_one({"_id": ObjectId(id)})
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
        
    # 2. Update status to paid if not already
    await internships_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": "paid"}}
    )
    
    # 3. Send Completion Email
    try:
        await send_internship_complete_email(
            to_email=reg["email"],
            student_name=reg["name"],
            registration_id=reg.get("registration_id", "ID-PENDING")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
        
    return {"status": "success", "message": "Confirmation email sent"}
