"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import LearnerNav from "@/components/layout/LearnerNav";
import { SessionUser } from "@/types";
import {
  Sparkles,
  Send,
  BookOpen,
  HelpCircle,
  Code,
  User as UserIcon,
  Bot,
  Lightbulb,
} from "lucide-react";

import {
  getCachedUser,
  setCachedUser,
  getCachedAssistantMessages,
  setCachedAssistantMessages,
  fetchUserWithCache,
} from "@/lib/clientCache";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  source?: string;
  timestamp: string;
}

export default function AssistantPage() {
  const cachedUser = getCachedUser();
  const cachedMsgs = getCachedAssistantMessages();

  const [user, setUser] = useState<SessionUser | null>(cachedUser);
  const [messages, setMessages] = useState<ChatMessage[]>(
    cachedMsgs || [
      {
        id: "welcome",
        sender: "assistant",
        text: "Hello! I am **LearnFlow AI**, your personal engineering mentor and tutor.\n\nI can help you understand Data Structures & Algorithms, debug code in C++/Python/Java, explain complex concepts with intuitive diagrams, analyze Big-O time complexity, and guide your roadmap progress.\n\nWhat engineering doubt can I help you with right now?",
        source: "LearnFlow AI Engineering Intelligence Engine (Gemini)",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const u = await fetchUserWithCache();
      if (u) setUser(u);
    }
    loadUser();
  }, []);

  // Persist messages across tab navigation
  useEffect(() => {
    if (messages.length > 0) {
      setCachedAssistantMessages(messages);
    }
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSend }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: data.answer || "I was unable to generate a response. Please check your query or network.",
        source: data.source,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error", err);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "How does Floyd's Tortoise & Hare algorithm detect cycles in a Linked List?",
    "What is the difference between Array and Linked List in memory layout?",
    "How do I reverse a Singly Linked List iteratively with 3 pointers?",
    "Explain the Time & Space Complexity of QuickSort vs MergeSort.",
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-10">
      {user && <Header user={user} />}
      <LearnerNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-12 w-full flex-1 flex flex-col">
        {/* Header Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900">
                  AI Engineering Tutor & Doubt Solver
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Live Gemini
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ask any DSA, coding, or algorithmic concept doubt for instant step-by-step guidance
              </p>
            </div>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Popular engineering queries:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-xs text-left px-3 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-xl text-slate-700 transition shadow-xs disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History Box */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm overflow-y-auto space-y-4 min-h-[380px] max-h-[550px]">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? "bg-blue-600 text-white"
                      : "bg-gradient-to-tr from-blue-700 to-indigo-700 text-white shadow-xs"
                  }`}
                >
                  {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-none font-medium"
                        : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none font-sans"
                    }`}
                  >
                    {msg.text}
                  </div>

                  <div
                    className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 font-medium truncate max-w-[200px]">
                          {msg.source}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-slate-600 font-medium">
                  LearnFlow AI is formulating explanation with code...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Ask anything about Data Structures, Algorithms, C++, Python, or Big-O..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs disabled:opacity-50"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition shadow-md shadow-blue-500/20 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>
    </div>
  );
}
