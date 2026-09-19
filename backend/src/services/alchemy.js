/**
 * Alchemy / Ethereum JSON-RPC Service
 *
 * Web3 Concepts:
 * 1. JSON-RPC: The standard protocol for communicating with Ethereum and Base nodes.
 * 2. eth_blockNumber: The basic call to fetch the latest mined block height.
 * 3. alchemy_getAssetTransfers: Alchemy's indexed API for querying token & ETH transfers
 *    for a given address without scanning the entire blockchain manually.
 */

export function getAlchemyRpcUrl(chain = "ethereum") {
  const apiKey = process.env.ALCHEMY_API_KEY;

  if (chain === "base") {
    return apiKey
      ? `https://base-mainnet.g.alchemy.com/v2/${apiKey}`
      : "https://mainnet.base.org";
  }

  // Default: Ethereum Mainnet
  return apiKey
    ? `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`
    : "https://ethereum-rpc.publicnode.com";
}

export function getFallbackRpcUrl(chain = "ethereum") {
  if (chain === "base") {
    return "https://mainnet.base.org";
  }
  return "https://ethereum-rpc.publicnode.com";
}

/**
 * Fetch the latest block number from Ethereum or Base.
 * Gracefully falls back to public RPC if a network (like Base) isn't enabled on your Alchemy app yet.
 */
export async function getLatestBlockNumber(chain = "ethereum") {
  const primaryUrl = getAlchemyRpcUrl(chain);
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_blockNumber",
    params: [],
  };

  let response;
  let provider = process.env.ALCHEMY_API_KEY ? "Alchemy" : "Public RPC";
  let notice = null;

  try {
    response = await fetch(primaryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // If Alchemy returns 403 or error (e.g. Base network not enabled in app settings)
    if (!response.ok) {
      notice = `Base not enabled on Alchemy app. Using public Base RPC.`;
      const fallbackUrl = getFallbackRpcUrl(chain);
      response = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      provider = "Public RPC Fallback";
    }
  } catch {
    const fallbackUrl = getFallbackRpcUrl(chain);
    response = await fetch(fallbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    provider = "Public RPC Fallback";
  }

  if (!response.ok) {
    throw new Error(`RPC request failed with HTTP status ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    if (provider === "Alchemy") {
      const fallbackUrl = getFallbackRpcUrl(chain);
      notice = `${data.error.message} (Using public ${chain} RPC)`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const fallbackData = await fallbackRes.json();
      return formatResult(fallbackData, chain, "Public RPC Fallback", notice);
    }
    throw new Error(`RPC Error (${data.error.code}): ${data.error.message}`);
  }

  return formatResult(data, chain, provider, notice);
}

function formatResult(data, chain, provider, notice) {
  const blockNumberHex = data.result;
  const blockNumberDecimal = parseInt(blockNumberHex, 16);

  return {
    chain,
    provider,
    notice,
    blockNumberHex,
    blockNumber: blockNumberDecimal,
    rawRpcResponse: data,
  };
}

/**
 * Milestone 4: Fetch recent asset transfers (ETH and ERC-20 tokens) for a given address.
 * Uses Alchemy's indexed `alchemy_getAssetTransfers` API.
 *
 * @param {string} address - 42-char EVM address
 * @param {string} chain - 'ethereum' or 'base'
 * @param {number} maxCount - Number of recent transfers to retrieve (default 5 for fast testing)
 */
export async function getWalletActivity(address, chain = "ethereum", maxCount = 5) {
  const url = getAlchemyRpcUrl(chain);
  const hexMaxCount = `0x${maxCount.toString(16)}`;

  // Web3 Concept: Querying indexed transfers from this address (outgoing activity)
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "alchemy_getAssetTransfers",
    params: [
      {
        fromBlock: "0x0",
        toBlock: "latest",
        fromAddress: address.toLowerCase(),
        category: ["erc20", "external"],
        maxCount: hexMaxCount,
        order: "desc", // Newest transactions first
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Alchemy request failed with HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`Alchemy API Error: ${data.error.message}`);
  }

  const rawTransfers = data.result?.transfers || [];

  // Normalize into a clean, simple, beginner-friendly format
  const normalizedTransfers = rawTransfers.map((t) => ({
    hash: t.hash,
    category: t.category, // 'erc20' (token) or 'external' (native ETH)
    asset: t.asset || (t.category === "external" ? "ETH" : "UNKNOWN"),
    value: t.value,
    from: t.from,
    to: t.to,
    contractAddress: t.rawContract?.address || null,
    timestamp: t.metadata?.blockTimestamp || null,
  }));

  return {
    address,
    chain,
    count: normalizedTransfers.length,
    transfers: normalizedTransfers,
  };
}
