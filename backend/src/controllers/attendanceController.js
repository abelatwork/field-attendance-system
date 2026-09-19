"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAttendance = exports.searchStudents = void 0;
// backend/src/controllers/attendanceController.ts
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// 1. Search Active Students for Autocomplete
const searchStudents = async (req, res) => {
    try {
        const query = req.query.q || "";
        if (!query.trim()) {
            return res.status(200).json([]);
        }
        const students = await prisma.student.findMany({
            where: {
                status: client_1.StudentStatus.ACTIVE,
                OR: [
                    { firstName: { contains: query, mode: "insensitive" } },
                    { lastName: { contains: query, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
            },
            take: 10,
        });
        return res.status(200).json(students);
    }
    catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.searchStudents = searchStudents;
// 2. Submit Attendance (IN / OUT)
const recordAttendance = async (req, res) => {
    try {
        const { studentId, type, latitude, longitude, accuracy } = req.body;
        if (!studentId ||
            !type ||
            latitude === undefined ||
            longitude === undefined) {
            return res
                .status(400)
                .json({ message: "Missing required attendance fields." });
        }
        if (!Object.values(client_1.AttendanceType).includes(type)) {
            return res
                .status(400)
                .json({ message: "Invalid attendance action type." });
        }
        // Verify student exists and is ACTIVE
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });
        if (!student || student.status !== client_1.StudentStatus.ACTIVE) {
            return res
                .status(404)
                .json({ message: "Student record not found or inactive." });
        }
        // Get latest attendance status to avoid invalid sequences (e.g. OUT before IN)
        const lastAttendance = await prisma.attendance.findFirst({
            where: { studentId },
            orderBy: { timestamp: "desc" },
        });
        if (type === client_1.AttendanceType.IN &&
            lastAttendance?.type === client_1.AttendanceType.IN) {
            return res.status(400).json({ message: "You are already checked IN." });
        }
        if (type === client_1.AttendanceType.OUT &&
            (!lastAttendance || lastAttendance.type === client_1.AttendanceType.OUT)) {
            return res
                .status(400)
                .json({ message: "You cannot check OUT without checking IN first." });
        }
        // Record attendance
        const attendance = await prisma.attendance.create({
            data: {
                studentId,
                type: type,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                accuracy: accuracy ? parseFloat(accuracy) : null,
            },
            include: {
                student: {
                    select: { firstName: true, lastName: true },
                },
            },
        });
        return res.status(201).json({
            message: `Successfully checked ${type}!`,
            data: attendance,
        });
    }
    catch (error) {
        console.error("Attendance recording error:", error);
        return res.status(500).json({ message: "Failed to record attendance." });
    }
};
exports.recordAttendance = recordAttendance;
//# sourceMappingURL=attendanceController.js.map