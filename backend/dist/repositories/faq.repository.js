"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAQRepository = void 0;
const database_1 = require("../config/database");
class FAQRepository {
    static async findActiveFAQsByServiceId(serviceId) {
        return database_1.prisma.fAQItem.findMany({
            where: {
                serviceId,
                status: "ACTIVE",
            },
            orderBy: {
                displayOrder: "asc",
            },
        });
    }
}
exports.FAQRepository = FAQRepository;
