import { z } from "zod";

export const bookingRequestSchema = z.object({
  topic: z
    .string()
    .min(5, "Topic must be at least 5 characters long")
    .max(100, "Topic cannot exceed 100 characters"),
  message: z
    .string()
    .min(20, "Message must be at least 20 characters to explain your requirements")
    .max(1000, "Message cannot exceed 1000 characters"),
  preferredAt: z
    .string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true;
      const parsedDate = new Date(val);
      return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
    }, "Preferred date and time must be in the future"),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;

export const bookingResponseSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"]),
  responseNote: z
    .string()
    .max(500, "Response note cannot exceed 500 characters")
    .optional()
    .nullable(),
});

export type BookingResponseInput = z.infer<typeof bookingResponseSchema>;
