export interface LeaderboardEmptyState {
  title: string;
  message: string;
  showRetry: boolean;
}

export function getLeaderboardEmptyState(error?: string | null): LeaderboardEmptyState {
  if (error) {
    return {
      title: "Unable to load leaderboard",
      message: error,
      showRetry: true,
    };
  }

  return {
    title: "No players on leaderboard yet.",
    message: "",
    showRetry: false,
  };
}
