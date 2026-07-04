import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { getForumPostById, getRelatedPosts, isPostSavedByUser } from "@/lib/data/forum";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ReplyForm from "@/components/forum/reply-form";
import ReplyItem from "@/components/forum/reply-item";
import PostActions from "@/components/forum/post-actions";
import BookmarkButton from "@/components/forum/bookmark-button";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import {
  MessageSquare,
  Pin,
  Lock,
  ArrowLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";

interface PostDetailPageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { postId } = await params;

  // 1. Fetch main post
  const post = await getForumPostById(postId);

  if (!post) {
    notFound();
  }

  // 2. Fetch related posts (sharing any tags)
  const relatedPosts = await getRelatedPosts(post.id, post.tag);

  // 3. Fetch authenticated user profile details
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let currentUserProfile = null;
  let initialSaved = false;
  if (authUser) {
    currentUserProfile = await prisma.userProfile.findUnique({
      where: { authUserId: authUser.id },
    });
    if (currentUserProfile) {
      initialSaved = await isPostSavedByUser(post.id, currentUserProfile.id);
    }
  }

  const isAuthor = currentUserProfile?.id === post.author.id;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
  const isAdmin = authUser?.email === adminEmail;

  // Split tags
  const tags = post.tag ? post.tag.split(",").map((t) => t.trim()) : [];



  return (
    <div className="bg-[#f8f9ff] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        
        {/* Breadcrumb Links */}
        <nav className="flex items-center gap-1.5 text-xs text-[#64748B] font-semibold">
          <Link href="/forum" className="hover:text-[#4f46e5]">
            Forum
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate max-w-[280px]">Discussions</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#0F172A] truncate max-w-[360px] font-bold">
            {post.title}
          </span>
        </nav>

        {/* Back Link */}
        <div>
          <Link
            href="/forum"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4f46e5] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Discussions
          </Link>
        </div>

        {/* Main Grid: Left thread + Right sidebar widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Post Details & Comment Stream */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Post Card */}
            <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
              <CardContent className="p-6 space-y-5">
                
                {/* Author Info */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-[#E2E8F0] rounded-full">
                      <AvatarImage src={post.author.imageUrl || ""} alt={post.author.name} />
                      <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold">
                        {post.author.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-[#0F172A]">{post.author.name}</p>
                        <span className="text-[10px] font-bold uppercase rounded-full bg-slate-100 text-slate-700 px-1.5 py-0.5">
                          {post.author.role.toLowerCase()}
                        </span>
                        {post.isPinned && (
                          <Badge className="bg-yellow-50 text-yellow-800 border-yellow-200 gap-1 rounded-full flex items-center py-0.5 text-[9.5px] font-bold">
                            <Pin className="h-2.5 w-2.5" /> Pinned
                          </Badge>
                        )}
                        {post.isLocked && (
                          <Badge className="bg-red-50 text-red-800 border-red-200 gap-1 rounded-full flex items-center py-0.5 text-[9.5px] font-bold">
                            <Lock className="h-2.5 w-2.5" /> Locked
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] font-medium mt-0.5">
                        Posted on{" "}
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Title & Body */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                    {post.title}
                  </h2>
                  <MarkdownRenderer content={post.content} />
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-50 my-1" />

                {/* Engagement Metrics Footer */}
                <div className="flex justify-between items-center flex-wrap gap-4 pt-1">
                  <div className="flex items-center gap-6 text-xs font-semibold text-[#64748B]">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.replies.length} Comments</span>
                    </div>
                    <BookmarkButton
                      postId={post.id}
                      initialSaved={initialSaved}
                      isAuthenticated={!!authUser}
                    />
                  </div>

                  {/* Actions for Author/Admin */}
                  <PostActions
                    postId={post.id}
                    isAuthor={isAuthor}
                    isAdmin={isAdmin}
                    isPinned={post.isPinned}
                    isLocked={post.isLocked}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reply Input Form */}
            {authUser ? (
              post.isLocked ? (
                <div className="border border-red-200 bg-red-50 text-red-700 text-xs font-semibold p-4 rounded-[4px] text-center">
                  This discussion has been locked by an administrator. Replies are disabled.
                </div>
              ) : (
                <ReplyForm postId={post.id} userProfile={currentUserProfile} />
              )
            ) : (
              <div className="border border-[#E2E8F0] bg-white rounded-[4px] p-6 text-center space-y-3">
                <p className="text-sm font-semibold text-[#0F172A]">
                  Join the academic discussion
                </p>
                <p className="text-xs text-[#64748B] font-medium max-w-xs mx-auto">
                  Log in or create a student/mentor account to post replies and share insights.
                </p>
                <div className="pt-2">
                  <Link href={`/login?next=/forum/${post.id}`}>
                    <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-xs rounded-[4px] px-5 py-2">
                      Sign In to Reply
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Replies Stream list */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0F172A] px-1">
                Discussion ({post.replies.length})
              </h3>
              
              <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none overflow-hidden">
                <CardContent className="p-0 divide-y divide-slate-100">
                  {post.replies.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#64748B] font-medium italic">
                      No comments posted yet. Start the discussion!
                    </div>
                  ) : (
                    post.replies.map((reply) => (
                      <ReplyItem
                        key={reply.id}
                        reply={reply}
                        currentUserProfileId={currentUserProfile?.id || null}
                        isAdmin={isAdmin}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column: Sidebar Panels */}
          <div className="space-y-6">
            {/* Panel 1: Related Discussions */}
            <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-[#4f46e5]" />
                  Related Discussions
                </h3>

                {relatedPosts.length === 0 ? (
                  <p className="text-xs text-[#64748B] font-medium italic">
                    No related topics found sharing matching tags.
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {relatedPosts.map((related) => {
                      const relatedTags = related.tag ? related.tag.split(",").map((t) => t.trim()) : [];
                      return (
                        <div key={related.id} className="space-y-1">
                          <Link
                            href={`/forum/${related.id}`}
                            className="text-sm font-bold text-[#0F172A] hover:text-[#4f46e5] block transition-colors leading-tight"
                          >
                            {related.title}
                          </Link>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#64748B] font-semibold">
                              By {related.author.name}
                            </span>
                            {relatedTags.length > 0 && (
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded font-medium">
                                #{relatedTags[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Panel 2: Author Spotlight */}
            <Card className="border border-[#E2E8F0] bg-[#fdfdff] rounded-[4px] shadow-none text-center">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xs font-bold text-[#4f46e5] uppercase tracking-wider border-b border-slate-100 pb-2">
                  Author Spotlight
                </h3>

                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-16 w-16 border border-[#E2E8F0] rounded-full">
                    <AvatarImage src={post.author.imageUrl || ""} alt={post.author.name} />
                    <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xl font-bold">
                      {post.author.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h4 className="text-base font-bold text-[#0F172A]">{post.author.name}</h4>
                    <p className="text-[10px] font-bold uppercase rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 inline-block mt-0.5">
                      {post.author.role.toLowerCase()}
                    </p>
                  </div>
                  
                  {post.author.mentorProfile?.headline && (
                    <p className="text-xs font-semibold text-indigo-600 leading-snug">
                      {post.author.mentorProfile.headline}
                    </p>
                  )}

                  {post.author.bio ? (
                    <p className="text-xs text-[#64748B] font-medium leading-relaxed max-w-[220px] pt-1">
                      {post.author.bio}
                    </p>
                  ) : (
                    <p className="text-xs text-[#64748B] font-medium italic pt-1">
                      Academic profile member participating in community sharing.
                    </p>
                  )}
                </div>

                {post.author.mentorProfile && (
                  <div className="pt-2">
                    <Link href={`/mentors/${post.author.mentorProfile.id}`}>
                      <Button
                        variant="outline"
                        className="w-full text-xs font-bold text-[#4f46e5] border-[#4f46e5] hover:bg-indigo-50/50 rounded-[4px] py-1.5 h-auto cursor-pointer"
                      >
                        View Profile
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
