import AppSidebar from "@/components/layout/app-sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ensureUserProfile } from "@/lib/auth/ensure-user-profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await ensureUserProfile(user);

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      {/* Main Split Layout: Sidebar + Dashboard Content */}
      <div className="flex flex-1 w-full gap-0 relative">
        <AppSidebar userProfile={profile} />
        <main className="flex-1 md:pl-72 px-8 py-8 overflow-y-auto bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
