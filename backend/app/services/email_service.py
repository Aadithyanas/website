import aiosmtplib
from email.message import EmailMessage
from app.core.config import EMAIL_ADDRESS, EMAIL_PASSWORD

async def send_email(name: str, email: str, message: str):
    print("🚀 send_email function called")

    print("📧 EMAIL_ADDRESS:", EMAIL_ADDRESS)
    print("🔑 EMAIL_PASSWORD:", "SET" if EMAIL_PASSWORD else "NOT SET")

    try:
        msg = EmailMessage()
        print("✅ EmailMessage object created")

        msg["From"] = EMAIL_ADDRESS
        msg["To"] = EMAIL_ADDRESS
        msg["Subject"] = f"New Message from {name}"
        print("✅ Email headers set")

        msg.set_content(f"""
Name: {name}
Email: {email}

Message:
{message}
""")
        print("✅ Email content set")

        print("📡 Connecting to SMTP...")

        await aiosmtplib.send(
            msg,
            hostname="smtp.gmail.com",
            port=587,
            start_tls=True,
            username=EMAIL_ADDRESS,
            password=EMAIL_PASSWORD,
        )

        print("🎉 Email sent successfully!")

    except Exception as e:
        print("❌ EMAIL ERROR:", str(e))
        raise e