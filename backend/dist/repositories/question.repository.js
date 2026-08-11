"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionRepository = void 0;
const database_1 = require("../config/database");
class QuestionRepository {
    static async findActiveServiceQuestions(serviceId) {
        return database_1.prisma.question.findMany({
            where: {
                serviceId,
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
        });
    }
}
exports.QuestionRepository = QuestionRepository;
