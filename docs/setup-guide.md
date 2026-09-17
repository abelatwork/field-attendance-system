# Field Student Attendance System

## Local Setup & Developer Guide

This guide provides step-by-step instructions for cloning, configuring, and running the **Field Student Attendance System** on your local development environment.

---

## 1. Prerequisites & Stack Environment

Ensure your local development machine satisfies the following runtime and core dependency specifications before starting:

### Required System Runtimes

- **Node.js**: `v24.19.0` (or higher `v24.x`)
- **npm**: `v10.x` or higher
- **PostgreSQL**: `v14.x` or higher (running locally or accessible over a network)
- **Operating System**: Linux (`debian-openssl-3.0.x` x64 architecture) or equivalent Unix/Windows environment
- **Git**: `v2.x` or higher

```bash
# Verify your local Node.js version
node -v

```

### Targeted Dependency Versions

- **Prisma ORM**: `6.19.3`
- **`@prisma/client`**: `6.19.3`
- **Prisma Studio**: `0.511.0`
- **TypeScript**: `7.0.2`
- **Backend Framework**: Express `v4.x`, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`
- **Frontend Framework**: React `v18.x` (Vite `v5.x`), Tailwind CSS `v3.x`, Axios, `lucide-react`

---

## 2. Repository Cloning & Database Setup

### Step A: Clone the Repository

Clone the project repository from GitHub and navigate into the root directory:

```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
cd <YOUR_REPOSITORY_NAME>

```

### Step B: Create PostgreSQL Database

Ensure your local PostgreSQL server is running. Open your terminal or PostgreSQL client (`psql`, pgAdmin, or DBeaver) and create the project database:

```sql
CREATE DATABASE attendance_db;

```

---

## 3. Backend Setup & Configuration

### Step A: Install Backend Dependencies

Navigate into the `backend/` directory and install production and development dependencies:

```bash
cd backend

# Install production dependencies
npm install @prisma/client express jsonwebtoken bcryptjs cors dotenv

# Install development dependencies
npm install -D typescript prisma @types/node @types/express @types/jsonwebtoken @types/bcryptjs @types/cors ts-node-dev

```

### Step B: Configure Prisma 6+ (`prisma.config.ts`)

Prisma 6+ deprecates the legacy `package.json#prisma` configuration block. Create a **`prisma.config.ts`** file in the root of your `backend/` directory to explicitly declare the schema location:

```typescript
import { defineConfig } from "prisma";

export default defineConfig({
  schema: "prisma/schema.prisma",
});
```

### Step C: Environment Variables Setup

Create a **`.env`** file inside your `backend/` directory:

```bash
touch .env

```

Add the following environment variables (adjust PostgreSQL credentials to match your local setup):

```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/attendance_db?schema=public"
JWT_SECRET="your_jwt_secret_key_here_for_development"

```

> **Note:** Replace `postgres` and `password` with your local database username and password.

### Step D: Generate Client, Run Migrations & Seed Database

Build the custom Query Engine binaries tailored for your target OS (`debian-openssl-3.0.x`), apply database migrations, and seed initial user credentials:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Apply database migrations
npx prisma migrate dev --name init

# 3. Seed default administrative credentials and sample data
npx prisma db seed

```

Upon successful execution, the seed script provisions default credentials:

- **Super Admin**: `admin` / `Password123!`
- **Supervisor**: `supervisor` / `Password123!`

### Step E: Verify Backend Version Stack

Run the Prisma version command to verify that your environment completely matches the required stack:

```bash
npx prisma --version

```

**Expected Target Output:**

- **Prisma / @prisma/client**: `6.19.3`
- **TypeScript**: `7.0.2`
- **Node.js**: `v24.19.0`

### Step F: Start Backend Server

Launch the Express backend in development mode:

```bash
npm run dev

```

The REST API will begin listening at `http://localhost:5000/api`.

---

Yes, Section 4 of your `SETUP-GUIDE.md` already covers the basic setup for the frontend, but we can make it **much more detailed and explicit** by listing the exact dependencies, Vite configuration, and initialization steps—just like we did for the backend.

Here is the updated, fully comprehensive **Section 4: Frontend Setup** to insert directly into your `SETUP-GUIDE.md`:

---

### 4. Frontend Setup & Configuration

#### Step A: Frontend Prerequisites & Dependencies

The frontend is built using **React 18**, **Vite 5**, **TypeScript 5**, and **Tailwind CSS 3**.

- **Core Production Packages**: `react`, `react-dom`, `axios`, `lucide-react`
- **Development Packages**: `vite`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`

#### Step B: Install Frontend Dependencies

Navigate into the `frontend/` directory and install all production and development dependencies:

```bash
cd frontend

# Install dependencies defined in package.json
npm install

```

> **Manual Installation Alternative**: If you are initializing the frontend from scratch, run:
>
> ```bash
> # Production dependencies
> npm install react react-dom axios lucide-react
>
> # Development dependencies
> npm install -D vite @types/react @types/react-dom @vitejs/plugin-react typescript tailwindcss postcss autoprefixer
>
> ```

#### Step C: Configure Tailwind CSS

Ensure Tailwind CSS is initialized with `postcss.config.js` and `tailwind.config.js` in the `frontend/` root:

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

Ensure `frontend/src/index.css` includes the Tailwind directives at the top:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### Step D: Environment Variables Setup

Create a **`.env`** file inside your `frontend/` directory:

```bash
touch .env

```

Add the base URL pointing to your running Express backend API:

```env
VITE_API_BASE_URL="http://localhost:5000/api"

```

#### Step E: Start Development Server

Launch Vite's local development server with hot module replacement (HMR):

```bash
npm run dev

```

The React frontend application will open at `http://localhost:5173`.

---

## 5. Verification & Testing Workflow

1. **Public Attendance Portal**: Navigate to `http://localhost:5173`. Search for a student name, allow browser GPS access, choose `IN` or `OUT`, and record attendance.
2. **Super Admin Dashboard**: Log in at `http://localhost:5173` using `admin` / `Password123!`. Test student registration, supervisor assignments, status toggles (`ACTIVE`/`INACTIVE`), and CSV exports.
3. **Supervisor Dashboard**: Log in using `supervisor` / `Password123!` to confirm that attendance records are restricted strictly to students assigned under that supervisor.

---

## Utility Commands

- **Prisma Studio (GUI)**: Launch Prisma Studio (`v0.511.0`) to view and edit database tables directly in your browser:

```bash
cd backend
npx prisma studio

```

- **Database Reset**: Wipe all data, re-run migrations, and re-seed clean default data:

```bash
cd backend
npx prisma migrate reset

```
