import dotenv from "dotenv";
import { getWalletApprovals } from "../services/approvals.js";

dotenv.config();

const DEFAULT_ADDRESS = "0x85f6be9460291e86e0fb49b07d0a83cc5f7206cd";
const targetAddress = process.argv[2] || DEFAULT_ADDRESS;
const chain = process.argv[3] || "ethereum";

async function main() {
  console.log("=========================================");
  console.log("Testing Milestone 5: Token Approval Discovery");
  console.log("=========================================");
  console.log("Target Address:", targetAddress);
  console.log("Target Chain:  ", chain);
  console.log("Scanning outstanding token approvals...\n");

  const approvals = await getWalletApprovals(targetAddress, chain);

  if (approvals.length === 0) {
    console.log("ℹ️ No active token approvals found for this address.");
    console.log("Try an active address like: 0x85f6be9460291e86e0fb49b07d0a83cc5f7206cd");
  } else {
    console.log(` SUCCESS! Discovered ${approvals.length} active approvals:\n`);

    approvals.forEach((appr, idx) => {
      console.log(`[${idx + 1}] Token: ${appr.token.symbol} (${appr.token.name})`);
      console.log(`    Token Address: ${appr.token.address}`);
      console.log(`    Spender:       ${appr.spender.address}${appr.spender.label ? ` [${appr.spender.label}]` : ""}`);
      console.log(`    Allowance:     ${appr.allowance.type.toUpperCase()} (${appr.allowance.raw})`);
      console.log(`    Approved At:   ${appr.approvedAt || "N/A"}`);
      console.log(`    Tx Hash:       ${appr.transactionHash || "N/A"}`);
      console.log(`    Open Source:   ${appr._spenderMeta?.isOpenSource ? "YES" : "NO"}\n`);
    });
  }

  console.log("=========================================");
}

main();
