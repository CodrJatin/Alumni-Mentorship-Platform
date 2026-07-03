import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import prisma from "@/lib/db/prisma";

export async function proxy(request: NextRequest) {
  // 1. Refresh Supabase session
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAuthPage = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ].some((path) => pathname === path);

  const isProtectedPage =
    pathname.startsWith("/dashboard") || pathname === "/forum/new";
  const isAdminPage = pathname.startsWith("/dashboard/users");

  if (user) {
    // If user is authenticated and visits an auth page, redirect to /dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Role-based protection for Admin routes
    if (isAdminPage) {
      try {
        const profile = await prisma.userProfile.findUnique({
          where: { authUserId: user.id },
          select: { role: true },
        });

        if (profile?.role !== "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch (error) {
        console.error("Error checking user role in proxy:", error);
        // Fallback safety redirect
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  } else {
    // If user is not authenticated and visits a protected page, redirect to /login
    if (isProtectedPage) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any extension assets (svg, png, jpg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
