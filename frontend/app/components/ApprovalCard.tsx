"use client";

import { useState, useMemo } from "react";
import type { Approval } from "@/types/analysis";
import { truncateAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Approval Cards (Revoke.cash inspired styling & functionality)
//
// Technical security records for active token permissions:
// - Search filter by spender, token, or tx hash
// - Unlimited / Limited filter
// - Configurable pagination: 10, 25 (default), 50, 100
// - 1-click address copy & block explorer links
// ─────────────────────────────────────────────────────────

function getExplorerUrl(address: string, chain: string, type: "address" | "tx" = "address"): string {
  const isBase = chain.toLowerCase().includes("base");
  const baseDomain = isBase ? "https://basescan.org" : "https://etherscan.io";
  return `${baseDomain}/${type}/${address}`;
}

type ApprovalCardProps = {
  approval: Approval;
  onViewEvidence: (spenderAddress: string) => void;
};

function ApprovalCard({ approval, onViewEvidence }: ApprovalCardProps) {
  const isUnlimited = approval.allowance.type === "unlimited";
  const [copied, setCopied] = useState(false);

  const formattedDate = approval.approvedAt
    ? new Date(approval.approvedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(approval.spender.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const spenderExplorerUrl = getExplorerUrl(approval.spender.address, approval.chain, "address");
  const txExplorerUrl = approval.transactionHash
    ? getExplorerUrl(approval.transactionHash, approval.chain, "tx")
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
          <h3 className="text-sm font-semibold text-mangaatha-text flex items-center gap-2">
            <span>{approval.token.symbol}</span>
            {approval.token.name && approval.token.name !== approval.token.symbol && (
              <span className="text-xs font-normal text-mangaatha-text-muted">
                ({approval.token.name})
              </span>
            )}
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-mangaatha-text-sec truncate" title={approval.spender.address}>
              {truncateAddress(approval.spender.address, 10, 8)}
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
              href={spenderExplorerUrl}
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

        <div className="h-px w-full bg-mangaatha-border mb-6" />

        {/* Technical Data Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
          
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest mb-1.5">
              Verified Allowance
            </span>
            <span className={`text-xs font-mono font-medium truncate ${isUnlimited ? "text-mangaatha-attention font-bold" : "text-mangaatha-text"}`} title={approval.allowance.raw}>
              {isUnlimited ? "∞ Unlimited" : Number(approval.allowance.raw || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest mb-1.5">
              Approved Date
            </span>
            <span className="text-xs font-mono text-mangaatha-text-sec">
              {formattedDate || "Unknown"}
            </span>
          </div>

          <div className="flex flex-col col-span-2">
            <span className="text-[10px] font-mono text-mangaatha-text-muted uppercase tracking-widest mb-1.5">
              Approval Transaction
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-mangaatha-text-sec truncate" title={approval.transactionHash || ""}>
                {approval.transactionHash ? truncateAddress(approval.transactionHash, 8, 8) : "Initial Genesis Interaction"}
              </span>
              {txExplorerUrl && (
                <a
                  href={txExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Tx on Explorer"
                  className="text-mangaatha-text-muted hover:text-mangaatha-mint p-0.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Action */}
        <div className="mt-8 pt-4 flex justify-end">
          <button
            type="button"
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
// Approval List with Search, Filter, Sort & Pagination
// ─────────────────────────────────────────────────────────

type ApprovalListProps = {
  approvals: Approval[];
  onViewEvidence: (spenderAddress: string) => void;
};

type SortOption = "date-desc" | "date-asc" | "token-asc" | "token-desc" | "chain";
type TypeFilter = "all" | "unlimited" | "limited";

export default function ApprovalList({ approvals, onViewEvidence }: ApprovalListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter logic
  const filtered = useMemo(() => {
    return approvals.filter((appr) => {
      if (typeFilter !== "all" && appr.allowance.type !== typeFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        appr.token.symbol.toLowerCase().includes(q) ||
        (appr.token.name && appr.token.name.toLowerCase().includes(q)) ||
        appr.spender.address.toLowerCase().includes(q) ||
        (appr.spender.label && appr.spender.label.toLowerCase().includes(q)) ||
        (appr.transactionHash && appr.transactionHash.toLowerCase().includes(q)) ||
        appr.chain.toLowerCase().includes(q)
      );
    });
  }, [approvals, typeFilter, searchQuery]);

  // Sort logic
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "date-desc") {
        const timeA = a.approvedAt ? new Date(a.approvedAt).getTime() : 0;
        const timeB = b.approvedAt ? new Date(b.approvedAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === "date-asc") {
        const timeA = a.approvedAt ? new Date(a.approvedAt).getTime() : 0;
        const timeB = b.approvedAt ? new Date(b.approvedAt).getTime() : 0;
        return timeA - timeB;
      }
      if (sortBy === "token-asc") {
        return a.token.symbol.localeCompare(b.token.symbol);
      }
      if (sortBy === "token-desc") {
        return b.token.symbol.localeCompare(a.token.symbol);
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
  const paginatedApprovals = sorted.slice(startIndex, endIndex);

  // Counts for filters
  const unlimitedCount = approvals.filter(a => a.allowance.type === "unlimited").length;
  const limitedCount = approvals.filter(a => a.allowance.type === "limited").length;

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
              placeholder="Search by Spender, Token or Tx Hash..."
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
              <option value="date-desc">Last Updated: Newest First</option>
              <option value="date-asc">Last Updated: Oldest First</option>
              <option value="token-asc">Asset: A to Z</option>
              <option value="token-desc">Asset: Z to A</option>
              <option value="chain">Network</option>
            </select>
          </div>
        </div>

        {/* Filter Pills + Page Size */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-mangaatha-border/60">
          
          {/* Quick Allowance Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto text-[10px] font-mono uppercase tracking-wider">
            <button
              type="button"
              onClick={() => { setTypeFilter("all"); setCurrentPage(1); }}
              className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                typeFilter === "all"
                  ? "bg-mangaatha-mint/10 border-mangaatha-mint text-mangaatha-mint"
                  : "border-mangaatha-border text-mangaatha-text-muted hover:text-mangaatha-text"
              }`}
            >
              All ({approvals.length})
            </button>

            <button
              type="button"
              onClick={() => { setTypeFilter("unlimited"); setCurrentPage(1); }}
              className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                typeFilter === "unlimited"
                  ? "bg-mangaatha-attention/20 border-mangaatha-attention text-mangaatha-attention font-bold"
                  : "border-mangaatha-border text-mangaatha-text-muted hover:text-mangaatha-text"
              }`}
            >
              Unlimited ({unlimitedCount})
            </button>

            <button
              type="button"
              onClick={() => { setTypeFilter("limited"); setCurrentPage(1); }}
              className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                typeFilter === "limited"
                  ? "bg-mangaatha-surface-alt border-mangaatha-mint text-mangaatha-text font-bold"
                  : "border-mangaatha-border text-mangaatha-text-muted hover:text-mangaatha-text"
              }`}
            >
              Limited ({limitedCount})
            </button>
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
      {paginatedApprovals.length === 0 ? (
        <div className="w-full py-12 px-4 text-center border border-dashed border-mangaatha-border bg-mangaatha-surface-alt/30">
          <p className="text-xs font-mono text-mangaatha-text-muted">
            No active token approvals match the search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {paginatedApprovals.map((approval) => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
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
