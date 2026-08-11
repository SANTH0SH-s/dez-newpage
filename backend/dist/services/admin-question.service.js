"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminQuestionService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const database_1 = require("../config/database");
const audit_repository_1 = require("../repositories/audit.repository");
const error_middleware_1 = require("../middleware/error.middleware");
class AdminQuestionService {
    static async getQuestionsByServiceId(serviceId) {
        return database_1.prisma.question.findMany({
            where: {
                OR: [
                    { serviceId },
                    { package: { serviceId } },
                ],
            },
            orderBy: { displayOrder: "asc" },
            include: {
                options: {
                    orderBy: { id: "asc" },
                },
                validationRule: true,
            },
        });
    }
    static async createQuestion(adminId, serviceId, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const service = await tx.service.findUnique({ where: { id: serviceId } });
            if (!service) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Service not found");
            }
            // If packageId is provided, verify it belongs to this service
            if (data.packageId) {
                const pkg = await tx.package.findFirst({
                    where: { id: data.packageId, serviceId },
                });
                if (!pkg) {
                    throw new error_middleware_1.ApiError(400, "BAD_REQUEST", `Package with ID ${data.packageId} does not belong to service ${serviceId}`);
                }
            }
            const exists = await tx.question.findUnique({ where: { id: data.id } });
            if (exists) {
                throw new error_middleware_1.ApiError(409, "CONFLICT", `Question with ID ${data.id} already exists`);
            }
            // Convert enum types
            const qType = data.type.toUpperCase();
            const question = await tx.question.create({
                data: {
                    id: data.id,
                    serviceId: data.packageId ? null : serviceId, // If package-level, serviceId in schema should be null to avoid confusion, or set both depending on schema
                    packageId: data.packageId || null,
                    text: data.text,
                    description: data.description ?? null,
                    type: qType,
                    isRequired: data.isRequired ?? true,
                    displayOrder: data.displayOrder ?? 0,
                    defaultValue: data.defaultValue !== undefined ? data.defaultValue : null,
                    priceModifier: data.priceModifier ?? 0,
                    modifierType: data.modifierType === "multiplier" ? "MULTIPLIER" : "FLAT",
                    conditionalParentId: data.conditionalParentId ?? null,
                    conditionalParentValue: data.conditionalParentValue ?? null,
                },
            });
            // Handle nested validation rules
            if (data.validationRules) {
                await tx.validationRule.create({
                    data: {
                        questionId: question.id,
                        min: data.validationRules.min ?? null,
                        max: data.validationRules.max ?? null,
                        pattern: data.validationRules.pattern ?? null,
                        message: data.validationRules.message ?? null,
                    },
                });
            }
            // Handle nested options
            if (data.options && Array.isArray(data.options)) {
                for (const opt of data.options) {
                    await tx.questionOption.create({
                        data: {
                            questionId: question.id,
                            value: opt.value,
                            label: opt.label,
                            priceModifier: opt.priceModifier ?? 0,
                            modifierType: opt.modifierType === "multiplier" ? "MULTIPLIER" : "FLAT",
                            description: opt.description ?? null,
                        },
                    });
                }
            }
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "QUESTION_CREATED",
                entityType: "Question",
                entityId: question.id,
                details: { text: question.text, serviceId },
            });
            return tx.question.findUnique({
                where: { id: question.id },
                include: { options: true, validationRule: true },
            });
        });
    }
    static async updateQuestion(adminId, id, data) {
        return database_1.prisma.$transaction(async (tx) => {
            const exists = await tx.question.findUnique({ where: { id } });
            if (!exists) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Question not found");
            }
            const updateData = {};
            if (data.text !== undefined)
                updateData.text = data.text;
            if (data.description !== undefined)
                updateData.description = data.description;
            if (data.type !== undefined)
                updateData.type = data.type.toUpperCase();
            if (data.isRequired !== undefined)
                updateData.isRequired = data.isRequired;
            if (data.displayOrder !== undefined)
                updateData.displayOrder = data.displayOrder;
            if (data.defaultValue !== undefined)
                updateData.defaultValue = data.defaultValue;
            if (data.priceModifier !== undefined)
                updateData.priceModifier = data.priceModifier;
            if (data.modifierType !== undefined) {
                updateData.modifierType = data.modifierType === "multiplier" ? "MULTIPLIER" : "FLAT";
            }
            if (data.conditionalParentId !== undefined)
                updateData.conditionalParentId = data.conditionalParentId;
            if (data.conditionalParentValue !== undefined)
                updateData.conditionalParentValue = data.conditionalParentValue;
            const question = await tx.question.update({
                where: { id },
                data: updateData,
            });
            // Update validation rules
            if (data.validationRules !== undefined) {
                await tx.validationRule.deleteMany({ where: { questionId: id } });
                if (data.validationRules) {
                    await tx.validationRule.create({
                        data: {
                            questionId: id,
                            min: data.validationRules.min ?? null,
                            max: data.validationRules.max ?? null,
                            pattern: data.validationRules.pattern ?? null,
                            message: data.validationRules.message ?? null,
                        },
                    });
                }
            }
            // Update options
            if (data.options !== undefined && Array.isArray(data.options)) {
                await tx.questionOption.deleteMany({ where: { questionId: id } });
                for (const opt of data.options) {
                    await tx.questionOption.create({
                        data: {
                            questionId: id,
                            value: opt.value,
                            label: opt.label,
                            priceModifier: opt.priceModifier ?? 0,
                            modifierType: opt.modifierType === "multiplier" ? "MULTIPLIER" : "FLAT",
                            description: opt.description ?? null,
                        },
                    });
                }
            }
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "QUESTION_UPDATED",
                entityType: "Question",
                entityId: id,
                details: { text: question.text, changes: Object.keys(updateData) },
            });
            return tx.question.findUnique({
                where: { id },
                include: { options: true, validationRule: true },
            });
        });
    }
    static async deleteQuestion(adminId, id) {
        return database_1.prisma.$transaction(async (tx) => {
            const question = await tx.question.findUnique({ where: { id } });
            if (!question) {
                throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Question not found");
            }
            const deletedQuestion = await tx.question.delete({
                where: { id },
            });
            await audit_repository_1.AuditRepository.createLog(tx, {
                adminAccountId: adminId,
                action: "QUESTION_DELETED",
                entityType: "Question",
                entityId: id,
                details: { text: question.text },
            });
            return deletedQuestion;
        });
    }
}
exports.AdminQuestionService = AdminQuestionService;
