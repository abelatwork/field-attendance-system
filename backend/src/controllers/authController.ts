// backend/src/controllers/authController.ts
import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/jwt.js";

const prisma = new PrismaClient();

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
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        department: user.department,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
