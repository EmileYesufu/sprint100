import React from "react";

jest.mock("react-native", () => {
  const React = require("react");
  const MockComponent = ({ children }: any) => <>{children}</>;
  return {
    View: MockComponent,
    Text: MockComponent,
    TouchableOpacity: MockComponent,
    StyleSheet: { create: () => ({}) },
    Dimensions: { get: () => ({ width: 375, height: 812 }) },
    Modal: MockComponent,
    ActivityIndicator: MockComponent,
  };
});

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => <>{children}</>,
}));

jest.mock("@/components/NetworkDisconnectModal", () => ({
  NetworkDisconnectModal: () => null,
}));

import RaceScreenWithNetworkHandling from "@/screens/Race/RaceScreenWithNetworkHandling";

jest.mock("@/hooks/useRace", () => ({
  useRace: () => ({
    raceState: {
      status: "racing",
      countdown: null,
      myMeters: 42,
      opponentMeters: 38,
      result: null,
      isLocallyEnded: false,
      localEndResult: null,
      clientPlacings: [],
    },
    networkState: {
      isConnected: true,
      isReconnecting: false,
      showDisconnectModal: false,
    },
    handleTap: jest.fn(),
    dismissDisconnectModal: jest.fn(),
    forceReconnect: jest.fn(),
  }),
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: 1, email: "test@example.com", username: "tester", elo: 1200 },
    token: "mock-token",
  }),
}));

describe("Navigation smoke tests", () => {
  it("renders the resilient race screen without crashing", () => {
    const navigation = {
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      setOptions: jest.fn(),
    };

    expect(() =>
      RaceScreenWithNetworkHandling({
        navigation: navigation as any,
        route: {
          key: "Race",
          name: "Race",
          params: {
            matchId: 123,
            opponent: {
              userId: 2,
              username: "Opponent",
              email: "opponent@example.com",
              elo: 1180,
            },
          },
        } as any,
      })
    ).not.toThrow();
  });
});
