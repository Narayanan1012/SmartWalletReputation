"use client";

import type { Exposure } from "@/types/analysis";
import { truncateAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Exposure Cards (PRD §P0 — Potential Exposure)
//
// Visually distinguishable from ordinary information.
// Status-based styling:
//   potential → red/amber warning
//   attention → yellow
//   informational → blue
// ─────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  potential: {
    bg: "bg-red-500/8",
    border: "border-red-500/30",
    hoverBorder: "hover:border-red-500/50",
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: "text-red-400",
    glow: "shadow-red-500/5",
    label: "Potential Exposure",
    accentBar: "bg-gradient-to-b from-red-500 to-red-600",
  },
  attention: {
    bg: "bg-amber-500/8",
    border: "border-amber-500/30",
    hoverBorder: "hover:border-amber-500/50",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: "text-amber-400",
    glow: "shadow-amber-500/5",
    label: "Needs Attention",
    accentBar: "bg-gradient-to-b from-amber-500 to-amber-600",
  },
  informational: {
    bg: "bg-blue-500/8",
    border: "border-blue-500/30",
    hoverBorder: "hover:border-blue-500/50",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: "text-blue-400",
    glow: "shadow-blue-500/5",
    label: "Informational",
    accentBar: "bg-gradient-to-b from-blue-500 to-blue-600",
  },
};

type ExposureCardProps = {
  exposure: Exposure;
  onViewEvidence: (contractAddress: string) => void;
};

function ExposureCard({ exposure, onViewEvidence }: ExposureCardProps) {
  const config = STATUS_CONFIG[exposure.status];

  return (
    <div
      className={`relative rounded-xl ${config.bg} border ${config.border} ${config.hoverBorder} ${config.glow} shadow-lg backdrop-blur-sm overflow-hidden transition-all duration-200`}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${config.accentBar}`}
      />

      <div className="pl-5 pr-5 py-5">
        {/* Top row — Status badge */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.badge}`}
          >
            {exposure.status === "potential" ? (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            ) : exposure.status === "attention" ? (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 8v4m0 4h.01"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {config.label}
          </span>

          <span className="text-xs text-neutral-500">{exposure.chain}</span>
        </div>

        {/* Token + contract info */}
        <div className="space-y-3 mb-4">
          {exposure.token && (
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}
              >
                <span className={`${config.icon} font-bold text-xs`}>
                  {exposure.token.slice(0, 3)}
                </span>
              </div>
              <span className="text-white font-semibold text-sm">
                {exposure.token}
              </span>
            </div>
          )}

          <div className="flex items-start justify-between">
            <span className="text-neutral-500 text-xs">Contract</span>
            <span
              className="text-neutral-300 font-mono text-xs"
              title={exposure.contract}
            >
              {truncateAddress(exposure.contract)}
            </span>
          </div>
        </div>

        {/* Reason */}
        <div className="rounded-lg bg-neutral-900/60 border border-neutral-800/50 px-3.5 py-3 mb-4">
          <div className="flex items-start gap-2">
            <svg
              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.icon}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-neutral-300 text-xs leading-relaxed">
              {exposure.reason}
            </p>
          </div>
        </div>

        {/* View Evidence button */}
        <button
          onClick={() => onViewEvidence(exposure.contract)}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl ${config.bg} hover:brightness-125 border ${config.border} text-xs font-medium transition-all duration-200 cursor-pointer`}
        >
          <svg
            className={`w-3.5 h-3.5 ${config.icon}`}
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
          <span className={config.icon}>View Evidence</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Exposure List — renders all exposure cards or empty state
// ─────────────────────────────────────────────────────────

type ExposureListProps = {
  exposures: Exposure[];
  onViewEvidence: (contractAddress: string) => void;
};

export default function ExposureList({
  exposures,
  onViewEvidence,
}: ExposureListProps) {
  if (exposures.length === 0) {
    return (
      <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/40 py-14 px-6 text-center animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-emerald-400"
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
        <h3 className="text-white font-semibold mb-1">
          No potential exposures found
        </h3>
        <p className="text-neutral-500 text-sm max-w-sm mx-auto">
          We did not find a relevant exposure from the data available for this
          analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <svg
            className="w-4 h-4 text-red-400"
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
          Potential Exposures
          <span className="text-neutral-500 font-normal">
            ({exposures.length})
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exposures.map((exposure) => (
          <ExposureCard
            key={exposure.id}
            exposure={exposure}
            onViewEvidence={onViewEvidence}
          />
        ))}
      </div>
    </div>
  );
}
