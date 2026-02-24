import express from "express";
import cors from "cors";
import { handleEvent } from "./handleEvent";

const app = express();
const PORT = 4001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Events server is running" });
});

// Events endpoint
app.post("/events", (req, res) => {
  try {
    console.log("[EVENTS] Evento recebido:", req.body.type);
    console.log("[EVENTS] Payload:", req.body.payload);
    handleEvent(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("[EVENTS] Erro ao processar evento:", error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`📦 Events server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});

// Handle shutdown gracefully
process.on("SIGINT", () => {
  console.log("\n🛑 Events server stopping...");
  process.exit(0);
});
