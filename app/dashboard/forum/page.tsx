import React from "react";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { getUserCreatedPosts, getUserSavedPosts } from "@/lib/data/forum";
import ManagePostsClient from "@/components/forum/manage-posts-client";

export default async function DashboardForumPage() {
  // Get active session
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?next=/dashboard/forum");
  }

  // Get User Profile
  const profile = await prisma.userProfile.findUnique({
    where: { authUserId: authUser.id },
  });

  if (!profile) {
    redirect("/dashboard");
  }

  // Fetch posts
  const createdPosts = await getUserCreatedPosts(profile.id);
  const savedPosts = await getUserSavedPosts(profile.id);

  return (
    <ManagePostsClient
      initialCreatedPosts={createdPosts}
      initialSavedPosts={savedPosts}
    />
  );
}
