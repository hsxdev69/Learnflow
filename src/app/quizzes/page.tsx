"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import LearnerNav from "@/components/layout/LearnerNav";
import { SessionUser } from "@/types";
import {
  HelpCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  RotateCcw,
  AlertTriangle,
  Trophy,
} from "lucide-react";

import {
  getCachedUser,
  setCachedUser,
  getCachedQuizzes,
  setCachedQuizzes,
  fetchUserWithCache,
  fetchQuizzesWithCache,
} from "@/lib/clientCache";

interface QuizItem {
  id: string;
  title: string;
  description: string;
  topic: string;
  passPercentage: number;
  questionCount: number;
  materialTitle?: string;
  bestAttempt?: {
    percentage: number;
    completedAt: string;
  } | null;
}

export default function QuizzesListPage() {
  const cachedUser = getCachedUser();
  const cachedQuizzes = getCachedQuizzes();

  const [user, setUser] = useState<SessionUser | null>(cachedUser);
  const [quizzes, setQuizzes] = useState<QuizItem[]>(cachedQuizzes || []);
  const [loading, setLoading] = useState<boolean>(!cachedQuizzes);
  const [error, setError] = useState<string | null>(null);

  const loadQuizzes = async () => {
    if (!quizzes.length && !cachedQuizzes) {
      setLoading(true);
    }
    setError(null);
    try {
      const [userData, quizzesData] = await Promise.all([
        fetchUserWithCache(),
        fetchQuizzesWithCache(),
      ]);

      if (userData) setUser(userData);
      if (quizzesData) setQuizzes(quizzesData);
    } catch (err: any) {
      console.error("Failed to load quizzes", err);
      if (quizzes.length === 0) {
        setError(err?.message || "Failed to connect to quiz server.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-10">
      {user && <Header user={user} />}
      <LearnerNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 w-full flex-1">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Material-Based Evaluations</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Competency Practice Quizzes
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Attempt targeted quizzes to continuously evaluate and elevate your competency scores
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {quizzes.length} Published Quizzes
          </div>
        </div>

        {/* Hackathon & Tech Skill Readiness Hub Promotion Banner */}
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 flex-shrink-0 border border-white/10">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                  New Section
                </span>
                <span className="text-xs text-slate-300 font-medium">Domain Skill Readiness</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Hackathon & Tech Skill Readiness Hub
              </h2>
              <p className="text-xs text-slate-300">
                Analyze core skill requirements across AI/ML, Full-Stack, Mobile & DevOps, and take scenario-based readiness tests.
              </p>
            </div>
          </div>

          <Link
            href="/hackathon-readiness"
            className="btn-press px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 shadow-xs"
          >
            <span>Explore Hackathon Tracks</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          </Link>
        </div>

        {error ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto shadow-sm">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">
              Unable to Load Quizzes
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {error}
            </p>
            <button
              onClick={() => loadQuizzes()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Loading quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">
              No quizzes published yet
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Admin will generate and publish quizzes from official statistical materials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {quiz.topic}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Pass: {quiz.passPercentage}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {quiz.description}
                  </p>

                  {quiz.materialTitle && (
                    <div className="mt-3 text-[11px] text-slate-500 flex items-center">
                      <BookOpen className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" />
                      <span className="truncate">Based on: {quiz.materialTitle}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{quiz.questionCount} Questions</span>
                    {quiz.bestAttempt ? (
                      <span className="text-emerald-700 font-bold flex items-center">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Best: {quiz.bestAttempt.percentage}%
                      </span>
                    ) : (
                      <span className="text-slate-400">Not Attempted</span>
                    )}
                  </div>

                  <Link
                    href={`/quizzes/${quiz.id}`}
                    className="w-full flex items-center justify-center py-2.5 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    {quiz.bestAttempt ? "Retake Quiz" : "Start Quiz"}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
