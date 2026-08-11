import { prisma } from "../config/database";

export class PricingRepository {
  static async findActiveComponentsByServiceId(serviceId: string) {
    return prisma.pricingComponent.findMany({
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
