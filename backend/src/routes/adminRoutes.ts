// backend/src/routes/adminRoutes.ts
import { Router } from "express";
import {
  createStudent,
  getAllStudents,
  toggleStudentStatus,
  getSupervisors,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
  toggleSupervisorRole,
} from "../controllers/adminController.js";
import { getAttendanceLogs } from "../controllers/dashboardController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

// Protect all admin routes with authentication
router.use(authenticate);

// Super Admin Only Routes
router.post("/students", authorize(["SUPER_ADMIN"]), createStudent);
router.get("/students", authorize(["SUPER_ADMIN"]), getAllStudents);
router.patch("/students/:id", authorize(["SUPER_ADMIN"]), toggleStudentStatus);

router.get("/supervisors", authorize(["SUPER_ADMIN"]), getSupervisors);
router.post("/supervisors", authorize(["SUPER_ADMIN"]), createSupervisor);
router.patch("/supervisors/:id", authorize(["SUPER_ADMIN"]), updateSupervisor);
router.patch(
  "/supervisors/:id/role",
  authorize(["SUPER_ADMIN"]),
  toggleSupervisorRole,
);
router.delete("/supervisors/:id", authorize(["SUPER_ADMIN"]), deleteSupervisor);

// Dashboard Attendance Logs (SUPER_ADMIN and SUPERVISOR)
router.get(
  "/attendance-logs",
  authorize(["SUPER_ADMIN", "SUPERVISOR"]),
  getAttendanceLogs,
);

export default router;
