import express from "express";
import { PublicController } from "../controllers/public.controller";

const router = express.Router();

router.get("/services", PublicController.getServices);
router.get("/services/:id", PublicController.getServiceById);
router.get("/services/:serviceId/packages", PublicController.getPackagesByServiceId);
router.get("/services/:serviceId/pricing-components", PublicController.getPricingComponentsByServiceId);
router.get("/services/:serviceId/questions", PublicController.getQuestionsByServiceId);
router.get("/services/:serviceId/faqs", PublicController.getFAQsByServiceId);
router.get("/multipliers", PublicController.getMultipliers);
router.get("/settings/public", PublicController.getPublicSettings);

export default router;
