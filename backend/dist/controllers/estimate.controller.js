"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstimateController = void 0;
const estimate_schemas_1 = require("../schemas/estimate.schemas");
const pricing_calculator_service_1 = require("../services/pricing-calculator.service");
const estimate_service_1 = require("../services/estimate.service");
const estimate_repository_1 = require("../repositories/estimate.repository");
const error_middleware_1 = require("../middleware/error.middleware");
const serialization_1 = require("../utils/serialization");
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
                data: (0, serialization_1.serializeData)(calculation),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const parseResult = estimate_schemas_1.EstimateCreateSchema.safeParse(req.body);
            if (!parseResult.success) {
                throw new error_middleware_1.ApiError(400, "BAD_REQUEST", parseResult.error.errors[0]?.message || "Invalid input");
            }
            const result = await estimate_service_1.EstimateService.createEstimate(parseResult.data);
            return res.status(201).json({
                success: true,
                data: (0, serialization_1.serializeData)(result.estimate),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getEstimateById(req, res, next) {
        try {
            const { id } = req.params;
            const estimate = await estimate_service_1.EstimateService.getEstimateById(id);
            return res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(estimate),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getEstimates(req, res, next) {
        try {
            const page = parseInt(req.query.page || "1", 10);
            const limit = parseInt(req.query.limit || "10", 10);
            const result = await estimate_service_1.EstimateService.getEstimatesList(page, limit);
            return res.status(200).json({
                success: true,
                data: {
                    total: result.total,
                    items: (0, serialization_1.serializeData)(result.items),
                    page: result.page,
                    limit: result.limit,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteEstimate(req, res, next) {
        try {
            const { id } = req.params;
            await estimate_repository_1.EstimateRepository.delete(id);
            return res.status(200).json({
                success: true,
                message: "Estimate deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await estimate_repository_1.EstimateRepository.updateStatus(id, status);
            return res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(result),
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EstimateController = EstimateController;
