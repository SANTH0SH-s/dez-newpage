"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const database_1 = require("../config/database");
class AdminRepository {
    static async findByEmail(email) {
        return database_1.prisma.adminAccount.findUnique({
            where: { email },
        });
    }
    static async findById(id) {
        return database_1.prisma.adminAccount.findUnique({
            where: { id },
        });
    }
}
exports.AdminRepository = AdminRepository;
