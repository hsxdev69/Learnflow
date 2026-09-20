"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Eye,
  CheckCircle2,
  FileDown,
  Layers,
  Copy,
  Check,
  ChevronRight,
  Maximize2,
  BookOpen,
} from "lucide-react";
import {
  downloadTopicNotesPdf,
  createTopicPdfBlob,
  generateComprehensiveTopicNotes,
} from "@/lib/pdf/generateNotesPdf";

interface EmbeddedPdfViewerProps {
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

export default function EmbeddedPdfViewer({
  topicId,
  topicTitle,
  courseTitle = "Computer Science & Engineering",
  moduleTitle = "Core Engineering Concepts",
  category = "Engineering",
  estimatedTime = "25-30 mins",
  initialContent = "",
  onMarkCompleted,
  isCompleted = false,
}: EmbeddedPdfViewerProps) {
  const [content, setContent] = useState<string>(() =>
    generateComprehensiveTopicNotes(topicTitle, courseTitle, moduleTitle, initialContent)
  );
  const [viewMode, setViewMode] = useState<"embedded" | "sheet">("embedded");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>("");
  const [pageCount, setPageCount] = useState<number>(3);
  const [iframeLoading, setIframeLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate real PDF blob for embedded inline iframe view
  useEffect(() => {
    try {
      const { url, pageCount: count } = createTopicPdfBlob({
        title: topicTitle,
        courseName: courseTitle,
        moduleName: moduleTitle,
        category,
        estimatedTime,
        content,
      });

      setPdfBlobUrl(url);
      setPageCount(count > 0 ? count : 3);
      setIframeLoading(false);

      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.warn("Client PDF blob generation, falling back to API URL:", err);
      setPdfBlobUrl(`/api/topics/${topicId}/pdf`);
      setIframeLoading(false);
    }
  }, [topicId, topicTitle, courseTitle, moduleTitle, category, estimatedTime, content]);

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      downloadTopicNotesPdf({
        title: topicTitle,
        courseName: courseTitle,
        moduleName: moduleTitle,
        category,
        estimatedTime,
        content,
      });
    } catch (err) {
      console.error("PDF download failed:", err);
      // Fallback: trigger API download
      window.open(`/api/topics/${topicId}/pdf`, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenExternal = () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, "_blank");
    } else {
      window.open(`/api/topics/${topicId}/pdf`, "_blank");
    }
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    } else {
      window.print();
    }
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
      }
    } catch (err) {
      console.error("Failed to generate AI deep-dive notes:", err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Render markdown parser for the Sheet view
  const renderFormattedMarkdown = (rawText: string) => {
    const lines = (rawText || content).split("\n");
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
                  {codeLanguage || "C++ Production Implementation"}
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

      if (trimmed.startsWith("# ")) {
        elements.push(
          <div key={`h1-${keyIdx++}`} className="mt-8 mb-4 border-b-2 border-blue-600/30 pb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-7 bg-blue-600 rounded-full inline-block" />
              {trimmed.replace("# ", "").replace(/\*\*/g, "")}
            </h1>
          </div>
        );
      } else if (trimmed.startsWith("## ")) {
        elements.push(
          <div key={`h2-${keyIdx++}`} className="mt-6 mb-3">
            <h2 className="text-lg sm:text-xl font-bold text-blue-900 flex items-center gap-2 bg-blue-50/60 p-2.5 rounded-lg border-l-4 border-blue-600">
              {trimmed.replace("## ", "").replace(/\*\*/g, "")}
            </h2>
          </div>
        );
      } else if (trimmed.startsWith("### ")) {
        elements.push(
          <h3
            key={`h3-${keyIdx++}`}
            className="text-base font-bold text-slate-800 mt-4 mb-2 flex items-center gap-1.5"
          >
            <span className="text-blue-500">▸</span>
            {trimmed.replace("### ", "").replace(/\*\*/g, "")}
          </h3>
        );
      } else if (trimmed.startsWith("> ")) {
        elements.push(
          <div
            key={`quote-${keyIdx++}`}
            className="my-3 p-4 rounded-xl bg-amber-50/80 border-l-4 border-amber-500 text-amber-900 text-sm shadow-xs italic"
          >
            <p className="font-medium">{trimmed.replace("> ", "").replace(/\*\*/g, "")}</p>
          </div>
        );
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
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
      } else if (/^\d+\.\s/.test(trimmed)) {
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
      } else {
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
      {/* TOP HEADER & ACTION CONTROL BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Official Handwritten-Style Notes
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                {pageCount} Full Pages
              </span>
              <span className="text-slate-500 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                {estimatedTime}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1 mt-0.5">
              {topicTitle}
            </h2>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-slate-800/90 p-1 rounded-xl flex items-center text-xs border border-slate-700">
            <button
              onClick={() => setViewMode("embedded")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewMode === "embedded"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inline PDF Preview</span>
            </button>
            <button
              onClick={() => setViewMode("sheet")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewMode === "sheet"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Paper Sheet</span>
            </button>
          </div>

          {/* AI Deep-Dive Regenerator */}
          <button
            onClick={handleGenerateAiDeepDive}
            disabled={isGeneratingAi}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xs transition disabled:opacity-50"
            title="Generate deep-dive theoretical notes with AI"
          >
            {isGeneratingAi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Deep-Dive</span>
              </>
            )}
          </button>

          {/* Fullscreen / New Tab */}
          <button
            onClick={handleOpenExternal}
            className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Open Full PDF in New Tab"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expand</span>
          </button>

          {/* PROMINENT DOWNLOAD NOTES PDF BUTTON */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md transition disabled:opacity-50 flex-shrink-0"
            id="download-notes-pdf-btn"
          >
            <FileDown className="w-4 h-4 text-white" />
            <span>Download Notes PDF</span>
          </button>

          {/* Mark Done Toggle */}
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
              <span>{isCompleted ? "Completed ✓" : "Mark Done"}</span>
            </button>
          )}
        </div>
      </div>

      {/* EMBEDDED INLINE PDF VIEWER (IFRAME) */}
      {viewMode === "embedded" ? (
        <div className="bg-slate-900/90 rounded-2xl p-2 sm:p-4 shadow-xl border border-slate-700">
          <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 bg-slate-800/80 rounded-t-xl border-b border-slate-700 mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span className="font-semibold text-white">
                Embedded PDF Document Viewer ({pageCount} Pages)
              </span>
            </div>

            <div className="flex items-center space-x-3 text-slate-400">
              <span className="text-[11px] hidden sm:inline">
                Scroll to navigate pages • Zoom available via browser controls
              </span>
              <button
                onClick={handlePrint}
                className="hover:text-white transition flex items-center gap-1 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>

          <div className="relative w-full h-[680px] sm:h-[820px] rounded-xl overflow-hidden bg-slate-950">
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-900 z-10">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-sm font-medium">
                  Compiling 2-3+ page comprehensive PDF preview...
                </span>
              </div>
            )}

            {pdfBlobUrl ? (
              <iframe
                ref={iframeRef}
                src={`${pdfBlobUrl}#toolbar=1&navpanes=1&statusbar=1`}
                className="w-full h-full border-0 rounded-xl"
                title={`PDF Preview: ${topicTitle}`}
                onLoad={() => setIframeLoading(false)}
              />
            ) : (
              <iframe
                ref={iframeRef}
                src={`/api/topics/${topicId}/pdf#toolbar=1&navpanes=1`}
                className="w-full h-full border-0 rounded-xl"
                title={`PDF Preview: ${topicTitle}`}
                onLoad={() => setIframeLoading(false)}
              />
            )}
          </div>
        </div>
      ) : (
        /* INTERACTIVE MULTI-PAGE DOCUMENT SHEET VIEW */
        <div
          id="printable-notes-sheet"
          className="max-w-4xl mx-auto bg-[#fffefc] rounded-2xl shadow-xl border border-amber-200/70 p-6 sm:p-12 relative overflow-hidden"
        >
          {/* Left Red Margin Line */}
          <div className="absolute top-0 bottom-0 left-8 sm:left-14 w-0.5 bg-red-400/30 pointer-events-none hidden sm:block" />

          {/* Top Title & Metadata Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:pl-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 mb-2">
                <span>LearnFlow Verified Multi-Page Syllabus Guide</span>
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
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {pageCount} Pages Long-Form
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                REF-{topicId.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Content Body */}
          <div className="prose max-w-none sm:pl-10">
            {renderFormattedMarkdown(content)}
          </div>
        </div>
      )}

      {/* PROMINENT BOTTOM DOWNLOAD CALL-TO-ACTION CARD */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border-2 border-blue-400/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg flex-shrink-0">
            <FileDown className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-1">
              <span>Full Multi-Page PDF</span>
              <span>•</span>
              <span>{pageCount} Pages</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Download Complete Handwritten Notes for {topicTitle}
            </h3>
            <p className="text-xs text-slate-300 max-w-xl mt-0.5 leading-relaxed">
              Formatted A4 PDF document containing asymptotic proofs, memory architectures, production C++/Python code, and high-yield interview revision summaries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 md:flex-none inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl transition-all disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>Download PDF ({pageCount} Pages)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
