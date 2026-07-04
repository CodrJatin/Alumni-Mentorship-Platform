"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { deleteForumPostAction, toggleSavePostAction } from "@/lib/actions/forum.actions";
import { toast } from "sonner";
import {
  MessageSquare,
  Edit,
  Trash2,
  Bookmark,
  BookmarkX,
  Plus,
} from "lucide-react";
import ConfirmModal from "@/components/ui/confirm-modal";

interface PostItem {
  id: string;
  title: string;
  content: string;
  tag: string | null;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    imageUrl: string | null;
    role: string;
  };
  _count: {
    replies: number;
  };
}

interface ManagePostsClientProps {
  initialCreatedPosts: PostItem[];
  initialSavedPosts: PostItem[];
}

export default function ManagePostsClient({
  initialCreatedPosts,
  initialSavedPosts,
}: ManagePostsClientProps) {
  const router = useRouter();
  const [createdPosts, setCreatedPosts] = useState<PostItem[]>(initialCreatedPosts);
  const [savedPosts, setSavedPosts] = useState<PostItem[]>(initialSavedPosts);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Confirm modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDeleteTrigger = (postId: string) => {
    setPendingDeleteId(postId);
    setIsConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!pendingDeleteId) return;
    setLoadingId(pendingDeleteId);
    try {
      const result = await deleteForumPostAction(pendingDeleteId);
      if (result.success) {
        toast.success("Discussion post deleted successfully.");
        setCreatedPosts((prev) => prev.filter((p) => p.id !== pendingDeleteId));
        setSavedPosts((prev) => prev.filter((p) => p.id !== pendingDeleteId));
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete discussion.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoadingId(null);
      setPendingDeleteId(null);
      setIsConfirmOpen(false);
    }
  };

  const handleUnsave = async (postId: string) => {
    setLoadingId(postId);
    try {
      const result = await toggleSavePostAction(postId);
      if (result.success && !result.saved) {
        toast.success("Discussion unsaved.");
        setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
        router.refresh();
      } else {
        toast.error(result.error || "Failed to unsave discussion.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      
      {/* Page Title & New Post CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">My Forums</h1>
          <p className="text-sm text-[#64748B] font-medium mt-0.5">
            Manage the discussion posts you have authored and topics you have bookmarked for later.
          </p>
        </div>
        <Link href="/dashboard/forum/new">
          <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold rounded-[4px] px-4 py-2 text-xs flex items-center gap-1.5 border-0">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Section 1: Saved Discussions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#0F172A] border-b border-slate-100 pb-2 flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-[#4f46e5] fill-[#4f46e5]" />
          Saved Discussions ({savedPosts.length})
        </h2>

        {savedPosts.length === 0 ? (
          <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
            <CardContent className="p-8 text-center text-xs text-[#64748B] font-medium italic">
              No saved discussions. Bookmark topics in the{" "}
              <Link href="/forum" className="text-[#4f46e5] font-bold hover:underline">
                main forum
              </Link>{" "}
              to keep track of them here!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {savedPosts.map((post) => {
              return (
                <Card
                  key={post.id}
                  className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none hover:border-[#4f46e5]/40 transition-colors"
                >
                  <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    
                    {/* Post Detail Column */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          href={`/forum/${post.id}`}
                          className="text-base font-bold text-[#0F172A] hover:text-[#4f46e5] transition-colors leading-snug"
                        >
                          {post.title}
                        </Link>
                        {post.isPinned && (
                          <Badge className="bg-yellow-50 text-yellow-800 border-yellow-200 py-0 px-1 text-[8.5px] font-bold">
                            Pinned
                          </Badge>
                        )}
                        {post.isLocked && (
                          <Badge className="bg-red-50 text-red-800 border-red-200 py-0 px-1 text-[8.5px] font-bold">
                            Locked
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-[#64748B] font-medium flex-wrap">
                        <Avatar className="h-5 w-5 border border-slate-100 rounded-full flex-shrink-0">
                          <AvatarImage src={post.author.imageUrl || ""} />
                          <AvatarFallback className="text-[9px] font-bold">
                            {post.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {post.author.name} ({post.author.role.toLowerCase()})
                        </span>
                        <span>&bull;</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {post._count.replies} Replies
                        </span>
                      </div>
                    </div>

                    {/* Unsave CTA */}
                    <Button
                      onClick={() => handleUnsave(post.id)}
                      disabled={loadingId === post.id}
                      variant="outline"
                      className="border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-[4px] text-xs font-semibold px-3 py-1.5 h-auto self-stretch md:self-auto cursor-pointer"
                    >
                      <BookmarkX className="h-4 w-4 mr-1.5" />
                      Unsave
                    </Button>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Created Discussions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#0F172A] border-b border-slate-100 pb-2 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#4f46e5]" />
          My Authored Discussions ({createdPosts.length})
        </h2>

        {createdPosts.length === 0 ? (
          <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
            <CardContent className="p-8 text-center text-xs text-[#64748B] font-medium italic">
              You haven&apos;t posted any discussions yet. Click &ldquo;New Post&rdquo; at the top to start a conversation!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {createdPosts.map((post) => {
              const tags = post.tag ? post.tag.split(",").map((t) => t.trim()) : [];
              return (
                <Card
                  key={post.id}
                  className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none hover:border-[#4f46e5]/40 transition-colors"
                >
                  <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    
                    {/* Post Detail Column */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          href={`/forum/${post.id}`}
                          className="text-base font-bold text-[#0F172A] hover:text-[#4f46e5] transition-colors leading-snug"
                        >
                          {post.title}
                        </Link>
                        {post.isPinned && (
                          <Badge className="bg-yellow-50 text-yellow-800 border-yellow-200 py-0 px-1 text-[8.5px] font-bold">
                            Pinned
                          </Badge>
                        )}
                        {post.isLocked && (
                          <Badge className="bg-red-50 text-red-800 border-red-200 py-0 px-1 text-[8.5px] font-bold">
                            Locked
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-[#64748B] font-medium flex-wrap">
                        <span>
                          Posted on{" "}
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {post._count.replies} Replies
                        </span>
                        {tags.length > 0 && (
                          <>
                            <span>&bull;</span>
                            <div className="flex gap-1">
                              {tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] bg-slate-100 text-slate-600 px-1.5 rounded"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Edit/Delete Actions */}
                    <div className="flex items-center gap-2 self-stretch md:self-auto">
                      <Link href={`/dashboard/forum/edit/${post.id}`} className="flex-1 md:flex-initial">
                        <Button
                          variant="outline"
                          className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-[4px] text-xs font-semibold px-3 py-1.5 h-auto flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </Link>
                      
                      <Button
                        onClick={() => handleDeleteTrigger(post.id)}
                        disabled={loadingId === post.id}
                        variant="ghost"
                        className="flex-1 md:flex-initial text-red-600 hover:text-red-700 hover:bg-red-50 rounded-[4px] text-xs font-semibold px-3 py-1.5 h-auto flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={executeDelete}
        title="Delete Discussion Post"
        description="Are you sure you want to delete this discussion post? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
