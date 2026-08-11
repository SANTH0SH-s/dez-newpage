import { QuestionRepository } from "../repositories/question.repository";
import { ServiceRepository } from "../repositories/service.repository";
import { ApiError } from "../middleware/error.middleware";

export class QuestionService {
  static async getActiveQuestionsByServiceId(serviceId: string) {
    const service = await ServiceRepository.findActiveServiceById(serviceId);
    if (!service) {
      throw new ApiError(404, "NOT_FOUND", "Service not found");
    }
    return QuestionRepository.findActiveServiceQuestions(serviceId);
  }
}
