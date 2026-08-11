import { prisma } from "../config/database";

export class PackageRepository {
  static async findActivePackagesByServiceId(serviceId: string) {
    return prisma.package.findMany({
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
