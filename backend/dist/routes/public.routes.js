"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const public_controller_1 = require("../controllers/public.controller");
const router = express_1.default.Router();
router.get("/services", public_controller_1.PublicController.getServices);
router.get("/services/:id", public_controller_1.PublicController.getServiceById);
router.get("/services/:serviceId/packages", public_controller_1.PublicController.getPackagesByServiceId);
router.get("/services/:serviceId/pricing-components", public_controller_1.PublicController.getPricingComponentsByServiceId);
router.get("/services/:serviceId/questions", public_controller_1.PublicController.getQuestionsByServiceId);
router.get("/services/:serviceId/faqs", public_controller_1.PublicController.getFAQsByServiceId);
router.get("/multipliers", public_controller_1.PublicController.getMultipliers);
router.get("/settings/public", public_controller_1.PublicController.getPublicSettings);
exports.default = router;
