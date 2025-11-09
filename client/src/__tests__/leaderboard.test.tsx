import React from "react";
import LeaderboardScreen from "@/screens/LeaderboardScreen";
import { useAuth } from "@/hooks/useAuth";
import { useElo } from "@/hooks/useElo";

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/hooks/useElo", () => ({
  useElo: jest.fn(),
}));

jest.mock("@/config", () => ({
  getServerUrl: () => "http://localhost",
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseElo = useElo as jest.Mock;

describe("Leaderboard state handling", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockUseAuth.mockReturnValue({ token: "mock-token", user: { id: 1 } });
    mockUseElo.mockReturnValue({ elo: 1200, refreshElo: jest.fn() });
  });

  it("handles empty list without crashing", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const screen = render(<LeaderboardScreen />);
    expect(screen).toBeTruthy();
  });

  it("handles error response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const screen = render(<LeaderboardScreen />);
    expect(screen).toBeTruthy();
  });
});
