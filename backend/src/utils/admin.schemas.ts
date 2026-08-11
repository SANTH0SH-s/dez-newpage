import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const createServiceSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  iconName: z.string().min(1, "Icon name is required"),
  iconImage: z.string().optional(),
  cardImage: z.string().optional(),
  heroBanner: z.string().optional(),
  thumbnail: z.string().optional(),
  basePrice: z.coerce.number().min(0, "Base price must be non-negative"),
  unitType: z.string().min(1, "Unit type is required"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateServiceSchema = createServiceSchema.partial();

export const createPackageSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  timeline: z.string().min(1, "Timeline is required"),
  description: z.string().min(1, "Description is required"),
  isRecommended: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isBestValue: z.boolean().default(false),
  isNew: z.boolean().default(false),
  displayOrder: z.coerce.number().int().default(0),
  status: z.enum(["active", "inactive"]).default("active"),
  features: z.array(z.string()).default([]),
});

export const updatePackageSchema = createPackageSchema.partial();

export const createComponentSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name is required"),
  pricingType: z.enum(["fixed", "per-unit"]).default("fixed"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  description: z.string().min(1, "Description is required"),
  maxQuantity: z.coerce.number().int().nullable().optional(),
  iconName: z.string().nullable().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  category: z.string().min(1, "Category is required"),
  billingCycle: z.enum(["one-time", "monthly"]).default("one-time"),
  note: z.string().nullable().optional(),
});

export const updateComponentSchema = createComponentSchema.partial();

export const validationRuleSchema = z.object({
  min: z.coerce.number().int().nullable().optional(),
  max: z.coerce.number().int().nullable().optional(),
  pattern: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
});

export const questionOptionSchema = z.object({
  value: z.string().min(1, "Value is required"),
  label: z.string().min(1, "Label is required"),
  priceModifier: z.coerce.number().default(0),
  modifierType: z.enum(["flat", "multiplier"]).default("flat"),
  description: z.string().nullable().optional(),
});

export const createQuestionSchema = z.object({
  id: z.string().min(1, "ID is required"),
  text: z.string().min(1, "Text is required"),
  description: z.string().nullable().optional(),
  type: z.enum(["radio", "checkbox", "select", "counter", "number", "text", "toggle"]),
  isRequired: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
  defaultValue: z.any().optional(),
  priceModifier: z.coerce.number().default(0),
  modifierType: z.enum(["flat", "multiplier"]).default("flat"),
  conditionalParentId: z.string().nullable().optional(),
  conditionalParentValue: z.string().nullable().optional(),
  packageId: z.string().nullable().optional(),
  validationRules: validationRuleSchema.nullable().optional(),
  options: z.array(questionOptionSchema).optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const createMultiplierSchema = z.object({
  id: z.string().min(1, "ID is required"),
  category: z.enum(["complexity", "urgency", "quality"]),
  label: z.string().min(1, "Label is required"),
  value: z.coerce.number().min(0, "Value must be non-negative"),
  description: z.string().nullable().optional(),
});

export const updateMultiplierSchema = createMultiplierSchema.partial();

export const createFAQSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  displayOrder: z.coerce.number().int().default(0),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateFAQSchema = createFAQSchema.partial();

export const updateSettingsSchema = z.object({
  companyName: z.string().min(1).optional(),
  currency: z.string().min(1).optional(),
  taxRate: z.coerce.number().min(0).optional(),
  discountRate: z.coerce.number().min(0).optional(),
  defaultPricingMode: z.string().min(1).optional(),
  minimumCost: z.coerce.number().min(0).optional(),
  maximumCost: z.coerce.number().min(0).optional(),
  whatsappNumber: z.string().nullable().optional(),
  gateEstimateWithLeadForm: z.boolean().optional(),
});
