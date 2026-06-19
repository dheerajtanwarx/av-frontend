import type { Metadata } from "next";
import { Suspense } from "react";
import AuthView from "../components/auth/AuthView";

export const metadata: Metadata = {
  title: "Log in — AV Creation",
  description: "Sign in to your AV Creation account with Google or your mobile number.",
};

export default function LoginPage() {
  return (
    <Suspense>
      <AuthView mode="login" />
    </Suspense>
  );
}
