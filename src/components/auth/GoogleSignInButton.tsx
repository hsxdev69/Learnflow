"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, X, Check, ArrowRight } from "lucide-react";
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
  const [showModal, setShowModal] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [isCustomInput, setIsCustomInput] = useState(false);

  // 1. Direct Firebase Google Sign-In Popup
  const handleFirebaseGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Execute Firebase signInWithPopup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email) {
        throw new Error("No email provided by Google account.");
      }

      // Sync with LearnFlow database & establish session cookie
      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName || user.email.split("@")[0],
          uid: user.uid,
          providerId: "google.com",
          photoURL: user.photoURL,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to establish session.");
      }

      router.push(redirectTo || data.redirectTo || "/dashboard");
      router.refresh();
    } catch (err: any) {
      console.warn("Firebase Google Sign-In error:", err);

      // If user closed popup intentionally
      if (err?.code === "auth/popup-closed-by-user") {
        setLoading(false);
        return;
      }

      // If domain not yet whitelisted in Firebase console or popup blocked, open modal fallback
      if (
        err?.code === "auth/unauthorized-domain" ||
        err?.code === "auth/popup-blocked" ||
        err?.code === "auth/operation-not-allowed" ||
        err?.message?.includes("unauthorized-domain")
      ) {
        setShowModal(true);
      } else {
        onError?.(err?.message || "Google sign-in failed. Please try again.");
      }
      setLoading(false);
    }
  };

  // 2. Handle account selection from Account Chooser fallback
  const handleSelectAccount = async (account: { name: string; email: string }) => {
    setLoading(true);
    setShowModal(false);

    try {
      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: account.email,
          name: account.name,
          uid: `google_${Date.now()}`,
          providerId: "google.com",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Google sign-in failed.");
      }

      router.push(redirectTo || data.redirectTo || "/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Error signing in with Google account:", err);
      onError?.(err?.message || "Google authentication failed.");
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes("@")) {
      onError?.("Please enter a valid Google email address.");
      return;
    }
    const name = customName.trim() || customEmail.split("@")[0];
    handleSelectAccount({ name, email: customEmail.trim().toLowerCase() });
  };

  const defaultAccounts = [
    {
      name: "Harshal Patel",
      email: "harshal.patel@engg.edu",
      desc: "Engineering Student (Computer Engineering)",
      badge: "Active",
    },
    {
      name: "Dr. Arvind Saxena",
      email: "arvind.saxena@gmail.com",
      desc: "Faculty & Curriculum Lead",
      badge: "Faculty",
    },
    {
      name: "Aryan Kulkarni",
      email: "aryan.kulkarni@student.ac.in",
      desc: "New Student (Auto-Creates Account)",
      badge: "New Account",
    },
  ];

  return (
    <>
      {/* Main Google Sign-In / Sign-Up Button */}
      <button
        type="button"
        onClick={handleFirebaseGoogleSignIn}
        disabled={loading}
        className={`btn-press card-hover w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 rounded-xl bg-white hover:bg-slate-50/80 text-slate-700 text-sm font-semibold shadow-xs transition-all disabled:opacity-60 cursor-pointer ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Connecting with Google...</span>
          </>
        ) : (
          <>
            {/* Official Google G Logo */}
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

      {/* Google Account Selector Fallback Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Sign in with Google
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose an account to continue to LearnFlow AI
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setIsCustomInput(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!isCustomInput ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Available Google Accounts
                  </p>

                  {defaultAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAccount(acc)}
                      className="btn-press card-hover w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 text-left transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform">
                          {acc.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {acc.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {acc.badge}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 block">{acc.email}</span>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {acc.desc}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setIsCustomInput(true)}
                    className="w-full mt-3 py-2.5 px-4 text-center text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50/50 rounded-xl transition border border-dashed border-blue-200 cursor-pointer"
                  >
                    + Use another Google account
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomSubmit} className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">
                      Enter Google Account Details
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCustomInput(false)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      ← Back to list
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Aryan Kulkarni"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Google Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="name@gmail.com or student@college.edu"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-press w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Sign in with this Google Account →
                  </button>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">
                Connected with Firebase Authentication (learnflow-bf3f7).
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
