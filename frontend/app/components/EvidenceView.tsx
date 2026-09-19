"use client";

import { useState, useEffect } from "react";
import type { Evidence } from "@/types/analysis";
import { truncateAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Evidence View (PRD §15 — Evidence View)
//
// Premium investigation timeline.
// Numbered evidence steps, vertical tracking lines,
// explicit technical typographic hierarchy.
// No flashy animated backgrounds here to preserve readability.
// ─────────────────────────────────────────────────────────

type Props = {
  evidence: Evidence;
  onClose: () => void;
};

type TimelineNode = {
  id: string;
  step: string;
  label: string;
  detail: string | string[];
  connectionText?: string;
  status: "safe" | "warning" | "danger" | "neutral";
};

function buildTimelineNodes(evidence: Evidence): TimelineNode[] {
  const nodes: TimelineNode[] = [];
  let stepCounter = 1;

  // 1. Wallet
  nodes.push({
    id: "wallet",
    step: String(stepCounter++).padStart(2, "0"),
    label: "WALLET",
    detail: evidence.wallet,
    connectionText: "approved",
    status: "neutral",
  });

  // 2. Approval
  const approvalDetails: string[] = [];
  if (evidence.approval?.amount)
    approvalDetails.push(`Allowance: ${evidence.approval.amount}`);
  if (evidence.approval?.date)
    approvalDetails.push(`Date: ${evidence.approval.date}`);
  if (evidence.approval?.transaction)
    approvalDetails.push(`Tx: ${evidence.approval.transaction}`);

  nodes.push({
    id: "approval",
    step: String(stepCounter++).padStart(2, "0"),
    label: evidence.token ? `${evidence.token} APPROVAL` : "TOKEN APPROVAL",
    detail: approvalDetails.length > 0 ? approvalDetails : "Granted permission to external entity",
    connectionText: "authorized spender",
    status: "neutral",
  });

  // 3. Contract / Spender
  nodes.push({
    id: "contract",
    step: String(stepCounter++).padStart(2, "0"),
    label: "CONTRACT",
    detail: evidence.spender,
    connectionText: evidence.contract?.signals?.length ? "security signal" : "relationship formed",
    status: "neutral",
  });

  // 4. Security Signals
  if (evidence.contract?.signals && evidence.contract.signals.length > 0) {
    nodes.push({
      id: "signal",
      step: String(stepCounter++).padStart(2, "0"),
      label: "SECURITY SIGNAL",
      detail: evidence.contract.signals,
      connectionText: "resulted in",
      status: evidence.exposure?.status === "potential" ? "danger" : "warning",
    });
  }

  // 5. Exposure
  if (evidence.exposure) {
    nodes.push({
      id: "exposure",
      step: String(stepCounter++).padStart(2, "0"),
      label:
        evidence.exposure.status === "potential" ? "POTENTIAL EXPOSURE" :
        evidence.exposure.status === "informational" ? "INFORMATIONAL" :
        "EXPOSURE",
      detail: evidence.exposure.reason,
      status:
        evidence.exposure.status === "potential" ? "danger" :
        evidence.exposure.status === "informational" ? "safe" : "warning",
    });
  }

  return nodes;
}

const STATUS_COLORS = {
  safe: {
    text: "text-mangaatha-safe",
    border: "border-mangaatha-safe/30",
    line: "bg-mangaatha-safe/30",
    glow: "shadow-[0_0_15px_rgba(74,222,128,0.15)]",
  },
  warning: {
    text: "text-mangaatha-attention",
    border: "border-mangaatha-attention/30",
    line: "bg-mangaatha-attention/30",
    glow: "shadow-[0_0_15px_rgba(251,191,36,0.15)]",
  },
  danger: {
    text: "text-mangaatha-exposure",
    border: "border-mangaatha-exposure/30",
    line: "bg-mangaatha-exposure/30",
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
  },
  neutral: {
    text: "text-mangaatha-text",
    border: "border-mangaatha-border",
    line: "bg-mangaatha-border",
    glow: "",
  },
};

export default function EvidenceView({ evidence, onClose }: Props) {
  const nodes = buildTimelineNodes(evidence);
  
  // Stagger entry animation
  const [mountedNodes, setMountedNodes] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setMountedNodes(prev => {
        if (prev >= nodes.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 150); // 150ms stagger
    return () => clearInterval(timer);
  }, [nodes.length]);

  return (
    <>
      {/* Darkened backdrop */}
      <div
        className="fixed inset-0 bg-[#050608]/90 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div className="absolute inset-y-0 right-0 w-full sm:max-w-xl pointer-events-auto flex shadow-2xl">
          <div className="w-full h-dvh bg-mangaatha-surface border-l border-mangaatha-border flex flex-col overflow-hidden animate-slideIn">
            
            {/* Header */}
            <div className="flex-shrink-0 bg-mangaatha-surface border-b border-mangaatha-border px-6 py-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-[10px] font-mono text-mangaatha-text-muted tracking-widest uppercase mb-1">
                  Forensic Analysis
                </h2>
                <h1 className="text-lg font-bold text-mangaatha-text tracking-widest uppercase font-sans">
                  EVIDENCE TRACE
                </h1>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-2 border border-mangaatha-border text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest hover:text-mangaatha-text hover:border-mangaatha-text-muted transition-colors duration-200 focus-visible:outline-none focus-visible:border-mangaatha-mint"
                aria-label="Close evidence trace"
              >
                CLOSE [ESC]
              </button>
            </div>

            {/* Timeline Content - ONLY SCROLLABLE AREA */}
            <div 
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-8 py-10 relative"
              style={{ scrollbarGutter: "stable" }}
            >
              
              {/* Master guide line background (very faint) */}
              <div className="absolute left-[59px] top-10 bottom-10 w-px bg-mangaatha-border/30" />

              {nodes.map((node, idx) => {
                const isVisible = idx < mountedNodes;
                const isLast = idx === nodes.length - 1;
                const colors = STATUS_COLORS[node.status];
                const details = Array.isArray(node.detail) ? node.detail : [node.detail];

                return (
                  <div 
                    key={node.id} 
                    className={`relative flex items-start transition-all duration-500 ease-out ${
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                  >
                    
                    {/* Step Number */}
                    <div className={`w-8 pt-1 text-[10px] font-mono font-medium tracking-widest ${
                      node.status === 'neutral' ? 'text-mangaatha-text-muted' : colors.text
                    }`}>
                      {node.step}
                    </div>

                    {/* Vertical Track Area */}
                    <div className="relative w-8 flex flex-col items-center flex-shrink-0">
                      {/* Node Dot */}
                      <div className={`w-2 h-2 mt-1.5 rounded-full border ${colors.border} bg-mangaatha-surface z-10 ${colors.glow}`} />
                      
                      {/* Connection Line & Label */}
                      {!isLast && (
                        <div className="flex flex-col items-center mt-2 pb-6 min-h-[60px]">
                          <div className={`w-px flex-1 ${STATUS_COLORS[nodes[idx+1].status].line}`} />
                          <span className="text-mangaatha-text-muted text-[10px]">▼</span>
                        </div>
                      )}
                    </div>

                    {/* Content Box */}
                    <div className={`flex-1 pb-10 ${isLast ? 'pb-4' : ''}`}>
                      <h3 className={`text-sm font-semibold tracking-widest uppercase mb-2 ${colors.text}`}>
                        {node.label}
                      </h3>
                      
                      <div className={`p-4 border ${colors.border} bg-mangaatha-surface-alt/30`}>
                        {details.map((detail, i) => {
                          // Check if detail is an address by length/prefix
                          const isAddress = detail.startsWith('0x') && detail.length > 20;
                          return (
                            <div key={i} className={`text-xs font-mono mb-1 last:mb-0 ${
                              node.status === 'neutral' ? 'text-mangaatha-text-sec' : colors.text
                            }`}>
                              {isAddress ? detail : detail}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Connection Text (e.g. 'approved', 'authorized spender') */}
                      {!isLast && node.connectionText && (
                        <div className="mt-4 flex items-center gap-4 text-[10px] font-mono text-mangaatha-text-muted tracking-widest uppercase">
                          <span>│</span>
                          <span className="italic">{node.connectionText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
