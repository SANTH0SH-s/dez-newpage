"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiplierRepository = void 0;
const database_1 = require("../config/database");
class MultiplierRepository {
    static async findAll() {
        return database_1.prisma.multiplier.findMany();
    }
}
exports.MultiplierRepository = MultiplierRepository;
