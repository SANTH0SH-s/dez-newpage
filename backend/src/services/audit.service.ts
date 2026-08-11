import { AuditRepository } from "../repositories/audit.repository";

export class AuditService {
  static async getLogs(limit = 50, offset = 0) {
    return AuditRepository.findAll(limit, offset);
  }
}
