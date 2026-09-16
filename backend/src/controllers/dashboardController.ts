// backend/src/controllers/dashboardController.ts
import { Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// Get Attendance Logs based on Role
export const getAttendanceLogs = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    let whereClause = {};

    // If Supervisor, filter attendance only for students assigned to this supervisor
    if (userRole === Role.SUPERVISOR) {
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
  } catch (error) {
    console.error("Fetch attendance logs error:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch attendance logs." });
  }
};
