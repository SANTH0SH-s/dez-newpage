"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
const pricing_repository_1 = require("../repositories/pricing.repository");
const service_repository_1 = require("../repositories/service.repository");
const error_middleware_1 = require("../middleware/error.middleware");
class PricingService {
    static async getActivePricingComponentsByServiceId(serviceId) {
        const service = await service_repository_1.ServiceRepository.findActiveServiceById(serviceId);
        if (!service) {
            throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Service not found");
        }
        return pricing_repository_1.PricingRepository.findActiveComponentsByServiceId(serviceId);
    }
}
exports.PricingService = PricingService;
