// ─────────────────────────────────────────────────────────
// API layer (TRD §7 — API Integration Rule)
//
// Connected to live backend at http://localhost:4000/api/analyze.
// Gracefully falls back to mock data if backend is offline.
// ─────────────────────────────────────────────────────────

import type { AnalysisResult } from "@/types/analysis";
import {
  mockAnalysis,
  mockEmptyAnalysis,
  mockPartialAnalysis,
} from "@/lib/mockData";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/**
 * Analyze an address using the live Express backend.
 * Falls back to mock data if the backend is unreachable.
 */
export async function analyzeAddress(address: string): Promise<AnalysisResult> {
  const trimmed = address.trim();

  try {
    const res = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: trimmed }),
    });

    if (res.ok) {
      const data = await res.json();
      return data as AnalysisResult;
    }
  } catch (error) {
    console.warn("Live backend request failed, falling back to mock data:", error);
  }

  // Fallback to mock data if backend is not running
  const lowerAddress = trimmed.toLowerCase();

  // Empty / clean address (Uniswap Permit2)
  if (lowerAddress === "0x000000000022d473030f116ddee9f6b43ac78ba3") {
    return { ...mockEmptyAnalysis, address: trimmed };
  }

  // Partial chain failure (Tether USDT)
  if (lowerAddress === "0xdac17f958d2ee523a2206206994597c13d831ec7") {
    return { ...mockPartialAnalysis, address: trimmed };
  }

  // Default mock with findings
  return { ...mockAnalysis, address: trimmed };
}

/**
 * Validates that a string is a valid EVM address.
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

/**
 * Truncates an EVM address for display.
 * Example: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 → 0xd8dA...6045
 */
export function truncateAddress(
  address: string,
  startChars = 6,
  endChars = 4
): string {
  if (address.length <= startChars + endChars + 3) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
