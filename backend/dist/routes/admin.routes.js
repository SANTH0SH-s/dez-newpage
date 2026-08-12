"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Apply auth middleware to all admin routes
router.use(auth_middleware_1.authMiddleware);
// Services
router.get("/services", admin_controller_1.AdminController.getServices);
router.get("/services/:id", admin_controller_1.AdminController.getServiceById);
router.post("/services", admin_controller_1.AdminController.createService);
router.patch("/services/:id", admin_controller_1.AdminController.updateService);
router.delete("/services/:id", admin_controller_1.AdminController.deleteService);
// Packages
router.get("/services/:serviceId/packages", admin_controller_1.AdminController.getPackages);
router.post("/services/:serviceId/packages", admin_controller_1.AdminController.createPackage);
router.patch("/packages/:id", admin_controller_1.AdminController.updatePackage);
router.delete("/packages/:id", admin_controller_1.AdminController.deletePackage);
// Pricing Components
router.get("/services/:serviceId/pricing-components", admin_controller_1.AdminController.getComponents);
router.post("/services/:serviceId/pricing-components", admin_controller_1.AdminController.createComponent);
router.patch("/pricing-components/:id", admin_controller_1.AdminController.updateComponent);
router.delete("/pricing-components/:id", admin_controller_1.AdminController.deleteComponent);
// Questions
router.get("/services/:serviceId/questions", admin_controller_1.AdminController.getQuestions);
router.post("/services/:serviceId/questions", admin_controller_1.AdminController.createQuestion);
router.patch("/questions/:id", admin_controller_1.AdminController.updateQuestion);
router.delete("/questions/:id", admin_controller_1.AdminController.deleteQuestion);
// Multipliers
router.get("/multipliers", admin_controller_1.AdminController.getMultipliers);
router.post("/multipliers", admin_controller_1.AdminController.createMultiplier);
router.patch("/multipliers/:id", admin_controller_1.AdminController.updateMultiplier);
router.delete("/multipliers/:id", admin_controller_1.AdminController.deleteMultiplier);
// FAQs
router.get("/services/:serviceId/faqs", admin_controller_1.AdminController.getFAQs);
router.post("/services/:serviceId/faqs", admin_controller_1.AdminController.createFAQ);
router.patch("/faqs/:id", admin_controller_1.AdminController.updateFAQ);
router.delete("/faqs/:id", admin_controller_1.AdminController.deleteFAQ);
// Global Settings
router.get("/settings", admin_controller_1.AdminController.getSettings);
router.patch("/settings", admin_controller_1.AdminController.updateSettings);
// Audit Logs
router.get("/audit-logs", admin_controller_1.AdminController.getAuditLogs);
// Admin Estimates & Enquiries Access
const estimate_controller_1 = require("../controllers/estimate.controller");
const enquiry_controller_1 = require("../controllers/enquiry.controller");
router.get("/estimates", estimate_controller_1.EstimateController.getEstimates);
router.get("/estimates/:id", estimate_controller_1.EstimateController.getEstimateById);
router.get("/enquiries", enquiry_controller_1.EnquiryController.getEnquiries);
router.get("/enquiries/:id", enquiry_controller_1.EnquiryController.getEnquiryById);
exports.default = router;
