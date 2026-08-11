"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRepository = void 0;
const database_1 = require("../config/database");
class SettingsRepository {
    static async findDefaultSettings() {
        return database_1.prisma.globalSettings.findUnique({
            where: {
                id: "default",
            },
        });
    }
}
exports.SettingsRepository = SettingsRepository;
