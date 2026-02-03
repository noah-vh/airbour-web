import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const newsletterId = searchParams.get("nid");
  const subscriberId = searchParams.get("sid");
  const targetUrl = searchParams.get("url");

  // If no URL, redirect to homepage
  if (!targetUrl) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Decode the URL
  const decodedUrl = decodeURIComponent(targetUrl);

  // Validate URL to prevent open redirect vulnerabilities
  try {
    const urlObj = new URL(decodedUrl);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Record the click event asynchronously
  if (newsletterId && subscriberId) {
    try {
      await convex.mutation(api.emailEvents.recordClick, {
        newsletterId: newsletterId as Id<"newsletters">,
        subscriberId: subscriberId as Id<"subscribers">,
        url: decodedUrl,
      });
    } catch (error) {
      // Silently fail - don't break the user experience
      console.error("Failed to record click event:", error);
    }
  }

  // Redirect to the target URL
  return NextResponse.redirect(decodedUrl);
}
