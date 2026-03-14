#!/usr/bin/env node
import express from "express";
import cors from "cors";
import pino from 'pino';
import pinoHttp from 'pino-http';

const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:8082',
  process.env.PRODUCTION_DOMAIN,
].filter(Boolean);

const app = express();
const logger = pino({ level: 'info' });
const httpLogger = pinoHttp({ logger });

const PORT = 4001;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
}));
app.use(httpLogger);
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

    req.log.info({ event_type: event.type }, "[EVENTS] ✅ Evento recebido");
    req.log.info("[EVENTS] ✅ Evento será processado pela aplicação React");

    res.json({ status: "success", message: "Event received" });
  } catch (error) {
    req.log.error({ err: error }, "[EVENTS] ❌ Erro ao processar evento");
    res.status(500).json({ status: "error", message: "Failed to process event" });
  }
});

app.listen(PORT, () => {
  logger.info(`📦 Events server running on http://localhost:${PORT}`);
  logger.info(`   Health check: http://localhost:${PORT}/health`);
  logger.info(`   Waiting for OrderCreated and OrderReleased events...`);
});

// Handle shutdown gracefully
process.on("SIGINT", () => {
  logger.info("\n🛑 Events server stopping...");
  process.exit(0);
});
