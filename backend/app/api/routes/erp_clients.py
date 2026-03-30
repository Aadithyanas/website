from fastapi import APIRouter, HTTPException, Depends
from app.core.database import clients_collection
from app.core.dependencies import get_current_user, require_admin
from app.schemas.erp_schemas import ClientCreate, ClientOut
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/erp/clients", tags=["ERP Clients"])

def serialize_client(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "org_id": doc.get("org_id", ""),
        "name": doc.get("name", ""),
        "email": doc.get("email"),
        "phone": doc.get("phone"),
        "address": doc.get("address"),
        "company": doc.get("company"),
        "created_at": doc.get("created_at", datetime.utcnow()).isoformat(),
        "updated_at": doc.get("updated_at", datetime.utcnow()).isoformat(),
    }

@router.post("/", response_model=ClientOut)
async def create_client(client_data: ClientCreate, current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    
    doc = client_data.dict()
    doc["org_id"] = org_id
    doc["created_at"] = datetime.utcnow()
    doc["updated_at"] = datetime.utcnow()
    
    result = await clients_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    
    return serialize_client(doc)

@router.get("/", response_model=list[ClientOut])
async def list_clients(current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    cursor = clients_collection.find({"org_id": org_id}).sort("created_at", -1)
    
    clients = []
    async for doc in cursor:
        clients.append(serialize_client(doc))
        
    return clients

@router.get("/{client_id}", response_model=ClientOut)
async def get_client(client_id: str, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(client_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Client ID")
        
    doc = await clients_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
    if not doc:
        raise HTTPException(status_code=404, detail="Client not found")
        
    return serialize_client(doc)

@router.put("/{client_id}", response_model=ClientOut)
async def update_client(client_id: str, client_data: ClientCreate, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(client_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Client ID")
        
    update_data = client_data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    result = await clients_collection.update_one(
        {"_id": oid, "org_id": current_user.get("org_id")},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
        
    doc = await clients_collection.find_one({"_id": oid})
    return serialize_client(doc)

@router.delete("/{client_id}")
async def delete_client(client_id: str, admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(client_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Client ID")
        
    result = await clients_collection.delete_one({"_id": oid, "org_id": admin.get("org_id")})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
        
    return {"message": "Client deleted successfully"}
