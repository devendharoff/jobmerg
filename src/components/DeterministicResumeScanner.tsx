import React, { useState, useEffect } from "react";
import {
  Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, Info,
  Code, Eye, RefreshCw, ShieldCheck, Layers, Copy, Check, Hash, Bug, RotateCcw
} from "lucide-react";
import { CanonicalResume } from "../../services/deterministicExtractor/types";

interface DeterministicResumeScannerProps {
  onExtractionComplete?: (resume: CanonicalResume) => void;
  userProfileName?: string;
}

export default function DeterministicResumeScanner({
  onExtractionComplete,
  userProfileName
}: DeterministicResumeScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>("Queued");
  const [jobStatus, setJobStatus] = useState<string>("idle");
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [extractedResume, setExtractedResume] = useState<CanonicalResume | null>(null);

  // Debug Panel toggle (Step 14)
  const [showDebug, setShowDebug] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("debug") === "true";
    }
    return false;
  });

  // UI Tabs: 'structured' | 'raw' | 'source' | 'json'
  const [activeTab, setActiveTab] = useState<"structured" | "raw" | "source" | "json">("structured");
  const [copiedJson, setCopiedJson] = useState(false);

  // Step 5: Polling status endpoint every 600ms
  useEffect(() => {
    if (!resumeId || jobStatus === "completed" || jobStatus === "failed") {
      return;
    }

    let isSubscribed = true;
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/resumes/${resumeId}/status`);
        if (!res.ok) return;

        const data = await res.json();
        if (!isSubscribed) return;

        setJobStatus(data.status);
        setProgress(data.progress || 0);
        if (data.step) setCurrentStep(data.step);
        if (data.durationMs) setDurationMs(data.durationMs);

        // Step 7: Progressive raw text display as soon as available
        if (data.rawText && !rawText) {
          setRawText(data.rawText);
        }

        if (data.status === "completed" && data.canonical) {
          setExtractedResume(data.canonical);
          setIsParsing(false);
          clearInterval(pollInterval);
          if (onExtractionComplete) {
            onExtractionComplete(data.canonical);
          }
        } else if (data.status === "failed") {
          setIsParsing(false);
          setErrorMsg(data.error || "Resume extraction failed.");
          clearInterval(pollInterval);
        }
      } catch (err: any) {
        console.warn("[ResumePolling] Error checking extraction status:", err);
      }
    }, 600);

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [resumeId, jobStatus, rawText, onExtractionComplete]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Step 2: Non-blocking fast upload request
  const processFile = async (selectedFile: File) => {
    setErrorMsg(null);
    setExtractedResume(null);
    setRawText(null);
    setResumeId(null);
    setJobStatus("queued");

    // Step 11: Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg(`This resume is too large to process. Maximum supported size: 10 MB. Received: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB.`);
      return;
    }

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      setErrorMsg("Unsupported format. Please upload a PDF (.pdf) or Word document (.docx).");
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setProgress(5);
    setCurrentStep("Uploading resume document...");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(",")[1];

        const response = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeFile: base64String,
            fileName: selectedFile.name
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || errData.error || "Failed to upload resume.");
        }

        const resData = await response.json();
        setResumeId(resData.resumeId);
        setJobStatus(resData.status || "queued");
        setProgress(10);
        setCurrentStep("File uploaded ✓ Extraction job queued...");
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setIsParsing(false);
      setErrorMsg(err.message || "An unexpected error occurred during upload.");
    }
  };

  const handleCopyJson = () => {
    if (extractedResume) {
      navigator.clipboard.writeText(JSON.stringify(extractedResume, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-400/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              100% Fact-Based Deterministic Engine • Zero Generative AI / No LLM
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">
              JobMerge Fact-Based Resume Extractor
            </h1>
            <p className="text-sm text-indigo-200 mt-1 max-w-2xl font-medium">
              Extracts exact verbatim facts without AI hallucination. Original document is preserved as source of truth.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                showDebug
                  ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              {showDebug ? "Hide Diagnostics" : "Debug Panel"}
            </button>
            <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              v1.0.0
            </span>
          </div>
        </div>
      </div>

      {/* Step 14: Developer Diagnostics Panel */}
      {showDebug && (
        <div className="bg-slate-950 text-emerald-400 rounded-3xl p-6 border border-slate-800 font-mono text-xs space-y-3 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-slate-300 font-bold">
            <span>DEVELOPER EXTRACTION DIAGNOSTICS</span>
            <span className="text-amber-400 font-extrabold">STATUS: {jobStatus.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
            <div>
              <span className="text-slate-500 block text-[10px]">RESUME ID</span>
              <span className="font-bold text-slate-200">{resumeId || "N/A"}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">FILE NAME / TYPE</span>
              <span className="font-bold text-slate-200">{file?.name || "None"} ({file ? (file.size / 1024).toFixed(1) + " KB" : "0 KB"})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">PROGRESS</span>
              <span className="font-bold text-emerald-300">{progress}% ({currentStep})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DURATION</span>
              <span className="font-bold text-amber-300">{durationMs ? `${durationMs} ms` : "In Progress..."}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">RAW TEXT LENGTH</span>
              <span className="font-bold text-slate-200">{rawText ? `${rawText.length} chars` : "0 chars"}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">PAGES EXTRACTED</span>
              <span className="font-bold text-slate-200">{extractedResume?.metadata?.page_count || 0}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">STRUCTURED ENTRIES</span>
              <span className="font-bold text-slate-200">
                Skills: {extractedResume?.skills?.length || 0} | Exp: {extractedResume?.experience?.length || 0} | Edu: {extractedResume?.education?.length || 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ERROR STATE</span>
              <span className="font-bold text-red-400">{errorMsg || "None"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Upload Box */}
      {!extractedResume && (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8 md:p-12 text-center shadow-sm hover:border-[#4f46e5]/40 transition-all">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center space-y-4 cursor-pointer"
          >
            <div className="w-16 h-16 bg-indigo-50 text-[#4f46e5] rounded-3xl flex items-center justify-center shadow-inner">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 font-display">
                Upload your Resume for Fact-Based Extraction
              </h3>
              <p className="text-xs font-semibold text-gray-400 mt-1">
                Drag and drop your PDF or DOCX file here, or click to browse
              </p>
            </div>

            <label className="cursor-pointer px-6 py-2.5 bg-[#4f46e5] hover:bg-[#3f37c9] text-white font-bold text-xs rounded-2xl shadow-md transition-all">
              Browse Document
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <div className="flex items-center gap-4 text-[11px] font-extrabold text-gray-400 pt-2">
              <span>PDF (.pdf)</span>
              <span>•</span>
              <span>Word (.docx)</span>
              <span>•</span>
              <span>Max 10MB</span>
            </div>
          </div>

          {/* Step 6: Live Stepper & Observable Progress */}
          {isParsing && (
            <div className="mt-8 p-6 bg-indigo-50/70 rounded-3xl border border-indigo-100 max-w-lg mx-auto space-y-5">
              <div className="flex justify-between items-center text-xs font-extrabold text-gray-800">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#4f46e5] animate-spin shrink-0" />
                  {currentStep}
                </span>
                <span className="text-[#4f46e5] font-black text-sm">{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-indigo-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#4f46e5] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              {/* Stepper Checklist */}
              <div className="space-y-2 pt-2 text-left">
                <div className={`flex items-center gap-2 text-xs font-bold ${progress >= 10 ? 'text-emerald-700' : 'text-gray-400'}`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>File validated & uploaded ✓</span>
                </div>
                <div className={`flex items-center gap-2 text-xs font-bold ${progress >= 35 ? 'text-emerald-700' : progress >= 10 ? 'text-indigo-600 animate-pulse' : 'text-gray-400'}`}>
                  {progress >= 35 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <span className="w-4 text-center">→</span>}
                  <span>Raw text extraction</span>
                </div>
                <div className={`flex items-center gap-2 text-xs font-bold ${progress >= 50 ? 'text-emerald-700' : progress >= 35 ? 'text-indigo-600 animate-pulse' : 'text-gray-400'}`}>
                  {progress >= 50 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <span className="w-4 text-center">→</span>}
                  <span>Detecting sections</span>
                </div>
                <div className={`flex items-center gap-2 text-xs font-bold ${progress >= 75 ? 'text-emerald-700' : progress >= 50 ? 'text-indigo-600 animate-pulse' : 'text-gray-400'}`}>
                  {progress >= 75 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <span className="w-4 text-center">→</span>}
                  <span>Extracting experience & education</span>
                </div>
                <div className={`flex items-center gap-2 text-xs font-bold ${progress >= 90 ? 'text-emerald-700' : progress >= 75 ? 'text-indigo-600 animate-pulse' : 'text-gray-400'}`}>
                  {progress >= 90 ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <span className="w-4 text-center">→</span>}
                  <span>Validating facts & dates</span>
                </div>
              </div>

              {/* Step 7: Progressive Raw Text Stream Box */}
              {rawText && (
                <div className="mt-4 p-4 bg-white rounded-2xl border border-indigo-200 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Raw Text Stream Extracted ({rawText.length} Chars)
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono text-gray-700 max-h-24 overflow-y-auto whitespace-pre-wrap bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {rawText.slice(0, 350)}...
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Step 13: Error Banner with Retry Button */}
          {errorMsg && (
            <div className="mt-6 p-5 bg-red-50 border border-red-200 text-red-900 rounded-3xl max-w-lg mx-auto text-left space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-extrabold">We couldn't extract this resume</h4>
                  <p className="text-xs font-semibold text-red-700 mt-1">{errorMsg}</p>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    setErrorMsg(null);
                    setIsParsing(false);
                    if (file) processFile(file);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retry Extraction
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Extraction Results View */}
      {extractedResume && (
        <div className="space-y-6">
          
          {/* Metadata & Status Checklist Bar */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#4f46e5]" />
                <h2 className="text-lg font-extrabold text-gray-900 font-display">
                  {extractedResume.metadata.file_name}
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase rounded-lg">
                  {extractedResume.metadata.file_type} Verified
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-400">
                <span className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  Hash: {extractedResume.metadata.file_hash.slice(0, 12)}...
                </span>
                <span>•</span>
                <span>Pages: {extractedResume.metadata.page_count}</span>
                <span>•</span>
                <span>Extracted in {durationMs ? `${durationMs}ms` : '< 500ms'}</span>
              </div>
            </div>

            {/* Checklist items */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                File Validated
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Sections Detected
              </span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Fact Validated
              </span>
              <button
                onClick={() => {
                  setExtractedResume(null);
                  setFile(null);
                  setRawText(null);
                  setResumeId(null);
                }}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer ml-2"
              >
                Upload New
              </button>
            </div>
          </div>

          {/* Validation Warnings Banner */}
          {extractedResume.validation.items.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 space-y-2">
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Extraction Audit Warnings ({extractedResume.validation.items.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {extractedResume.validation.items.map((item, idx) => (
                  <div key={idx} className="text-xs font-semibold text-amber-800 bg-white/80 p-2.5 rounded-xl border border-amber-100 flex items-start gap-2">
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded shrink-0 uppercase">
                      {item.level}
                    </span>
                    <span>{item.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between border-b border-gray-200 pb-3 gap-3">
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              <button
                onClick={() => setActiveTab("structured")}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "structured"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Layers className="w-4 h-4 text-[#4f46e5]" />
                Structured Facts
              </button>
              <button
                onClick={() => setActiveTab("raw")}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "raw"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                Raw Text Stream
              </button>
              <button
                onClick={() => setActiveTab("source")}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "source"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Eye className="w-4 h-4 text-amber-600" />
                Source Inspector
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "json"
                    ? "bg-white text-gray-900 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Code className="w-4 h-4 text-indigo-600" />
                Zod Schema JSON
              </button>
            </div>

            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              <span>{copiedJson ? "Copied JSON!" : "Copy Canonical JSON"}</span>
            </button>
          </div>

          {/* TAB 1: STRUCTURED FACTS VIEW */}
          {activeTab === "structured" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Personal Contact Details Card */}
              <div className="lg:col-span-4 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Candidate Contact Info</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Full Name</label>
                    <div className="flex items-center justify-between text-sm font-extrabold text-gray-900">
                      <span>{extractedResume.personal.name.value || "Not Found"}</span>
                      {extractedResume.personal.name.source && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                          Page {extractedResume.personal.name.source.page}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Email Address</label>
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-900">
                      <span>{extractedResume.personal.email.value || "Not Found"}</span>
                      {extractedResume.personal.email.value && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">Verified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Phone (Raw / Normalized)</label>
                    <div className="text-xs font-mono font-bold text-gray-900">
                      <div>Raw: {extractedResume.personal.phone.raw || "Not Found"}</div>
                      <div className="text-emerald-600">Norm: {extractedResume.personal.phone.normalized || "N/A"}</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Location</label>
                    <div className="text-xs font-bold text-gray-800">
                      {extractedResume.personal.location.value || "Not Specified"}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Professional Links</label>
                    <div className="space-y-1 text-xs font-mono font-semibold text-indigo-600 truncate">
                      {extractedResume.personal.linkedin.value && <div>LinkedIn: {extractedResume.personal.linkedin.value}</div>}
                      {extractedResume.personal.github.value && <div>GitHub: {extractedResume.personal.github.value}</div>}
                      {extractedResume.personal.portfolio.value && <div>Portfolio: {extractedResume.personal.portfolio.value}</div>}
                      {!extractedResume.personal.linkedin.value && !extractedResume.personal.github.value && (
                        <div className="text-gray-400 italic">No links extracted</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills & Experience & Education Grid */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Skills Card */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                      Extracted Skills ({extractedResume.skills.length})
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                      100% Fact-Extracted (No Artificial Additions)
                    </span>
                  </div>

                  {extractedResume.skills.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No explicit skills section found in document.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {extractedResume.skills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5"
                        >
                          {sk.raw_value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience Entries */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                      Work Experience Entries ({extractedResume.experience.length})
                    </h3>
                  </div>

                  {extractedResume.experience.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No work experience entries extracted.</p>
                  ) : (
                    <div className="space-y-4">
                      {extractedResume.experience.map((exp, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                          <div className="flex flex-wrap justify-between items-start">
                            <div>
                              <h4 className="text-sm font-extrabold text-gray-900">{exp.title.raw}</h4>
                              <p className="text-xs font-bold text-indigo-600">{exp.company.raw}</p>
                            </div>
                            <span className="text-xs font-mono font-extrabold bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-gray-700">
                              {exp.date.raw || "Dates Not Specified"}
                            </span>
                          </div>

                          {exp.description.length > 0 && (
                            <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 font-medium pt-2">
                              {exp.description.map((b, bIdx) => (
                                <li key={bIdx} className="leading-relaxed">{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education Entries */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                      Education ({extractedResume.education.length})
                    </h3>
                  </div>

                  {extractedResume.education.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No education entries extracted.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {extractedResume.education.map((edu, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                          <h4 className="text-xs font-extrabold text-gray-900">{edu.degree}</h4>
                          <p className="text-xs font-bold text-gray-500">{edu.institution}</p>
                          {edu.grade && (
                            <div className="text-[11px] font-black text-emerald-700 pt-1">
                              {edu.grade.type}: {edu.grade.raw}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Professional Summary */}
                {extractedResume.summary.value && (
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-3">
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                        Professional Summary
                      </h3>
                    </div>
                    <p className="text-xs font-medium text-gray-700 leading-relaxed">
                      {extractedResume.summary.value}
                    </p>
                  </div>
                )}

                {/* Projects */}
                {extractedResume.projects.length > 0 && (
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                        Projects ({extractedResume.projects.length})
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {extractedResume.projects.map((proj, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                          <h4 className="text-xs font-extrabold text-gray-900">{proj.name}</h4>
                          {proj.description.length > 0 && (
                            <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 font-medium">
                              {proj.description.map((desc, dIdx) => (
                                <li key={dIdx}>{desc}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications & Achievements */}
                {(extractedResume.certifications.length > 0 || extractedResume.achievements.length > 0) && (
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                        Certifications & Achievements
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {extractedResume.certifications.map((c, idx) => (
                        <span key={`cert_${idx}`} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold rounded-xl">
                          📜 {c.name}
                        </span>
                      ))}
                      {extractedResume.achievements.map((a, idx) => (
                        <span key={`ach_${idx}`} className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl">
                          🏆 {a.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {extractedResume.languages.length > 0 && (
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-3">
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                        Languages ({extractedResume.languages.length})
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {extractedResume.languages.map((lang, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-800 font-extrabold text-xs rounded-xl border border-slate-200">
                          {lang.name} {lang.proficiency ? `(${lang.proficiency})` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 2: RAW TEXT STREAM */}
          {activeTab === "raw" && (
            <div className="bg-slate-900 rounded-3xl p-6 text-slate-100 font-mono text-xs leading-relaxed space-y-4 shadow-xl border border-slate-800">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Extracted Plain Text Stream ({extractedResume.raw.full_text.length} Characters)
                </span>
              </div>
              <pre className="whitespace-pre-wrap selection:bg-indigo-500/30 overflow-x-auto">
                {extractedResume.raw.full_text}
              </pre>
            </div>
          )}

          {/* TAB 3: SOURCE INSPECTOR */}
          {activeTab === "source" && (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                  Page & Line Block Mapping Inspector
                </h3>
              </div>

              <div className="space-y-6">
                {extractedResume.raw.pages.map((p) => (
                  <div key={p.page} className="space-y-3">
                    <h4 className="text-xs font-black bg-indigo-50 text-indigo-800 px-3 py-1 rounded-xl inline-block">
                      Page {p.page} ({p.blocks.length} Text Blocks)
                    </h4>
                    <div className="grid grid-cols-1 gap-2 font-mono text-xs">
                      {p.blocks.map((b) => (
                        <div key={b.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                          <span className="text-gray-800">{b.text}</span>
                          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                            {b.id} • Line {b.line}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CANONICAL ZOD JSON */}
          {activeTab === "json" && (
            <div className="bg-slate-900 rounded-3xl p-6 text-indigo-300 font-mono text-xs leading-relaxed shadow-xl border border-slate-800">
              <pre className="whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(extractedResume, null, 2)}
              </pre>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
