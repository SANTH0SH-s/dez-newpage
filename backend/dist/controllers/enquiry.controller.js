"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnquiryController = void 0;
const estimate_schemas_1 = require("../schemas/estimate.schemas");
const enquiry_service_1 = require("../services/enquiry.service");
const enquiry_repository_1 = require("../repositories/enquiry.repository");
const error_middleware_1 = require("../middleware/error.middleware");
const serialization_1 = require("../utils/serialization");
class EnquiryController {
    static async create(req, res, next) {
        try {
            const parseResult = estimate_schemas_1.EnquiryCreateSchema.safeParse(req.body);
            if (!parseResult.success) {
                throw new error_middleware_1.ApiError(400, "BAD_REQUEST", parseResult.error.errors[0]?.message || "Invalid input");
            }
            const result = await enquiry_service_1.EnquiryService.createEnquiry(parseResult.data);
            return res.status(201).json({
                success: true,
                data: (0, serialization_1.serializeData)(result),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getEnquiryById(req, res, next) {
        try {
            const { id } = req.params;
            const enquiry = await enquiry_service_1.EnquiryService.getEnquiryById(id);
            return res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(enquiry),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getEnquiries(req, res, next) {
        try {
            const page = parseInt(req.query.page || "1", 10);
            const limit = parseInt(req.query.limit || "10", 10);
            const result = await enquiry_service_1.EnquiryService.getEnquiriesList(page, limit);
            return res.status(200).json({
                success: true,
                data: {
                    total: result.total,
                    items: (0, serialization_1.serializeData)(result.items),
                    page: result.page,
                    limit: result.limit,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteEnquiry(req, res, next) {
        try {
            const { id } = req.params;
            await enquiry_repository_1.EnquiryRepository.delete(id);
            return res.status(200).json({
                success: true,
                message: "Enquiry deleted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await enquiry_repository_1.EnquiryRepository.updateStatus(id, status);
            return res.status(200).json({
                success: true,
                data: (0, serialization_1.serializeData)(result),
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.EnquiryController = EnquiryController;
