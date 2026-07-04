import React from "react";
import Link from "next/link";
import prisma from "@/lib/db/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  ArrowRight,
} from "lucide-react";

// Time ago helper
function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) {
    const days = Math.floor(interval);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const hours = Math.floor(interval);
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    const minutes = Math.floor(interval);
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  }
  return "just now";
}

export default async function HomePage() {
  // Query featured active mentors first
  let featuredMentors = await prisma.mentorProfile.findMany({
    where: { isActive: true, isFeatured: true },
    take: 3,
    include: {
      user: {
        select: {
          name: true,
          imageUrl: true,
          email: true,
        },
      },
    },
  });

  // Fallback to active mentors if less than 3 are featured
  if (featuredMentors.length < 3) {
    const fallbackMentors = await prisma.mentorProfile.findMany({
      where: {
        isActive: true,
        id: { notIn: featuredMentors.map((m) => m.id) },
      },
      take: 3 - featuredMentors.length,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
            email: true,
          },
        },
      },
    });
    featuredMentors = [...featuredMentors, ...fallbackMentors];
  }

  // Query 5 latest forum posts
  const latestForumPosts = await prisma.forumPost.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff]">
      
      {/* 1. Hero Section */}
      <section className="bg-white border-b border-[#E2E8F0] py-20 px-8">
        <div className="max-w-5xl mx-auto space-y-6 text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0F172A] max-w-3xl leading-tight">
            Bridging the Gap Between Ambition and Experience.
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] max-w-2xl leading-relaxed">
            AluMentor connects driven current students with established alumni leaders. Gain
            clarity, forge professional connections, and navigate your career path with guidance from
            those who have walked it before.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/mentors">
              <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-sm rounded-[4px] px-6 py-2.5 h-auto border-0 cursor-pointer">
                Find a Mentor
              </Button>
            </Link>
            <Link href="/forum">
              <Button
                variant="outline"
                className="border-[#E2E8F0] text-[#0f172a] hover:bg-slate-50 font-semibold text-sm rounded-[4px] px-6 py-2.5 h-auto cursor-pointer"
              >
                Join the Discussion
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Stats Strip */}
      <section className="bg-white border-b border-[#E2E8F0] py-8 px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="border-l-2 border-slate-100 pl-4 space-y-1">
            <p className="text-3xl font-extrabold text-[#0F172A]">500+</p>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Active Mentors
            </p>
          </div>
          <div className="border-l-2 border-slate-100 pl-4 space-y-1">
            <p className="text-3xl font-extrabold text-[#0F172A]">1,200+</p>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Sessions Completed
            </p>
          </div>
          <div className="border-l-2 border-slate-100 pl-4 space-y-1">
            <p className="text-3xl font-extrabold text-[#0F172A]">98%</p>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Satisfaction Rate
            </p>
          </div>
          <div className="border-l-2 border-slate-100 pl-4 space-y-1">
            <p className="text-3xl font-extrabold text-[#0F172A]">50+</p>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              Industries Represented
            </p>
          </div>
        </div>
      </section>

      {/* 3. Featured Alumni Mentors Section */}
      <section className="py-16 px-8 bg-transparent">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#0F172A]">Featured Alumni Mentors</h2>
              <p className="text-xs text-[#64748B] font-medium">
                Connect with leaders across finance, technology, and consulting.
              </p>
            </div>
            <Link
              href="/mentors"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#4f46e5] hover:underline"
            >
              View All Mentors
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {featuredMentors.length === 0 ? (
            <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none py-10 text-center">
              <CardContent className="space-y-2">
                <p className="text-sm font-semibold text-[#0F172A]">No mentors registered yet</p>
                <p className="text-xs text-[#64748B] font-medium max-w-xs mx-auto">
                  Verify the system settings or register a new mentor account to feature alumni profiles.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredMentors.map((mentor) => {
                const isAvailable = mentor.availabilityStatus === "AVAILABLE";
                const isLimited = mentor.availabilityStatus === "LIMITED";
                
                return (
                  <Card
                    key={mentor.id}
                    className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none hover:border-[#4f46e5]/40 transition-colors"
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex gap-3 min-w-0">
                          <Avatar className="h-12 w-12 border border-[#E2E8F0] rounded-full flex-shrink-0">
                            <AvatarImage src={mentor.user.imageUrl || ""} alt={mentor.user.name} />
                            <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold text-base rounded-full">
                              {mentor.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-[#0F172A] truncate">
                              {mentor.user.name}
                            </h4>
                            <p className="text-xs text-[#64748B] font-medium line-clamp-2 leading-relaxed mt-0.5">
                              {mentor.headline} {mentor.institution ? `@ ${mentor.institution}` : ""}
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant="secondary"
                          className={`rounded-[4px] text-[9px] font-bold border-0 px-2 py-0.5 shrink-0 uppercase tracking-wider ${
                            isAvailable
                              ? "bg-[#ecfdf5] text-[#047857]"
                              : isLimited
                              ? "bg-[#fffbeb] text-[#d97706]"
                              : "bg-[#fef2f2] text-[#b91c1c]"
                          }`}
                        >
                          {mentor.availabilityStatus.toLowerCase()}
                        </Badge>
                      </div>

                      {/* Domain & Skills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[9px] font-semibold bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded">
                          {mentor.domain}
                        </span>
                        {mentor.skills.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className="text-[9px] font-semibold bg-slate-50 text-slate-500 border border-slate-100 px-2 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Latest from the Forum Section */}
      <section className="py-16 px-8 bg-transparent border-t border-[#E2E8F0]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#0F172A]">Latest from the Forum</h2>
              <p className="text-xs text-[#64748B] font-medium">
                Join discussions on career trajectories, interview prep, and industry trends.
              </p>
            </div>
            <Link
              href="/forum"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#4f46e5] hover:underline"
            >
              Browse Forum
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {latestForumPosts.length === 0 ? (
            <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none py-10 text-center">
              <CardContent className="space-y-2">
                <p className="text-sm font-semibold text-[#0F172A]">No posts published yet</p>
                <p className="text-xs text-[#64748B] font-medium max-w-xs mx-auto">
                  Be the first to publish a post inside the open discussion forums!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-[4px] divide-y divide-slate-100 overflow-hidden">
              {latestForumPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 flex justify-between items-center gap-4 hover:bg-slate-50/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <Link
                      href={`/forum/${post.id}`}
                      className="text-sm font-bold text-[#0F172A] hover:text-[#4f46e5] block truncate leading-snug"
                    >
                      {post.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#64748B] font-semibold">
                      <span>Posted by @{post.author.name}</span>
                      <span>&bull;</span>
                      <span>{formatTimeAgo(post.createdAt)}</span>
                      {post.tag && (
                        <>
                          <span>&bull;</span>
                          <span className="bg-slate-50 border border-slate-100 text-slate-500 rounded px-1.5 py-0.5">
                            {post.tag}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Replies count */}
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-[#0F172A] font-bold text-xs px-2.5 py-1 rounded-[4px] border-0 shrink-0"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-[#64748B]" />
                    {post._count.replies}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. Footer Section */}
      <footer className="bg-white border-t border-[#E2E8F0] py-10 px-8 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-[#0F172A]">AluMentor</h3>
            <p className="text-[11px] text-[#64748B] font-medium">
              &copy; 2026 AluMentor. Academic Professionalism Guaranteed.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-[#64748B]">
            <a href="#" className="hover:text-[#4f46e5]">About</a>
            <a href="#" className="hover:text-[#4f46e5]">Privacy Policy</a>
            <a href="#" className="hover:text-[#4f46e5]">Contact</a>
            <a href="#" className="hover:text-[#4f46e5]">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
