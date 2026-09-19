"use client";

import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────
// Loading State (PRD §9 — Loading Screen)
//
// Live security scan interface.
// Shows progressive scanning steps with technical typography
// and a precise progress indicator.
// ─────────────────────────────────────────────────────────

type LoadingStep = {
  label: string;
  delay: number; // ms after mount to mark complete
};

const STEPS: LoadingStep[] = [
  { label: "ADDRESS VERIFIED", delay: 400 },
  { label: "ACTIVITY INDEXED", delay: 900 },
  { label: "ACTIVE APPROVALS", delay: 1400 },
  { label: "CONTRACT SIGNALS", delay: 1800 },
  { label: "EVIDENCE TRACE", delay: 2200 },
];

// Provide ~600ms padding after the last step completes for cinematic transition
export const LOADING_DURATION = STEPS[STEPS.length - 1].delay + 600;

type Props = {
  address: string;
};

export default function LoadingState({ address }: Props) {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, idx) => {
      const timer = setTimeout(() => {
        setCompletedCount(idx + 1);
      }, step.delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const shortAddr =
    address.length > 14
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  const progressPct = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="flex flex-col items-start max-w-lg mx-auto w-full py-20 px-6 animate-fadeIn font-mono">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10 text-xs text-mangaatha-text-muted tracking-widest uppercase">
        <span className="flex items-center gap-2 text-mangaatha-mint">
          <span className="w-1.5 h-1.5 bg-mangaatha-mint rounded-full animate-pulse" />
          MANGAATHA
        </span>
        <span className="opacity-50">/</span>
        <span>SECURITY SCAN</span>
      </div>

      {/* Target Info */}
      <div className="mb-12">
        <h2 className="text-xl sm:text-2xl text-mangaatha-text mb-2 tracking-tight uppercase font-sans font-medium">
          Analyzing
        </h2>
        <p className="text-sm text-mangaatha-text-sec">
          {shortAddr}
        </p>
      </div>

      {/* Step list */}
      <div className="w-full space-y-3 mb-12">
        {STEPS.map((step, idx) => {
          const isComplete = idx < completedCount;
          const isActive = idx === completedCount;

          return (
            <div
              key={step.label}
              className={`flex items-center gap-4 text-xs tracking-wide transition-all duration-300 ${
                isComplete
                  ? "text-mangaatha-mint"
                  : isActive
                    ? "text-mangaatha-text"
                    : "text-mangaatha-text-muted/40"
              }`}
            >
              {/* Icon Status */}
              <div className="w-4 flex items-center justify-center flex-shrink-0">
                {isComplete ? (
                  <span>✓</span>
                ) : isActive ? (
                  <span className="animate-pulse">▶</span>
                ) : (
                  <span>◌</span>
                )}
              </div>

              {/* Label */}
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Progress Bar & Percentage */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-3 text-xs text-mangaatha-text-muted">
          <span>SYSTEM.TRACE</span>
          <span className={`${progressPct === 100 ? 'text-mangaatha-mint' : ''} transition-colors duration-300`}>
            {progressPct}%
          </span>
        </div>
        <div className="w-full h-px bg-mangaatha-border relative">
          <div
            className="absolute left-0 top-0 h-full bg-mangaatha-mint transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
