/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import { AdminController } from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware as any);

// Services
router.get("/services", AdminController.getServices as any);
router.get("/services/:id", AdminController.getServiceById as any);
router.post("/services", AdminController.createService as any);
router.patch("/services/:id", AdminController.updateService as any);
router.delete("/services/:id", AdminController.deleteService as any);

// Packages
router.get("/services/:serviceId/packages", AdminController.getPackages as any);
router.post("/services/:serviceId/packages", AdminController.createPackage as any);
router.patch("/packages/:id", AdminController.updatePackage as any);
router.delete("/packages/:id", AdminController.deletePackage as any);

// Pricing Components
router.get("/services/:serviceId/pricing-components", AdminController.getComponents as any);
router.post("/services/:serviceId/pricing-components", AdminController.createComponent as any);
router.patch("/pricing-components/:id", AdminController.updateComponent as any);
router.delete("/pricing-components/:id", AdminController.deleteComponent as any);

// Questions
router.get("/services/:serviceId/questions", AdminController.getQuestions as any);
router.post("/services/:serviceId/questions", AdminController.createQuestion as any);
router.patch("/questions/:id", AdminController.updateQuestion as any);
router.delete("/questions/:id", AdminController.deleteQuestion as any);

// Multipliers
router.get("/multipliers", AdminController.getMultipliers as any);
router.post("/multipliers", AdminController.createMultiplier as any);
router.patch("/multipliers/:id", AdminController.updateMultiplier as any);
router.delete("/multipliers/:id", AdminController.deleteMultiplier as any);

// FAQs
router.get("/services/:serviceId/faqs", AdminController.getFAQs as any);
router.post("/services/:serviceId/faqs", AdminController.createFAQ as any);
router.patch("/faqs/:id", AdminController.updateFAQ as any);
router.delete("/faqs/:id", AdminController.deleteFAQ as any);

// Global Settings
router.get("/settings", AdminController.getSettings as any);
router.patch("/settings", AdminController.updateSettings as any);

// Audit Logs
router.get("/audit-logs", AdminController.getAuditLogs as any);

export default router;
