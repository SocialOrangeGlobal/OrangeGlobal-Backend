# 🎓 Orange Global - Enterprise Backend API

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<p align="center">
  <b>A robust, enterprise-grade backend infrastructure built with NestJS, Prisma ORM, PostgreSQL, and Supabase Storage for the Orange Global platform.</b>
</p>

---

## 🚀 Key Features & Recent Updates

- **Orange AI Chatbot (Gemini Integration)**: A highly optimized, 5-layer AI chatbot powered by `gemini-2.0-flash-lite`. Features zero-cost regex intent classification, dynamic context builders (intent-scoped DB lookups), smart caching for jobs (Job Cache) and general queries (Response Cache), session persistence, and instant rule engine fallbacks. Fully configurable using `FRONTEND_URL` and `ADMIN_URL` environment origins.
- **ATS / Resume Parsing**: AI-driven resume parsing (PDF/DOCX) using Google Gemini. Automatically extracts skills, matches profiles to job postings, and calculates an ATS Match Score.
- **Dynamic Dashboard Analytics**: Centralized `GET /api/v1/dashboard/stats` endpoint providing real-time metrics on users, active jobs, and application status distributions.
- **Applications Module**: Comprehensive lifecycle tracking for candidate applications (`APPLIED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `OFFER_SENT`, `OFFER_ACCEPTED`, `REJECTED`, `WITHDRAWN`).
- **Interview Scheduling**: Integrated endpoints to handle interview dates, links, modes (Video/In-Person), and recruiter notes.
- **Admin Global View**: Specialized `GET /api/v1/applications` endpoint allowing administrators to query paginated applications globally across all job postings.
- **Authentication**: JWT-based authentication and Role-Based Access Control (RBAC) ensuring separation between `ADMIN` and `TALENT` roles.
- **File Management**: S3-compatible cloud storage handlers for candidate resumes and portfolio documents.

---

## 🏗️ Architecture & Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (v10.x) - Modular, robust server-side architecture.
- **Database ORM**: [Prisma](https://www.prisma.io/) - Type-safe database client and migration management.
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via Supabase) - Relational data persistence.
- **File Storage**: [Supabase Storage](https://supabase.com/storage) - Secure buckets for talent resumes, profile pictures, and company logos.
- **Authentication**: JWT (JSON Web Tokens) with refresh token rotation and role-based access control (RBAC).
- **Mailing**: SMTP integration via Nodemailer for automated verification and reset notifications.

---

## 📁 Codebase Structure

```text
orange-global-backend/
├── prisma/
│   ├── schema.prisma         # Prisma schema definition & relational models
│   └── migrations/           # Database migration history
├── src/
│   ├── auth/                 # JWT Authentication, Guards, Strategies & Signup/Signin flows
│   ├── users/                # Talent & Employer Profile Management & Resume Intelligence
│   ├── jobs/                 # Job creation, listing, application & matching modules
│   ├── contact/              # Contact form handling and administration
│   ├── mail/                 # SMTP Mailer Module for Verification & Password Reset
│   ├── maintenance/          # Development/Staging System Reset & Storage Cleanup Endpoints
│   ├── common/               # Global Interceptors (TransformInterceptor), Filters & Decorators
│   ├── prisma/               # PrismaService Singleton Module
│   ├── app.module.ts         # Root Application Module
│   └── main.ts               # Application Bootstrap & Swagger OpenAPI Setup
├── .env.example              # Template for environment variables
└── .gitignore                # Industry-standard Git ignore configuration
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory based on `.env.example`. Ensure the following variables are correctly configured:

```env
# ─── App ──────────────────────────────────────────
NODE_ENV=development
PORT=3001

# ─── Frontend Origin (CORS) ───────────────────────
FRONTEND_URL=http://localhost:5173

# ─── Admin Origin (CORS) ───────────────────────
ADMIN_URL=http://localhost:5174

# ─── Prisma / Supabase ────────────────────────────
# Official Supabase + Prisma connection format
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# ─── JWT ──────────────────────────────────────────
JWT_ACCESS_SECRET="replace_with_a_very_long_random_secret_at_least_64_chars"
JWT_REFRESH_SECRET="replace_with_another_very_long_random_secret_at_least_64_chars"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# ─── Gmail SMTP / HTTPS API ───────────────────────
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="yourgmail@gmail.com"
SMTP_PASS="your_gmail_app_password"
MAIL_FROM="Orange Global <yourgmail@gmail.com>"
MAIL_LOG_ONLY=false
RESEND_API_KEY="re_your_api_key_here"

# ─── Supabase Storage ─────────────────────────────
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="replace_with_your_supabase_service_role_key_here"

# ─── Google Gemini AI ────────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/SocialOrangeGlobal/OrangeGlobal-Backend.git
cd orange-global-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migrations & Prisma Generation
Ensure your database is running and up to date with the latest schema:
```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Run the Development Server
```bash
# Watch mode (recommended for development)
npm run start:dev

# Standard mode
npm run start

# Production build mode
npm run build
npm run start:prod
```

---

## 📚 API Documentation (Swagger OpenAPI)

You can access the full interactive Swagger OpenAPI documentation live in production at:
```text
https://orangeglobal-backend.onrender.com/api/docs
```
*(Includes interactive endpoints and comprehensive schema documentation for Authentication, Jobs, Applications, Dashboard, Users CRUD, and Maintenance).*

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# End-to-end (e2e) tests
npm run test:e2e
```

---

## 🛠️ Maintenance & System Reset

For development and staging environments, the backend provides an automated reset utility to purge all database tables and empty all Supabase storage buckets (`resumes`, `profile-pictures`, `logos`):

- **Endpoint**: `DELETE /maintenance/reset`
- *(Requires valid Supabase service role credentials in `.env`).*

---

## 🔒 Security & Best Practices

- **CORS**: Enabled for specific frontend origins.
- **Standardized Responses**: Handled globally via `TransformInterceptor` wrapping payloads in `{ success, statusCode, message, data }`.
- **Validation**: Enforced via `ValidationPipe` with `whitelist: true` to strip unpermitted DTO properties.

---
**Orange Global Platform © 2026. All Rights Reserved.**
