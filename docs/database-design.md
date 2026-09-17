# Field Student Attendance Tracking System

## Database Design — v1.0.0

# 1. Introduction

The Field Student Attendance Tracking System uses PostgreSQL as its primary relational database.

The database stores system users, registered students, and attendance records. Relationships between these entities allow the system to associate students with supervisors and associate attendance events with individual students.

Prisma is used as the application's database access and schema management layer.

The database design is intended to provide:

- Persistent attendance storage.
- Reliable relationships between system entities.
- Unique identification of records.
- Data integrity.
- Support for attendance validation.
- Support for role-based system access.
- Future expansion of the system.

---

# 2. Database Technology

The Version 1.0.0 system uses:

| Component                  | Technology        |
| -------------------------- | ----------------- |
| Database Management System | PostgreSQL        |
| ORM / Database Layer       | Prisma            |
| Database Language          | SQL               |
| Migration System           | Prisma Migrations |

The database is hosted separately from the frontend application and is accessed by the backend.

The frontend does not communicate directly with PostgreSQL.

The database communication path is:

```
React Frontend
      │
      ▼
Express Backend
      │
      ▼
Prisma
      │
      ▼
PostgreSQL
```

---

# 3. Database Entities

The main database entities are:

```
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       │ supervises
       ▼
┌──────────────┐
│   Student    │
└──────┬───────┘
       │
       │ records
       ▼
┌──────────────┐
│  Attendance  │
└──────────────┘
```

The database contains three primary models:

- User
- Student
- Attendance

---

# 4. User Table

The User table stores authenticated system users.

Users include supervisors and Super Admin accounts.

## 4.1 User Fields

| Field        | Type      | Description                             |
| ------------ | --------- | --------------------------------------- |
| id           | Integer   | Unique user identifier                  |
| firstName    | String    | User's first name                       |
| lastName     | String    | User's last name                        |
| email        | String    | User's login email                      |
| passwordHash | String    | Hashed user password                    |
| role         | UserRole  | User's system role                      |
| active       | Boolean   | Indicates whether the account is active |
| createdAt    | Timestamp | Account creation time                   |
| updatedAt    | Timestamp | Last update time                        |

## 4.2 User Primary Key

The id field is the primary key.

Each user receives a unique automatically generated integer ID.

`User.id` is therefore used to uniquely identify a user within the database.

## 4.3 User Email

The email field is unique.

This prevents two user accounts from being registered using the same email address.

`email UNIQUE`

## 4.4 User Role

The system uses the UserRole enumeration.

The available roles are:

```
SUPERVISOR
SUPER_ADMIN
```

The role determines which protected functionality the authenticated user can access.

## 4.5 User Active Status

The active field determines whether a user account is active.

The default value is:

`true`

An account can therefore be deactivated without necessarily removing its database record.

---

# 5. Student Table

The Student table stores registered field students.

Students do not need system login accounts for recording attendance.

Instead, their information is registered by an authorized administrator.

## 5.1 Student Fields

| Field          | Type      | Description                             |
| -------------- | --------- | --------------------------------------- |
| `id`           | Integer   | Unique student identifier               |
| `firstName`    | String    | Student's first name                    |
| `lastName`     | String    | Student's last name                     |
| `phone`        | String    | Student's phone number                  |
| `active`       | Boolean   | Indicates whether the student is active |
| `supervisorId` | Integer   | ID of the assigned supervisor           |
| `createdAt`    | Timestamp | Student record creation time            |
| `updatedAt`    | Timestamp | Last update time                        |

---

# 6. Student Primary Key

The id field is the primary key of the Student table.

Each student has a unique database identifier.

The unique student ID is important because multiple students may have the same first name and last name.

Attendance records therefore reference:

`studentId`

rather than identifying a student only by their name.

# 7. Supervisor Relationship

Each student is assigned to a supervisor.

The relationship is implemented using:

`Student.supervisorId`

which references:

`User.id`

The relationship can be represented as:

```
User
 │
 │ 1
 │
 │
 ▼
Many Students
```

A supervisor can therefore be associated with multiple students.

The database foreign key maintains the relationship between the student and assigned supervisor.

# 8. Student Active Status

The active field determines whether a student is currently active in the system.

The default value is:

`true`

When a student should no longer participate in attendance tracking, the preferred approach is to deactivate the student rather than permanently deleting the record.

This helps preserve historical attendance information.

# 9. Attendance Table

The Attendance table stores individual attendance events.

Every attendance record belongs to a specific student.

## 9.1 Attendance Fields

| Field       | Type           | Description                                            |
| ----------- | -------------- | ------------------------------------------------------ |
| `id`        | Integer        | Unique attendance identifier                           |
| `studentId` | Integer        | ID of the student                                      |
| `type`      | AttendanceType | IN or OUT                                              |
| `timestamp` | Timestamp      | Time the attendance event was recorded                 |
| `latitude`  | Float          | Latitude of the attendance location                    |
| `longitude` | Float          | Longitude of the attendance location                   |
| `accuracy`  | Float          | Accuracy reported by the browser's geolocation service |
| `createdAt` | Timestamp      | Attendance record creation time                        |

---

# 10. Attendance Primary Key

The id field is the primary key of the Attendance table.

Each attendance event receives a unique automatically generated ID.

# 11. Attendance Student Relationship

The studentId field is a foreign key referencing the Student table.

The relationship is:

```
Student
│
│ 1
│
▼
Many Attendance Records
```

A student can therefore have multiple attendance records over time.

For example:

```
Student #15
│
├── IN
├── OUT
├── IN
├── OUT
└── IN
```

Each record remains associated with the same student ID.

# 12. Attendance Type

The system uses the AttendanceType enumeration.

The available values are:

```
IN
OUT
```

**IN** represents the beginning of an attendance period.

**OUT** represents the end of an attendance period.

Using an enumeration prevents arbitrary attendance types from being stored in the database.

---

# 13. Attendance Timestamp

The attendance timestamp records when the attendance event was processed.

The database provides a default timestamp when an attendance record is created.

The system treats the server-side timestamp as the authoritative attendance time rather than relying on the student's device clock.

---

# 14. Location Data

Each attendance record stores geographical information.

The following fields are used:

- latitude
- longitude
- accuracy

**Latitude** represents the north/south geographic position.

**Longitude** represents the east/west geographic position.

**Accuracy** represents the estimated accuracy of the geographical location provided by the browser.

The location information is stored together with the attendance event.

---

# 15. Database Relationships

### The complete relationship structure is:

```
┌─────────────────────┐
│        User         │
│                     │
│ id                  │
│ firstName           │
│ lastName            │
│ email               │
│ role                │
└──────────┬──────────┘
           │
           │ supervisorId
           │
           ▼
┌─────────────────────┐
│      Student        │
│                     │
│ id                  │
│ firstName           │
│ lastName            │
│ phone               │
│ supervisorId        │
└──────────┬──────────┘
           │
           │ studentId
           │
           ▼
┌─────────────────────┐
│     Attendance      │
│                     │
│ id                  │
│ studentId           │
│ type                │
│ timestamp           │
│ latitude            │
│ longitude           │
│ accuracy            │
└─────────────────────┘
```

### The relationships can be summarized as:

```
User 1 ──────── Student

Student 1 ───── Attendance
```

---

# 16. Primary Keys

The database uses automatically generated integer primary keys.

| Table      | Primary Key |
| ---------- | ----------- |
| User       | id          |
| Student    | id          |
| Attendance | id          |

Primary keys uniquely identify individual records.

---

# 17. Foreign Keys

The system uses foreign keys to maintain relationships.

| Table      | Foreign Key  | References |
| ---------- | ------------ | ---------- |
| Student    | supervisorId | User.id    |
| Attendance | studentId    | Student.id |

These relationships ensure that student and attendance records are associated with valid database records.

---

# 8. Indexes

The database uses indexes to improve lookup performance.

An index is maintained on the attendance student's foreign key:

`Attendance.studentId`

This supports efficient retrieval of attendance records belonging to a particular student.

An index is also maintained on:

`Student.supervisorId`

This supports efficient retrieval of students assigned to a particular supervisor.

---

# 19. Constraints and Defaults

The database applies several constraints and defaults.

#### User

- id is automatically generated.
- email is unique.
- role defaults to SUPERVISOR.
- active defaults to true.
- createdAt defaults to the current timestamp.

#### Student

- id is automatically generated.
- active defaults to true.
- supervisorId references a valid user.
- createdAt defaults to the current timestamp.

#### Attendance

- id is automatically generated.
- studentId references a valid student.
- type must use a valid attendance type.
- timestamp defaults to the current timestamp.
- createdAt defaults to the current timestamp.

---

# 20. Data Integrity

The database design supports data integrity through:

- Primary keys.
- Foreign keys.
- Unique constraints.
- Enumerated values.
- Required fields.
- Default values.
- Relational associations.

For example, an attendance record cannot correctly reference an arbitrary student name. It must reference the student's database ID.

This ensures that attendance information remains associated with the correct student record.

---

# 21. Attendance Data Lifecycle

The general attendance data lifecycle is:

```
Student Registered
       │
       ▼
Student Selected
       │
       ▼
IN / OUT Selected
       │
       ▼
Location Captured
       │
       ▼
Attendance Submitted
       │
       ▼
Backend Validation
       │
       ▼
Attendance Record Created
       │
       ▼
PostgreSQL
```

Once stored, the attendance record becomes part of the student's attendance history.

---

# 22. Student Deactivation

Student records are designed to support deactivation.

Instead of permanently deleting a student, the system can change:

`active = false`

This approach helps preserve historical attendance information.

For example:

```
Student
   │
   ├── Active
   │     │
   │     └── Can participate in attendance
   │
   └── Inactive
         │
         └── Historical information retained
```

---

# 23. User Deactivation

The same principle applies to system users.

The active field allows an administrator to deactivate a user account while retaining the associated database record.

This helps maintain historical relationships and avoids unnecessary permanent deletion.

---

# 24. Database Migrations

Database structure changes are managed using Prisma migrations.

The migration files are located in:

`backend/prisma/migrations/`

The initial database migration establishes the tables, relationships, constraints, and indexes required by Version 1.0.0.

Migrations provide a controlled way to reproduce and update the database structure across development environments.

---

# 25. Database Seed

The backend contains a database seed file:

`backend/prisma/seed.ts`

The seed process can be used to populate the database with initial development or test records.

Seed data is useful when setting up a new development environment or testing system functionality.

Production data should not be replaced with development seed data.

---

# 26. Database Access

The frontend does not directly connect to PostgreSQL.

Instead:

```
Frontend
   │
   │ HTTP API
   ▼
Backend
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
```

This architecture prevents database credentials from being exposed to the browser and keeps database operations under backend control.

---

# 27. Database Security

Database connection information is maintained through environment configuration rather than being hard-coded into application source files.

Sensitive values such as:

- Database passwords.
- Database connection strings.
- Authentication secrets.

must not be committed to the Git repository.

The project's `.gitignore` should prevent sensitive environment files from being committed.

---

# 28. Future Database Expansion

Future versions may introduce additional database entities or fields.

Possible additions include:

- Attendance notes.
- Field locations.
- Attendance sessions.
- Audit logs.
- Attendance corrections.
- Reports.
- Notifications.
- Multiple organizations.
- Academic programs.
- Student registration numbers.
- Additional supervisor permissions.

These changes should be introduced through controlled database migrations.

---

# 29. Version Information

```
System: Field Student Attendance Tracking System

Version: v1.0.0

Database: PostgreSQL

ORM: Prisma

Primary Entities: User, Student, Attendance

Status: Working MVP
```
