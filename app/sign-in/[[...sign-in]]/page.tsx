"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F4]">
        <div className="text-center p-8">
          <h1 className="text-xl font-semibold mb-2">Authentication Not Configured</h1>
          <p className="text-gray-500">Please configure Clerk environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F4]">
      <SignIn />
    </div>
  );
}
