from fastapi import APIRouter, HTTPException, Depends
from app.core.database import orgs_collection
from app.core.dependencies import get_current_user, require_admin
from app.schemas.erp_schemas import OrganizationSettings, OrganizationSettingsUpdate
from datetime import datetime

router = APIRouter(prefix="/api/erp/settings", tags=["ERP Settings"])

@router.get("/", response_model=OrganizationSettings)
async def get_settings(current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    settings = await orgs_collection.find_one({"org_id": org_id})
    if not settings:
        # Return defaults if not set
        return OrganizationSettings()
    return settings

@router.put("/")
async def update_settings(body: OrganizationSettingsUpdate, admin: dict = Depends(require_admin)):
    org_id = admin.get("org_id")
    
    updates = {k: v for k, v in body.dict().items() if v is not None}
    updates["updated_at"] = datetime.utcnow()
    
    await orgs_collection.update_one(
        {"org_id": org_id},
        {"$set": updates},
        upsert=True
    )
    return {"message": "Settings updated successfully"}
