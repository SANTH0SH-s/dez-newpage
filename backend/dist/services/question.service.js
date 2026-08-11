"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionService = void 0;
const question_repository_1 = require("../repositories/question.repository");
const service_repository_1 = require("../repositories/service.repository");
const error_middleware_1 = require("../middleware/error.middleware");
class QuestionService {
    static async getActiveQuestionsByServiceId(serviceId) {
        const service = await service_repository_1.ServiceRepository.findActiveServiceById(serviceId);
        if (!service) {
            throw new error_middleware_1.ApiError(404, "NOT_FOUND", "Service not found");
        }
        return question_repository_1.QuestionRepository.findActiveServiceQuestions(serviceId);
    }
}
exports.QuestionService = QuestionService;
