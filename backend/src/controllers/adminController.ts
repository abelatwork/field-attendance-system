// backend/src/controllers/adminController.ts
import bcrypt from "bcryptjs";
import type { Response } from "express";
import { PrismaClient, StudentStatus, Role } from "@prisma/client";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();

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

const normalizeRole = (value: unknown): Role => {
  if (value === "SUPER_ADMIN") return Role.SUPER_ADMIN;
  if (value === "SUPERVISOR") return Role.SUPERVISOR;
  throw new Error("Invalid role value");
};

const getRouteId = (value: string | string[] | undefined): string | null => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const firstValue = value[0];
    if (typeof firstValue === "string") return firstValue;
  }
  return null;
};

// 1. Register a new Student (Admin Only)
export const createStudent = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
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
  } catch (error) {
    console.error("Create student error:", error);
    return res.status(500).json({ message: "Failed to create student." });
  }
};

// 2. Get All Students with Pagination/Filter (Admin Only)
export const getAllStudents = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
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
  } catch (error) {
    console.error("Fetch students error:", error);
    return res.status(500).json({ message: "Failed to fetch students." });
  }
};

// 3. Toggle Student Status (Soft Deactivate/Reactivate)
export const toggleStudentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const id = getRouteId(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Student id is required." });
    }

    const student = await prisma.student.findUnique({ where: { id } });

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const newStatus =
      student.status === StudentStatus.ACTIVE
        ? StudentStatus.INACTIVE
        : StudentStatus.ACTIVE;

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
  } catch (error) {
    console.error("Status toggle error:", error);
    return res
      .status(500)
      .json({ message: "Failed to update student status." });
  }
};

// 4. Get List of Supervisors and Admin Accounts
export const getSupervisors = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const supervisors = await prisma.user.findMany({
      where: {
        role: { in: [Role.SUPERVISOR, Role.SUPER_ADMIN] },
      },
      select: supervisorSelect,
      orderBy: { username: "asc" },
    });
    return res.status(200).json(supervisors);
  } catch (error) {
    console.error("Fetch supervisors error:", error);
    return res.status(500).json({ message: "Failed to fetch supervisors" });
  }
};

export const createSupervisor = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const {
      username,
      password,
      firstName,
      lastName,
      phone,
      department,
      role = "SUPERVISOR",
    } = req.body;

    if (
      !username ||
      !password ||
      !firstName ||
      !lastName ||
      !phone ||
      !department
    ) {
      return res.status(400).json({
        message:
          "Username, password, first name, last name, phone number, and department are required.",
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

    const passwordHash = await bcrypt.hash(password, 10);

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
  } catch (error) {
    console.error("Create supervisor error:", error);
    return res
      .status(500)
      .json({ message: "Failed to create supervisor account." });
  }
};

export const updateSupervisor = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const id = getRouteId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Supervisor id is required." });
    }

    const { username, password, firstName, lastName, phone, department, role } =
      req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ message: "Supervisor not found." });
    }

    if (username && username !== existingUser.username) {
      const usernameTaken = await prisma.user.findUnique({
        where: { username },
      });
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
        ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
      },
      select: supervisorSelect,
    });

    return res.status(200).json({
      message: "Supervisor profile updated successfully.",
      supervisor: updatedSupervisor,
    });
  } catch (error) {
    console.error("Update supervisor error:", error);
    return res.status(500).json({ message: "Failed to update supervisor." });
  }
};

export const toggleSupervisorRole = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const id = getRouteId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Supervisor id is required." });
    }

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
  } catch (error) {
    console.error("Toggle supervisor role error:", error);
    if (error instanceof Error && error.message === "Invalid role value") {
      return res
        .status(400)
        .json({ message: "Role must be SUPER_ADMIN or SUPERVISOR." });
    }
    return res
      .status(500)
      .json({ message: "Failed to update supervisor role." });
  }
};

export const deleteSupervisor = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const id = getRouteId(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "Supervisor id is required." });
    }

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
  } catch (error) {
    console.error("Delete supervisor error:", error);
    return res.status(500).json({ message: "Failed to delete supervisor." });
  }
};
