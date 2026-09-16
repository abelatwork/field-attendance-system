// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../config/jwt";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// 1. Verify User is Authenticated
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token required." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// 2. Authorize Specific Roles
export const authorize = (allowedRoles: ("SUPER_ADMIN" | "SUPERVISOR")[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};
