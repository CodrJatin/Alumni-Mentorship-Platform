import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAllUsersForAdmin } from "@/lib/data/users";
import { getAllMentorsForAdmin } from "@/lib/data/mentors";
import { getAdminBookings } from "@/lib/data/bookings";
import { getAllForumPostsForAdmin } from "@/lib/data/forum";
import AdminDashboardClient from "@/components/admin/admin-dashboard-client";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
  if (authUser.email !== adminEmail) {
    redirect("/dashboard");
  }

  // Fetch all administrative data
  const usersRes = await getAllUsersForAdmin();
  const mentorsRes = await getAllMentorsForAdmin();
  const bookings = await getAdminBookings();
  const posts = await getAllForumPostsForAdmin();

  const users = usersRes.success && usersRes.users ? usersRes.users : [];
  const mentors = mentorsRes.success && mentorsRes.mentors ? mentorsRes.mentors : [];

  // Normalize dates to prevent NextJS serialization warnings
  const serializedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    imageUrl: u.imageUrl,
    createdAt: u.createdAt,
  }));

  const serializedMentors = mentors.map((m) => ({
    id: m.id,
    userId: m.userId,
    domain: m.domain,
    headline: m.headline,
    isActive: m.isActive,
    isFeatured: m.isFeatured,
    user: {
      name: m.user.name,
      email: m.user.email,
      imageUrl: m.user.imageUrl,
    },
  }));

  const serializedBookings = bookings.map((b) => ({
    id: b.id,
    topic: b.topic,
    message: b.message,
    preferredAt: b.preferredAt,
    status: b.status,
    createdAt: b.createdAt,
    student: {
      id: b.student.id,
      name: b.student.name,
      email: b.student.email,
    },
    mentor: {
      user: {
        name: b.mentor.user.name,
      },
    },
  }));

  const serializedPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    createdAt: p.createdAt,
    author: {
      id: p.author.id,
      name: p.author.name,
      email: p.author.email,
      role: p.author.role,
    },
    _count: {
      replies: p._count.replies,
    },
  }));

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      <AdminDashboardClient
        users={serializedUsers}
        mentors={serializedMentors}
        bookings={serializedBookings}
        posts={serializedPosts}
      />
    </div>
  );
}
