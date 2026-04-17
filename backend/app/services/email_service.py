import aiosmtplib
import os
from email.message import EmailMessage
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from email.mime.application import MIMEApplication
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

try:
    from app.core.config import EMAIL_ADDRESS, EMAIL_PASSWORD
except ImportError:
    EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
# Get absolute path to the static images folder within backend/app
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QR_CODE_PATH = os.path.join(BASE_DIR, "static", "images", "paymentqr.png")

async def send_internship_pending_email(to_email: str, student_name: str, registration_id: str, amount: float):
    msg = MIMEMultipart("related")
    msg["Subject"] = f"Action Required: Complete your Payment - {registration_id}"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 40px;">
        <div style="max-width: 500px; margin: auto; background: #111; border-radius: 12px; padding: 32px; border: 1px solid #222;">
          <h2 style="color: #a78bfa;">Application Submitted! 🚀</h2>
          <p>Hi <strong>{student_name}</strong>,</p>
          <p>Your internship application has been received, but your <strong>payment is currently pending</strong>.</p>
          
          <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #333;">
            <p style="margin: 0 0 8px;"><strong>Registration ID:</strong> {registration_id}</p>
            <p style="margin: 0 0 8px;"><strong>Amount to Pay:</strong> ₹{amount:,.2f}</p>
          </div>

          <h3 style="color: #facc15;">How to complete your registration:</h3>
          <ol style="color: #ccc; line-height: 1.6;">
            <li>Scan the QR code below to pay via GPay/PhonePe/Any UPI.</li>
            <li>Take a screenshot of the successful payment.</li>
            <li>Send the screenshot to our WhatsApp: <a href="https://wa.me/919895600610" style="color: #a78bfa; font-weight: bold;">9895600610</a> along with your Reg ID.</li>
          </ol>

          <div style="text-align: center; margin: 30px 0;">
            <img src="cid:paymentqr" alt="Payment QR Code" style="width: 250px; height: auto; border-radius: 12px; border: 4px solid #fff;" />
          </div>

          <p style="color: #888; font-size: 13px;">Once we verify your payment (usually within 24 hours), your registration will be fully completed and you will receive a confirmation email.</p>
        </div>
      </body>
    </html>
    """
    
    msg.attach(MIMEText(html, "html"))

    # Attach QR Code
    if os.path.exists(QR_CODE_PATH):
        try:
            with open(QR_CODE_PATH, 'rb') as f:
                img_data = f.read()
                image = MIMEImage(img_data)
                image.add_header('Content-ID', '<paymentqr>')
                image.add_header('Content-Disposition', 'inline', filename="paymentqr.png")
                msg.attach(image)
        except Exception as e:
            print(f"Error attaching QR code: {e}")

    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=EMAIL_ADDRESS,
        password=EMAIL_PASSWORD,
    )

async def send_internship_complete_email(to_email: str, student_name: str, registration_id: str, attachment: BytesIO = None):
    msg = MIMEMultipart("mixed")
    msg["Subject"] = f"Registration Confirmed! - {registration_id}"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    msg_alt = MIMEMultipart("alternative")
    msg.attach(msg_alt)

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 40px;">
        <div style="max-width: 500px; margin: auto; background: #111; border-radius: 12px; padding: 32px; border: 1px solid #222;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 50px;">🏆</div>
          </div>
          <h2 style="color: #10b981; text-align: center;">Registration Complete!</h2>
          <p>Hi <strong>{student_name}</strong>,</p>
          <p>We have successfully verified your payment for the internship program.</p>
          
          <div style="background: #064e3b; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #065f46; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #a7f3d0;">REGISTRATION ID</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #fff;">{registration_id}</p>
          </div>

          <p>Your seat is now officially reserved. You will receive further instructions regarding the onboarding process shortly.</p>
          
          <p style="margin-top:32px; border-top: 1px solid #222; pt: 20px; color:#888; font-size:12px; text-align: center;">
            Welcome to the team! If you have any questions, reply to this email.
          </p>
        </div>
      </body>
    </html>
    """

    msg_alt.attach(MIMEText(html, "html"))

    if attachment:
        try:
            attachment.seek(0)
            pdf_part = MIMEApplication(attachment.read(), _subtype="pdf")
            pdf_part.add_header('Content-Disposition', 'attachment', filename=f"Registration_Invoice_{registration_id}.pdf")
            msg.attach(pdf_part)
        except Exception as e:
            print(f"Error attaching PDF: {e}")

    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=EMAIL_ADDRESS,
        password=EMAIL_PASSWORD,
    )

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

async def send_salary_payslip_email(to_email: str, name: str, month_name: str, year: int, salary_data: dict, org_name: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Salary Payslip - {month_name} {year}"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 40px; color: #333;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; padding: 40px; border: 1px solid #eee; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; color: #7c3aed; font-size: 28px;">{org_name}</h1>
            <p style="color: #666; font-size: 14px; margin-top: 5px;">Salary Payslip for {month_name} {year}</p>
          </div>
          
          <div style="border-bottom: 2px solid #f4f4f4; padding-bottom: 20px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 16px;"><strong>Employee:</strong> {name}</p>
            <p style="margin: 5px 0 0; color: #888; font-size: 14px;"><strong>Email:</strong> {to_email}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #666;">Base Salary</td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold;">${salary_data.get('base_salary', 0):,.2f}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #666;">Leaves (Unpaid)</td>
              <td style="padding: 12px 0; text-align: right; color: #ef4444;">-{salary_data.get('unpaid_leaves', 0)} days</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 12px 0; color: #666;">Deductions</td>
              <td style="padding: 12px 0; text-align: right; color: #ef4444;">-${salary_data.get('deductions', 0):,.2f}</td>
            </tr>
            <tr style="background: #fdfbff;">
              <td style="padding: 20px 0; font-size: 18px; font-weight: 800; color: #7c3aed;">NET SALARY</td>
              <td style="padding: 20px 0; text-align: right; font-size: 22px; font-weight: 900; color: #7c3aed;">
                ${salary_data.get('net_salary', 0):,.2f}
              </td>
            </tr>
          </table>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; font-size: 13px; color: #666; line-height: 1.6;">
            <p style="margin: 0;"><strong>Payment Status:</strong> PAID</p>
            <p style="margin: 5px 0 0;">This is a computer-generated document and does not require a signature.</p>
          </div>
          
          <p style="margin-top: 30px; text-align: center; color: #aaa; font-size: 12px;">
            &copy; {year} {org_name}. All rights reserved.
          </p>
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

async def send_client_invoice_email(to_email: str, client_name: str, invoice_data: dict, org_name: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Invoice {invoice_data.get('invoice_number', 'EXT')} from {org_name}"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    items_html = ""
    for item in invoice_data.get('items', []):
        items_html += f"""
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 0; font-size: 14px;">{item.get('description')}</td>
          <td style="padding: 12px 0; text-align: center; font-size: 14px;">{item.get('quantity')}</td>
          <td style="padding: 12px 0; text-align: right; font-size: 14px;">${item.get('price', 0):,.2f}</td>
        </tr>
        """

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 40px; color: #333;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; padding: 40px; border: 1px solid #eee; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
            <div>
              <h1 style="margin: 0; color: #333; font-size: 24px;">INVOICE</h1>
              <p style="color: #666; font-size: 14px; margin-top: 5px;">#{invoice_data.get('invoice_number')}</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #7c3aed; font-size: 20px;">{org_name}</h2>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <p style="margin: 0; color: #888; text-transform: uppercase; font-size: 11px; font-weight: 800; letter-spacing: 1px;">Bill To:</p>
            <p style="margin: 5px 0 0; font-size: 16px; font-weight: bold;">{client_name}</p>
            <p style="margin: 5px 0 0; color: #666; font-size: 14px;">{to_email}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr style="border-bottom: 2px solid #f4f4f4;">
              <th style="padding: 12px 0; text-align: left; font-size: 13px; color: #888;">Description</th>
              <th style="padding: 12px 0; text-align: center; font-size: 13px; color: #888;">Qty</th>
              <th style="padding: 12px 0; text-align: right; font-size: 13px; color: #888;">Price</th>
            </tr>
            {items_html}
          </table>

          <div style="display: flex; justify-content: flex-end;">
            <table style="width: 200px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Subtotal</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 14px;">${invoice_data.get('subtotal', 0):,.2f}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Tax ({invoice_data.get('tax_rate', 0)}%)</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 14px;">${invoice_data.get('tax_amount', 0):,.2f}</td>
              </tr>
              <tr style="border-top: 2px solid #7c3aed;">
                <td style="padding: 15px 0; font-weight: bold; font-size: 16px; color: #7c3aed;">TOTAL</td>
                <td style="padding: 15px 0; text-align: right; font-weight: 900; font-size: 20px; color: #7c3aed;">
                    ${invoice_data.get('total', 0):,.2f}
                </td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="margin: 0; color: #888; font-size: 12px;"><strong>Due Date:</strong> {invoice_data.get('due_date') or 'Upon Receipt'}</p>
          </div>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(html, "html"))

async def send_internship_invoice_email(to_email: str, student_name: str, amount: float, registration_id: str, attachment: BytesIO = None):
    msg = MIMEMultipart("mixed")
    msg["Subject"] = f"Internship Registration Invoice - {student_name}"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = to_email

    msg_alt = MIMEMultipart("alternative")
    msg.attach(msg_alt)

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 40px;">
        <div style="max-width: 500px; margin: auto; background: #111; border-radius: 12px; padding: 32px; border: 1px solid #222;">
          <h2 style="color: #a78bfa;">Internship Registration Successful! 🎉</h2>
          <p>Hi <strong>{student_name}</strong>,</p>
          <p>Thank you for registering for our internship program. Your payment has been confirmed.</p>
          
          <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #333;">
            <p style="margin: 0 0 8px;"><strong>Registration ID:</strong> {registration_id}</p>
            <p style="margin: 0 0 8px;"><strong>Amount Paid:</strong> ₹{amount:,.2f}</p>
            <p style="margin: 0;"><strong>Status:</strong> <span style="color: #10b981;">PAID</span></p>
          </div>

          <p>Our team will review your application and contact you with further details soon.</p>
          
          <p style="margin-top:24px;color:#888;font-size:12px;">This is an automated invoice. If you have any questions, please contact our support team.</p>
        </div>
      </body>
    </html>
    """

    msg_alt.attach(MIMEText(html, "html"))

    if attachment:
        try:
            attachment.seek(0)
            pdf_part = MIMEApplication(attachment.read(), _subtype="pdf")
            pdf_part.add_header('Content-Disposition', 'attachment', filename=f"Invoice_{registration_id}.pdf")
            msg.attach(pdf_part)
        except Exception as e:
            print(f"Error attaching PDF: {e}")

    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        start_tls=True,
        username=EMAIL_ADDRESS,
        password=EMAIL_PASSWORD,
    )

