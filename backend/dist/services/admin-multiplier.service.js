"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMultiplierService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const database_1 = require("../config/database");
const audit_repository_1 = require("../repositories/audit.repository");
const error_middleware_1 = require("../middleware/error.middleware");
class AdminMultiplierService {
    static async getMultipliers() {
        return database_1.prisma.multiplier.findMany({
            orderBy: { id: "asc" },
        });
    }
    static async createMultiplier(adminId, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const exists = await tx.multiplier.findUnique({ where: { id: data.id } });
            if (exists) {
                throw new error_middleware_1.ApiError(409, "CONFLICT", `Multiplier with ID ${data.id} already exists`);
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
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "MULTIPLIER_CREATED",
                entityType: "Multiplier",
                entityId: multiplier.id,
                details: { label: multiplier.label, value: multiplier.value },
            });
            return multiplier;
        });
    }
    static async updateMultiplier(adminId, id, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const exists = await tx.multiplier.findUnique({ where: { id } });
            if (!exists) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Multiplier not found");
            }
            const updateData = {};
            if (data.category !== undefined)
                updateData.category = data.category.toUpperCase();
            if (data.label !== undefined)
                updateData.label = data.label;
            if (data.value !== undefined)
                updateData.value = data.value;
            if (data.description !== undefined)
                updateData.description = data.description;
            const multiplier = await tx.multiplier.update({
                where: { id },
                data: updateData,
            });
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "MULTIPLIER_UPDATED",
                entityType: "Multiplier",
                entityId: id,
                details: { label: multiplier.label, changes: Object.keys(updateData) },
            });
            return multiplier;
        });
    }
    static async deleteMultiplier(adminId, id) {
        return database_1.prisma.$transaction(async (tx) => {
            const multiplier = await tx.multiplier.findUnique({ where: { id } });
            if (!multiplier) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Multiplier not found");
            }
            const deletedMultiplier = await tx.multiplier.delete({
                where: { id },
            });
            await audit_repository_1.AuditRepository.createLog(tx, {
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
exports.AdminMultiplierService = AdminMultiplierService;
