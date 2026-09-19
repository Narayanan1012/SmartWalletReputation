import { evaluateSingleExposure } from "../services/correlator.js";

/**
 * Milestone 13 Verification Test Suite:
 * Outlier & Anomaly Detection
 * 
 * Verifies that:
 * 1. Critical threats (EOA spenders) are strictly flagged as "potential" (RED).
 * 2. Anomaly & outlier signals (unverified contract, recently deployed, proxy contract, massive allowance)
 *    are categorized as "attention" (AMBER) without triggering false alarms.
 * 3. Normal verified protocol allowances remain cleanly in "informational" (BLUE).
 */

console.log("================================================================================");
console.log("TESTING MILESTONE 13: OUTLIER & ANOMALY DETECTION");
console.log("================================================================================\n");

let passed = 0;
let total = 0;

function assert(condition, testName, details = "") {
  total++;
  if (condition) {
    console.log(` [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (details) console.error(`       Details: ${details}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Case 1: EOA Spender (Revoke.cash ABC investigation case)
// ─────────────────────────────────────────────────────────────────────────────
const eoaApproval = {
  chain: "Base",
  token: { symbol: "ABC", address: "0xb91f48baf721a13d6e8da5e171a3ba1aacf13298" },
  spender: { address: "0x2758ed8fa6dac8dda5f07a2fa2ad63d41a96d919" },
  allowance: { type: "limited", raw: "300000000" },
  _spenderMeta: { isContract: false },
};
const eoaSecurity = {
  address: "0x2758ed8fa6dac8dda5f07a2fa2ad63d41a96d919",
  contractName: "EOA (Personal Wallet)",
  isContract: false,
  isEoa: true,
  isOpenSource: false,
  isTrustListed: false,
  riskLevel: "high",
  signals: ["Critical: Spender is an Externally Owned Account (EOA), not a smart contract."],
};
const eoaResult = evaluateSingleExposure(eoaApproval, { isActive: true, display: "300,000,000" }, eoaSecurity);
assert(eoaResult.status === "potential", "Case 1: EOA Spender flagged as 'potential' (RED)", `Got: ${eoaResult?.status}`);
assert(eoaResult.reason.includes("Externally Owned Account"), "Case 1: Reason explains EOA personal wallet hazard", `Got: ${eoaResult?.reason}`);

// ─────────────────────────────────────────────────────────────────────────────
// Test Case 2: Unverified / Closed-Source Contract Anomaly
// ─────────────────────────────────────────────────────────────────────────────
const unverifiedApproval = {
  chain: "Ethereum",
  token: { symbol: "DAI", address: "0x6b175474e89094c44da98b954eedeac495271d0f" },
  spender: { address: "0x1111111111111111111111111111111111111111" },
  allowance: { type: "limited", raw: "1000" },
};
const unverifiedSecurity = {
  address: "0x1111111111111111111111111111111111111111",
  contractName: "SecretRouter",
  isContract: true,
  isOpenSource: false,
  isTrustListed: false,
  riskLevel: "attention",
  signals: ["Unverified code: Contract is not open-source on explorer"],
};
const unverifiedResult = evaluateSingleExposure(unverifiedApproval, { isActive: true, display: "1,000" }, unverifiedSecurity);
assert(unverifiedResult.status === "attention", "Case 2: Unverified contract classified as 'attention' (AMBER)", `Got: ${unverifiedResult?.status}`);
assert(unverifiedResult.reason.includes("Unverified Contract"), "Case 2: Reason warns about unaudited closed-source code", `Got: ${unverifiedResult?.reason}`);

// ─────────────────────────────────────────────────────────────────────────────
// Test Case 3: Recently Deployed Contract Anomaly (< 30 days old)
// ─────────────────────────────────────────────────────────────────────────────
const newContractApproval = {
  chain: "Base",
  token: { symbol: "USDC", address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" },
  spender: { address: "0x2222222222222222222222222222222222222222" },
  allowance: { type: "limited", raw: "5000" },
};
const newContractSecurity = {
  address: "0x2222222222222222222222222222222222222222",
  contractName: "FreshYieldPool",
  isContract: true,
  isOpenSource: true,
  isTrustListed: false,
  riskLevel: "attention",
  signals: ["Anomaly: Recently deployed contract (5 days old). Limited battle-testing history."],
};
const newContractResult = evaluateSingleExposure(newContractApproval, { isActive: true, display: "5,000" }, newContractSecurity);
assert(newContractResult.status === "attention", "Case 3: Recently deployed contract classified as 'attention'", `Got: ${newContractResult?.status}`);
assert(newContractResult.reason.includes("Recently deployed"), "Case 3: Reason explicitly flags new contract anomaly", `Got: ${newContractResult?.reason}`);

// ─────────────────────────────────────────────────────────────────────────────
// Test Case 4: Upgradeable Proxy Contract Anomaly
// ─────────────────────────────────────────────────────────────────────────────
const proxyApproval = {
  chain: "Ethereum",
  token: { symbol: "USDT", address: "0xdac17f958d2ee523a2206206994597c13d831ec7" },
  spender: { address: "0x3333333333333333333333333333333333333333" },
  allowance: { type: "limited", raw: "1000" },
};
const proxySecurity = {
  address: "0x3333333333333333333333333333333333333333",
  contractName: "ProxyVault",
  isContract: true,
  isOpenSource: true,
  isTrustListed: false,
  riskLevel: "attention",
  signals: ["Upgradeable Proxy: Spender contract logic can be modified dynamically by admin keys"],
};
const proxyResult = evaluateSingleExposure(proxyApproval, { isActive: true, display: "1,000" }, proxySecurity);
assert(proxyResult.status === "attention", "Case 4: Upgradeable Proxy flagged as 'attention'", `Got: ${proxyResult?.status}`);
assert(proxyResult.reason.includes("Upgradeable Proxy"), "Case 4: Reason alerts on admin mutation ability", `Got: ${proxyResult?.reason}`);

// ─────────────────────────────────────────────────────────────────────────────
// Test Case 5: Abnormally Massive Allowance Anomaly (> 1 Billion tokens)
// ─────────────────────────────────────────────────────────────────────────────
const massiveApproval = {
  chain: "Ethereum",
  token: { symbol: "SHIB", address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce" },
  spender: { address: "0x4444444444444444444444444444444444444444" },
  allowance: { type: "limited", raw: "5000000000" },
};
const massiveSecurity = {
  address: "0x4444444444444444444444444444444444444444",
  contractName: "CustomDEX",
  isContract: true,
  isOpenSource: true,
  isTrustListed: false,
  riskLevel: "safe",
  signals: ["Verified source: Contract is publicly verified and open-source"],
};
const massiveResult = evaluateSingleExposure(massiveApproval, { isActive: true, display: "5,000,000,000" }, massiveSecurity);
assert(massiveResult.status === "attention", "Case 5: Abnormally massive allowance flagged as 'attention'", `Got: ${massiveResult?.status}`);
assert(massiveResult.reason.includes("Allowance Anomaly"), "Case 5: Reason highlights unusual allowance size", `Got: ${massiveResult?.reason}`);

// ─────────────────────────────────────────────────────────────────────────────
// Test Case 6: Clean Verified Protocol with Unlimited Allowance (No False Alarm)
// ─────────────────────────────────────────────────────────────────────────────
const permit2Approval = {
  chain: "Ethereum",
  token: { symbol: "WETH", address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" },
  spender: { address: "0x000000000022d473030f116ddee9f6b43ac78ba3" },
  allowance: { type: "unlimited", raw: "Unlimited" },
};
const permit2Security = {
  address: "0x000000000022d473030f116ddee9f6b43ac78ba3",
  contractName: "Permit2",
  isContract: true,
  isOpenSource: true,
  isTrustListed: true,
  riskLevel: "safe",
  signals: ["Verified source: Contract is publicly verified and open-source"],
};
const permit2Result = evaluateSingleExposure(permit2Approval, { isActive: true, isUnlimited: true, display: "Unlimited" }, permit2Security);
assert(permit2Result.status === "informational", "Case 6: Clean Protocol Unlimited Allowance categorized as 'informational' (BLUE)", `Got: ${permit2Result?.status}`);

// ─────────────────────────────────────────────────────────────────────────────
// Test Case 7: Clean Verified Protocol with Limited Normal Allowance
// ─────────────────────────────────────────────────────────────────────────────
const safeApproval = {
  chain: "Ethereum",
  token: { symbol: "USDC", address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
  spender: { address: "0x000000000022d473030f116ddee9f6b43ac78ba3" },
  allowance: { type: "limited", raw: "500" },
};
const safeResult = evaluateSingleExposure(safeApproval, { isActive: true, isUnlimited: false, display: "500" }, permit2Security);
assert(safeResult.status === "informational", "Case 7: Normal safe limited allowance categorized as 'informational'", `Got: ${safeResult?.status}`);

console.log("\n================================================================================");
console.log(`RESULTS: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
console.log("================================================================================");

if (passed === total) {
  console.log(" MILESTONE 13 COMPLETE: All anomaly, outlier, and EOA rules verified!\n");
} else {
  process.exit(1);
}
