"use client";

import { useState, useCallback, useEffect } from "react";
import type { AnalysisResult, AppState, Evidence } from "@/types/analysis";
import { analyzeAddress } from "@/lib/api";
import AddressInput from "./components/AddressInput";
import LoadingState, { LOADING_DURATION } from "./components/LoadingState";
import ResultsOverview from "./components/ResultsOverview";
import ApprovalList from "./components/ApprovalCard";
import ExposureList from "./components/ExposureCard";
import EvidenceView from "./components/EvidenceView";
import EvidenceList from "./components/EvidenceList";
import RelationshipExplorer from "./components/RelationshipExplorer";
import GoldenCurves from "./components/GoldenCurves";

// ─────────────────────────────────────────────────────────
// Main page — State machine:
//   idle → loading → transitioning → results | error
// ─────────────────────────────────────────────────────────

type ExtendedAppState = AppState | "transitioning";
type ResultTab = "overview" | "approvals" | "exposures" | "evidence" | "relationships";

const TABS: { id: ResultTab; label: string; icon: string }[] = [
  { id: "overview", label: "OVERVIEW", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "approvals", label: "APPROVALS", icon: "M5 13l4 4L19 7" },
  { id: "exposures", label: "EXPOSURES", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" },
  { id: "evidence", label: "EVIDENCE", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { id: "relationships", label: "GRAPH", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
];

export default function Home() {
  const [appState, setAppState] = useState<ExtendedAppState>("idle");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzedAddress, setAnalyzedAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>("overview");

  const openEvidence = useCallback((address: string) => {
    if (!analysisResult) return;
    const match = analysisResult.evidence.find(
      (e) =>
        e.spender.toLowerCase() === address.toLowerCase() ||
        e.contract?.address.toLowerCase() === address.toLowerCase()
    );
    if (match) setSelectedEvidence(match);
  }, [analysisResult]);

  const handleAnalyze = async (address: string) => {
    setAppState("loading");
    setAnalyzedAddress(address);
    setErrorMessage("");
    setActiveTab("overview");

    try {
      // Wait for both the API call and the visual scan sequence to complete
      const [result] = await Promise.all([
        analyzeAddress(address),
        new Promise((resolve) => setTimeout(resolve, LOADING_DURATION))
      ]);
      
      // Cinematic transition
      setAppState("transitioning");
      setTimeout(() => {
        setAnalysisResult(result);
        setAppState("results");
      }, 700); // 700ms brief darkening before reveal

    } catch {
      setErrorMessage("System failure. Unable to complete security trace.");
      setAppState("error");
    }
  };

  const handleReset = () => {
    setAppState("idle");
    setAnalysisResult(null);
    setAnalyzedAddress("");
    setErrorMessage("");
    setActiveTab("overview");
  };

  const getTabBadge = (tab: ResultTab): number | null => {
    if (!analysisResult) return null;
    switch (tab) {
      case "approvals": return analysisResult.approvals.length;
      case "exposures": return analysisResult.exposures.length;
      case "evidence": return analysisResult.evidence.length;
      default: return null;
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let nextIdx = idx;
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % TABS.length;
    else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + TABS.length) % TABS.length;
    else return;
    e.preventDefault();
    setActiveTab(TABS[nextIdx].id);
    const next = (e.currentTarget.parentElement?.children[nextIdx] as HTMLElement);
    next?.focus();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedEvidence) setSelectedEvidence(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedEvidence]);

  return (
    <div className={`relative min-h-screen flex flex-col justify-between transition-colors duration-700 ${appState === 'transitioning' ? 'bg-black' : 'bg-transparent'}`}>
      
      {/* ── Global Header (Hidden during cinematic loading/transitioning) ── */}
      {appState !== "loading" && appState !== "transitioning" && (
        <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between animate-fadeIn">
          <button
            onClick={handleReset}
            className="flex items-center gap-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-mangaatha-mint rounded-sm"
          >
            <div className="w-2 h-2 rounded-full bg-mangaatha-mint group-hover:animate-pulse" />
            <span className="font-bold text-sm tracking-widest text-mangaatha-text uppercase">
              MANGAATHA
            </span>
          </button>

          <div className="flex items-center gap-4 text-xs font-mono text-mangaatha-text-muted uppercase tracking-widest">
            <span className="hidden sm:inline">EVM NETWORKS</span>
            <span className="w-2 h-2 rounded-full bg-mangaatha-text-muted flex-shrink-0" />
          </div>
        </header>
      )}

      {/* ── Main Content Area ── */}
      <main
        className={`relative z-10 flex-1 flex flex-col items-center px-6 py-12 max-w-5xl mx-auto w-full transition-opacity duration-500 ${
          appState === "transitioning" ? "opacity-0" : "opacity-100"
        } ${appState === "results" ? "justify-start pt-4" : "justify-center"}`}
      >
        {/* ───── IDLE: Landing page ───── */}
        {appState === "idle" && (
          <>
            <GoldenCurves />
            <div className="flex flex-col items-center text-center w-full animate-fadeIn max-w-3xl mx-auto relative z-10">
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-mangaatha-text mb-6">
              WEB3 SECURITY<br />
              <span className="text-mangaatha-text-sec">INTELLIGENCE</span>
            </h1>

            <p className="text-mangaatha-text-sec text-base sm:text-lg mb-12 max-w-md mx-auto">
              Investigate before you interact.
            </p>

            <AddressInput onAnalyze={handleAnalyze} />

            {/* Minimal metadata strip */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-mangaatha-text-muted">
              <span>ACTIVE PERMISSIONS</span>
              <span className="hidden sm:inline opacity-30">|</span>
              <span>CROSS-CHAIN CONTEXT</span>
              <span className="hidden sm:inline opacity-30">|</span>
              <span>EVIDENCE TRACE</span>
            </div>
            </div>
          </>
        )}

        {/* ───── LOADING & TRANSITIONING ───── */}
        {(appState === "loading" || appState === "transitioning") && (
          <div className={`transition-opacity duration-700 ${appState === 'transitioning' ? 'opacity-0' : 'opacity-100'}`}>
            <LoadingState address={analyzedAddress} />
          </div>
        )}

        {/* ───── RESULTS: Dashboard Shell ───── */}
        {appState === "results" && analysisResult && (
          <div className="w-full animate-fadeIn">
            {/* Header / Investigation Meta */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-mangaatha-border pb-6">
              <div>
                <h2 className="text-[10px] font-mono text-mangaatha-text-muted tracking-widest uppercase mb-2">
                  Investigation
                </h2>
                <div className="text-xl sm:text-2xl font-mono text-mangaatha-text">
                  {analyzedAddress}
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs font-mono">
                  <span className="text-mangaatha-text-sec bg-mangaatha-surface-alt px-2 py-0.5 border border-mangaatha-border">
                    {analysisResult.addressType === "wallet" ? "WALLET" : "CONTRACT"}
                  </span>
                  <span className="text-mangaatha-text-muted">
                    {analysisResult.chains.filter(c => c.status === "success").map(c => c.chain).join(" · ")}
                  </span>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 border border-mangaatha-border hover:border-mangaatha-text-muted hover:text-mangaatha-text text-mangaatha-text-sec text-xs font-mono uppercase tracking-widest transition-colors duration-200 focus-visible:outline-none focus-visible:border-mangaatha-mint"
              >
                New Investigation
              </button>
            </div>

            {/* ResultsOverview (to be redesigned in Part 4) */}
            <ResultsOverview result={analysisResult} onReset={handleReset} />

            {/* Segmented Tab Navigation */}
            <div className="mt-10 mb-8 border-b border-mangaatha-border">
              <div
                className="flex items-center gap-6 sm:gap-8 overflow-x-auto pb-px"
                role="tablist"
                aria-label="Investigation sections"
              >
                {TABS.map((tab, idx) => {
                  const isActive = activeTab === tab.id;
                  const badge = getTabBadge(tab.id);

                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`tabpanel-${tab.id}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveTab(tab.id)}
                      onKeyDown={(e) => handleTabKeyDown(e, idx)}
                      className={`relative flex items-center gap-2 py-3 text-xs font-mono uppercase tracking-widest transition-colors duration-200 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:text-mangaatha-mint ${
                        isActive
                          ? "text-mangaatha-mint"
                          : "text-mangaatha-text-muted hover:text-mangaatha-text-sec"
                      }`}
                    >
                      <span>{tab.label}</span>
                      {badge !== null && badge > 0 && (
                        <span className="opacity-60">{String(badge).padStart(2, '0')}</span>
                      )}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mangaatha-mint" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]" role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={activeTab}>
              {activeTab === "overview" && (
                <div className="space-y-6 animate-fadeIn">
                  <ApprovalList approvals={analysisResult.approvals} onViewEvidence={openEvidence} />
                  <RelationshipExplorer relationships={analysisResult.relationships} walletAddress={analysisResult.address} />
                </div>
              )}
              {activeTab === "approvals" && (
                <ApprovalList approvals={analysisResult.approvals} onViewEvidence={openEvidence} />
              )}
              {activeTab === "exposures" && (
                <ExposureList exposures={analysisResult.exposures} onViewEvidence={openEvidence} />
              )}
              {activeTab === "evidence" && (
                <EvidenceList evidence={analysisResult.evidence} onSelect={(evi) => setSelectedEvidence(evi)} />
              )}
              {activeTab === "relationships" && (
                <RelationshipExplorer relationships={analysisResult.relationships} walletAddress={analysisResult.address} />
              )}
            </div>
          </div>
        )}

        {/* ───── ERROR ───── */}
        {appState === "error" && (
          <div className="flex flex-col items-center text-center py-20 animate-fadeIn max-w-sm">
            <div className="text-mangaatha-exposure font-mono text-xl mb-4">
              [ SYSTEM FAILURE ]
            </div>
            <p className="text-mangaatha-text-sec text-sm mb-8">
              {errorMessage}
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-mangaatha-exposure text-mangaatha-exposure hover:bg-mangaatha-exposure/10 text-xs font-mono uppercase tracking-widest transition-colors duration-150 focus-visible:outline-none"
            >
              Retry Trace
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      {(appState === "idle" || appState === "results") && (
        <footer className="relative z-10 w-full py-8 text-center text-[10px] font-mono text-mangaatha-text-muted tracking-widest uppercase">
          <p>MANGAATHA © INVESTIGATION SYSTEMS</p>
        </footer>
      )}

      {/* ── Evidence View Slide-Over ── */}
      {selectedEvidence && (
        <EvidenceView
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />
      )}
    </div>
  );
}
