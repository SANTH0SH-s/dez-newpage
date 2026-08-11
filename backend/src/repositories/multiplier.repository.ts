import { prisma } from "../config/database";

export class MultiplierRepository {
  static async findAll() {
    return prisma.multiplier.findMany();
  }
}
