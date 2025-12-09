import { z } from "zod";

const firstStepSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
});

const secondStepSchema = z.object({
  paymentMethod: z.enum(["Fixed", "Hourly"]),
  paymentAmount: z.coerce.number().min(1, "Payment amount must be at least 1"),
});

export { firstStepSchema, secondStepSchema };
