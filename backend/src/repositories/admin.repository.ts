import { prisma } from "../config/database";

export class AdminRepository {
  static async findByEmail(email: string) {
    return prisma.adminAccount.findUnique({
      where: { email },
    });
  }

  static async findById(id: string) {
    return prisma.adminAccount.findUnique({
      where: { id },
    });
  }
}
