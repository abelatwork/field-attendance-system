// backend/src/routes/adminRoutes.ts
import { Router } from "express";
import {
  createStudent,
  getAllStudents,
  toggleStudentStatus,
  getSupervisors,
} from "../controllers/adminController";
import { getAttendanceLogs } from "../controllers/dashboardController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

// Protect all admin routes with authentication
router.use(authenticate);

// Super Admin Only Routes
router.post("/students", authorize(["SUPER_ADMIN"]), createStudent);
router.get("/students", authorize(["SUPER_ADMIN"]), getAllStudents);
router.patch(
  "/students/:id/status",
  authorize(["SUPER_ADMIN"]),
  toggleStudentStatus,
);
router.get("/supervisors", authorize(["SUPER_ADMIN"]), getSupervisors);

// Dashboard Attendance Logs (Accessible to both SUPER_ADMIN and SUPERVISOR)
router.get(
  "/attendance-logs",
  authorize(["SUPER_ADMIN", "SUPERVISOR"]),
  getAttendanceLogs,
);

export default router;
