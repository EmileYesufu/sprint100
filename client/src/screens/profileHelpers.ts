export interface ProfileEmptyState {
  title: string;
  message: string;
  showRetry: boolean;
}

export function getProfileEmptyState(error?: string | null): ProfileEmptyState {
  if (error) {
    return {
      title: "Unable to load match history",
      message: error,
      showRetry: true,
    };
  }

  return {
    title: "No matches played yet",
    message: "",
    showRetry: false,
  };
}
