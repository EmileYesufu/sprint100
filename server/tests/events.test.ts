import prisma from "../src/prismaClient";
import { recordEvents } from "../src/services/eventService";

jest.mock("../src/prismaClient", () => ({
  __esModule: true,
  default: {
    appEvent: {
      createMany: jest.fn(),
    },
  },
}));

describe("eventService", () => {
  const appEventMock = (prisma as unknown as { appEvent: { createMany: jest.Mock } }).appEvent.createMany;

  beforeEach(() => {
    appEventMock.mockClear();
  });

  it("persists allowed events", async () => {
    await recordEvents(1, [
      { eventName: "training_start", metadata: { difficulty: "Medium", aiCount: 3 } },
      { eventName: "training_end", metadata: { position: 1, finishTimeMs: 12000 } },
    ]);

    expect(appEventMock).toHaveBeenCalledTimes(1);
    const args = appEventMock.mock.calls[0]?.[0] ?? {};
    expect(Array.isArray(args.data)).toBe(true);
    expect(args.data).toHaveLength(2);
    expect(args.data[0]).toEqual(
      expect.objectContaining({
        userId: 1,
        eventName: "training_start",
      })
    );
  });

  it("rejects unsupported events", async () => {
    await expect(
      recordEvents(1, [{ eventName: "unknown_event" }])
    ).rejects.toThrow("unsupported_event");
    expect(appEventMock).not.toHaveBeenCalled();
  });

  it("rejects invalid timestamps", async () => {
    await expect(
      recordEvents(1, [{ eventName: "auth_login", timestamp: "not-a-date" }])
    ).rejects.toThrow("invalid_timestamp");
    expect(appEventMock).not.toHaveBeenCalled();
  });
});
