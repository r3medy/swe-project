import { z } from "zod";

const firstStepSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters long")
    .max(100, "First name exceeds 100 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters long")
    .max(100, "Last name exceeds 100 characters"),
  gender: z.enum(["Male", "Female"]),
  country: z
    .string()
    .min(2, "A country must be selected")
    .max(3, "Country exceeds 3 characters"),
});

const secondStepSchema = z.object({
  role: z.enum(["Client", "Freelancer"]),
  title: z
    .string()
    .min(2, "Title must be at least 2 characters long")
    .max(100, "Title exceeds 100 characters"),
  bio: z
    .string()
    .min(2, "Bio must be at least 2 characters long")
    .max(256, "Bio exceeds 256 characters"),
});

export { firstStepSchema, secondStepSchema };
