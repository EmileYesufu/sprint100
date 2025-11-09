export const getServerUrl = (): string =>
  process.env.EXPO_PUBLIC_API_URL ?? "https://sprint100-production.up.railway.app";

export const getWsUrl = (): string =>
  process.env.EXPO_PUBLIC_WS_URL ?? "wss://sprint100-production.up.railway.app";
