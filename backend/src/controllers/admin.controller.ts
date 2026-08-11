import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { AdminServiceService } from "../services/admin-service.service";
import { AdminPackageService } from "../services/admin-package.service";
import { AdminPricingService } from "../services/admin-pricing.service";
import { AdminQuestionService } from "../services/admin-question.service";
import { AdminMultiplierService } from "../services/admin-multiplier.service";
import { AdminFAQService } from "../services/admin-faq.service";
import { AdminSettingsService } from "../services/admin-settings.service";
import { AuditService } from "../services/audit.service";
import { serializeData } from "../utils/serialization";
import * as schemas from "../utils/admin.schemas";
import { ApiError } from "../middleware/error.middleware";

export class AdminController {
  // Helpers
  private static getAdminId(req: AuthenticatedRequest): string {
    if (!req.admin?.id) {
      throw new ApiError(401, "UNAUTHORIZED", "Unauthorized: Admin identity required");
    }
    return req.admin.id;
  }

  // SERVICES CRUD
  static async getServices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const services = await AdminServiceService.getServices();
      res.status(200).json({ success: true, data: serializeData(services) });
    } catch (error) {
      next(error);
    }
  }

  static async getServiceById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const service = await AdminServiceService.getServiceById(req.params.id);
      res.status(200).json({ success: true, data: serializeData(service) });
    } catch (error) {
      next(error);
    }
  }

  static async createService(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const validated = schemas.createServiceSchema.parse(req.body);
      const service = await AdminServiceService.createService(adminId, validated);
      res.status(201).json({ success: true, data: serializeData(service) });
    } catch (error) {
      next(error);
    }
  }

  static async updateService(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const validated = schemas.updateServiceSchema.parse(req.body);
      const service = await AdminServiceService.updateService(adminId, req.params.id, validated);
      res.status(200).json({ success: true, data: serializeData(service) });
    } catch (error) {
      next(error);
    }
  }

  static async deleteService(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const deleted = await AdminServiceService.deleteService(adminId, req.params.id);
      res.status(200).json({ success: true, data: serializeData(deleted) });
    } catch (error) {
      next(error);
    }
  }

  // PACKAGES CRUD
  static async getPackages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const packages = await AdminPackageService.getPackagesByServiceId(req.params.serviceId);
      res.status(200).json({ success: true, data: serializeData(packages) });
    } catch (error) {
      next(error);
    }
  }

  static async createPackage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const validated = schemas.createPackageSchema.parse(req.body);
      const pkg = await AdminPackageService.createPackage(adminId, req.params.serviceId, validated);
      res.status(201).json({ success: true, data: serializeData(pkg) });
    } catch (error) {
      next(error);
    }
  }

  static async updatePackage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const validated = schemas.updatePackageSchema.parse(req.body);
      const pkg = await AdminPackageService.updatePackage(adminId, req.params.id, validated);
      res.status(200).json({ success: true, data: serializeData(pkg) });
    } catch (error) {
      next(error);
    }
  }

  static async deletePackage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const deleted = await AdminPackageService.deletePackage(adminId, req.params.id);
      res.status(200).json({ success: true, data: serializeData(deleted) });
    } catch (error) {
      next(error);
    }
  }

  // PRICING COMPONENTS CRUD
  static async getComponents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const components = await AdminPricingService.getComponentsByServiceId(req.params.serviceId);
      res.status(200).json({ success: true, data: serializeData(components) });
    } catch (error) {
      next(error);
    }
  }

  static async createComponent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const validated = schemas.createComponentSchema.parse(req.body);
      const component = await AdminPricingService.createComponent(adminId, req.params.serviceId, validated);
      res.status(201).json({ success: true, data: serializeData(component) });
    } catch (error) {
      next(error);
    }
  }

  static async updateComponent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const validated = schemas.updateComponentSchema.parse(req.body);
      const component = await AdminPricingService.updateComponent(adminId, req.params.id, validated);
      res.status(200).json({ success: true, data: serializeData(component) });
    } catch (error) {
      next(error);
    }
  }

  static async deleteComponent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const deleted = await AdminPricingService.deleteComponent(adminId, req.params.id);
      res.status(200).json({ success: true, data: serializeData(deleted) });
    } catch (error) {
      next(error);
    }
  }

  // QUESTIONS CRUD
  static async getQuestions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const questions = await AdminQuestionService.getQuestionsByServiceId(req.params.serviceId);
      res.status(200).json({ success: true, data: serializeData(questions) });
    } catch (error) {
      next(error);
    }
  }

  static async createQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const validated = schemas.createQuestionSchema.parse(req.body);
      const question = await AdminQuestionService.createQuestion(adminId, req.params.serviceId, validated);
      res.status(201).json({ success: true, data: serializeData(question) });
    } catch (error) {
      next(error);
    }
  }

  static async updateQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const validated = schemas.updateQuestionSchema.parse(req.body);
      const question = await AdminQuestionService.updateQuestion(adminId, req.params.id, validated);
      res.status(200).json({ success: true, data: serializeData(question) });
    } catch (error) {
      next(error);
    }
  }

  static async deleteQuestion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const deleted = await AdminQuestionService.deleteQuestion(adminId, req.params.id);
      res.status(200).json({ success: true, data: serializeData(deleted) });
    } catch (error) {
      next(error);
    }
  }

  // MULTIPLIERS CRUD
  static async getMultipliers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const multipliers = await AdminMultiplierService.getMultipliers();
      res.status(200).json({ success: true, data: serializeData(multipliers) });
    } catch (error) {
      next(error);
    }
  }

  static async createMultiplier(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const validated = schemas.createMultiplierSchema.parse(req.body);
      const multiplier = await AdminMultiplierService.createMultiplier(adminId, validated);
      res.status(201).json({ success: true, data: serializeData(multiplier) });
    } catch (error) {
      next(error);
    }
  }

  static async updateMultiplier(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const validated = schemas.updateMultiplierSchema.parse(req.body);
      const multiplier = await AdminMultiplierService.updateMultiplier(adminId, req.params.id, validated);
      res.status(200).json({ success: true, data: serializeData(multiplier) });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMultiplier(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const deleted = await AdminMultiplierService.deleteMultiplier(adminId, req.params.id);
      res.status(200).json({ success: true, data: serializeData(deleted) });
    } catch (error) {
      next(error);
    }
  }

  // FAQS CRUD
  static async getFAQs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const faqs = await AdminFAQService.getFAQsByServiceId(req.params.serviceId);
      res.status(200).json({ success: true, data: serializeData(faqs) });
    } catch (error) {
      next(error);
    }
  }

  static async createFAQ(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const validated = schemas.createFAQSchema.parse(req.body);
      const faq = await AdminFAQService.createFAQ(adminId, req.params.serviceId, validated);
      res.status(201).json({ success: true, data: serializeData(faq) });
    } catch (error) {
      next(error);
    }
  }

  static async updateFAQ(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const validated = schemas.updateFAQSchema.parse(req.body);
      const faq = await AdminFAQService.updateFAQ(adminId, req.params.id, validated);
      res.status(200).json({ success: true, data: serializeData(faq) });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFAQ(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const deleted = await AdminFAQService.deleteFAQ(adminId, req.params.id);
      res.status(200).json({ success: true, data: serializeData(deleted) });
    } catch (error) {
      next(error);
    }
  }

  // GLOBAL SETTINGS
  static async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await AdminSettingsService.getSettings();
      res.status(200).json({ success: true, data: serializeData(settings) });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminId = AdminController.getAdminId(req);
      const validated = schemas.updateSettingsSchema.parse(req.body);
      const settings = await AdminSettingsService.updateSettings(adminId, validated);
      res.status(200).json({ success: true, data: serializeData(settings) });
    } catch (error) {
      next(error);
    }
  }

  // AUDIT LOGS
  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const logs = await AuditService.getLogs(limit, offset);
      res.status(200).json({ success: true, data: serializeData(logs) });
    } catch (error) {
      next(error);
    }
  }
}
