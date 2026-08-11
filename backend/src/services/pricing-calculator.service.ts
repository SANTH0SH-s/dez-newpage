import { ServiceRepository } from "../repositories/service.repository";
import { MultiplierRepository } from "../repositories/multiplier.repository";
import { SettingsRepository } from "../repositories/settings.repository";
import { EstimateCalculateInput } from "../schemas/estimate.schemas";
import { PricingEngine, FullService } from "../pricing/pricing.engine";
import { ApiError } from "../middleware/error.middleware";

export class PricingCalculatorService {
  static async calculateEstimate(input: EstimateCalculateInput) {
    const settings = await SettingsRepository.findDefaultSettings();
    if (!settings) {
      throw new ApiError(500, "INTERNAL_SERVER_ERROR", "Global settings not configured");
    }

    const multipliers = await MultiplierRepository.findAll();

    const serviceIds = input.services.map((s) => s.serviceId);
    const servicesData: FullService[] = [];

    for (const serviceId of serviceIds) {
      const sData = await ServiceRepository.findActiveServiceById(serviceId);
      if (!sData) {
        throw new ApiError(404, "NOT_FOUND", `Active service ${serviceId} not found`);
      }
      servicesData.push(sData as unknown as FullService);
    }

    return PricingEngine.calculate(input, servicesData, multipliers, settings);
  }
}
