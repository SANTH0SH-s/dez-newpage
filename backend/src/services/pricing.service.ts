import { PricingRepository } from "../repositories/pricing.repository";
import { ServiceRepository } from "../repositories/service.repository";
import { ApiError } from "../middleware/error.middleware";

export class PricingService {
  static async getActivePricingComponentsByServiceId(serviceId: string) {
    const service = await ServiceRepository.findActiveServiceById(serviceId);
    if (!service) {
      throw new ApiError(404, "NOT_FOUND", "Service not found");
    }
    return PricingRepository.findActiveComponentsByServiceId(serviceId);
  }
}
