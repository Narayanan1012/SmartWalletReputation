import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS so the Next.js frontend (localhost:3000) can communicate with this API
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Milestone 1: Simple health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`SmartWallet Reputation Backend running on http://localhost:${PORT}`);
});
