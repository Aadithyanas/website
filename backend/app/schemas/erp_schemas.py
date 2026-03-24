from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ─── Auth ───────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str



# ─── Member / User ───────────────────────────────────────────────────────────

class InviteMemberRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    position: Optional[str] = None


class RegisterRequest(BaseModel):
    token: str
    password: str
    name: Optional[str] = None  # override if desired


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    position: Optional[str] = None
    role: str  # "admin" | "member"
    avatar: Optional[str] = None
    created_at: datetime


# ─── Comment ─────────────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    content: str


class CommentOut(BaseModel):
    id: str
    author_id: str
    author_name: str
    author_avatar: Optional[str] = None
    content: str
    created_at: datetime


# ─── Task ────────────────────────────────────────────────────────────────────

TASK_STATUSES = ["pending", "ongoing", "testing", "previewing", "completed"]


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class TaskOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    assigned_to: str        # user id
    assigned_to_name: str
    assigned_to_avatar: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    comments: List[CommentOut] = []


# ─── Attendance / Leave ───────────────────────────────────────────────────────

class LeaveRequestCreate(BaseModel):
    date: str   # ISO date string "2024-03-25"
    description: str


class LeaveRequestUpdate(BaseModel):
    status: str  # "approved" | "rejected"


class LeaveRequestOut(BaseModel):
    id: str
    member_id: str
    member_name: str
    member_avatar: Optional[str] = None
    date: str
    description: str
    status: str  # "pending" | "approved" | "rejected"
    created_at: datetime


# ─── Notifications ───────────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: str
    user_id: str
    message: str
    task_id: Optional[str] = None
    read: bool = False
    created_at: datetime
