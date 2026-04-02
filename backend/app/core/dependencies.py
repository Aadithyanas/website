from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.core.database import users_collection

security = HTTPBearer()

ADMIN_EMAIL = "adithyanas2694@gmail.com"


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    email = payload.get("sub")
    org_id = payload.get("org_id")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    query = {"email": email}
    if org_id:
        query["org_id"] = str(org_id)

    user = await users_collection.find_one(query)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="System Administrative access required",
        )
    return current_user


def require_permission(permission: str):
    """
    Dependency to check if the current user has a specific permission or is an admin.
    """
    async def permission_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") == "admin":
            return current_user
        
        user_permissions = current_user.get("permissions") or []
        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: f{permission}",
            )
        return current_user
    
    return permission_checker

