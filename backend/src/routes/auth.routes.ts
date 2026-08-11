/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/login", AuthController.login);
router.get("/me", authMiddleware as any, AuthController.me as any);
router.post("/logout", authMiddleware as any, AuthController.logout as any);

export default router;
