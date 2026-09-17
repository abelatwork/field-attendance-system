# Field Student Attendance Tracking System

## System Design — v1.0.0

# 1. Introduction

The Field Student Attendance Tracking System uses a web-based client-server architecture.

The system is divided into three primary layers:

- Frontend
- Backend API
- Database

The frontend provides the user interface, the backend processes application requests and business logic, and PostgreSQL provides persistent storage.

The system also includes authentication and role-based authorization to protect administrative functionality.

---

# 2. System Architecture

The high-level architecture of Version 1.0.0 is:

```
┌───────────────────────────────────────────────┐
│                    USERS                      │
│                                               │
│       Students       Supervisors      Admins  │
└───────────────┬───────────────┬───────────────┘
                │               │
                │               │
                ▼               ▼
┌───────────────────────────────────────────────┐
│                 FRONTEND                      │
│                                               │
│              React + TypeScript               │
│                                               │
│  Attendance Page    Login Page    Dashboard   │
└───────────────────────┬───────────────────────┘
                        │
                     HTTP API
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                  BACKEND                      │
│                                               │
│              Node.js + Express                │
│                                               │
│   Routes → Middleware → Controllers           │
│                         │                     │
│                         ▼                     │
│                       Prisma                  │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│                 DATABASE                      │
│                                               │
│                  PostgreSQL                   │
│                                               │
│       User    Student    Attendance           │
└───────────────────────────────────────────────┘
```

---

# 3. Architectural Layers

## 3.1 Presentation Layer

The presentation layer is implemented using React and TypeScript. Its responsibility is to:

- Display the user interface.
- Collect user input.
- Display attendance forms.
- Display login forms.
- Display dashboard information.
- Communicate with the backend API.
- Display success and error messages.

`The frontend is located in: frontend/`

## 3.2 Application Layer

The application layer is implemented using Node.js and Express. It is responsible for:

- Receiving API requests.
- Validating requests.
- Authenticating users.
- Authorizing users.
- Processing attendance operations.
- Managing students and supervisors.
- Returning API responses.

`The backend is located in: backend/`

## 3.3 Data Layer

The data layer consists of PostgreSQL and Prisma.

PostgreSQL provides persistent storage.

Prisma provides the application's database access layer and manages the relationship between the application and the database.

The database contains the main entities:

- User
- Student
- Attendance

---

# 4. Frontend Architecture

The frontend uses React with TypeScript and Vite.

The main frontend structure is:

```
frontend/
└── src/
    ├── App.tsx
    ├── App.css
    ├── index.css
    ├── main.tsx
    │
    ├── pages/
    │   ├── AttendancePage.tsx
    │   ├── DashboardPage.tsx
    │   └── LoginPage.tsx
    │
    ├── services/
    │   └── api.ts
    │
    ├── components/
    ├── hooks/
    └── types/
        └── index.ts
```

## Main pages

### 1. AttendancePage

Provides the student attendance interface.

It is responsible for the student attendance process, including student selection, attendance type selection, location capture, and attendance submission.

### 2. LoginPage

Provides authentication for protected system users.

### 3. DashboardPage

Provides the authenticated dashboard used for monitoring and administrative functionality.

---

# 5. Backend Architecture

The backend follows a route-controller-middleware structure.

The main backend structure is:

```
backend/
└── src/
    ├── app.ts
    ├── server.ts
    │
    ├── config/
    │   └── jwt.ts
    │
    ├── controllers/
    │   ├── adminController.ts
    │   ├── attendanceController.ts
    │   ├── authController.ts
    │   └── dashboardController.ts
    │
    ├── middleware/
    │   └── authMiddleware.ts
    │
    ├── routes/
    │   ├── adminRoutes.ts
    │   ├── attendanceRoutes.ts
    │   └── authRoutes.ts
    │
    ├── services/
    └── types/
```

---

# 6. Backend Request Flow

A typical request follows this process:

```
Client
  │
  ▼
API Route
  │
  ▼
Authentication Middleware
  │
  ▼
Authorization Check
  │
  ▼
Controller
  │
  ▼
Database / Prisma
  │
  ▼
PostgreSQL
  │
  ▼
Controller Response
  │
  ▼
Client
```

### Not every endpoint requires authentication.

Public attendance functionality can be accessed through the attendance interface, while protected dashboard and administration functionality requires authentication.

---

# 7. Authentication Architecture

Protected system users authenticate through the login interface.

The authentication process follows:

```
User
 │
 ▼
Login Page
 │
 ▼
Login API
 │
 ▼
Authentication Controller
 │
 ▼
Verify Credentials
 │
 ▼
Generate JWT
 │
 ▼
Return Authentication Result
 │
 ▼
Protected Frontend
```

For subsequent protected requests:

```
Frontend
   │
   │ JWT
   ▼
Backend
   │
   ▼
Authentication Middleware
   │
   ▼
Verify Token
   │
   ▼
Check User Role
   │
   ▼
Controller
```

### JWT configuration is maintained separately in:

`backend/src/config/jwt.ts`

### Authentication middleware is maintained in:

`backend/src/middleware/authMiddleware.ts`

---

# 8. Student Attendance Flow

The primary system workflow is the student attendance process.

```
┌──────────────────────┐
│ Student opens        │
│ attendance page      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Search registered    │
│ student name         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Select student       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Select IN or OUT     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Request location     │
│ from browser         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Submit attendance    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Backend validates    │
│ attendance request   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Record server        │
│ timestamp + location │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Store in PostgreSQL  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Return confirmation  │
└──────────────────────┘
```

---

# 9. Location Capture

The attendance interface uses the browser's Geolocation API to obtain the student's location.

The location data includes:

- Latitude
- Longitude
- Accuracy

The location is submitted together with the attendance request.

The backend stores the location with the attendance record.

### The system does not currently implement advanced geofencing in Version 1.0.0.

---

# 10. Server Timestamp

The backend is responsible for determining the official attendance timestamp.

The client does not provide the authoritative attendance time.

The general process is:

```
Student submits attendance
          │
          ▼
Backend receives request
          │
          ▼
Server generates timestamp
          │
          ▼
Attendance record stored
```

This prevents the attendance timestamp from depending on the student's device clock.

---

# 11. Attendance Data Flow

An attendance request contains information identifying the student and the attendance action together with location information.

Conceptually:

```
Student ID
     │
     ├── Attendance Type
     │       │
     │       ├── IN
     │       └── OUT
     │
     ├── Latitude
     ├── Longitude
     └── Accuracy
             │
             ▼
        Backend API
             │
             ▼
       Validation Logic
             │
             ▼
       Attendance Record
             │
             ▼
          PostgreSQL
```

The attendance record is associated with the student's unique database ID.

Student names are not used as the primary identifier for attendance records.

---

# 12. Attendance Validation

Before an attendance record is created, the backend validates the requested attendance action.

The system checks the student's current attendance state before accepting the request.

A simplified example is:

```
                    Attendance Request
                           │
                           ▼
                    Validate Student
                           │
                           ▼
                  Check Current State
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
             IN                        OUT
              │                         │
              ▼                         ▼
       Validate previous         Validate previous
          attendance                attendance
              │                         │
              └────────────┬────────────┘
                           ▼
                    Accept or Reject
```

The purpose of this validation is to prevent invalid attendance sequences and duplicate state transitions.

---

# 13. Supervisor Flow

A supervisor accesses the protected system through authentication.

The general workflow is:

```
Supervisor
    │
    ▼
Login
    │
    ▼
Authentication
    │
    ▼
Dashboard
    │
    ▼
View assigned students
    │
    ▼
View attendance information
```

Supervisor access is controlled by the user's role.

---

# 14. Super Admin Flow

The Super Admin has administrative access.

The general workflow is:

```
Super Admin
     │
     ▼
    Login
     │
     ▼
Authentication
     │
     ▼
Admin Dashboard
     │
     ├──────────────► Manage Students
     │
     ├──────────────► Manage Supervisors
     │
     ├──────────────► Assign Students
     │
     └──────────────► View Attendance
```

Administrative actions are protected by authentication and authorization

---

# 15. Database Architecture

The primary database entities are:

```
┌──────────────┐
│     User     │
│              │
│ id           │
│ firstName    │
│ lastName     │
│ email        │
│ passwordHash │
│ role         │
│ active       │
└──────┬───────┘
       │
       │ supervises
       │
       ▼
┌──────────────┐
│   Student    │
│              │
│ id           │
│ firstName    │
│ lastName     │
│ phone        │
│ supervisorId │
│ active       │
└──────┬───────┘
       │
       │ records
       │
       ▼
┌──────────────┐
│  Attendance  │
│              │
│ id           │
│ studentId    │
│ type         │
│ timestamp    │
│ latitude     │
│ longitude    │
│ accuracy     │
└──────────────┘
```

The database structure is documented in more detail in:

`docs/database-design.md`

---

# 16. Security Boundaries

The system separates public attendance functionality from protected staff functionality.

### Student-facing functionality

Students do not require system accounts to record attendance.

### Protected functionality

The following areas require authentication:

- Supervisor dashboard.
- Super Admin dashboard.
- Student management.
- Supervisor management.
- Administrative operations.

The backend is responsible for enforcing authorization rather than relying only on frontend restrictions.

---

# 17. Project Structure

The overall project structure is:

```
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
│   │   └── types/
│   ├── prisma.config.ts
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── package.json
│
├── docs/
│   └── requirements.md
│
├── README.md
└── .gitignore
```

---

# 18. Technology Interaction

The main technology interaction is:

```
React
  │
  │ HTTP requests
  ▼
Express
  │
  │ Application logic
  ▼
Prisma
  │
  │ Database queries
  ▼
PostgreSQL
```

Authentication is handled through the backend authentication system and JWT configuration.

The browser provides geographical location through the Geolocation API.

---

# 19. Error Handling

The system should provide appropriate responses when operations cannot be completed.

Examples include:

- Invalid login credentials.
- Unauthorized access.
- Invalid attendance action.
- Missing location information.
- Invalid student information.
- Database errors.
- Invalid API requests.

The frontend displays appropriate feedback to the user based on the backend response.

---

# 20. Extensibility

The Version 1.0.0 architecture is intentionally modular so that additional functionality can be introduced later.

Potential future extensions include:

- Attendance reporting.
- Advanced dashboard statistics.
- Geofencing.
- Notifications.
- Audit logs.
- Mobile applications.
- Offline attendance synchronization.
- Multiple organization support.
- More advanced access-control policies.

These features are outside the current Version 1.0.0 MVP scope.

---

# 21. Design Principles

The system follows several basic design principles:

### Separation of concerns

Frontend presentation, backend application logic, authentication, and database access are separated into different areas of the project.

### Role-based access

Different users receive access according to their role.

### Persistent data

Attendance information is stored in PostgreSQL rather than being kept only in the browser.

### Server-authoritative time

Attendance timestamps are generated by the server.

### Unique student identification

Attendance records reference students using their unique database identifiers.

### Expandability

The project structure allows additional functionality to be introduced in future versions.

---

# 22. Version Information

```
System: Field Student Attendance Tracking System

Version: v1.0.0

Architecture: Client-server web application

Frontend: React + TypeScript + Vite

Backend: Node.js + Express + TypeScript

Database: PostgreSQL

ORM: Prisma

Authentication: JWT

Status: Working MVP
```

---
