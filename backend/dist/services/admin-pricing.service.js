"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPricingService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const database_1 = require("../config/database");
const audit_repository_1 = require("../repositories/audit.repository");
const error_middleware_1 = require("../middleware/error.middleware");
class AdminPricingService {
    static async getComponentsByServiceId(serviceId) {
        return database_1.prisma.pricingComponent.findMany({
            where: { serviceId },
            orderBy: { createdAt: "asc" },
        });
    }
    static async createComponent(adminId, serviceId, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const service = await tx.service.findUnique({ where: { id: serviceId } });
            if (!service) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Service not found");
            }
            const exists = await tx.pricingComponent.findUnique({ where: { id: data.id } });
            if (exists) {
                throw new error_middleware_1.ApiError(409, "CONFLICT", `Pricing component with ID ${data.id} already exists`);
            }
            const component = await tx.pricingComponent.create({
                data: {
                    id: data.id,
                    serviceId,
                    name: data.name,
                    pricingType: data.pricingType === "per-unit" ? "PER_UNIT" : "FIXED",
                    price: data.price,
                    description: data.description,
                    maxQuantity: data.maxQuantity ?? null,
                    iconName: data.iconName ?? null,
                    status: data.status === "inactive" ? "INACTIVE" : "ACTIVE",
                    category: data.category,
                    billingCycle: data.billingCycle === "monthly" ? "MONTHLY" : "ONE_TIME",
                    note: data.note ?? null,
                },
            });
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "PRICING_COMPONENT_CREATED",
                entityType: "PricingComponent",
                entityId: component.id,
                details: { name: component.name, serviceId },
            });
            return component;
        });
    }
    static async updateComponent(adminId, id, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const exists = await tx.pricingComponent.findUnique({ where: { id } });
            if (!exists) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Pricing component not found");
            }
            const updateData = {};
            if (data.name !== undefined)
                updateData.name = data.name;
            if (data.pricingType !== undefined) {
                updateData.pricingType = data.pricingType === "per-unit" ? "PER_UNIT" : "FIXED";
            }
            if (data.price !== undefined)
                updateData.price = data.price;
            if (data.description !== undefined)
                updateData.description = data.description;
            if (data.maxQuantity !== undefined)
                updateData.maxQuantity = data.maxQuantity;
            if (data.iconName !== undefined)
                updateData.iconName = data.iconName;
            if (data.status !== undefined) {
                updateData.status = data.status === "active" ? "ACTIVE" : "INACTIVE";
            }
            if (data.category !== undefined)
                updateData.category = data.category;
            if (data.billingCycle !== undefined) {
                updateData.billingCycle = data.billingCycle === "monthly" ? "MONTHLY" : "ONE_TIME";
            }
            if (data.note !== undefined)
                updateData.note = data.note;
            const component = await tx.pricingComponent.update({
                where: { id },
                data: updateData,
            });
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "PRICING_COMPONENT_UPDATED",
                entityType: "PricingComponent",
                entityId: id,
                details: { name: component.name, changes: Object.keys(updateData) },
            });
            return component;
        });
    }
    static async deleteComponent(adminId, id) {
        return database_1.prisma.$transaction(async (tx) => {
            const component = await tx.pricingComponent.findUnique({ where: { id } });
            if (!component) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Pricing component not found");
            }
            const deletedComponent = await tx.pricingComponent.delete({
                where: { id },
            });
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "PRICING_COMPONENT_DELETED",
                entityType: "PricingComponent",
                entityId: id,
                details: { name: component.name },
            });
            return deletedComponent;
        });
    }
}
exports.AdminPricingService = AdminPricingService;
