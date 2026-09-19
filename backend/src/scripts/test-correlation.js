import dotenv from "dotenv";
import { getWalletApprovals } from "../services/approvals.js";
import { verifyCurrentAllowance } from "../services/allowance.js";
import { getContractSecurity } from "../services/security.js";
import { correlateApprovals } from "../services/correlator.js";

dotenv.config();

const DEFAULT_WALLET = "0x85f6be9460291e86e0fb49b07d0a83cc5f7206cd";
const wallet = process.argv[2] || DEFAULT_WALLET;
const chain = process.argv[3] || "ethereum";

async function main() {
  console.log("=========================================");
  console.log("Testing Milestones 8 & 9: Deterministic Correlation");
  console.log("=========================================");
  console.log("Wallet: ", wallet);
  console.log("Chain:  ", chain);
  console.log("1. Discovering approvals...");

  const approvals = await getWalletApprovals(wallet, chain);
  console.log(`Discovered ${approvals.length} approvals.`);

  if (approvals.length === 0) {
    console.log("No approvals found to correlate.");
    return;
  }

  const allowancesMap = {};
  const securityMap = {};

  console.log("2. Verifying live allowances & auditing spender contracts...");

  for (const appr of approvals) {
    const token = appr.token.address;
    const spender = appr.spender.address;
    const key = `${token.toLowerCase()}:${spender.toLowerCase()}`;

    // Live on-chain allowance call via Alchemy
    const liveAllowance = await verifyCurrentAllowance(token, wallet, spender, chain);
    allowancesMap[key] = liveAllowance;

    // Contract security audit via GoPlus
    if (!securityMap[spender.toLowerCase()]) {
      const sec = await getContractSecurity(spender, chain);
      securityMap[spender.toLowerCase()] = sec;
    }
  }

  console.log("3. Running Deterministic Correlation Rules...\n");
  const exposures = correlateApprovals(approvals, allowancesMap, securityMap);

  console.log(` SUCCESS! Evaluated ${exposures.length} Correlated Exposures:\n`);
  exposures.forEach((exp, idx) => {
    console.log(`[Exposure #${idx + 1}]`);
    console.log(`  Status:   ${exp.status.toUpperCase()}`);
    console.log(`  Token:    ${exp.token}`);
    console.log(`  Spender:  ${exp.contract}`);
    console.log(`  Reason:   ${exp.reason}\n`);
  });

  console.log("=========================================");
}

main();
