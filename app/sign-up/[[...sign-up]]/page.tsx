import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F4]">
      <SignUp />
    </div>
  );
}
