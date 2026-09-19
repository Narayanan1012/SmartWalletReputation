"use client";

import type { Approval } from "@/types/analysis";
import { truncateAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Approval Cards (PRD §13 — Approval Cards)
//
// Designed to resemble forensic security records.
// "Unlimited" allowances are visually dominant.
// Heavy use of JetBrains Mono for technical data.
// ─────────────────────────────────────────────────────────

type ApprovalCardProps = {
  approval: Approval;
  onViewEvidence: (spenderAddress: string) => void;
};

function ApprovalCard({ approval, onViewEvidence }: ApprovalCardProps) {
  const isUnlimited = approval.allowance.type === "unlimited";

  const formattedDate = approval.approvedAt
    ? new Date(approval.approvedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className={`flex flex-col bg-mangaatha-surface border transition-colors duration-200 group ${
      isUnlimited ? "border-mangaatha-attention/30 hover:border-mangaatha-attention/60" : "border-mangaatha-border hover:border-mangaatha-text-muted/50"
    }`}>
      
      {/* Top Header */}
      <div className={`px-5 py-4 border-b ${
        isUnlimited ? "bg-mangaatha-attention/5 border-mangaatha-attention/20" : "border-mangaatha-border"
      } flex items-center justify-between`}>
        <div>
          <h3 className="text-sm font-semibold text-mangaatha-text">
            {approval.token.symbol}
          </h3>
          <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest mt-1 block">
            {approval.chain}
          </span>
        </div>
        
        {isUnlimited ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-semibold tracking-widest uppercase bg-mangaatha-attention/10 text-mangaatha-attention border border-mangaatha-attention/20">
            <span className="text-sm leading-none">∞</span> UNLIMITED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-medium tracking-widest uppercase bg-mangaatha-surface-alt text-mangaatha-text-muted border border-mangaatha-border">
            LIMITED
          </span>
        )}
      </div>

      {/* Main Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        {/* Spender Info */}
        <div className="mb-6">
          <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest mb-2 block">
            APPROVED SPENDER
          </span>
          {approval.spender.label && (
            <div className="text-sm text-mangaatha-text font-medium mb-1">
              {approval.spender.label}
            </div>
          )}
          <div className="text-xs font-mono text-mangaatha-text-sec truncate" title={approval.spender.address}>
            {approval.spender.address}
          </div>
        </div>

        <div className="h-px w-full bg-mangaatha-border mb-6" />

        {/* Technical Data Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
          
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest mb-1.5">
              Allowance
            </span>
            <span className={`text-xs font-mono ${isUnlimited ? "text-mangaatha-attention" : "text-mangaatha-text-sec"}`}>
              {isUnlimited ? "∞ Unlimited" : Number(approval.allowance.raw || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest mb-1.5">
              Approved
            </span>
            <span className="text-xs font-mono text-mangaatha-text-sec">
              {formattedDate || "Unknown"}
            </span>
          </div>

          <div className="flex flex-col col-span-2">
            <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest mb-1.5">
              Transaction
            </span>
            <span className="text-xs font-mono text-mangaatha-text-sec truncate" title={approval.transactionHash || ""}>
              {approval.transactionHash ? truncateAddress(approval.transactionHash, 8, 8) : "N/A"}
            </span>
          </div>

        </div>

        {/* Action */}
        <div className="mt-8 pt-4 flex justify-end">
          <button
            onClick={() => onViewEvidence(approval.spender.address)}
            className="text-[10px] font-mono text-mangaatha-text-muted group-hover:text-mangaatha-mint uppercase tracking-widest flex items-center gap-2 transition-colors duration-200 focus-visible:outline-none focus-visible:text-mangaatha-mint cursor-pointer"
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
// Approval List
// ─────────────────────────────────────────────────────────

type ApprovalListProps = {
  approvals: Approval[];
  onViewEvidence: (spenderAddress: string) => void;
};

export default function ApprovalList({ approvals, onViewEvidence }: ApprovalListProps) {
  if (approvals.length === 0) {
    return (
      <div className="w-full py-16 px-6 text-center border border-dashed border-mangaatha-border bg-mangaatha-surface-alt/50 animate-fadeIn">
        <span className="text-mangaatha-safe text-2xl mb-4 block">✓</span>
        <h3 className="text-sm font-mono uppercase tracking-widest text-mangaatha-text mb-2">
          NO ACTIVE APPROVALS
        </h3>
        <p className="text-xs text-mangaatha-text-muted font-mono max-w-sm mx-auto">
          This address does not have any active token approvals.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[10px] font-mono text-mangaatha-text-muted tracking-widest uppercase">
          Active Approvals
          <span className="ml-2 px-1.5 py-0.5 bg-mangaatha-surface-alt text-mangaatha-text border border-mangaatha-border">
            {String(approvals.length).padStart(2, '0')}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
