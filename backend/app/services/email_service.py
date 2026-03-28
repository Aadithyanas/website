import aiosmtplib
import os
from email.message import EmailMessage
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

try:
    from app.core.config import EMAIL_ADDRESS, EMAIL_PASSWORD
except ImportError:
    EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

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


async def send_invite_email(to_email: str, name: str, invite_token: str):
    register_url = f"{FRONTEND_URL}/erp/register?token={invite_token}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "You're invited to join the Team ERP"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 40px;">
        <div style="max-width: 500px; margin: auto; background: #111; border-radius: 12px; padding: 32px; border: 1px solid #222;">
          <h2 style="color: #a78bfa;">You've been invited! 🎉</h2>
          <p>Hi <strong>{name}</strong>,</p>
          <p>You have been invited to join the <strong>Team ERP</strong> platform. Click the button below to set up your account.</p>
          <a href="{register_url}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
            Accept Invitation &rarr;
          </a>
          <p style="margin-top:24px;color:#888;font-size:12px;">This link expires in 48 hours. If you did not expect this email, you can safely ignore it.</p>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=EMAIL_ADDRESS,
        password=EMAIL_PASSWORD,
    )

async def send_leave_notification_email(to_email: str, member_name: str, date: str, description: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"New Leave Request: {member_name}"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 40px;">
        <div style="max-width: 500px; margin: auto; background: #111; border-radius: 12px; padding: 32px; border: 1px solid #222;">
          <h2 style="color: #a78bfa;">New Leave Request 📅</h2>
          <p><strong>{member_name}</strong> has submitted a new leave request.</p>
          <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px;"><strong>Date:</strong> {date}</p>
            <p style="margin: 0;"><strong>Reason:</strong> {description}</p>
          </div>
          <p style="margin-top:24px;color:#888;font-size:12px;">Please log in to the ERP dashboard to approve or reject this request.</p>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=EMAIL_ADDRESS,
        password=EMAIL_PASSWORD,
    )

async def send_reset_password_email(to_email: str, reset_token: str):
    reset_url = f"{FRONTEND_URL}/erp/reset-password?token={reset_token}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Password Reset Request - Team ERP"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 40px;">
        <div style="max-width: 500px; margin: auto; background: #111; border-radius: 12px; padding: 32px; border: 1px solid #222;">
          <h2 style="color: #a78bfa;">Password Reset Request</h2>
          <p>We received a request to reset your password for the <strong>Team ERP</strong> platform.</p>
          <p>Click the button below to choose a new password:</p>
          <a href="{reset_url}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
            Reset Password &rarr;
          </a>
          <p style="margin-top:24px;color:#888;font-size:12px;">This link expires in 30 minutes. If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=EMAIL_ADDRESS,
        password=EMAIL_PASSWORD,
    )

async def send_comment_notification_email(to_email: str, sender_name: str, task_title: str, content: str, is_mention: bool = False):
    msg = MIMEMultipart("alternative")
    subject = f"You were mentioned in: {task_title}" if is_mention else f"New comment on: {task_title}"
    msg["Subject"] = subject
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    title_text = "You were mentioned! 💬" if is_mention else "New Comment 💬"
    lead_text = f"<strong>{sender_name}</strong> mentioned you in a comment:" if is_mention else f"<strong>{sender_name}</strong> commented on your task:"

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 40px;">
        <div style="max-width: 500px; margin: auto; background: #111; border-radius: 12px; padding: 32px; border: 1px solid #222;">
          <h2 style="color: #a78bfa;">{title_text}</h2>
          <p>{lead_text}</p>
          <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
            <p style="margin: 0; color: #ccc; font-style: italic;">"{content}"</p>
          </div>
          <p style="font-size: 13px; color: #666;">Task: <strong>{task_title}</strong></p>
          <p style="margin-top:24px;color:#888;font-size:12px;">Log in to the ERP to view the full discussion.</p>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=EMAIL_ADDRESS,
        password=EMAIL_PASSWORD,
    )