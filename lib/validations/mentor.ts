import { z } from "zod";

export const backgroundEntrySchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "Title must be at least 2 characters"),
  institution: z.string().min(2, "Institution/Organization is required"),
  startYear: z.string().regex(/^\d{4}$/, "Must be a 4-digit year"),
  endYear: z.string().refine((val) => val === "Present" || /^\d{4}$/.test(val), {
    message: "Must be a 4-digit year or 'Present'",
  }),
  description: z.string().optional().nullable(),
});

export const mentorProfileSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  headline: z.string().min(2, "Professional title is required"),
  institution: z.string().min(2, "Organization/Institution is required"),
  domain: z.string().min(2, "Primary domain is required"),
  experienceYears: z.number()
    .min(0, "Years of experience cannot be negative")
    .max(60, "Invalid years of experience"),
  bio: z.string().min(40, "Biography must be at least 40 characters to be professional"),
  skills: z.array(z.string()),
  availabilityStatus: z.enum(["AVAILABLE", "LIMITED", "UNAVAILABLE"]),
  availabilityNote: z.string().optional().nullable(),
  backgroundEntries: z.array(backgroundEntrySchema),
});

export type MentorProfileInput = z.infer<typeof mentorProfileSchema>;
export type BackgroundEntryInput = z.infer<typeof backgroundEntrySchema>;
