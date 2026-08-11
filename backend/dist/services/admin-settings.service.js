"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSettingsService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const database_1 = require("../config/database");
const audit_repository_1 = require("../repositories/audit.repository");
const error_middleware_1 = require("../middleware/error.middleware");
class AdminSettingsService {
    static async getSettings() {
        const settings = await database_1.prisma.globalSettings.findUnique({
            where: { id: "default" },
        });
        if (!settings) {
            throw new error_middleware_1.ApiError(500, "INTERNAL_SERVER_ERROR", "Global settings record not found");
        }
        return settings;
    }
    static async updateSettings(adminId, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const exists = await tx.globalSettings.findUnique({ where: { id: "default" } });
            if (!exists) {
                throw new error_middleware_1.ApiError(500, "INTERNAL_SERVER_ERROR", "Global settings record not found");
            }
            const updateData = {};
            if (data.companyName !== undefined)
                updateData.companyName = data.companyName;
            if (data.currency !== undefined)
                updateData.currency = data.currency;
            if (data.taxRate !== undefined)
                updateData.taxRate = data.taxRate;
            if (data.discountRate !== undefined)
                updateData.discountRate = data.discountRate;
            if (data.defaultPricingMode !== undefined)
                updateData.defaultPricingMode = data.defaultPricingMode;
            if (data.minimumCost !== undefined)
                updateData.minimumCost = data.minimumCost;
            if (data.maximumCost !== undefined)
                updateData.maximumCost = data.maximumCost;
            if (data.whatsappNumber !== undefined)
                updateData.whatsappNumber = data.whatsappNumber;
            if (data.gateEstimateWithLeadForm !== undefined) {
                updateData.gateEstimateWithLeadForm = data.gateEstimateWithLeadForm;
            }
            const settings = await tx.globalSettings.update({
                where: { id: "default" },
                data: updateData,
            });
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "SETTINGS_UPDATED",
                entityType: "GlobalSettings",
                entityId: "default",
                details: { changes: Object.keys(updateData) },
            });
            return settings;
        });
    }
}
exports.AdminSettingsService = AdminSettingsService;
