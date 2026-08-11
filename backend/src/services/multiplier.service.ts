import { Multiplier } from "@prisma/client";
import { MultiplierRepository } from "../repositories/multiplier.repository";

export class MultiplierService {
  static async getMultipliers() {
    const list = await MultiplierRepository.findAll();
    
    const complexity: Multiplier[] = [];
    const urgency: Multiplier[] = [];
    const quality: Multiplier[] = [];

    for (const item of list) {
      const category = item.category.toLowerCase();
      if (category === "complexity") {
        complexity.push(item);
      } else if (category === "urgency") {
        urgency.push(item);
      } else if (category === "quality") {
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
