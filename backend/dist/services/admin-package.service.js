"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPackageService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const database_1 = require("../config/database");
const audit_repository_1 = require("../repositories/audit.repository");
const error_middleware_1 = require("../middleware/error.middleware");
class AdminPackageService {
    static async getPackagesByServiceId(serviceId) {
        return database_1.prisma.package.findMany({
            where: { serviceId },
            orderBy: { displayOrder: "asc" },
            include: { features: true },
        });
    }
    static async createPackage(adminId, serviceId, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const service = await tx.service.findUnique({ where: { id: serviceId } });
            if (!service) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Service not found");
            }
            const exists = await tx.package.findUnique({ where: { id: data.id } });
            if (exists) {
                throw new error_middleware_1.ApiError(409, "CONFLICT", `Package with ID ${data.id} already exists`);
            }
            const pkg = await tx.package.create({
                data: {
                    id: data.id,
                    serviceId,
                    name: data.name,
                    price: data.price,
                    timeline: data.timeline,
                    description: data.description,
                    isRecommended: data.isRecommended ?? false,
                    isPopular: data.isPopular ?? false,
                    isBestValue: data.isBestValue ?? false,
                    isNew: data.isNew ?? false,
                    displayOrder: data.displayOrder ?? 0,
                    status: data.status === "active" ? "ACTIVE" : "INACTIVE",
                },
            });
            // Handle features if provided
            if (data.features && Array.isArray(data.features)) {
                for (const feat of data.features) {
                    await tx.packageFeature.create({
                        data: {
                            packageId: pkg.id,
                            feature: feat,
                        },
                    });
                }
            }
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "PACKAGE_CREATED",
                entityType: "Package",
                entityId: pkg.id,
                details: { name: pkg.name, serviceId },
            });
            return tx.package.findUnique({
                where: { id: pkg.id },
                include: { features: true },
            });
        });
    }
    static async updatePackage(adminId, id, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const exists = await tx.package.findUnique({
                where: { id },
                include: { features: true },
            });
            if (!exists) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Package not found");
            }
            const updateData = {};
            if (data.name !== undefined)
                updateData.name = data.name;
            if (data.price !== undefined)
                updateData.price = data.price;
            if (data.timeline !== undefined)
                updateData.timeline = data.timeline;
            if (data.description !== undefined)
                updateData.description = data.description;
            if (data.isRecommended !== undefined)
                updateData.isRecommended = data.isRecommended;
            if (data.isPopular !== undefined)
                updateData.isPopular = data.isPopular;
            if (data.isBestValue !== undefined)
                updateData.isBestValue = data.isBestValue;
            if (data.isNew !== undefined)
                updateData.isNew = data.isNew;
            if (data.displayOrder !== undefined)
                updateData.displayOrder = data.displayOrder;
            if (data.status !== undefined) {
                updateData.status = data.status === "active" ? "ACTIVE" : "INACTIVE";
            }
            const pkg = await tx.package.update({
                where: { id },
                data: updateData,
            });
            // Update features if provided
            if (data.features && Array.isArray(data.features)) {
                // Delete old features
                await tx.packageFeature.deleteMany({
                    where: { packageId: id },
                });
                // Insert new features
                for (const feat of data.features) {
                    await tx.packageFeature.create({
                        data: {
                            packageId: id,
                            feature: feat,
                        },
                    });
                }
            }
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "PACKAGE_UPDATED",
                entityType: "Package",
                entityId: id,
                details: { name: pkg.name, changes: Object.keys(updateData) },
            });
            return tx.package.findUnique({
                where: { id },
                include: { features: true },
            });
        });
    }
    static async deletePackage(adminId, id) {
        return database_1.prisma.$transaction(async (tx) => {
            const pkg = await tx.package.findUnique({ where: { id } });
            if (!pkg) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Package not found");
            }
            const deletedPkg = await tx.package.delete({
                where: { id },
            });
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "PACKAGE_DELETED",
                entityType: "Package",
                entityId: id,
                details: { name: pkg.name },
            });
            return deletedPkg;
        });
    }
}
exports.AdminPackageService = AdminPackageService;
