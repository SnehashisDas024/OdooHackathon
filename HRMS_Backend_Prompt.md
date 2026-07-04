# HRMS Backend & Database Build Prompt
*(Paste this whole document into Cursor / Windsurf / your AI coding tool as the backend build spec. It is the counterpart to `HRMS_Frontend_Prompt.md` — every endpoint here exists because a specific frontend page/component needs it. Build this so the frontend can be wired up with zero guessing.)*

---

## 0. What you are building

Build the complete **backend** (`server/`) for the HRMS: a **Node.js + Express** REST API backed by **PostgreSQL via Prisma**, serving the React frontend described in the companion frontend prompt. Two roles exist — **Admin/HR Officer** and **Employee** — and almost every route enforces different read/write permissions per role, matching the frontend's view-only vs. editable states exactly.

This document covers, in order:
1. Tech stack recap
2. Database schema (Prisma models, exact fields)
3. Auth & security architecture (Login ID generation, JWT cookies, first-login password change)
4. Every API endpoint, grouped by module, with request/response shapes
5. File upload handling
6. Middleware pipeline
7. **Frontend ↔ Backend connection guide** — CORS, cookies, env vars, response conventions
8. Error handling & validation conventions
9. Testing
10. Deployment

---

## 1. Tech Stack (must match the frontend's expectations)

| Layer | Tech |
|---|---|
| Runtime | Node.js (LTS) + Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT — access token (~15min) + refresh token (~7 day), both in **httpOnly cookies** |
| Password hashing | bcrypt |
| Validation | Zod (mirrored on both request bodies and query params) |
| Rate limiting | express-rate-limit (in-memory store) |
| Email | Resend (temporary password / verification emails) |
| File uploads | Multer + Cloudinary (documents, resumes, certificates, profile pictures, company logo) |
| Logging | Pino |
| Security headers | Helmet |
| CORS | `cors` package, credentialed, whitelisted origin |
| Error handling | Custom error classes + centralized `errorHandler` middleware |
| Testing | Jest + Supertest |

No Redis, no Celery/background workers — rate limiting is in-memory and emails are sent inline, matching the frontend's expectation of immediate (not queued/async-polled) responses.

---

## 2. Database Schema (Prisma)

Build `prisma/schema.prisma` with the following models. Field names should match what the frontend forms expect exactly (see frontend prompt Section 3.4 Private Info / Bank Details / Salary Info tabs for the source of truth on field lists).

```prisma
enum Role {
  ADMIN
  EMPLOYEE
}

enum LeaveType {
  PAID
  SICK
  UNPAID
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  HALF_DAY
  LEAVE
}

model User {
  id                String    @id @default(cuid())
  loginId           String    @unique   // e.g. OIJODO20220001
  email             String    @unique
  phone             String?
  passwordHash      String
  role              Role      @default(EMPLOYEE)
  mustChangePassword Boolean  @default(true)   // true until first login password change
  isActive          Boolean   @default(true)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  employee          Employee?
}

model Employee {
  id                 String    @id @default(cuid())
  userId             String    @unique
  user               User      @relation(fields: [userId], references: [id])

  // Employee Info tab
  name               String
  profilePictureUrl  String?
  mobile             String?
  department         String?
  jobPosition        String?
  managerId          String?
  manager            Employee? @relation("ManagerReports", fields: [managerId], references: [id])
  reports            Employee[] @relation("ManagerReports")
  company            String?
  location           String?
  dateOfJoining      DateTime
  employeeCode       String    @unique  // human-facing short code, distinct from loginId

  // About
  aboutMe            String?
  whatILoveAboutJob  String?
  interestsHobbies   String?

  // Skills & Certifications
  resumeUrl          String?
  skills             Skill[]
  certifications     Certification[]

  // Private Info tab
  dateOfBirth        DateTime?
  residingAddress    String?
  personalEmail      String?
  gender             String?
  nationality        String?
  maritalStatus      String?
  panNo              String?
  uanNo              String?

  // Bank Details tab
  bankAccountNumber  String?
  bankName           String?
  ifscCode           String?

  attendanceRecords  Attendance[]
  leaveRequests      LeaveRequest[]
  payroll            Payroll?
  leaveBalance       LeaveBalance?

  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
}

model Skill {
  id          String    @id @default(cuid())
  employeeId  String
  employee    Employee  @relation(fields: [employeeId], references: [id])
  name        String
}

model Certification {
  id          String    @id @default(cuid())
  employeeId  String
  employee    Employee  @relation(fields: [employeeId], references: [id])
  name        String
  issuer      String?
  issuedDate  DateTime?
}

model Attendance {
  id          String            @id @default(cuid())
  employeeId  String
  employee    Employee          @relation(fields: [employeeId], references: [id])
  date        DateTime          @db.Date
  status      AttendanceStatus  @default(ABSENT)
  checkIn     DateTime?
  checkOut    DateTime?
  workHours   Float?            // computed on check-out
  extraHours  Float?
  breakMinutes Int?             @default(0)

  @@unique([employeeId, date])
}

model LeaveBalance {
  id          String   @id @default(cuid())
  employeeId  String   @unique
  employee    Employee @relation(fields: [employeeId], references: [id])
  paidTotal   Int      @default(24)
  paidUsed    Int      @default(0)
  sickTotal   Int      @default(7)
  sickUsed    Int      @default(0)
  unpaidUsed  Int      @default(0)
}

model LeaveRequest {
  id             String      @id @default(cuid())
  employeeId     String
  employee       Employee    @relation(fields: [employeeId], references: [id])
  type           LeaveType
  startDate      DateTime    @db.Date
  endDate        DateTime    @db.Date
  daysCount      Int         // auto-calculated on create
  remarks        String?
  attachmentUrl  String?     // mandatory if type = SICK, enforced in validator
  status         LeaveStatus @default(PENDING)
  adminComment   String?
  decidedById    String?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model Payroll {
  id                  String   @id @default(cuid())
  employeeId          String   @unique
  employee            Employee @relation(fields: [employeeId], references: [id])
  monthlyWage         Decimal  @db.Decimal(12, 2)
  basicSalary         Decimal  @db.Decimal(12, 2)
  hra                 Decimal  @db.Decimal(12, 2)
  standardAllowance   Decimal  @db.Decimal(12, 2)
  performanceBonus    Decimal  @db.Decimal(12, 2)
  lta                 Decimal  @db.Decimal(12, 2)
  fixedAllowance      Decimal  @db.Decimal(12, 2)
  pfContribution      Decimal  @db.Decimal(12, 2)
  professionalTax     Decimal  @db.Decimal(12, 2)
  netPayable          Decimal  @db.Decimal(12, 2)
  updatedAt           DateTime @updatedAt
}

model Company {
  id        String   @id @default(cuid())
  name      String
  logoUrl   String?
  updatedAt DateTime @updatedAt
}
```

Notes:
- `LeaveBalance` is a new model beyond what the frontend prompt names directly, but it's required to back the "Paid Time Off (24 days) / Sick Leave (7 days) / Unpaid" balance cards on the Leave page — create it on employee onboarding with the SRS defaults.
- `employeeCode` is distinct from `loginId`: `loginId` is the auth identifier (`OIJODO20220001`), `employeeCode` is whatever short internal code HR also wants to show on the profile (can default to the same value if the company doesn't need a separate one — keep both fields so the frontend's "Employee Code" field on the profile has something to bind to).

---

## 3. Auth & Security Architecture

### 3.1 Login ID generation (must exactly match SRS 3.1.1)
On employee creation, generate:
```
OI + [first 2 letters of first name, uppercase] + [first 2 letters of last name, uppercase] + [4-digit year of joining] + [4-digit zero-padded serial number]
```
Example: `OIJODO20220001`. The serial number increments per unique first+last-initial+year combination (query the max existing serial for that prefix, +1, zero-pad to 4 digits). Wrap this in a transaction with the user creation to avoid race conditions on the serial number.

### 3.2 Temporary password
Generate a random 10–12 character temporary password (mixed case + digit + symbol) on creation. Hash it with bcrypt before storing. Return the **plaintext** temp password **once**, only in the creation response body (never store or log the plaintext) — this is what the frontend's onboarding success screen displays in the copyable pill (frontend prompt Section 3.2). Also send it via Resend to the employee's email as a backup channel.

### 3.3 First-login forced password change
`User.mustChangePassword` starts `true`. The `/auth/sign-in` response includes `mustChangePassword: true/false`. Frontend gates the dashboard behind a change-password step when true (frontend prompt Section 3.1). A dedicated `/auth/change-password` endpoint accepts `{ currentPassword, newPassword }`, validates the new password against the same rules as onboarding, and flips `mustChangePassword` to `false` on success.

### 3.4 JWT & cookies
- Access token: 15 min expiry, payload `{ userId, role }`.
- Refresh token: 7 day expiry, stored as an httpOnly cookie, rotated on use.
- Both tokens set as httpOnly, `secure` (in production), `sameSite: 'lax'` cookies — **never** returned in the JSON body, so the frontend never needs to manually store or attach a token; the browser handles it via cookies on every request as long as `credentials: 'include'` / axios `withCredentials: true` is set (see Section 7).
- `/auth/refresh` endpoint issues a new access token cookie using a valid refresh cookie; call this from an axios response interceptor on 401.

### 3.5 Role guard
`roleMiddleware(['ADMIN'])` on any Admin-only route (employee onboarding, leave approval, payroll edit, employee list). Every route handler must also filter data by `req.user.role` even where the route is shared (e.g. `/leave/requests` returns only the caller's own requests for an Employee, but all requests for an Admin) — do not rely on the frontend to hide data it shouldn't have; the API must actually withhold it.

---

## 4. API Endpoints (grouped by frontend module)

Base path: `/api/v1`. All responses follow the envelope in Section 7.3.

### 4.1 Auth (`authRoutes.js`) — backs `authService.js`
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/sign-in` | Public | `{ loginIdOrEmail, password }` → sets cookies, returns `{ user, mustChangePassword }` |
| POST | `/auth/change-password` | Authenticated | `{ currentPassword, newPassword }` |
| POST | `/auth/forgot-password` | Public | `{ email }` → sends reset link via Resend |
| POST | `/auth/reset-password` | Public | `{ token, newPassword }` |
| POST | `/auth/refresh` | Public (needs refresh cookie) | Rotates access token |
| POST | `/auth/sign-out` | Authenticated | Clears cookies |
| GET | `/auth/me` | Authenticated | Returns current user + employee summary (used on app boot to hydrate `AuthContext`) |

### 4.2 Employees (`employeeRoutes.js`) — backs `employeeService.js`
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/employees` | Admin | Onboard new employee (frontend 3.2). Body: name, email, phone, password, confirmPassword, logo(optional company-level), department, jobPosition, dateOfJoining, managerId, company, location. Returns `{ employee, loginId, temporaryPassword }` |
| GET | `/employees` | Admin | List all employees for Employee List page (3.8) and Dashboard grid (3.3) — supports `?search=&department=&status=` query params |
| GET | `/employees/me` | Employee/Admin | Own full profile (all tabs) |
| GET | `/employees/:id` | Admin | Any employee's full profile, or **view-only** flag when requested from dashboard card click — return an extra `viewOnly: true` marker the frontend already handles via route, but also enforce no write endpoints succeed unless explicitly called from the edit-mode route |
| PATCH | `/employees/me` | Employee | Update only the fields Employees are allowed to edit: `mobile`, `residingAddress`, `personalEmail`, `profilePictureUrl`, `aboutMe`, `whatILoveAboutJob`, `interestsHobbies`, skills, certifications. Reject any other field with a 403 + clear message |
| PATCH | `/employees/:id` | Admin | Update any field on any employee, including job/company/salary-adjacent fields (salary itself goes through `/payroll/:id`) |
| POST | `/employees/:id/skills` | Owner or Admin | Add a skill |
| DELETE | `/employees/:id/skills/:skillId` | Owner or Admin | Remove a skill |
| POST | `/employees/:id/certifications` | Owner or Admin | Add a certification |
| DELETE | `/employees/:id/certifications/:certId` | Owner or Admin | Remove a certification |
| POST | `/employees/:id/documents/resume` | Owner or Admin | Upload resume (multipart) |
| POST | `/employees/:id/documents/profile-picture` | Owner or Admin | Upload/replace avatar (multipart) |

### 4.3 Attendance (`attendanceRoutes.js`) — backs `attendanceService.js`
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/attendance/check-in` | Employee | Creates/updates today's record, sets `status = PRESENT`, `checkIn = now` |
| POST | `/attendance/check-out` | Employee | Sets `checkOut = now`, computes `workHours`/`extraHours` |
| GET | `/attendance/me?month=&year=` | Employee | Day-wise grid for the ongoing month (frontend 3.5) |
| GET | `/attendance/today` | Admin | Real-time status of all employees today (frontend 3.5 admin view) — this is also what powers the Dashboard's `StatusDot` per employee and the "18 Present · 3 On Leave · 2 Absent" strip |
| GET | `/attendance/:employeeId?month=&year=` | Admin | Any employee's monthly attendance |

### 4.4 Leave / Time-Off (`leaveRoutes.js`) — backs `leaveService.js`
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/leave/balance` | Employee | Returns `{ paidTotal, paidUsed, sickTotal, sickUsed, unpaidUsed }` for the balance cards (frontend 3.6) |
| POST | `/leave` | Employee | Apply for leave. Body: `type, startDate, endDate, remarks, attachment(optional/multipart)`. Server computes `daysCount`, **rejects** if `type = SICK` and no attachment present (mirrors the frontend's required-attachment validation, but this is the real enforcement) |
| GET | `/leave/me` | Employee | Own leave requests list |
| GET | `/leave` | Admin | All requests, filterable by `?status=&employeeId=` for the Leave Approval Panel |
| PATCH | `/leave/:id/decision` | Admin | Body: `{ status: 'APPROVED'|'REJECTED', adminComment }`. On approve, decrements the right balance bucket; on reject, no balance change. Updates the employee's dashboard status dot to the airplane icon for the duration if approved and current-dated |

### 4.5 Payroll (`payrollRoutes.js`) — backs `payrollService.js`
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/payroll/me` | Employee | Read-only payslip breakdown (frontend 3.7) |
| GET | `/payroll/:employeeId` | Admin | Any employee's payroll, for the editable admin view |
| PUT | `/payroll/:employeeId` | Admin | Body: `{ monthlyWage }`. Server computes and stores every derived component using the exact SRS 3.6.2 formulas (Section 4.6 below) and returns the full breakdown so the frontend's "live calculation" can either compute client-side for instant feedback and then reconcile with this response, or call this endpoint debounced — recommend the frontend does the same math client-side for the live preview, then this endpoint is the source of truth on save |

### 4.6 Salary calculation formulas (implement exactly, both here and confirm they match any client-side preview math)
Given `monthlyWage` (M):
- `basicSalary = 0.50 * M`
- `hra = 0.50 * basicSalary` (= 0.25 * M)
- `standardAllowance = 4167` (fixed)
- `performanceBonus = 0.0833 * basicSalary`
- `lta = 0.08333 * basicSalary`
- `fixedAllowance = M - (basicSalary + hra + standardAllowance + performanceBonus + lta)`
- `pfContribution = 0.12 * basicSalary` (deduction)
- `professionalTax = 200` (fixed deduction)
- `netPayable = M - pfContribution - professionalTax`

Assert `basicSalary + hra + standardAllowance + performanceBonus + lta + fixedAllowance === M` (within rounding tolerance) before saving — this backs the frontend's "✓ Components balance to Monthly Wage" confirmation.

### 4.7 Company / Settings (`companyRoutes.js`)
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/company` | Authenticated | Name + logo for header branding |
| PATCH | `/company` | Admin | Update name/logo (multipart for logo) |

---

## 5. File Upload Handling

All uploads go through `Multer` (memory storage, 5MB limit) → `Cloudinary` upload stream → store only the returned secure URL on the relevant model field. Applies to: profile pictures, company logo, resumes, certification attachments (if files), and leave sick-leave medical certificates.

- Reject non-image files for profile picture/logo uploads (`image/png`, `image/jpeg`, `image/webp` only).
- Accept PDF/image for resume and medical certificate uploads.
- On any upload error (size, type), return a clear message the frontend can show inline — e.g. `"That file's over 5MB — try a smaller one"` — matching the frontend's plain-language error convention.

---

## 6. Middleware Pipeline (apply in this order)

1. `helmet()` — security headers
2. `cors(corsOptions)` — see Section 7.1
3. Body parsers (`express.json()`, `express.urlencoded()`) + `cookie-parser`
4. `pino-http` request logger
5. `express-rate-limit` — global light limit (e.g. 300 req/15min/IP) plus a stricter limit specifically on `/auth/sign-in` and `/auth/forgot-password` (e.g. 10 req/15min/IP) to prevent credential stuffing
6. Route-level: `authMiddleware` (verifies access token, attaches `req.user`) → `roleMiddleware([...])` where needed → `validateRequest(zodSchema)` → controller
7. `errorHandler` — last, catches everything, formats per Section 8

---

## 7. Frontend ↔ Backend Connection Guide

This is the section that makes sure the two halves actually talk to each other correctly.

### 7.1 CORS
```js
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN, // e.g. http://localhost:5173 in dev, the Firebase Hosting URL in prod
  credentials: true, // required so the browser sends/receives httpOnly cookies
};
app.use(cors(corsOptions));
```
The frontend's `services/api.js` axios instance must set `withCredentials: true` so cookies are actually attached to every request — without this, the JWT cookies set by `/auth/sign-in` will never be sent back on subsequent calls, and every "authenticated" call will silently 401. This is the single most common integration bug — call it out explicitly in both codebases with a comment.

### 7.2 Environment variables (keep `.env` in both `client/` and `server/` in sync on these)

**Server `.env`:**
```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLIENT_ORIGIN=http://localhost:5173
RESEND_API_KEY=...
CLOUDINARY_URL=...
COOKIE_DOMAIN=localhost
NODE_ENV=development
PORT=4000
```

**Client `.env`:**
```
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

`services/api.js` on the frontend should read `import.meta.env.VITE_API_BASE_URL` as its axios `baseURL` — never hardcode `localhost:4000` anywhere, so switching to the Cloud Run URL in production is a one-line env change.

### 7.3 Response envelope (every endpoint, success and error, must use this shape so the frontend can handle responses generically)
```json
// success
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable message for toasts"
}

// error
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "That Login ID or password doesn't match our records"
  }
}
```
The frontend's `api.js` axios interceptor should unwrap `data.data` on success and throw `data.error` on failure, so every `*Service.js` function can just `return (await api.get(...)).data` without repeating this logic per call. Error `message` strings should be written exactly as they'll be shown in the UI (the frontend prompt's plain-language error convention) — the backend owns the exact wording, not the frontend.

### 7.4 Matching endpoints to frontend service files
Confirm every function the frontend needs exists before considering the backend done:
- `authService.js` → all of Section 4.1
- `employeeService.js` → all of Section 4.2
- `attendanceService.js` → all of Section 4.3
- `leaveService.js` → all of Section 4.4
- `payrollService.js` → all of Section 4.5

If the frontend team (or you, building both sides) adds a new UI affordance that needs data the backend doesn't expose yet, add the endpoint here and to this table before wiring the component — don't let the frontend fetch/derive data client-side that should come from the server (e.g. leave day-count validation, salary math, and role-based field visibility must all be enforced server-side, not just hidden in the UI).

### 7.5 Local dev proxy (optional but recommended)
In `vite.config.js`, proxy `/api` to `http://localhost:4000` so the frontend can call relative paths in dev without CORS friction, while still using `VITE_API_BASE_URL` directly in production:
```js
server: {
  proxy: {
    '/api': 'http://localhost:4000'
  }
}
```

---

## 8. Error Handling & Validation Conventions

- Every request body validated with a Zod schema in `validators/` before it reaches a controller; invalid input returns `400` with `error.code = "VALIDATION_ERROR"` and a `details` array of field-level messages.
- Custom error classes (`NotFoundError`, `ForbiddenError`, `ConflictError`, `UnauthorizedError`) each map to the correct HTTP status in the centralized `errorHandler`.
- Never leak stack traces or raw Prisma errors to the client in production; log them via Pino, return the generic envelope shape above.
- Auth failures always return the same generic message regardless of whether the Login ID or the password was wrong (`"That Login ID or password doesn't match our records"`) — don't reveal which part was incorrect, to avoid account enumeration.

---

## 9. Testing

- **Jest + Supertest** for every route: happy path, role-guard rejection (Employee hitting an Admin-only route → 403), validation rejection, and the salary-formula assertion (Section 4.6) as a dedicated unit test independent of the HTTP layer.
- Seed script (`prisma/seed.ts`) creating one Admin and a handful of Employees with realistic attendance/leave/payroll data so the frontend can be developed against real-shaped data immediately.

---

## 10. Deployment (Google Cloud, matching the system design doc)

| Concern | Service |
|---|---|
| API hosting | Cloud Run |
| Database | Cloud SQL for PostgreSQL |
| Secrets (`JWT_*_SECRET`, `DATABASE_URL`, `RESEND_API_KEY`, `CLOUDINARY_URL`) | Secret Manager, injected as Cloud Run env vars — never committed to `.env` in the repo |
| Frontend | Firebase Hosting, `VITE_API_BASE_URL` pointed at the Cloud Run service URL |
| CI/CD | Cloud Build or GitHub Actions → Cloud Run on push to main |

On deploy, update `CLIENT_ORIGIN` (server) and `VITE_API_BASE_URL` (client) to the real production URLs — this pair is the other half of the CORS/cookie setup in Section 7.1 and is the second most common integration bug after the `withCredentials` flag.

---

*End of backend prompt. Build against `HRMS_Frontend_Prompt.md` for the exact UI states and role-based rendering each endpoint needs to support.*
