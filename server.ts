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
