# ERP System & Portfolio Platform

A high-fidelity, monorepo-based Enterprise Resource Planning (ERP) system and premium Portfolio platform. This project integrates a robust Python backend with modern React/Next.js frontends to provide a complete business management solution.

---

## 🚀 Project Overview

This platform is designed to streamline business operations and internal team management. It features a specialized ERP dashboard and a visually stunning client-facing portfolio.

### Key Components
- **`backend/`**: High-performance FastAPI backend handling business logic, authentication, and inter-service communication.
- **`erp/`**: Advanced dashboard for internal team management, project tracking, and financial operations.
- **`client/`**: Premium, animated portfolio and client-facing interface.

---

## 🛠️ Tech Stack

### Backend (The Engine)
*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+)
*   **Database:** [MongoDB](https://www.mongodb.com/) (Asynchronous integration via [Motor](https://motor.readthedocs.io/))
*   **Caching & Pub/Sub:** [Redis](https://redis.io/) (Used for caching, session management, and WebSocket messaging)
*   **Authentication:** 
    *   Custom JWT implementation
    *   Google OAuth2 Integration
*   **Payments:** [Razorpay](https://razorpay.com/)
*   **Communications:** 
    *   SMTP Service for automated emails (Invites, Password resets)
    *   WebSockets for real-time internal chat
*   **Security:** Rate limiting ([SlowAPI](https://github.com/laurentS/slowapi)), Request Protection Middleware, CORS management.
*   **Utilities:** Pydantic validation, ReportLab for PDF generation, Jinja2 for email templating.

### Frontend (The Interface)
*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
*   **3D & Visual Excellence:**
    *   [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
    *   [Spline](https://spline.design/) integration for high-end 3D assets
    *   [tsparticles](https://particles.js.org/) for dynamic backgrounds
*   **Motion & Interactions:**
    *   [Framer Motion](https://www.framer.com/motion/) for declarative animations
    *   [GSAP](https://greensock.com/gsap/) for high-performance scroll and timeline effects
    *   [Anime.js](https://animejs.com/) for micro-interactions
*   **Data Visualization:** [Recharts](https://recharts.org/) for financial and attendance analytics.
*   **UI Components:** Radix UI primitives, Lucide React icons.

---

## 🏗️ System Architecture & Flows

The system follows a strict permission-based architecture to ensure security and privacy.

### 1. Admin Capabilities
The primary admin (`adithyanas2694@gmail.com`) manages the entire workspace:
*   **Member Management:** Invite team members via secure, tokenized SMTP links.
*   **Operations:** Track attendance, manage project timelines, and calculate salaries.
*   **Financial Oversight:** Generate invoices, track expenses, and manage payroll.

### 2. Team Member Experience
*   **Authentication:** Access via standard login or Google OAuth (restricted to invited members only).
*   **Dashboard:** Personal view of assigned tasks, project progress, and attendance logs.
*   **Communication:** Real-time internal chat powered by WebSockets and Redis.

---

## 📁 Repository Structure

```text
.
├── backend/            # Python FastAPI backend core
│   ├── app/           # Main application logic
│   │   ├── api/       # API Routes (Auth, ERP modules, etc.)
│   │   ├── core/      # Config, Database, Redis, Middleware
│   │   └── services/  # Business logic implementations
│   └── requirements.txt
├── client/             # Next.js Portofalio/Marketing site
└── erp/                # Next.js ERP Dashboard
```

---

## 🔧 Getting Started

### Backend Setup
1.  Navigate to `backend/`
2.  Install dependencies: `pip install -r requirements.txt`
3.  Configure `.env` with MongoDB, Redis, Razorpay, and SMTP credentials.
4.  Run the server: `python run.py` (or `uvicorn app.main:app --reload`)

### Frontend Setup (Client or ERP)
1.  Navigate to either `client/` or `erp/`
2.  Install dependencies: `npm install`
3.  Configure `.env.local` with Backend API URLs.
4.  Launch development server: `npm run dev`

---

## 📈 Next Steps & Future Enhancements
- [ ] Mobile application integration.
- [ ] Enhanced AI-driven project analytics.
- [ ] Multi-tenant support for different organizations.

---

**Developed with ❤️ by Aadithyanas**
