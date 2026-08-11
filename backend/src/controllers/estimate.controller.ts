import { Request, Response, NextFunction } from "express";
import { EstimateCalculateSchema } from "../schemas/estimate.schemas";
import { PricingCalculatorService } from "../services/pricing-calculator.service";
import { ApiError } from "../middleware/error.middleware";

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
        data: calculation,
      });
    } catch (error) {
      next(error);
    }
  }
}
