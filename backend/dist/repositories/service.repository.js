"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRepository = void 0;
const database_1 = require("../config/database");
class ServiceRepository {
    static async findActiveServices() {
        return database_1.prisma.service.findMany({
            where: {
                status: "ACTIVE",
            },
            select: {
                id: true,
                name: true,
                category: true,
                description: true,
                iconName: true,
                iconImage: true,
                cardImage: true,
                heroBanner: true,
                thumbnail: true,
                basePrice: true,
                unitType: true,
                status: true,
            },
        });
    }
    static async findActiveServiceById(id) {
        return database_1.prisma.service.findFirst({
            where: {
                id,
                status: "ACTIVE",
            },
            include: {
                packages: {
                    where: {
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
                },
                questions: {
                    where: {
                        packageId: null, // Service-level questions only
                    },
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
                components: {
                    where: {
                        status: "ACTIVE",
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
                faqs: {
                    where: {
                        status: "ACTIVE",
                    },
                    orderBy: {
                        displayOrder: "asc",
                    },
                },
            },
        });
    }
}
exports.ServiceRepository = ServiceRepository;
