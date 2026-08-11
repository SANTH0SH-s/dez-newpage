import { prisma } from "../config/database";

export class AuditRepository {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  static async createLog(tx: any, data: {
    adminAccountId: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: any;
  }) {
  /* eslint-enable @typescript-eslint/no-explicit-any */
    // If a transaction context 'tx' is passed, use it, otherwise use main prisma client
    const client = tx || prisma;
    return client.auditLog.create({
      data: {
        adminAccountId: data.adminAccountId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details || {},
      },
    });
  }

  static async findAll(limit = 50, offset = 0) {
    return prisma.auditLog.findMany({
      orderBy: {
        timestamp: "desc",
      },
      take: limit,
      skip: offset,
      include: {
        adminAccount: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }
}
