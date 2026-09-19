import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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
