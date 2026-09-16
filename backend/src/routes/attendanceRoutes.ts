// backend/src/routes/attendanceRoutes.ts
import { Router } from "express";
import {
  searchStudents,
  recordAttendance,
} from "../controllers/attendanceController";

const router = Router();

router.get("/search-students", searchStudents);
router.post("/check", recordAttendance);

export default router;
