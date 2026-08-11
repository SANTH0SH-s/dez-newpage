"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQService = void 0;
const faq_repository_1 = require("../repositories/faq.repository");
const service_repository_1 = require("../repositories/service.repository");
const error_middleware_1 = require("../middleware/error.middleware");
class FAQService {
    static async getActiveFAQsByServiceId(serviceId) {
        const service = await service_repository_1.ServiceRepository.findActiveServiceById(serviceId);
        if (!service) {
            throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Service not found");
        }
        return faq_repository_1.FAQRepository.findActiveFAQsByServiceId(serviceId);
    }
}
exports.FAQService = FAQService;
