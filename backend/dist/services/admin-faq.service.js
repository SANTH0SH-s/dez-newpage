"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminFAQService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const database_1 = require("../config/database");
const audit_repository_1 = require("../repositories/audit.repository");
const error_middleware_1 = require("../middleware/error.middleware");
class AdminFAQService {
    static async getFAQsByServiceId(serviceId) {
        return database_1.prisma.fAQItem.findMany({
            where: { serviceId },
            orderBy: { displayOrder: "asc" },
        });
    }
    static async createFAQ(adminId, serviceId, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const service = await tx.service.findUnique({ where: { id: serviceId } });
            if (!service) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Service not found");
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
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "FAQ_CREATED",
                entityType: "FAQItem",
                entityId: faq.id,
                details: { question: faq.question, serviceId },
            });
            return faq;
        });
    }
    static async updateFAQ(adminId, id, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const exists = await tx.fAQItem.findUnique({ where: { id } });
            if (!exists) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "FAQ not found");
            }
            const updateData = {};
            if (data.question !== undefined)
                updateData.question = data.question;
            if (data.answer !== undefined)
                updateData.answer = data.answer;
            if (data.displayOrder !== undefined)
                updateData.displayOrder = data.displayOrder;
            if (data.status !== undefined) {
                updateData.status = data.status === "active" ? "ACTIVE" : "INACTIVE";
            }
            const faq = await tx.fAQItem.update({
                where: { id },
                data: updateData,
            });
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "FAQ_UPDATED",
                entityType: "FAQItem",
                entityId: id,
                details: { question: faq.question, changes: Object.keys(updateData) },
            });
            return faq;
        });
    }
    static async deleteFAQ(adminId, id) {
        return database_1.prisma.$transaction(async (tx) => {
            const faq = await tx.fAQItem.findUnique({ where: { id } });
            if (!faq) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "FAQ not found");
            }
            const deletedFAQ = await tx.fAQItem.delete({
                where: { id },
            });
            await audit_repository_1.AuditRepository.createLog(tx, {
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
exports.AdminFAQService = AdminFAQService;
