import dotenv from "dotenv";
import { getContractSecurity } from "../services/security.js";

dotenv.config();

const DEFAULT_SPENDER = "0xc92e8bdf79f0507f65a392b0ab4667716bfe0110"; // GPv2VaultRelayer
const spender = process.argv[2] || DEFAULT_SPENDER;
const chain = process.argv[3] || "ethereum";

async function main() {
  console.log("=========================================");
  console.log("Testing Milestone 7: GoPlus Contract Security");
  console.log("=========================================");
  console.log("Spender Contract:", spender);
  console.log("Chain:           ", chain);
  console.log("Querying GoPlus Security Intelligence...\n");

  try {
    const result = await getContractSecurity(spender, chain);
    console.log("Contract Name:  ", result.contractName);
    console.log("Is Contract?:   ", result.isContract ? "YES" : "NO");
    console.log("Is Open Source?:", result.isOpenSource ? "YES" : "NO");
    console.log("Is Whitelisted?:", result.isTrustListed ? "YES" : "NO");
    console.log("Risk Level:     ", result.riskLevel.toUpperCase());
    console.log("\nDetected Security Signals:");
    result.signals.forEach((sig, idx) => {
      console.log(`  [${idx + 1}] ${sig}`);
    });
    console.log("\n=========================================");
    console.log(" SUCCESS: Spender security signals parsed!");
    console.log("=========================================");
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

main();
