/**
 * Alchemy / Ethereum JSON-RPC Service
 *
 * Web3 Concept: JSON-RPC & eth_blockNumber
 * - JSON-RPC is the standard specification for communicating with Ethereum nodes.
 * - Every request sends:
 *     jsonrpc: "2.0" (protocol version)
 *     id: a unique request counter
 *     method: the blockchain function we want to call (e.g., "eth_blockNumber")
 *     params: array of arguments (empty for eth_blockNumber)
 * - The node returns a hexadecimal number (e.g., "0x18ce940"), which we convert to decimal.
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

/**
 * Fetch the latest block number from Ethereum.
 * Proves that our backend can successfully communicate with the blockchain.
 */
export async function getLatestBlockNumber(chain = "ethereum") {
  const url = getAlchemyRpcUrl(chain);

  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_blockNumber",
    params: [],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`RPC request failed with HTTP status ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`RPC Error (${data.error.code}): ${data.error.message}`);
  }

  // Convert hexadecimal block number (e.g. "0x140b9f4") to human-readable integer
  const blockNumberHex = data.result;
  const blockNumberDecimal = parseInt(blockNumberHex, 16);

  return {
    chain,
    blockNumberHex,
    blockNumber: blockNumberDecimal,
    provider: process.env.ALCHEMY_API_KEY ? "Alchemy" : "Public RPC Fallback",
  };
}
