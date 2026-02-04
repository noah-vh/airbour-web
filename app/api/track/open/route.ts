import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Lazy initialization to avoid build-time errors
function getConvexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL not configured");
  }
  return new ConvexHttpClient(url);
}

// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const newsletterId = searchParams.get("nid");
  const subscriberId = searchParams.get("sid");

  // Always return the pixel, even if tracking fails
  const response = new NextResponse(TRACKING_PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });

  // Record the open event asynchronously
  if (newsletterId && subscriberId) {
    try {
      const convex = getConvexClient();
      await convex.mutation(api.emailEvents.recordOpen, {
        newsletterId: newsletterId as Id<"newsletters">,
        subscriberId: subscriberId as Id<"subscribers">,
      });
    } catch (error) {
      // Silently fail - don't break the email experience
      console.error("Failed to record open event:", error);
    }
  }

  return response;
}
