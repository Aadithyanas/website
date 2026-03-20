from fastapi import APIRouter
from app.schemas.contact_schema import ContactForm
from app.services.email_service import send_email

router = APIRouter()

@router.post("/contact")
async def contact(form: ContactForm):
    await send_email(form.name, form.email, form.message)
    return {"status": "success"}