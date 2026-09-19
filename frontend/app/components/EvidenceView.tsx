"use client";

import { useState } from "react";
import type { Evidence } from "@/types/analysis";
import { truncateAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Evidence View (PRD §P0 — Evidence View)
//
// The most important frontend feature.
// Shows the causal chain:
//   WALLET → APPROVAL → CONTRACT → SECURITY SIGNAL → EXPOSURE
//
// Rendered as a slide-over panel with connected vertical nodes.
// ─────────────────────────────────────────────────────────

type Props = {
  evidence: Evidence;
  onClose: () => void;
};

type ChainNode = {
  id: string;
  label: string;
  detail: string | string[];
  icon: "wallet" | "approval" | "contract" | "signal" | "exposure";
  status: "safe" | "warning" | "danger" | "neutral";
};

function buildChainNodes(evidence: Evidence): ChainNode[] {
  const nodes: ChainNode[] = [];

  // 1. Wallet
  nodes.push({
    id: "wallet",
    label: "Wallet",
    detail: truncateAddress(evidence.wallet),
    icon: "wallet",
    status: "neutral",
  });

  // 2. Approval
  const approvalDetails: string[] = [];
  if (evidence.token) approvalDetails.push(`Token: ${evidence.token}`);
  if (evidence.approval?.amount)
    approvalDetails.push(`Amount: ${evidence.approval.amount}`);
  if (evidence.approval?.date)
    approvalDetails.push(`Date: ${evidence.approval.date}`);
  if (evidence.approval?.transaction)
    approvalDetails.push(
      `Tx: ${truncateAddress(evidence.approval.transaction, 10, 6)}`
    );

  nodes.push({
    id: "approval",
    label: evidence.token ? `Approved ${evidence.token}` : "Approval",
    detail: approvalDetails.length > 0 ? approvalDetails : "Token approval granted",
    icon: "approval",
    status: "neutral",
  });

  // 3. Contract / Spender
  nodes.push({
    id: "contract",
    label: "Contract",
    detail: truncateAddress(evidence.spender),
    icon: "contract",
    status: "neutral",
  });

  // 4. Security Signals
  if (evidence.contract?.signals && evidence.contract.signals.length > 0) {
    nodes.push({
      id: "signal",
      label: "Security Signals",
      detail: evidence.contract.signals,
      icon: "signal",
      status:
        evidence.exposure?.status === "potential" ? "danger" : "warning",
    });
  }

  // 5. Exposure
  if (evidence.exposure) {
    nodes.push({
      id: "exposure",
      label:
        evidence.exposure.status === "potential"
          ? "Potential Exposure"
          : evidence.exposure.status === "informational"
            ? "Informational"
            : "Exposure",
      detail: evidence.exposure.reason,
      icon: "exposure",
      status:
        evidence.exposure.status === "potential"
          ? "danger"
          : evidence.exposure.status === "informational"
            ? "safe"
            : "warning",
    });
  }

  return nodes;
}

const STATUS_COLORS = {
  safe: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    line: "bg-emerald-500/25",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    line: "bg-amber-500/25",
  },
  danger: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
    line: "bg-red-500/25",
  },
  neutral: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    line: "bg-blue-500/25",
  },
};

function NodeIcon({ icon, status }: { icon: ChainNode["icon"]; status: ChainNode["status"] }) {
  const colors = STATUS_COLORS[status];

  const iconPaths: Record<string, string> = {
    wallet:
      "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    approval: "M5 13l4 4L19 7",
    contract:
      "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    signal:
      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
    exposure:
      "M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  };

  return (
    <div
      className={`w-10 h-10 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}
    >
      <svg
        className={`w-5 h-5 ${colors.text}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={iconPaths[icon]}
        />
      </svg>
    </div>
  );
}

export default function EvidenceView({ evidence, onClose }: Props) {
  const nodes = buildChainNodes(evidence);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:max-w-lg z-50 flex">
        <div className="w-full bg-neutral-950 border-l border-neutral-800 overflow-y-auto flex flex-col animate-slideIn">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-neutral-950 border-b border-neutral-800 px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Evidence Chain
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Why this finding was generated
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Close evidence view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Evidence chain */}
          <div className="flex-1 px-6 py-8">
            <div className="relative">
              {nodes.map((node, idx) => {
                const colors = STATUS_COLORS[node.status];
                const isLast = idx === nodes.length - 1;
                const isExpanded = expandedNode === node.id;
                const detailArray = Array.isArray(node.detail)
                  ? node.detail
                  : [node.detail];

                return (
                  <div key={node.id} className="relative">
                    {/* Connecting line — flat solid */}
                    {!isLast && (
                      <div
                        className={`absolute left-5 top-10 w-0.5 ${colors.line}`}
                        style={{ height: "calc(100% - 8px)" }}
                      />
                    )}

                    {/* Node */}
                    <button
                      onClick={() =>
                        setExpandedNode(isExpanded ? null : node.id)
                      }
                      className={`relative flex items-start gap-4 w-full text-left p-3 -ml-3 rounded-lg transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        isExpanded
                          ? "bg-neutral-900 border border-neutral-800"
                          : "hover:bg-neutral-900/60"
                      }`}
                    >
                      <NodeIcon icon={node.icon} status={node.status} />

                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">
                            {node.label}
                          </span>
                          <svg
                            className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-150 ${
                              isExpanded ? "rotate-90" : ""
                            }`}
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

                        {/* Collapsed preview — first detail line */}
                        {!isExpanded && (
                          <p className="text-neutral-500 text-xs mt-0.5 truncate">
                            {detailArray[0]}
                          </p>
                        )}

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="mt-2 space-y-1.5 animate-fadeIn">
                            {detailArray.map((line, i) => (
                              <div
                                key={i}
                                className={`flex items-start gap-2 text-xs ${
                                  node.status === "danger"
                                    ? "text-red-300/90"
                                    : node.status === "warning"
                                      ? "text-amber-300/90"
                                      : "text-neutral-300"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${colors.bg}`}
                                />
                                <span className="leading-relaxed">{line}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Spacer between nodes */}
                    {!isLast && <div className="h-4" />}
                  </div>
                );
              })}
            </div>

            {/* Flow direction indicator */}
            <div className="mt-8 flex items-center justify-center gap-2 text-neutral-600 text-xs">
              <div className="h-px w-12 bg-neutral-800" />
              <span>Evidence flows top to bottom</span>
              <div className="h-px w-12 bg-neutral-800" />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-neutral-950 border-t border-neutral-800 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium border border-neutral-700 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
