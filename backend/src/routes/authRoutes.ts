// backend/src/routes/authRoutes.ts
import { Router } from "express";
import { login, updateAccount } from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.patch("/account", authenticate, updateAccount);

export default router;
