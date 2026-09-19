// backend/src/controllers/authController.ts
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/jwt.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();

type SerializedUser = {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  department: string | null;
  role: "SUPER_ADMIN" | "SUPERVISOR";
};

const serializeUser = (user: {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  department?: string | null;
  role: "SUPER_ADMIN" | "SUPERVISOR";
  passwordHash?: string;
}): SerializedUser => ({
  id: user.id,
  username: user.username,
  firstName: user.firstName ?? null,
  lastName: user.lastName ?? null,
  phone: user.phone ?? null,
  department: user.department ?? null,
  role: user.role,
});

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const updateAccount = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const {
      username,
      password,
      currentPassword,
      firstName,
      lastName,
      phone,
      department,
    } = req.body;
    const trimmedUsername = typeof username === "string" ? username.trim() : "";
    const trimmedPassword = typeof password === "string" ? password.trim() : "";
    const trimmedCurrentPassword =
      typeof currentPassword === "string" ? currentPassword.trim() : "";
    const trimmedFirstName =
      typeof firstName === "string" ? firstName.trim() : "";
    const trimmedLastName = typeof lastName === "string" ? lastName.trim() : "";
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedDepartment =
      typeof department === "string" ? department.trim() : "";

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const hasProfileUpdate =
      !!trimmedUsername ||
      !!trimmedFirstName ||
      !!trimmedLastName ||
      !!trimmedPhone ||
      !!trimmedDepartment;

    if (!hasProfileUpdate && !trimmedPassword) {
      return res.status(400).json({
        message:
          "Provide a username, password, or profile detail to update your account.",
      });
    }

    if (trimmedPassword) {
      if (!trimmedCurrentPassword) {
        return res.status(400).json({
          message: "Current password is required to change your password.",
        });
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        trimmedCurrentPassword,
        currentUser.passwordHash,
      );

      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          message: "Current password is incorrect.",
        });
      }
    }

    const nextUsername = trimmedUsername || currentUser.username;
    const nextFirstName = trimmedFirstName || currentUser.firstName || "";
    const nextLastName = trimmedLastName || currentUser.lastName || "";
    const nextPhone = trimmedPhone || currentUser.phone || "";
    const nextDepartment = trimmedDepartment || currentUser.department || "";

    if (nextUsername !== currentUser.username) {
      const usernameTaken = await prisma.user.findUnique({
        where: { username: nextUsername },
      });

      if (usernameTaken) {
        return res.status(409).json({ message: "Username already exists." });
      }
    }

    if (trimmedPassword && trimmedPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(nextUsername !== currentUser.username
          ? { username: nextUsername }
          : {}),
        ...(trimmedPassword
          ? { passwordHash: await bcrypt.hash(trimmedPassword, 10) }
          : {}),
        ...(nextFirstName !== (currentUser.firstName ?? "")
          ? { firstName: nextFirstName }
          : {}),
        ...(nextLastName !== (currentUser.lastName ?? "")
          ? { lastName: nextLastName }
          : {}),
        ...(nextPhone !== (currentUser.phone ?? "")
          ? { phone: nextPhone }
          : {}),
        ...(nextDepartment !== (currentUser.department ?? "")
          ? { department: nextDepartment }
          : {}),
      },
    });

    return res.status(200).json({
      message: "Account updated successfully.",
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    console.error("Update account error:", error);
    return res.status(500).json({ message: "Failed to update account." });
  }
};
