import { ServiceRepository } from "../repositories/service.repository";
import { MultiplierRepository } from "../repositories/multiplier.repository";
import { SettingsRepository } from "../repositories/settings.repository";
import { EstimateCalculateInput } from "../schemas/estimate.schemas";
import { PricingEngine, FullService } from "../pricing/pricing.engine";
import { ApiError } from "../middleware/error.middleware";
import NodeCache from "node-cache";

// Cache for 5 minutes to make the pricing calculator instant
const configCache = new NodeCache({ stdTTL: 300 });

export class PricingCalculatorService {
  static async calculateEstimate(input: EstimateCalculateInput) {
    let settings = configCache.get("global_settings");
    if (!settings) {
      settings = await SettingsRepository.findDefaultSettings();
      if (!settings) {
        throw new ApiError(500, "INTERNAL_SERVER_ERROR", "Global settings not configured");
      }
      configCache.set("global_settings", settings);
    }

    let multipliers = configCache.get("multipliers");
    if (!multipliers) {
      multipliers = await MultiplierRepository.findAll();
      configCache.set("multipliers", multipliers);
    }

    const serviceIds = input.services.map((s) => s.serviceId);
    const servicesData: FullService[] = [];

    for (const serviceId of serviceIds) {
      const cacheKey = `service_${serviceId}`;
      let sData = configCache.get(cacheKey);
      
      if (!sData) {
        sData = await ServiceRepository.findActiveServiceById(serviceId);
        if (!sData) {
          throw new ApiError(404, "NOT_FOUND", `Active service ${serviceId} not found`);
        }
        configCache.set(cacheKey, sData);
      }
      
      servicesData.push(sData as FullService);
    }

    // Now calculate synchronously in memory using cached data
    return PricingEngine.calculate(input, servicesData, multipliers as any, settings as any);
  }
}
