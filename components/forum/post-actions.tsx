"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  deleteForumPostAction,
  togglePinPostAction,
  toggleLockPostAction,
} from "@/lib/actions/forum.actions";
import { toast } from "sonner";
import { Loader2, Pin, Lock, Trash2 } from "lucide-react";

interface PostActionsProps {
  postId: string;
  isAuthor: boolean;
  isAdmin: boolean;
  isPinned: boolean;
  isLocked: boolean;
}

export default function PostActions({
  postId,
  isAuthor,
  isAdmin,
  isPinned,
  isLocked,
}: PostActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"delete" | "pin" | "lock" | null>(null);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this discussion?")) return;
    setLoading("delete");
    try {
      const result = await deleteForumPostAction(postId);
      if (result.success) {
        toast.success("Discussion deleted successfully.");
        router.push("/forum");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete post.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(null);
    }
  };

  const handleTogglePin = async () => {
    setLoading("pin");
    try {
      const result = await togglePinPostAction(postId);
      if (result.success) {
        toast.success(isPinned ? "Post unpinned." : "Post pinned successfully.");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to pin post.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(null);
    }
  };

  const handleToggleLock = async () => {
    setLoading("lock");
    try {
      const result = await toggleLockPostAction(postId);
      if (result.success) {
        toast.success(isLocked ? "Post unlocked." : "Post locked successfully.");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to lock post.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(null);
    }
  };

  if (!isAuthor && !isAdmin) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
      {/* Admin Pinned Toggle */}
      {isAdmin && (
        <Button
          onClick={handleTogglePin}
          disabled={loading !== null}
          variant="outline"
          className={`text-xs font-semibold rounded-[4px] px-3 py-1 h-auto ${
            isPinned
              ? "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
              : "text-slate-600 hover:bg-slate-50 border-slate-200"
          }`}
        >
          {loading === "pin" ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
          ) : (
            <Pin className="h-3 w-3 mr-1.5" />
          )}
          {isPinned ? "Unpin Post" : "Pin Post"}
        </Button>
      )}

      {/* Admin Locked Toggle */}
      {isAdmin && (
        <Button
          onClick={handleToggleLock}
          disabled={loading !== null}
          variant="outline"
          className={`text-xs font-semibold rounded-[4px] px-3 py-1 h-auto ${
            isLocked
              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              : "text-slate-600 hover:bg-slate-50 border-slate-200"
          }`}
        >
          {loading === "lock" ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
          ) : (
            <Lock className="h-3 w-3 mr-1.5" />
          )}
          {isLocked ? "Unlock Post" : "Lock Post"}
        </Button>
      )}

      {/* Delete Option */}
      {(isAuthor || isAdmin) && (
        <Button
          onClick={handleDelete}
          disabled={loading !== null}
          variant="ghost"
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-[4px] px-3 py-1 h-auto ml-auto"
        >
          {loading === "delete" ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
          ) : (
            <Trash2 className="h-3 w-3 mr-1.5" />
          )}
          Delete Post
        </Button>
      )}
    </div>
  );
}
