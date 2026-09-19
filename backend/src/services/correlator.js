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

  // Check approval age for stale/legacy permission anomaly (Milestone 13)
  const approvedAgeDays = approval.approvedAt
    ? Math.floor((Date.now() - new Date(approval.approvedAt).getTime()) / (1000 * 86400))
    : null;
  const isStale = approvedAgeDays !== null && approvedAgeDays > 180;
  const staleSuffix = isStale ? ` (Legacy approval granted ${approvedAgeDays} days ago)` : "";

  // Check allowance size anomaly (Milestone 13)
  const cleanNumberStr = String(allowance.display || approval.allowance?.raw || "").replace(/,/g, "");
  const numericVal = parseFloat(cleanNumberStr);
  const isHugeNumericAllowance = !isUnlimited && (cleanNumberStr.length > 20 || (!isNaN(numericVal) && numericVal >= 1_000_000_000));

  // Check 1 (CRITICAL): Spender is an EOA (Externally Owned Account) — Phishing / Drainer Hazard
  // Web3 security rule: Approvals must only be granted to smart contracts.
  // Approving an EOA gives a private individual direct transferFrom power to siphon tokens at any moment.
  const isEoa =
    security.isContract === false ||
    security.isEoa === true ||
    approval._spenderMeta?.isContract === false ||
    security.signals?.some((s) => s.toLowerCase().includes("externally owned account") || s.toLowerCase().includes("not a contract address"));

  if (isEoa) {
    status = "potential";
    reason = `Critical Risk: Spender is an Externally Owned Account (EOA personal wallet: ${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}), NOT a smart contract. The private key holder has direct permission to transfer your ${tokenSymbol} tokens at any time without smart contract safeguards.`;
  }
  // Check 2: Critical / Potential Security Threat from security providers
  else if (security.riskLevel === "high") {
    status = "potential";
    const criticalSignal = security.signals?.find(
      (s) =>
        s.startsWith("Critical") ||
        s.startsWith("Doubt") ||
        s.startsWith("Exploit") ||
        s.startsWith("Phishing") ||
        s.startsWith("Blacklist")
    );
    reason = criticalSignal
      ? `High Risk: ${criticalSignal}. Active ${isUnlimited ? "unlimited" : ""} ${tokenSymbol} permission detected.`
      : `High Risk: Spender contract flagged for suspicious activity with active ${tokenSymbol} allowance.`;
  }
  // Check 3 (Milestone 13 Anomaly): Spender is Closed-Source / Unverified Contract
  else if (!security.isOpenSource && security.isContract) {
    status = "attention";
    reason = `Unverified Contract: ${spenderName} is not open-source on explorer. Unaudited code has active ${isUnlimited ? "unlimited" : allowance.display} ${tokenSymbol} allowance.${staleSuffix}`;
  }
  // Check 4 (Milestone 13 Anomaly): Recently Deployed / Upgradeable Proxy / Owner Privilege
  else if (security.riskLevel === "attention") {
    status = "attention";
    const anomalySignal =
      security.signals?.find(
        (s) =>
          s.startsWith("Anomaly") ||
          s.startsWith("Upgradeable") ||
          s.startsWith("Owner Privilege") ||
          s.startsWith("Selfdestruct")
      ) || security.signals?.[0] || "Special privileges or anomaly detected in spender code";
    reason = `Caution: ${anomalySignal} on ${spenderName} with active ${isUnlimited ? "unlimited" : allowance.display} ${tokenSymbol} allowance.${staleSuffix}`;
  }
  // Check 5 (Milestone 13 Anomaly): Abnormally massive token allowance to non-whitelisted protocol
  else if (isHugeNumericAllowance && !security.isTrustListed) {
    status = "attention";
    reason = `Allowance Anomaly: Abnormally large allowance of ${allowance.display} ${tokenSymbol} granted to non-whitelisted protocol (${spenderName}). Monitor or cap allowance to reduce exposure.${staleSuffix}`;
  }
  // Check 6: Clean Verified Protocol with Unlimited Allowance
  else if (isUnlimited) {
    status = "informational";
    reason = `Active unlimited allowance granted to verified protocol (${spenderName}).${isStale ? ` Legacy permission granted ${approvedAgeDays} days ago — consider revoking if unused.` : " Consider revoking or capping allowance when not actively trading."}`;
  }
  // Check 7: Clean Verified Protocol with Limited Allowance
  else {
    status = "informational";
    reason = `Active limited allowance of ${allowance.display || approval.allowance?.raw} ${tokenSymbol} to verified protocol (${spenderName})${staleSuffix}.`;
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

    const isEoaFallback = approval._spenderMeta?.isContract === false;
    const security = securityMap[spenderAddr] || {
      address: spenderAddr,
      contractName: approval.spender?.label || (isEoaFallback ? "EOA (Personal Wallet)" : "Unknown Contract"),
      isContract: !isEoaFallback,
      isEoa: isEoaFallback,
      isOpenSource: approval._spenderMeta?.isOpenSource ?? true,
      riskLevel: isEoaFallback ? "high" : "safe",
      signals: isEoaFallback ? ["Critical: Spender is an Externally Owned Account (EOA), not a smart contract."] : [],
    };

    const exposure = evaluateSingleExposure(approval, allowance, security);
    if (exposure) {
      exposures.push(exposure);
    }
  }

  return exposures;
}
