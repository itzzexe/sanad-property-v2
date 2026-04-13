# Sanad Property 

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)

**Sanad** (سَنَد) is a production-grade, full-stack ERP platform built for Arabic-first real estate management. It unifies property operations, tenant lifecycle management, and a complete double-entry accounting engine into a single, modern dashboard — with full Arabic/English bilingual support.

---

## 1. Project Overview

Sanad eliminates the fragmentation between property operations and finance by ensuring every operational event (lease signing, payment, maintenance) automatically generates the correct double-entry accounting records. The platform supports multi-currency operations, granular role-based permissions, and a complete audit trail.

**Core Value Propositions:**
- **Financial Integrity:** Full double-entry accounting with automated journal entries and approval workflows.
- **Operational Efficiency:** Automated lease installment engine, receipt generation, and bank reconciliation workspace.
- **Bilingual First:** Every screen, label, and notification ships in both Arabic (RTL) and English (LTR).
- **Audit-Ready:** Every create/update/delete action is logged with user attribution.

---

## 2. Features

### Authentication & Access Control
- Role-Based Access Control (RBAC): `ADMIN`, `ACCOUNTANT`, `OWNER`, `MAINTENANCE`
- Granular per-user permission overrides via a permissions modal
- JWT authentication with Passport.js
- Configurable session timeout and max login attempts

### Property & Asset Management
- Hierarchical structure: Properties → Units
- Real-time occupancy tracking and unit status (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`)
- Dynamic property attributes

### Tenant & Lease Lifecycle
- Full tenant profile management with contact details and balances
- Lease contracts with configurable payment frequency (Monthly, Quarterly, Annual)
- Automated installment schedule generation
- Contract cancellation and status tracking

### Payments & Receipts
- Payment recording against lease installments
- Receipt generation with printable HTML view (Blob URL, no `document.write`)
- Downloadable receipt as `.txt` file
- Overdue payment tracking

### Double-Entry Accounting
- **Chart of Accounts (COA):** Multi-level customizable account hierarchy
- **Journal Entries:** Manual creation with line-by-line debit/credit balancing
- **Journal Approval Workflow:** Entries requiring approval are routed to the Approvals queue
- **Fiscal Periods:** Opening and closing of fiscal years and periods
- **Bank Accounts & Reconciliation:** Full reconciliation workspace with auto-match and manual match

### Accounts Payable (AP)
- Vendor management (create, list, detail)
- Bill creation with line items, linked to vendors and GL accounts
- AP Aging report (Current, 1–30, 31–60, 61–90, 90+ days)

### Accounts Receivable (AR)
- Tenant balance tracking with per-tenant statement view
- AR Aging analysis

### Budgeting
- Budget creation linked to fiscal years and properties
- Interactive budget line editor (account, period, amount, notes)
- Save budget lines via API

### Taxation
- Configurable VAT/tax rates
- VAT Return report with date range picker, Output VAT, Input VAT, and Net VAT summary

### Financial Reports
- **Trial Balance** — Real-time debit/credit verification
- **Income Statement (P&L)** — Revenue vs. Expense with prior-period comparison
- **Balance Sheet** — Snapshot of Assets, Liabilities, Equity
- **General Reports** — PDF/Excel export via signed URL download
- **AP Aging** — Vendor overdue breakdown

### Approval Workflows
- Centralized queue for journal entries and account creation requests
- Approve/Reject with optional rejection note
- Reviewer attribution and audit trail

### Settings
- Company information (name, phone, email, tax ID, license number)
- Localization: interface language (AR/EN), default currency (USD, IQD, EUR, SAR), exchange rate, date format
- Financial settings: late fee %, grace days, fiscal year start, invoice prefix, auto-post toggles
- Notification settings: overdue reminders, lease expiry alerts, email notifications
- Security settings: 2FA toggle, session timeout, max login attempts

### UI/UX
- Dark mode with persistent theme toggle
- RTL/LTR layout switching per language
- Toast notifications (Sonner) replacing all `alert()` calls
- Skeleton shimmer loading states throughout
- Sticky reconciliation status bar with live balance difference indicator

---

## 3. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                     Browser / Client                    │
│              Next.js 14 (App Router, RSC)               │
└─────────────────────────┬──────────────────────────────┘
                          │ REST / JSON
┌─────────────────────────▼──────────────────────────────┐
│                    NestJS Backend                        │
│   Modules: Auth · Properties · Tenants · Leases         │
│   Finance · AP · AR · Budgets · Tax · Reports           │
│   Approvals · Settings · Audit Logs · Users             │
└──────────┬──────────────────────────┬───────────────────┘
           │ Prisma ORM               │ S3 Protocol
┌──────────▼──────────┐   ┌───────────▼──────────────────┐
│    PostgreSQL        │   │      MinIO / Cloud Storage    │
│  (Primary Database)  │   │   (Receipts, Exports, Assets) │
└─────────────────────┘   └──────────────────────────────┘
```

---

## 4. Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend Framework** | Next.js 14 (App Router), React 18 |
| **Styling** | Tailwind CSS v3, custom design tokens |
| **UI Components** | Radix UI primitives, custom component library |
| **Icons** | Lucide React |
| **Notifications** | Sonner (toast) |
| **Backend Framework** | NestJS (Node.js), TypeScript strict mode |
| **ORM** | Prisma v5+, PostgreSQL |
| **Validation** | Class Validator & Transformer (Backend), Zod (Frontend) |
| **Authentication** | Passport.js, JWT Strategy |
| **API Docs** | Swagger (auto-generated at `/docs`) |
| **DevOps** | Docker Compose, MinIO, Nginx reverse proxy |

---

## 5. Project Structure

```
/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/               # JWT, Passport, Guards
│   │   │   ├── users/              # User management, permissions
│   │   │   ├── properties/         # Properties & Units
│   │   │   ├── tenants/            # Tenant profiles
│   │   │   ├── leases/             # Contracts, installments
│   │   │   ├── payments/           # Payment recording, receipts
│   │   │   ├── finance/
│   │   │   │   ├── accounts/       # Chart of Accounts
│   │   │   │   ├── journal-entries/# Double-entry journals
│   │   │   │   ├── fiscal-periods/ # Fiscal year management
│   │   │   │   ├── bank-accounts/  # Bank account management
│   │   │   │   ├── reconciliation/ # Bank reconciliation
│   │   │   │   ├── ap/             # Accounts Payable, vendors, bills
│   │   │   │   ├── ar/             # Accounts Receivable
│   │   │   │   ├── budgets/        # Budget & budget lines
│   │   │   │   ├── tax/            # VAT rates, VAT return
│   │   │   │   └── reports/        # Trial balance, P&L, Balance Sheet
│   │   │   ├── approvals/          # Approval workflow engine
│   │   │   ├── audit-logs/         # Full action audit trail
│   │   │   └── settings/           # System-wide configuration
│   │   └── prisma/                 # PrismaService
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── dashboard/
│   │   │       ├── properties/     # Properties list & forms
│   │   │       ├── units/          # Units management
│   │   │       ├── tenants/        # Tenant list & profiles
│   │   │       ├── contracts/      # Lease contracts
│   │   │       ├── payments/       # Payments & installments
│   │   │       ├── receipts/       # Receipt viewer & printer
│   │   │       ├── finance/
│   │   │       │   ├── chart-of-accounts/
│   │   │       │   ├── journal-entries/
│   │   │       │   ├── fiscal-periods/
│   │   │       │   ├── reconciliation/[bankAccountId]/[statementId]/
│   │   │       │   ├── accounts-payable/  # AP, vendors, bills, aging
│   │   │       │   ├── accounts-receivable/
│   │   │       │   ├── budgets/           # Budget list & line editor
│   │   │       │   ├── tax/vat-return/
│   │   │       │   └── reports/           # Balance sheet, income statement, trial balance
│   │   │       ├── approvals/
│   │   │       ├── users/
│   │   │       ├── audit-logs/
│   │   │       └── settings/
│   │   ├── components/
│   │   │   └── ui/                 # Button, Card, Badge, Modal, Input, etc.
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── index.ts        # Base axios client
│   │   │   │   └── finance.ts      # Finance-specific API methods
│   │   │   └── utils.ts
│   │   └── context/
│   │       ├── language-context.tsx
│   │       ├── currency-context.tsx
│   │       └── theme-context.tsx
│   └── .env.local.example
│
├── nginx/                          # Nginx reverse proxy config
├── docker-compose.yml
└── run.bat                         # Windows unified launcher
```

---

## 6. Installation & Setup

### Prerequisites
- Node.js v18.x or higher
- PostgreSQL v14+
- Docker (optional, for MinIO)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/sanad-property.git
   cd sanad-property
   ```

2. **Backend setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npx prisma db push
   npx prisma db seed
   npm run start:dev
   ```

3. **Frontend setup:**
   ```bash
   cd ../frontend
   npm install
   cp .env.local.example .env.local
   # Edit .env.local with API URL
   npm run dev
   ```

4. **Or use the Windows launcher:**
   ```bash
   run.bat
   ```

---

## 7. Environment Variables

### Backend `.env`
```ini
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/sanad"
JWT_SECRET="your_ultra_secure_secret_min_32_chars"
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minio-root"
MINIO_SECRET_KEY="minio-password"
MINIO_BUCKET="sanad-uploads"
```

### Frontend `.env.local`
```ini
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

---

## 8. Default Credentials (Seed)

After running `npx prisma db seed`:

| Role | Email | Password |
|:---|:---|:---|
| Admin | `admin@sanad.com` | `Admin@123` |

---

## 9. API Documentation

Swagger UI is available at `http://localhost:4000/docs` when the backend is running.

### Example: Create Journal Entry
**`POST /api/journal-entries`**
```json
{
  "date": "2026-04-14",
  "description": "Office Rent Payment",
  "lines": [
    { "accountId": "uuid-rent-expense", "debit": 1500, "credit": 0 },
    { "accountId": "uuid-bank-account", "debit": 0,    "credit": 1500 }
  ]
}
```

### Example: VAT Return
**`GET /api/tax/vat-return?startDate=2026-01-01&endDate=2026-03-31`**

### Example: AP Aging
**`GET /api/ap/aging?asOfDate=2026-04-14`**

---

## 10. Database Management

```bash
# Apply schema changes (development)
npx prisma db push

# Generate Prisma client after schema changes
npx prisma generate

# Reset all data and re-seed (CAUTION: destructive)
npx prisma migrate reset

# Open Prisma Studio (visual DB browser)
npx prisma studio
```

---

## 11. Troubleshooting

| Issue | Cause | Fix |
|:---|:---|:---|
| `EADDRINUSE: 4000` | Port occupied | `taskkill /F /IM node.exe /T` or use `run.bat` |
| `Table 'User' not found` | Schema not synced | `npx prisma db push` in backend |
| `401 Unauthorized` | Expired/invalid token | Clear localStorage and re-login |
| `404 on /ap/vendors` | Route mismatch | Ensure controller uses `@Controller('ap/vendors')` |
| RTL layout broken | Missing `dir` attribute | Wrap pages with `dir={dir}` from `useLanguage()` |
| Toast not showing | Missing `<Toaster />` | Add `<Toaster />` to root layout |

---

## 12. Roadmap

- [x] Double-entry journal engine
- [x] Bank reconciliation workspace (auto-match + manual match)
- [x] Approval workflow for journals and accounts
- [x] AP/AR Aging reports
- [x] VAT Return report
- [x] Budget management with line editor
- [x] Full bilingual AR/EN support
- [x] Granular per-user permissions
- [ ] Mobile app for tenants (iOS/Android)
- [ ] OFX/CSV bank statement import
- [ ] WhatsApp integration for payment reminders
- [ ] AI-driven occupancy forecasting
- [ ] Multi-company/multi-branch support

---

## 13. License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

*Sanad Property Management System — Built with precision for the Arabic real estate market.*
