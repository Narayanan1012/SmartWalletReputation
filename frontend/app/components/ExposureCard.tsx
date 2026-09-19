"use client";

import { useState, useMemo } from "react";
import type { Exposure } from "@/types/analysis";
import { truncateAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Exposure Cards (Revoke.cash inspired styling & functionality)
//
// Investigation alerts with high technical density:
// - Search filter by spender, token, or reason
// - Severity sort & filter
// - Configurable pagination: 10, 25 (default), 50, 100
// - 1-click address copy & block explorer links
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

function getExplorerUrl(contract: string, chain: string): string {
  const isBase = chain.toLowerCase().includes("base");
  return isBase
    ? `https://basescan.org/address/${contract}`
    : `https://etherscan.io/address/${contract}`;
}

type ExposureCardProps = {
  exposure: Exposure;
  onViewEvidence: (contractAddress: string) => void;
};

function ExposureCard({ exposure, onViewEvidence }: ExposureCardProps) {
  const config = STATUS_CONFIG[exposure.status];
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(exposure.contract);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = getExplorerUrl(exposure.contract, exposure.chain);

  return (
    <div className={`flex flex-col border ${config.border} ${config.bg} ${config.hover} transition-all duration-200 group`}>
      
      {/* Header Bar */}
      <div className={`flex items-center justify-between px-5 py-3 ${config.headerBg} border-b ${config.badgeBorder}`}>
        <div className={`flex items-center gap-2 text-[10px] font-mono font-semibold tracking-widest uppercase ${config.text}`}>
          <span className={exposure.status === 'potential' ? 'animate-pulse text-sm' : ''}>{config.icon}</span>
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
                SPENDER CONTRACT
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-mangaatha-text-sec truncate" title={exposure.contract}>
                  {truncateAddress(exposure.contract, 6, 4)}
                </span>
                
                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy address"
                  className="text-mangaatha-text-muted hover:text-mangaatha-text p-0.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <span className="text-[10px] font-mono text-mangaatha-mint">✓</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>

                {/* Block Explorer Link */}
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View on Explorer"
                  className="text-mangaatha-text-muted hover:text-mangaatha-mint p-0.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
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
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase">
            {exposure.status === 'potential' ? 'Action: Revoke permission' : 'Action: Review & monitor'}
          </span>
          <button
            type="button"
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
// Exposure List with Search, Filter, Sort & Pagination
// ─────────────────────────────────────────────────────────

type ExposureListProps = {
  exposures: Exposure[];
  onViewEvidence: (contractAddress: string) => void;
};

type SortOption = "severity-desc" | "severity-asc" | "token-asc" | "token-desc" | "chain";
type SeverityFilter = "all" | "potential" | "attention" | "informational";

export default function ExposureList({ exposures, onViewEvidence }: ExposureListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("severity-desc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter logic
  const filtered = useMemo(() => {
    return exposures.filter((exp) => {
      if (severityFilter !== "all" && exp.status !== severityFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        exp.token?.toLowerCase().includes(q) ||
        exp.contract.toLowerCase().includes(q) ||
        exp.reason.toLowerCase().includes(q) ||
        exp.chain.toLowerCase().includes(q)
      );
    });
  }, [exposures, severityFilter, searchQuery]);

  // Sort logic
  const sorted = useMemo(() => {
    const statusOrder: Record<string, number> = { potential: 0, attention: 1, informational: 2 };
    return [...filtered].sort((a, b) => {
      if (sortBy === "severity-desc") {
        return (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
      }
      if (sortBy === "severity-asc") {
        return (statusOrder[b.status] ?? 3) - (statusOrder[a.status] ?? 3);
      }
      if (sortBy === "token-asc") {
        return (a.token || "").localeCompare(b.token || "");
      }
      if (sortBy === "token-desc") {
        return (b.token || "").localeCompare(a.token || "");
      }
      if (sortBy === "chain") {
        return a.chain.localeCompare(b.chain);
      }
      return 0;
    });
  }, [filtered, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sorted.length);
  const paginatedExposures = sorted.slice(startIndex, endIndex);

  // Counts for pills
  const potentialCount = exposures.filter(e => e.status === "potential").length;
  const attentionCount = exposures.filter(e => e.status === "attention").length;
  const infoCount = exposures.filter(e => e.status === "informational").length;

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
    <div className="animate-fadeIn space-y-4">
      
      {/* ── Revoke.cash Style Controls Bar ── */}
      <div className="p-4 bg-mangaatha-surface border border-mangaatha-border space-y-4">
        
        {/* Top Controls: Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="w-4 h-4 text-mangaatha-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Spender, Token or Reason..."
              className="w-full pl-9 pr-4 py-2 bg-mangaatha-surface-alt border border-mangaatha-border text-xs font-mono text-mangaatha-text placeholder:text-mangaatha-text-muted/60 focus-visible:outline-none focus-visible:border-mangaatha-mint"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest whitespace-nowrap">
              Sort
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-mangaatha-surface-alt border border-mangaatha-border text-xs font-mono text-mangaatha-text px-3 py-2 cursor-pointer focus-visible:outline-none focus-visible:border-mangaatha-mint"
            >
              <option value="severity-desc">Severity: High to Low</option>
              <option value="severity-asc">Severity: Low to High</option>
              <option value="token-asc">Asset: A to Z</option>
              <option value="token-desc">Asset: Z to A</option>
              <option value="chain">Network</option>
            </select>
          </div>
        </div>

        {/* Filter Pills + Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-mangaatha-border/60">
          
          {/* Quick Severity Pills */}
          <div className="flex items-center gap-2 overflow-x-auto text-[10px] font-mono uppercase tracking-wider">
            <button
              type="button"
              onClick={() => { setSeverityFilter("all"); setCurrentPage(1); }}
              className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                severityFilter === "all"
                  ? "bg-mangaatha-mint/10 border-mangaatha-mint text-mangaatha-mint"
                  : "border-mangaatha-border text-mangaatha-text-muted hover:text-mangaatha-text"
              }`}
            >
              All ({exposures.length})
            </button>

            {potentialCount > 0 && (
              <button
                type="button"
                onClick={() => { setSeverityFilter("potential"); setCurrentPage(1); }}
                className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                  severityFilter === "potential"
                    ? "bg-mangaatha-exposure/20 border-mangaatha-exposure text-mangaatha-exposure font-bold"
                    : "border-mangaatha-exposure/30 text-mangaatha-exposure hover:bg-mangaatha-exposure/10"
                }`}
              >
                Critical ({potentialCount})
              </button>
            )}

            {attentionCount > 0 && (
              <button
                type="button"
                onClick={() => { setSeverityFilter("attention"); setCurrentPage(1); }}
                className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                  severityFilter === "attention"
                    ? "bg-mangaatha-attention/20 border-mangaatha-attention text-mangaatha-attention font-bold"
                    : "border-mangaatha-attention/30 text-mangaatha-attention hover:bg-mangaatha-attention/10"
                }`}
              >
                Needs Attention ({attentionCount})
              </button>
            )}

            {infoCount > 0 && (
              <button
                type="button"
                onClick={() => { setSeverityFilter("informational"); setCurrentPage(1); }}
                className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                  severityFilter === "informational"
                    ? "bg-mangaatha-info/20 border-mangaatha-info text-mangaatha-info font-bold"
                    : "border-mangaatha-info/30 text-mangaatha-info hover:bg-mangaatha-info/10"
                }`}
              >
                Informational ({infoCount})
              </button>
            )}
          </div>

          {/* Page size selector (Revoke.cash style: 10, 25, 50, 100) */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-mangaatha-text-muted">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-mangaatha-surface-alt border border-mangaatha-border text-[10px] font-mono text-mangaatha-text px-2 py-1 cursor-pointer focus-visible:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Status Bar & Result Count ── */}
      <div className="flex items-center justify-between px-1 text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest">
        <span>
          Showing {sorted.length > 0 ? startIndex + 1 : 0} to {endIndex} of {sorted.length} results
        </span>
        {totalPages > 1 && (
          <span>Page {validPage} of {totalPages}</span>
        )}
      </div>

      {/* ── Cards Grid ── */}
      {paginatedExposures.length === 0 ? (
        <div className="w-full py-12 px-4 text-center border border-dashed border-mangaatha-border bg-mangaatha-surface-alt/30">
          <p className="text-xs font-mono text-mangaatha-text-muted">
            No exposures match the selected search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paginatedExposures.map((exposure) => (
            <ExposureCard
              key={exposure.id}
              exposure={exposure}
              onViewEvidence={onViewEvidence}
            />
          ))}
        </div>
      )}

      {/* ── Pagination Controls Bar (Revoke.cash style) ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-mangaatha-border text-xs font-mono">
          <button
            type="button"
            disabled={validPage <= 1}
            onClick={() => setCurrentPage(1)}
            className="px-3 py-1.5 border border-mangaatha-border text-mangaatha-text-muted hover:text-mangaatha-text disabled:opacity-30 disabled:pointer-events-none cursor-pointer uppercase text-[10px] tracking-wider"
          >
            « First
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={validPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-mangaatha-border text-mangaatha-text-muted hover:text-mangaatha-text disabled:opacity-30 disabled:pointer-events-none cursor-pointer uppercase text-[10px] tracking-wider"
            >
              ‹ Previous
            </button>
            <span className="px-3 py-1.5 bg-mangaatha-surface border border-mangaatha-border text-mangaatha-mint text-[10px]">
              {validPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={validPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 border border-mangaatha-border text-mangaatha-text-muted hover:text-mangaatha-text disabled:opacity-30 disabled:pointer-events-none cursor-pointer uppercase text-[10px] tracking-wider"
            >
              Next ›
            </button>
          </div>

          <button
            type="button"
            disabled={validPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="px-3 py-1.5 border border-mangaatha-border text-mangaatha-text-muted hover:text-mangaatha-text disabled:opacity-30 disabled:pointer-events-none cursor-pointer uppercase text-[10px] tracking-wider"
          >
            Last »
          </button>
        </div>
      )}
    </div>
  );
}
