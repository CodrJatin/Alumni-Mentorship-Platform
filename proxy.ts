import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

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

  const adminEmail = process.env.ADMIN_EMAIL || "admin@alumentor.com";
  const isAdmin = user?.email === adminEmail;

  const isProtectedPage =
    pathname.startsWith("/dashboard") || pathname === "/forum/new";
  const isAdminPage = pathname.startsWith("/admin");

  if (user) {
    // If user is authenticated and visits an auth page, redirect to correct landing console
    if (isAuthPage) {
      return NextResponse.redirect(new URL(isAdmin ? "/admin" : "/dashboard", request.url));
    }

    // Role-based protection for Admin routes
    if (isAdminPage && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect admin trying to access standard dashboard pages
    if (isProtectedPage && isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } else {
    // If user is not authenticated and visits a protected or admin page, redirect to /login
    if (isProtectedPage || isAdminPage) {
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
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
