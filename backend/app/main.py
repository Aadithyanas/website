from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from app.api.routes import contact
from app.api.routes import erp_auth, erp_members, erp_tasks, erp_attendance, erp_notifications, erp_settings, erp_salary, erp_payroll, erp_ws
from app.core.database import create_indexes

app = FastAPI(title="Portfolio + ERP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing routes
app.include_router(contact.router)

# ERP routes
app.include_router(erp_auth.router)
app.include_router(erp_members.router)
app.include_router(erp_tasks.router)
app.include_router(erp_attendance.router)
app.include_router(erp_notifications.router)
app.include_router(erp_settings.router)
app.include_router(erp_salary.router)
app.include_router(erp_payroll.router)
app.include_router(erp_ws.router)


@app.on_event("startup")
async def on_startup():
    await create_indexes()