/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../config/database";
import { AuditRepository } from "../repositories/audit.repository";
import { ApiError } from "../middleware/error.middleware";

export class AdminServiceService {
  static async getServices() {
    return prisma.service.findMany({
      orderBy: { id: "asc" },
    });
  }

  static async getServiceById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    });
    if (!service) {
      throw new ApiError(404, "NOT_FOUND", "Service not found");
    }
    return service;
  }

  static async createService(adminId: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const exists = await tx.service.findUnique({ where: { id: data.id } });
      if (exists) {
        throw new ApiError(409, "CONFLICT", `Service with ID ${data.id} already exists`);
      }

      const service = await tx.service.create({
        data: {
          id: data.id,
          name: data.name,
          category: data.category,
          description: data.description,
          iconName: data.iconName,
          iconImage: data.iconImage,
          cardImage: data.cardImage,
          heroBanner: data.heroBanner,
          thumbnail: data.thumbnail,
          basePrice: data.basePrice,
          unitType: data.unitType,
          status: data.status === "active" ? "ACTIVE" : "INACTIVE",
        },
      });

      await AuditRepository.createLog(tx, {
        adminAccountId: adminId,
        action: "SERVICE_CREATED",
        entityType: "Service",
        entityId: service.id,
        details: { name: service.name },
      });

      return service;
    });
  }

  static async updateService(adminId: string, id: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const exists = await tx.service.findUnique({ where: { id } });
      if (!exists) {
        throw new ApiError(404, "NOT_FOUND", "Service not found");
      }

      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.iconName !== undefined) updateData.iconName = data.iconName;
      if (data.iconImage !== undefined) updateData.iconImage = data.iconImage;
      if (data.cardImage !== undefined) updateData.cardImage = data.cardImage;
      if (data.heroBanner !== undefined) updateData.heroBanner = data.heroBanner;
      if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
      if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
      if (data.unitType !== undefined) updateData.unitType = data.unitType;
      if (data.status !== undefined) {
        updateData.status = data.status === "active" ? "ACTIVE" : "INACTIVE";
      }

      const service = await tx.service.update({
        where: { id },
        data: updateData,
      });

      await AuditRepository.createLog(tx, {
        adminAccountId: adminId,
        action: "SERVICE_UPDATED",
        entityType: "Service",
        entityId: service.id,
        details: { name: service.name, changes: Object.keys(updateData) },
      });

      return service;
    });
  }

  static async deleteService(adminId: string, id: string) {
    return prisma.$transaction(async (tx) => {
      const service = await tx.service.findUnique({ where: { id } });
      if (!service) {
        throw new ApiError(404, "NOT_FOUND", "Service not found");
      }

      // Check dependent records to prevent breaking FK relationships
      const packageCount = await tx.package.count({ where: { serviceId: id } });
      const pricingCount = await tx.pricingComponent.count({ where: { serviceId: id } });
      const questionCount = await tx.question.count({ where: { serviceId: id } });
      const faqCount = await tx.fAQItem.count({ where: { serviceId: id } });

      if (packageCount > 0 || pricingCount > 0 || questionCount > 0 || faqCount > 0) {
        throw new ApiError(
          409,
          "CONFLICT",
          "Cannot delete service: Active configuration relationships (packages, components, questions, or FAQs) depend on it. Please inactivate or delete those first."
        );
      }

      const deletedService = await tx.service.delete({
        where: { id },
      });

      await AuditRepository.createLog(tx, {
        adminAccountId: adminId,
        action: "SERVICE_DELETED",
        entityType: "Service",
        entityId: id,
        details: { name: service.name },
      });

      return deletedService;
    });
  }
}
