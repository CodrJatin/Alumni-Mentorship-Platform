import React from "react";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import EditPostForm from "@/components/forum/edit-post-form";

interface EditPostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { postId } = await params;

  // Get active session
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect(`/login?next=/dashboard/forum/edit/${postId}`);
  }

  // Get User Profile
  const profile = await prisma.userProfile.findUnique({
    where: { authUserId: authUser.id },
  });

  if (!profile) {
    redirect("/dashboard");
  }

  // Fetch post
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
  });

  if (!post) {
    notFound();
  }

  // Verify ownership
  if (post.authorId !== profile.id) {
    redirect("/dashboard/forum");
  }

  return <EditPostForm post={post} />;
}
