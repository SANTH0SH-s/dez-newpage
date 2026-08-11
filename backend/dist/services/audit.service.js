"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const audit_repository_1 = require("../repositories/audit.repository");
class AuditService {
    static async getLogs(limit = 50, offset = 0) {
        return audit_repository_1.AuditRepository.findAll(limit, offset);
    }
}
exports.AuditService = AuditService;
