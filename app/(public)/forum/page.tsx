import Link from "next/link";
import { getForumPosts } from "@/lib/data/forum";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Search,
  Pin,
  Lock,
} from "lucide-react";
import AnimatedFadeIn from "@/components/ui/animated-fade-in";

interface ForumPageProps {
  searchParams: Promise<{ search?: string; time?: string }>;
}

export default async function ForumPage({ searchParams }: ForumPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const selectedTime = params.time || "ALL";

  // Fetch posts
  const posts = await getForumPosts(search, selectedTime);

  // Authenticate user to see if they can create posts
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Time filters list
  const timeFilters = [
    { label: "All Time", value: "ALL" },
    { label: "Last 24 Hours", value: "24H" },
    { label: "Last 7 Days", value: "7D" },
    { label: "Last 30 Days", value: "30D" },
  ];



  return (
    <div className="bg-[#f8f9ff] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-6 space-y-8">
        
        {/* Heading Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
              Alumni & Student Forum
            </h1>
            <p className="text-sm text-[#64748B] mt-1 font-medium max-w-xl">
              A dedicated space for sharing academic insights, professional advice, and connecting with the broader AluMentor community.
            </p>
          </div>
          <Link href={user ? "/dashboard/forum/new" : "/login?next=/dashboard/forum/new"}>
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold rounded-[4px] px-5 py-2.5 text-sm cursor-pointer border-0">
              New Post
            </Button>
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search form */}
          <form method="GET" action="/forum" className="relative flex items-center w-full md:max-w-md">
            <Search className="absolute left-3 h-4 w-4 text-[#64748B]" />
            <Input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search discussions..."
              className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-[4px] text-sm text-[#0F172A] placeholder-[#64748B] bg-white focus-visible:ring-1 focus-visible:ring-[#4f46e5] focus-visible:border-[#4f46e5]"
            />
            {selectedTime !== "ALL" && (
              <input type="hidden" name="time" value={selectedTime} />
            )}
          </form>

          {/* Time filter pills */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {timeFilters.map((filter) => {
              const isActive = selectedTime === filter.value;
              
              // Build link URL parameters
              const urlParams = new URLSearchParams();
              if (search) urlParams.set("search", search);
              if (filter.value !== "ALL") urlParams.set("time", filter.value);

              return (
                <Link
                  key={filter.value}
                  href={`/forum?${urlParams.toString()}`}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                    isActive
                      ? "bg-white border-[#4f46e5] text-[#4f46e5]"
                      : "bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0f172a] hover:border-slate-300"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Discussions List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
              <CardContent className="p-12 text-center space-y-2">
                <MessageSquare className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-[#0F172A]">No discussions found</p>
                <p className="text-xs text-[#64748B] font-medium max-w-sm mx-auto">
                  Be the first to start a conversation in this topic! Click the &ldquo;New Post&rdquo; button above to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post, index) => {
              const tags = post.tag ? post.tag.split(",").map((t) => t.trim()) : [];


              return (
                <AnimatedFadeIn key={post.id} delay={index * 0.04}>
                  <Card
                    className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none hover:border-[#4f46e5]/40 transition-all duration-200"
                  >
                    <CardContent className="p-6 space-y-3">
                      {/* Post Meta Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 rounded-full border border-[#E2E8F0]">
                            <AvatarImage src={post.author.imageUrl || ""} alt={post.author.name} />
                            <AvatarFallback className="bg-indigo-50 text-indigo-700 text-sm font-bold">
                              {post.author.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-[#0F172A]">{post.author.name}</p>
                              <span className="text-[10px] font-bold uppercase rounded-full bg-slate-100 text-slate-700 px-1.5 py-0.5">
                                {post.author.role.toLowerCase()}
                              </span>
                              {post.isPinned && (
                                <Badge className="bg-yellow-50 text-yellow-800 border-yellow-200 gap-1 rounded-full flex items-center py-0.5 text-[9px] font-bold">
                                  <Pin className="h-2.5 w-2.5" /> Pinned
                                </Badge>
                              )}
                              {post.isLocked && (
                                <Badge className="bg-red-50 text-red-800 border-red-200 gap-1 rounded-full flex items-center py-0.5 text-[9px] font-bold">
                                  <Lock className="h-2.5 w-2.5" /> Locked
                                </Badge>
                              )}
                            </div>
                            <span className="text-slate-300 text-xs hidden sm:inline">|</span>
                            <p className="text-xs text-[#64748B] font-medium">
                              {new Date(post.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            {/* Tags next to author info */}
                            {tags.length > 0 && (
                              <>
                                <span className="text-slate-300 text-xs hidden sm:inline">|</span>
                                <div className="flex flex-wrap gap-1">
                                  {tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[9px] font-semibold bg-slate-50 text-[#4f46e5] px-2 py-0.5 rounded border border-indigo-50"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Comments at top right */}
                        <div className="flex items-center gap-1 bg-slate-50 text-slate-600 font-bold text-xs px-2.5 py-1 rounded-[4px] border-0 shrink-0">
                          <MessageSquare className="h-3.5 w-3.5 text-[#64748B]" />
                          <span>{post._count.replies}</span>
                        </div>
                      </div>

                      {/* Post Title Only */}
                      <div className="pt-1">
                        <Link
                          href={`/forum/${post.id}`}
                          className="text-lg font-bold text-[#0F172A] hover:text-[#4f46e5] block transition-colors leading-snug"
                        >
                          {post.title}
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedFadeIn>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
