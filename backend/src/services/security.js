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

/**
 * Queries GoPlus Security for contract-level and address-level security signals.
 *
 * @param {string} spenderAddress - Contract address to analyze
 * @param {string} chain - "ethereum" or "base"
 * @returns {Promise<Object>} Normalized Contract Security profile
 */
export async function getContractSecurity(spenderAddress, chain = "ethereum") {
  const chainId = CHAIN_IDS[chain.toLowerCase()] || "1";
  const address = spenderAddress.toLowerCase();
  const chainLabel = chain.toLowerCase() === "base" ? "Base" : "Ethereum";

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

    // 1. Open Source / Code Verification check
    const isOpenSource = contractResult.is_open_source === 1;
    if (!isOpenSource && contractResult.is_contract === 1) {
      signals.push("Unverified code: Contract is not open-source on explorer");
      riskLevel = "attention";
    }

    // 2. Doubt List / Untrusted
    if (contractResult.doubt_list === 1) {
      signals.push("Doubt list: Contract has been flagged as suspicious by security providers");
      riskLevel = "high";
    }

    // 3. Approval Abuse Risk
    if (contractResult.contract_scan?.approval_abuse === 1) {
      signals.push("Critical: Contract contains approval-abuse code that can drain authorizations");
      riskLevel = "high";
    }

    // 4. Privilege Withdraw Backdoor
    if (contractResult.contract_scan?.privilege_withdraw === 1) {
      signals.push("Owner Privilege: Contract creator can withdraw deposited funds arbitrarily");
      riskLevel = riskLevel === "high" ? "high" : "attention";
    }

    // 5. Selfdestruct Risk
    if (contractResult.contract_scan?.selfdestruct === 1) {
      signals.push("Selfdestruct opcode detected: Contract can be destroyed by owner");
      riskLevel = riskLevel === "high" ? "high" : "attention";
    }

    // 6. Phishing / Stealing / Blacklist activity from address intelligence
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

    // 7. Positive / Clean Trust indicators
    const isTrustListed = contractResult.trust_list === 1;
    if (isTrustListed) {
      signals.push("Verified Protocol: Contract is on the trusted protocol whitelist");
    }
    if (isOpenSource) {
      signals.push("Verified source: Contract is publicly verified and open-source");
    }

    return {
      address,
      chain: chainLabel,
      contractName: contractResult.contract_name || contractResult.tag || "Unknown Contract",
      isContract: contractResult.is_contract === 1,
      isOpenSource,
      isTrustListed,
      riskLevel, // "safe", "attention", "high"
      signals: signals.length > 0 ? signals : ["No suspicious activity or backdoors detected"],
      rawDetails: {
        approvalSecurity: contractResult,
        addressSecurity: addressResult,
      },
    };
  } catch (error) {
    console.error("Failed to query contract security:", error.message);
    return {
      address,
      chain: chainLabel,
      contractName: "Unknown Contract",
      isContract: true,
      isOpenSource: false,
      isTrustListed: false,
      riskLevel: "attention",
      signals: ["Security information temporarily unavailable"],
    };
  }
}
