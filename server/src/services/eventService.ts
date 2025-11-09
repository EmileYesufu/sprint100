import prisma from "../prismaClient";

export type BaseEventPayload = {
  eventName: string;
  timestamp?: string;
  metadata?: Record<string, unknown> | null;
};

const ALLOWED_EVENTS = new Set([
  "auth_login",
  "race_start",
  "race_end",
  "training_start",
  "training_end",
]);

const MAX_METADATA_LENGTH = 1024 * 4; // 4KB JSON string cap

function sanitizeMetadata(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  try {
    const serialized = JSON.stringify(metadata);
    if (serialized.length > MAX_METADATA_LENGTH) {
      return null;
    }
    return JSON.parse(serialized);
  } catch {
    return null;
  }
}

export function validateEventPayload(event: BaseEventPayload) {
  if (!event || typeof event.eventName !== "string") {
    throw new Error("invalid_event_name");
  }

  if (!ALLOWED_EVENTS.has(event.eventName)) {
    throw new Error("unsupported_event");
  }

  const timestamp = event.timestamp ? new Date(event.timestamp) : new Date();
  if (Number.isNaN(timestamp.getTime())) {
    throw new Error("invalid_timestamp");
  }

  const metadata = sanitizeMetadata(event.metadata ?? null);

  return {
    eventName: event.eventName,
    timestamp,
    metadata,
  };
}

export async function recordEvents(userId: number, events: BaseEventPayload[]) {
  if (!events.length) {
    return;
  }

  const validated = events.map(validateEventPayload);

  await prisma.appEvent.createMany({
    data: validated.map((event) => ({
      userId,
      eventName: event.eventName,
      createdAt: event.timestamp,
      metadata: event.metadata,
    })),
  });
}

export { ALLOWED_EVENTS };
