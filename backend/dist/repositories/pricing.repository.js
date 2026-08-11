"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingRepository = void 0;
const database_1 = require("../config/database");
class PricingRepository {
    static async findActiveComponentsByServiceId(serviceId) {
        return database_1.prisma.pricingComponent.findMany({
            where: {
                serviceId,
                status: "ACTIVE",
            },
            orderBy: {
                createdAt: "asc",
            },
        });
    }
}
exports.PricingRepository = PricingRepository;
