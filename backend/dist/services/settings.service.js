"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const settings_repository_1 = require("../repositories/settings.repository");
const error_middleware_1 = require("../middleware/error.middleware");
class SettingsService {
    static async getPublicSettings() {
        const settings = await settings_repository_1.SettingsRepository.findDefaultSettings();
        if (!settings) {
            throw new error_middleware_1.ApiError(500, "INTERNAL_SERVER_ERROR", "Global settings not found");
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
exports.SettingsService = SettingsService;
