import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/layout/app-header";
import { createClient } from "@/lib/supabase/server";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Toaster } from "@/components/ui/sonner";
import { ensureUserProfile } from "@/lib/auth/ensure-user-profile";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AluMentor",
  description: "Bridging the Gap Between Ambition and Experience.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  let user = null;
  let profile = null;

  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
    if (user) {
      profile = await ensureUserProfile(user);
    }
  } catch (err) {
    console.error("Error fetching session in root layout:", err);
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SidebarProvider>
          <AppHeader user={user} profile={profile} />
          {children}
        </SidebarProvider>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
