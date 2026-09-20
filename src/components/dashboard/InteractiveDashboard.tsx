"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SessionUser, RoadmapTopicItem } from "@/types";
import {
  TrendingUp,
  BookOpen,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lock,
  Award,
  Flame,
  Check,
  Star,
  Layers,
  FileDown,
  FileText,
  Trophy,
  ArrowRight,
} from "lucide-react";
import LearningPathSelector, { LearningPathOption } from "./LearningPathSelector";
import TopicPdfDownloadCard from "@/components/notes/TopicPdfDownloadCard";
import { downloadTopicNotesPdf } from "@/lib/pdf/generateNotesPdf";
import { courseSlugToGoalName } from "@/lib/courses";
import { setCachedUser, setCachedRoadmap } from "@/lib/clientCache";

interface RoadmapData {
  course: any;
  roadmap: RoadmapTopicItem[];
  progressSummary: {
    total: number;
    completed: number;
    inProgress: number;
    percentage: number;
  };
}

interface InteractiveDashboardProps {
  user: SessionUser;
  initialActiveSlug: string;
  availablePaths: LearningPathOption[];
  initialRoadmaps: Record<string, RoadmapData>;
  recentAttempts: any[];
  userSkills: { name: string; level: string }[];
  greeting: string;
  avgQuizScore: number;
}

export default function InteractiveDashboard({
  user,
  initialActiveSlug,
  availablePaths,
  initialRoadmaps,
  recentAttempts,
  userSkills,
  greeting,
  avgQuizScore,
}: InteractiveDashboardProps) {
  const [activeSlug, setActiveSlug] = useState(initialActiveSlug);
  const [roadmaps, setRoadmaps] = useState<Record<string, RoadmapData>>(initialRoadmaps);

  // Prime clientCache with server-rendered data for 0ms navigation to other tabs
  useEffect(() => {
    if (user) setCachedUser(user);
    if (initialRoadmaps) {
      Object.entries(initialRoadmaps).forEach(([slug, rm]) => {
        setCachedRoadmap(slug, rm);
      });
      if (initialRoadmaps[activeSlug]) {
        setCachedRoadmap("default", initialRoadmaps[activeSlug]);
      }
    }
  }, [user, initialRoadmaps, activeSlug]);

  // Sync if initial active slug changes from server
  useEffect(() => {
    if (initialActiveSlug && initialActiveSlug !== activeSlug && !roadmaps[activeSlug]) {
      setActiveSlug(initialActiveSlug);
    }
  }, [initialActiveSlug]);

  const switchPath = async (slug: string) => {
    if (slug === activeSlug) return;

    // 1. Instant state update (0ms transition)
    setActiveSlug(slug);

    // 2. Update URL query without page reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("path", slug);
      window.history.replaceState({}, "", url.toString());
    }

    // 3. If roadmap for this path isn't in memory, load it cleanly
    if (!roadmaps[slug]) {
      try {
        const res = await fetch(`/api/roadmap?course=${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.course && data.roadmap) {
            setRoadmaps((prev) => ({
              ...prev,
              [slug]: {
                course: data.course,
                roadmap: data.roadmap,
                progressSummary: data.progressSummary,
              },
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load roadmap on switch:", err);
      }
    }
  };

  const currentRoadmapData = roadmaps[activeSlug] || roadmaps[initialActiveSlug] || Object.values(roadmaps)[0];
  const roadmap = currentRoadmapData?.roadmap || [];
  const progressSummary = currentRoadmapData?.progressSummary || { total: 0, completed: 0, percentage: 0 };
  const currentPathName = courseSlugToGoalName(activeSlug);

  // Identify active topic: the first topic that is IN_PROGRESS or AVAILABLE, or the first uncompleted topic
  let activeTopic = roadmap.find((t) => t.status === "IN_PROGRESS");
  if (!activeTopic) {
    activeTopic = roadmap.find((t) => t.status === "AVAILABLE");
  }
  if (!activeTopic && roadmap.length > 0) {
    activeTopic = roadmap[0];
  }

  // Recommendations mapping
  const getRecommendations = (slug: string) => {
    if (slug === "data-analytics") {
      return [
        {
          tag: "Core Foundation",
          icon: "📊",
          title: "Data Analytics Fundamentals",
          desc: "Understand statistical pipelines, metrics derivation, and structured datasets.",
          link: "/learn/pandas",
          cta: "Study Fundamentals",
        },
        {
          tag: "Practical Python",
          icon: "🐍",
          title: "Python for Data Analysis",
          desc: "Vectorized computations, NumPy arrays, and DataFrame filtering techniques.",
          link: "/learn/python-basics",
          cta: "Review Python",
        },
        {
          tag: "Database Querying",
          icon: "🗄️",
          title: "SQL for Data Analytics",
          desc: "Master GROUP BY aggregations, window functions (ROW_NUMBER, RANK), and CTEs.",
          link: "/learn/sql-analytics",
          cta: "Explore SQL",
        },
      ];
    }
    if (slug === "web-development") {
      return [
        {
          tag: "Frontend Architecture",
          icon: "⚛️",
          title: "React Component Lifecycle & Custom Hooks",
          desc: "Deep dive into state synchronization, useEffect dependencies, and performance.",
          link: "/learn/frontend-react",
          cta: "Study React",
        },
        {
          tag: "Backend & REST",
          icon: "🚀",
          title: "Node.js Express REST API Architecture",
          desc: "Middleware design, controller separation, schema validation, and JWT auth.",
          link: "/learn/backend-node",
          cta: "View Backend Notes",
        },
        {
          tag: "Version Control",
          icon: "🐙",
          title: "Git Branching & Merge Strategies",
          desc: "Industry-standard Git workflows, PR reviews, and resolving merge conflicts.",
          link: "/learn/git",
          cta: "Study Git",
        },
      ];
    }
    if (slug === "cloud-devops") {
      return [
        {
          tag: "Cloud Infrastructure",
          icon: "☁️",
          title: "AWS Core Services & Cloud Architecture",
          desc: "Compute, storage, IAM roles, and VPC networking fundamentals.",
          link: "/learn/aws-basics",
          cta: "Explore AWS",
        },
        {
          tag: "Containers",
          icon: "🐳",
          title: "Docker Containerization & Image Optimization",
          desc: "Multi-stage builds, Dockerfiles, and container networking.",
          link: "/learn/docker",
          cta: "Study Docker",
        },
      ];
    }
    if (slug === "python") {
      return [
        {
          tag: "Language Mastery",
          icon: "🐍",
          title: "Python Data Structures & Memory Layout",
          desc: "Lists, tuples, dict hashes, generators, and decorators in depth.",
          link: "/learn/python-basics",
          cta: "Study Python",
        },
      ];
    }
    // Default DSA
    return [
      {
        tag: "Primary Target",
        icon: "🔗",
        title: "Linked List: Master In-Place Reversal & Pointers",
        desc: "Study the 3-pointer iterative reversal algorithm and Floyd's cycle detection.",
        link: "/learn/linked-list",
        cta: "Study Notes",
      },
      {
        tag: "Core Data Structure",
        icon: "⚡",
        title: "Stack & Monotonic Stack Problem Solving",
        desc: "LIFO principles, next greater element algorithms, and parenthesis validation.",
        link: "/learn/stack",
        cta: "Explore Stack",
      },
      {
        tag: "Tree Traversal",
        icon: "🌳",
        title: "Binary Trees & Hierarchical Traversal",
        desc: "Preorder, inorder, postorder, and BFS level-order traversal algorithms.",
        link: "/learn/trees",
        cta: "View Tree Notes",
      },
    ];
  };

  const recommendations = getRecommendations(activeSlug);

  return (
    <div>
      {/* Top Header Card: Greeting & Path Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 animate-fade-in-down">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {greeting}, {user.name} 👋
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {user.branch || "Computer Engineering"} • {user.year || "2nd Year"} • {user.college || "Engineering College"}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            {/* Instant Learning Path Selector */}
            <LearningPathSelector
              currentCourseSlug={activeSlug}
              availablePaths={availablePaths}
              onSelectPath={switchPath}
            />

            {userSkills.slice(0, 3).map((s) => (
              <span key={s.name} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg transition-colors">
                {s.name} ({s.level})
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
          <div className="text-center group">
            <div className="text-3xl font-black text-blue-600 transition-transform group-hover:scale-110">
              {progressSummary.percentage}%
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
              {currentPathName} Progress
            </div>
            <div className="text-[11px] text-slate-400">
              {progressSummary.completed} / {progressSummary.total} Topics
            </div>
          </div>

          <div className="text-center group">
            <div className="text-3xl font-black text-emerald-600 transition-transform group-hover:scale-110">{avgQuizScore}%</div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
              Avg Quiz Score
            </div>
            <div className="text-[11px] text-slate-400">Adaptive Passing: 80%</div>
          </div>
        </div>
      </div>

      {/* HERO SECTION: "Ab mujhe kya karna hai?" */}
      {activeTopic && (
        <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-500/20 mb-8 transition-all animate-fade-in-up relative overflow-hidden">
          {/* Subtle animated background aura glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30 mb-3 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-float" />
                <span>Continue Learning • {currentPathName}</span>
              </div>

              <div className="text-xs text-blue-300 uppercase tracking-wider font-semibold mb-1">
                Current Topic
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                {activeTopic.title}
              </h2>
              <p className="text-sm text-slate-300 mb-5 leading-relaxed">
                {activeTopic.description}
              </p>

              {/* Progress Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                <div
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                    activeTopic.notesCompleted
                      ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200 shadow-sm"
                      : "bg-white/10 border-white/10 text-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                      activeTopic.notesCompleted ? "bg-emerald-500 text-white scale-105" : "border border-slate-400"
                    }`}
                  >
                    {activeTopic.notesCompleted ? "✓" : "1"}
                  </div>
                  <span className="text-xs font-semibold">Topic Notes</span>
                </div>

                <div
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                    activeTopic.videoCompleted
                      ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200 shadow-sm"
                      : "bg-white/10 border-white/10 text-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                      activeTopic.videoCompleted ? "bg-emerald-500 text-white scale-105" : "border border-slate-400"
                    }`}
                  >
                    {activeTopic.videoCompleted ? "✓" : "2"}
                  </div>
                  <span className="text-xs font-semibold">Video Lectures</span>
                </div>

                <div
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                    activeTopic.quizCompleted
                      ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200 shadow-sm"
                      : "bg-white/10 border-white/10 text-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                      activeTopic.quizCompleted ? "bg-emerald-500 text-white scale-105" : "border border-slate-400"
                    }`}
                  >
                    {activeTopic.quizCompleted ? "✓" : "3"}
                  </div>
                  <span className="text-xs font-semibold">Practice Quiz</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[210px]">
              {activeTopic.notesCompleted && activeTopic.videoCompleted && !activeTopic.quizCompleted ? (
                <Link
                  href={`/quizzes/${activeTopic.quizId || activeTopic.slug}`}
                  className="btn-press inline-flex items-center justify-center py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-emerald-500/25 transition-all"
                >
                  <HelpCircle className="w-4 h-4 mr-2 animate-pulse" />
                  Start 30-Q Quiz →
                </Link>
              ) : (
                <Link
                  href={`/learn/${activeTopic.slug}`}
                  className="btn-press inline-flex items-center justify-center py-3 px-6 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Continue Learning →
                </Link>
              )}

              <Link
                href={`/learn/${activeTopic.slug}`}
                className="btn-press inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
              >
                View Topic Notes & Videos
              </Link>

              <button
                onClick={() => {
                  downloadTopicNotesPdf({
                    title: activeTopic.title,
                    courseName: currentPathName,
                    content: activeTopic.description,
                  });
                }}
                className="btn-press inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 transition-all shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5 mr-1.5 text-emerald-300" />
                Download Notes PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YOUR LEARNING ROADMAP */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Your {currentPathName} Roadmap
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sequential engineering learning path adapted to your prior knowledge. Complete quizzes (≥80%) to unlock the next milestone.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1" />
              Completed
            </span>
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1" />
              Current
            </span>
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 mr-1" />
              Locked
            </span>
          </div>
        </div>

        {/* Sequential Roadmap Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {roadmap.map((node, index) => {
            const isCompleted = node.status === "COMPLETED" || node.status === "MASTERED";
            const isMastered = node.status === "MASTERED";
            const isInProgress = node.status === "IN_PROGRESS";
            const isAvailable = node.status === "AVAILABLE";
            const isLocked = node.status === "LOCKED";
            const isExistingSkill = node.isExistingSkill;

            return (
              <div
                key={node.id}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between relative ${
                  isMastered
                    ? "border-purple-300 bg-purple-50/40 hover:border-purple-400 card-hover"
                    : isCompleted
                    ? "border-emerald-300 bg-emerald-50/40 hover:border-emerald-400 card-hover"
                    : isInProgress
                    ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-400/50 shadow-md animate-pulse-glow"
                    : isAvailable
                    ? "border-slate-300 bg-white hover:border-blue-400 card-hover"
                    : "border-slate-200 bg-slate-50/60 opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400">
                      Milestone {index + 1}
                    </span>

                    {/* Status Badges */}
                    {isExistingSkill ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3 mr-0.5" /> Existing Skill
                      </span>
                    ) : isMastered ? (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full shadow-xs">
                        <Star className="w-3 h-3 mr-0.5 fill-purple-700" /> Mastered
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shadow-xs">
                        <Check className="w-3 h-3 mr-0.5" /> Done
                      </span>
                    ) : isInProgress ? (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping mr-1" /> Active
                      </span>
                    ) : isAvailable ? (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-bold uppercase text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3 mr-0.5" /> Locked
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">
                    {node.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                    {node.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 mt-auto flex items-center justify-between gap-1">
                  {isLocked ? (
                    <div className="text-[11px] font-semibold text-slate-400 flex items-center">
                      <Lock className="w-3 h-3 mr-1" /> Complete prerequisite
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/learn/${node.slug}`}
                        className={`group inline-flex items-center text-xs font-bold transition-colors ${
                          isInProgress
                            ? "text-blue-700 hover:text-blue-900"
                            : isCompleted || isMastered
                            ? "text-emerald-700 hover:text-emerald-900"
                            : "text-slate-700 hover:text-blue-700"
                        }`}
                      >
                        <span>{isCompleted || isMastered ? "Review" : "Learn"}</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                      <TopicPdfDownloadCard
                        variant="button"
                        topicTitle={node.title}
                        courseTitle={currentPathName}
                        notesContent={node.description}
                        className="!px-2 !py-0.5 text-[10px] btn-press"
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MY LEARNING PATHS & ADAPTIVE RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* My Learning Paths Progress Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-blue-600 animate-float" />
              My Learning Paths
            </h2>
            <Link href="/profile" className="text-xs font-bold text-blue-600 hover:underline">
              Edit Goals
            </Link>
          </div>

          <div className="space-y-3.5">
            {availablePaths.map((p) => {
              const isActive = p.slug === activeSlug;
              const pSummary = roadmaps[p.slug]?.progressSummary || { percentage: 0, completed: 0, total: 0 };

              return (
                <div
                  key={p.slug}
                  className={`p-3.5 rounded-xl border transition-all card-hover ${
                    isActive
                      ? "border-blue-300 bg-blue-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                      <span>{p.name}</span>
                      {p.isPrimary && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                          Primary
                        </span>
                      )}
                    </div>
                    <span className="font-extrabold text-blue-600">{pSummary.percentage}%</span>
                  </div>

                  {/* Progress Bar with smooth transition */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        pSummary.percentage >= 80 ? "bg-emerald-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${Math.max(pSummary.percentage, 4)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{pSummary.completed} / {pSummary.total} Topics Completed</span>
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => switchPath(p.slug)}
                        className="btn-press font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 cursor-pointer"
                      >
                        Switch Path →
                      </button>
                    ) : (
                      <span className="font-bold text-emerald-600">Active Path</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Next Actions */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-blue-600 animate-float" />
            Recommended For You • {currentPathName}
          </h2>

          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 card-hover transition-all flex items-start justify-between gap-4 bg-slate-50/50"
              >
                <div className="flex items-start space-x-3.5">
                  <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                        {rec.tag}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{rec.desc}</p>
                  </div>
                </div>

                <Link
                  href={rec.link}
                  className="btn-press px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex-shrink-0 shadow-xs"
                >
                  {rec.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HACKATHON & TECH SKILL READINESS PROMO CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start sm:items-center space-x-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                Hackathon Hub
              </span>
              <span className="text-xs text-slate-300">Technical Readiness Checks</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1">
              Preparing for a Tech Hackathon?
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Select your track (AI/ML, Full-Stack, Mobile, DevOps, Cyber, Web3), explore core skill requirements, and take an 8-question scenario check for instant skill gap diagnostics.
            </p>
          </div>
        </div>

        <Link
          href="/hackathon-readiness"
          className="btn-press px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition flex items-center gap-2 flex-shrink-0 shadow-md relative z-10"
        >
          <span>Check Hackathon Readiness</span>
          <ArrowRight className="w-4 h-4 text-blue-600" />
        </Link>

        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* RECENT QUIZ ATTEMPTS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center">
          <Award className="w-4 h-4 mr-2 text-emerald-600 animate-float" />
          Quiz Performance History
        </h2>

        {recentAttempts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentAttempts.map((att) => (
              <div
                key={att.id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 card-hover flex items-center justify-between transition-all"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[170px]">
                    {att.quiz?.title || "Topic Assessment"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {new Date(att.completedAt).toLocaleDateString()} • {att.score}/{att.maxScore} Correct
                  </p>
                </div>
                <div
                  className={`text-sm font-black ${
                    att.percentage >= 90
                      ? "text-purple-600"
                      : att.percentage >= 80
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {att.percentage}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No quizzes attempted yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Complete your notes, watch the embedded lecture, and take your first 30-question quiz!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
