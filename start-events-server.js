#!/usr/bin/env node
import express from "express";
import cors from "cors";

const app = express();
const PORT = 4001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Events server is running" });
});

// Events endpoint - receive OrderCreated and OrderReleased events
app.post("/events", (req, res) => {
  try {
    // Validate auth token
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const event = req.body;

    // Basic validation
    if (!event.type || !event.payload) {
      return res.status(400).json({ error: "Invalid event data" });
    }

    console.log("[EVENTS] ✅ Evento recebido:", event.type);
    console.log("[EVENTS] ✅ Evento será processado pela aplicação React");

    res.json({ status: "success", message: "Event received" });
  } catch (error) {
    console.error("[EVENTS] ❌ Erro ao processar evento");
    res.status(500).json({ status: "error", message: "Failed to process event" });
  }
});

app.listen(PORT, () => {
  console.log(`📦 Events server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Waiting for OrderCreated and OrderReleased events...`);
});

// Handle shutdown gracefully
process.on("SIGINT", () => {
  console.log("\n🛑 Events server stopping...");
  process.exit(0);
});
