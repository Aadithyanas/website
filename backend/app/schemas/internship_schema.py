from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class InternshipCreate(BaseModel):
    name: str
    email: EmailStr
    educationLevel: str
    institutionName: str
    course: str
    stream: str
    currentYear: Optional[str] = None
    phone: str
    whatsapp: str
    internshipTrack: str
    internshipPeriod: str
    whyInternship: str
    startDate: str
    endDate: str
    source: str
    amount: float
    status: str = "pending" # pending, paid

class InternshipOut(InternshipCreate):
    id: str
    registration_id: str
    payment_id: Optional[str] = None
    order_id: Optional[str] = None
    created_at: datetime

class RazorpayOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str

class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    internship_data: InternshipCreate
