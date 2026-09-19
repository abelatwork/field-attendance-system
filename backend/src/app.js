"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// 1. MUST BE PLACED BEFORE ROUTES
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // <--- Parses JSON request bodies
// 2. Routes
app.use("/api/attendance", attendanceRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.get("/api/health", (req, res) => {
    res
        .status(200)
        .json({ status: "ok", message: "Attendance API is operational" });
});
exports.default = app;
//# sourceMappingURL=app.js.map