import { prisma } from "../config/database";

export class QuestionRepository {
  static async findActiveServiceQuestions(serviceId: string) {
    return prisma.question.findMany({
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
