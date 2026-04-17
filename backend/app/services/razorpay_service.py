import razorpay
import os
from dotenv import load_dotenv

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def create_razorpay_order(amount_in_rupees: int, currency: str = "INR"):
    """
    Creates a Razorpay order. Amount should be in rupees (converted to paise inside).
    """
    data = {
        "amount": amount_in_rupees * 100, # convert to paise
        "currency": currency,
        "payment_capture": 1 # Auto capture
    }
    order = client.order.create(data=data)
    return order

def verify_razorpay_payment(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str):
    """
    Verifies the payment signature.
    """
    params_dict = {
        'razorpay_order_id': razorpay_order_id,
        'razorpay_payment_id': razorpay_payment_id,
        'razorpay_signature': razorpay_signature
    }
    try:
        client.utility.verify_payment_signature(params_dict)
        return True
    except Exception:
        return False
