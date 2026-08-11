"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiplierService = void 0;
const multiplier_repository_1 = require("../repositories/multiplier.repository");
class MultiplierService {
    static async getMultipliers() {
        const list = await multiplier_repository_1.MultiplierRepository.findAll();
        const complexity = [];
        const urgency = [];
        const quality = [];
        for (const item of list) {
            const category = item.category.toLowerCase();
            if (category === "complexity") {
                complexity.push(item);
            }
            else if (category === "urgency") {
                urgency.push(item);
            }
            else if (category === "quality") {
                quality.push(item);
            }
        }
        return {
            complexity,
            urgency,
            quality,
        };
    }
}
exports.MultiplierService = MultiplierService;
