import { getServerUrl } from "@/config";

const MAX_BATCH_SIZE = 10;
const FLUSH_RETRY_DELAY_MS = 2000;

interface PendingEvent {
  eventName: string;
  metadata: Record<string, unknown> | null;
  timestamp: string;
}

let currentToken: string | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isFlushing = false;
const queue: PendingEvent[] = [];

function scheduleFlush(delay = 0) {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  flushTimer = setTimeout(() => {
    void flushQueue();
  }, delay);
}

export function setEventLoggerToken(token: string | null) {
  currentToken = token;
  if (token && queue.length > 0) {
    scheduleFlush();
  }
}

function sanitizeMetadata(metadata?: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
      safe[key] = value;
    }
  }

  return Object.keys(safe).length > 0 ? safe : null;
}

export function logEvent(eventName: string, metadata?: Record<string, unknown>) {
  const entry: PendingEvent = {
    eventName,
    metadata: sanitizeMetadata(metadata),
    timestamp: new Date().toISOString(),
  };

  queue.push(entry);

  if (currentToken) {
    scheduleFlush();
  }
}

async function flushQueue(): Promise<void> {
  if (isFlushing || !currentToken || queue.length === 0) {
    return;
  }

  isFlushing = true;

  try {
    const batch = queue.slice(0, MAX_BATCH_SIZE);
    const response = await fetch(`${getServerUrl()}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({ events: batch.map(({ eventName, metadata, timestamp }) => ({ eventName, metadata, timestamp })) }),
    });

    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }

    queue.splice(0, batch.length);
    if (queue.length > 0) {
      scheduleFlush();
    }
  } catch (error) {
    // Swallow errors silently and retry later
    scheduleFlush(FLUSH_RETRY_DELAY_MS);
  } finally {
    isFlushing = false;
  }
}
