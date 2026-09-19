/**
 * Current On-Chain Allowance Verification Service
 *
 * Web3 Concept: allowance(owner, spender) view call
 * - ERC-20 standard defines:
 *     function allowance(address owner, address spender) external view returns (uint256);
 * - Function selector is keccak256("allowance(address,address)").slice(0, 10) = "0xdd62ed3e"
 * - Using `eth_call` via Alchemy, this queries the Ethereum smart contract storage directly
 *   without spending any gas and without sending a transaction.
 */

import { getAlchemyRpcUrl, getFallbackRpcUrl } from "./alchemy.js";

// The 4-byte ERC-20 function selector for allowance(address,address)
const ALLOWANCE_SELECTOR = "0xdd62ed3e";

// Threshold for unlimited allowance: 2^128 or common max uint256
const UNLIMITED_THRESHOLD = BigInt("1000000000000000000000000000000000000"); // 10^36

/**
 * Encodes an address into 32-byte ABI format (64 hex characters, left-padded with zeros)
 */
function padAddress(address) {
  return address.toLowerCase().replace("0x", "").padStart(64, "0");
}

/**
 * Checks the live on-chain allowance granted by `owner` to `spender` for a specific `token`.
 *
 * @param {string} tokenAddress - Contract address of the ERC-20 token (e.g. USDT)
 * @param {string} ownerAddress - Wallet address that granted the permission
 * @param {string} spenderAddress - Contract address authorized to spend
 * @param {string} chain - 'ethereum' or 'base'
 */
export async function verifyCurrentAllowance(tokenAddress, ownerAddress, spenderAddress, chain = "ethereum") {
  const url = getAlchemyRpcUrl(chain);

  // Encode call data: selector + padded owner + padded spender
  const callData = ALLOWANCE_SELECTOR + padAddress(ownerAddress) + padAddress(spenderAddress);

  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [
      {
        to: tokenAddress.toLowerCase(),
        data: callData,
      },
      "latest",
    ],
  };

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const fallbackUrl = getFallbackRpcUrl(chain);
      response = await fetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
  } catch {
    const fallbackUrl = getFallbackRpcUrl(chain);
    response = await fetch(fallbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    throw new Error(`RPC call failed with status ${response.status}`);
  }

  const json = await response.json();

  if (json.error) {
    throw new Error(`RPC Error: ${json.error.message}`);
  }

  const rawResult = json.result;

  // Handle empty or zero return
  if (!rawResult || rawResult === "0x") {
    return {
      isActive: false,
      isUnlimited: false,
      rawHex: "0x0",
      value: "0",
      display: "0 (Inactive / Revoked)",
    };
  }

  const allowanceBigInt = BigInt(rawResult);

  const isZero = allowanceBigInt === 0n;
  const isUnlimited = allowanceBigInt >= UNLIMITED_THRESHOLD;

  let display = "Limited";
  if (isZero) {
    display = "0 (Revoked / Inactive)";
  } else if (isUnlimited) {
    display = "Unlimited";
  } else {
    display = allowanceBigInt.toString();
  }

  return {
    token: tokenAddress.toLowerCase(),
    owner: ownerAddress.toLowerCase(),
    spender: spenderAddress.toLowerCase(),
    chain,
    isActive: !isZero,
    isUnlimited,
    rawHex: rawResult,
    value: allowanceBigInt.toString(),
    display,
  };
}
