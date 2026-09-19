"use client";

import type { AnalysisResult } from "@/types/analysis";

// ─────────────────────────────────────────────────────────
// Results Overview (PRD §12 — Results Overview)
//
// Prioritizes the highest severity finding to answer:
// What did we find? Where? Why? What evidence supports it?
// Avoids generic metric cards in favor of a strong
// investigation summary.
// ─────────────────────────────────────────────────────────

type Props = {
  result: AnalysisResult;
  onReset: () => void;
  onViewEvidence?: (contractAddress: string) => void;
  onSelectTab?: (tab: "overview" | "approvals" | "exposures" | "evidence") => void;
};

export default function ResultsOverview({ result, onReset, onViewEvidence, onSelectTab }: Props) {
  const hasPartialChain = result.chains.some((c) => c.status === "error");
  
  // Find highest severity exposure to feature
  const potentialExposure = result.exposures.find(e => e.status === "potential");
  const attentionExposure = result.exposures.find(e => e.status === "attention");
  const highestExposure = potentialExposure || attentionExposure || result.exposures[0];

  const potentialCount = result.exposures.filter(e => e.status === "potential").length;
  const attentionCount = result.exposures.filter(e => e.status === "attention").length;

  return (
    <div className="w-full animate-fadeIn flex flex-col gap-6">
      
      {/* ── Partial Data Warning ── */}
      {hasPartialChain && (
        <div className="flex items-start gap-3 px-4 py-3 bg-mangaatha-attention/5 border border-mangaatha-attention/20 text-mangaatha-attention text-xs font-mono">
          <span className="mt-0.5 animate-pulse">⚠</span>
          <div>
            <p className="font-semibold uppercase tracking-widest mb-1">Partial Trace Available</p>
            <p className="opacity-70 leading-relaxed">
              Some chain data could not be verified. Analysis is based on incomplete network state.
            </p>
          </div>
        </div>
      )}

      {/* ── Primary Finding Surface ── */}
      {highestExposure ? (
        <div className={`relative p-6 sm:p-8 bg-mangaatha-surface border ${
          highestExposure.status === 'potential' ? 'border-mangaatha-exposure' :
          highestExposure.status === 'attention' ? 'border-mangaatha-attention' :
          'border-mangaatha-info'
        }`}>
          {/* Subtle background glow/sweep based on risk */}
          <div className={`absolute top-0 left-0 w-full h-1 ${
            highestExposure.status === 'potential' ? 'bg-mangaatha-exposure' :
            highestExposure.status === 'attention' ? 'bg-mangaatha-attention' :
            'bg-mangaatha-info'
          }`} />

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            
            {/* Finding Detail */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold tracking-widest uppercase border ${
                  highestExposure.status === 'potential' ? 'bg-mangaatha-exposure/10 text-mangaatha-exposure border-mangaatha-exposure/20' :
                  highestExposure.status === 'attention' ? 'bg-mangaatha-attention/10 text-mangaatha-attention border-mangaatha-attention/20' :
                  'bg-mangaatha-info/10 text-mangaatha-info border-mangaatha-info/20'
                }`}>
                  {highestExposure.status === 'potential' && <span className="animate-pulse">⚠</span>}
                  {highestExposure.status === 'potential' ? 'POTENTIAL EXPOSURE' :
                   highestExposure.status === 'attention' ? 'NEEDS ATTENTION' : 'INFORMATIONAL'}
                </span>
                <span className="text-xs font-mono text-mangaatha-text-muted">
                  {String(
                    highestExposure.status === 'potential'
                      ? potentialCount
                      : highestExposure.status === 'attention'
                        ? attentionCount
                        : result.exposures.length
                  ).padStart(2, '0')} DETECTED
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-medium text-mangaatha-text leading-tight mb-3">
                {highestExposure.reason}
              </h3>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6">
                {highestExposure.token && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest">Asset</span>
                    <span className="text-sm font-mono text-mangaatha-text-sec mt-1">{highestExposure.token}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest">Network</span>
                  <span className="text-sm font-mono text-mangaatha-text-sec mt-1">{highestExposure.chain}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest">Spender</span>
                  <span className="text-sm font-mono text-mangaatha-text-sec mt-1 font-mono">{highestExposure.contract.slice(0,6)}...{highestExposure.contract.slice(-4)}</span>
                </div>
              </div>
            </div>

            {/* Action — View Investigation Button */}
            <div className="mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-mangaatha-border sm:pl-6 flex items-center sm:items-end justify-between sm:flex-col min-w-[170px]">
              <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest text-right hidden sm:block">Action Required</span>
              
              <button
                type="button"
                onClick={() => {
                  if (onViewEvidence && highestExposure.contract) {
                    onViewEvidence(highestExposure.contract);
                  } else if (onSelectTab) {
                    onSelectTab("exposures");
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-2 border border-mangaatha-mint/40 bg-mangaatha-mint/10 hover:bg-mangaatha-mint/20 text-mangaatha-mint text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-sm focus-visible:outline-none"
              >
                <span>VIEW INVESTIGATION</span>
                <span className="transition-transform duration-200">→</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Safe / No exposures state */
        <div className="relative p-6 sm:p-8 bg-mangaatha-surface border border-mangaatha-safe/30">
          <div className="absolute top-0 left-0 w-full h-1 bg-mangaatha-safe/50" />
          <div className="flex items-start gap-4">
            <span className="text-mangaatha-safe text-xl">✓</span>
            <div>
              <span className="inline-flex px-2 py-0.5 text-[10px] font-mono font-semibold tracking-widest uppercase border bg-mangaatha-safe/10 text-mangaatha-safe border-mangaatha-safe/20 mb-3">
                NO CRITICAL EXPOSURES
              </span>
              <h3 className="text-lg font-medium text-mangaatha-text">
                No immediate risks detected in the active permissions.
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* ── Secondary Context Bar (3-card balanced layout without relationship graph) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-mangaatha-border border border-mangaatha-border">
        
        {/* Active Approvals */}
        <div className="bg-mangaatha-surface p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest mb-3">Active Approvals</span>
          <span className="text-2xl font-mono text-mangaatha-text">{String(result.approvals.length).padStart(2, '0')}</span>
        </div>

        {/* Security Exposures */}
        <div className="bg-mangaatha-surface p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest mb-3">
            Risk Exposures ({potentialCount} Critical / {attentionCount} Anomaly)
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-mono ${potentialCount > 0 ? "text-mangaatha-exposure font-bold" : attentionCount > 0 ? "text-mangaatha-attention font-bold" : "text-mangaatha-text"}`}>
              {String(potentialCount + attentionCount).padStart(2, '0')}
            </span>
            {potentialCount > 0 ? (
              <span className="text-[10px] font-mono text-mangaatha-exposure">
                ({potentialCount} CRITICAL)
              </span>
            ) : attentionCount > 0 ? (
              <span className="text-[10px] font-mono text-mangaatha-attention">
                ({attentionCount} ANOMALIES)
              </span>
            ) : (
              <span className="text-[10px] font-mono text-mangaatha-mint">
                (0 RISKS)
              </span>
            )}
          </div>
        </div>

        {/* Chains Analyzed */}
        <div className="bg-mangaatha-surface p-4 flex flex-col justify-between">
          <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest mb-3">Networks Scanned</span>
          <span className="text-2xl font-mono text-mangaatha-text">
            {result.chains.filter(c => c.status === "success").map(c => c.chain).join(" + ") || "Ethereum + Base"}
          </span>
        </div>

      </div>
    </div>
  );
}
