# Field Student Attendance System

# Local Setup & Developer Guide

This guide provides step-by-step instructions for cloning, configuring, and running the **Field Student Attendance System** on your local development environment.

---

# Prerequisites

Ensure you have the following installed on your machine before starting:

- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **PostgreSQL**: `v14.x` or higher (running locally or accessible via network)
- **Git**: `v2.x` or higher

---

# 1. Repository Setup

Clone the project repository from GitHub and navigate to the project root directory:

```bash
git clone https://github.com/abelatwork/field-attendance-system.git

cd field-attendance-system

```

---

# 2. PostgreSQL Configuration

Make sure your PostgreSQL server is running. Create a dedicated database for this application using the PostgreSQL CLI (`psql`) or a database GUI (like pgAdmin or DBeaver):

```sql
CREATE DATABASE attendance_db;

```

---

# 3. Backend Setup

### Step A: Install Dependencies

Navigate into the `backend/` directory and install the required npm packages:

```bash
cd backend
npm install

```

## Step B: Environment Variables

Create a `.env` file inside the `backend/` directory:

```bash
touch .env

```

Add the following configuration to `backend/.env` (adjust database credentials to match your local PostgreSQL setup):

```env
PORT=5000
DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@localhost:5432/attendance_db?schema=public"
JWT_SECRET="your_jwt_secret_key_here_for_development"

```

> **Note:** Replace `<DB_USER>` and `<DB_PASSWORD>` with your local PostgreSQL username and password.

## Step C: Database Migrations & Seeding

Run Prisma migrations to generate database tables and run the seed script to create initial credentials:

```bash
# 1. Apply database migrations
npx prisma migrate dev --name init

# 2. Seed default users and sample data
npx prisma db seed

```

Upon successful seeding, the system will populate initial credentials:

- **Super Admin**: `admin` / `Password123!`
- **Supervisor**: `supervisor` / `Password123!`

## Step D: Start Backend Server

Start the Express server in development mode:

```bash
npm run dev

```

The backend API will run on `http://localhost:5000`.

---

# 4. Frontend Setup

Open a **new terminal tab or window** and set up the client application.

## Step A: Install Dependencies

Navigate into the `frontend/` directory and install the packages:

```bash
cd frontend
npm install

```

## Step B: Environment Variables

Create a `.env` file inside the `frontend/` directory:

```bash
touch .env

```

Add the base API endpoint URL to `frontend/.env`:

```env
VITE_API_BASE_URL="http://localhost:5000/api"

```

## Step C: Start Frontend Development Server

Run Vite's development server:

```bash
npm run dev

```

The frontend application will be accessible at `http://localhost:5173`.

---

# 5. System Verification

1. **Public Portal**: Open `http://localhost:5173`. Search for a student name, enable browser GPS, and submit an `IN` or `OUT` attendance record.
2. **Super Admin Dashboard**: Navigate to `http://localhost:5173`, log in with `admin` / `Password123!`, view global logs, assign students to supervisors, and export CSV logs.
3. **Supervisor Dashboard**: Log in with `supervisor` / `Password123!` to verify that attendance logs are restricted only to assigned students.

---

# Troubleshooting & Useful Commands

- **Reset Database**: To drop, recreate, and re-seed the PostgreSQL database from scratch:

```bash
cd backend
npx prisma migrate reset

```

- **Inspect Database UI**: To view database tables directly in a web browser using Prisma Studio:

```bash
cd backend
npx prisma studio

```
