"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
// backend/src/middleware/authMiddleware.ts
const express_1 = require("express");
const jwt_1 = require("../config/jwt");
// 1. Verify User is Authenticated
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization token required." });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};
exports.authenticate = authenticate;
// 2. Authorize Specific Roles
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res
                .status(403)
                .json({ message: "Access denied. Insufficient permissions." });
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=authMiddleware.js.map