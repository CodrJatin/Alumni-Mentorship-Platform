"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutGrid,
  User,
  GraduationCap,
  Clock,
  MessageSquare,
  Shield,
  Plus,
} from "lucide-react";
import { UserRole } from "@prisma/client";

interface AppSidebarProps {
  userProfile: {
    name: string;
    email: string;
    role: UserRole;
    imageUrl?: string | null;
  } | null;
}

export default function AppSidebar({ userProfile }: AppSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: LayoutGrid,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      name: "Mentors",
      href: "/dashboard/mentors",
      icon: GraduationCap,
    },
    {
      name: "Requests",
      href: "/dashboard/requests",
      icon: Clock,
    },
    {
      name: "Forum",
      href: "/dashboard/forum",
      icon: MessageSquare,
    },
  ];

  const showManagement = userProfile?.role === UserRole.ADMIN;
  const isStudent = userProfile?.role === UserRole.STUDENT;

  return (
    <aside className="w-64 border-r border-border bg-background flex flex-col h-[calc(100vh-4rem)] sticky top-16">
      {/* Top: Welcome User Block */}
      <div className="p-6 flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-border">
          <AvatarImage
            src={userProfile?.imageUrl || ""}
            alt={userProfile?.name || "Avatar"}
          />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {userProfile?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-muted-foreground font-medium">
            Welcome back
          </span>
          <span className="text-sm font-semibold text-foreground truncate">
            {userProfile?.name || "Academic Portal"}
          </span>
        </div>
      </div>

      <Separator />

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}

        {showManagement && (
          <>
            <div className="pt-4 pb-1">
              <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </span>
            </div>
            <Link
              href="/dashboard/users"
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === "/dashboard/users"
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Shield className="h-5 w-5 flex-shrink-0" />
              Management
            </Link>
          </>
        )}
      </nav>

      {/* Bottom Action Button (Student-focused, but visible based on design image) */}
      <div className="p-4 border-t border-border">
        {isStudent ? (
          <Link
            href="/mentors"
            className={buttonVariants({
              variant: "default",
              className: "w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white flex items-center justify-center gap-2 font-medium",
            })}
          >
            <Plus className="h-4 w-4" />
            Request Session
          </Link>
        ) : (
          <div className="text-center text-xs text-muted-foreground py-2 font-medium">
            Role: <span className="font-semibold">{userProfile?.role}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
