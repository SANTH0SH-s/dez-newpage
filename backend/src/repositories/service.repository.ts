import { prisma } from "../config/database";

export class ServiceRepository {
  static async findActiveServices() {
    return prisma.service.findMany({
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

  static async findActiveServiceById(id: string) {
    return prisma.service.findFirst({
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
