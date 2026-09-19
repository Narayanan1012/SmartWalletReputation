/**
 * Token Approval Discovery Service
 *
 * Web3 Concept: Token Approvals & Spenders
 * - In Web3, before a smart contract (DEX, Lending pool, or bridge) can transfer tokens
 *   from your wallet, you must grant it an "Approval".
 * - Many users click "Unlimited" approval and forget about it.
 * - This service queries the outstanding ERC-20 approvals for a given wallet address.
 */

const CHAIN_IDS = {
  ethereum: "1",
  base: "8453",
};

/**
 * Discovers all outstanding token approvals for an EVM address.
 *
 * @param {string} address - 42-char EVM address
 * @param {string} chain - "ethereum" or "base"
 * @returns {Promise<Array>} Array of normalized Approval objects
 */
export async function getWalletApprovals(address, chain = "ethereum") {
  const chainId = CHAIN_IDS[chain.toLowerCase()] || "1";
  const normalizedAddress = address.toLowerCase();
  const chainLabel = chain.toLowerCase() === "base" ? "Base" : "Ethereum";

  const url = `https://api.gopluslabs.io/api/v2/token_approval_security/${chainId}?addresses=${normalizedAddress}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "*/*" },
    });

    if (!response.ok) {
      console.warn(`GoPlus approval request failed: HTTP ${response.status}`);
      return [];
    }

    const data = await response.json();

    // GoPlus returns code 1 or 2 for success/partial success
    if (!data.result || !Array.isArray(data.result)) {
      return [];
    }

    const approvals = [];

    // GoPlus groups approvals by Token Contract
    for (const token of data.result) {
      const tokenAddress = token.token_address;
      const tokenSymbol = token.token_symbol || "UNKNOWN";
      const tokenName = token.token_name || tokenSymbol;

      const approvedList = Array.isArray(token.approved_list) ? token.approved_list : [];

      for (const item of approvedList) {
        const spenderAddress = item.approved_contract;
        if (!spenderAddress) continue;

        const isUnlimited =
          item.approved_amount === "Unlimited" ||
          item.approved_amount === "unlimited" ||
          (item.approved_amount && item.approved_amount.length > 20);

        const approvedDate = item.approved_time
          ? new Date(item.approved_time * 1000).toISOString()
          : null;

        approvals.push({
          id: `appr-${chainLabel.toLowerCase()}-${tokenAddress.slice(0, 8)}-${spenderAddress.slice(0, 8)}`,
          chain: chainLabel,
          token: {
            address: tokenAddress,
            symbol: tokenSymbol,
            name: tokenName,
          },
          spender: {
            address: spenderAddress,
            label: item.address_info?.contract_name || item.address_info?.tag || undefined,
          },
          allowance: {
            type: isUnlimited ? "unlimited" : "limited",
            raw: item.approved_amount || (isUnlimited ? "Unlimited" : "0"),
          },
          approvedAt: approvedDate || undefined,
          transactionHash: item.hash || item.initial_approval_hash || undefined,
          // Internal security signals for later correlation (Milestone 8 & 9)
          _spenderMeta: {
            isContract: item.address_info?.is_contract === 1,
            isOpenSource: item.address_info?.is_open_source === 1,
            doubtList: item.address_info?.doubt_list === 1,
            maliciousBehavior: item.address_info?.malicious_behavior || [],
          },
        });
      }
    }

    return approvals;
  } catch (error) {
    console.error("Error discovering wallet approvals:", error.message);
    return [];
  }
}
