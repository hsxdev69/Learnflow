"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import LearnerNav from "@/components/layout/LearnerNav";
import { SessionUser } from "@/types";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Award,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import {
  getCachedUser,
  setCachedUser,
  getCachedCompetencies,
  setCachedCompetencies,
  fetchUserWithCache,
  fetchCompetenciesWithCache,
} from "@/lib/clientCache";

interface CompetencyItem {
  id: string;
  competencyId: string;
  domain: string;
  name: string;
  code: string;
  description: string;
  currentScore: number;
  requiredLevel: number;
  gap: number;
  status: string;
  lastEvaluatedAt: string;
  topics: string[];
}

export default function CompetenciesPage() {
  const cachedUser = getCachedUser();
  const cachedComp = getCachedCompetencies();

  const [user, setUser] = useState<SessionUser | null>(cachedUser);
  const [competencies, setCompetencies] = useState<CompetencyItem[]>(cachedComp?.competencies || []);
  const [overall, setOverall] = useState(cachedComp?.overallCompetency || 0);
  const [selectedComp, setSelectedComp] = useState<CompetencyItem | null>(
    cachedComp?.competencies?.[0] || null
  );
  const [loading, setLoading] = useState<boolean>(!cachedComp);

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, compData] = await Promise.all([
          fetchUserWithCache(),
          fetchCompetenciesWithCache(),
        ]);

        if (userData) setUser(userData);
        if (compData?.competencies) {
          setCompetencies(compData.competencies);
          setOverall(compData.overallCompetency || 0);
          setSelectedComp((prev) => prev || compData.competencies[0] || null);
        }
      } catch (err) {
        console.error("Failed to load competency profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "STRONG":
        return {
          label: "Strong",
          className: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      case "DEVELOPING":
        return {
          label: "Developing",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "NEEDS_IMPROVEMENT":
        return {
          label: "Needs Improvement",
          className: "bg-amber-100 text-amber-800 border-amber-200",
        };
      case "CRITICAL_GAP":
        return {
          label: "Critical Gap",
          className: "bg-rose-100 text-rose-800 border-rose-200",
        };
      default:
        return {
          label: status,
          className: "bg-slate-100 text-slate-800 border-slate-200",
        };
    }
  };

  if (!user && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-10">
      {user && <Header user={user} />}
      <LearnerNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 w-full flex-1">
        {/* Title & Overall Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>SIH 2026 Engineering Framework Benchmark</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Engineering Competency & Mastery Profile
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Evaluated against engineering curriculum standards, topic mastery assessments, and algorithmic milestones
            </p>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-4 sm:min-w-[240px] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Overall Competency
              </span>
              <div className="text-3xl font-extrabold text-white mt-0.5">
                {overall}%
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Status</span>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">
                {overall >= 75 ? "Proficient" : "Developing"}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Competencies List (PRD §14) & Gap Details (PRD §15) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 6 Core Competency Domains */}
          <div className="lg:col-span-6 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
              Official Competency Domains (Select to inspect)
            </h2>

            {competencies.map((c) => {
              const badge = getStatusBadge(c.status);
              const isSelected = selectedComp?.id === c.id;

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedComp(c)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-white border-blue-600 shadow-md ring-1 ring-blue-600"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900">
                      {c.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-extrabold text-slate-800">
                        {c.currentScore}%
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar (PRD §14) */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        c.currentScore < 50
                          ? "bg-rose-500"
                          : c.currentScore < 75
                          ? "bg-blue-600"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${c.currentScore}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Benchmark: {c.requiredLevel}%</span>
                    {c.gap > 0 ? (
                      <span className="text-amber-700 font-semibold">
                        Gap: {c.gap} points
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">
                        Target Met ✓
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Competency Gap Details (PRD §15) */}
          <div className="lg:col-span-6">
            {selectedComp ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 sticky top-20">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    Competency Deep Dive
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">
                    {selectedComp.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {selectedComp.description}
                  </p>
                </div>

                {/* Gap Numbers Panel (PRD §15) */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">
                      Current Level
                    </span>
                    <div className="text-2xl font-bold text-slate-900 mt-0.5">
                      {selectedComp.currentScore}%
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">
                      Target Level
                    </span>
                    <div className="text-2xl font-bold text-slate-900 mt-0.5">
                      {selectedComp.requiredLevel}%
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                    <span className="text-[11px] text-amber-800 uppercase font-semibold">
                      Gap
                    </span>
                    <div className="text-2xl font-bold text-amber-800 mt-0.5">
                      {selectedComp.gap} pts
                    </div>
                  </div>
                </div>

                {/* What You Should Learn (PRD §15) */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
                    What You Should Learn
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedComp.topics.map((t, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 text-xs text-slate-700 flex items-center space-x-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></span>
                        <span className="font-medium">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Learning & Practice Actions (PRD §15) */}
                <div className="space-y-3 pt-2">
                  <Link
                    href={`/learn?competencyId=${selectedComp.competencyId}`}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-900 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-blue-700" />
                      <div>
                        <div className="text-xs font-bold">
                          Browse Learning Resources
                        </div>
                        <div className="text-[11px] text-blue-700">
                          Curated modules and iGOT courses
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </Link>

                  <Link
                    href={`/quizzes`}
                    className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Take Practice Quiz for {selectedComp.name}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
