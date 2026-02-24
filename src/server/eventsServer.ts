import express from "express";
import cors from "cors";
import { handleEvent } from "../lib/handleEvent";

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Events server is running" });
});

app.post("/events", (req, res) => {
  try {
    console.log("[EVENTS] Evento recebido:", {
      type: req.body.type,
      orderId: req.body.payload?.orderId,
    });
    handleEvent(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error handling event:", error);
    res.sendStatus(500);
  }
});

app.listen(4001, () => {
  console.log("📦 Events server running on http://localhost:4001");
  console.log("📦 Health check: http://localhost:4001/health");
});
