"use client";

import type { Evidence } from "@/types/analysis";
import { truncateAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Evidence List — Tab view showing all evidence items
//
// Different from EvidenceView (the slide-over).
// This renders a summary list; clicking opens the full view.
// ─────────────────────────────────────────────────────────

type Props = {
  evidence: Evidence[];
  onSelect: (evidence: Evidence) => void;
};

export default function EvidenceList({ evidence, onSelect }: Props) {
  if (evidence.length === 0) {
    return (
      <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/40 py-14 px-6 text-center animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-white font-semibold mb-1">No evidence available</h3>
        <p className="text-neutral-500 text-sm max-w-sm mx-auto">
          No evidence chains were generated for this analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <svg
            className="w-4 h-4 text-cyan-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Evidence Chains
          <span className="text-neutral-500 font-normal">
            ({evidence.length})
          </span>
        </h3>
      </div>

      <div className="space-y-3">
        {evidence.map((evi) => {
          const isDanger = evi.exposure?.status === "potential";
          const isInfo = evi.exposure?.status === "informational";

          return (
            <button
              key={evi.id}
              onClick={() => onSelect(evi)}
              className={`w-full text-left rounded-xl border backdrop-blur-sm p-4 transition-all duration-200 cursor-pointer ${
                isDanger
                  ? "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
                  : isInfo
                    ? "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40"
                    : "bg-neutral-900/60 border-neutral-800/60 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                {/* Left: token + status */}
                <div className="flex items-center gap-2">
                  {evi.token && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${
                        isDanger
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {evi.token}
                    </span>
                  )}
                  {evi.exposure && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                        isDanger
                          ? "bg-red-500/10 text-red-400 border-red-500/25"
                          : isInfo
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/25"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                      }`}
                    >
                      {isDanger && (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M12 9v2m0 4h.01"
                          />
                        </svg>
                      )}
                      {evi.exposure.status}
                    </span>
                  )}
                </div>

                {/* Right: chevron */}
                <svg
                  className="w-4 h-4 text-neutral-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* Evidence chain summary */}
              <div className="flex items-center gap-2 text-xs text-neutral-400 flex-wrap">
                <span className="font-mono">
                  {truncateAddress(evi.wallet)}
                </span>
                <span className="text-neutral-600">→</span>
                <span>{evi.token || "approval"}</span>
                <span className="text-neutral-600">→</span>
                <span className="font-mono">
                  {truncateAddress(evi.spender)}
                </span>
                {evi.contract?.signals && evi.contract.signals.length > 0 && (
                  <>
                    <span className="text-neutral-600">→</span>
                    <span
                      className={
                        isDanger ? "text-red-400" : "text-neutral-400"
                      }
                    >
                      {evi.contract.signals.length} signal
                      {evi.contract.signals.length !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
              </div>

              {/* Reason preview */}
              {evi.exposure?.reason && (
                <p className="mt-2 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                  {evi.exposure.reason}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
