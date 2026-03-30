from fastapi import APIRouter, HTTPException, Depends
from app.core.database import invoices_collection, clients_collection
from app.core.dependencies import get_current_user, require_admin
from app.schemas.erp_schemas import InvoiceCreate, InvoiceOut
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/erp/invoices", tags=["ERP Invoices"])

def serialize_invoice(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "org_id": doc.get("org_id", ""),
        "client_id": doc.get("client_id", ""),
        "client_name": doc.get("client_name", ""),
        "invoice_number": doc.get("invoice_number", ""),
        "items": doc.get("items", []),
        "subtotal": doc.get("subtotal", 0.0),
        "tax_rate": doc.get("tax_rate", 0.0),
        "tax_amount": doc.get("tax_amount", 0.0),
        "total": doc.get("total", 0.0),
        "status": doc.get("status", "draft"),
        "due_date": doc.get("due_date", ""),
        "created_at": doc.get("created_at", datetime.utcnow()).isoformat(),
        "updated_at": doc.get("updated_at", datetime.utcnow()).isoformat(),
    }

@router.post("/", response_model=InvoiceOut)
async def create_invoice(invoice_data: InvoiceCreate, current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    
    # Verify client exists and get name
    try:
        client_oid = ObjectId(invoice_data.client_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Client ID format")
        
    client = await clients_collection.find_one({"_id": client_oid, "org_id": org_id})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found in your organization")
        
    doc = invoice_data.dict()
    doc["org_id"] = org_id
    doc["client_name"] = client.get("name", "Unknown Client")
    doc["created_at"] = datetime.utcnow()
    doc["updated_at"] = datetime.utcnow()
    
    result = await invoices_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    
    return serialize_invoice(doc)

@router.get("/", response_model=list[InvoiceOut])
async def list_invoices(current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    cursor = invoices_collection.find({"org_id": org_id}).sort("created_at", -1)
    
    invoices = []
    async for doc in cursor:
        invoices.append(serialize_invoice(doc))
        
    return invoices

@router.get("/{invoice_id}", response_model=InvoiceOut)
async def get_invoice(invoice_id: str, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(invoice_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Invoice ID")
        
    doc = await invoices_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    return serialize_invoice(doc)

@router.put("/{invoice_id}/status")
async def update_invoice_status(invoice_id: str, status: str, admin: dict = Depends(require_admin)):
    valid_statuses = ["draft", "sent", "paid", "overdue"]
    if status.lower() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
    try:
        oid = ObjectId(invoice_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Invoice ID")
        
    result = await invoices_collection.update_one(
        {"_id": oid, "org_id": admin.get("org_id")},
        {"$set": {"status": status.lower(), "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    doc = await invoices_collection.find_one({"_id": oid})
    return serialize_invoice(doc)

from app.services.email_service import send_client_invoice_email

@router.post("/{invoice_id}/send")
async def send_invoice(invoice_id: str, admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(invoice_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Invoice ID")
        
    invoice = await invoices_collection.find_one({"_id": oid, "org_id": admin.get("org_id")})
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    client = await clients_collection.find_one({"_id": ObjectId(invoice["client_id"])})
    if not client or not client.get("email"):
        raise HTTPException(status_code=400, detail="Client email not found")
        
    try:
        await send_client_invoice_email(
            to_email=client["email"],
            client_name=client["name"],
            invoice_data=serialize_invoice(invoice),
            org_name=admin.get("org_name", "Company ERP")
        )
        
        # Mark as sent automatically
        await invoices_collection.update_one({"_id": oid}, {"$set": {"status": "sent", "updated_at": datetime.utcnow()}})
        
        return {"message": "Invoice sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send invoice email: {str(e)}")

@router.delete("/{invoice_id}")
async def delete_invoice(invoice_id: str, admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(invoice_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Invoice ID")
        
    result = await invoices_collection.delete_one({"_id": oid, "org_id": admin.get("org_id")})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    return {"message": "Invoice deleted successfully"}
