"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import { ArrowRight, ArrowLeft, Check, Sparkles, Layers } from "lucide-react";
import Link from "next/link";
import { getSkillsForBranch } from "@/lib/branch-skills";

interface SelectedSkill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
}

export default function OnboardingStep3Page() {
  const router = useRouter();
  const [branch, setBranch] = useState("Computer Engineering");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Record<string, "Beginner" | "Intermediate" | "Advanced">>({
    "C++": "Intermediate",
    "Basic Programming": "Intermediate",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          const userBranch = data.user.branch || "Computer Engineering";
          setBranch(userBranch);
          const skillsList = getSkillsForBranch(userBranch);
          setAvailableSkills(skillsList);

          if (data.user.skills) {
            try {
              const parsed = JSON.parse(data.user.skills);
              const map: Record<string, "Beginner" | "Intermediate" | "Advanced"> = {};
              parsed.forEach((s: any) => {
                map[s.name] = s.level || "Beginner";
              });
              if (Object.keys(map).length > 0) {
                setSelectedSkills(map);
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error("Failed to load user branch", err);
      }
    }
    loadUser();
  }, []);

  const toggleSkill = (skillName: string) => {
    setSelectedSkills((prev) => {
      const next = { ...prev };
      if (next[skillName]) {
        delete next[skillName];
      } else {
        next[skillName] = "Beginner";
      }
      return next;
    });
  };

  const setLevel = (skillName: string, level: "Beginner" | "Intermediate" | "Advanced", e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSkills((prev) => ({
      ...prev,
      [skillName]: level,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const skillsArray: SelectedSkill[] = Object.entries(selectedSkills).map(([name, level]) => ({
      name,
      level,
    }));

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 3,
          skills: skillsArray,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save skills.");
      }

      router.push("/onboarding/step-4");
    } catch (err: any) {
      setError(err?.message || "Failed to save skills.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full">
        <OnboardingHeader
          currentStep={3}
          title="What skills do you already have?"
          subtitle={`Showing skills tailored for ${branch}. Pick what you know to skip redundant basics.`}
        />

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{Object.keys(selectedSkills).length} skills selected</span>
            <span>Click any card to select/deselect and choose your level</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {availableSkills.map((skill) => {
                const isSelected = Boolean(selectedSkills[skill]);
                const currentLevel = selectedSkills[skill] || "Beginner";

                return (
                  <div
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${isSelected ? "text-blue-900" : "text-slate-800"}`}>
                        {skill}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isSelected ? "bg-blue-600 text-white" : "border border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {/* Skill Level Selector (PRD §9) */}
                    {isSelected && (
                      <div className="mt-3 pt-2.5 border-t border-blue-200/60 flex items-center justify-between gap-1">
                        {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={(e) => setLevel(skill, lvl, e)}
                            className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                              currentLevel === lvl
                                ? "bg-blue-600 text-white shadow-xs"
                                : "text-slate-600 hover:bg-blue-100"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
              <Link
                href="/onboarding/step-2"
                className="inline-flex items-center px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                <span>{loading ? "Personalizing Roadmap..." : "Continue to Final Step"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
