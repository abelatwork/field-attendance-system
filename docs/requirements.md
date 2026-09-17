# Field Student Attendance Tracking System

## System Requirements — v1.0.0

## 1. Introduction

The Field Student Attendance Tracking System is a web-based system designed to record and monitor the attendance of students who are participating in field activities.

The system allows students to record their attendance by selecting their registered name and choosing whether they are signing IN or OUT. The system records the attendance event together with the server-generated timestamp and geographical location.

Authorized staff members can access a protected dashboard to monitor attendance information. Administrative functions allow authorized administrators to manage students and supervisors.

Version 1.0.0 represents the Minimum Viable Product (MVP) of the system. The focus of this release is providing a functional attendance recording system with authentication, attendance management, database persistence, and basic administrative monitoring.

---

## 2. Purpose

The purpose of the system is to provide a simple and centralized way of recording field student attendance.

The system is intended to:

- Record student IN and OUT attendance.
- Associate attendance records with registered students.
- Record the date and time of each attendance event.
- Record the geographical location of attendance events.
- Allow authorized staff to monitor attendance.
- Allow administrators to manage students and supervisors.
- Maintain attendance information in a persistent database.
- Restrict administrative functionality to authenticated users.

---

## 3. Scope of Version 1.0.0

The Version 1.0.0 MVP includes the following major areas:

1. Student attendance recording.
2. Student identification using registered student information.
3. IN and OUT attendance actions.
4. Location capture.
5. Server-side attendance timestamping.
6. User authentication.
7. Protected dashboard access.
8. Student and supervisor administration.
9. Attendance monitoring.
10. PostgreSQL database persistence.
11. Role-based access control.
12. Responsive web interface.

The system is designed so that additional functionality can be introduced in later versions without replacing the core attendance functionality.

---

# 4. User Roles

The system contains different user roles with different responsibilities.

## 4.1 Student

Students are registered in the system by an authorized administrator.

Students do not create system accounts or passwords for recording attendance.

A student can:

- Search for their registered name.
- Select their registered student record.
- Select an IN or OUT attendance action.
- Provide their current geographical location through the browser.
- Submit an attendance record.
- Receive confirmation of the attendance submission.

---

## 4.2 Supervisor

A supervisor is an authenticated system user responsible for monitoring assigned students.

A supervisor can:

- Log into the system.
- Access the protected dashboard.
- View students assigned to them.
- View relevant attendance information.
- Monitor student attendance activity.

Supervisor access is restricted according to the permissions assigned to the supervisor account.

---

## 4.3 Super Admin

The Super Admin has administrative privileges within the system.

A Super Admin can:

- Log into the system.
- Access the administrative dashboard.
- Register students.
- Update student information.
- Deactivate student records.
- Manage supervisor accounts.
- Assign students to supervisors.
- View attendance information.
- Manage system users according to their assigned permissions.

---

# 5. Functional Requirements

## 5.1 Student Registration

The system shall allow an authorized administrator to register students.

A student record shall contain information including:

- First name
- Last name
- Phone number
- Assigned supervisor
- Active status

Each student shall have a unique database identifier.

---

## 5.2 Student Search

The attendance interface shall allow a student to search for their registered name.

The system shall display matching registered students.

The attendance record shall reference the student's unique database ID rather than relying only on the student's name.

---

## 5.3 Attendance Type

The system shall support two attendance actions:

- IN
- OUT

The selected attendance type shall be stored with the attendance record.

---

## 5.4 Location Capture

The system shall request the student's geographical location when an attendance record is submitted.

The attendance record shall store:

- Latitude
- Longitude
- Location accuracy

The system uses the browser's geolocation capability to obtain the location.

Location information is associated with the attendance event.

---

## 5.5 Attendance Timestamp

The system shall record the time of an attendance event using the server.

The client-side device time shall not be treated as the authoritative attendance time.

Each attendance record shall contain a timestamp representing when the server processed the attendance event.

---

## 5.6 Attendance Validation

The system shall validate attendance actions before creating a record.

The system shall prevent invalid attendance sequences, such as recording an OUT event when the student does not have a valid active IN state.

The system shall also prevent inappropriate duplicate attendance actions according to the attendance rules implemented by the system.

---

## 5.7 Attendance Storage

The system shall permanently store attendance records in the PostgreSQL database.

Each attendance record shall be associated with a registered student.

An attendance record shall contain:

- Attendance ID
- Student ID
- Attendance type
- Timestamp
- Latitude
- Longitude
- Location accuracy
- Creation information where applicable

---

## 5.8 User Authentication

The system shall require authentication for protected staff functionality.

Authenticated users shall log in using their registered credentials.

Authentication shall be used to protect access to the system dashboard and administrative functionality.

---

## 5.9 Authorization

The system shall distinguish between different user roles.

Access to protected functionality shall depend on the authenticated user's role and permissions.

A user shall not be allowed to access administrative functions without the required authorization.

---

## 5.10 Dashboard

The system shall provide a protected dashboard for authorized users.

The dashboard shall provide attendance-related information that allows authorized staff to monitor student attendance.

The information displayed shall depend on the user's role and access permissions.

---

## 5.11 Student Management

Authorized administrative users shall be able to manage registered student records.

Student management shall support:

- Creating student records.
- Updating student information.
- Assigning students to supervisors.
- Activating student records.
- Deactivating student records.

Student records should be deactivated rather than permanently deleted when historical attendance information needs to be preserved.

---

## 5.12 Supervisor Management

Authorized administrative users shall be able to manage supervisor accounts.

Supervisor management includes:

- Creating supervisor accounts.
- Updating supervisor information.
- Managing supervisor status.
- Assigning students to supervisors.

---

# 6. Non-Functional Requirements

## 6.1 Usability

The system should provide a simple interface that allows a student to record attendance with minimal steps.

The attendance interface should clearly communicate:

- Student selection.
- Attendance type.
- Location permission.
- Submission status.
- Success or error messages.

---

## 6.2 Responsiveness

The web interface shall be usable on different screen sizes, including:

- Desktop computers.
- Laptops.
- Tablets.
- Mobile phones.

---

## 6.3 Security

Protected system functionality shall require authentication.

The system shall enforce authorization based on user roles.

Passwords shall not be stored as plain text. Authentication credentials shall be protected using password hashing.

Sensitive configuration information, including database credentials and authentication secrets, shall be stored outside the source code using environment configuration.

---

## 6.4 Data Integrity

Attendance records shall reference existing registered students.

The system shall maintain relationships between students, supervisors, users, and attendance records.

Attendance information shall not be identified solely by student names because multiple students may have the same name.

---

## 6.5 Reliability

Attendance records shall be stored in a persistent PostgreSQL database.

The system should return clear feedback when an attendance submission succeeds or fails.

---

## 6.6 Maintainability

The application shall use a separated frontend and backend architecture.

The backend shall organize functionality into appropriate controllers, routes, middleware, configuration, and database components.

The frontend shall organize pages, services, types, components, and other reusable functionality separately.

The project shall be maintained using Git and hosted in a GitHub repository.

---

# 7. Technology Requirements

Version 1.0.0 uses the following major technologies:

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript
- JWT-based authentication

### Database

- PostgreSQL
- Prisma

### Development Tools

- Git
- GitHub
- npm
- Visual Studio Code or another compatible code editor

---

# 8. System Data Requirements

The system shall maintain information for the following main entities:

## User

Represents authenticated system users such as supervisors and administrators.

## Student

Represents registered field students.

## Attendance

Represents an attendance event recorded by a student.

The main relationship is:

User → Student → Attendance

A supervisor can be associated with multiple students, while a student can have multiple attendance records.

---

# 9. Environmental Requirements

The development environment requires:

- Node.js
- npm
- PostgreSQL
- Git

The application requires environment configuration for values such as:

- Database connection information.
- Authentication configuration.
- Backend server configuration.

Sensitive environment variables shall not be committed to the Git repository.

A `.env.example` file may be used to document the required environment variable names without exposing actual credentials.

---

# 10. MVP Acceptance Criteria

Version 1.0.0 shall be considered functional when the following core operations work correctly:

### Student Attendance

- A registered student can be found through the attendance interface.
- A student can select their registered record.
- A student can select IN or OUT.
- The system can obtain the student's location.
- The attendance request can be submitted.
- The server records the attendance timestamp.
- The attendance record is stored in PostgreSQL.
- The student receives confirmation of a successful submission.
- Invalid attendance actions are rejected.

### Authentication

- An authorized user can log in.
- Invalid login credentials are rejected.
- Protected pages cannot be accessed without authentication.
- User permissions are enforced according to role.

### Administration

- An authorized administrator can manage student records.
- Students can be assigned to supervisors.
- Supervisor accounts can be managed.
- Attendance information can be viewed through the protected dashboard.

### Database

- Student records are persisted.
- User records are persisted.
- Attendance records are persisted.
- Relationships between users, students, and attendance records are maintained.

---

# 11. Out of Scope for Version 1.0.0

The following features are not required for the current MVP:

- Mobile application.
- SMS notifications.
- Email notifications.
- Advanced attendance reports.
- Automated Excel/CSV reporting.
- Advanced analytics.
- AI-based attendance analysis.
- Blockchain integration.
- Multiple organization/tenant support.
- Offline attendance synchronization.
- Advanced geofencing.
- Payment functionality.
- Public user registration.
- Complex cloud infrastructure.

These features may be considered for future releases.

---

# 12. Future Expansion

The architecture of the system allows future versions to introduce additional functionality.

Possible future improvements include:

- Attendance reports and exports.
- Advanced dashboard statistics.
- Geofencing.
- Notifications.
- Audit logging.
- Mobile applications.
- Offline attendance support.
- Multiple organizations.
- More advanced access-control policies.
- Private organizational deployment.
- Additional attendance and field activity management features.

Future features should be introduced according to the requirements of the organization and the limitations of the existing MVP architecture.

---

# 13. Version Information

```
System: Field Student Attendance Tracking System

Release: v1.0.0

Release Type: Minimum Viable Product (MVP)

Status: Working

Primary Purpose: Field student attendance recording and monitoring
```
