import dotenv from "dotenv";
import { getLatestBlockNumber } from "../services/alchemy.js";

dotenv.config();

async function main() {
  console.log("=========================================");
  console.log("Testing Alchemy / Ethereum RPC Connection");
  console.log("=========================================");
  console.log("ALCHEMY_API_KEY set?:", process.env.ALCHEMY_API_KEY ? "YES" : "NO (using fallback RPC)");
  console.log("Querying latest Ethereum block height...");

  try {
    const result = await getLatestBlockNumber("ethereum");
    console.log("\n SUCCESS! Connected to Ethereum blockchain:");
    console.log(" Provider:    ", result.provider);
    console.log(" Chain:       ", result.chain);
    console.log(" Block (Hex): ", result.blockNumberHex);
    console.log(" Block (Dec): ", result.blockNumber.toLocaleString());
    console.log("=========================================");
  } catch (error) {
    console.error("\n FAILED to connect:", error.message);
    process.exit(1);
  }
}

main();
