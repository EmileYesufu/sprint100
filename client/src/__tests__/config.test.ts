jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

describe("config getServerUrl", () => {
  afterEach(() => {
    jest.resetModules();
    delete process.env.EXPO_PUBLIC_API_URL;
    delete process.env.SERVER_URL;
  });

  it("prefers env over fallback", async () => {
    process.env.EXPO_PUBLIC_API_URL = "https://env.example.com";
    const { getServerUrl } = await import("@/config");
    expect(getServerUrl()).toBe("https://env.example.com");
  });

  it("warns once when missing", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { getServerUrl } = await import("@/config");
    expect(getServerUrl()).toBe("http://localhost:4000");
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });
});
