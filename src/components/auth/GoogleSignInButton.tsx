"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";

interface GoogleSignInButtonProps {
  mode?: "signin" | "signup";
  onError?: (err: string) => void;
  className?: string;
  redirectTo?: string;
}

export default function GoogleSignInButton({
  mode = "signin",
  onError,
  className = "",
  redirectTo,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Real Firebase Google Sign-In Popup Trigger
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // 1. Trigger the official native Google Sign-In popup via Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user || !user.email) {
        throw new Error("No verified email received from Google account.");
      }

      // 2. Capture real authenticated user data
      const payload = {
        email: user.email,
        name: user.displayName || user.email.split("@")[0],
        uid: user.uid,
        providerId: "google.com",
        photoURL: user.photoURL || null,
      };

      // 3. Sync authenticated user to backend database & set secure session cookie
      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to synchronize session.");
      }

      // 4. Route user seamlessly to dashboard or onboarding
      router.push(redirectTo || data.redirectTo || "/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Firebase Google Sign-In error:", err);

      // Handle user intentionally closing popup window
      if (err?.code === "auth/popup-closed-by-user") {
        setLoading(false);
        return;
      }

      if (err?.code === "auth/cancelled-popup-request") {
        setLoading(false);
        return;
      }

      if (err?.code === "auth/popup-blocked") {
        onError?.("Popup window was blocked by your browser. Please allow popups for Google sign-in.");
        setLoading(false);
        return;
      }

      onError?.(err?.message || "Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`btn-press card-hover w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 rounded-xl bg-white hover:bg-slate-50/80 text-slate-700 text-sm font-semibold shadow-xs transition-all disabled:opacity-60 cursor-pointer ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Opening Google Sign-In...</span>
        </>
      ) : (
        <>
          {/* Official Google Vector Logo */}
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
          </span>
        </>
      )}
    </button>
  );
}
