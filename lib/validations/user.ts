import { z } from "zod";

export const studentProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  imageUrl: z.string().nullable().optional(),
  major: z.string().min(2, "Major must be at least 2 characters.").nullable().optional().or(z.literal("")),
  yearOfStudy: z.string().nullable().optional().or(z.literal("")),
  bio: z.string().max(1000, "Bio cannot exceed 1000 characters.").nullable().optional().or(z.literal("")),
  skills: z.array(z.string()),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL.").nullable().optional().or(z.literal("")),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;
