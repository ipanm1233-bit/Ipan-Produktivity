import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface SyncPayload {
  tasks: any[];
  finances: any[];
  categories: any[];
  financeCategories: any[];
  monthlyBudget: number;
  voiceSettings: any;
  customReminders: any[];
  theme: string;
  lastUpdated: number;
  deviceId?: string;
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// In-memory store for sync rooms (keyed by room ID / sync key)
const roomDataStore = new Map<string, SyncPayload>();
const roomClients = new Map<string, Set<Response>>();

// Health endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

// SSE endpoint for live real-time sync
app.get("/api/sync/stream/:roomId", (req: Request, res: Response) => {
  const { roomId } = req.params;
  if (!roomId) {
    res.status(400).end();
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  if (!roomClients.has(roomId)) {
    roomClients.set(roomId, new Set());
  }
  const clients = roomClients.get(roomId)!;
  clients.add(res);

  // Send current state immediately if present
  const currentData = roomDataStore.get(roomId);
  if (currentData) {
    res.write(`data: ${JSON.stringify({ type: "SYNC_UPDATE", payload: currentData })}\n\n`);
  } else {
    res.write(`data: ${JSON.stringify({ type: "INIT", message: "Connected to room " + roomId })}\n\n`);
  }

  // Keep-alive ping every 25s
  const keepAlive = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      clearInterval(keepAlive);
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(keepAlive);
    clients.delete(res);
    if (clients.size === 0) {
      roomClients.delete(roomId);
    }
  });
});

// REST endpoint to get data for a room
app.get("/api/sync/:roomId", (req: Request, res: Response) => {
  const { roomId } = req.params;
  const data = roomDataStore.get(roomId);
  if (!data) {
    res.status(404).json({ error: "Room not found or empty" });
    return;
  }
  res.json({ success: true, payload: data });
});

// REST endpoint to push update to a room and broadcast to connected SSE devices
app.post("/api/sync/:roomId", (req: Request, res: Response) => {
  const { roomId } = req.params;
  const incomingPayload = req.body as SyncPayload;

  if (!roomId || !incomingPayload) {
    res.status(400).json({ error: "Invalid payload or room ID" });
    return;
  }

  const existing = roomDataStore.get(roomId);
  // Compare timestamps if needed, or take newest
  const updatedPayload: SyncPayload = {
    ...incomingPayload,
    lastUpdated: incomingPayload.lastUpdated || Date.now(),
  };

  roomDataStore.set(roomId, updatedPayload);

  // Broadcast to all active clients in this room (excluding sender if deviceId matches)
  const clients = roomClients.get(roomId);
  if (clients && clients.size > 0) {
    const broadcastMsg = `data: ${JSON.stringify({ type: "SYNC_UPDATE", payload: updatedPayload })}\n\n`;
    for (const client of clients) {
      try {
        client.write(broadcastMsg);
      } catch (err) {
        clients.delete(client);
      }
    }
  }

  res.json({
    success: true,
    lastUpdated: updatedPayload.lastUpdated,
    connectedDevices: clients ? clients.size : 1,
  });
});

// Generate iCalendar (.ics) download for tasks
app.get("/api/calendar/export/:roomId?", (req: Request, res: Response) => {
  const roomId = req.params.roomId;
  let tasks: any[] = [];
  if (roomId && roomDataStore.has(roomId)) {
    tasks = roomDataStore.get(roomId)?.tasks || [];
  }

  // Format as RFC 5545 iCalendar standard
  const nowStr = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  let icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Productivity Tracker//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Productivity Tracker Tasks",
    "X-WR-TIMEZONE:UTC",
  ];

  for (const task of tasks) {
    if (!task.dueDate) continue;
    const taskDate = new Date(task.dueDate);
    const startStr = taskDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    // Default 1 hr duration
    const endDate = new Date(taskDate.getTime() + (task.estimatedMinutes ? task.estimatedMinutes * 60000 : 3600000));
    const endStr = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    icsLines.push(
      "BEGIN:VEVENT",
      `UID:task-${task.id || Math.random().toString(36).substring(2)}@productivitytracker.app`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${task.title?.replace(/\n/g, " ") || "Task"}`,
      `DESCRIPTION:${(task.description || "").replace(/\n/g, "\\n")} [Prioritas: ${task.priority || "Normal"}, Kategori: ${task.category || "General"}]`,
      `STATUS:${task.completed ? "COMPLETED" : "CONFIRMED"}`,
      `PRIORITY:${task.priority === "urgent" ? "1" : task.priority === "high" ? "2" : task.priority === "medium" ? "5" : "9"}`,
      "END:VEVENT"
    );
  }

  icsLines.push("END:VCALENDAR");

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="tasks-schedule.ics"');
  res.send(icsLines.join("\r\n"));
});

// High-quality Indonesian Text-to-Speech (TTS) endpoint
app.get("/api/tts", async (req: Request, res: Response) => {
  try {
    const rawText = (req.query.text as string || "").trim();
    const lang = (req.query.lang as string || "id").trim();

    if (!rawText) {
      res.status(400).json({ error: "Missing text parameter" });
      return;
    }

    // Clean text for natural Indonesian speech
    const cleanText = rawText
      .replace(/Rp\s?/g, "Rupiah ")
      .replace(/%/g, " persen ")
      .replace(/\//g, " atau ")
      .replace(/[^\w\s.,!?:-]/gi, "");

    // Break text into sentences / chunks under 150 chars for the TTS engine
    const sentenceList = cleanText.match(/[^.!?\n,]+[.!?\n,]?|.+/g) || [cleanText];
    const chunks: string[] = [];
    let cur = "";

    for (const s of sentenceList) {
      const part = s.trim();
      if (!part) continue;
      if ((cur + " " + part).trim().length <= 150) {
        cur = (cur + " " + part).trim();
      } else {
        if (cur) chunks.push(cur);
        if (part.length > 150) {
          const words = part.split(" ");
          let temp = "";
          for (const w of words) {
            if ((temp + " " + w).trim().length <= 150) {
              temp = (temp + " " + w).trim();
            } else {
              if (temp) chunks.push(temp);
              temp = w;
            }
          }
          if (temp) chunks.push(temp);
          cur = "";
        } else {
          cur = part;
        }
      }
    }
    if (cur) chunks.push(cur);

    if (chunks.length === 0) {
      res.status(400).json({ error: "No valid voice characters" });
      return;
    }

    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
      const ttsRes = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Referer": "https://translate.google.com/",
          "Accept": "audio/mpeg, audio/*; q=0.9, */*; q=0.1"
        }
      });

      if (ttsRes.ok) {
        const ab = await ttsRes.arrayBuffer();
        audioBuffers.push(Buffer.from(ab));
      }
    }

    if (audioBuffers.length === 0) {
      res.status(502).json({ error: "TTS audio synthesis failed" });
      return;
    }

    const combinedBuffer = Buffer.concat(audioBuffers);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", combinedBuffer.length);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(combinedBuffer);
  } catch (err: any) {
    console.error("TTS endpoint error:", err);
    res.status(500).json({ error: err.message || "Failed to generate speech audio" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Productivity & Finance server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
