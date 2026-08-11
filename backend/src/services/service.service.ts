import { ServiceRepository } from "../repositories/service.repository";
import { ApiError } from "../middleware/error.middleware";

export class ServiceService {
  static async getActiveServices() {
    return ServiceRepository.findActiveServices();
  }

  static async getActiveServiceById(id: string) {
    const service = await ServiceRepository.findActiveServiceById(id);
    if (!service) {
      throw new ApiError(404, "NOT_FOUND", "Service not found");
    }
    return service;
  }
}
