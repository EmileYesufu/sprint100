import { getProfileEmptyState } from "@/screens/profileHelpers";

describe("getProfileEmptyState", () => {
  it("returns default message when history empty", () => {
    const state = getProfileEmptyState(null);
    expect(state).toEqual({
      title: "No matches played yet",
      message: "",
      showRetry: false,
    });
  });

  it("returns error message when provided", () => {
    const state = getProfileEmptyState("Server error");
    expect(state).toEqual({
      title: "Unable to load match history",
      message: "Server error",
      showRetry: true,
    });
  });
});
