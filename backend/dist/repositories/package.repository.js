"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageRepository = void 0;
const database_1 = require("../config/database");
class PackageRepository {
    static async findActivePackagesByServiceId(serviceId) {
        return database_1.prisma.package.findMany({
            where: {
                serviceId,
                status: "ACTIVE",
            },
            orderBy: {
                displayOrder: "asc",
            },
            include: {
                features: true,
                questions: {
                    orderBy: {
                        displayOrder: "asc",
                    },
                    include: {
                        options: {
                            orderBy: {
                                id: "asc",
                            },
                        },
                        validationRule: true,
                    },
                },
            },
        });
    }
}
exports.PackageRepository = PackageRepository;
