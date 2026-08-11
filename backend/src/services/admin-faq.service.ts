/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../config/database";
import { AuditRepository } from "../repositories/audit.repository";
import { ApiError } from "../middleware/error.middleware";

export class AdminFAQService {
  static async getFAQsByServiceId(serviceId: string) {
    return prisma.fAQItem.findMany({
      where: { serviceId },
      orderBy: { displayOrder: "asc" },
    });
  }

  static async createFAQ(adminId: string, serviceId: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const service = await tx.service.findUnique({ where: { id: serviceId } });
      if (!service) {
        throw new ApiError(404, "NOT_FOUND", "Service not found");
      }

      const faq = await tx.fAQItem.create({
        data: {
          serviceId,
          question: data.question,
          answer: data.answer,
          displayOrder: data.displayOrder ?? 0,
          status: data.status === "inactive" ? "INACTIVE" : "ACTIVE",
        },
      });

      await AuditRepository.createLog(tx, {
        adminAccountId: adminId,
        action: "FAQ_CREATED",
        entityType: "FAQItem",
        entityId: faq.id,
        details: { question: faq.question, serviceId },
      });

      return faq;
    });
  }

  static async updateFAQ(adminId: string, id: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const exists = await tx.fAQItem.findUnique({ where: { id } });
      if (!exists) {
        throw new ApiError(404, "NOT_FOUND", "FAQ not found");
      }

      const updateData: any = {};
      if (data.question !== undefined) updateData.question = data.question;
      if (data.answer !== undefined) updateData.answer = data.answer;
      if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
      if (data.status !== undefined) {
        updateData.status = data.status === "active" ? "ACTIVE" : "INACTIVE";
      }

      const faq = await tx.fAQItem.update({
        where: { id },
        data: updateData,
      });

      await AuditRepository.createLog(tx, {
        adminAccountId: adminId,
        action: "FAQ_UPDATED",
        entityType: "FAQItem",
        entityId: id,
        details: { question: faq.question, changes: Object.keys(updateData) },
      });

      return faq;
    });
  }

  static async deleteFAQ(adminId: string, id: string) {
    return prisma.$transaction(async (tx) => {
      const faq = await tx.fAQItem.findUnique({ where: { id } });
      if (!faq) {
        throw new ApiError(404, "NOT_FOUND", "FAQ not found");
      }

      const deletedFAQ = await tx.fAQItem.delete({
        where: { id },
      });

      await AuditRepository.createLog(tx, {
        adminAccountId: adminId,
        action: "FAQ_DELETED",
        entityType: "FAQItem",
        entityId: id,
        details: { question: faq.question },
      });

      return deletedFAQ;
    });
  }
}
