"use client";

import { useState } from "react";
import type { AnalysisResult, AppState, Evidence } from "@/types/analysis";
import { analyzeAddress } from "@/lib/api";
import AddressInput from "./components/AddressInput";
import LoadingState from "./components/LoadingState";
import ResultsOverview from "./components/ResultsOverview";
import ApprovalList from "./components/ApprovalCard";
import ExposureList from "./components/ExposureCard";
import EvidenceView from "./components/EvidenceView";
import EvidenceList from "./components/EvidenceList";
import RelationshipExplorer from "./components/RelationshipExplorer";
// [TEMPORARY: backend-core testing panel - remove before merging to main]
import DevTestingPanel from "./components/DevTestingPanel";

// ─────────────────────────────────────────────────────────
// Main page — State machine:
//   idle → loading → results | error
//
// PRD §5 — Basic User Flow
// PRD §8 — Navigation: single-page dashboard with tabs
// ─────────────────────────────────────────────────────────

type ResultTab = "overview" | "approvals" | "exposures" | "evidence" | "relationships";

const TABS: { id: ResultTab; label: string; icon: string }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    id: "approvals",
    label: "Approvals",
    icon: "M5 13l4 4L19 7",
  },
  {
    id: "exposures",
    label: "Exposures",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
  },
  {
    id: "evidence",
    label: "Evidence",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    id: "relationships",
    label: "Explorer",
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  },
];

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzedAddress, setAnalyzedAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>("overview");

  // Find matching evidence by spender/contract address
  const openEvidence = (address: string) => {
    if (!analysisResult) return;
    const match = analysisResult.evidence.find(
      (e) =>
        e.spender.toLowerCase() === address.toLowerCase() ||
        e.contract?.address.toLowerCase() === address.toLowerCase()
    );
    if (match) setSelectedEvidence(match);
  };

  const handleAnalyze = async (address: string) => {
    setAppState("loading");
    setAnalyzedAddress(address);
    setErrorMessage("");
    setActiveTab("overview");

    try {
      const result = await analyzeAddress(address);
      setAnalysisResult(result);
      setAppState("results");
    } catch {
      setErrorMessage("We couldn't complete the analysis. Please try again.");
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

  // Badge count for tab
  const getTabBadge = (tab: ResultTab): number | null => {
    if (!analysisResult) return null;
    switch (tab) {
      case "approvals":
        return analysisResult.approvals.length;
      case "exposures":
        return analysisResult.exposures.length;
      case "evidence":
        return analysisResult.evidence.length;
      case "relationships":
        return analysisResult.relationships.length;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-neutral-950 text-neutral-100 selection:bg-blue-600 selection:text-white">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={handleReset}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">
            SmartWallet{" "}
            <span className="text-neutral-400 font-normal">Reputation</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Ethereum & Base
          </span>
        </div>
      </header>

      {/* ── Main Content Area (state-driven) ── */}
      <main
        className={`relative z-10 flex-1 flex flex-col items-center px-6 py-12 max-w-5xl mx-auto w-full ${
          appState === "results" ? "justify-start pt-4" : "justify-center"
        }`}
      >
        {/* ───── IDLE: Landing page ───── */}
        {appState === "idle" && (
          <div className="flex flex-col items-center text-center w-full animate-fadeIn">
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-medium text-neutral-300 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Web3 Security Investigation Platform
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
              Wallet & Contract <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
                Reputation Explorer
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-neutral-400 text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
              Inspect active token allowances, smart contract interactions, and
              discover potential security exposures with explainable evidence.
            </p>

            {/* Address Input */}
            <AddressInput onAnalyze={handleAnalyze} />

            {/* Feature highlights */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-left">
              <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xs">
                <div className="text-blue-400 font-medium text-sm mb-1">
                  Active Approvals
                </div>
                <div className="text-xs text-neutral-400 leading-normal">
                  Scan unlimited allowances and authorizations given to external
                  contracts.
                </div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xs">
                <div className="text-cyan-400 font-medium text-sm mb-1">
                  Contract Security
                </div>
                <div className="text-xs text-neutral-400 leading-normal">
                  Detect verified contracts, audit signals, and known risk
                  indicators.
                </div>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xs">
                <div className="text-emerald-400 font-medium text-sm mb-1">
                  Evidence Chain
                </div>
                <div className="text-xs text-neutral-400 leading-normal">
                  Clear explainability tracing from wallet to contract to
                  security signal.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───── LOADING: Analysis in progress ───── */}
        {appState === "loading" && (
          <LoadingState address={analyzedAddress} />
        )}

        {/* ───── RESULTS: Dashboard with Tabs ───── */}
        {appState === "results" && analysisResult && (
          <div className="w-full animate-fadeIn">
            {/* ResultsOverview always visible at top */}
            <ResultsOverview result={analysisResult} onReset={handleReset} />

            {/* Tab Navigation */}
            <div className="mt-6 mb-6">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900/60 border border-neutral-800/50 overflow-x-auto">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const badge = getTabBadge(tab.id);
                  const hasExposures =
                    tab.id === "exposures" &&
                    analysisResult.exposures.length > 0;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "bg-neutral-800 text-white shadow-sm"
                          : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50"
                      }`}
                    >
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={tab.icon}
                        />
                      </svg>
                      <span className="hidden sm:inline">{tab.label}</span>
                      {badge !== null && badge > 0 && (
                        <span
                          className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            hasExposures
                              ? "bg-red-500/20 text-red-400"
                              : "bg-neutral-700/60 text-neutral-400"
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
              {/* Overview — shows all sections stacked */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-fadeIn">
                  <ApprovalList
                    approvals={analysisResult.approvals}
                    onViewEvidence={openEvidence}
                  />
                  <ExposureList
                    exposures={analysisResult.exposures}
                    onViewEvidence={openEvidence}
                  />
                  <RelationshipExplorer
                    relationships={analysisResult.relationships}
                    walletAddress={analysisResult.address}
                  />
                </div>
              )}

              {/* Approvals tab */}
              {activeTab === "approvals" && (
                <ApprovalList
                  approvals={analysisResult.approvals}
                  onViewEvidence={openEvidence}
                />
              )}

              {/* Exposures tab */}
              {activeTab === "exposures" && (
                <ExposureList
                  exposures={analysisResult.exposures}
                  onViewEvidence={openEvidence}
                />
              )}

              {/* Evidence tab */}
              {activeTab === "evidence" && (
                <EvidenceList
                  evidence={analysisResult.evidence}
                  onSelect={(evi) => setSelectedEvidence(evi)}
                />
              )}

              {/* Relationships tab */}
              {activeTab === "relationships" && (
                <RelationshipExplorer
                  relationships={analysisResult.relationships}
                  walletAddress={analysisResult.address}
                />
              )}
            </div>
          </div>
        )}

        {/* ───── ERROR: Analysis failed ───── */}
        {appState === "error" && (
          <div className="flex flex-col items-center text-center py-20 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Analysis Failed
            </h2>
            <p className="text-neutral-400 text-sm mb-6 max-w-md">
              {errorMessage}
            </p>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-neutral-800/60 py-6 text-center text-xs text-neutral-500">
        <p>SmartWallet Reputation &bull; Built for Web3 Security</p>
      </footer>

      {/* ── Evidence View Slide-Over ── */}
      {selectedEvidence && (
        <EvidenceView
          evidence={selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
        />
      )}

      {/* [TEMPORARY: backend-core testing panel - remove before merging to main] */}
      <DevTestingPanel />
    </div>
  );
}
