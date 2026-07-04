"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole, BookingStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Users,
  GraduationCap,
  CalendarRange,
  MessageSquareCode,
  Search,
  Trash2,
  Star,
} from "lucide-react";
import ConfirmModal from "@/components/ui/confirm-modal";
import AnimatedFadeIn from "@/components/ui/animated-fade-in";

// Actions
import { updateUserRoleAction, toggleUserActiveStatusAction } from "@/lib/actions/user.actions";
import { toggleMentorActiveStatusAction, toggleMentorFeaturedStatusAction } from "@/lib/actions/mentor.actions";
import { adminUpdateBookingStatusAction, adminDeleteBookingRequestAction } from "@/lib/actions/booking.actions";
import { deleteForumPostAction } from "@/lib/actions/forum.actions";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: Date;
}

interface MentorItem {
  id: string;
  userId: string;
  domain: string;
  headline: string;
  isActive: boolean;
  isFeatured: boolean;
  user: {
    name: string;
    email: string;
    imageUrl: string | null;
  };
}

interface BookingItem {
  id: string;
  topic: string;
  message: string;
  preferredAt: Date | null;
  status: BookingStatus;
  createdAt: Date;
  student: {
    id: string;
    name: string;
    email: string;
  };
  mentor: {
    user: {
      name: string;
    };
  };
}

interface PostItem {
  id: string;
  title: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  _count: {
    replies: number;
  };
}

interface AdminDashboardClientProps {
  users: UserItem[];
  mentors: MentorItem[];
  bookings: BookingItem[];
  posts: PostItem[];
}

export default function AdminDashboardClient({
  users: initialUsers,
  mentors: initialMentors,
  bookings: initialBookings,
  posts: initialPosts,
}: AdminDashboardClientProps) {
  const router = useRouter();

  // Local state
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [mentors, setMentors] = useState<MentorItem[]>(initialMentors);
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings);
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);

  // Search queries
  const [userSearch, setUserSearch] = useState("");
  const [mentorSearch, setMentorSearch] = useState("");
  const [bookingSearch, setBookingSearch] = useState("");
  const [postSearch, setPostSearch] = useState("");

  // Confirmation Modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    variant?: "default" | "destructive";
  } | null>(null);

  // Loading states per row id
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const openConfirm = (
    title: string,
    description: string,
    onConfirm: () => Promise<void>,
    variant: "default" | "destructive" = "destructive"
  ) => {
    setConfirmConfig({ title, description, onConfirm, variant });
    setConfirmOpen(true);
  };

  // --- 1. USER ACTIONS ---
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setLoadingId(userId);
    try {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success) {
        toast.success("User role updated successfully.");
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update role.");
      }
    } catch {
      toast.error("Failed to update role.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleUserActive = async (userId: string) => {
    setLoadingId(userId);
    try {
      const res = await toggleUserActiveStatusAction(userId);
      if (res.success) {
        toast.success("User account status toggled.");
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
        );
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update user status.");
      }
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setLoadingId(null);
    }
  };

  // --- 2. MENTOR ACTIONS ---
  const handleToggleMentorActive = async (mentorId: string) => {
    setLoadingId(mentorId);
    try {
      const res = await toggleMentorActiveStatusAction(mentorId);
      if (res.success) {
        toast.success("Mentor status updated.");
        setMentors((prev) =>
          prev.map((m) => (m.id === mentorId ? { ...m, isActive: !m.isActive } : m))
        );
        router.refresh();
      } else {
        toast.error(res.error || "Failed to toggle mentor active status.");
      }
    } catch {
      toast.error("Failed to toggle active status.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleMentorFeatured = async (mentorId: string, nextFeatured: boolean) => {
    const currentFeaturedCount = mentors.filter((m) => m.isFeatured).length;
    if (nextFeatured && currentFeaturedCount >= 3) {
      toast.error("You can select up to 3 featured mentors. Please disable featured status on another mentor first.");
      return;
    }

    setLoadingId(mentorId);
    try {
      const res = await toggleMentorFeaturedStatusAction(mentorId, nextFeatured);
      if (res.success) {
        toast.success(nextFeatured ? "Mentor added to featured list." : "Mentor removed from featured list.");
        setMentors((prev) =>
          prev.map((m) => (m.id === mentorId ? { ...m, isFeatured: nextFeatured } : m))
        );
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update featured status.");
      }
    } catch {
      toast.error("Failed to update featured status.");
    } finally {
      setLoadingId(null);
    }
  };

  // --- 3. REQUEST ACTIONS ---
  const handleBookingStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    setLoadingId(bookingId);
    try {
      const res = await adminUpdateBookingStatusAction(bookingId, newStatus);
      if (res.success) {
        toast.success(`Booking status set to ${newStatus.toLowerCase()}.`);
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch {
      toast.error("Failed to update booking.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleBookingDelete = (bookingId: string) => {
    openConfirm(
      "Delete Mentorship Session Request",
      "Are you sure you want to permanently delete this mentorship request? This action is irreversible.",
      async () => {
        setLoadingId(bookingId);
        try {
          const res = await adminDeleteBookingRequestAction(bookingId);
          if (res.success) {
            toast.success("Booking request deleted successfully.");
            setBookings((prev) => prev.filter((b) => b.id !== bookingId));
            router.refresh();
          } else {
            toast.error(res.error || "Failed to delete booking.");
          }
        } catch {
          toast.error("Failed to delete request.");
        } finally {
          setLoadingId(null);
        }
      }
    );
  };

  // --- 4. FORUM ACTIONS ---
  const handleForumPostDelete = (postId: string) => {
    openConfirm(
      "Delete Forum Discussion",
      "Are you sure you want to delete this forum post? All replies and saved history associated with this post will be permanently deleted.",
      async () => {
        setLoadingId(postId);
        try {
          const res = await deleteForumPostAction(postId);
          if (res.success) {
            toast.success("Forum post deleted successfully.");
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            router.refresh();
          } else {
            toast.error(res.error || "Failed to delete forum post.");
          }
        } catch {
          toast.error("Failed to delete post.");
        } finally {
          setLoadingId(null);
        }
      }
    );
  };

  // Filtering
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredMentors = mentors.filter(
    (m) =>
      m.user.name.toLowerCase().includes(mentorSearch.toLowerCase()) ||
      m.user.email.toLowerCase().includes(mentorSearch.toLowerCase()) ||
      m.domain.toLowerCase().includes(mentorSearch.toLowerCase())
  );

  const filteredBookings = bookings.filter(
    (b) =>
      b.student.name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.mentor.user.name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.topic.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.author.name.toLowerCase().includes(postSearch.toLowerCase())
  );

  const featuredCount = mentors.filter((m) => m.isFeatured).length;

  return (
    <div className="space-y-6">
      <AnimatedFadeIn duration={0.3}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Centralized Admin Console</h1>
            <p className="text-sm text-[#64748B] mt-1 font-medium">
              Manage university members, alumni mentors, academic booking requests, and community discussions.
            </p>
          </div>
          <Badge className="bg-indigo-50 text-indigo-700 font-bold border-indigo-200 text-xs px-3 py-1 rounded-[4px]">
            System Control Active
          </Badge>
        </div>
      </AnimatedFadeIn>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatedFadeIn delay={0.03} duration={0.3}>
          <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-[#64748B] uppercase">Total Users</CardTitle>
              <Users className="h-4.5 w-4.5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">{users.length}</div>
            </CardContent>
          </Card>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={0.06} duration={0.3}>
          <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-[#64748B] uppercase">Active Mentors</CardTitle>
              <GraduationCap className="h-4.5 w-4.5 text-[#10B981]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">
                {mentors.filter((m) => m.isActive).length} / {mentors.length}
              </div>
            </CardContent>
          </Card>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={0.09} duration={0.3}>
          <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-[#64748B] uppercase">Featured Mentors</CardTitle>
              <Star className="h-4.5 w-4.5 text-[#f59e0b] fill-[#f59e0b]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">{featuredCount} / 3</div>
            </CardContent>
          </Card>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={0.12} duration={0.3}>
          <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-[#64748B] uppercase">Total Bookings</CardTitle>
              <CalendarRange className="h-4.5 w-4.5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0F172A]">{bookings.length}</div>
            </CardContent>
          </Card>
        </AnimatedFadeIn>
      </div>

      {/* Tabs list */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-slate-100 p-1 rounded-[4px] border border-[#E2E8F0] flex w-full md:w-fit overflow-x-auto">
          <TabsTrigger value="users" className="rounded-[2px] font-semibold text-xs py-1.5 px-4 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-[#0F172A] data-[state=active]:shadow-sm">
            <Users className="h-3.5 w-3.5 mr-1.5 inline" /> Users
          </TabsTrigger>
          <TabsTrigger value="mentors" className="rounded-[2px] font-semibold text-xs py-1.5 px-4 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-[#0F172A] data-[state=active]:shadow-sm">
            <GraduationCap className="h-3.5 w-3.5 mr-1.5 inline" /> Mentors
          </TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-[2px] font-semibold text-xs py-1.5 px-4 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-[#0F172A] data-[state=active]:shadow-sm">
            <CalendarRange className="h-3.5 w-3.5 mr-1.5 inline" /> Booking Requests
          </TabsTrigger>
          <TabsTrigger value="posts" className="rounded-[2px] font-semibold text-xs py-1.5 px-4 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-[#0F172A] data-[state=active]:shadow-sm">
            <MessageSquareCode className="h-3.5 w-3.5 mr-1.5 inline" /> Forum Posts
          </TabsTrigger>
        </TabsList>

        {/* 1. USERS TAB CONTENT */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center relative max-w-sm">
            <Search className="absolute left-3 h-4 w-4 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search users by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-[4px] text-sm text-[#0F172A] placeholder-[#64748B]"
            />
          </div>

          <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-3">Member</th>
                    <th className="px-6 py-3">Email Address</th>
                    <th className="px-6 py-3">Role Authority</th>
                    <th className="px-6 py-3">Account State</th>
                    <th className="px-6 py-3 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-[#0f172a]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[#64748B] italic">
                        No users matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <Avatar className="h-8 w-8 rounded-full border border-slate-100">
                            <AvatarImage src={user.imageUrl || ""} alt={user.name} />
                            <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-[#0F172A]">{user.name}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <select
                            value={user.role}
                            disabled={loadingId === user.id}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            className="bg-white border border-[#E2E8F0] p-1.5 rounded-[4px] text-xs font-bold text-[#0f172a] focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="STUDENT">Student</option>
                            <option value="MENTOR">Mentor</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.isActive}
                              disabled={loadingId === user.id}
                              onCheckedChange={() => handleToggleUserActive(user.id)}
                            />
                            <span className={user.isActive ? "text-green-600" : "text-red-500"}>
                              {user.isActive ? "Active" : "Suspended"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* 2. MENTORS TAB CONTENT */}
        <TabsContent value="mentors" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center relative max-w-sm flex-1">
              <Search className="absolute left-3 h-4 w-4 text-[#64748B]" />
              <Input
                type="text"
                placeholder="Search mentors by name, email, or domain..."
                value={mentorSearch}
                onChange={(e) => setMentorSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-[4px] text-sm text-[#0F172A] placeholder-[#64748B]"
              />
            </div>
            <div className="text-xs text-[#64748B] font-semibold bg-amber-50 border border-amber-200/50 p-2.5 rounded-[4px]">
              Featured Mentors on Landing Page: <strong className="text-[#f59e0b] font-bold">{featuredCount} / 3 selected</strong>
            </div>
          </div>

          <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-3">Mentor</th>
                    <th className="px-6 py-3">Domain</th>
                    <th className="px-6 py-3">Headline</th>
                    <th className="px-6 py-3">Featured (Max 3)</th>
                    <th className="px-6 py-3 text-right">Visibility State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-[#0f172a]">
                  {filteredMentors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[#64748B] italic">
                        No mentors found.
                      </td>
                    </tr>
                  ) : (
                    filteredMentors.map((mentor) => (
                      <tr key={mentor.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <Avatar className="h-8 w-8 rounded-full border border-slate-100">
                            <AvatarImage src={mentor.user.imageUrl || ""} alt={mentor.user.name} />
                            <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold">
                              {mentor.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#0F172A]">{mentor.user.name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">{mentor.user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="bg-slate-100 text-[#0F172A] font-semibold border-0">
                            {mentor.domain}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600 truncate max-w-xs">{mentor.headline}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={mentor.isFeatured}
                              disabled={loadingId === mentor.id}
                              onCheckedChange={(checked) => handleToggleMentorFeatured(mentor.id, checked)}
                            />
                            {mentor.isFeatured ? (
                              <Star className="h-4 w-4 text-[#f59e0b] fill-[#f59e0b]" />
                            ) : (
                              <Star className="h-4 w-4 text-slate-300" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Switch
                              checked={mentor.isActive}
                              disabled={loadingId === mentor.id}
                              onCheckedChange={() => handleToggleMentorActive(mentor.id)}
                            />
                            <span className={mentor.isActive ? "text-green-600" : "text-red-500"}>
                              {mentor.isActive ? "Active" : "Hidden"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* 3. BOOKINGS TAB CONTENT */}
        <TabsContent value="bookings" className="space-y-4">
          <div className="flex items-center relative max-w-sm">
            <Search className="absolute left-3 h-4 w-4 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search bookings by student, mentor, topic..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-[4px] text-sm text-[#0F172A] placeholder-[#64748B]"
            />
          </div>

          <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-3">Student Requestor</th>
                    <th className="px-6 py-3">Assigned Mentor</th>
                    <th className="px-6 py-3">Session Topic</th>
                    <th className="px-6 py-3">Preferred Date</th>
                    <th className="px-6 py-3">Session Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-[#0f172a]">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#64748B] italic">
                        No session requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-bold text-[#0F172A]">{booking.student.name}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">{booking.mentor.user.name}</td>
                        <td className="px-6 py-4 font-semibold text-indigo-600">{booking.topic}</td>
                        <td className="px-6 py-4 font-medium text-slate-500">
                          {booking.preferredAt
                            ? new Date(booking.preferredAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Flexible"}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={booking.status}
                            disabled={loadingId === booking.id}
                            onChange={(e) => handleBookingStatusChange(booking.id, e.target.value as BookingStatus)}
                            className="bg-white border border-[#E2E8F0] p-1.5 rounded-[4px] text-xs font-bold text-[#0f172a] focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Declined</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={loadingId === booking.id}
                            onClick={() => handleBookingDelete(booking.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 cursor-pointer rounded-[4px]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* 4. FORUM TAB CONTENT */}
        <TabsContent value="posts" className="space-y-4">
          <div className="flex items-center relative max-w-sm">
            <Search className="absolute left-3 h-4 w-4 text-[#64748B]" />
            <Input
              type="text"
              placeholder="Search posts by title or author..."
              value={postSearch}
              onChange={(e) => setPostSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-[4px] text-sm text-[#0F172A] placeholder-[#64748B]"
            />
          </div>

          <Card className="border border-[#E2E8F0] bg-white rounded-[4px] shadow-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    <th className="px-6 py-3">Discussion Title</th>
                    <th className="px-6 py-3">Author Name</th>
                    <th className="px-6 py-3">Author Role</th>
                    <th className="px-6 py-3">Comments Count</th>
                    <th className="px-6 py-3">Date Published</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-[#0f172a]">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#64748B] italic">
                        No forum posts found.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <a
                            href={`/forum/${post.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#0F172A] hover:text-[#4F46E5] hover:underline"
                          >
                            {post.title}
                          </a>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">{post.author.name}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 uppercase text-[9px] font-bold">
                            {post.author.role.toLowerCase()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">{post._count.replies} Replies</td>
                        <td className="px-6 py-4 font-medium text-slate-500">
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={loadingId === post.id}
                            onClick={() => handleForumPostDelete(post.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 cursor-pointer rounded-[4px]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmConfig(null);
        }}
        onConfirm={confirmConfig?.onConfirm || (() => {})}
        title={confirmConfig?.title || "Confirm Action"}
        description={confirmConfig?.description || "Are you sure you want to proceed?"}
        confirmText="Confirm"
        variant={confirmConfig?.variant || "destructive"}
      />
    </div>
  );
}
