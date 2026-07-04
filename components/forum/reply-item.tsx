"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { deleteForumReplyAction } from "@/lib/actions/forum.actions";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import ConfirmModal from "@/components/ui/confirm-modal";

interface ReplyItemProps {
  reply: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      imageUrl: string | null;
      role: string;
    };
  };
  currentUserProfileId: string | null;
  isAdmin: boolean;
}

export default function ReplyItem({
  reply,
  currentUserProfileId,
  isAdmin,
}: ReplyItemProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Confirm modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteForumReplyAction(reply.id);
      if (result.success) {
        toast.success("Reply deleted.");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete reply.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  const isOwner = currentUserProfileId === reply.author.id;
  const canDelete = isOwner || isAdmin;

  return (
    <div className="flex gap-4 items-start p-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/10 transition-colors">
      <Avatar className="h-9 w-9 rounded-full border border-[#E2E8F0] flex-shrink-0">
        <AvatarImage src={reply.author.imageUrl || ""} alt={reply.author.name} />
        <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold text-sm">
          {reply.author.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-[#0F172A]">
              {reply.author.name}
            </span>
            <span className="text-[9px] font-bold uppercase rounded-full bg-slate-100 text-slate-700 px-1.5 py-0.5 tracking-wider">
              {reply.author.role.toLowerCase()}
            </span>
            <span className="text-[11px] text-[#64748B] font-medium">
              &bull;{" "}
              {new Date(reply.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {canDelete && (
            <Button
              onClick={() => setIsConfirmOpen(true)}
              disabled={isDeleting}
              variant="ghost"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 h-auto rounded-[4px]"
              title="Delete Comment"
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>

        <MarkdownRenderer content={reply.content} />
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Reply"
        description="Are you sure you want to delete this reply? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
