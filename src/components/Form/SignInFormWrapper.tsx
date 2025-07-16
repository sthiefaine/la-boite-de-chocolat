"use client";
import { Suspense } from "react";
import SignInForm from "./SignInForm";
import FormSkeleton from "./FormSkeleton";

export default function SignInFormWrapper() {
  return (
    <Suspense fallback={<FormSkeleton fields={2} />}>
      <SignInForm />
    </Suspense>
  );
}
