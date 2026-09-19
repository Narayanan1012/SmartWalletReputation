"use client";

import type { Evidence } from "@/types/analysis";
import { truncateAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Evidence List (PRD §16 — Evidence List)
//
// Each item feels like a case file.
// The relationship sequence is visually prominent.
// ─────────────────────────────────────────────────────────

type Props = {
  evidence: Evidence[];
  onSelect: (evidence: Evidence) => void;
};

export default function EvidenceList({ evidence, onSelect }: Props) {
  if (evidence.length === 0) {
    return (
      <div className="w-full py-16 px-6 text-center border border-dashed border-mangaatha-border bg-mangaatha-surface-alt/50 animate-fadeIn">
        <span className="text-mangaatha-text-muted text-2xl mb-4 block">⊘</span>
        <h3 className="text-sm font-mono uppercase tracking-widest text-mangaatha-text-muted mb-2">
          NO EVIDENCE TRACES
        </h3>
        <p className="text-xs text-mangaatha-text-muted/60 font-mono max-w-sm mx-auto">
          No actionable evidence chains were generated for this address.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[10px] font-mono text-mangaatha-text-muted tracking-widest uppercase">
          Evidence Trace Files
          <span className="ml-2 px-1.5 py-0.5 bg-mangaatha-surface-alt text-mangaatha-text border border-mangaatha-border">
            {String(evidence.length).padStart(2, '0')}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evidence.map((evi, idx) => {
          const isDanger = evi.exposure?.status === "potential";
          const isWarning = evi.exposure?.status === "attention";
          const isInfo = evi.exposure?.status === "informational";

          const caseNumber = String(idx + 1).padStart(3, '0');

          return (
            <button
              key={evi.id}
              onClick={() => onSelect(evi)}
              className={`group flex flex-col text-left border bg-mangaatha-surface transition-all duration-200 cursor-pointer focus-visible:outline-none ${
                isDanger
                  ? "border-mangaatha-exposure/30 hover:border-mangaatha-exposure/60"
                  : isWarning
                    ? "border-mangaatha-attention/30 hover:border-mangaatha-attention/60"
                    : isInfo
                      ? "border-mangaatha-info/30 hover:border-mangaatha-info/60"
                      : "border-mangaatha-border hover:border-mangaatha-text-muted/50"
              }`}
            >
              {/* Case Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-mangaatha-border bg-mangaatha-surface-alt/50">
                <span className="text-[10px] font-mono font-medium text-mangaatha-text-sec tracking-widest uppercase">
                  CASE {caseNumber}
                </span>
                <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest">
                  {evi.token ? `${evi.token} · ` : ""}EVM
                </span>
              </div>

              {/* Trace Sequence */}
              <div className="p-5 flex-1 flex flex-col">
                
                {/* Node 1: Wallet */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest">
                    WALLET
                  </span>
                  <span className="text-xs font-mono text-mangaatha-text mt-0.5">
                    {truncateAddress(evi.wallet)}
                  </span>
                </div>

                {/* Connection */}
                <div className="flex flex-col items-center py-2">
                  <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest italic my-1">
                    approved
                  </span>
                  <span className="text-mangaatha-text-muted text-[10px]">↓</span>
                </div>

                {/* Node 2: Contract */}
                <div className="flex flex-col mb-4">
                  <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest">
                    CONTRACT
                  </span>
                  <span className="text-xs font-mono text-mangaatha-text mt-0.5">
                    {truncateAddress(evi.spender)}
                  </span>
                </div>

                {/* Signal / Exposure */}
                {evi.exposure && (
                  <div className={`mt-auto pt-4 border-t border-dashed ${
                    isDanger ? "border-mangaatha-exposure/30" : 
                    isWarning ? "border-mangaatha-attention/30" : 
                    "border-mangaatha-info/30"
                  }`}>
                    <span className={`text-[10px] font-mono font-semibold uppercase tracking-widest block mb-1 ${
                      isDanger ? "text-mangaatha-exposure" : 
                      isWarning ? "text-mangaatha-attention" : 
                      "text-mangaatha-info"
                    }`}>
                      {isDanger ? "⚠ POTENTIAL EXPOSURE" : 
                       isWarning ? "⚠ NEEDS ATTENTION" : 
                       "ℹ INFORMATIONAL"}
                    </span>
                    <span className="text-xs text-mangaatha-text-sec line-clamp-2 leading-relaxed">
                      {evi.exposure.reason}
                    </span>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className={`px-4 py-3 bg-mangaatha-surface-alt flex justify-end border-t border-mangaatha-border`}>
                <div className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 transition-colors duration-200 ${
                  isDanger ? "text-mangaatha-exposure group-hover:text-mangaatha-exposure" : 
                  "text-mangaatha-text-muted group-hover:text-mangaatha-mint"
                }`}>
                  TRACE DETAIL
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
