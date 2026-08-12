import { Request, Response, NextFunction } from "express";
import { EstimateCalculateSchema, EstimateCreateSchema } from "../schemas/estimate.schemas";
import { PricingCalculatorService } from "../services/pricing-calculator.service";
import { EstimateService } from "../services/estimate.service";
import { EstimateRepository } from "../repositories/estimate.repository";
import { ApiError } from "../middleware/error.middleware";
import { serializeData } from "../utils/serialization";

export class EstimateController {
  static async calculate(req: Request, res: Response, next: NextFunction) {
    try {
      const parseResult = EstimateCalculateSchema.safeParse(req.body);
      if (!parseResult.success) {
        throw new ApiError(400, "BAD_REQUEST", parseResult.error.errors[0]?.message || "Invalid input");
      }

      const calculation = await PricingCalculatorService.calculateEstimate(parseResult.data);

      return res.status(200).json({
        success: true,
        data: serializeData(calculation),
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parseResult = EstimateCreateSchema.safeParse(req.body);
      if (!parseResult.success) {
        throw new ApiError(400, "BAD_REQUEST", parseResult.error.errors[0]?.message || "Invalid input");
      }

      const result = await EstimateService.createEstimate(parseResult.data);

      return res.status(201).json({
        success: true,
        data: serializeData(result.estimate),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEstimateById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const estimate = await EstimateService.getEstimateById(id);
      return res.status(200).json({
        success: true,
        data: serializeData(estimate),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEstimates(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || "1", 10);
      const limit = parseInt(req.query.limit as string || "10", 10);
      const result = await EstimateService.getEstimatesList(page, limit);
      return res.status(200).json({
        success: true,
        data: {
          total: result.total,
          items: serializeData(result.items),
          page: result.page,
          limit: result.limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteEstimate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await EstimateRepository.delete(id);
      return res.status(200).json({
        success: true,
        message: "Estimate deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await EstimateRepository.updateStatus(id, status);
      return res.status(200).json({
        success: true,
        data: serializeData(result),
      });
    } catch (error) {
      next(error);
    }
  }
}
