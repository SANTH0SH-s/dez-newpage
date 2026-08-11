"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstimateController = void 0;
const estimate_schemas_1 = require("../schemas/estimate.schemas");
const pricing_calculator_service_1 = require("../services/pricing-calculator.service");
const error_middleware_1 = require("../middleware/error.middleware");
class EstimateController {
    static async calculate(req, res, next) {
        try {
            const parseResult = estimate_schemas_1.EstimateCalculateSchema.safeParse(req.body);
            if (!parseResult.success) {
                throw new error_middleware_1.ApiError(400, "BAD_REQUEST", parseResult.error.errors[0]?.message || "Invalid input");
            }
            const calculation = await pricing_calculator_service_1.PricingCalculatorService.calculateEstimate(parseResult.data);
            return res.status(200).json({
                success: true,
                data: calculation,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EstimateController = EstimateController;
