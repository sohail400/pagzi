import { Suspense } from "react";
import SignupForm from "@/app/signup/SignupForm";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
