"use client";
import { Suspense } from "react";
import SignUpForm from "./SignUpForm";
import FormSkeleton from "./FormSkeleton";

export default function SignUpFormWrapper() {
  return (
    <Suspense fallback={<FormSkeleton fields={4} />}>
      <SignUpForm />
    </Suspense>
  );
} 