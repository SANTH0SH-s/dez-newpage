"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnquiryRepository = void 0;
const database_1 = require("../config/database");
class EnquiryRepository {
    static async create(data, tx) {
        const client = tx || database_1.prisma;
        return client.enquiry.create({
            data: {
                id: data.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                company: data.company,
                estimateRange: data.estimateRange,
                message: data.message,
                selectedServices: data.selectedServices,
                status: data.status || "PENDING"
            }
        });
    }
    static async findById(id) {
        return database_1.prisma.enquiry.findUnique({
            where: { id },
            include: {
                estimate: true
            }
        });
    }
    static async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [total, items] = await Promise.all([
            database_1.prisma.enquiry.count(),
            database_1.prisma.enquiry.findMany({
                skip,
                take: limit,
                orderBy: { createdDate: "desc" },
                include: {
                    estimate: true
                }
            })
        ]);
        return { total, items, page, limit };
    }
    static async delete(id) {
        return database_1.prisma.enquiry.delete({
            where: { id }
        });
    }
    static async updateStatus(id, status) {
        const dbStatus = status.toUpperCase();
        return database_1.prisma.enquiry.update({
            where: { id },
            data: { status: dbStatus }
        });
    }
}
exports.EnquiryRepository = EnquiryRepository;
