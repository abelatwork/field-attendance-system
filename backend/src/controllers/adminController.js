"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupervisor = exports.toggleSupervisorRole = exports.updateSupervisor = exports.createSupervisor = exports.getSupervisors = exports.toggleStudentStatus = exports.getAllStudents = exports.createStudent = void 0;
// backend/src/controllers/adminController.ts
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const prisma = new client_1.PrismaClient();
const supervisorSelect = {
    id: true,
    username: true,
    firstName: true,
    lastName: true,
    phone: true,
    department: true,
    role: true,
    createdAt: true,
    updatedAt: true,
};
const normalizeRole = (value) => {
    if (value === "SUPER_ADMIN")
        return client_1.Role.SUPER_ADMIN;
    if (value === "SUPERVISOR")
        return client_1.Role.SUPERVISOR;
    throw new Error("Invalid role value");
};
// 1. Register a new Student (Admin Only)
const createStudent = async (req, res) => {
    try {
        const { firstName, lastName, phone, supervisorId } = req.body;
        if (!firstName || !lastName || !phone) {
            return res
                .status(400)
                .json({ message: "First name, last name, and phone are required." });
        }
        const student = await prisma.student.create({
            data: {
                firstName,
                lastName,
                phone,
                supervisorId: supervisorId || null,
            },
            include: {
                supervisor: {
                    select: { id: true, username: true },
                },
            },
        });
        return res
            .status(201)
            .json({ message: "Student registered successfully", student });
    }
    catch (error) {
        console.error("Create student error:", error);
        return res.status(500).json({ message: "Failed to create student." });
    }
};
exports.createStudent = createStudent;
// 2. Get All Students with Pagination/Filter (Admin Only)
const getAllStudents = async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                supervisor: {
                    select: { id: true, username: true },
                },
            },
        });
        return res.status(200).json(students);
    }
    catch (error) {
        console.error("Fetch students error:", error);
        return res.status(500).json({ message: "Failed to fetch students." });
    }
};
exports.getAllStudents = getAllStudents;
// 3. Toggle Student Status (Soft Deactivate/Reactivate)
const toggleStudentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await prisma.student.findUnique({ where: { id } });
        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }
        const newStatus = student.status === client_1.StudentStatus.ACTIVE
            ? client_1.StudentStatus.INACTIVE
            : client_1.StudentStatus.ACTIVE;
        const updatedStudent = await prisma.student.update({
            where: { id },
            data: { status: newStatus },
            include: {
                supervisor: {
                    select: { id: true, username: true },
                },
            },
        });
        return res.status(200).json({
            message: `Student set to ${newStatus}`,
            student: updatedStudent,
        });
    }
    catch (error) {
        console.error("Status toggle error:", error);
        return res
            .status(500)
            .json({ message: "Failed to update student status." });
    }
};
exports.toggleStudentStatus = toggleStudentStatus;
// 4. Get List of Supervisors and Admin Accounts
const getSupervisors = async (req, res) => {
    try {
        const supervisors = await prisma.user.findMany({
            where: {
                role: { in: [client_1.Role.SUPERVISOR, client_1.Role.SUPER_ADMIN] },
            },
            select: supervisorSelect,
            orderBy: { username: "asc" },
        });
        return res.status(200).json(supervisors);
    }
    catch (error) {
        console.error("Fetch supervisors error:", error);
        return res.status(500).json({ message: "Failed to fetch supervisors" });
    }
};
exports.getSupervisors = getSupervisors;
const createSupervisor = async (req, res) => {
    try {
        const { username, password, firstName, lastName, phone, department, role = "SUPERVISOR", } = req.body;
        if (!username || !password || !firstName || !lastName || !phone || !department) {
            return res.status(400).json({
                message: "Username, password, first name, last name, phone number, and department are required.",
            });
        }
        if (typeof password !== "string" || password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters long." });
        }
        const normalizedRole = normalizeRole(role);
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ message: "Username already exists." });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const supervisor = await prisma.user.create({
            data: {
                username,
                passwordHash,
                firstName,
                lastName,
                phone,
                department,
                role: normalizedRole,
            },
            select: supervisorSelect,
        });
        return res.status(201).json({
            message: "Supervisor account created successfully.",
            supervisor,
        });
    }
    catch (error) {
        console.error("Create supervisor error:", error);
        return res
            .status(500)
            .json({ message: "Failed to create supervisor account." });
    }
};
exports.createSupervisor = createSupervisor;
const updateSupervisor = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, firstName, lastName, phone, department, role, } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return res.status(404).json({ message: "Supervisor not found." });
        }
        if (username && username !== existingUser.username) {
            const usernameTaken = await prisma.user.findUnique({ where: { username } });
            if (usernameTaken) {
                return res.status(409).json({ message: "Username already exists." });
            }
        }
        if (password && password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters long." });
        }
        const updatedSupervisor = await prisma.user.update({
            where: { id },
            data: {
                ...(username ? { username } : {}),
                ...(firstName !== undefined ? { firstName } : {}),
                ...(lastName !== undefined ? { lastName } : {}),
                ...(phone !== undefined ? { phone } : {}),
                ...(department !== undefined ? { department } : {}),
                ...(role ? { role: normalizeRole(role) } : {}),
                ...(password ? { passwordHash: await bcryptjs_1.default.hash(password, 10) } : {}),
            },
            select: supervisorSelect,
        });
        return res.status(200).json({
            message: "Supervisor profile updated successfully.",
            supervisor: updatedSupervisor,
        });
    }
    catch (error) {
        console.error("Update supervisor error:", error);
        return res.status(500).json({ message: "Failed to update supervisor." });
    }
};
exports.updateSupervisor = updateSupervisor;
const toggleSupervisorRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({ message: "Role is required." });
        }
        const supervisor = await prisma.user.findUnique({ where: { id } });
        if (!supervisor) {
            return res.status(404).json({ message: "Supervisor not found." });
        }
        if (req.user?.userId === supervisor.id) {
            return res
                .status(400)
                .json({ message: "You cannot change your own administrator role." });
        }
        const nextRole = normalizeRole(role);
        const updatedSupervisor = await prisma.user.update({
            where: { id },
            data: { role: nextRole },
            select: supervisorSelect,
        });
        return res.status(200).json({
            message: `Supervisor role updated to ${nextRole}.`,
            supervisor: updatedSupervisor,
        });
    }
    catch (error) {
        console.error("Toggle supervisor role error:", error);
        if (error instanceof Error && error.message === "Invalid role value") {
            return res.status(400).json({ message: "Role must be SUPER_ADMIN or SUPERVISOR." });
        }
        return res.status(500).json({ message: "Failed to update supervisor role." });
    }
};
exports.toggleSupervisorRole = toggleSupervisorRole;
const deleteSupervisor = async (req, res) => {
    try {
        const { id } = req.params;
        const supervisor = await prisma.user.findUnique({ where: { id } });
        if (!supervisor) {
            return res.status(404).json({ message: "Supervisor not found." });
        }
        if (req.user?.userId === supervisor.id) {
            return res
                .status(400)
                .json({ message: "You cannot delete your own account." });
        }
        await prisma.user.delete({ where: { id } });
        return res.status(200).json({
            message: "Supervisor deleted successfully.",
            deletedId: id,
        });
    }
    catch (error) {
        console.error("Delete supervisor error:", error);
        return res.status(500).json({ message: "Failed to delete supervisor." });
    }
};
exports.deleteSupervisor = deleteSupervisor;
//# sourceMappingURL=adminController.js.map