"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_service_1 = require("../services/admin-service.service");
const admin_package_service_1 = require("../services/admin-package.service");
const admin_pricing_service_1 = require("../services/admin-pricing.service");
const admin_question_service_1 = require("../services/admin-question.service");
const admin_multiplier_service_1 = require("../services/admin-multiplier.service");
const admin_faq_service_1 = require("../services/admin-faq.service");
const admin_settings_service_1 = require("../services/admin-settings.service");
const audit_service_1 = require("../services/audit.service");
const serialization_1 = require("../utils/serialization");
const schemas = __importStar(require("../utils/admin.schemas"));
const error_middleware_1 = require("../middleware/error.middleware");
class AdminController {
    // Helpers
    static getAdminId(req) {
        if (!req.admin?.id) {
            throw new error_middleware_1.ApiError(401, "UNAUTHORIZED", "Unauthorized: Admin identity required");
        }
        return req.admin.id;
    }
    // SERVICES CRUD
    static async getServices(req, res, next) {
        try {
            const services = await admin_service_service_1.AdminServiceService.getServices();
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(services) });
        }
        catch (error) {
            next(error);
        }
    }
    static async getServiceById(req, res, next) {
        try {
            const service = await admin_service_service_1.AdminServiceService.getServiceById(req.params.id);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(service) });
        }
        catch (error) {
            next(error);
        }
    }
    static async createService(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const validated = schemas.createServiceSchema.parse(req.body);
            const service = await admin_service_service_1.AdminServiceService.createService(adminId, validated);
            res.status(201).json({ success: true, data: (0, serialization_1.serializeData)(service) });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateService(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const validated = schemas.updateServiceSchema.parse(req.body);
            const service = await admin_service_service_1.AdminServiceService.updateService(adminId, req.params.id, validated);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(service) });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteService(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const deleted = await admin_service_service_1.AdminServiceService.deleteService(adminId, req.params.id);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(deleted) });
        }
        catch (error) {
            next(error);
        }
    }
    // PACKAGES CRUD
    static async getPackages(req, res, next) {
        try {
            const packages = await admin_package_service_1.AdminPackageService.getPackagesByServiceId(req.params.serviceId);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(packages) });
        }
        catch (error) {
            next(error);
        }
    }
    static async createPackage(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const validated = schemas.createPackageSchema.parse(req.body);
            const pkg = await admin_package_service_1.AdminPackageService.createPackage(adminId, req.params.serviceId, validated);
            res.status(201).json({ success: true, data: (0, serialization_1.serializeData)(pkg) });
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePackage(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const validated = schemas.updatePackageSchema.parse(req.body);
            const pkg = await admin_package_service_1.AdminPackageService.updatePackage(adminId, req.params.id, validated);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(pkg) });
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePackage(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const deleted = await admin_package_service_1.AdminPackageService.deletePackage(adminId, req.params.id);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(deleted) });
        }
        catch (error) {
            next(error);
        }
    }
    // PRICING COMPONENTS CRUD
    static async getComponents(req, res, next) {
        try {
            const components = await admin_pricing_service_1.AdminPricingService.getComponentsByServiceId(req.params.serviceId);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(components) });
        }
        catch (error) {
            next(error);
        }
    }
    static async createComponent(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const validated = schemas.createComponentSchema.parse(req.body);
            const component = await admin_pricing_service_1.AdminPricingService.createComponent(adminId, req.params.serviceId, validated);
            res.status(201).json({ success: true, data: (0, serialization_1.serializeData)(component) });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateComponent(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const validated = schemas.updateComponentSchema.parse(req.body);
            const component = await admin_pricing_service_1.AdminPricingService.updateComponent(adminId, req.params.id, validated);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(component) });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteComponent(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const deleted = await admin_pricing_service_1.AdminPricingService.deleteComponent(adminId, req.params.id);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(deleted) });
        }
        catch (error) {
            next(error);
        }
    }
    // QUESTIONS CRUD
    static async getQuestions(req, res, next) {
        try {
            const questions = await admin_question_service_1.AdminQuestionService.getQuestionsByServiceId(req.params.serviceId);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(questions) });
        }
        catch (error) {
            next(error);
        }
    }
    static async createQuestion(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const validated = schemas.createQuestionSchema.parse(req.body);
            const question = await admin_question_service_1.AdminQuestionService.createQuestion(adminId, req.params.serviceId, validated);
            res.status(201).json({ success: true, data: (0, serialization_1.serializeData)(question) });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateQuestion(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const validated = schemas.updateQuestionSchema.parse(req.body);
            const question = await admin_question_service_1.AdminQuestionService.updateQuestion(adminId, req.params.id, validated);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(question) });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteQuestion(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const deleted = await admin_question_service_1.AdminQuestionService.deleteQuestion(adminId, req.params.id);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(deleted) });
        }
        catch (error) {
            next(error);
        }
    }
    // MULTIPLIERS CRUD
    static async getMultipliers(req, res, next) {
        try {
            const multipliers = await admin_multiplier_service_1.AdminMultiplierService.getMultipliers();
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(multipliers) });
        }
        catch (error) {
            next(error);
        }
    }
    static async createMultiplier(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const validated = schemas.createMultiplierSchema.parse(req.body);
            const multiplier = await admin_multiplier_service_1.AdminMultiplierService.createMultiplier(adminId, validated);
            res.status(201).json({ success: true, data: (0, serialization_1.serializeData)(multiplier) });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMultiplier(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const validated = schemas.updateMultiplierSchema.parse(req.body);
            const multiplier = await admin_multiplier_service_1.AdminMultiplierService.updateMultiplier(adminId, req.params.id, validated);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(multiplier) });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteMultiplier(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const deleted = await admin_multiplier_service_1.AdminMultiplierService.deleteMultiplier(adminId, req.params.id);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(deleted) });
        }
        catch (error) {
            next(error);
        }
    }
    // FAQS CRUD
    static async getFAQs(req, res, next) {
        try {
            const faqs = await admin_faq_service_1.AdminFAQService.getFAQsByServiceId(req.params.serviceId);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(faqs) });
        }
        catch (error) {
            next(error);
        }
    }
    static async createFAQ(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const validated = schemas.createFAQSchema.parse(req.body);
            const faq = await admin_faq_service_1.AdminFAQService.createFAQ(adminId, req.params.serviceId, validated);
            res.status(201).json({ success: true, data: (0, serialization_1.serializeData)(faq) });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateFAQ(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const validated = schemas.updateFAQSchema.parse(req.body);
            const faq = await admin_faq_service_1.AdminFAQService.updateFAQ(adminId, req.params.id, validated);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(faq) });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteFAQ(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const deleted = await admin_faq_service_1.AdminFAQService.deleteFAQ(adminId, req.params.id);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(deleted) });
        }
        catch (error) {
            next(error);
        }
    }
    // GLOBAL SETTINGS
    static async getSettings(req, res, next) {
        try {
            const settings = await admin_settings_service_1.AdminSettingsService.getSettings();
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(settings) });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateSettings(req, res, next) {
        try {
            const adminId = AdminController.getAdminId(req);
            const validated = schemas.updateSettingsSchema.parse(req.body);
            const settings = await admin_settings_service_1.AdminSettingsService.updateSettings(adminId, validated);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(settings) });
        }
        catch (error) {
            next(error);
        }
    }
    // AUDIT LOGS
    static async getAuditLogs(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const logs = await audit_service_1.AuditService.getLogs(limit, offset);
            res.status(200).json({ success: true, data: (0, serialization_1.serializeData)(logs) });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
