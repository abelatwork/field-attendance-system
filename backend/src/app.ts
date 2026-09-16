// Update backend/src/app.ts to add attendance routes
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import attendanceRoutes from "./routes/attendanceRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/attendance", attendanceRoutes);

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "Attendance API is operational" });
});

export default app;
