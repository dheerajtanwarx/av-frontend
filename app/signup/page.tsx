import type { Metadata } from "next";
import { Suspense } from "react";
import AuthView from "../components/auth/AuthView";

export const metadata: Metadata = {
  title: "Create your account — AV Creation",
  description: "Join the AV Creation Jaipuri atelier with Google or your mobile number.",
};

export default function SignupPage() {
  return (
    <Suspense>
      <AuthView mode="signup" />
    </Suspense>
  );
}
