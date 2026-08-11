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
