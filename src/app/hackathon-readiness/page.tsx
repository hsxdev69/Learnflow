"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import LearnerNav from "@/components/layout/LearnerNav";
import { SessionUser } from "@/types";
import {
  Trophy,
  Rocket,
  BrainCircuit,
  Globe,
  Smartphone,
  Cloud,
  ShieldCheck,
  Coins,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Clock,
  Flame,
  BookOpen,
  Search,
  Code,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  Check,
  X,
  Target,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  HACKATHON_TRACKS,
  HackathonTrack,
  HackathonQuestion,
  EvaluationResult,
  evaluateTrackReadiness,
} from "@/lib/hackathonData";
import { fetchUserWithCache, getCachedUser } from "@/lib/clientCache";

export default function HackathonReadinessPage() {
  const [user, setUser] = useState<SessionUser | null>(getCachedUser());
  const [loadingUser, setLoadingUser] = useState<boolean>(!user);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  // Track exploration accordion state
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>("ai-ml");

  // Quiz active state
  const [activeQuizTrack, setActiveQuizTrack] = useState<HackathonTrack | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Results state
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [pastScores, setPastScores] = useState<Record<string, number>>({});

  // Fetch session user
  useEffect(() => {
    async function loadUser() {
      try {
        const u = await fetchUserWithCache();
        if (u) setUser(u);
      } catch (err) {
        console.warn("Could not load user:", err);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();

    // Load past readiness scores from localStorage
    try {
      const stored = localStorage.getItem("learnflow_hackathon_scores");
      if (stored) {
        setPastScores(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Timer effect during active quiz
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  // Format timer seconds into mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return HACKATHON_TRACKS.filter((track) => {
      const matchesSearch =
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.skillRequirements.some((sg) =>
          sg.skills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      return matchesSearch;
    });
  }, [searchQuery]);

  // Icon mapping helper
  const renderTrackIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case "BrainCircuit":
        return <BrainCircuit className={className} />;
      case "Globe":
        return <Globe className={className} />;
      case "Smartphone":
        return <Smartphone className={className} />;
      case "Cloud":
        return <Cloud className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      case "Coins":
        return <Coins className={className} />;
      default:
        return <Code className={className} />;
    }
  };

  // Start Assessment handler
  const handleStartQuiz = (track: HackathonTrack) => {
    setActiveQuizTrack(track);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setTimeElapsed(0);
    setTimerActive(true);
    setEvaluation(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Answer selection
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Submit assessment handler
  const handleSubmitQuiz = async () => {
    if (!activeQuizTrack) return;
    setTimerActive(false);

    // Evaluate locally
    const evalResult = evaluateTrackReadiness(activeQuizTrack, selectedAnswers);
    setEvaluation(evalResult);

    // Save score in local state and localStorage
    const newScores = {
      ...pastScores,
      [activeQuizTrack.id]: evalResult.scorePercentage,
    };
    setPastScores(newScores);
    try {
      localStorage.setItem("learnflow_hackathon_scores", JSON.stringify(newScores));
    } catch {}

    // Persist via API
    try {
      await fetch("/api/hackathon-readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: activeQuizTrack.id,
          answers: selectedAnswers,
        }),
      });
    } catch (apiErr) {
      console.warn("Notice: assessment backend sync notice:", apiErr);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-12 text-slate-900">
      {user && <Header user={user} />}
      <LearnerNav />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 w-full">
        {/* =========================================================================
            STATE 1: EVALUATION REPORT DISPLAY
           ========================================================================= */}
        {evaluation && activeQuizTrack && (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Return Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${activeQuizTrack.gradient} flex items-center justify-center text-white shadow-md`}
                >
                  {renderTrackIcon(activeQuizTrack.iconName, "w-6 h-6")}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Assessment Diagnostic
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Completed in {formatTime(timeElapsed)}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                    {evaluation.trackTitle} Readiness Scorecard
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStartQuiz(activeQuizTrack)}
                  className="btn-press px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retake Check
                </button>
                <button
                  onClick={() => {
                    setEvaluation(null);
                    setActiveQuizTrack(null);
                  }}
                  className="btn-press px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs hover:shadow-md transition"
                >
                  Explore All Tracks
                </button>
              </div>
            </div>

            {/* Score & Tier Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score Dial Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
                <div className="relative w-36 h-36 flex items-center justify-center mb-3">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={
                        evaluation.scorePercentage >= 75
                          ? "text-emerald-500"
                          : evaluation.scorePercentage >= 50
                          ? "text-blue-500"
                          : "text-amber-500"
                      }
                      strokeDasharray={`${evaluation.scorePercentage}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900">
                      {evaluation.scorePercentage}%
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Readiness
                    </span>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${evaluation.readinessTier.color}`}
                >
                  {evaluation.readinessTier.badge}
                </span>
                <p className="text-xs text-slate-500 mt-2">
                  Answered <strong>{evaluation.correctCount}</strong> of{" "}
                  <strong>{evaluation.totalQuestions}</strong> scenario questions correctly.
                </p>
              </div>

              {/* Assessment Verdict Card */}
              <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 mb-2">
                    <Award className="w-4 h-4" />
                    <span>HACKATHON COMPETITIVE PROFILE</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mb-2">
                    {evaluation.readinessTier.title}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {evaluation.readinessTier.description}
                  </p>
                </div>

                {/* Course Link Banner */}
                <div className="mt-5 p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Recommended Fast-Track Course</p>
                      <h4 className="text-sm font-bold text-slate-900">
                        {evaluation.recommendedCourseName}
                      </h4>
                    </div>
                  </div>
                  <Link
                    href={`/learn?courseId=${evaluation.recommendedCourseId}`}
                    className="btn-press px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    Start Course Modules
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Breakdown: Strong Points vs Areas to Improve */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strong Points */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Strong Points & Mastered Concepts ({evaluation.strongPoints.length})
                  </h3>
                </div>

                {evaluation.strongPoints.length > 0 ? (
                  <div className="space-y-2.5">
                    {evaluation.strongPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100"
                      >
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-emerald-950">{point}</p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            Demonstrated solid conceptual clarity and practical implementation knowledge.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
                    No clear strong areas recorded. We recommend starting with fundamental modules.
                  </p>
                )}
              </div>

              {/* Specific Skill Gaps to Improve */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Specific Gaps & Weak Points ({evaluation.areasToImprove.length})
                  </h3>
                </div>

                {evaluation.areasToImprove.length > 0 ? (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {evaluation.areasToImprove.map((gap, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">
                            {gap.skill}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-800">
                            Attention Needed
                          </span>
                        </div>
                        <p className="text-slate-700 font-medium mb-1.5 leading-relaxed">
                          {gap.recommendation}
                        </p>
                        <p className="text-[11px] text-slate-400 italic">
                          From scenario: {gap.questionHint}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-emerald-50 rounded-xl border border-emerald-200">
                    <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-emerald-900">Zero Skill Gaps Detected!</h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      You achieved a perfect 100% score across all architectural scenarios for this track.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 48-Hour Hackathon Action Plan */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Target className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tailored 48-Hour Hackathon Action Roadmap
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Sprint Strategy
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {evaluation.actionPlan.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white relative"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{step.stage}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.task}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STATE 2: ACTIVE QUIZ / INTERACTIVE SKILL CHECK
           ========================================================================= */}
        {activeQuizTrack && !evaluation && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quiz Top Header */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${activeQuizTrack.gradient} flex items-center justify-center text-white shadow-sm`}
                >
                  {renderTrackIcon(activeQuizTrack.iconName, "w-5 h-5")}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {activeQuizTrack.title} Readiness Check
                  </h2>
                  <p className="text-xs text-slate-500">
                    Question {currentQuestionIdx + 1} of {activeQuizTrack.questions.length} • Real-World
                    Hackathon Scenarios
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatTime(timeElapsed)}</span>
                </div>

                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to exit? Your progress in this test will be lost.")) {
                      setActiveQuizTrack(null);
                      setTimerActive(false);
                    }
                  }}
                  className="btn-press px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                >
                  Exit Test
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestionIdx + 1) / activeQuizTrack.questions.length) * 100
                  }%`,
                }}
              />
            </div>

            {/* Active Question Card */}
            {(() => {
              const currentQ = activeQuizTrack.questions[currentQuestionIdx];
              const isSelected = selectedAnswers[currentQ.id] !== undefined;

              return (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  {/* Category & Difficulty Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Competency Area: {currentQ.skillArea}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        currentQ.difficulty === "Easy"
                          ? "bg-emerald-100 text-emerald-700"
                          : currentQ.difficulty === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {currentQ.difficulty} Scenario
                    </span>
                  </div>

                  {/* Question Text */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                      {currentQ.question}
                    </h3>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3 pt-2">
                    {currentQ.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedAnswers[currentQ.id] === optIdx;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, optIdx)}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-start space-x-3 cursor-pointer ${
                            isOptionSelected
                              ? "bg-blue-50/70 border-blue-500 shadow-sm"
                              : "bg-slate-50/50 hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border ${
                              isOptionSelected
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-slate-500 border-slate-300"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span
                            className={`text-sm leading-relaxed ${
                              isOptionSelected
                                ? "font-bold text-blue-950"
                                : "font-normal text-slate-700"
                            }`}
                          >
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                      className="btn-press px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:pointer-events-none transition"
                    >
                      ← Previous Question
                    </button>

                    <div className="flex items-center space-x-2">
                      {currentQuestionIdx < activeQuizTrack.questions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentQuestionIdx((prev) =>
                              Math.min(activeQuizTrack.questions.length - 1, prev + 1)
                            )
                          }
                          className="btn-press px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition flex items-center gap-1.5"
                        >
                          Next Question
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          disabled={
                            Object.keys(selectedAnswers).length < activeQuizTrack.questions.length
                          }
                          className="btn-press px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit & View Diagnostics
                          <Trophy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* =========================================================================
            STATE 3: TRACK BROWSER & SKILL REQUIREMENTS DIRECTORY
           ========================================================================= */}
        {!activeQuizTrack && !evaluation && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-800">
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
                  <Rocket className="w-3.5 h-3.5 text-blue-400" />
                  <span>Engineering Hackathon Readiness Hub</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Master Track Tech Stacks & Test Your Hackathon Readiness
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Evaluate your technical competencies across popular hackathon domains.
                  Discover essential tools, review 48-hour prototype roadmaps, and take real-world scenario
                  quizzes to instantly diagnose your strong points and skill gaps.
                </p>

                {/* Quick Track Summary Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <p className="text-[11px] text-slate-300 font-medium">Target Domains</p>
                    <p className="text-lg font-black text-white">6 Core Tracks</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <p className="text-[11px] text-slate-300 font-medium">Scenario Checks</p>
                    <p className="text-lg font-black text-white">48 Questions</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <p className="text-[11px] text-slate-300 font-medium">Diagnostic</p>
                    <p className="text-lg font-black text-white">Instant Gaps</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <p className="text-[11px] text-slate-300 font-medium">Preparation</p>
                    <p className="text-lg font-black text-white">48h Roadmaps</p>
                  </div>
                </div>
              </div>

              {/* Decorative Background Circles */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tracks, tools or languages (e.g. React, Python, Docker, Solidity)..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                <span>Showing {filteredTracks.length} Tech Tracks</span>
              </div>
            </div>

            {/* Track Cards Grid */}
            <div className="space-y-6">
              {filteredTracks.map((track) => {
                const isExpanded = expandedTrackId === track.id;
                const pastScore = pastScores[track.id];

                return (
                  <div
                    key={track.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                  >
                    {/* Track Header Card */}
                    <div className="p-6 sm:p-7 flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start space-x-4 max-w-3xl">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${track.gradient} flex items-center justify-center text-white shadow-md flex-shrink-0`}
                        >
                          {renderTrackIcon(track.iconName, "w-7 h-7")}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${track.badgeColor}`}
                            >
                              {track.tag}
                            </span>
                            {pastScore !== undefined && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  pastScore >= 75
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                Last Score: {pastScore}%
                              </span>
                            )}
                          </div>

                          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                            {track.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium">
                            {track.subtitle}
                          </p>
                          <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                            {track.description}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0">
                        <button
                          onClick={() => handleStartQuiz(track)}
                          className="btn-press px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                          <Trophy className="w-4 h-4 text-amber-300" />
                          <span>Start Skill Assessment</span>
                        </button>

                        <button
                          onClick={() => setExpandedTrackId(isExpanded ? null : track.id)}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 py-1 px-2"
                        >
                          <span>{isExpanded ? "Hide Requirements" : "View Core Stack & Roadmap"}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Deep-Dive Details */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/60 p-6 sm:p-7 space-y-6">
                        {/* 1. Skill Requirements Matrix */}
                        <div>
                          <div className="flex items-center space-x-2 mb-3">
                            <Layers className="w-4 h-4 text-blue-600" />
                            <h3 className="text-sm font-bold text-slate-900">
                              Core Skill & Tool Requirements for {track.title}
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {track.skillRequirements.map((group, gIdx) => (
                              <div
                                key={gIdx}
                                className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
                              >
                                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                  {group.category}
                                </h4>
                                <div className="space-y-2">
                                  {group.skills.map((skill, sIdx) => (
                                    <div key={sIdx} className="text-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-800">
                                          {skill.name}
                                        </span>
                                        <span
                                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                            skill.importance === "Essential"
                                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                                              : skill.importance === "Recommended"
                                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                                              : "bg-slate-100 text-slate-600"
                                          }`}
                                        >
                                          {skill.importance}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 mt-0.5">
                                        {skill.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2. Typical Problem Statements */}
                        <div>
                          <div className="flex items-center space-x-2 mb-3">
                            <Target className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-sm font-bold text-slate-900">
                              Common Hackathon Challenge Prompts In This Track
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {track.typicalProblemStatements.map((statement, idx) => (
                              <div
                                key={idx}
                                className="flex items-center space-x-2.5 p-3 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700"
                              >
                                <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                                <span>{statement}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3. Fast-Track 48-Hour Roadmap */}
                        <div>
                          <div className="flex items-center space-x-2 mb-3">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-sm font-bold text-slate-900">
                              Standard 48-Hour Hackathon Execution Sprint
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {track.fastTrackRoadmap.map((phase, pIdx) => (
                              <div
                                key={pIdx}
                                className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1"
                              >
                                <span className="font-bold text-emerald-700 text-[10px] uppercase tracking-wider block">
                                  {phase.hours}
                                </span>
                                <h5 className="font-bold text-slate-900">{phase.action}</h5>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                  {phase.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card Footer CTA */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs text-slate-500">
                            Ready to test your knowledge against real-world scenario questions?
                          </p>
                          <button
                            onClick={() => handleStartQuiz(track)}
                            className="btn-press px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                          >
                            Take 8-Question Skill Check
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
