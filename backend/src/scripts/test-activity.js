import dotenv from "dotenv";
import { getWalletActivity } from "../services/alchemy.js";

dotenv.config();

const DEFAULT_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // vitalik.eth
const targetAddress = process.argv[2] || DEFAULT_ADDRESS;
const chain = process.argv[3] || "ethereum";

async function main() {
  console.log("=========================================");
  console.log("Testing Milestone 4: Live Wallet Activity");
  console.log("=========================================");
  console.log("Target Address:", targetAddress);
  console.log("Target Chain:  ", chain);
  console.log("Querying Alchemy getAssetTransfers...\n");

  try {
    const result = await getWalletActivity(targetAddress, chain, 5);
    console.log(`Found ${result.count} recent transfers:\n`);

    result.transfers.forEach((t, i) => {
      console.log(`[${i + 1}] ${t.category.toUpperCase()} Transfer`);
      console.log(`    Asset:     ${t.value} ${t.asset}`);
      console.log(`    From:      ${t.from}`);
      console.log(`    To:        ${t.to}`);
      if (t.contractAddress) {
        console.log(`    Contract:  ${t.contractAddress}`);
      }
      console.log(`    Tx Hash:   ${t.hash}`);
      console.log(`    Date:      ${t.timestamp || "N/A"}\n`);
    });

    console.log(" SUCCESS: Real on-chain activity retrieved from Alchemy!");
    console.log("=========================================");
  } catch (error) {
    console.error(" FAILED to retrieve activity:", error.message);
    process.exit(1);
  }
}

main();
