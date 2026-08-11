import { z } from "zod";

export const serviceIdSchema = z.object({
  id: z.string().min(1, "Service ID must not be empty"),
});

export const serviceIdParamSchema = z.object({
  serviceId: z.string().min(1, "Service ID must not be empty"),
});
