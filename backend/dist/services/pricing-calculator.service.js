"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingCalculatorService = void 0;
const service_repository_1 = require("../repositories/service.repository");
const multiplier_repository_1 = require("../repositories/multiplier.repository");
const settings_repository_1 = require("../repositories/settings.repository");
const pricing_engine_1 = require("../pricing/pricing.engine");
const error_middleware_1 = require("../middleware/error.middleware");
class PricingCalculatorService {
    static async calculateEstimate(input) {
        const settings = await settings_repository_1.SettingsRepository.findDefaultSettings();
        if (!settings) {
            throw new error_middleware_1.ApiError(500, "INTERNAL_SERVER_ERROR", "Global settings not configured");
        }
        const multipliers = await multiplier_repository_1.MultiplierRepository.findAll();
        const serviceIds = input.services.map((s) => s.serviceId);
        const servicesData = [];
        for (const serviceId of serviceIds) {
            const sData = await service_repository_1.ServiceRepository.findActiveServiceById(serviceId);
            if (!sData) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", `Active service ${serviceId} not found`);
            }
            servicesData.push(sData);
        }
        return pricing_engine_1.PricingEngine.calculate(input, servicesData, multipliers, settings);
    }
}
exports.PricingCalculatorService = PricingCalculatorService;
