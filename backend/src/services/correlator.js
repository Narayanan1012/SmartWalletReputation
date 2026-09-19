/**
 * Deterministic Correlation Engine
 *
 * Web3 Concept: Rule-Based Exposure Assessment
 *
 * Instead of opaque machine learning or arbitrary risk scores, our correlation engine
 * applies clear, deterministic, auditable rules:
 *
 * Rule 1: Allowance Active?
 *   - If current allowance is 0 -> No exposure (Revoked).
 * Rule 2: Critical Potential Threat ("potential"):
 *   - Spender flagged for approval abuse, doubt list, stealing attacks, or phishing.
 *   - Spender has owner privilege withdraw + unlimited allowance.
 * Rule 3: Attention Warranted ("attention"):
 *   - Spender is closed-source / unverified, or has selfdestruct capabilities.
 * Rule 4: Informational Review ("informational"):
 *   - Spender is verified and clean, but retains an active unlimited token allowance.
 */

/**
 * Correlates a single approval with its verified live allowance and spender security profile.
 *
 * @param {Object} approval - Normalized Approval object (from Milestone 5)
 * @param {Object} allowance - Live allowance verification (from Milestone 6)
 * @param {Object} security - Spender security profile (from Milestone 7)
 * @returns {Object|null} Normalized Exposure object or null if not exposed
 */
export function evaluateSingleExposure(approval, allowance, security) {
  // If allowance is revoked or 0, there is no active exposure
  if (!allowance.isActive) {
    return null;
  }

  const chain = approval.chain || "Ethereum";
  const tokenSymbol = approval.token?.symbol || "TOKEN";
  const spenderName = security.contractName || approval.spender?.label || "Contract";
  const contractAddress = approval.spender?.address || security.address;

  let status = "informational"; // "informational" | "attention" | "potential"
  let reason = "";

  const isUnlimited = allowance.isUnlimited || approval.allowance?.type === "unlimited";

  // Check 1: Critical / Potential Security Threat
  if (security.riskLevel === "high") {
    status = "potential";
    const criticalSignal = security.signals?.find((s) => s.startsWith("Critical") || s.startsWith("Doubt") || s.startsWith("Exploit") || s.startsWith("Phishing"));
    reason = criticalSignal
      ? `High Risk: ${criticalSignal}. Active ${isUnlimited ? "unlimited" : ""} ${tokenSymbol} permission detected.`
      : `High Risk: Spender contract flagged for suspicious activity with active ${tokenSymbol} allowance.`;
  }
  // Check 2: Attention / Code Unverified
  else if (!security.isOpenSource && security.isContract) {
    status = "attention";
    reason = `Unverified Contract: ${spenderName} is not open-source on explorer. Unaudited code has active ${isUnlimited ? "unlimited" : ""} ${tokenSymbol} allowance.`;
  }
  // Check 3: Owner Privileges / Backdoors
  else if (security.riskLevel === "attention") {
    status = "attention";
    const attentionSignal = security.signals?.[0] || "Special owner privileges detected in spender code";
    reason = `Caution: ${attentionSignal} on ${spenderName} with active ${tokenSymbol} allowance.`;
  }
  // Check 4: Clean Verified Protocol with Unlimited Allowance
  else if (isUnlimited) {
    status = "informational";
    reason = `Active unlimited allowance granted to verified protocol (${spenderName}). Consider revoking or capping allowance when not actively trading.`;
  }
  // Check 5: Limited Allowance to Clean Protocol
  else {
    status = "informational";
    reason = `Active limited allowance of ${allowance.display || approval.allowance?.raw} ${tokenSymbol} to verified protocol (${spenderName}).`;
  }

  return {
    id: `exp-${chain.toLowerCase()}-${contractAddress.slice(0, 8)}-${approval.token?.address?.slice(0, 8)}`,
    chain,
    token: tokenSymbol,
    contract: contractAddress,
    status,
    reason,
  };
}

/**
 * Runs the correlation engine across all discovered approvals for a wallet.
 *
 * @param {Array} approvals - List of normalized approvals
 * @param {Map|Object} allowancesMap - Map of spenderAddress -> live allowance
 * @param {Map|Object} securityMap - Map of spenderAddress -> security profile
 * @returns {Array} List of correlated Exposure objects
 */
export function correlateApprovals(approvals, allowancesMap, securityMap) {
  const exposures = [];

  for (const approval of approvals) {
    const spenderAddr = approval.spender?.address?.toLowerCase();
    const tokenAddr = approval.token?.address?.toLowerCase();
    const key = `${tokenAddr}:${spenderAddr}`;

    const allowance = allowancesMap[key] || allowancesMap[spenderAddr] || {
      isActive: true,
      isUnlimited: approval.allowance?.type === "unlimited",
      display: approval.allowance?.raw,
    };

    const security = securityMap[spenderAddr] || {
      address: spenderAddr,
      contractName: approval.spender?.label || "Unknown Contract",
      isOpenSource: true,
      riskLevel: "safe",
      signals: [],
    };

    const exposure = evaluateSingleExposure(approval, allowance, security);
    if (exposure) {
      exposures.push(exposure);
    }
  }

  return exposures;
}
