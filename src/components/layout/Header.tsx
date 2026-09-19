"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Shield, Sparkles, BookOpen, GraduationCap } from "lucide-react";
import { SessionUser } from "@/types";

interface HeaderProps {
  user: SessionUser;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const isAdmin = user.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
      {/* SIH 2026 Official Top Bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1 px-4 sm:px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide text-[11px] text-slate-200">
            SMART INDIA HACKATHON 2026 • AI-POWERED PERSONALIZED LEARNING PLATFORM
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-[11px] text-slate-400">
          <span>Engineering Education</span>
          <span>•</span>
          <span className="text-blue-300 font-semibold">Autonomous Adaptive Progression</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-slate-900">
                LearnFlow <span className="text-blue-600">AI</span>
              </span>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              AI-Powered Personalized Learning for Engineering
            </p>
          </div>
        </Link>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3">
          <Link
            href="/profile"
            className="hidden md:flex flex-col items-end hover:opacity-80 transition group p-1 rounded-lg"
          >
            <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition">
              {user.name}
            </span>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <span className="truncate max-w-[180px]">
                {user.branch || user.department || "Engineering"}
              </span>
              {user.year && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-slate-700">{user.year}</span>
                </>
              )}
            </div>
          </Link>

          <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
            <Link
              href="/profile"
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Edit Profile & Skills"
            >
              <UserIcon className="w-4 h-4" />
            </Link>

            {isAdmin ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                <Shield className="w-3 h-3 mr-1 text-purple-600" />
                Admin
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Learner
              </span>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
