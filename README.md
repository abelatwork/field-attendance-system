# Field Student Attendance System

A web-based attendance tracking system for organizations managing students in field activities.

The system allows registered students to record their attendance by selecting their name and choosing either **IN** or **OUT**. The system records the attendance time using the backend server and captures the student's location using the browser's Geolocation API.

Supervisors and Super Admins can access protected management functions according to their assigned roles.

---

## Features

### Student Attendance

- Search for a registered student.
- Select the student's name.
- Record `IN` attendance.
- Record `OUT` attendance.
- Capture the student's current location.
- Store latitude, longitude, and location accuracy.
- Record the official attendance timestamp on the server.
- Prevent invalid attendance actions such as duplicate IN or OUT without an active IN.
- Display attendance confirmation after a successful submission.

### Supervisor Portal

- Secure supervisor login.
- View assigned students.
- View attendance information for assigned students.
- View today's attendance.
- Monitor student IN/OUT status and attendance times.

### Super Admin Portal

- Secure Super Admin login.
- Register students.
- Edit student information.
- Activate or deactivate students.
- Manage supervisor accounts.
- Assign students to supervisors.
- View attendance information across the system.

---

## User Roles

The system has three user categories:

| Role        | Description                                                |
| ----------- | ---------------------------------------------------------- |
| Student     | Records attendance without creating an account             |
| Supervisor  | Monitors assigned students and their attendance            |
| Super Admin | Manages students, supervisors, assignments, and attendance |

Students do not have access to the protected management portal.

---

## Technology Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Browser Geolocation API

### Backend

- Node.js
- Express
- TypeScript
- JWT authentication
- Zod validation

### Database

- PostgreSQL
- Prisma

### Development Tools

- Git
- GitHub
- VS Code
- Postman

---

## System Architecture

```text
                    ┌─────────────────────┐
                    │       Student       │
                    │   Attendance Page   │
                    └──────────┬──────────┘
                               │
                               │ HTTP Request
                               ▼
                    ┌─────────────────────┐
                    │       React         │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Express Backend   │
                    │   REST API          │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │  Authentication │        │    Attendance   │
        │ & Authorization │        │    Validation   │
        └─────────────────┘        └────────┬────────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │   PostgreSQL    │
                                   │    Database     │
                                   └─────────────────┘
```

---

## Project Structure

```text
field-attendance-system/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── docs/
│   ├── api-documentation.md
│   ├── attendance-rules.md
│   ├── database-design.md
│   ├── requirements.md
│   ├── setup-guide.md
│   ├── system-design.md
│   └── user-roles.md
│
└── README.md
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/abelatwork/field-attendance-system.git
cd field-attendance-system
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

---

## Database Setup

The system uses PostgreSQL.

Create the required PostgreSQL database and configure the backend environment variables according to the setup guide.

Run the database migrations from the backend directory:

```bash
cd backend
npx prisma migrate dev
```

If the project uses the seed configuration, initialize the development data with:

```bash
npx prisma db seed
```

See `docs/setup-guide.md` for the complete setup procedure.

---

## Running the Application

Start the Backend

From the backend directory:

```bash
npm run dev
```

Start the Frontend

Open another terminal and run:

```bash
cd frontend
npm run dev
```

The frontend development server will provide the local address in the terminal.

---

## Attendance Flow

The basic student attendance process is:

```text
Open Attendance Page
        ↓
Search Student Name
        ↓
Select Registered Student
        ↓
Choose IN or OUT
        ↓
Allow Location Access
        ↓
Capture Location
        ↓
Submit Attendance
        ↓
Backend Validation
        ↓
Save Attendance
        ↓
Show Confirmation
```

---

## Attendance Rules

The system applies basic validation rules:

- Only registered students can record attendance.
- Inactive students cannot record attendance.
- A student cannot record IN while already IN.
- A student cannot record OUT without an active IN.
- Location is required.
- Attendance time is generated by the backend server.
- Attendance records are associated with the student's unique database ID.
- Attendance history is preserved.

More information is available in `docs/attendance-rules.md`.

---

## Documentation

Detailed project documentation is available in the docs/ directory.

| Document               | Description                              |
| ---------------------- | ---------------------------------------- |
| `requirements.md`      | System requirements and MVP scope        |
| `system-design.md`     | System architecture and component design |
| `database-design.md`   | Database structure and relationships     |
| `api-documentation.md` | Backend API endpoints                    |
| `user-roles.md`        | User roles and permissions               |
| `attendance-rules.md`  | Attendance validation and business rules |
| `setup-guide.md`       | Development environment setup            |

---

## Current Version

Version: 1.0.0 MVP

The current version focuses on the core attendance workflow and essential administrative functionality.

The system is intentionally kept simple so that additional features can be introduced in future versions without replacing the core architecture.

---

## Future Improvements

Possible future improvements include:

- Attendance reports and exports.
- Attendance analytics and dashboards.
- Geofencing.
- Notifications.
- SMS and email integration.
- Mobile application.
- Stronger location verification.
- Multiple organizations or departments.
- Improved audit logging.
- Additional security controls.
- Private organizational deployment.

These features are not part of the current v1.0.0 MVP.

---

## Project Status

v1.0.0 MVP — In Development

The core system has been implemented and the project documentation is being developed alongside the application.

---

## License

This project is currently intended for development purposes.

A formal license may be added in a future version.
