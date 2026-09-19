"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Star,
  Target,
  Code,
  BarChart3,
  Terminal,
  Coffee,
  FileCode,
  Globe,
  Cpu,
  Database,
  Cloud,
  Shield,
  Layers,
  Network,
  Smartphone,
  Layout,
} from "lucide-react";
import Link from "next/link";
import { ALL_LEARNING_GOALS, LearningGoalOption } from "@/lib/courses";

const GOAL_ICONS: Record<string, any> = {
  "Data Structures & Algorithms": Code,
  "Data Analytics": BarChart3,
  "Python": Terminal,
  "Java": Coffee,
  "C++": FileCode,
  "Web Development": Globe,
  "Machine Learning": Cpu,
  "Artificial Intelligence": Sparkles,
  "Data Science": Database,
  "Cloud Computing": Cloud,
  "DevOps": Cloud,
  "Cyber Security": Shield,
  "Database Management": Database,
  "Computer Networks": Network,
  "Operating Systems": Layers,
  "App Development": Smartphone,
  "UI/UX": Layout,
  "Software Development": Code,
};

export default function OnboardingStep4Page() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Data Analytics",
    "Python",
    "Database Management",
  ]);
  const [primaryGoal, setPrimaryGoal] = useState<string>("Data Analytics");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          if (data.user.learningGoals) {
            try {
              const goals = JSON.parse(data.user.learningGoals);
              if (Array.isArray(goals) && goals.length > 0) {
                setSelectedGoals(goals);
                setPrimaryGoal(data.user.primaryLearningGoal || goals[0]);
                return;
              }
            } catch {}
          }
          if (data.user.targetSkill) {
            setSelectedGoals([data.user.targetSkill]);
            setPrimaryGoal(data.user.targetSkill);
          }
        }
      } catch (err) {
        console.error("Failed to load user learning goals", err);
      }
    }
    loadUser();
  }, []);

  const toggleGoal = (goalName: string) => {
    setSelectedGoals((prev) => {
      let next: string[];
      if (prev.includes(goalName)) {
        next = prev.filter((g) => g !== goalName);
        // If primary goal was deselected, update primary to first remaining goal
        if (primaryGoal === goalName) {
          setPrimaryGoal(next[0] || "");
        }
      } else {
        next = [...prev, goalName];
        // If no primary goal was set, make this new one primary
        if (!primaryGoal) {
          setPrimaryGoal(goalName);
        }
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedGoals.length === 0) {
      setError("Please select at least one learning goal to personalize your roadmap.");
      return;
    }

    const finalPrimary = primaryGoal && selectedGoals.includes(primaryGoal) ? primaryGoal : selectedGoals[0];

    setLoading(true);

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 4,
          learningGoals: selectedGoals,
          primaryLearningGoal: finalPrimary,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save learning goals.");
      }

      router.push("/onboarding/step-5");
    } catch (err: any) {
      setError(err?.message || "Failed to save learning goals.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        <OnboardingHeader
          currentStep={4}
          title="What do you want to learn?"
          subtitle="Choose the skills or career paths you want to develop. We'll personalize your learning journey around your goals."
        />

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Multi-Select Learning Goals Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Learning Goals <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedGoals.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {ALL_LEARNING_GOALS.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.name);
                  const Icon = GOAL_ICONS[goal.name] || Target;

                  return (
                    <div
                      key={goal.id}
                      onClick={() => toggleGoal(goal.name)}
                      className={`relative p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 select-none ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center space-x-1.5">
                          <h3
                            className={`text-xs font-bold truncate ${
                              isSelected ? "text-blue-950" : "text-slate-900"
                            }`}
                          >
                            {goal.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                          {goal.description}
                        </p>
                      </div>

                      <div
                        className={`absolute top-3.5 right-3 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Primary Goal Selector (Prompt §8) */}
            {selectedGoals.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 animate-fadeIn">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Which one is your primary learning goal?
                  </label>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Your primary goal receives higher priority on your Home Feed and active roadmap. You can switch learning paths anytime!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedGoals.map((goalName) => {
                    const isPrimary = primaryGoal === goalName;
                    return (
                      <label
                        key={goalName}
                        className={`flex items-center space-x-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors text-xs font-semibold ${
                          isPrimary
                            ? "bg-amber-50 border-amber-300 text-amber-950 ring-1 ring-amber-200"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="primaryGoal"
                          value={goalName}
                          checked={isPrimary}
                          onChange={() => setPrimaryGoal(goalName)}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="truncate">{goalName}</span>
                        {isPrimary && (
                          <span className="ml-auto text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                            Primary
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <Link
                href="/onboarding/step-3"
                className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Skills
              </Link>

              <button
                type="submit"
                disabled={loading || selectedGoals.length === 0}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? (
                  "Saving Goals..."
                ) : (
                  <>
                    <span>Continue to Final Step</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
