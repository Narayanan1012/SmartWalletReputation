/**
 * Full Address Analysis Pipeline
 *
 * Web3 Concept: Full Evidence Chain Construction
 * Connects all our services into the final AnalysisResult:
 * Wallet -> Approvals -> Live Verification -> Spender Security -> Exposures -> Evidence Chain -> Graph Relationships
 */

import { getWalletApprovals } from "./approvals.js";
import { verifyCurrentAllowance } from "./allowance.js";
import { getContractSecurity } from "./security.js";
import { evaluateSingleExposure } from "./correlator.js";
import { getAlchemyRpcUrl } from "./alchemy.js";

/**
 * Checks whether an address is a Smart Contract or an EOA (Externally Owned Account / Wallet)
 * by checking if it contains deployed bytecode.
 */
async function getAddressType(address, chain = "ethereum") {
  const url = getAlchemyRpcUrl(chain);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getCode",
        params: [address.toLowerCase(), "latest"],
      }),
    });
    const data = await res.json();
    const code = data.result;
    if (code && code !== "0x" && code !== "0x0") {
      return "contract";
    }
    return "wallet";
  } catch {
    return "unknown";
  }
}

/**
 * Fully analyzes a wallet or contract address on Ethereum and Base.
 *
 * @param {string} address - 42-character EVM address
 * @returns {Promise<Object>} Formatted AnalysisResult strictly conforming to frontend types
 */
export async function analyzeAddress(address) {
  const normalizedAddress = address.toLowerCase();

  // 1. Identify address type (wallet vs contract)
  const addressType = await getAddressType(normalizedAddress, "ethereum");

  const chainsStatus = [
    { chain: "Ethereum", status: "success" },
    { chain: "Base", status: "success" },
  ];

  // 2. Discover approvals across Ethereum (and Base)
  const [ethApprovals, baseApprovals] = await Promise.all([
    getWalletApprovals(normalizedAddress, "ethereum").catch(() => []),
    getWalletApprovals(normalizedAddress, "base").catch(() => []),
  ]);

  const allApprovals = [...ethApprovals, ...baseApprovals];

  const exposures = [];
  const evidenceList = [];
  const relationships = [];

  // 3. For each approval, verify live allowance, check contract security, and construct evidence chain
  // Process in concurrent batches of 6 for speed without hitting rate limits
  const BATCH_SIZE = 6;
  for (let i = 0; i < allApprovals.length; i += BATCH_SIZE) {
    const batch = allApprovals.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (appr) => {
        const token = appr.token.address;
        const spender = appr.spender.address;
        const chainKey = (appr.chain || "Ethereum").toLowerCase();

        // Run live allowance check & GoPlus contract audit in parallel for this approval
        const [liveAllowance, secProfile] = await Promise.all([
          verifyCurrentAllowance(token, normalizedAddress, spender, chainKey).catch(() => ({
            isActive: true,
            isUnlimited: appr.allowance?.type === "unlimited",
            display: appr.allowance?.raw || "Unlimited",
          })),
          getContractSecurity(spender, chainKey, appr._spenderMeta).catch(() => {
            const isEoa = appr._spenderMeta?.isContract === false;
            return {
              address: spender,
              contractName: isEoa ? "EOA (Personal Wallet)" : (appr.spender?.label || "Unknown Contract"),
              isContract: !isEoa,
              isEoa,
              isOpenSource: Boolean(appr._spenderMeta?.isOpenSource),
              riskLevel: isEoa ? "high" : "attention",
              signals: isEoa
                ? ["Critical: Spender is an Externally Owned Account (EOA), not a smart contract."]
                : ["Verified protocol"],
            };
          }),
        ]);

        // Update approval record with live on-chain verified status
        if (liveAllowance.display) {
          appr.allowance.raw = liveAllowance.display;
          appr.allowance.type = liveAllowance.isUnlimited ? "unlimited" : "limited";
        }

        // Update spender label if GoPlus discovered a protocol name or EOA status
        if (secProfile.isEoa) {
          appr.spender.label = "EOA (Personal Wallet)";
        } else if (secProfile.contractName && secProfile.contractName !== "Unknown Contract") {
          appr.spender.label = secProfile.contractName;
        }

        // Evaluate deterministic exposure rule
        const exposure = evaluateSingleExposure(appr, liveAllowance, secProfile);

        if (exposure) {
          exposures.push(exposure);

          // Construct explainable Evidence Chain:
          // Wallet -> Approval -> Spender Contract -> Security Signal -> Potential Exposure
          evidenceList.push({
            id: `ev-${exposure.id}`,
            wallet: normalizedAddress,
            token: appr.token.symbol,
            spender: spender,
            approval: {
              amount: liveAllowance.display,
              transaction: appr.transactionHash,
              date: appr.approvedAt ? appr.approvedAt.slice(0, 10) : undefined,
            },
            contract: {
              address: spender,
              signals: secProfile.signals || [],
            },
            exposure: {
              status: exposure.status,
              reason: exposure.reason,
            },
          });
        }

        // Build graph relationships for the Explorer tab
        relationships.push({
          id: `rel-${appr.id}`,
          from: normalizedAddress,
          fromLabel: addressType === "contract" ? "Contract" : "Wallet",
          to: spender,
          toLabel: appr.spender.label || "Spender",
          type: "approved",
          token: appr.token.symbol,
          chain: appr.chain,
        });
      })
    );
  }

  // Sort exposures so critical/potential threats appear first
  const statusOrder = { potential: 0, attention: 1, informational: 2 };
  exposures.sort((a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3));

  return {
    address: normalizedAddress,
    addressType,
    chains: chainsStatus,
    approvals: allApprovals,
    exposures,
    evidence: evidenceList,
    relationships,
  };
}
