// backend/src/controllers/adminController.ts
import { Response } from "express";
import { PrismaClient, StudentStatus, Role } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

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
    const { id } = req.params;

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

// 4. Get List of Available Supervisors
export const getSupervisors = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const supervisors = await prisma.user.findMany({
      where: { role: Role.SUPERVISOR },
      select: { id: true, username: true },
    });

    return res.status(200).json(supervisors);
  } catch (error) {
    console.error("Fetch supervisors error:", error);
    return res.status(500).json({ message: "Failed to fetch supervisors." });
  }
};
