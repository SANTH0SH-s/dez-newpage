"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingsSchema = exports.updateFAQSchema = exports.createFAQSchema = exports.updateMultiplierSchema = exports.createMultiplierSchema = exports.updateQuestionSchema = exports.createQuestionSchema = exports.questionOptionSchema = exports.validationRuleSchema = exports.updateComponentSchema = exports.createComponentSchema = exports.updatePackageSchema = exports.createPackageSchema = exports.updateServiceSchema = exports.createServiceSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
});
exports.createServiceSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "ID is required"),
    name: zod_1.z.string().min(1, "Name is required"),
    category: zod_1.z.string().min(1, "Category is required"),
    description: zod_1.z.string().min(1, "Description is required"),
    iconName: zod_1.z.string().min(1, "Icon name is required"),
    iconImage: zod_1.z.string().optional(),
    cardImage: zod_1.z.string().optional(),
    heroBanner: zod_1.z.string().optional(),
    thumbnail: zod_1.z.string().optional(),
    basePrice: zod_1.z.coerce.number().min(0, "Base price must be non-negative"),
    unitType: zod_1.z.string().min(1, "Unit type is required"),
    status: zod_1.z.enum(["active", "inactive"]).default("active"),
});
exports.updateServiceSchema = exports.createServiceSchema.partial();
exports.createPackageSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "ID is required"),
    name: zod_1.z.string().min(1, "Name is required"),
    price: zod_1.z.coerce.number().min(0, "Price must be non-negative"),
    timeline: zod_1.z.string().min(1, "Timeline is required"),
    description: zod_1.z.string().min(1, "Description is required"),
    isRecommended: zod_1.z.boolean().default(false),
    isPopular: zod_1.z.boolean().default(false),
    isBestValue: zod_1.z.boolean().default(false),
    isNew: zod_1.z.boolean().default(false),
    displayOrder: zod_1.z.coerce.number().int().default(0),
    status: zod_1.z.enum(["active", "inactive"]).default("active"),
    features: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.updatePackageSchema = exports.createPackageSchema.partial();
exports.createComponentSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "ID is required"),
    name: zod_1.z.string().min(1, "Name is required"),
    pricingType: zod_1.z.enum(["fixed", "per-unit"]).default("fixed"),
    price: zod_1.z.coerce.number().min(0, "Price must be non-negative"),
    description: zod_1.z.string().min(1, "Description is required"),
    maxQuantity: zod_1.z.coerce.number().int().nullable().optional(),
    iconName: zod_1.z.string().nullable().optional(),
    status: zod_1.z.enum(["active", "inactive"]).default("active"),
    category: zod_1.z.string().min(1, "Category is required"),
    billingCycle: zod_1.z.enum(["one-time", "monthly"]).default("one-time"),
    note: zod_1.z.string().nullable().optional(),
});
exports.updateComponentSchema = exports.createComponentSchema.partial();
exports.validationRuleSchema = zod_1.z.object({
    min: zod_1.z.coerce.number().int().nullable().optional(),
    max: zod_1.z.coerce.number().int().nullable().optional(),
    pattern: zod_1.z.string().nullable().optional(),
    message: zod_1.z.string().nullable().optional(),
});
exports.questionOptionSchema = zod_1.z.object({
    value: zod_1.z.string().min(1, "Value is required"),
    label: zod_1.z.string().min(1, "Label is required"),
    priceModifier: zod_1.z.coerce.number().default(0),
    modifierType: zod_1.z.enum(["flat", "multiplier"]).default("flat"),
    description: zod_1.z.string().nullable().optional(),
});
exports.createQuestionSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "ID is required"),
    text: zod_1.z.string().min(1, "Text is required"),
    description: zod_1.z.string().nullable().optional(),
    type: zod_1.z.enum(["radio", "checkbox", "select", "counter", "number", "text", "toggle"]),
    isRequired: zod_1.z.boolean().default(true),
    displayOrder: zod_1.z.coerce.number().int().default(0),
    defaultValue: zod_1.z.any().optional(),
    priceModifier: zod_1.z.coerce.number().default(0),
    modifierType: zod_1.z.enum(["flat", "multiplier"]).default("flat"),
    conditionalParentId: zod_1.z.string().nullable().optional(),
    conditionalParentValue: zod_1.z.string().nullable().optional(),
    packageId: zod_1.z.string().nullable().optional(),
    validationRules: exports.validationRuleSchema.nullable().optional(),
    options: zod_1.z.array(exports.questionOptionSchema).optional(),
});
exports.updateQuestionSchema = exports.createQuestionSchema.partial();
exports.createMultiplierSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, "ID is required"),
    category: zod_1.z.enum(["complexity", "urgency", "quality"]),
    label: zod_1.z.string().min(1, "Label is required"),
    value: zod_1.z.coerce.number().min(0, "Value must be non-negative"),
    description: zod_1.z.string().nullable().optional(),
});
exports.updateMultiplierSchema = exports.createMultiplierSchema.partial();
exports.createFAQSchema = zod_1.z.object({
    question: zod_1.z.string().min(1, "Question is required"),
    answer: zod_1.z.string().min(1, "Answer is required"),
    displayOrder: zod_1.z.coerce.number().int().default(0),
    status: zod_1.z.enum(["active", "inactive"]).default("active"),
});
exports.updateFAQSchema = exports.createFAQSchema.partial();
exports.updateSettingsSchema = zod_1.z.object({
    companyName: zod_1.z.string().min(1).optional(),
    currency: zod_1.z.string().min(1).optional(),
    taxRate: zod_1.z.coerce.number().min(0).optional(),
    discountRate: zod_1.z.coerce.number().min(0).optional(),
    defaultPricingMode: zod_1.z.string().min(1).optional(),
    minimumCost: zod_1.z.coerce.number().min(0).optional(),
    maximumCost: zod_1.z.coerce.number().min(0).optional(),
    whatsappNumber: zod_1.z.string().nullable().optional(),
    gateEstimateWithLeadForm: zod_1.z.boolean().optional(),
});
