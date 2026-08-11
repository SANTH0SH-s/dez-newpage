import { PackageRepository } from "../repositories/package.repository";
import { ServiceRepository } from "../repositories/service.repository";
import { ApiError } from "../middleware/error.middleware";

export class PackageService {
  static async getActivePackagesByServiceId(serviceId: string) {
    const service = await ServiceRepository.findActiveServiceById(serviceId);
    if (!service) {
      throw new ApiError(404, "NOT_FOUND", "Service not found");
    }
    return PackageRepository.findActivePackagesByServiceId(serviceId);
  }
}
