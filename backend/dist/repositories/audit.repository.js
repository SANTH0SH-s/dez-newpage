"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRepository = void 0;
const database_1 = require("../config/database");
class AuditRepository {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    static async createLog(tx, data) {
        /* eslint-enable @typescript-eslint/no-explicit-any */
        // If a transaction context 'tx' is passed, use it, otherwise use main prisma client
        const client = tx || database_1.prisma;
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
        return database_1.prisma.auditLog.findMany({
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
exports.AuditRepository = AuditRepository;
