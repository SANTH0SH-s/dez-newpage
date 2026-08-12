"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnquiryCreateSchema = exports.EstimateCreateSchema = exports.EstimateCalculateSchema = void 0;
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
exports.EstimateCreateSchema = exports.EstimateCalculateSchema.extend({
    customer: zod_1.z.object({
        name: zod_1.z.string({ required_error: "Name is required" }).min(1, "Name cannot be empty"),
        email: zod_1.z.string({ required_error: "Email is required" }).email("Invalid email format"),
        phone: zod_1.z.string().optional().nullable(),
        company: zod_1.z.string().optional().nullable(),
        notes: zod_1.z.string().optional().nullable(),
    }).optional().nullable(),
});
exports.EnquiryCreateSchema = zod_1.z.object({
    name: zod_1.z.string({ required_error: "Name is required" }).min(1, "Name cannot be empty"),
    email: zod_1.z.string({ required_error: "Email is required" }).email("Invalid email format"),
    phone: zod_1.z.string({ required_error: "Phone is required" }).min(1, "Phone cannot be empty"),
    company: zod_1.z.string().optional().nullable(),
    message: zod_1.z.string({ required_error: "Message is required" }).min(1, "Message cannot be empty"),
    selectedServices: zod_1.z.array(zod_1.z.string()).default([]),
    estimateRange: zod_1.z.string().optional().nullable(),
    estimateId: zod_1.z.string().optional().nullable(),
});
