"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceLogs = void 0;
// backend/src/controllers/dashboardController.ts
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const prisma = new client_1.PrismaClient();
// Get Attendance Logs based on Role
const getAttendanceLogs = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        let whereClause = {};
        // If Supervisor, filter attendance only for students assigned to this supervisor
        if (userRole === client_1.Role.SUPERVISOR) {
            whereClause = {
                student: {
                    supervisorId: userId,
                },
            };
        }
        const logs = await prisma.attendance.findMany({
            where: whereClause,
            orderBy: { timestamp: "desc" },
            take: 100, // Limit latest 100 entries for performance
            include: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        supervisor: {
                            select: { username: true },
                        },
                    },
                },
            },
        });
        return res.status(200).json(logs);
    }
    catch (error) {
        console.error("Fetch attendance logs error:", error);
        return res
            .status(500)
            .json({ message: "Failed to fetch attendance logs." });
    }
};
exports.getAttendanceLogs = getAttendanceLogs;
//# sourceMappingURL=dashboardController.js.map