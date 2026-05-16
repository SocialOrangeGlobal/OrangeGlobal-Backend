# 🎓 Orange Global - Enterprise Backend API

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<p align="center">
  <b>A robust, enterprise-grade backend infrastructure built with NestJS, Prisma ORM, PostgreSQL, and Supabase Storage for the Orange Global platform.</b>
</p>

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
# Application Port
PORT=3000

# Prisma Database Connection URL (PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres?schema=public"

# JWT Authentication Secrets
JWT_SECRET="your_super_secret_access_jwt_key_here"
JWT_REFRESH_SECRET="your_super_secret_refresh_jwt_key_here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Supabase Storage Buckets
SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key_here"

# SMTP Mailer Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Orange Global <noreply@orangeglobal.com>"
FRONTEND_URL="http://localhost:5173"
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

When running the server locally, you can access the full interactive Swagger OpenAPI documentation at:
```text
http://localhost:3000/api
```
*(Includes interactive endpoints for Authentication, Users CRUD, Profile Uploads, and Maintenance).*

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
