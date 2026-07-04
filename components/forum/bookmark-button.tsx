"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toggleSavePostAction } from "@/lib/actions/forum.actions";
import { Bookmark, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BookmarkButtonProps {
  postId: string;
  initialSaved: boolean;
  isAuthenticated: boolean;
}

export default function BookmarkButton({
  postId,
  initialSaved,
  isAuthenticated,
}: BookmarkButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save discussions.");
      return;
    }
    setLoading(true);
    try {
      const result = await toggleSavePostAction(postId);
      if (result.success) {
        setSaved(!!result.saved);
        toast.success(result.saved ? "Discussion saved." : "Discussion unsaved.");
      } else {
        toast.error(result.error || "Failed to toggle save state.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={loading}
      variant="ghost"
      className={`text-xs font-semibold rounded-[4px] px-3 py-1.5 h-auto flex items-center gap-1.5 ${
        saved
          ? "text-[#4f46e5] bg-indigo-50/50 hover:bg-indigo-50"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Bookmark className={`h-4 w-4 ${saved ? "fill-[#4f46e5]" : ""}`} />
      )}
      <span>{saved ? "Saved" : "Save"}</span>
    </Button>
  );
}
