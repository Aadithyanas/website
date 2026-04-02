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
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    permissions: List[str] = []
    role: Optional[str] = "member"


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
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    permissions: List[str] = []
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
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    permissions: Optional[List[str]] = None

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
    project_id: Optional[str] = None
    project_name: Optional[str] = None


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
    project_id: Optional[str] = None
    project_name: Optional[str] = None


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


# ─── CRM (Clients) ───────────────────────────────────────────────────────────

class ClientCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None


class ClientOut(BaseModel):
    id: str
    org_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ─── Finance (Invoices) ───────────────────────────────────────────────────────

class InvoiceItem(BaseModel):
    description: str
    quantity: float
    price: float
    total: float

class InvoiceCreate(BaseModel):
    client_id: str
    invoice_number: str
    items: List[InvoiceItem]
    subtotal: float
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    total: float
    status: str = "draft"  # draft, sent, paid, overdue
    due_date: Optional[str] = None

class InvoiceOut(BaseModel):
    id: str
    org_id: str
    client_id: str
    client_name: str
    invoice_number: str
    items: List[InvoiceItem]
    subtotal: float
    tax_rate: float
    tax_amount: float
    total: float
    status: str
    due_date: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ─── Expenses ─────────────────────────────────────────────────────────────────

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    date: str
    description: Optional[str] = None
    status: str = "pending"  # pending, approved, rejected
    bill_image: Optional[str] = None

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    bill_image: Optional[str] = None

class ExpenseOut(BaseModel):
    id: str
    org_id: str
    title: str
    amount: float
    category: str
    date: str
    description: Optional[str] = None
    status: str
    bill_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ─── Projects ─────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    client_name: Optional[str] = None
    team: str
    deadline: Optional[str] = None
    status: str = "active" # active, completed, on_hold

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    client_name: Optional[str] = None
    team: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None

class ProjectOut(BaseModel):
    id: str
    org_id: str
    name: str
    client_name: Optional[str] = None
    team: str
    deadline: Optional[str] = None
    status: str
    progress: int = 0
    task_stats: Optional[dict] = {"total": 0, "completed": 0}
    created_at: datetime
    updated_at: datetime


# --- Chat Models ---

class ReplyInfo(BaseModel):
    id: str
    content: str
    sender_name: str

class ChatMessageCreate(BaseModel):
    recipient_id: str  # Can be a user_id or group_id
    content: str
    is_group: bool = False
    attachments: Optional[List[str]] = []
    reply_to_id: Optional[str] = None
    is_forwarded: Optional[bool] = False

class ChatMessageOut(BaseModel):
    id: str
    sender_id: str
    sender_name: str
    sender_avatar: Optional[str] = None
    recipient_id: str
    content: str
    is_group: bool
    status: str = "sent"
    attachments: List[str]
    created_at: str
    reply_to: Optional[ReplyInfo] = None
    is_forwarded: Optional[bool] = False

class ChatGroupCreate(BaseModel):
    name: str
    members: List[str]
    description: Optional[str] = None

class ChatGroupOut(BaseModel):
    id: str
    name: str
    members: List[str]
    description: Optional[str] = None
    created_at: str
    created_by: str
    admin_id: str

class GroupAdminTransfer(BaseModel):
    new_admin_id: str

class ChatGroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class GroupAddMembers(BaseModel):
    new_members: List[str]

class ChatMessageStatusUpdate(BaseModel):
    message_ids: Optional[List[str]] = None
    conversation_id: Optional[str] = None
    status: str = "seen"
