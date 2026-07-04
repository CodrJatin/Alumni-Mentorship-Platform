"use server";

import prisma from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { forumPostSchema, forumReplySchema, ForumPostInput } from "@/lib/validations/forum";
import { revalidatePath } from "next/cache";


export async function createForumPostAction(data: ForumPostInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "Unauthorized. Please sign in to write a post." };
    }

    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: authUser.id },
    });

    if (!profile) {
      return { success: false, error: "User profile not found." };
    }

    const validatedData = forumPostSchema.parse(data);

    // Save comma-separated tags clean of spaces
    const cleanTags = validatedData.tag
      ? validatedData.tag
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(",")
      : null;

    const post = await prisma.forumPost.create({
      data: {
        authorId: profile.id,
        title: validatedData.title,
        content: validatedData.content,
        tag: cleanTags,
      },
    });

    revalidatePath("/forum");
    return { success: true, postId: post.id };
  } catch (error) {
    console.error("Create post error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export async function createForumReplyAction(postId: string, content: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "Unauthorized. Please sign in to reply." };
    }

    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: authUser.id },
    });

    if (!profile) {
      return { success: false, error: "User profile not found." };
    }

    const validatedData = forumReplySchema.parse({ content });

    // Check if post is locked
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: "Discussion post not found." };
    }

    if (post.isLocked) {
      return { success: false, error: "This discussion has been locked by an administrator." };
    }

    const reply = await prisma.forumReply.create({
      data: {
        postId,
        authorId: profile.id,
        content: validatedData.content,
      },
    });

    revalidatePath(`/forum/${postId}`);
    return { success: true, replyId: reply.id };
  } catch (error) {
    console.error("Create reply error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}

export async function deleteForumPostAction(postId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "Unauthorized." };
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
    const isAdmin = authUser.email === adminEmail;

    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: authUser.id },
    });

    if (!profile && !isAdmin) {
      return { success: false, error: "User profile not found." };
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    // Verify ownership or admin privileges
    if ((!profile || post.authorId !== profile.id) && !isAdmin) {
      return { success: false, error: "Unauthorized. You are not the author of this post." };
    }

    await prisma.forumPost.delete({
      where: { id: postId },
    });

    revalidatePath("/forum");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred.";
    return { success: false, error: message };
  }
}

export async function deleteForumReplyAction(replyId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "Unauthorized." };
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
    const isAdmin = authUser.email === adminEmail;

    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: authUser.id },
    });

    if (!profile && !isAdmin) {
      return { success: false, error: "User profile not found." };
    }

    const reply = await prisma.forumReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      return { success: false, error: "Reply not found." };
    }

    // Verify ownership or admin privileges
    if ((!profile || reply.authorId !== profile.id) && !isAdmin) {
      return { success: false, error: "Unauthorized." };
    }

    await prisma.forumReply.delete({
      where: { id: replyId },
    });

    revalidatePath(`/forum/${reply.postId}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred.";
    return { success: false, error: message };
  }
}

export async function togglePinPostAction(postId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "Unauthorized." };
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
    if (authUser.email !== adminEmail) {
      return { success: false, error: "Access denied. Admin role required." };
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    await prisma.forumPost.update({
      where: { id: postId },
      data: { isPinned: !post.isPinned },
    });

    revalidatePath(`/forum/${postId}`);
    revalidatePath("/forum");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred.";
    return { success: false, error: message };
  }
}

export async function toggleLockPostAction(postId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "Unauthorized." };
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
    if (authUser.email !== adminEmail) {
      return { success: false, error: "Access denied. Admin role required." };
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    await prisma.forumPost.update({
      where: { id: postId },
      data: { isLocked: !post.isLocked },
    });

    revalidatePath(`/forum/${postId}`);
    revalidatePath("/forum");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred.";
    return { success: false, error: message };
  }
}

export async function toggleSavePostAction(postId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: authUser.id },
    });

    if (!profile) {
      return { success: false, error: "User profile not found." };
    }

    // Check if post already saved
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: profile.id,
          postId: postId,
        },
      },
    });

    if (existingSave) {
      // Unsave
      await prisma.savedPost.delete({
        where: { id: existingSave.id },
      });
      revalidatePath(`/forum/${postId}`);
      revalidatePath("/forum");
      revalidatePath("/dashboard/forum");
      return { success: true, saved: false };
    } else {
      // Save
      await prisma.savedPost.create({
        data: {
          userId: profile.id,
          postId: postId,
        },
      });
      revalidatePath(`/forum/${postId}`);
      revalidatePath("/forum");
      revalidatePath("/dashboard/forum");
      return { success: true, saved: true };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred.";
    return { success: false, error: message };
  }
}

export async function updateForumPostAction(postId: string, data: ForumPostInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "Unauthorized." };
    }

    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: authUser.id },
    });

    if (!profile) {
      return { success: false, error: "User profile not found." };
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    if (post.authorId !== profile.id) {
      return { success: false, error: "Unauthorized. You are not the author of this post." };
    }

    const validatedData = forumPostSchema.parse(data);

    const cleanTags = validatedData.tag
      ? validatedData.tag
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .join(",")
      : null;

    await prisma.forumPost.update({
      where: { id: postId },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        tag: cleanTags,
      },
    });

    revalidatePath(`/forum/${postId}`);
    revalidatePath("/forum");
    revalidatePath("/dashboard/forum");
    return { success: true };
  } catch (error) {
    console.error("Update post error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: message };
  }
}
