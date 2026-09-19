// backend/src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();

// 1. MUST BE PLACED BEFORE ROUTES
app.use(cors());
app.use(express.json()); // <--- Parses JSON request bodies

// 2. Routes
app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "Attendance API is operational" });
});

export default app;
