jest.mock("@/config", () => ({
  getServerUrl: () => "http://localhost",
}));

import { requestPasswordReset, submitPasswordReset } from "@/services/passwordResetClient";

describe("Password reset client service", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    (global.fetch as jest.Mock | undefined)?.mockReset?.();
  });

  it("handles forgot password success", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "sent" }),
    });

    await expect(requestPasswordReset("user@example.com")).resolves.toEqual({ message: "sent" });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost/api/auth/forgot",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("handles reset password success", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "ok" }),
    });

    await expect(submitPasswordReset("token", "newpassword")).resolves.toEqual({ message: "ok" });
  });

  it("throws invalid token error", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { code: "invalid_or_expired_token", message: "Invalid" } }),
    });

    await expect(submitPasswordReset("bad-token", "newpassword")).rejects.toMatchObject({
      message: "Invalid",
      code: "invalid_or_expired_token",
    });
  });

  it("throws expired token error with default message", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { code: "invalid_or_expired_token" } }),
    });

    await expect(submitPasswordReset("expired", "newpassword")).rejects.toMatchObject({
      code: "invalid_or_expired_token",
      message: "Unable to reset password.",
    });
  });
});
