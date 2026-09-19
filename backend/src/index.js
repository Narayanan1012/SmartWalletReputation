import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || "4000", 10);

// Enable CORS so the Next.js frontend (localhost:3000) can communicate with this API
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Milestone 1: Simple health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
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
