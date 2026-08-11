/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../config/database";
import { AuditRepository } from "../repositories/audit.repository";
import { ApiError } from "../middleware/error.middleware";

export class AdminSettingsService {
  static async getSettings() {
    const settings = await prisma.globalSettings.findUnique({
      where: { id: "default" },
    });
    if (!settings) {
      throw new ApiError(500, "INTERNAL_SERVER_ERROR", "Global settings record not found");
    }
    return settings;
  }

  static async updateSettings(adminId: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const exists = await tx.globalSettings.findUnique({ where: { id: "default" } });
      if (!exists) {
        throw new ApiError(500, "INTERNAL_SERVER_ERROR", "Global settings record not found");
      }

      const updateData: any = {};
      if (data.companyName !== undefined) updateData.companyName = data.companyName;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.taxRate !== undefined) updateData.taxRate = data.taxRate;
      if (data.discountRate !== undefined) updateData.discountRate = data.discountRate;
      if (data.defaultPricingMode !== undefined) updateData.defaultPricingMode = data.defaultPricingMode;
      if (data.minimumCost !== undefined) updateData.minimumCost = data.minimumCost;
      if (data.maximumCost !== undefined) updateData.maximumCost = data.maximumCost;
      if (data.whatsappNumber !== undefined) updateData.whatsappNumber = data.whatsappNumber;
      if (data.gateEstimateWithLeadForm !== undefined) {
        updateData.gateEstimateWithLeadForm = data.gateEstimateWithLeadForm;
      }

      const settings = await tx.globalSettings.update({
        where: { id: "default" },
        data: updateData,
      });

      await AuditRepository.createLog(tx, {
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
