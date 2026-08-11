import { prisma } from "../config/database";

export class SettingsRepository {
  static async findDefaultSettings() {
    return prisma.globalSettings.findUnique({
      where: {
        id: "default",
      },
    });
  }
}
