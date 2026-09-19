"use client";

import type { AnalysisResult } from "@/types/analysis";
import { truncateAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Results Overview (PRD §P0 — Results Overview)
//
// Header card with:
//   • Address + type badge
//   • Chain status pills
//   • Approval & exposure counts
//   • Partial chain warning
//   • New Analysis button
// ─────────────────────────────────────────────────────────

type Props = {
  result: AnalysisResult;
  onReset: () => void;
};

export default function ResultsOverview({ result, onReset }: Props) {
  const hasPartialChain = result.chains.some((c) => c.status === "error");
  const successChains = result.chains.filter((c) => c.status === "success");
  const errorChains = result.chains.filter((c) => c.status === "error");

  const typeLabel =
    result.addressType === "wallet"
      ? "Wallet"
      : result.addressType === "contract"
        ? "Contract"
        : "Unknown";

  const typeColor =
    result.addressType === "wallet"
      ? "bg-blue-500/10 text-blue-400 border-blue-500/25"
      : result.addressType === "contract"
        ? "bg-purple-500/10 text-purple-400 border-purple-500/25"
        : "bg-neutral-800 text-neutral-400 border-neutral-700";

  return (
    <div className="w-full animate-fadeIn">
      {/* ── Partial chain warning banner ── */}
      {hasPartialChain && (
        <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-500/8 border border-amber-500/20 text-amber-300 text-sm">
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
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
          <div>
            <p className="font-medium">Partial data available</p>
            <p className="text-amber-400/70 text-xs mt-0.5">
              {successChains.map((c) => c.chain).join(", ")} analysis available.{" "}
              {errorChains.map((c) => c.chain).join(", ")} data could not be
              retrieved.
            </p>
          </div>
        </div>
      )}

      {/* ── Main overview card ── */}
      <div className="rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
        {/* Top section — address & type */}
        <div className="px-6 pt-5 pb-4 border-b border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: address info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
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
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className="text-lg font-semibold text-white font-mono"
                    title={result.address}
                  >
                    {truncateAddress(result.address)}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-medium border ${typeColor}`}
                  >
                    {typeLabel}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 font-mono hidden sm:block">
                  {result.address}
                </p>
              </div>
            </div>

            {/* Right: new analysis button */}
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium border border-neutral-700 hover:border-neutral-600 transition-colors duration-150 cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              New Analysis
            </button>
          </div>
        </div>

        {/* Bottom section — chains + stats */}
        <div className="px-6 py-4">
          {/* Chain pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-neutral-500 mr-1">Chains:</span>
            {result.chains.map((chain) => (
              <span
                key={chain.chain}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                  chain.status === "success"
                    ? "bg-emerald-500/8 text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/8 text-red-400 border-red-500/20"
                }`}
              >
                {chain.status === "success" ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {chain.chain}
              </span>
            ))}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Approvals count */}
            <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
              <div className="text-2xl font-bold text-white font-mono">
                {result.approvals.length}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Active Approval{result.approvals.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Exposures count */}
            <div
              className={`p-4 rounded-lg border ${
                result.exposures.length > 0
                  ? "bg-red-500/8 border-red-500/20"
                  : "bg-neutral-800 border-neutral-700"
              }`}
            >
              <div
                className={`text-2xl font-bold font-mono ${
                  result.exposures.length > 0 ? "text-red-400" : "text-white"
                }`}
              >
                {result.exposures.length}
              </div>
              <div
                className={`text-xs mt-1 ${
                  result.exposures.length > 0
                    ? "text-red-400/70"
                    : "text-neutral-400"
                }`}
              >
                Potential Exposure{result.exposures.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Evidence count */}
            <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
              <div className="text-2xl font-bold text-white font-mono">
                {result.evidence.length}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Evidence Item{result.evidence.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Relationships count */}
            <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
              <div className="text-2xl font-bold text-white font-mono">
                {result.relationships.length}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Relationship{result.relationships.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
