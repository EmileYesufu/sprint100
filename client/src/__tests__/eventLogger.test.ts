jest.mock("@/config", () => ({
  getServerUrl: () => "http://localhost",
}));

describe("eventLogger", () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("silently absorbs failures", async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error("network"));
    (global as any).fetch = fetchMock;

    const { logEvent, setEventLoggerToken } = await import("@/services/eventLogger");

    expect(() => logEvent("training_start", { aiCount: 3 })).not.toThrow();
    setEventLoggerToken("token");

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).toHaveBeenCalled();
  });

  it("sends batches when possible", async () => {
    const responses: Array<{ body: any }> = [];
    (global as any).fetch = jest.fn().mockImplementation((_url: string, options: RequestInit) => {
      responses.push({ body: JSON.parse(options.body as string) });
      return Promise.resolve({ ok: true });
    });

    const { logEvent, setEventLoggerToken } = await import("@/services/eventLogger");

    logEvent("race_start", { matchId: 10 });
    logEvent("race_end", { matchId: 10, outcome: "win" });
    setEventLoggerToken("token");

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(responses.length).toBeGreaterThan(0);
    const payload = responses[0].body;
    expect(Array.isArray(payload.events)).toBe(true);
    expect(payload.events.length).toBeGreaterThanOrEqual(1);
  });
});
