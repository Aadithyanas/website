from fastapi import APIRouter, HTTPException, Depends, status
from app.core.database import projects_collection, tasks_collection, users_collection
from app.core.dependencies import get_current_user
from app.schemas.erp_schemas import ProjectCreate, ProjectUpdate, ProjectOut
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter(prefix="/api/erp/projects", tags=["ERP Projects"])

def serialize_project(proj: dict) -> dict:
    return {
        "id": str(proj["_id"]),
        "org_id": str(proj["org_id"]),
        "name": proj["name"],
        "client_name": proj.get("client_name"),
        "team": proj.get("team"),
        "deadline": proj.get("deadline"),
        "status": proj.get("status", "active"),
        "created_at": proj.get("created_at"),
        "updated_at": proj.get("updated_at"),
        "progress": proj.get("progress", 0)
    }

async def get_project_with_stats(proj: dict) -> dict:
    p_id = str(proj["_id"])
    org_id = proj["org_id"]
    
    # Calculate stats from tasks_collection
    total_tasks = await tasks_collection.count_documents({"project_id": p_id, "org_id": org_id})
    completed_tasks = await tasks_collection.count_documents({"project_id": p_id, "org_id": org_id, "status": "completed"})
    
    progress = 0
    if total_tasks > 0:
        progress = int((completed_tasks / total_tasks) * 100)
    
    data = serialize_project(proj)
    data["progress"] = progress
    data["task_stats"] = {"total": total_tasks, "completed": completed_tasks}
    return data

@router.get("/", response_model=List[ProjectOut])
async def list_projects(current_user: dict = Depends(get_current_user)):
    org_id = current_user.get("org_id")
    role = current_user.get("role")
    user_teams = current_user.get("teams") or []
    
    query = {"org_id": org_id}
    
    # Scoping: Admin sees all. Members/Leaders only see their team projects.
    if role != "admin":
        query["team"] = {"$in": user_teams}
    
    cursor = projects_collection.find(query).sort("created_at", -1)
    projects = []
    async for proj in cursor:
        projects.append(await get_project_with_stats(proj))
    return projects

@router.post("/", response_model=ProjectOut)
async def create_project(body: ProjectCreate, current_user: dict = Depends(get_current_user)):
    # Permission: ONLY Team Leaders can create projects (as per request)
    is_leader = current_user.get("team_role") == "Team Leader"
    if not is_leader:
        raise HTTPException(status_code=403, detail="Only Team Leaders are authorized to create projects.")
    
    # Ensure the leader belongs to the specified team
    if body.team not in (current_user.get("teams") or []):
        raise HTTPException(status_code=403, detail="You can only create projects for teams you lead.")
        
    now = datetime.utcnow()
    project_doc = {
        "org_id": current_user.get("org_id"),
        "name": body.name,
        "client_name": body.client_name,
        "team": body.team,
        "deadline": body.deadline,
        "status": body.status,
        "created_at": now,
        "updated_at": now
    }
    
    result = await projects_collection.insert_one(project_doc)
    project_doc["_id"] = result.inserted_id
    return await get_project_with_stats(project_doc)

@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    proj = await projects_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check team access for non-admins
    if current_user.get("role") != "admin" and proj.get("team") not in (current_user.get("teams") or []):
        raise HTTPException(status_code=403, detail="Not authorized to view this project.")
        
    return await get_project_with_stats(proj)

@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(project_id: str, body: ProjectUpdate, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    proj = await projects_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Permission: ONLY Team Leader of THAT team can edit (Admins are View Only as per plan)
    is_leader = current_user.get("team_role") == "Team Leader" and proj.get("team") in (current_user.get("teams") or [])
    if not is_leader:
        raise HTTPException(status_code=403, detail="Only the Team Leader for this project's team can edit it.")
        
    updates = body.dict(exclude_unset=True)
    updates["updated_at"] = datetime.utcnow()
    
    await projects_collection.update_one({"_id": oid}, {"$set": updates})
    updated_proj = await projects_collection.find_one({"_id": oid})
    return await get_project_with_stats(updated_proj)

@router.delete("/{project_id}")
async def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID")
        
    proj = await projects_collection.find_one({"_id": oid, "org_id": current_user.get("org_id")})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Permission: ONLY Team Leader
    is_leader = current_user.get("team_role") == "Team Leader" and proj.get("team") in (current_user.get("teams") or [])
    if not is_leader:
        raise HTTPException(status_code=403, detail="Only the Team Leader can delete this project.")
        
    await projects_collection.delete_one({"_id": oid})
    # Also clear project reference from tasks? We'll keep them but they'll have dangling project_id
    await tasks_collection.update_many({"project_id": project_id}, {"$unset": {"project_id": "", "project_name": ""}})
    
    return {"message": "Project deleted successfully"}
