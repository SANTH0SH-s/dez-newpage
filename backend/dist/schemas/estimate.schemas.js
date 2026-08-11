"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstimateCalculateSchema = void 0;
const zod_1 = require("zod");
exports.EstimateCalculateSchema = zod_1.z.object({
    services: zod_1.z.array(zod_1.z.object({
        serviceId: zod_1.z.string({ required_error: "Service ID is required" }),
        packageId: zod_1.z.string().optional().nullable(),
        answers: zod_1.z.record(zod_1.z.any()).default({}),
        addons: zod_1.z.array(zod_1.z.object({
            pricingComponentId: zod_1.z.string({ required_error: "pricingComponentId is required" }),
            units: zod_1.z.number().int().min(1).default(1),
        })).default([]),
    })).min(1, "At least one service must be selected"),
    multipliers: zod_1.z.object({
        complexity: zod_1.z.string().optional().nullable(),
        urgency: zod_1.z.string().optional().nullable(),
        quality: zod_1.z.string().optional().nullable(),
    }).default({}),
});
