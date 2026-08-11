import { FAQRepository } from "../repositories/faq.repository";
import { ServiceRepository } from "../repositories/service.repository";
import { ApiError } from "../middleware/error.middleware";

export class FAQService {
  static async getActiveFAQsByServiceId(serviceId: string) {
    const service = await ServiceRepository.findActiveServiceById(serviceId);
    if (!service) {
      throw new ApiError(404, "NOT_FOUND", "Service not found");
    }
    return FAQRepository.findActiveFAQsByServiceId(serviceId);
  }
}
