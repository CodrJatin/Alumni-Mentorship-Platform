import { notFound } from "next/navigation";
// Force refresh of TS server typings
import { getMentorById } from "@/lib/data/mentors";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import RequestSessionDialog from "@/components/mentors/request-session-dialog";
import { MessageSquare, Calendar, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { AvailabilityStatus } from "@prisma/client";

interface PageProps {
  params: Promise<{
    mentorId: string;
  }>;
}

export default async function MentorDetailPage({ params }: PageProps) {
  const { mentorId } = await params;
  
  // Fetch mentor profile
  const result = await getMentorById(mentorId);
  if (!result.success || !result.mentor) {
    notFound();
  }

  const mentor = result.mentor;

  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const isAvailable = mentor.availabilityStatus === AvailabilityStatus.AVAILABLE;
  const isAtCapacity = mentor.availabilityStatus === AvailabilityStatus.LIMITED;

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Column: Avatar & Availability Card */}
        <div className="w-full lg:w-1/3 space-y-6">
          {/* Large Avatar Photo */}
          <div className="border border-[#E2E8F0] rounded-[4px] overflow-hidden bg-white aspect-[4/3] sm:aspect-square flex items-center justify-center">
            {mentor.user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mentor.user.imageUrl}
                alt={mentor.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-5xl font-bold text-indigo-700">
                {mentor.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Current Availability Card */}
          <div className="border border-[#E2E8F0] rounded-[4px] bg-white p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#64748B]" />
              Current Availability
            </h3>
            
            {/* Note schedule based on database or default */}
            <div className="space-y-2.5 text-sm font-medium">
              {mentor.availabilityNote ? (
                <p className="text-[#64748B] leading-relaxed whitespace-pre-wrap">
                  {mentor.availabilityNote}
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-slate-50 pb-1.5">
                    <span className="text-[#64748B]">Mon - Wed</span>
                    <span className="text-[#0F172A] font-semibold">9:00 AM - 2:00 PM</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-1.5">
                    <span className="text-[#64748B]">Thursday</span>
                    <span className="text-[#0F172A] font-semibold">1:00 PM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Friday</span>
                    <span className="text-[#94a3b8]">Unavailable</span>
                  </div>
                </div>
              )}
            </div>

            {/* Info notice box */}
            <div className="flex gap-2.5 p-3 rounded-[4px] bg-[#f8fafc] border border-[#E2E8F0] text-xs text-[#64748B] font-medium leading-normal">
              <Info className="h-4 w-4 text-[#4F46E5] shrink-0 mt-0.5" />
              <span>Sessions are typically 45 minutes. Timezone: EST.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Detail Content */}
        <div className="flex-1 space-y-8">
          {/* Header Area */}
          <div className="space-y-4">
            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-[4px] border-[#4f46e5]/40 text-[#4f46e5] font-semibold text-xs flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified Mentor
              </Badge>
              <Badge
                className={`rounded-[4px] px-2.5 py-0.5 text-xs font-semibold border-0 ${
                  isAvailable
                    ? "bg-[#ecfdf5] text-[#047857]"
                    : isAtCapacity
                    ? "bg-[#f1f5f9] text-[#475569]"
                    : "bg-[#fef2f2] text-[#b91c1c]"
                }`}
              >
                {isAvailable ? "Accepting Students" : isAtCapacity ? "At Capacity" : "Unavailable"}
              </Badge>
            </div>

            {/* Profile Info */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-[#0F172A]">
                {mentor.user.name}
              </h1>
              <p className="text-lg font-medium text-[#64748B] leading-normal">
                {mentor.headline} {mentor.institution ? `at ${mentor.institution}` : ""}
              </p>
            </div>

            {/* Action Buttons row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isAvailable ? (
                <RequestSessionDialog
                  mentorId={mentor.id}
                  mentorName={mentor.user.name}
                  isLoggedIn={isLoggedIn}
                />
              ) : (
                <Button disabled className="bg-slate-100 border border-[#E2E8F0] text-[#94a3b8] font-semibold py-2 px-6 rounded-[4px] cursor-not-allowed">
                  Profile Unavailable
                </Button>
              )}

              <Link
                href="/forum"
                className={buttonVariants({
                  variant: "outline",
                  className: "border-[#E2E8F0] hover:border-[#4f46e5] hover:bg-indigo-50/20 text-[#0F172A] font-semibold py-2 px-6 rounded-[4px] flex items-center gap-2",
                })}
              >
                <MessageSquare className="h-4 w-4" />
                Message
              </Link>
            </div>
          </div>

          <hr className="border-[#E2E8F0]" />

          {/* Biography */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F172A]">Biography</h2>
            <p className="text-sm text-[#64748B] leading-relaxed whitespace-pre-wrap">
              {mentor.bio}
            </p>
          </div>

          {/* Areas of Expertise */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F172A]">Areas of Expertise</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-[4px] bg-[#f8fafc] border border-[#E2E8F0] text-[#0f172a] font-semibold text-xs py-1 px-3">
                {mentor.domain}
              </Badge>
              {mentor.skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="rounded-[4px] bg-[#f8fafc] border border-[#E2E8F0] text-[#64748B] font-medium text-xs py-1 px-3"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Academic & Professional Background Timeline */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#0F172A]">
              Academic & Professional Background
            </h2>
            
            {mentor.backgroundEntries.length > 0 ? (
              <div className="relative border-l border-indigo-100 ml-3 pl-6 space-y-6">
                {mentor.backgroundEntries.map((entry) => (
                  <div key={entry.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[30px] top-1.5 h-3 w-3 rounded-full border-2 border-indigo-500 bg-white" />
                    
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wide">
                        {entry.startYear} - {entry.endYear}
                      </span>
                      <h3 className="text-base font-bold text-[#0F172A]">
                        {entry.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#64748B]">
                        {entry.institution}
                      </p>
                      {entry.description && (
                        <p className="text-sm text-[#64748B] leading-relaxed mt-1">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">
                No timeline entries provided.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
