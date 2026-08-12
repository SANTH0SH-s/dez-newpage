"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnquiryService = void 0;
const enquiry_repository_1 = require("../repositories/enquiry.repository");
const error_middleware_1 = require("../middleware/error.middleware");
const database_1 = require("../config/database");
class EnquiryService {
    static async createEnquiry(input) {
        const rangeStr = input.estimateRange || "₹0 - ₹0";
        const result = await database_1.prisma.$transaction(async (tx) => {
            // If estimateId is provided, verify it exists
            if (input.estimateId) {
                const est = await tx.estimate.findUnique({
                    where: { id: input.estimateId }
                });
                if (!est) {
                    throw new error_middleware_1.ApiError(404, "NOT_FOUND", `Estimate ${input.estimateId} not found`);
                }
            }
            const enquiryId = `ENQ-${Math.floor(100000 + Math.random() * 900000)}`;
            const enquiry = await enquiry_repository_1.EnquiryRepository.create({
                id: enquiryId,
                name: input.name,
                email: input.email,
                phone: input.phone,
                company: input.company,
                estimateRange: rangeStr,
                message: input.message,
                selectedServices: input.selectedServices,
            }, tx);
            // If estimateId is provided, link it
            if (input.estimateId) {
                await tx.estimate.update({
                    where: { id: input.estimateId },
                    data: { enquiryId: enquiry.id }
                });
            }
            return enquiry;
        });
        return result;
    }
    static async getEnquiryById(id) {
        const enq = await enquiry_repository_1.EnquiryRepository.findById(id);
        if (!enq) {
            throw new error_middleware_1.ApiError(404, "NOT_FOUND", `Enquiry ${id} not found`);
        }
        return enq;
    }
    static async getEnquiriesList(page, limit) {
        return enquiry_repository_1.EnquiryRepository.findAll(page, limit);
    }
}
exports.EnquiryService = EnquiryService;
