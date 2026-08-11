import { Request, Response, NextFunction } from "express";
import { ServiceService } from "../services/service.service";
import { PackageService } from "../services/package.service";
import { PricingService } from "../services/pricing.service";
import { QuestionService } from "../services/question.service";
import { FAQService } from "../services/faq.service";
import { MultiplierService } from "../services/multiplier.service";
import { SettingsService } from "../services/settings.service";
import { serializeData } from "../utils/serialization";
import { serviceIdSchema, serviceIdParamSchema } from "../utils/schemas";

export class PublicController {
  static async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const services = await ServiceService.getActiveServices();
      res.status(200).json({
        success: true,
        data: serializeData(services),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getServiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = serviceIdSchema.parse(req.params);
      const service = await ServiceService.getActiveServiceById(id);
      res.status(200).json({
        success: true,
        data: serializeData(service),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPackagesByServiceId(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = serviceIdParamSchema.parse(req.params);
      const packages = await PackageService.getActivePackagesByServiceId(serviceId);
      res.status(200).json({
        success: true,
        data: serializeData(packages),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPricingComponentsByServiceId(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = serviceIdParamSchema.parse(req.params);
      const components = await PricingService.getActivePricingComponentsByServiceId(serviceId);
      res.status(200).json({
        success: true,
        data: serializeData(components),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getQuestionsByServiceId(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = serviceIdParamSchema.parse(req.params);
      const questions = await QuestionService.getActiveQuestionsByServiceId(serviceId);
      res.status(200).json({
        success: true,
        data: serializeData(questions),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFAQsByServiceId(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = serviceIdParamSchema.parse(req.params);
      const faqs = await FAQService.getActiveFAQsByServiceId(serviceId);
      res.status(200).json({
        success: true,
        data: serializeData(faqs),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMultipliers(req: Request, res: Response, next: NextFunction) {
    try {
      const multipliers = await MultiplierService.getMultipliers();
      res.status(200).json({
        success: true,
        data: serializeData(multipliers),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPublicSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.getPublicSettings();
      res.status(200).json({
        success: true,
        data: serializeData(settings),
      });
    } catch (error) {
      next(error);
    }
  }
}
