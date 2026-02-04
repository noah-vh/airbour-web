import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Hash the password for comparison (prevents plaintext in code)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Pre-computed SHA-256 hash (set DEMO_PASSWORD_HASH env var to override)
const DEMO_PASSWORD_HASH = "6147537f8d6af65bb643839036f23ff02420e045229c36d5a6df4afa1e34478c";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  // Use env variable if set, otherwise use the hardcoded hash
  const expectedHash = process.env.DEMO_PASSWORD_HASH || DEMO_PASSWORD_HASH;
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
