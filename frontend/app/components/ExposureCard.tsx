"use client";

import type { Exposure } from "@/types/analysis";
import { truncateAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Exposure Cards (PRD §14 — Exposure Cards)
//
// Investigation alerts, not ordinary cards.
// Strong visual hierarchy, explicit technical typography.
// ─────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  potential: {
    bg: "bg-mangaatha-exposure/5",
    border: "border-mangaatha-exposure/30",
    hover: "hover:border-mangaatha-exposure/60 hover:bg-mangaatha-exposure/10",
    headerBg: "bg-mangaatha-exposure/10",
    badgeBorder: "border-mangaatha-exposure/20",
    text: "text-mangaatha-exposure",
    label: "POTENTIAL EXPOSURE",
    icon: "⚠",
  },
  attention: {
    bg: "bg-mangaatha-attention/5",
    border: "border-mangaatha-attention/30",
    hover: "hover:border-mangaatha-attention/60 hover:bg-mangaatha-attention/10",
    headerBg: "bg-mangaatha-attention/10",
    badgeBorder: "border-mangaatha-attention/20",
    text: "text-mangaatha-attention",
    label: "NEEDS ATTENTION",
    icon: "⚠",
  },
  informational: {
    bg: "bg-mangaatha-info/5",
    border: "border-mangaatha-info/30",
    hover: "hover:border-mangaatha-info/60 hover:bg-mangaatha-info/10",
    headerBg: "bg-mangaatha-info/10",
    badgeBorder: "border-mangaatha-info/20",
    text: "text-mangaatha-info",
    label: "INFORMATIONAL",
    icon: "ℹ",
  },
};

type ExposureCardProps = {
  exposure: Exposure;
  onViewEvidence: (contractAddress: string) => void;
};

function ExposureCard({ exposure, onViewEvidence }: ExposureCardProps) {
  const config = STATUS_CONFIG[exposure.status];

  return (
    <div className={`flex flex-col border ${config.border} ${config.bg} ${config.hover} transition-all duration-200 group`}>
      
      {/* Header Bar */}
      <div className={`flex items-center justify-between px-5 py-3 ${config.headerBg} border-b ${config.badgeBorder}`}>
        <div className={`flex items-center gap-2 text-[10px] font-mono font-semibold tracking-widest uppercase ${config.text}`}>
          <span className={exposure.status === 'potential' ? 'animate-pulse' : ''}>{config.icon}</span>
          <span>{config.label}</span>
        </div>
        <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest">
          {exposure.chain}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        
        {/* Asset & Contract */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            {exposure.token && (
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest mb-1 block">
                  ASSET
                </span>
                <span className="text-sm font-semibold text-mangaatha-text">
                  {exposure.token}
                </span>
              </div>
            )}
            
            <div className="flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest mb-1 block">
                CONTRACT
              </span>
              <span className="text-sm font-mono text-mangaatha-text-sec truncate" title={exposure.contract}>
                {truncateAddress(exposure.contract)}
              </span>
            </div>
          </div>
        </div>

        {/* Reason / Alert Detail */}
        <div className="mb-8">
          <span className={`text-[10px] font-mono font-semibold uppercase tracking-widest block mb-2 ${config.text}`}>
            SIGNAL DETECTED
          </span>
          <p className="text-sm text-mangaatha-text leading-relaxed">
            {exposure.reason}
          </p>
        </div>

        <div className={`h-px w-full border-t border-dashed ${config.badgeBorder} mb-4`} />

        {/* Action */}
        <div className="flex justify-end">
          <button
            onClick={() => onViewEvidence(exposure.contract)}
            className={`text-[10px] font-mono ${config.text} uppercase tracking-widest flex items-center gap-2 transition-colors duration-200 focus-visible:outline-none cursor-pointer opacity-80 group-hover:opacity-100`}
          >
            TRACE EVIDENCE
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Exposure List
// ─────────────────────────────────────────────────────────

type ExposureListProps = {
  exposures: Exposure[];
  onViewEvidence: (contractAddress: string) => void;
};

export default function ExposureList({ exposures, onViewEvidence }: ExposureListProps) {
  if (exposures.length === 0) {
    return (
      <div className="w-full py-16 px-6 text-center border border-dashed border-mangaatha-safe/30 bg-mangaatha-safe/5 animate-fadeIn">
        <span className="text-mangaatha-safe text-2xl mb-4 block">✓</span>
        <h3 className="text-sm font-mono uppercase tracking-widest text-mangaatha-safe mb-2">
          NO POTENTIAL EXPOSURES
        </h3>
        <p className="text-xs text-mangaatha-text-muted font-mono max-w-sm mx-auto">
          We did not find any critical exposures in the active permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[10px] font-mono text-mangaatha-text-muted tracking-widest uppercase">
          Potential Exposures
          <span className="ml-2 px-1.5 py-0.5 bg-mangaatha-exposure/10 text-mangaatha-exposure border border-mangaatha-exposure/20">
            {String(exposures.length).padStart(2, '0')}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
