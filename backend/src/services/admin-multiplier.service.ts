/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../config/database";
import { AuditRepository } from "../repositories/audit.repository";
import { ApiError } from "../middleware/error.middleware";

export class AdminMultiplierService {
  static async getMultipliers() {
    return prisma.multiplier.findMany({
      orderBy: { id: "asc" },
    });
  }

  static async createMultiplier(adminId: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const exists = await tx.multiplier.findUnique({ where: { id: data.id } });
      if (exists) {
        throw new ApiError(409, "CONFLICT", `Multiplier with ID ${data.id} already exists`);
      }

      const multiplier = await tx.multiplier.create({
        data: {
          id: data.id,
          category: data.category.toUpperCase(),
          label: data.label,
          value: data.value,
          description: data.description ?? null,
        },
      });

      await AuditRepository.createLog(tx, {
        adminAccountId: adminId,
        action: "MULTIPLIER_CREATED",
        entityType: "Multiplier",
        entityId: multiplier.id,
        details: { label: multiplier.label, value: multiplier.value },
      });

      return multiplier;
    });
  }

  static async updateMultiplier(adminId: string, id: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const exists = await tx.multiplier.findUnique({ where: { id } });
      if (!exists) {
        throw new ApiError(404, "NOT_FOUND", "Multiplier not found");
      }

      const updateData: any = {};
      if (data.category !== undefined) updateData.category = data.category.toUpperCase();
      if (data.label !== undefined) updateData.label = data.label;
      if (data.value !== undefined) updateData.value = data.value;
      if (data.description !== undefined) updateData.description = data.description;

      const multiplier = await tx.multiplier.update({
        where: { id },
        data: updateData,
      });

      await AuditRepository.createLog(tx, {
        adminAccountId: adminId,
        action: "MULTIPLIER_UPDATED",
        entityType: "Multiplier",
        entityId: id,
        details: { label: multiplier.label, changes: Object.keys(updateData) },
      });

      return multiplier;
    });
  }

  static async deleteMultiplier(adminId: string, id: string) {
    return prisma.$transaction(async (tx) => {
      const multiplier = await tx.multiplier.findUnique({ where: { id } });
      if (!multiplier) {
        throw new ApiError(404, "NOT_FOUND", "Multiplier not found");
      }

      const deletedMultiplier = await tx.multiplier.delete({
        where: { id },
      });

      await AuditRepository.createLog(tx, {
        adminAccountId: adminId,
        action: "MULTIPLIER_DELETED",
        entityType: "Multiplier",
        entityId: id,
        details: { label: multiplier.label },
      });

      return deletedMultiplier;
    });
  }
}
