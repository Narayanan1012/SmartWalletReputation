"use client";

import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────
// Animated staged loading screen (PRD §P0 — Loading State)
//
// Shows progressive checkmarks:
//   ✓ Address validated
//   ✓ Checking blockchain activity
//   ○ Checking approvals
//   ○ Checking contract security
//   ○ Building evidence
// ─────────────────────────────────────────────────────────

type LoadingStep = {
  label: string;
  delay: number; // ms after mount to mark complete
};

const STEPS: LoadingStep[] = [
  { label: "Address validated", delay: 400 },
  { label: "Checking blockchain activity", delay: 900 },
  { label: "Checking approvals", delay: 1400 },
  { label: "Checking contract security", delay: 1800 },
  { label: "Building evidence", delay: 2200 },
];

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

  // Truncate address for display
  const shortAddr =
    address.length > 14
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 animate-fadeIn">
      {/* Shield icon */}
      <div className="relative mb-8">
        <div className="w-16 h-16 rounded-lg bg-blue-600 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white animate-pulse"
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
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
        Analyzing address
      </h2>
      <p className="text-sm font-mono text-neutral-400 mb-10">{shortAddr}</p>

      {/* Step list */}
      <div className="w-full max-w-sm space-y-4">
        {STEPS.map((step, idx) => {
          const isComplete = idx < completedCount;
          const isActive = idx === completedCount;

          return (
            <div
              key={step.label}
              className={`flex items-center gap-3 transition-all duration-500 ${
                isComplete
                  ? "opacity-100"
                  : isActive
                    ? "opacity-100"
                    : "opacity-40"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  isComplete
                    ? "bg-emerald-500/15 text-emerald-400"
                    : isActive
                      ? "bg-blue-500/15 text-blue-400"
                      : "bg-neutral-800 text-neutral-600"
                }`}
              >
                {isComplete ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : isActive ? (
                  <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-neutral-600" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-sm transition-colors duration-500 ${
                  isComplete
                    ? "text-emerald-400"
                    : isActive
                      ? "text-white"
                      : "text-neutral-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-10 w-full max-w-sm h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(completedCount / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
