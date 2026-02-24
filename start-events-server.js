#!/usr/bin/env node
import express from "express";
import cors from "cors";
import { createRequire } from "module";

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
    const event = req.body;
    
    console.log("[EVENTS] ✅ Evento recebido:", event.type);
    console.log("[EVENTS] Payload:", JSON.stringify(event.payload, null, 2));
    
    // Store event in memory or localStorage for the React app to process
    // The React app (vite + Zustand) will handle this via its own event processing
    console.log("[EVENTS] ✅ Evento será processado pela aplicação React");
    
    res.json({ status: "success", message: "Event received" });
  } catch (error) {
    console.error("[EVENTS] ❌ Erro ao processar evento:", error);
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
