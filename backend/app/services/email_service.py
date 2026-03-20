import aiosmtplib
from email.message import EmailMessage
from app.core.config import EMAIL_ADDRESS, EMAIL_PASSWORD

async def send_email(name: str, email: str, message: str):
    msg = EmailMessage()
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = EMAIL_ADDRESS
    msg["Subject"] = f"New Message from {name}"

    msg.set_content(f"""
Name: {name}
Email: {email}

Message:
{message}
""")

    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=EMAIL_ADDRESS,
        password=EMAIL_PASSWORD,
    )