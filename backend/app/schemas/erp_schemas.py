from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ─── Auth ───────────────────────────────────────────────────────────────────

class OrganizationSignupRequest(BaseModel):
    org_name: str
    admin_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    org_id: Optional[str] = None


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
    team: Optional[str] = None  # Deprecated
    teams: List[str] = []
    team_role: Optional[str] = None
    sprint: Optional[str] = None
    org_id: Optional[str] = None
    base_salary: Optional[float] = 0.0


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
    team: Optional[str] = None  # Deprecated
    teams: List[str] = []
    team_role: Optional[str] = None
    sprint: Optional[str] = None
    org_id: str
    org_name: Optional[str] = None
    avatar: Optional[str] = None
    base_salary: Optional[float] = 0.0
    created_at: datetime


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    teams: Optional[List[str]] = None
    team_role: Optional[str] = None
    sprint: Optional[str] = None
    role: Optional[str] = None  # "admin" | "member"
    base_salary: Optional[float] = None

# ─── Comment ─────────────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    content: str
    image: Optional[str] = None


class CommentOut(BaseModel):
    id: str
    author_id: str
    author_name: str
    author_avatar: Optional[str] = None
    content: str
    image: Optional[str] = None
    created_at: datetime


# ─── Task ────────────────────────────────────────────────────────────────────

TASK_STATUSES = ["todo", "inprogress", "qc", "reviewing", "completed"]


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"
    sprint: Optional[str] = None
    team: Optional[str] = None
    estimated_time: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[str] = None
    assigned_to: Optional[str] = None
    images: Optional[List[str]] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    sprint: Optional[str] = None
    team: Optional[str] = None
    estimated_time: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None


class TaskOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    sprint: Optional[str] = None
    team: Optional[str] = None
    estimated_time: Optional[str] = None
    assigned_to: str        # user id
    assigned_to_name: str
    assigned_to_avatar: Optional[str] = None
    priority: str
    due_date: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    comments: List[CommentOut] = []
    images: List[str] = []
    org_id: str


# ─── Attendance / Leave ───────────────────────────────────────────────────────

class LeaveRequestCreate(BaseModel):
    date: str   # ISO date string "2024-03-25"
    description: str
    leave_type: str = "casual" # "casual" | "medical"


class LeaveRequestUpdate(BaseModel):
    status: str  # "approved" | "rejected"


class LeaveRequestOut(BaseModel):
    id: str
    member_id: str
    member_name: str
    member_avatar: Optional[str] = None
    date: str
    description: str
    leave_type: str
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
    created_at: datetime


# ─── Organization Settings ────────────────────────────────────────────────────

class OrganizationSettings(BaseModel):
    positions: List[str] = ["Developer", "Designer", "Manager", "HR", "Tester"]
    teams: List[str] = ["IT", "Robotics", "Social Media", "Marketing"]
    sprints: List[str] = ["Backlog", "Q1-Sprint-1", "Q1-Sprint-2"]
    casual_leave_limit: int = 2
    medical_leave_limit: int = 1
    period_months: int = 2
    working_days: List[int] = [1, 2, 3, 4, 5] # 0=Sun, 1=Mon, ..., 6=Sat


class OrganizationSettingsUpdate(BaseModel):
    positions: Optional[List[str]] = None
    teams: Optional[List[str]] = None
    sprints: Optional[List[str]] = None
    casual_leave_limit: Optional[int] = None
    medical_leave_limit: Optional[int] = None
    period_months: Optional[int] = None
    working_days: Optional[List[int]] = None


# ─── Payroll ───────────────────────────────────────────────────────────────────

class PayrollStatusUpdate(BaseModel):
    status: str  # "paid" | "unpaid"

class PayrollRecordOut(BaseModel):
    id: str
    member_id: str
    member_name: str
    month: int
    year: int
    base_salary: float
    net_salary: float
    status: str
    updated_at: datetime
