"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { bookingRequestSchema, BookingRequestInput } from "@/lib/validations/booking";
import { createBookingRequestAction } from "@/lib/actions/booking.actions";

interface RequestSessionDialogProps {
  mentorId: string;
  mentorName: string;
  isLoggedIn: boolean;
}

export default function RequestSessionDialog({
  mentorId,
  mentorName,
  isLoggedIn,
}: RequestSessionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingRequestInput>({
    resolver: zodResolver(bookingRequestSchema),
  });

  const onSubmit = async (data: BookingRequestInput) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to request a session.");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await createBookingRequestAction(mentorId, data);
      if (res.success) {
        toast.success(`Mentorship request successfully sent to ${mentorName}!`);
        reset();
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to send request.");
      }
    } catch {
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold py-2.5 px-6 rounded-[4px] inline-flex items-center justify-center text-sm cursor-pointer border-0 select-none">
        Request a Session
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-[4px] border border-[#E2E8F0]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0F172A]">
              Request Mentorship Session
            </DialogTitle>
            <DialogDescription className="text-sm text-[#64748B] font-medium">
              Submit a request to schedule an academic session with {mentorName}.
            </DialogDescription>
          </DialogHeader>

          {!isLoggedIn ? (
            <div className="p-4 border border-[#E2E8F0] rounded-[4px] bg-[#f8fafc] text-center space-y-3">
              <p className="text-sm font-semibold text-[#0F172A]">
                Authentication Required
              </p>
              <p className="text-xs text-[#64748B] font-medium leading-relaxed">
                You must have a logged-in student profile to book a session.
              </p>
              <Button
                type="button"
                onClick={() => router.push(`/login?returnTo=/mentors/${mentorId}`)}
                className="w-full bg-[#0F172A] hover:bg-[#1e293b] text-white rounded-[4px] text-xs font-semibold py-2 mt-2"
              >
                Sign In to Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Topic Field */}
              <div className="space-y-1.5">
                <Label htmlFor="topic" className="text-sm font-semibold text-[#0F172A]">
                  Topic / Subject
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g. Dissertation Research, Exam Prep Guidance"
                  className="w-full border-[#E2E8F0] rounded-[4px]"
                  disabled={isLoading}
                  {...register("topic")}
                />
                {errors.topic && (
                  <p className="text-xs text-red-600 font-semibold">{errors.topic.message}</p>
                )}
              </div>

              {/* Preferred Date & Time Field */}
              <div className="space-y-1.5">
                <Label htmlFor="preferredAt" className="text-sm font-semibold text-[#0F172A]">
                  Preferred Date & Time
                </Label>
                <Input
                  id="preferredAt"
                  type="datetime-local"
                  className="w-full border-[#E2E8F0] rounded-[4px]"
                  disabled={isLoading}
                  {...register("preferredAt")}
                />
                {errors.preferredAt && (
                  <p className="text-xs text-red-600 font-semibold">{errors.preferredAt.message}</p>
                )}
              </div>

              {/* Message Field */}
              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-sm font-semibold text-[#0F172A]">
                  Introduce Yourself & Goals
                </Label>
                <Textarea
                  id="message"
                  placeholder="Please introduce yourself briefly and explain what you hope to achieve during the mentorship session..."
                  className="min-h-28 border-[#E2E8F0] rounded-[4px]"
                  disabled={isLoading}
                  {...register("message")}
                />
                {errors.message && (
                  <p className="text-xs text-red-600 font-semibold">{errors.message.message}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => setOpen(false)}
              className="border-[#E2E8F0] rounded-[4px] font-semibold text-sm"
            >
              Cancel
            </Button>
            {isLoggedIn && (
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-[4px] font-semibold text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
