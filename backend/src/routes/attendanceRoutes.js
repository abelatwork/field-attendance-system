"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/attendanceRoutes.ts
const express_1 = require("express");
const attendanceController_1 = require("../controllers/attendanceController");
const router = (0, express_1.Router)();
router.get("/search-students", attendanceController_1.searchStudents);
router.post("/check", attendanceController_1.recordAttendance);
exports.default = router;
//# sourceMappingURL=attendanceRoutes.js.map