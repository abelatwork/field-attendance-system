"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
// backend/src/controllers/authController.ts
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../config/jwt");
const prisma = new client_1.PrismaClient();
const login = async (req, res) => {
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
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials." });
        }
        const token = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
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
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};
exports.login = login;
//# sourceMappingURL=authController.js.map