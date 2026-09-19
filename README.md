# SmartWallet Reputation

> Web3 Wallet & Smart Contract Security Investigation Platform

An explainable Web3 security platform that analyzes wallet and smart contract activity, active permissions, and contract relationships to uncover potential security exposures.

---

## 🎯 Project Overview

Instead of presenting an arbitrary risk score, **SmartWallet Reputation** answers the fundamental question:

> *"Why are you showing me this warning?"*

By tracing the relationship chain:
$$\text{Wallet} \longrightarrow \text{Active Approval} \longrightarrow \text{Contract} \longrightarrow \text{Security Signal} \longrightarrow \text{Potential Exposure}$$

Users can understand their actual exposure and verify the evidence behind any security finding.

---

## 📁 Repository Structure

```text
SmartWalletReputation/
├── .gitignore             # Root gitignore (frontend & future backend rules)
├── README.md              # Project documentation
│
├── frontend/              # Next.js 16 (App Router) + Tailwind CSS + TypeScript
│   ├── app/
│   │   ├── components/
│   │   │   └── AddressInput.tsx   # Large centered address search input
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Main landing page
│   │   └── globals.css
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
└── backend/               # (Planned) Node.js + Express + Alchemy & GoPlus APIs
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v20+` or `v22+`
- npm `v10+`

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✨ Features Implemented

- [x] **Next.js & Tailwind CSS Setup**: App Router architecture configured with TypeScript and Tailwind CSS.
- [x] **Large Centered Search Bar**: Clean and responsive address input component in the middle of the landing page.
- [x] **Address Validation**: EVM address format verification (`0x...` 42-character check) with interactive feedback.
- [x] **Sample Quick-Select**: 1-click test fill for common addresses (`vitalik.eth`, `Uniswap Permit2`, `Tether`).
- [x] **Web3 Dark Theme**: Polished interface with responsive layouts, subtle glowing accents, and modern typography.

---

## 🔮 Roadmap

- [ ] **Analysis Loading State**: Staged progress indicator simulating address validation, approval scanning, and signal retrieval.
- [ ] **Results Dashboard**: Detailed breakdown of active approvals, spenders, token allowances, and exposure flags.
- [ ] **Evidence Chain View**: Visual step-by-step reasoning explaining why a specific finding was triggered.
- [ ] **Relationship Explorer**: 2D/3D interactive visual graph connecting wallets, approvals, and smart contracts.
- [ ] **Backend Integration**: Express API combining Alchemy blockchain logs and GoPlus security data.