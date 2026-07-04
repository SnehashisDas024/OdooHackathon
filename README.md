# Human Resource Management System (HRMS)

A modern, full-stack Human Resource Management System built with React, Node.js (Express), Prisma ORM, and PostgreSQL/SQLite. Features real-time employee check-in/out, multi-step self-onboarding wizard, salary calculator, time-off requests, and admin dashboards.

---

## Tech Stack

- **Frontend**: React (Vite), React Query, Tailwind CSS, Lucide Icons, React Hook Form + Zod
- **Backend**: Node.js (Express), Prisma ORM, JSON Web Tokens (JWT)
- **Database**: PostgreSQL (Default) or SQLite

---

## Setup & Running Instructions

Follow these steps to run the application locally from scratch:

### 1. Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (running locally on port 5432)

---

### 2. Configuration Setup
Create local configuration files from the templates:

1. **Backend Environment**:
   - Go to `server/` directory.
   - Copy `.env.example` to `.env`.
   - Update the `DATABASE_URL` with your local PostgreSQL connection string:
     ```env
     DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hrms_db"
     ```

2. **Frontend Environment**:
   - Go to `client/` directory.
   - Copy `.env.example` to `.env`.

---

### 3. Database Initialization & Seeding

Run the database setup script to push the database schema and seed the initial mock data (Admin, Employees, Leave requests):

1. Open PowerShell or Command Prompt.
2. In the root directory of the project, run:
   ```powershell
   # If using PowerShell:
   .\start.ps1
   ```
   *Alternatively, if running commands manually:*
   ```bash
   # In server/ directory:
   npm install
   npx prisma db push --accept-data-loss
   node prisma/seed.js
   ```

---

### 4. Running the Application

Start both the backend server and frontend client:

- **Start Backend**:
  ```bash
  cd server
  npm run dev
  ```
  *The backend will be running at [http://localhost:5000](http://localhost:5000).*

- **Start Frontend**:
  ```bash
  cd client
  npm install
  npm run dev
  ```
  *The client web application will open at [http://localhost:3000](http://localhost:3000).*

---

## Pre-seeded Accounts

You can use the following mock accounts to test different roles in the system:

### 👑 Admin / HR Credentials
- **Email/Login ID**: `admin@hrms.com`
- **Password**: `Admin@1234`

### 👤 Demo Employee Credentials
*(Password for **all** employees below is `Employee@1234`)*

| Name | Role | Email | Login ID |
|---|---|---|---|
| **Arjun Sharma** | Software Engineer | `arjun.sharma@hrms.com` | `OIARSH20220001` |
| **Priya Patel** | UI/UX Designer | `priya.patel@hrms.com` | `OIPRPA20220002` |
| **Rahul Gupta** | Backend Developer | `rahul.gupta@hrms.com` | `OIRAGU20230001` |
| **Sneha Reddy** | Marketing Executive | `sneha.reddy@hrms.com` | `OISNRE20230002` |
| **Vikram Singh** | Sales Manager | `vikram.singh@hrms.com` | `OIVISI20240001` |
