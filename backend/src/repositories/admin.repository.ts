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

  static async updatePassword(id: string, passwordHash: string) {
    return prisma.adminAccount.update({
      where: { id },
      data: { passwordHash },
    });
  }
}
