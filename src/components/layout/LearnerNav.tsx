"use client";

import React, { useEffect, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, HelpCircle, TrendingUp, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { prefetchAllTabs, prefetchTab } from "@/lib/clientCache";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Learn", href: "/learn", icon: BookOpen },
  { name: "Quizzes", href: "/quizzes", icon: HelpCircle },
  { name: "Progress", href: "/competencies", icon: TrendingUp },
  { name: "Assistant", href: "/assistant", icon: Sparkles },
];

function LearnerNavComponent() {
  const pathname = usePathname();

  // Idle pre-warm all tab routes and APIs on client load
  useEffect(() => {
    prefetchAllTabs();
  }, []);

  return (
    <>
      {/* Desktop Top Navigation Bar */}
      <nav className="hidden md:block bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-12">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  onMouseEnter={() => prefetchTab(item.name)}
                  onTouchStart={() => prefetchTab(item.name)}
                  className={clsx(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-blue-600 text-blue-600 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (PRD §40) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg px-2 py-1">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                onMouseEnter={() => prefetchTab(item.name)}
                onTouchStart={() => prefetchTab(item.name)}
                className={clsx(
                  "flex flex-col items-center justify-center py-2 text-xs font-medium rounded-lg transition-colors",
                  isActive
                    ? "text-blue-600 bg-blue-50/70 font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

const LearnerNav = memo(LearnerNavComponent);
export default LearnerNav;
