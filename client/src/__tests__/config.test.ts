describe("config getServerUrl", () => {
  afterEach(() => {
    jest.resetModules();
    delete process.env.EXPO_PUBLIC_API_URL;
    delete process.env.EXPO_PUBLIC_WS_URL;
  });

  it("prefers env over fallback", async () => {
    process.env.EXPO_PUBLIC_API_URL = "https://env.example.com";
    const { getServerUrl } = await import("@/config");
    expect(getServerUrl()).toBe("https://env.example.com");
  });

  it("falls back to production URL when env missing", async () => {
    const { getServerUrl } = await import("@/config");
    expect(getServerUrl()).toBe("https://api.sprint100.app");
  });

  it("returns websocket env value when provided", async () => {
    process.env.EXPO_PUBLIC_WS_URL = "wss://ws.example.com";
    const { getWsUrl } = await import("@/config");
    expect(getWsUrl()).toBe("wss://ws.example.com");
  });

  it("falls back to production websocket URL", async () => {
    const { getWsUrl } = await import("@/config");
    expect(getWsUrl()).toBe("wss://api.sprint100.app");
  });
});
