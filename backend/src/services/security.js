/**
 * GoPlus Smart Contract Security Intelligence Service
 *
 * Web3 Concept: Spender Security Signals
 * When an address approves a spender contract, we inspect the contract to answer:
 * 1. Is it open-source (verified on Etherscan/Basescan)?
 * 2. Does it have dangerous backdoors (privilege withdraw, selfdestruct, approval abuse)?
 * 3. Is it flagged on blacklists, phishing databases, or doubt lists?
 */

const CHAIN_IDS = {
  ethereum: "1",
  base: "8453",
};

// In-memory cache for contract security profiles to eliminate redundant API calls and avoid 4029 rate limits
const securityCache = new Map();

/**
 * Queries GoPlus Security for contract-level and address-level security signals.
 *
 * @param {string} spenderAddress - Contract address to analyze
 * @param {string} chain - "ethereum" or "base"
 * @param {Object} [fallbackMeta] - Known spender metadata from approval discovery
 * @returns {Promise<Object>} Normalized Contract Security profile
 */
export async function getContractSecurity(spenderAddress, chain = "ethereum", fallbackMeta = null) {
  const chainId = CHAIN_IDS[chain.toLowerCase()] || "1";
  const address = spenderAddress.toLowerCase();
  const chainLabel = chain.toLowerCase() === "base" ? "Base" : "Ethereum";
  const cacheKey = `${chainId}:${address}`;

  if (securityCache.has(cacheKey)) {
    return securityCache.get(cacheKey);
  }

  // Endpoints:
  // 1. Approval Security: Checks code-level approval abuse & privilege risks
  const approvalSecUrl = `https://api.gopluslabs.io/api/v1/approval_security/${chainId}?contract_addresses=${address}`;
  // 2. Address Security: Checks malicious activity (phishing, stealing, scams)
  const addressSecUrl = `https://api.gopluslabs.io/api/v1/address_security/${address}?chain_id=${chainId}`;

  try {
    const [approvalRes, addressRes] = await Promise.all([
      fetch(approvalSecUrl, { headers: { accept: "*/*" } }).catch(() => null),
      fetch(addressSecUrl, { headers: { accept: "*/*" } }).catch(() => null),
    ]);

    const approvalData = approvalRes && approvalRes.ok ? await approvalRes.json() : null;
    const addressData = addressRes && addressRes.ok ? await addressRes.json() : null;

    const contractResult = approvalData?.result || {};
    const addressResult = addressData?.result || {};

    // Collect explainable security signals
    const signals = [];
    let riskLevel = "safe"; // "safe" | "attention" | "high"

    // 0. EOA (Externally Owned Account) check - CRITICAL WEB3 RISK
    // ERC-20 approvals to personal wallets/EOAs allow direct private key drainer attacks
    const isEoa =
      contractResult.is_contract === 0 ||
      contractResult.risky_approval?.value === 1 ||
      addressResult.contract_address === "0" ||
      (fallbackMeta && fallbackMeta.isContract === false);

    const isContract = !isEoa && (contractResult.is_contract === 1 || (fallbackMeta && fallbackMeta.isContract === true));

    if (isEoa) {
      signals.push("Critical: Spender is an Externally Owned Account (EOA), not a smart contract. Direct private-key token drain risk.");
      if (contractResult.risky_approval?.risk) {
        signals.push(contractResult.risky_approval.risk.trim());
      }
      riskLevel = "high";
    }

    // 1. Open Source / Code Verification check
    const isOpenSource = contractResult.is_open_source === 1 || (fallbackMeta && fallbackMeta.isOpenSource === true);
    if (isContract && !isOpenSource) {
      signals.push("Unverified code: Contract is not open-source on explorer");
      if (riskLevel !== "high") riskLevel = "attention";
    }

    // 2. Milestone 13 Anomaly: Recently Deployed Contract (< 30 days or < 90 days)
    if (isContract && contractResult.deployed_time) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const ageDays = Math.floor((nowSeconds - contractResult.deployed_time) / 86400);
      if (ageDays >= 0 && ageDays < 30) {
        signals.push(`Anomaly: Recently deployed contract (${ageDays} days old). Limited battle-testing history.`);
        if (riskLevel !== "high") riskLevel = "attention";
      } else if (ageDays >= 30 && ageDays < 90) {
        signals.push(`New Contract: Deployed ${ageDays} days ago.`);
      }
    }

    // 3. Milestone 13 Anomaly: Upgradeable Proxy Implementation
    if (isContract && contractResult.is_proxy === 1) {
      signals.push("Upgradeable Proxy: Spender contract logic can be modified dynamically by admin keys");
      if (riskLevel !== "high") riskLevel = "attention";
    }

    // 4. Doubt List / Suspicious
    if (contractResult.doubt_list === 1 || (fallbackMeta && fallbackMeta.doubtList === true)) {
      signals.push("Doubt list: Contract has been flagged as suspicious by security providers");
      riskLevel = "high";
    }

    // 5. Approval Abuse Risk
    if (contractResult.contract_scan?.approval_abuse === 1) {
      signals.push("Critical: Contract contains approval-abuse code that can drain authorizations");
      riskLevel = "high";
    }

    // 6. Privilege Withdraw Backdoor
    if (contractResult.contract_scan?.privilege_withdraw === 1) {
      signals.push("Owner Privilege: Contract creator can withdraw deposited funds arbitrarily");
      if (riskLevel !== "high") riskLevel = "attention";
    }

    // 7. Selfdestruct Risk
    if (contractResult.contract_scan?.selfdestruct === 1) {
      signals.push("Selfdestruct opcode detected: Contract can be destroyed by owner");
      if (riskLevel !== "high") riskLevel = "attention";
    }

    // 8. Phishing / Stealing / Blacklist activity from address intelligence
    if (addressResult.phishing_activities === "1") {
      signals.push("Phishing warning: Address associated with known phishing campaigns");
      riskLevel = "high";
    }
    if (addressResult.stealing_attack === "1") {
      signals.push("Exploit alert: Address involved in automated stealing attacks");
      riskLevel = "high";
    }
    if (addressResult.honeypot_related_address === "1") {
      signals.push("Honeypot risk: Address associated with honeypot token traps");
      riskLevel = "high";
    }
    if (addressResult.blacklist_doubt === "1") {
      signals.push("Blacklist alert: Address flagged on suspicious actor blacklist");
      riskLevel = "high";
    }

    // 9. Trust indicators
    const isTrustListed = contractResult.trust_list === 1;
    if (isTrustListed) {
      signals.push("Verified Protocol: Contract is on the trusted protocol whitelist");
    }
    if (isContract && isOpenSource) {
      signals.push("Verified source: Contract is publicly verified and open-source");
    }

    const profile = {
      address,
      chain: chainLabel,
      contractName: contractResult.contract_name || contractResult.tag || (isEoa ? "EOA (Personal Wallet)" : "Unknown Contract"),
      isContract,
      isEoa,
      isOpenSource,
      isTrustListed,
      riskLevel, // "safe", "attention", "high"
      signals: signals.length > 0 ? signals : ["No suspicious activity or backdoors detected"],
      rawDetails: {
        approvalSecurity: contractResult,
        addressSecurity: addressResult,
      },
    };

    securityCache.set(cacheKey, profile);
    return profile;
  } catch (error) {
    console.error("Failed to query contract security:", error.message);
    const isEoaFallback = fallbackMeta && fallbackMeta.isContract === false;
    const fallbackProfile = {
      address,
      chain: chainLabel,
      contractName: isEoaFallback ? "EOA (Personal Wallet)" : "Unknown Contract",
      isContract: !isEoaFallback,
      isEoa: Boolean(isEoaFallback),
      isOpenSource: Boolean(fallbackMeta?.isOpenSource),
      isTrustListed: false,
      riskLevel: isEoaFallback ? "high" : "attention",
      signals: isEoaFallback
        ? ["Critical: Spender is an Externally Owned Account (EOA), not a smart contract."]
        : ["Security information temporarily unavailable"],
    };
    return fallbackProfile;
  }
}
