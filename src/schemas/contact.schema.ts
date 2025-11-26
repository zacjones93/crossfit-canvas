import { z } from "zod";
import { catchaSchema } from "./catcha.schema";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required").max(5000, "Message is too long"),
  captchaToken: catchaSchema,
});

export type ContactFormSchema = z.infer<typeof contactFormSchema>;
