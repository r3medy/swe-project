import { z } from "zod";

export const createUserSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be at most 50 characters"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be at most 50 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(24, "Username must be at most 24 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    title: z.string().min(2, "Title must be at least 2 characters"),
    country: z.string().min(1, "Country is required"),
    role: z.enum(["Admin", "Freelancer", "Client"], {
      errorMap: () => ({ message: "Please select a valid role" }),
    }),
    gender: z.enum(["Male", "Female"], {
      errorMap: () => ({ message: "Please select a valid gender" }),
    }),
    bio: z.string().min(10, "Bio must be at least 10 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword)
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
  });
