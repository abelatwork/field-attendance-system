// backend/src/controllers/attendanceController.ts
import type { Request, Response } from "express";
import { PrismaClient, AttendanceType, StudentStatus } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Search Active Students for Autocomplete
export const searchStudents = async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || "";
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return res.status(200).json([]);
    }

    const searchTerms = normalizedQuery.split(/\s+/).filter(Boolean);

    const students = await prisma.student.findMany({
      where: {
        status: StudentStatus.ACTIVE,
        OR: searchTerms.flatMap((term) => [
          { firstName: { contains: term, mode: "insensitive" } },
          { lastName: { contains: term, mode: "insensitive" } },
        ]),
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
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// 2. Submit Attendance (IN / OUT)
export const recordAttendance = async (req: Request, res: Response) => {
  try {
    const { studentId, type, latitude, longitude, accuracy } = req.body;

    if (
      !studentId ||
      !type ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res
        .status(400)
        .json({ message: "Missing required attendance fields." });
    }

    if (!Object.values(AttendanceType).includes(type as AttendanceType)) {
      return res
        .status(400)
        .json({ message: "Invalid attendance action type." });
    }

    // Verify student exists and is ACTIVE
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.status !== StudentStatus.ACTIVE) {
      return res
        .status(404)
        .json({ message: "Student record not found or inactive." });
    }

    // Get latest attendance status to avoid invalid sequences (e.g. OUT before IN)
    const lastAttendance = await prisma.attendance.findFirst({
      where: { studentId },
      orderBy: { timestamp: "desc" },
    });

    if (
      type === AttendanceType.IN &&
      lastAttendance?.type === AttendanceType.IN
    ) {
      return res.status(400).json({ message: "You are already checked IN." });
    }

    if (
      type === AttendanceType.OUT &&
      (!lastAttendance || lastAttendance.type === AttendanceType.OUT)
    ) {
      return res
        .status(400)
        .json({ message: "You cannot check OUT without checking IN first." });
    }

    // Record attendance
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        type: type as AttendanceType,
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
  } catch (error) {
    console.error("Attendance recording error:", error);
    return res.status(500).json({ message: "Failed to record attendance." });
  }
};
