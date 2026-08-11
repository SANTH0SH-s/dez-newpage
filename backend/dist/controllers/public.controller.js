"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const service_service_1 = require("../services/service.service");
const package_service_1 = require("../services/package.service");
const pricing_service_1 = require("../services/pricing.service");
const question_service_1 = require("../services/question.service");
const faq_service_1 = require("../services/faq.service");
const multiplier_service_1 = require("../services/multiplier.service");
const settings_service_1 = require("../services/settings.service");
const serialization_1 = require("../utils/serialization");
const schemas_1 = require("../utils/schemas");
class PublicController {
    static async getServices(req, res, next) {
        try {
            const services = await service_service_1.ServiceService.getActiveServices();
            res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(services),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getServiceById(req, res, next) {
        try {
            const { id } = schemas_1.serviceIdSchema.parse(req.params);
            const service = await service_service_1.ServiceService.getActiveServiceById(id);
            res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(service),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getPackagesByServiceId(req, res, next) {
        try {
            const { serviceId } = schemas_1.serviceIdParamSchema.parse(req.params);
            const packages = await package_service_1.PackageService.getActivePackagesByServiceId(serviceId);
            res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(packages),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getPricingComponentsByServiceId(req, res, next) {
        try {
            const { serviceId } = schemas_1.serviceIdParamSchema.parse(req.params);
            const components = await pricing_service_1.PricingService.getActivePricingComponentsByServiceId(serviceId);
            res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(components),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getQuestionsByServiceId(req, res, next) {
        try {
            const { serviceId } = schemas_1.serviceIdParamSchema.parse(req.params);
            const questions = await question_service_1.QuestionService.getActiveQuestionsByServiceId(serviceId);
            res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(questions),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getFAQsByServiceId(req, res, next) {
        try {
            const { serviceId } = schemas_1.serviceIdParamSchema.parse(req.params);
            const faqs = await faq_service_1.FAQService.getActiveFAQsByServiceId(serviceId);
            res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(faqs),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMultipliers(req, res, next) {
        try {
            const multipliers = await multiplier_service_1.MultiplierService.getMultipliers();
            res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(multipliers),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getPublicSettings(req, res, next) {
        try {
            const settings = await settings_service_1.SettingsService.getPublicSettings();
            res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(settings),
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PublicController = PublicController;
