# Field Student Attendance Tracking System

## User Roles and Permissions

# 1. Introduction

The Field Student Attendance Tracking System uses role-based access to control what different users can do within the system.

The system has three main user categories:

- Student
- Supervisor
- Super Admin

Students do not create accounts or log into the system. They use the attendance interface to record their IN and OUT attendance.

Supervisors and Super Admins have authenticated accounts and access to protected portal functions.

---

# 2. Student

### Description

A student is a registered field student whose attendance is tracked by the system.

Students do not have usernames, passwords, or accounts for accessing the management portal.

Their information is registered and managed by the Super Admin.

### Student capabilities

A student can:

1. Open the attendance page.
2. Search for their registered name.
3. Select their name from the available registered students.
4. Choose an attendance action:
   - IN
   - OUT
5. Allow the browser to capture their current location.
6. Submit the attendance record.
7. Receive confirmation that the attendance was recorded.

### Student restrictions

A student cannot:

- Create an account.
- Log into the supervisor portal.
- Log into the Super Admin portal.
- Register another student.
- Edit student information.
- Delete or deactivate students.
- Edit attendance records.
- Delete attendance records.
- View administrative information.

---

# 3. Supervisor

### Description

A supervisor is an authenticated system user responsible for monitoring the students assigned to them.

Supervisors access the protected portal using their login credentials.

### Supervisor capabilities

A supervisor can:

1. Log into the system.
2. View students assigned to them.
3. View attendance information for their assigned students.
4. View the current day's attendance.
5. View whether a student is IN or OUT.
6. View attendance times.
7. Access attendance location information where provided by the system.

### Supervisor restrictions

A supervisor cannot:

- Register new students.
- Edit student information.
- Deactivate students.
- Create or manage other supervisors.
- Change student-supervisor assignments.
- Delete attendance records.
- Modify attendance records.
- Access Super Admin management functions.

---

# 4. Super Admin

### Description

The Super Admin is the highest-level administrative user in the system.

The Super Admin is responsible for managing students, supervisors, assignments, and attendance information.

### Super Admin capabilities

A Super Admin can:

1. Log into the system.
2. View system information.
3. Register students.
4. Edit student information.
5. Deactivate students.
6. Manage supervisor accounts.
7. Assign students to supervisors.
8. View attendance records.
9. Monitor attendance information across the system.

### Super Admin restrictions

The Super Admin should still follow the system's validation and security rules.

Attendance records should not be modified or deleted unnecessarily because attendance history is important for record keeping.

When a student is no longer active, the preferred approach is to deactivate the student rather than permanently delete their record.

---

# 5. Role Comparison

| Function                       | Student | Supervisor | Super Admin |
| ------------------------------ | ------- | ---------- | ----------- |
| Record attendance              | Yes     | No         | No          |
| Search/select student          | Yes     | No         | Yes         |
| Choose IN/OUT                  | Yes     | No         | No          |
| Capture location               | Yes     | No         | No          |
| View assigned students         | No      | Yes        | Yes         |
| View attendance                | No      | Yes        | Yes         |
| Register students              | No      | No         | Yes         |
| Edit students                  | No      | No         | Yes         |
| Deactivate students            | No      | No         | Yes         |
| Manage supervisors             | No      | No         | Yes         |
| Assign students to supervisors | No      | No         | Yes         |
| Access protected portal        | No      | Yes        | Yes         |

---

# 6. Authentication

Students do not require authentication because they only use the attendance interface.

Supervisor and Super Admin accounts require authentication before accessing protected portal functionality.

The backend uses JSON Web Tokens (JWT) for authenticated portal access.

After successful login, the authenticated user's role is used to determine which protected operations they are allowed to perform.

---

# 7. Authorization

Authentication determines whether a user is logged into the system.

Authorization determines what an authenticated user is allowed to do.

The system uses role-based authorization to restrict administrative operations.

For example:

- A Supervisor may view assigned students but cannot register students.
- A Super Admin may register and manage students.
- A Student does not have access to administrative endpoints.

The backend must enforce these permissions. Frontend restrictions alone are not sufficient for protecting administrative operations.

---

# 8. Student-Supervisor Relationship

Each active student may be assigned to a supervisor.

The supervisor assignment allows supervisors to monitor only the students assigned to them.

The Super Admin is responsible for creating and changing these assignments.

A student's supervisor assignment does not change the student's ability to record attendance.

---

# 9. Account and Student Status

Supervisor accounts and student records can have an active/inactive state.

Deactivating a student is preferred over permanently deleting the student because historical attendance records should remain associated with the student.

Inactive students should not be available for normal attendance selection.

---

# 10. Security Principle

The system follows the principle of least privilege.

Each role should receive only the permissions required to perform its responsibilities.

Administrative operations must be protected on the backend using authentication and authorization checks.

Sensitive authentication information such as passwords and JWT secrets must not be exposed through the frontend or committed to the Git repository.
