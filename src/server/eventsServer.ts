import express from "express";
import cors from "cors";
import { z } from "zod";
import { handleEvent } from "../lib/handleEvent";

const app = express();
app.use(cors());
app.use(express.json());

const EventSchema = z.object({
  type: z.enum(["OrderCreated", "OrderReleased"]),
  payload: z.object({
    orderId: z.string().min(1).max(100),
    createdAt: z.string().optional(),
    items: z.array(z.object({
      sku: z.string().min(1).max(50),
      quantity: z.number().int().positive().max(10000),
    })).min(1).max(100).optional(),
  }),
});

function logSafeError(context: string, error: any) {
  if (process.env.NODE_ENV === "production") {
    console.error(`[${context}] Error occurred:`, {
      type: error?.name,
      code: error?.code,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.error(`[${context}] Error:`, error);
  }
}

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Events server is running" });
});

app.post("/events", (req, res): void => {
  try {
    // Validate auth token
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Validate input
    const result = EventSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Invalid event data" });
      return;
    }

    console.log("[EVENTS] Evento recebido:", { type: result.data.type });
    handleEvent(result.data);
    res.sendStatus(200);
  } catch (error) {
    logSafeError("EventProcessing", error);
    res.sendStatus(500);
  }
});

app.listen(4001, () => {
  console.log("📦 Events server running on http://localhost:4001");
});
