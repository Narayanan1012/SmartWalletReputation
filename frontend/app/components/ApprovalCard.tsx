"use client";

import type { Approval } from "@/types/analysis";
import { truncateAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Approval Cards (PRD §P0 — Approval Information)
//
// Displays active token approvals with:
//   • Token symbol + chain
//   • Spender address (with optional label)
//   • Allowance type (Unlimited ⚠ / Limited)
//   • Optional tx hash + date
//   • View Evidence button
// ─────────────────────────────────────────────────────────

type ApprovalCardProps = {
  approval: Approval;
  onViewEvidence: (spenderAddress: string) => void;
};

function ApprovalCard({ approval, onViewEvidence }: ApprovalCardProps) {
  const isUnlimited = approval.allowance.type === "unlimited";

  const formattedDate = approval.approvedAt
    ? new Date(approval.approvedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="rounded-xl bg-neutral-900/60 border border-neutral-800/60 backdrop-blur-sm p-5 hover:border-neutral-700/80 transition-colors duration-200">
      {/* Top row — Token + Chain */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Token icon circle */}
          <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-400 font-bold text-sm">
              {approval.token.symbol.slice(0, 3)}
            </span>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">
              {approval.token.symbol}
            </h3>
            <span className="text-xs text-neutral-500">{approval.chain}</span>
          </div>
        </div>

        {/* Allowance badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
            isUnlimited
              ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
          }`}
        >
          {isUnlimited ? (
            <svg
              className="w-3.5 h-3.5"
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
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {isUnlimited ? "Unlimited" : "Limited"}
        </span>
      </div>

      {/* Details grid */}
      <div className="space-y-3 text-sm">
        {/* Spender */}
        <div className="flex items-start justify-between">
          <span className="text-neutral-500 text-xs">Approved to</span>
          <div className="text-right">
            {approval.spender.label && (
              <span className="text-neutral-300 text-xs block mb-0.5">
                {approval.spender.label}
              </span>
            )}
            <span
              className="text-neutral-400 font-mono text-xs"
              title={approval.spender.address}
            >
              {truncateAddress(approval.spender.address)}
            </span>
          </div>
        </div>

        {/* Allowance amount (for limited) */}
        {!isUnlimited && approval.allowance.raw && (
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 text-xs">Allowance</span>
            <span className="text-neutral-300 font-mono text-xs">
              {Number(approval.allowance.raw).toLocaleString()}
            </span>
          </div>
        )}

        {/* Transaction hash */}
        {approval.transactionHash && (
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 text-xs">Transaction</span>
            <span
              className="text-neutral-400 font-mono text-xs"
              title={approval.transactionHash}
            >
              {truncateAddress(approval.transactionHash, 8, 6)}
            </span>
          </div>
        )}

        {/* Date */}
        {formattedDate && (
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 text-xs">Date</span>
            <span className="text-neutral-400 text-xs">{formattedDate}</span>
          </div>
        )}
      </div>

      {/* View Evidence button */}
      <button
        onClick={() => onViewEvidence(approval.spender.address)}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 hover:text-white text-xs font-medium border border-neutral-700/50 hover:border-neutral-600 transition-all duration-200 cursor-pointer"
      >
        <svg
          className="w-3.5 h-3.5"
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
        View Evidence
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Approval List — renders all approval cards or empty state
// ─────────────────────────────────────────────────────────

type ApprovalListProps = {
  approvals: Approval[];
  onViewEvidence: (spenderAddress: string) => void;
};

export default function ApprovalList({
  approvals,
  onViewEvidence,
}: ApprovalListProps) {
  if (approvals.length === 0) {
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-white font-semibold mb-1">
          No active approvals found
        </h3>
        <p className="text-neutral-500 text-sm max-w-sm mx-auto">
          This address does not have any active token approvals in the data
          available for this analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">
          Active Approvals
          <span className="ml-2 text-neutral-500 font-normal">
            ({approvals.length})
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approvals.map((approval) => (
          <ApprovalCard
            key={approval.id}
            approval={approval}
            onViewEvidence={onViewEvidence}
          />
        ))}
      </div>
    </div>
  );
}
