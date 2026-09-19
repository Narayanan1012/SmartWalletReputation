// ─────────────────────────────────────────────────────────
// API layer (TRD §7 — API Integration Rule)
//
// Currently returns mock data.
// When the backend is ready, swap the mock import
// for a real fetch() call. No UI component rewrites needed.
// ─────────────────────────────────────────────────────────

import type { AnalysisResult } from "@/types/analysis";
import {
  mockAnalysis,
  mockEmptyAnalysis,
  mockPartialAnalysis,
} from "@/lib/mockData";

/** Simulates network delay */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Analyze an address.
 *
 * Currently returns mock data based on the input address.
 * Replace the body of this function with a real fetch when
 * the backend is ready — the rest of the app stays untouched.
 *
 * @example
 * // Future real implementation:
 * // const res = await fetch("/api/analyze", {
 * //   method: "POST",
 * //   headers: { "Content-Type": "application/json" },
 * //   body: JSON.stringify({ address }),
 * // });
 * // if (!res.ok) throw new Error("Analysis failed");
 * // return res.json();
 */
export async function analyzeAddress(address: string): Promise<AnalysisResult> {
  // Simulate network latency (2.5s for a realistic loading experience)
  await sleep(2500);

  // Return different mocks based on the address to test various UI states
  const lowerAddress = address.toLowerCase();

  // Empty / clean address (Uniswap Permit2)
  if (lowerAddress === "0x000000000022d473030f116ddee9f6b43ac78ba3") {
    return { ...mockEmptyAnalysis, address };
  }

  // Partial chain failure (Tether USDT)
  if (lowerAddress === "0xdac17f958d2ee523a2206206994597c13d831ec7") {
    return { ...mockPartialAnalysis, address };
  }

  // Default: full mock with findings
  return { ...mockAnalysis, address };
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
