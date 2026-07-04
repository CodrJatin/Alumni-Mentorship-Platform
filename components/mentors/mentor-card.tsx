"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { AvailabilityStatus } from "@prisma/client";

interface MentorCardProps {
  mentor: {
    id: string;
    headline: string;
    institution: string | null;
    domain: string;
    skills: string[];
    bio: string;
    availabilityStatus: AvailabilityStatus;
    user: {
      name: string;
      imageUrl: string | null;
    };
  };
}

export default function MentorCard({ mentor }: MentorCardProps) {
  const isAvailable = mentor.availabilityStatus === AvailabilityStatus.AVAILABLE;
  const isAtCapacity = mentor.availabilityStatus === AvailabilityStatus.LIMITED;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-[#E2E8F0] p-6 rounded-[4px] flex flex-col justify-between h-full transition-colors hover:border-[#4f46e5]/40"
    >
      <div>
        {/* Top: Avatar, Info, Status Badge */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex gap-4 min-w-0">
            <Avatar className="h-16 w-16 border border-[#E2E8F0] rounded-full">
              <AvatarImage src={mentor.user.imageUrl || ""} alt={mentor.user.name} />
              <AvatarFallback className="bg-indigo-50 text-indigo-700 text-lg font-bold rounded-full">
                {mentor.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-[#0F172A] truncate">
                {mentor.user.name}
              </h3>
              <p className="text-sm font-medium text-[#64748B] truncate mt-0.5">
                {mentor.headline} {mentor.institution ? `@ ${mentor.institution}` : ""}
              </p>
            </div>
          </div>

          {/* Availability Status Badge */}
          <Badge
            className={`shrink-0 rounded-[4px] px-2.5 py-1 text-xs font-semibold border-0 flex items-center gap-1.5 ${
              isAvailable
                ? "bg-[#ecfdf5] text-[#047857]"
                : isAtCapacity
                ? "bg-[#f1f5f9] text-[#475569]"
                : "bg-[#fef2f2] text-[#b91c1c]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isAvailable
                  ? "bg-[#10b981]"
                  : isAtCapacity
                  ? "bg-[#64748b]"
                  : "bg-[#ef4444]"
              }`}
            />
            {isAvailable ? "Available" : isAtCapacity ? "At Capacity" : "Unavailable"}
          </Badge>
        </div>

        {/* Skills/Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {/* Always show primary domain as a pill */}
          <Badge variant="secondary" className="rounded-[4px] bg-[#f8fafc] border border-[#E2E8F0] text-[#64748B] font-medium text-xs">
            {mentor.domain}
          </Badge>
          {mentor.skills.slice(0, 2).map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="rounded-[4px] bg-[#f8fafc] border border-[#E2E8F0] text-[#64748B] font-medium text-xs"
            >
              {skill}
            </Badge>
          ))}
        </div>

        {/* Short Bio */}
        <p className="text-sm text-[#64748B] leading-relaxed line-clamp-3 mb-6">
          {mentor.bio}
        </p>
      </div>

      {/* Action Button */}
      {isAvailable ? (
        <Link
          href={`/mentors/${mentor.id}`}
          className={buttonVariants({
            variant: "outline",
            className: "w-full border-[#E2E8F0] hover:border-[#4f46e5] hover:bg-indigo-50/20 text-[#0F172A] font-semibold py-2.5 text-center transition-colors rounded-[4px]",
          })}
        >
          View Profile
        </Link>
      ) : (
        <button
          disabled
          className="w-full bg-[#f8fafc] border border-[#E2E8F0] text-[#94a3b8] font-semibold py-2.5 cursor-not-allowed rounded-[4px] text-center text-sm"
        >
          Profile Unavailable
        </button>
      )}
    </motion.div>
  );
}
