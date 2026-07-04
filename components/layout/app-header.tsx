"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@prisma/client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useSidebar } from "@/components/layout/sidebar-context";

interface AppHeaderProps {
  user: User | null; // Supabase user
  profile: UserProfile | null; // Prisma user profile
}

export default function AppHeader({ user, profile }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { toggle: toggleSidebar, isOpen: isSidebarOpen } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      router.refresh();
      router.push("/");
    }
  };

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@alumentor.com";
  const isAdmin = user?.email === adminEmail;

  const navLinks = [
    { name: "Mentors", href: "/mentors" },
    { name: "Forum", href: "/forum" },
    ...(user ? [{ name: isAdmin ? "Admin Dashboard" : "Dashboard", href: isAdmin ? "/admin" : "/dashboard" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white">
      <div className="flex h-16 w-full items-center justify-between px-8 gap-4">
        {/* Left: Hamburger & Branding */}
        <div className="flex items-center gap-6">
          {user && (
            <button
              onClick={toggleSidebar}
              className="md:hidden p-1 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent border-0 cursor-pointer"
              aria-label="Toggle Sidebar"
            >
              {isSidebarOpen ? <X className="h-6 w-6 text-slate-700" /> : <Menu className="h-6 w-6 text-slate-700" />}
            </button>
          )}

          <Link href="/" className="text-2xl font-bold tracking-tight text-[#0F172A]">
            AluMentor
          </Link>

          <nav className="hidden md:flex items-center gap-6 h-16 ml-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors relative flex items-center h-full ${
                    isActive ? "text-[#0F172A]" : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4f46e5]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Auth Actions or Profile Dropdown Popup */}
        <div className="flex items-center gap-4">
          {user ? (
            isAdmin ? (
              <button
                onClick={handleSignOut}
                className="border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-[4px] font-semibold text-xs py-1.5 px-3 bg-transparent cursor-pointer transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="focus:outline-none cursor-pointer bg-transparent border-0 p-0"
                >
                  <Avatar className="h-10 w-10 border border-[#E2E8F0] rounded-full hover:opacity-90 transition-opacity">
                    <AvatarImage
                      src={profile?.imageUrl || ""}
                      alt={profile?.name || "User Avatar"}
                    />
                    <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold rounded-full">
                      {profile?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>

              {/* Profile Popup Dropdown Menu */}
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-[#E2E8F0] rounded-[4px] shadow-lg py-2 z-50 text-left">
                    {/* User profile brief details card */}
                    <div className="px-4 py-3 flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-[#E2E8F0] rounded-full">
                        <AvatarImage src={profile?.imageUrl || ""} alt={profile?.name} />
                        <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold rounded-full">
                          {profile?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-[#0F172A] truncate">{profile?.name}</p>
                        <span className="inline-block px-2 py-0.5 mt-0.5 text-[9px] font-bold uppercase rounded-full bg-indigo-50 text-indigo-700 tracking-wider">
                          {profile?.role?.toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 my-1.5" />

                    <div className="px-1.5 space-y-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 rounded-[4px] transition-colors"
                      >
                        Dashboard
                      </Link>

                      {/* Mobile view supplementary nav routes inside popup */}
                      <div className="md:hidden space-y-0.5">
                        <Link
                          href="/mentors"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 rounded-[4px] transition-colors"
                        >
                          Mentors
                        </Link>
                        <Link
                          href="/forum"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 rounded-[4px] transition-colors"
                        >
                          Forum
                        </Link>
                      </div>

                      <Link
                        href="/dashboard/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-slate-50 rounded-[4px] transition-colors"
                      >
                        Profile Settings
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 my-1.5" />

                    <div className="px-1.5">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          handleSignOut();
                        }}
                        className="w-full text-left flex items-center px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-[4px] transition-colors bg-transparent border-0 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={buttonVariants({
                  variant: "ghost",
                  className: "text-[#64748B] hover:text-[#0F172A] font-semibold text-sm",
                })}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({
                  variant: "default",
                  className: "bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold rounded-[4px] text-sm px-4 py-2",
                })}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
