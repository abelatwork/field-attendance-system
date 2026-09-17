# Field Student Attendance System

## API Documentation - v1.0.0

## Overview & Authentication

- **Public Endpoints**: Open to all clients (used by field students to search and submit attendance).
- **Protected Endpoints**: Require a valid JSON Web Token (JWT) sent in the HTTP Request Header:

```http
Authorization: Bearer <YOUR_JWT_TOKEN>

```

---

# 1. Authentication Endpoints

### Login

Authenticates an Admin or Supervisor user and returns a bearer token.

- **HTTP Method:** `POST`
- **Endpoint:** `/auth/login`
- **Access:** Public

#### Request Body

```json
{
  "username": "<YOUR_USERNAME>",
  "password": "<YOUR_PASSWORD>"
}
```

#### Success Response (`200 OK`)

```json
{
  "token": "<JWT_TOKEN_PLACEHOLDER>",
  "user": {
    "id": "<USER_UUID>",
    "username": "admin",
    "role": "SUPER_ADMIN"
  }
}
```

#### Error Responses

- **`400 Bad Request`**: Username and password required.
- **`401 Unauthorized`**: Invalid username or password.

---

# 2. Public Attendance Endpoints

### Search Active Students

Performs a search for active students by name for autocomplete on the public check-in portal.

- **HTTP Method:** `GET`
- **Endpoint:** `/attendance/students/search`
- **Access:** Public
- **Query Parameters:** `q` (string, required) — e.g., `/attendance/students/search?q=John`

#### Success Response (`200 OK`)

```json
[
  {
    "id": "<STUDENT_UUID>",
    "firstName": "John",
    "lastName": "Doe"
  }
]
```

---

### Submit Attendance Check-In / Check-Out

Submits a student's `IN` or `OUT` attendance record along with browser GPS coordinates.

- **HTTP Method:** `POST`
- **Endpoint:** `/attendance/check`
- **Access:** Public

#### Request Body

```json
{
  "studentId": "<STUDENT_UUID>",
  "type": "IN",
  "latitude": -6.7924,
  "longitude": 39.2083
}
```

#### Success Response (`201 Created`)

```json
{
  "message": "Attendance recorded successfully.",
  "record": {
    "id": "<ATTENDANCE_RECORD_UUID>",
    "type": "IN",
    "latitude": -6.7924,
    "longitude": 39.2083,
    "studentId": "<STUDENT_UUID>",
    "timestamp": "2026-09-17T10:30:00.000Z"
  }
}
```

#### Error Responses

- **`400 Bad Request`**: Invalid input data or inactive student status.
- **`404 Not Found`**: Student ID does not exist.

---

# 3. Dashboard & Log Endpoints

### Fetch Attendance Logs

Retrieves attendance records. If accessed by a `SUPERVISOR`, automatically restricts records to only those students assigned under their supervision. Super Admins receive all logs.

- **HTTP Method:** `GET`
- **Endpoint:** `/admin/attendance-logs`
- **Access:** `SUPER_ADMIN`, `SUPERVISOR`

#### Success Response (`200 OK`)

```json
[
  {
    "id": "<ATTENDANCE_RECORD_UUID>",
    "type": "IN",
    "latitude": -6.7924,
    "longitude": 39.2083,
    "timestamp": "2026-09-17T10:30:00.000Z",
    "student": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+255700000000",
      "supervisorId": "<SUPERVISOR_UUID>"
    }
  }
]
```

---

# 4. Student Management Endpoints (Super Admin Only)

### Register New Student

Creates a new student record and optionally assigns them to a supervisor.

- **HTTP Method:** `POST`
- **Endpoint:** `/admin/students`
- **Access:** `SUPER_ADMIN`

#### Request Body

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+255711111111",
  "supervisorId": "<SUPERVISOR_UUID_OR_NULL>"
}
```

#### Success Response (`201 Created`)

```json
{
  "message": "Student registered successfully",
  "student": {
    "id": "<STUDENT_UUID>",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+255711111111",
    "status": "ACTIVE",
    "supervisorId": "<SUPERVISOR_UUID>",
    "supervisor": {
      "id": "<SUPERVISOR_UUID>",
      "username": "supervisor"
    }
  }
}
```

---

### Fetch All Students

Fetches all students along with their assigned supervisor information.

- **HTTP Method:** `GET`
- **Endpoint:** `/admin/students`
- **Access:** `SUPER_ADMIN`

#### Success Response (`200 OK`)

```json
[
  {
    "id": "<STUDENT_UUID>",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+255711111111",
    "status": "ACTIVE",
    "supervisor": {
      "id": "<SUPERVISOR_UUID>",
      "username": "supervisor"
    }
  }
]
```

---

### Toggle Student Status

Soft-deactivates or reactivates a student (`ACTIVE` $\leftrightarrow$ `INACTIVE`).

- **HTTP Method:** `PATCH`
- **Endpoint:** `/admin/students/:id`
- **Access:** `SUPER_ADMIN`

#### Success Response (`200 OK`)

```json
{
  "message": "Student set to INACTIVE",
  "student": {
    "id": "<STUDENT_UUID>",
    "status": "INACTIVE"
  }
}
```

---

### Fetch List of Supervisors

Retrieves all users registered with the `SUPERVISOR` role to populate dashboard selection menus.

- **HTTP Method:** `GET`
- **Endpoint:** `/admin/supervisors`
- **Access:** `SUPER_ADMIN`

#### Success Response (`200 OK`)

```json
[
  {
    "id": "<SUPERVISOR_UUID>",
    "username": "supervisor"
  }
]
```
