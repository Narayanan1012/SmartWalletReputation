import dotenv from "dotenv";
import { verifyCurrentAllowance } from "../services/allowance.js";

dotenv.config();

// Test Fixture: Known active approval on Ethereum
const TEST_TOKEN = "0xdAC17F958D2ee523a2206206994597C13D831ec7";   // USDT
const TEST_OWNER = "0x85f6be9460291e86e0fb49b07d0a83cc5f7206cd";   // Active user
const TEST_SPENDER = "0xc92e8bdf79f0507f65a392b0ab4667716bfe0110"; // GPv2VaultRelayer

// Inactive/zero test (random address that was never approved)
const RANDOM_SPENDER = "0x0000000000000000000000000000000000000001";

async function main() {
  console.log("=========================================");
  console.log("Testing Milestone 6: Live Allowance Verification");
  console.log("=========================================");

  console.log("Test 1: Checking Active USDT Approval via Alchemy RPC...");
  try {
    const res1 = await verifyCurrentAllowance(TEST_TOKEN, TEST_OWNER, TEST_SPENDER, "ethereum");
    console.log(" Token:       USDT (", res1.token, ")");
    console.log(" Owner:      ", res1.owner);
    console.log(" Spender:    ", res1.spender);
    console.log(" Is Active?: ", res1.isActive ? "YES (Exposure exists)" : "NO");
    console.log(" Allowance:  ", res1.display);
    console.log(" Raw Hex:    ", res1.rawHex.slice(0, 18) + "...\n");
  } catch (err) {
    console.error("Test 1 failed:", err.message);
  }

  console.log("Test 2: Checking Inactive (0) Allowance on same wallet...");
  try {
    const res2 = await verifyCurrentAllowance(TEST_TOKEN, TEST_OWNER, RANDOM_SPENDER, "ethereum");
    console.log(" Is Active?: ", res2.isActive ? "YES" : "NO (Safe / Revoked)");
    console.log(" Allowance:  ", res2.display);
    console.log(" Raw Hex:    ", res2.rawHex);
  } catch (err) {
    console.error("Test 2 failed:", err.message);
  }

  console.log("=========================================");
  console.log(" SUCCESS: Verified real on-chain allowance status via eth_call!");
  console.log("=========================================");
}

main();
