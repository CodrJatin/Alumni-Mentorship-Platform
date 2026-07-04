import { z } from "zod";

export const forumPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title cannot exceed 100 characters."),
  content: z.string().min(10, "Content must be at least 10 characters.").max(5000, "Content cannot exceed 5000 characters."),
  tag: z.string().max(100, "Tags length cannot exceed 100 characters.").optional().or(z.literal("")),
});

export const forumReplySchema = z.object({
  content: z.string().min(2, "Reply must be at least 2 characters.").max(1000, "Reply cannot exceed 1000 characters."),
});

export type ForumPostInput = z.infer<typeof forumPostSchema>;
export type ForumReplyInput = z.infer<typeof forumReplySchema>;
