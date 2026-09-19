"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  Award,
  Clock,
  Layers,
  FileDown,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { downloadTopicNotesPdf } from "@/lib/pdf/generateNotesPdf";

interface HandwrittenNotesViewerProps {
  topicId: string;
  topicTitle: string;
  courseTitle?: string;
  moduleTitle?: string;
  category?: string;
  estimatedTime?: string;
  initialContent?: string;
  onMarkCompleted?: () => void;
  isCompleted?: boolean;
}

export default function HandwrittenNotesViewer({
  topicId,
  topicTitle,
  courseTitle = "Computer Science & Engineering",
  moduleTitle = "Core Concepts",
  category = "Engineering",
  estimatedTime = "15-20 mins",
  initialContent = "",
  onMarkCompleted,
  isCompleted = false,
}: HandwrittenNotesViewerProps) {
  const [content, setContent] = useState<string>(initialContent);
  const [viewMode, setViewMode] = useState<"sheet" | "clean">("sheet");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [hasAiEnhanced, setHasAiEnhanced] = useState(false);

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      downloadTopicNotesPdf({
        title: topicTitle,
        courseName: courseTitle,
        moduleName: moduleTitle,
        category,
        estimatedTime,
        content: content || initialContent,
      });
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateAiDeepDive = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch(`/api/topics/${topicId}/ai-notes`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.notes) {
        setContent(data.notes);
        setHasAiEnhanced(true);
      }
    } catch (err) {
      console.error("AI Notes generation failed:", err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Render markdown parser for UI
  const renderFormattedMarkdown = (rawText: string) => {
    const textToRender = rawText || initialContent || `# ${topicTitle}\n\nNotes are being updated.`;
    const lines = textToRender.split("\n");
    const elements: React.ReactNode[] = [];

    let inCode = false;
    let codeLines: string[] = [];
    let codeLanguage = "";
    let keyIdx = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith("```")) {
        if (inCode) {
          const codeString = codeLines.join("\n");
          const currIdx = keyIdx++;
          elements.push(
            <div
              key={`code-${currIdx}`}
              className="my-5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 shadow-md overflow-hidden text-xs font-mono"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <span className="font-semibold text-[11px] uppercase tracking-wider text-blue-400">
                  {codeLanguage || "Code Snippet"}
                </span>
                <button
                  onClick={() => handleCopyCode(codeString, currIdx)}
                  className="flex items-center space-x-1 hover:text-white transition"
                >
                  {copiedCodeIdx === currIdx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto leading-relaxed">
                <code>{codeString}</code>
              </pre>
            </div>
          );
          codeLines = [];
          inCode = false;
        } else {
          inCode = true;
          codeLanguage = line.trim().replace("```", "").trim();
          codeLines = [];
        }
        continue;
      }

      if (inCode) {
        codeLines.push(line);
        continue;
      }

      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<div key={`sp-${keyIdx++}`} className="h-3" />);
        continue;
      }

      // H1
      if (trimmed.startsWith("# ")) {
        elements.push(
          <div key={`h1-${keyIdx++}`} className="mt-8 mb-4 border-b-2 border-blue-600/30 pb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-7 bg-blue-600 rounded-full inline-block" />
              {trimmed.replace("# ", "").replace(/\*\*/g, "")}
            </h1>
          </div>
        );
      }
      // H2
      else if (trimmed.startsWith("## ")) {
        elements.push(
          <div key={`h2-${keyIdx++}`} className="mt-6 mb-3">
            <h2 className="text-lg sm:text-xl font-bold text-blue-900 flex items-center gap-2 bg-blue-50/60 p-2.5 rounded-lg border-l-4 border-blue-600">
              {trimmed.replace("## ", "").replace(/\*\*/g, "")}
            </h2>
          </div>
        );
      }
      // H3
      else if (trimmed.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${keyIdx++}`}
            className="text-base font-bold text-slate-800 mt-4 mb-2 flex items-center gap-1.5"
          >
            <span className="text-blue-500">▸</span>
            {trimmed.replace("### ", "").replace(/\*\*/g, "")}
          </h3>
        );
      }
      // Blockquote / Callout
      else if (trimmed.startsWith("> ")) {
        elements.push(
          <div
            key={`quote-${keyIdx++}`}
            className="my-3 p-4 rounded-xl bg-amber-50/80 border-l-4 border-amber-500 text-amber-900 text-sm shadow-xs italic"
          >
            <p className="font-medium">{trimmed.replace("> ", "").replace(/\*\*/g, "")}</p>
          </div>
        );
      }
      // Bullets
      else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const bulletText = trimmed.replace(/^[-*]\s+/, "");
        elements.push(
          <li
            key={`li-${keyIdx++}`}
            className="flex items-start gap-2.5 text-sm text-slate-800 my-1.5 leading-relaxed"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
            <span>
              {bulletText.split("**").map((part, pIdx) =>
                pIdx % 2 === 1 ? (
                  <strong key={pIdx} className="font-bold text-slate-900">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </span>
          </li>
        );
      }
      // Numbered List
      else if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s+(.*)/);
        const num = match ? match[1] : "1";
        const rest = match ? match[2] : trimmed;
        elements.push(
          <div
            key={`num-${keyIdx++}`}
            className="flex items-start gap-3 text-sm text-slate-800 my-2 leading-relaxed"
          >
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              {num}
            </span>
            <span>
              {rest.split("**").map((part, pIdx) =>
                pIdx % 2 === 1 ? (
                  <strong key={pIdx} className="font-bold text-slate-900">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </span>
          </div>
        );
      }
      // Paragraph
      else {
        elements.push(
          <p key={`p-${keyIdx++}`} className="text-sm text-slate-700 my-2.5 leading-relaxed">
            {trimmed.split("**").map((part, pIdx) =>
              pIdx % 2 === 1 ? (
                <strong key={pIdx} className="font-bold text-slate-900">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }
    }

    return elements;
  };

  return (
    <div className="space-y-6">
      {/* ACTION BAR & CONTROLS */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                PDF Study Document
              </span>
              {hasAiEnhanced && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Deep-Dive
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
              {topicTitle}
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setViewMode("sheet")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === "sheet"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📄 A4 Page View
            </button>
            <button
              onClick={() => setViewMode("clean")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                viewMode === "clean"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📖 Clean View
            </button>
          </div>

          {/* AI Deep-Dive Notes Button */}
          <button
            onClick={handleGenerateAiDeepDive}
            disabled={isGeneratingAi}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xs transition disabled:opacity-50"
            title="Generate comprehensive deep-dive notes with AI derivations and code examples"
          >
            {isGeneratingAi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Deep-Dive</span>
              </>
            )}
          </button>

          {/* Print / Save PDF Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Print or Save via Browser PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* DOWNLOAD NOTES PDF PRIMARY BUTTON */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition disabled:opacity-50"
            id="download-notes-pdf-btn"
          >
            <FileDown className="w-4 h-4 text-white" />
            <span>Download Notes PDF</span>
          </button>

          {/* Complete Toggle */}
          {onMarkCompleted && (
            <button
              onClick={onMarkCompleted}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                isCompleted
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isCompleted ? "Completed ✓" : "Mark as Done"}</span>
            </button>
          )}
        </div>
      </div>

      {/* DOCUMENT PAGE / A4 HANDWRITTEN-STYLE SHEET */}
      <div
        id="printable-notes-sheet"
        className={`mx-auto transition-all ${
          viewMode === "sheet"
            ? "max-w-4xl bg-[#fffefc] rounded-2xl shadow-xl border border-amber-200/70 p-6 sm:p-12 relative overflow-hidden"
            : "max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8"
        }`}
      >
        {/* Notebook Margins & Ruled Lines (Sheet View Only) */}
        {viewMode === "sheet" && (
          <>
            {/* Left red margin line like classic engineering notes */}
            <div className="absolute top-0 bottom-0 left-8 sm:left-14 w-0.5 bg-red-400/30 pointer-events-none hidden sm:block" />

            {/* Subtle top header band */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 mb-2">
                  <Award className="w-3 h-3 text-blue-600" />
                  <span>LearnFlow Verified Engineering Notes</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {topicTitle}
                </h1>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>Course: <strong className="text-slate-700">{courseTitle}</strong></span>
                  <span>•</span>
                  <span>Module: <strong className="text-slate-700">{moduleTitle}</strong></span>
                </p>
              </div>

              <div className="flex sm:flex-col sm:items-end gap-2 text-right">
                <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{estimatedTime}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  REF-{topicId.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          </>
        )}

        {/* Notes Content Body */}
        <div className={`prose max-w-none ${viewMode === "sheet" ? "sm:pl-10" : ""}`}>
          {renderFormattedMarkdown(content)}
        </div>

        {/* Page Footer / Certification Seal (Sheet View Only) */}
        {viewMode === "sheet" && (
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 sm:pl-10">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-600">
                Verified Curriculum by LearnFlow Academic Engine
              </span>
            </div>
            <div className="flex items-center space-x-4 font-mono text-[11px]">
              <span>Page 1 of 1</span>
              <span>•</span>
              <button
                onClick={handleDownloadPdf}
                className="text-blue-600 hover:text-blue-800 font-bold underline inline-flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DEDICATED HANDWRITTEN NOTES PDF DOWNLOAD CARD */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <FileDown className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600/10 text-blue-700 text-xs font-bold mb-1">
              <span>Handwritten Notes PDF</span>
              <span>•</span>
              <span>Official Format</span>
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Download Complete Notes for {topicTitle}
            </h4>
            <p className="text-xs text-slate-600 max-w-xl mt-0.5 leading-relaxed">
              Formatted A4 PDF document containing algorithmic derivations, code templates, edge cases, and high-yield revision summaries. Ready for offline revision.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Download Notes PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
