"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forumReplySchema, ForumReplyInput } from "@/lib/validations/forum";
import { createForumReplyAction } from "@/lib/actions/forum.actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { Loader2, Bold, Italic, List, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface ReplyFormProps {
  postId: string;
  userProfile: {
    name: string;
    imageUrl: string | null;
  } | null;
}

export default function ReplyForm({ postId, userProfile }: ReplyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ForumReplyInput>({
    resolver: zodResolver(forumReplySchema),
    defaultValues: {
      content: "",
    },
  });

  const contentValue = useWatch({ control, name: "content" });

  const onSubmit = async (data: ForumReplyInput) => {
    setIsSubmitting(true);
    try {
      const result = await createForumReplyAction(postId, data.content);
      if (result.success) {
        toast.success("Reply posted successfully!");
        reset();
        setActiveTab("write");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to post reply.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormat = (type: string) => {
    const textarea = document.getElementById("reply-content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    let replacement = "";

    switch (type) {
      case "bold":
        replacement = `**${selected || "bold text"}**`;
        break;
      case "italic":
        replacement = `*${selected || "italic text"}*`;
        break;
      case "list":
        replacement = `\n- ${selected || "list item"}`;
        break;
      case "link":
        replacement = `[${selected || "link text"}](https://example.com)`;
        break;
      default:
        return;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    setValue("content", newValue);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  return (
    <div className="border border-[#E2E8F0] bg-white rounded-[4px] p-6 space-y-4">
      <div className="text-[11px] font-bold text-[#4f46e5] uppercase tracking-wider">
        Join the Discussion
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 items-start">
        <Avatar className="h-9 w-9 border border-[#E2E8F0] rounded-full flex-shrink-0">
          <AvatarImage src={userProfile?.imageUrl || ""} alt={userProfile?.name} />
          <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold text-sm rounded-full">
            {userProfile?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <div className="border border-[#E2E8F0] rounded-[4px] overflow-hidden focus-within:border-[#4f46e5] focus-within:ring-1 focus-within:ring-[#4f46e5]">
            {/* Editor Toolbar */}
            <div className="bg-slate-50 border-b border-[#E2E8F0] px-3 py-1.5 flex justify-between items-center flex-wrap gap-2">
              
              {/* Left: Write / Preview Switch Tabs */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-[4px] border cursor-pointer transition-all duration-150 ${
                    activeTab === "write"
                      ? "border-[#E2E8F0] bg-white text-[#0f172a] font-bold shadow-sm"
                      : "border-transparent text-slate-500 hover:text-slate-800 bg-transparent"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-[4px] border cursor-pointer transition-all duration-150 ${
                    activeTab === "preview"
                      ? "border-[#E2E8F0] bg-white text-[#0f172a] font-bold shadow-sm"
                      : "border-transparent text-slate-500 hover:text-slate-800 bg-transparent"
                  }`}
                >
                  Preview
                </button>
              </div>

              {/* Right: Format Actions (only shown if activeTab === "write") */}
              {activeTab === "write" && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleFormat("bold")}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 bg-transparent border-0 cursor-pointer"
                    title="Bold"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat("italic")}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 bg-transparent border-0 cursor-pointer"
                    title="Italic"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <div className="w-[1px] h-3 bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => handleFormat("list")}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 bg-transparent border-0 cursor-pointer"
                    title="List"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFormat("link")}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 bg-transparent border-0 cursor-pointer"
                    title="Insert Link"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Content Area */}
            {activeTab === "write" ? (
              <Textarea
                id="reply-content"
                placeholder="Add to the discussion..."
                rows={3}
                {...register("content")}
                className="border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 resize-none min-h-[100px]"
              />
            ) : (
              <div className="p-4 min-h-[100px] bg-slate-50/50 overflow-y-auto max-h-[200px] text-left">
                <MarkdownRenderer
                  content={contentValue || "*Nothing to preview yet. Click the 'Write' tab to add comment content.*"}
                />
              </div>
            )}
          </div>
          {errors.content && (
            <p className="text-left text-xs text-red-600 font-medium">{errors.content.message}</p>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-xs rounded-[4px] px-4 py-2 h-auto cursor-pointer border-0"
            >
              {isSubmitting ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
              ) : null}
              Post Reply
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
