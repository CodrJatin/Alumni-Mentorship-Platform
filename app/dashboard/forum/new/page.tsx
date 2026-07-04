"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forumPostSchema, ForumPostInput } from "@/lib/validations/forum";
import { createForumPostAction } from "@/lib/actions/forum.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarkdownRenderer from "@/components/ui/markdown-renderer";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  BookOpen,
  MessageSquareHeart,
  Tag,
} from "lucide-react";

export default function NewForumPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ForumPostInput>({
    resolver: zodResolver(forumPostSchema),
    defaultValues: {
      title: "",
      content: "",
      tag: "",
    },
  });

  const contentValue = watch("content");

  const onSubmit = async (data: ForumPostInput) => {
    setIsSubmitting(true);
    try {
      const result = await createForumPostAction(data);
      if (result.success && result.postId) {
        toast.success("Discussion post created successfully!");
        router.push(`/forum/${result.postId}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create post.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormat = (type: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
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
      case "numlist":
        replacement = `\n1. ${selected || "list item"}`;
        break;
      case "link":
        replacement = `[${selected || "link text"}](https://example.com)`;
        break;
      case "image":
        replacement = `![${selected || "image description"}](https://image-url.com)`;
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
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/forum"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4f46e5] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Forums
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Title row with CTAs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Create New Discussion
            </h1>
            <p className="text-sm text-[#64748B] font-medium mt-0.5">
              Share your insights, ask questions, and engage with the AluMentor academic community.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/forum">
              <Button
                type="button"
                variant="outline"
                className="border-[#E2E8F0] text-[#0F172A] rounded-[4px] font-semibold text-xs px-4"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold text-xs rounded-[4px] px-5 min-w-[130px] border-0"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
              ) : (
                "Post Discussion"
              )}
            </Button>
          </div>
        </div>

        <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
          <CardContent className="p-6 space-y-5">
            
            {/* Discussion Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-semibold text-[#0F172A]">
                Discussion Title
              </Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title for your post..."
                {...register("title")}
                className="border-[#E2E8F0] rounded-[4px] focus-visible:ring-1 focus-visible:ring-[#4f46e5] focus-visible:border-[#4f46e5]"
              />
              {errors.title && (
                <p className="text-xs text-red-600 font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* Post Content with format toolbar & Write/Preview Switch */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="content" className="text-sm font-semibold text-[#0F172A]">
                  Post Content
                </Label>
                <span className="text-[10px] text-[#64748B] font-medium">
                  Markdown supported
                </span>
              </div>
              
              <div className="border border-[#E2E8F0] rounded-[4px] overflow-hidden focus-within:border-[#4f46e5] focus-within:ring-1 focus-within:ring-[#4f46e5]">
                {/* Editor Toolbar */}
                <div className="bg-slate-50 border-b border-[#E2E8F0] px-3 py-2 flex justify-between items-center flex-wrap gap-2">
                  
                  {/* Left: Write / Preview Switch Tabs */}
                  <div className="flex items-center gap-1 border-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab("write")}
                      className={`px-3 py-1 text-xs font-semibold rounded-[4px] border cursor-pointer transition-all duration-150 ${
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
                      className={`px-3 py-1 text-xs font-semibold rounded-[4px] border cursor-pointer transition-all duration-150 ${
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
                        <Bold className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormat("italic")}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 bg-transparent border-0 cursor-pointer"
                        title="Italic"
                      >
                        <Italic className="h-4 w-4" />
                      </button>
                      <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                      <button
                        type="button"
                        onClick={() => handleFormat("list")}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 bg-transparent border-0 cursor-pointer"
                        title="Bulleted List"
                      >
                        <List className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormat("numlist")}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 bg-transparent border-0 cursor-pointer"
                        title="Numbered List"
                      >
                        <ListOrdered className="h-4 w-4" />
                      </button>
                      <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                      <button
                        type="button"
                        onClick={() => handleFormat("link")}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 bg-transparent border-0 cursor-pointer"
                        title="Insert Link"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormat("image")}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600 bg-transparent border-0 cursor-pointer"
                        title="Insert Image"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Editor Content Area */}
                {activeTab === "write" ? (
                  <Textarea
                    id="content"
                    rows={10}
                    placeholder="Detail your question, research findings, or discussion points here..."
                    {...register("content")}
                    className="border-0 rounded-none focus-visible:ring-0 focus-visible:border-0 resize-none min-h-[220px]"
                  />
                ) : (
                  <div className="p-4 min-h-[220px] bg-slate-50/50 overflow-y-auto max-h-[350px]">
                    <MarkdownRenderer
                      content={contentValue || "*Nothing to preview yet. Click the 'Write' tab to add content.*"}
                    />
                  </div>
                )}
              </div>
              {errors.content && (
                <p className="text-xs text-red-600 font-medium">{errors.content.message}</p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label htmlFor="tag" className="text-sm font-semibold text-[#0F172A]">
                Tags
              </Label>
              <div className="relative flex items-center">
                <Tag className="absolute left-3 h-4 w-4 text-[#64748B]" />
                <Input
                  id="tag"
                  placeholder="e.g. PhD, Research, CareerAdvice (comma separated)"
                  {...register("tag")}
                  className="border-[#E2E8F0] rounded-[4px] pl-9 focus-visible:ring-1 focus-visible:ring-[#4f46e5] focus-visible:border-[#4f46e5]"
                />
              </div>
              <span className="block text-[10px] text-[#64748B] font-medium leading-normal pt-0.5">
                Comma separated keywords help categorize your post and match related discussions.
              </span>
            </div>

          </CardContent>
        </Card>
      </form>

      {/* Guidelines blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
          <CardContent className="p-5 flex gap-3.5">
            <BookOpen className="h-5 w-5 text-[#4f46e5] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#0F172A]">Academic Integrity</h4>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                Ensure all posted research or claims are properly cited. Plagiarism or unverified data will result in post removal.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
          <CardContent className="p-5 flex gap-3.5">
            <MessageSquareHeart className="h-5 w-5 text-[#4f46e5] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#0F172A]">Constructive Dialogue</h4>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                Maintain a professional tone. Critique ideas, not individuals. Support your arguments with empirical evidence when possible.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
