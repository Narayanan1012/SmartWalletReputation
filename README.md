# SmartWallet Reputation

Web3 Wallet and Smart Contract Security Investigation Platform.

SmartWallet Reputation is an explainable blockchain security platform that investigates EVM wallet addresses, evaluates active token approvals across multiple chains, audits spender contract bytecode, and produces auditable evidence chains connecting permissions to real-world security exposures.

---

## Overview

Traditional blockchain explorers provide fragmented transaction logs and raw bytecode without context. Security tools often present opaque numerical scores without explaining why a warning exists.

SmartWallet Reputation replaces arbitrary risk scores with a deterministic **Evidence Chain**:

$$\text{Target Wallet} \longrightarrow \text{Active Approval} \longrightarrow \text{Spender Entity} \longrightarrow \text{Security Signals} \longrightarrow \text{Potential Exposure}$$

The platform operates on strict security principles:
* **100% Read-Only:** Zero private keys, zero signature requests, and zero transaction execution.
* **Deterministic Rules:** Auditable, reproducible classification heuristics rather than non-deterministic models.
* **Multi-Chain Native:** Concurrent approval discovery and live on-chain verification across Ethereum (Chain ID: 1) and Base (Chain ID: 8453).

---

## Architecture

* **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, custom dark investigative theme, responsive tabbed dashboard, interactive relationship graph, and slide-over evidence view.
* **Backend Engine:** Node.js, Express, Alchemy JSON-RPC, GoPlus Security Intelligence, in-memory caching layer, deterministic correlation engine, and anomaly detection heuristics.

---

## Getting Started

### Prerequisites
* Node.js version 20 or higher
* npm version 10 or higher

---

### Environment Setup

The repository includes a `backend/.env.example` template:

```bash
cd backend
cp .env.example .env
```

Contents of `backend/.env`:
```env
PORT=4000
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

**Note for Evaluation:**
* If `ALCHEMY_API_KEY` is omitted or empty, the backend automatically routes requests through public fallback RPC endpoints (`https://ethereum-rpc.publicnode.com` and `https://mainnet.base.org`). No external account registration is strictly required to test core functionality.
* GoPlus Security APIs used by the backend operate on open public endpoints without requiring an API key.

---

### Installation and Running

#### 1. Start the Backend Service
In a terminal window:
```bash
cd backend
npm install
npm run dev
```
The backend server will start on `http://localhost:4000`.  
Verify health by visiting: `http://localhost:4000/api/health` (returns `{"status":"ok"}`).

#### 2. Start the Frontend Application
In a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## How to Use the Platform

1. **Enter an EVM Address:**
   Paste any 42-character Ethereum or Base address (`0x...`) into the search bar, or select one of the provided quick-test fixtures.
2. **Review the Investigation Summary:**
   The Overview tab displays verified address type (Wallet vs. Contract), active chains scanned, total approvals, and prioritized exposures.
3. **Inspect Active Permissions:**
   The Approvals tab lists all token permissions discovered across Ethereum and Base, displaying live on-chain allowance balances verified directly against the blockchain.
4. **Evaluate Potential Exposures:**
   The Exposures tab categorizes permissions based on threat level:
   * **Potential Exposure (Red):** Critical hazards requiring immediate revocation (e.g., approvals granted to personal wallets/EOAs, contracts with approval abuse code, or blacklisted addresses).
   * **Needs Attention (Amber):** Non-fatal anomalies (unverified/closed-source contracts, upgradeable proxies, recently deployed code, or unusually massive token allowances).
   * **Informational (Blue):** Verified open-source protocols with active allowances (standard advisory to monitor or cap permissions).
5. **Trace Evidence:**
   Clicking "Trace Evidence" on any exposure opens a slide-over panel displaying the full factual breadcrumb: wallet address, token symbol, approval transaction hash, date, verified live allowance, detected contract security signals, and the deterministic rule triggered.
6. **Explore Relationship Graph:**
   The Relationships tab visualizes connections between the analyzed wallet, approved spenders, tokens, and counterparties.

---

## Verified Test Addresses for Evaluation

The following addresses can be used to evaluate specific system capabilities:

### 1. Phishing / EOA Spender Hazard
* **Address:** `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` (vitalik.eth)
* **What to observe:**
  * Multi-chain discovery identifying 30+ approvals on Base.
  * Spender `0x2758EdF460a8276f571C40a1E4B384B2F596d919` holding an active allowance for token **ABC**.
  * The system identifies that the spender is an **Externally Owned Account (EOA personal wallet)**, not a smart contract, and elevates the finding to **Potential Exposure (Red)** because the private key holder can execute `transferFrom` directly at any time.

### 2. Active DeFi Protocol Permissions
* **Address:** `0x55FE002aefF02F77364de339a1292923A15844b8`
* **What to observe:**
  * Multi-token approvals interacting with MakerDAO and Uniswap.
  * Live allowance verification distinguishing between unlimited and capped permissions.

### 3. Clean Protocol Baseline (Zero False Alarms)
* **Address:** `0x000000000022D473030F116dDEE9F6B43aC78BA3` (Uniswap Permit2)
* **What to observe:**
  * Verified open-source code with zero backdoors.
  * Categorized as safe without false alarm alerts.

---

## Verification Test Scripts

The backend includes automated test suites located in `backend/src/scripts/`:

```bash
# Run Milestone 13 Outlier and Anomaly verification test suite (12 assertions)
node backend/src/scripts/test-milestone13.js

# Test deterministic correlation engine
node backend/src/scripts/test-correlation.js

# Test GoPlus contract security lookups
node backend/src/scripts/test-security.js

# Test live ERC-20 eth_call allowance verification
node backend/src/scripts/test-allowance.js
```

---

## License

Built for the Multipli Hackathon 2026.
