"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import { User } from "@supabase/supabase-js";
import { UserProfile } from "@prisma/client";

interface AppHeaderProps {
  user: User | null; // Supabase user
  profile: UserProfile | null; // Prisma user profile
}

export default function AppHeader({ user, profile }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

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

  const navLinks = [
    { name: "Mentors", href: "/mentors" },
    { name: "Forum", href: "/forum" },
    ...(user ? [{ name: "Dashboard", href: "/dashboard" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Left: Branding */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-foreground">
            EliteMentorship
          </Link>
          {/* Middle: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-foreground ${
                    isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Auth Action & Avatar */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="hidden sm:inline-flex border-border text-foreground hover:bg-muted"
              >
                Sign Out
              </Button>
              <Link href="/dashboard/profile">
                <Avatar className="h-10 w-10 border border-border cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage
                    src={profile?.imageUrl || ""}
                    alt={profile?.name || "User Avatar"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {profile?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost" })}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({
                  variant: "default",
                  className: "bg-primary text-primary-foreground hover:bg-primary/95",
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
