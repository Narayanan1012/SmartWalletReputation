// ─────────────────────────────────────────────────────────
// Shared frontend types for the Wallet & Contract Reputation app
// Based on the TRD §4 — Shared Frontend Types
// ─────────────────────────────────────────────────────────

/** Status of analysis for a single chain */
export type ChainResult = {
  chain: string;
  status: "success" | "partial" | "error";
};

/** A single token approval */
export type Approval = {
  id: string;
  chain: string;
  token: {
    address: string;
    symbol: string;
    name?: string;
  };
  spender: {
    address: string;
    label?: string;
  };
  allowance: {
    type: "unlimited" | "limited";
    raw?: string;
  };
  approvedAt?: string;
  transactionHash?: string;
};

/** A potential security exposure */
export type Exposure = {
  id: string;
  chain: string;
  token?: string;
  contract: string;
  status: "informational" | "attention" | "potential";
  reason: string;
};

/** Evidence chain linking wallet → approval → contract → signal → exposure */
export type Evidence = {
  id: string;
  wallet: string;
  token?: string;
  spender: string;
  approval?: {
    amount?: string;
    transaction?: string;
    date?: string;
  };
  contract?: {
    address: string;
    signals: string[];
  };
  exposure?: {
    status: string;
    reason: string;
  };
};

/** A relationship between entities (for the graph explorer) */
export type Relationship = {
  id: string;
  from: string;
  fromLabel: string;
  to: string;
  toLabel: string;
  type: "approved" | "interacted" | "received" | "deployed";
  token?: string;
  chain: string;
};

/** Top-level analysis result returned by the backend / mock */
export type AnalysisResult = {
  address: string;
  addressType?: "wallet" | "contract" | "unknown";
  chains: ChainResult[];
  approvals: Approval[];
  exposures: Exposure[];
  evidence: Evidence[];
  relationships: Relationship[];
};

/** Application-level screen states */
export type AppState = "idle" | "loading" | "results" | "error";
