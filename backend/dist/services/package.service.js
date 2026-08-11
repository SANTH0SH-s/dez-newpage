"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageService = void 0;
const package_repository_1 = require("../repositories/package.repository");
const service_repository_1 = require("../repositories/service.repository");
const error_middleware_1 = require("../middleware/error.middleware");
class PackageService {
    static async getActivePackagesByServiceId(serviceId) {
        const service = await service_repository_1.ServiceRepository.findActiveServiceById(serviceId);
        if (!service) {
            throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Service not found");
        }
        return package_repository_1.PackageRepository.findActivePackagesByServiceId(serviceId);
    }
}
exports.PackageService = PackageService;
