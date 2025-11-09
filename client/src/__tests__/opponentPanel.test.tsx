jest.mock("react-native", () => {
  const React = require("react");
  const Mock = ({ children }: any) => React.createElement("div", null, children);
  return {
    View: Mock,
    Text: Mock,
    StyleSheet: { create: (styles: any) => styles },
  };
});

import { OpponentPanelComponent } from "@/screens/Race/components/OpponentPanel";

describe("OpponentPanelComponent", () => {
  it("returns null when no players", () => {
    expect(
      OpponentPanelComponent({ players: [], currentUserId: 1 })
    ).toBeNull();
  });

  it("returns element when players exist", () => {
    const element = OpponentPanelComponent({
      currentUserId: 1,
      players: [
        { userId: 1, email: "me@example.com", meters: 55, steps: 100, position: 1, isPlayer: true },
        { userId: 2, email: "opponent@example.com", meters: 42, steps: 90, position: 2, isPlayer: false },
      ],
    });

    expect(element).not.toBeNull();
  });
});
