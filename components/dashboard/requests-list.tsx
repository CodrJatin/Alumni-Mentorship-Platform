"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/confirm-modal";
import { BookingStatus, UserRole } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Clock,
  Loader2,
  Filter,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  respondToBookingRequestAction,
  cancelBookingRequestAction,
} from "@/lib/actions/booking.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Format date helper: "Oct 24, 2024 • 10:00 AM"
function formatRequestedDate(date: Date | null) {
  if (!date) return "Not specified";
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} • ${timeStr}`;
}

interface BookingRequestItem {
  id: string;
  topic: string;
  message: string;
  preferredAt: Date | null;
  status: BookingStatus;
  responseNote: string | null;
  createdAt: Date;
  student: {
    id: string;
    name: string;
    imageUrl: string | null;
    email: string;
    major?: string | null;
    yearOfStudy?: string | null;
    bio?: string | null;
    skills?: string[];
    linkedinUrl?: string | null;
  };
  mentor?: {
    id: string;
    user: {
      name: string;
      imageUrl: string | null;
      email: string;
    };
  };
}

interface RequestsListProps {
  bookings: BookingRequestItem[];
  role: UserRole;
}

export default function RequestsList({ bookings, role }: RequestsListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  };

  // Response dialog state
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<"ACCEPTED" | "REJECTED" | null>(null);
  const [responseNote, setResponseNote] = useState("");

  // Cancel/Delete modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);


  const filteredBookings = bookings.filter((b) => {
    if (filter === "ALL") return true;
    return b.status === filter;
  });

  const handleOpenResponseDialog = (id: string, status: "ACCEPTED" | "REJECTED") => {
    setActiveBookingId(id);
    setResponseStatus(status);
    setResponseNote("");
    setResponseDialogOpen(true);
  };

  const handleResponseSubmit = async () => {
    if (!activeBookingId || !responseStatus) return;

    setLoadingId(activeBookingId);
    setResponseDialogOpen(false);

    try {
      const res = await respondToBookingRequestAction(activeBookingId, responseStatus, responseNote);
      if (res.success) {
        toast.success(`Booking request ${responseStatus.toLowerCase()} successfully!`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update booking status.");
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setLoadingId(null);
      setActiveBookingId(null);
      setResponseStatus(null);
    }
  };

  const handleCancelTrigger = (id: string) => {
    setPendingCancelId(id);
    setCancelModalOpen(true);
  };

  const executeCancel = async () => {
    if (!pendingCancelId) return;
    setLoadingId(pendingCancelId);
    try {
      const res = await cancelBookingRequestAction(pendingCancelId);
      if (res.success) {
        toast.success("Booking request cancelled successfully.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to cancel request.");
      }
    } catch {
      toast.error("An error occurred.");
    } finally {
      setLoadingId(null);
      setPendingCancelId(null);
    }
  };


  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return (
          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-0 rounded-full font-semibold px-3 py-1 flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
            Pending
          </Badge>
        );
      case BookingStatus.ACCEPTED:
        return (
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-0 rounded-full font-semibold px-3 py-1 flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Accepted
          </Badge>
        );
      case BookingStatus.REJECTED:
        return (
          <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-0 rounded-full font-semibold px-3 py-1 flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
            Declined
          </Badge>
        );
      case BookingStatus.CANCELLED:
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-0 rounded-full font-semibold px-3 py-1 flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            Cancelled
          </Badge>
        );
      case BookingStatus.COMPLETED:
        return (
          <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-0 rounded-full font-semibold px-3 py-1 flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Booking Requests</h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            Review and manage pending mentorship sessions.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] p-1.5 rounded-[4px] shadow-none">
          <Filter className="h-4 w-4 text-[#64748B] ml-2 shrink-0" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs font-semibold text-[#0F172A] bg-transparent border-0 focus:ring-0 cursor-pointer pr-8"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Declined</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Requests Table/List Card */}
      <Card className="border border-[#E2E8F0] bg-white rounded-[8px] shadow-none overflow-hidden">
        <CardContent className="p-0">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Clock className="h-8 w-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-[#0F172A]">No requests found</p>
              <p className="text-xs text-[#64748B] font-medium max-w-sm mx-auto">
                {filter === "ALL"
                  ? "There are no booking requests on your dashboard currently."
                  : `There are no requests matching the "${filter.toLowerCase()}" filter.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[700px]">
                 <thead>
                   <tr className="bg-slate-50/70 border-b border-[#E2E8F0]">
                     <th className="w-10 px-4 py-4"></th>
                     <th className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider px-6 py-4">
                       {role === UserRole.STUDENT ? "Mentor" : "Student"}
                     </th>
                     <th className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider px-6 py-4">
                       Topic
                     </th>
                     <th className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider px-6 py-4">
                       Requested Date
                     </th>
                     <th className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider px-6 py-4">
                       Status
                     </th>
                     <th className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider px-6 py-4 text-right pr-8">
                       Actions
                     </th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#E2E8F0]">
                   {filteredBookings.map((booking) => {
                     const partnerName =
                       role === UserRole.STUDENT
                         ? booking.mentor?.user.name
                         : booking.student.name;
                     const partnerImageUrl =
                       role === UserRole.STUDENT
                         ? booking.mentor?.user.imageUrl
                         : booking.student.imageUrl;

                     const isLoading = loadingId === booking.id;
                     const isExpanded = expandedIds.has(booking.id);

                     return (
                       <React.Fragment key={booking.id}>
                         <tr className="hover:bg-slate-50/20 transition-colors">
                           {/* Expand toggle */}
                           <td className="px-4 py-5 text-center">
                             <button
                               onClick={() => toggleExpand(booking.id)}
                               className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded bg-transparent border-0 cursor-pointer flex items-center justify-center"
                               aria-label={isExpanded ? "Collapse Details" : "Expand Details"}
                             >
                               {isExpanded ? (
                                 <ChevronDown className="h-4 w-4" />
                               ) : (
                                 <ChevronRight className="h-4 w-4" />
                               )}
                             </button>
                           </td>
                           {/* Partner Detail */}
                           <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-[4px] border border-[#E2E8F0]">
                              <AvatarImage src={partnerImageUrl || ""} alt={partnerName} />
                              <AvatarFallback className="bg-indigo-50 text-indigo-700 text-sm font-bold rounded-[4px]">
                                {partnerName?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold text-[#0F172A]">{partnerName}</p>
                              <p className="text-xs text-[#64748B] font-medium">
                                {role === UserRole.STUDENT
                                  ? booking.mentor?.user.email
                                  : booking.student.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Topic & Message Details */}
                        <td className="px-6 py-5 max-w-[280px]">
                          <div>
                            <p className="text-sm font-bold text-[#0F172A] truncate">
                              {booking.topic}
                            </p>
                            {booking.message && (
                              <p className="text-xs text-[#64748B] font-medium line-clamp-1 mt-0.5">
                                {booking.message}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Requested Date */}
                        <td className="px-6 py-5 text-sm text-[#0F172A] font-medium">
                          {formatRequestedDate(booking.preferredAt)}
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-5">{getStatusBadge(booking.status)}</td>

                        {/* Actions */}
                        <td className="px-6 py-5 text-right pr-8">
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-600 inline-block" />
                          ) : (
                            <div className="flex justify-end gap-3 items-center">
                              {/* Mentor Response Actions */}
                              {role === UserRole.MENTOR &&
                                booking.status === BookingStatus.PENDING && (
                                  <>
                                    <Button
                                      onClick={() => handleOpenResponseDialog(booking.id, "ACCEPTED")}
                                      className="bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-[4px] font-semibold text-xs px-3.5 py-1.5 h-auto"
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      onClick={() => handleOpenResponseDialog(booking.id, "REJECTED")}
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent rounded-[4px] font-semibold text-xs px-3.5 py-1.5 h-auto"
                                    >
                                      Decline
                                    </Button>
                                  </>
                                )}

                              {/* Student Actions */}
                              {role === UserRole.STUDENT &&
                                booking.status === BookingStatus.PENDING && (
                                  <Button
                                    onClick={() => handleCancelTrigger(booking.id)}
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-[4px] font-semibold text-xs px-3.5 py-1.5 h-auto"
                                  >
                                    Cancel Request
                                  </Button>
                                )}



                              {/* View Details/Note indicator */}
                              {(booking.status === BookingStatus.ACCEPTED ||
                                booking.status === BookingStatus.REJECTED) &&
                                booking.responseNote && (
                                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-semibold">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    <span>Note Left</span>
                                  </div>
                                )}
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Expanded details sub-row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/40">
                          <td colSpan={6} className="px-6 py-4 border-t border-slate-100">
                            {role === UserRole.MENTOR ? (
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pl-10 text-left">
                                {/* Left Side: Student Profile Details */}
                                <div className="md:col-span-2 space-y-4 border-r border-slate-100 pr-6">
                                  <div className="space-y-1">
                                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Student Profile</h5>
                                    <p className="text-sm font-bold text-[#0F172A]">{booking.student.name}</p>
                                    <p className="text-xs text-[#64748B] font-medium">{booking.student.email}</p>
                                  </div>

                                  {(booking.student.major || booking.student.yearOfStudy) && (
                                    <div className="space-y-1 text-xs text-[#0F172A] font-semibold">
                                      {booking.student.major && <p>Major: {booking.student.major}</p>}
                                      {booking.student.yearOfStudy && <p>Year: {booking.student.yearOfStudy}</p>}
                                    </div>
                                  )}

                                  {booking.student.bio && (
                                    <div className="space-y-1">
                                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">About Student</h5>
                                      <p className="text-xs text-[#64748B] leading-relaxed italic line-clamp-4">
                                        &ldquo;{booking.student.bio}&rdquo;
                                      </p>
                                    </div>
                                  )}

                                  {booking.student.skills && booking.student.skills.length > 0 && (
                                    <div className="space-y-1.5">
                                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Skills / Interests</h5>
                                      <div className="flex flex-wrap gap-1">
                                        {booking.student.skills.map((skill) => (
                                          <span
                                            key={skill}
                                            className="text-[9px] font-semibold bg-indigo-50/50 text-[#4f46e5] border border-indigo-100/50 px-2 py-0.5 rounded"
                                          >
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {booking.student.linkedinUrl && (
                                    <a
                                      href={booking.student.linkedinUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-block text-xs font-bold text-[#4f46e5] hover:underline"
                                    >
                                      View LinkedIn Profile &rarr;
                                    </a>
                                  )}
                                </div>

                                {/* Right Side: Request Details */}
                                <div className="md:col-span-3 space-y-4">
                                  <div className="space-y-1">
                                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Session Topic</h5>
                                    <p className="text-sm font-bold text-[#0F172A]">{booking.topic}</p>
                                  </div>

                                  <div className="space-y-1">
                                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Introduce Yourself & Goals</h5>
                                    <p className="text-sm text-[#0F172A] whitespace-pre-wrap leading-relaxed">
                                      {booking.message || "No introduction message provided."}
                                    </p>
                                  </div>

                                  {booking.responseNote && (
                                    <div className="space-y-1 pt-3 border-t border-slate-100/50">
                                      <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Your Response Note</h5>
                                      <p className="text-sm text-[#0F172A] italic bg-white p-3 border border-[#E2E8F0] rounded-[4px] leading-relaxed">
                                        &ldquo;{booking.responseNote}&rdquo;
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              // Layout for Students / Admins
                              <div className="space-y-4 pl-10 text-left">
                                <div className="space-y-1">
                                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Introduce Yourself & Goals</h5>
                                  <p className="text-sm text-[#0F172A] whitespace-pre-wrap leading-relaxed max-w-3xl">
                                    {booking.message || "No introduction message provided."}
                                  </p>
                                </div>

                                {booking.responseNote && (
                                  <div className="space-y-1 pt-3 border-t border-slate-100/50">
                                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Response Note</h5>
                                    <p className="text-sm text-[#0F172A] italic bg-white p-3 border border-[#E2E8F0] rounded-[4px] leading-relaxed max-w-3xl">
                                      &ldquo;{booking.responseNote}&rdquo;
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accept/Decline Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-white rounded-[4px] border border-[#E2E8F0]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#0F172A]">
              {responseStatus === "ACCEPTED" ? "Accept Booking Request" : "Decline Booking Request"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748B] font-medium mt-1">
              {responseStatus === "ACCEPTED"
                ? "Send a short confirmation note with session meeting instructions, calendar link, or preparation notes."
                : "Provide a brief explanation or context to help the student understand why the request is declined."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-sm font-semibold text-[#0F172A]">
                Response Note
              </Label>
              <Textarea
                id="note"
                placeholder={
                  responseStatus === "ACCEPTED"
                    ? "e.g. Hi Sarah! I've accepted your request. We'll connect on Google Meet here: meet.google.com/xxx-xxx..."
                    : "e.g. Unfortunately I'm currently fully booked for this topic. Please feel free to request a slot next month."
                }
                value={responseNote}
                onChange={(e) => setResponseNote(e.target.value)}
                className="min-h-24 border-[#E2E8F0] rounded-[4px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResponseDialogOpen(false)}
              className="border-[#E2E8F0] rounded-[4px] font-semibold text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResponseSubmit}
              className={`rounded-[4px] font-semibold text-sm text-white ${
                responseStatus === "ACCEPTED" ? "bg-[#4f46e5] hover:bg-[#4338ca]" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setPendingCancelId(null);
        }}
        onConfirm={executeCancel}
        title="Cancel Mentorship Request"
        description="Are you sure you want to cancel this booking request? This action cannot be undone."
        confirmText="Cancel Request"
        variant="destructive"
      />


    </div>
  );
}
