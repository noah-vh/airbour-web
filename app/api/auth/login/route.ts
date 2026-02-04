import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Hash the password for comparison (prevents plaintext in code)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Password hash must be set in environment variables for security

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  // Get hash from environment variable
  const expectedHash = process.env.DEMO_PASSWORD_HASH;

  if (!expectedHash) {
    console.error("DEMO_PASSWORD_HASH environment variable not set");
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }
  const providedHash = hashPassword(password);

  if (providedHash === expectedHash) {
    const response = NextResponse.json({ success: true });

    // Set auth cookie - expires in 7 days
    response.cookies.set("demo_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  }

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
