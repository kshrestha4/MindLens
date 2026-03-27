import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes that don't need auth
  const publicPaths = ["/", "/auth/signin", "/auth/signup"];
  if (publicPaths.some((p) => pathname === p)) {
    return NextResponse.next();
  }

  // Auth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Require auth for all other routes
  if (!session) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // RBAC: Clinician routes
  if (pathname.startsWith("/clinician") || pathname.startsWith("/api/clinician")) {
    const userRole = (session.user as { role?: string }).role;
    if (userRole !== "CLINICIAN" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
