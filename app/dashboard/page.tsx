import prisma from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedFadeIn from "@/components/ui/animated-fade-in";
import { UserRole } from "@prisma/client";
import { CalendarRange, MessageSquareCode, UserCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ensureUserProfile } from "@/lib/auth/ensure-user-profile";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
  if (user.email === adminEmail) {
    redirect("/admin");
  }

  const baseProfile = await ensureUserProfile(user);

  if (!baseProfile) {
    redirect("/login");
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: baseProfile.id },
    include: {
      mentorProfile: true,
    },
  });

  if (!profile) {
    redirect("/login");
  }

  const isMentor = profile.role === UserRole.MENTOR;

  // Fetch requests count
  let requestsCount = 0;
  if (profile.role === UserRole.STUDENT) {
    requestsCount = await prisma.bookingRequest.count({
      where: { student: { authUserId: user.id } },
    });
  } else if (profile.role === UserRole.MENTOR) {
    requestsCount = await prisma.bookingRequest.count({
      where: { mentor: { user: { authUserId: user.id } } },
    });
  }

  // Fetch posts count
  const postsCount = await prisma.forumPost.count({
    where: { author: { authUserId: user.id } },
  });

  return (
    <div className="space-y-6">
      <AnimatedFadeIn duration={0.3}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            Welcome back to the academic portal, {profile.name}.
          </p>
        </div>
      </AnimatedFadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Card: Profile */}
        <AnimatedFadeIn delay={0.05} duration={0.35}>
          <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-[#0F172A]">Profile Status</CardTitle>
              <UserCircle2 className="h-5 w-5 text-[#4F46E5]" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold text-[#0F172A]">
                {isMentor ? "Mentor" : "Student"}
              </div>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                {isMentor
                  ? profile.mentorProfile
                    ? "Your academic mentor profile is active and public."
                    : "Complete your mentor profile to accept session requests."
                  : "Browse verified alumni mentors and request guidance."}
              </p>
              <Link
                href="/dashboard/profile"
                className="text-xs font-semibold text-[#4F46E5] flex items-center gap-1.5 mt-4 hover:underline"
              >
                {profile.mentorProfile ? "Edit Profile" : "Complete Profile"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </AnimatedFadeIn>

        {/* Quick Card: Sessions/Bookings */}
        <AnimatedFadeIn delay={0.12} duration={0.35}>
          <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-[#0F172A]">Sessions</CardTitle>
              <CalendarRange className="h-5 w-5 text-[#10B981]" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold text-[#0F172A]">
                {requestsCount} {requestsCount === 1 ? "Request" : "Requests"}
              </div>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                {isMentor
                  ? "Mentorship requests received from students seeking academic support."
                  : "Booking requests sent to alumni mentors for academic advising."}
              </p>
              <Link
                href="/dashboard/requests"
                className="text-xs font-semibold text-[#4F46E5] flex items-center gap-1.5 mt-4 hover:underline"
              >
                View Requests
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </AnimatedFadeIn>

        {/* Quick Card: Forum */}
        <AnimatedFadeIn delay={0.19} duration={0.35}>
          <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-[#0F172A]">Forum Activity</CardTitle>
              <MessageSquareCode className="h-5 w-5 text-[#f59e0b]" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold text-[#0F172A]">
                {postsCount} {postsCount === 1 ? "Post" : "Posts"}
              </div>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                Questions and discussions started by you in the forum.
              </p>
              <Link
                href="/forum"
                className="text-xs font-semibold text-[#4F46E5] flex items-center gap-1.5 mt-4 hover:underline"
              >
                Visit Forum
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </AnimatedFadeIn>
      </div>
    </div>
  );
}
