"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceService = void 0;
const service_repository_1 = require("../repositories/service.repository");
const error_middleware_1 = require("../middleware/error.middleware");
class ServiceService {
    static async getActiveServices() {
        return service_repository_1.ServiceRepository.findActiveServices();
    }
    static async getActiveServiceById(id) {
        const service = await service_repository_1.ServiceRepository.findActiveServiceById(id);
        if (!service) {
            throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Service not found");
        }
        return service;
    }
}
exports.ServiceService = ServiceService;
