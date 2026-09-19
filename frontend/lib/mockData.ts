// ─────────────────────────────────────────────────────────
// Mock data for frontend development (TRD §6)
// Build the complete UI with this before connecting backend.
// ─────────────────────────────────────────────────────────

import type { AnalysisResult } from "@/types/analysis";

/**
 * Realistic mock analysis result.
 * Contains 4 approvals, 1 exposure, 2 evidence items, and 4 relationships.
 */
export const mockAnalysis: AnalysisResult = {
  address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  addressType: "wallet",

  chains: [
    { chain: "Ethereum", status: "success" },
    { chain: "Base", status: "success" },
  ],

  approvals: [
    {
      id: "appr-1",
      chain: "Ethereum",
      token: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
      },
      spender: {
        address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        label: "Uniswap Router",
      },
      allowance: { type: "unlimited" },
      approvedAt: "2025-06-12T14:32:00Z",
      transactionHash:
        "0x9a1e2f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f",
    },
    {
      id: "appr-2",
      chain: "Ethereum",
      token: {
        address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        symbol: "USDT",
      },
      spender: {
        address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        label: "Uniswap V2 Router",
      },
      allowance: { type: "unlimited" },
      approvedAt: "2025-03-21T09:15:00Z",
      transactionHash:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    },
    {
      id: "appr-3",
      chain: "Base",
      token: {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        symbol: "USDC",
      },
      spender: {
        address: "0x2626664c2603336E57B271c5C0b26F421741e481",
        label: "Uniswap Universal Router",
      },
      allowance: { type: "limited", raw: "10000000000" },
      approvedAt: "2025-08-02T18:45:00Z",
      transactionHash:
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    },
    {
      id: "appr-4",
      chain: "Ethereum",
      token: {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
      },
      spender: {
        address: "0xDEF1CA1E0000000000000000000000000000DEAD",
      },
      allowance: { type: "unlimited" },
      approvedAt: "2024-11-30T22:10:00Z",
      transactionHash:
        "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
    },
  ],

  exposures: [
    {
      id: "exp-1",
      chain: "Ethereum",
      token: "DAI",
      contract: "0xDEF1CA1E0000000000000000000000000000DEAD",
      status: "potential",
      reason:
        "Spender contract is unverified on Etherscan and has not been audited. Unlimited approval granted to an unverified contract poses a significant risk.",
    },
  ],

  evidence: [
    {
      id: "evi-1",
      wallet: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      token: "DAI",
      spender: "0xDEF1CA1E0000000000000000000000000000DEAD",
      approval: {
        amount: "Unlimited",
        transaction:
          "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        date: "2024-11-30",
      },
      contract: {
        address: "0xDEF1CA1E0000000000000000000000000000DEAD",
        signals: [
          "Contract source code is not verified",
          "No known audit reports found",
          "Contract deployed less than 30 days before approval",
        ],
      },
      exposure: {
        status: "potential",
        reason:
          "Unlimited approval to an unverified, unaudited contract with recent deployment.",
      },
    },
    {
      id: "evi-2",
      wallet: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      token: "USDC",
      spender: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      approval: {
        amount: "Unlimited",
        transaction:
          "0x9a1e2f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f",
        date: "2025-06-12",
      },
      contract: {
        address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
        signals: ["Contract is verified", "Known protocol: Uniswap"],
      },
      exposure: {
        status: "informational",
        reason:
          "Unlimited approval to a verified, well-known protocol. Low risk but worth monitoring.",
      },
    },
  ],

  relationships: [
    {
      id: "rel-1",
      from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      fromLabel: "Your Wallet",
      to: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      toLabel: "Uniswap Router",
      type: "approved",
      token: "USDC",
      chain: "Ethereum",
    },
    {
      id: "rel-2",
      from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      fromLabel: "Your Wallet",
      to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      toLabel: "Uniswap V2 Router",
      type: "approved",
      token: "USDT",
      chain: "Ethereum",
    },
    {
      id: "rel-3",
      from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      fromLabel: "Your Wallet",
      to: "0x2626664c2603336E57B271c5C0b26F421741e481",
      toLabel: "Uniswap Universal Router",
      type: "approved",
      token: "USDC",
      chain: "Base",
    },
    {
      id: "rel-4",
      from: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      fromLabel: "Your Wallet",
      to: "0xDEF1CA1E0000000000000000000000000000DEAD",
      toLabel: "Unknown Contract",
      type: "approved",
      token: "DAI",
      chain: "Ethereum",
    },
  ],
};

/**
 * Mock for an address with NO findings (empty state testing).
 */
export const mockEmptyAnalysis: AnalysisResult = {
  address: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  addressType: "contract",
  chains: [
    { chain: "Ethereum", status: "success" },
    { chain: "Base", status: "success" },
  ],
  approvals: [],
  exposures: [],
  evidence: [],
  relationships: [],
};

/**
 * Mock for partial chain failure (error state testing).
 */
export const mockPartialAnalysis: AnalysisResult = {
  address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  addressType: "contract",
  chains: [
    { chain: "Ethereum", status: "success" },
    { chain: "Base", status: "error" },
  ],
  approvals: [
    {
      id: "appr-p1",
      chain: "Ethereum",
      token: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
      },
      spender: {
        address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        label: "Uniswap V2 Router",
      },
      allowance: { type: "limited", raw: "5000000000" },
    },
  ],
  exposures: [],
  evidence: [],
  relationships: [
    {
      id: "rel-p1",
      from: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      fromLabel: "Tether Contract",
      to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
      toLabel: "Uniswap V2 Router",
      type: "interacted",
      chain: "Ethereum",
    },
  ],
};
