import { z } from "zod";

export const EstimateCalculateSchema = z.object({
  services: z.array(
    z.object({
      serviceId: z.string({ required_error: "Service ID is required" }),
      packageId: z.string().optional().nullable(),
      answers: z.record(z.any()).default({}),
      addons: z.array(
        z.object({
          pricingComponentId: z.string({ required_error: "pricingComponentId is required" }),
          units: z.number().int().min(1).default(1),
        })
      ).default([]),
    })
  ).min(1, "At least one service must be selected"),
  multipliers: z.object({
    complexity: z.string().optional().nullable(),
    urgency: z.string().optional().nullable(),
    quality: z.string().optional().nullable(),
  }).default({}),
});

export type EstimateCalculateInput = z.infer<typeof EstimateCalculateSchema>;

export const EstimateCreateSchema = EstimateCalculateSchema.extend({
  customer: z.object({
    name: z.string({ required_error: "Name is required" }).min(1, "Name cannot be empty"),
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
    phone: z.string().optional().nullable(),
    company: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }).optional().nullable(),
});

export type EstimateCreateInput = z.infer<typeof EstimateCreateSchema>;

export const EnquiryCreateSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(1, "Name cannot be empty"),
  email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
  phone: z.string({ required_error: "Phone is required" }).min(1, "Phone cannot be empty"),
  company: z.string().optional().nullable(),
  message: z.string({ required_error: "Message is required" }).min(1, "Message cannot be empty"),
  selectedServices: z.array(z.string()).default([]),
  estimateRange: z.string().optional().nullable(),
  estimateId: z.string().optional().nullable(),
});

export type EnquiryCreateInput = z.infer<typeof EnquiryCreateSchema>;
