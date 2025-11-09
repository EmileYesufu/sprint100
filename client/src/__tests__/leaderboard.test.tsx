import { getLeaderboardEmptyState } from "@/screens/leaderboardHelpers";

describe("getLeaderboardEmptyState", () => {
  it("returns default empty state when no data", () => {
    const result = getLeaderboardEmptyState(null);
    expect(result).toEqual({
      title: "No players on leaderboard yet.",
      message: "",
      showRetry: false,
    });
  });

  it("returns error state when message provided", () => {
    const result = getLeaderboardEmptyState("Server error");
    expect(result).toEqual({
      title: "Unable to load leaderboard",
      message: "Server error",
      showRetry: true,
    });
  });
});
