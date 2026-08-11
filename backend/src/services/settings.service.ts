import { SettingsRepository } from "../repositories/settings.repository";
import { ApiError } from "../middleware/error.middleware";

export class SettingsService {
  static async getPublicSettings() {
    const settings = await SettingsRepository.findDefaultSettings();
    if (!settings) {
      throw new ApiError(500, "INTERNAL_SERVER_ERROR", "Global settings not found");
    }
    
    // Explicitly return only safe public settings
    return {
      companyName: settings.companyName,
      currency: settings.currency,
      taxRate: settings.taxRate,
      discountRate: settings.discountRate,
      defaultPricingMode: settings.defaultPricingMode,
      minimumCost: settings.minimumCost,
      maximumCost: settings.maximumCost,
      whatsappNumber: settings.whatsappNumber,
      gateEstimateWithLeadForm: settings.gateEstimateWithLeadForm,
    };
  }
}
