import { prisma } from "../config/database";

export class FAQRepository {
  static async findActiveFAQsByServiceId(serviceId: string) {
    return prisma.fAQItem.findMany({
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
