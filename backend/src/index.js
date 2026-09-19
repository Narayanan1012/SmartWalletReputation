import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getLatestBlockNumber, getWalletActivity } from "./services/alchemy.js";
import { getWalletApprovals } from "./services/approvals.js";

dotenv.config();

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || "4000", 10);

// Helper function to validate Ethereum/EVM address format
function isValidEvmAddress(address) {
  return typeof address === "string" && /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

// Enable CORS so the Next.js frontend (localhost:3000) can communicate with this API
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Milestone 1: Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Milestone 2: Address analysis endpoint skeleton
app.post("/api/analyze", (req, res) => {
  const { address } = req.body || {};

  if (!address) {
    return res.status(400).json({ error: "Address is required." });
  }

  if (!isValidEvmAddress(address)) {
    return res.status(400).json({
      error: "Invalid EVM address format. An EVM address must start with 0x followed by 40 hexadecimal characters (42 chars total)."
    });
  }

  // Address accepted! Returning initial confirmation
  res.json({
    address: address.trim(),
    status: "received"
  });
});

// Milestone 3: Alchemy connection test endpoint
app.get("/api/test/alchemy", async (req, res) => {
  try {
    const chain = req.query.chain === "base" ? "base" : "ethereum";
    const data = await getLatestBlockNumber(chain);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to connect to blockchain RPC",
      details: error.message,
    });
  }
});

// Milestone 4: Address activity test endpoint
app.get("/api/test/activity", async (req, res) => {
  try {
    const address = req.query.address || "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    const chain = req.query.chain === "base" ? "base" : "ethereum";
    const count = parseInt(req.query.count || "5", 10);

    if (!isValidEvmAddress(address)) {
      return res.status(400).json({ error: "Invalid address format" });
    }

    const data = await getWalletActivity(address, chain, count);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch wallet activity from Alchemy",
      details: error.message,
    });
  }
});

// Milestone 5: Token approvals discovery endpoint
app.get("/api/test/approvals", async (req, res) => {
  try {
    const address = req.query.address || "0x85f6be9460291e86e0fb49b07d0a83cc5f7206cd";
    const chain = req.query.chain === "base" ? "base" : "ethereum";

    if (!isValidEvmAddress(address)) {
      return res.status(400).json({ error: "Invalid address format" });
    }

    const approvals = await getWalletApprovals(address, chain);
    res.json({
      address,
      chain,
      count: approvals.length,
      approvals,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to discover token approvals",
      details: error.message,
    });
  }
});

// Catch-all route to ensure JSON is always returned instead of HTML 404
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}. Please restart the backend server (Ctrl+C then npm run dev) to load new routes.`,
  });
});

// Function to start server with automatic port fallback if port is in use
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`SmartWallet Reputation Backend running on http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${port} is currently in use. Automatically trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer(DEFAULT_PORT);
