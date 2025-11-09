export const getServerUrl = (): string =>
  process.env.EXPO_PUBLIC_API_URL ?? "https://api.sprint100.app";

export const getWsUrl = (): string =>
  process.env.EXPO_PUBLIC_WS_URL ?? "wss://api.sprint100.app";
