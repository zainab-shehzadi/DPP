// frontend/validations/signupSchema.ts
import { z } from "zod";

export const signupSchema = z
  .object({
    DepartmentName: z.string().min(1, "Department is required"),
    position: z.string().min(1, "Position is required"),
    role: z.string().min(1, "Role is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
