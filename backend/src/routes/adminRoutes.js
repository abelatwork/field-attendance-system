"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/adminRoutes.ts
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Protect all admin routes with authentication
router.use(authMiddleware_1.authenticate);
// Super Admin Only Routes
router.post("/students", (0, authMiddleware_1.authorize)(["SUPER_ADMIN"]), adminController_1.createStudent);
router.get("/students", (0, authMiddleware_1.authorize)(["SUPER_ADMIN"]), adminController_1.getAllStudents);
router.patch("/students/:id", (0, authMiddleware_1.authorize)(["SUPER_ADMIN"]), adminController_1.toggleStudentStatus);
router.get("/supervisors", (0, authMiddleware_1.authorize)(["SUPER_ADMIN"]), adminController_1.getSupervisors);
router.post("/supervisors", (0, authMiddleware_1.authorize)(["SUPER_ADMIN"]), adminController_1.createSupervisor);
router.patch("/supervisors/:id", (0, authMiddleware_1.authorize)(["SUPER_ADMIN"]), adminController_1.updateSupervisor);
router.patch("/supervisors/:id/role", (0, authMiddleware_1.authorize)(["SUPER_ADMIN"]), adminController_1.toggleSupervisorRole);
router.delete("/supervisors/:id", (0, authMiddleware_1.authorize)(["SUPER_ADMIN"]), adminController_1.deleteSupervisor);
// Dashboard Attendance Logs (SUPER_ADMIN and SUPERVISOR)
router.get("/attendance-logs", (0, authMiddleware_1.authorize)(["SUPER_ADMIN", "SUPERVISOR"]), dashboardController_1.getAttendanceLogs);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map