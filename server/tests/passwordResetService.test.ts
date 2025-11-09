const mockPrisma: any = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  passwordResetToken: {
    updateMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((fn) => fn(mockPrisma)),
};

const sendPasswordResetEmailMock = jest.fn();

jest.mock("../src/prismaClient", () => ({
  __esModule: true,
  default: mockPrisma,
}));

jest.mock("../src/services/mailService", () => ({
  __esModule: true,
  sendPasswordResetEmail: sendPasswordResetEmailMock,
}));

import bcrypt from "bcryptjs";
import {
  createPasswordResetRequest,
  resetPasswordWithToken,
  PasswordResetError,
} from "../src/services/passwordResetService";

describe("passwordResetService", () => {
  const mockUser = { id: 1, email: "user@example.com", password: "hash" };

  beforeEach(() => {
    mockPrisma.user.findUnique.mockReset();
    mockPrisma.user.update.mockReset();
    mockPrisma.passwordResetToken.updateMany.mockReset();
    mockPrisma.passwordResetToken.create.mockReset();
    mockPrisma.passwordResetToken.findUnique.mockReset();
    mockPrisma.passwordResetToken.update.mockReset();
    mockPrisma.$transaction.mockImplementation((fn: any) => fn(mockPrisma));
    sendPasswordResetEmailMock.mockClear();
    jest.spyOn(bcrypt, "hash").mockRestore();
  });

  it("creates reset request and sends mail when user exists", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    await createPasswordResetRequest(mockUser.email);

    expect(mockPrisma.passwordResetToken.updateMany).toHaveBeenCalled();
    expect(mockPrisma.passwordResetToken.create).toHaveBeenCalled();
    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ email: mockUser.email, token: expect.any(String) })
    );
  });

  it("ignores reset request when user is missing", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await createPasswordResetRequest("unknown@example.com");

    expect(mockPrisma.passwordResetToken.create).not.toHaveBeenCalled();
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
  });

  it("resets password with valid token", async () => {
    const rawPassword = "newpassword";
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 10,
      userId: mockUser.id,
      tokenHash: "hash",
      consumed: false,
      expiresAt: new Date(Date.now() + 1000 * 60),
      user: mockUser,
    });
    jest.spyOn(bcrypt, "hash").mockImplementation(async () => "hashed");

    await resetPasswordWithToken("token", rawPassword);

    expect(mockPrisma.$transaction).toHaveBeenCalled();
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockUser.id },
        data: expect.objectContaining({ password: "hashed" }),
      })
    );
  });

  it("throws error for invalid token", async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue(null);

    await expect(resetPasswordWithToken("bad-token", "newpassword")).rejects.toMatchObject({
      code: "invalid_or_expired_token",
      message: "The reset link is invalid or has expired.",
    });
  });

  it("throws error for expired token", async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      id: 11,
      userId: mockUser.id,
      tokenHash: "hash",
      consumed: false,
      expiresAt: new Date(Date.now() - 1000),
      user: mockUser,
    });

    await expect(resetPasswordWithToken("expired", "newpassword")).rejects.toMatchObject({
      code: "invalid_or_expired_token",
      message: "The reset link is invalid or has expired.",
    });
  });
});
