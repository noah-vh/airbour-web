import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/subscribe",
  "/unsubscribe",
  "/login",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/track/(.*)",
  "/api/stripe/webhook",
]);

// Check if Clerk is configured
const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Passthrough middleware when Clerk is not configured
function passthroughMiddleware(request: NextRequest) {
  return NextResponse.next();
}

// Clerk middleware when configured
const clerkMiddlewareHandler = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export default isClerkConfigured ? clerkMiddlewareHandler : passthroughMiddleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
