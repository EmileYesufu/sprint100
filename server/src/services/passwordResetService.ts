import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "../prismaClient";
import { sendPasswordResetEmail } from "./mailService";

const RESET_TOKEN_TTL_MS = Number(process.env.RESET_TOKEN_TTL_MS || 1000 * 60 * 30); // 30 minutes default

export class PasswordResetError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const db: any = prisma;

export async function createPasswordResetRequest(email: string): Promise<void> {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    // Avoid leaking account existence
    return;
  }

  await db.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      consumed: false,
    },
    data: {
      consumed: true,
      consumedAt: new Date(),
    },
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  await sendPasswordResetEmail({
    email: user.email,
    token: rawToken,
    expiresAt,
  });
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  const trimmedToken = token?.trim();
  if (!trimmedToken) {
    throw new PasswordResetError("invalid_or_expired_token", "Reset token is required.");
  }

  if (!newPassword || newPassword.length < 8) {
    throw new PasswordResetError("invalid_password", "Password must be at least 8 characters long.");
  }

  const tokenHash = hashToken(trimmedToken);

  const tokenRecord = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!tokenRecord || tokenRecord.consumed || tokenRecord.expiresAt < new Date()) {
    throw new PasswordResetError("invalid_or_expired_token", "The reset link is invalid or has expired.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db.$transaction(async (trx: any) => {
    await trx.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: {
        consumed: true,
        consumedAt: new Date(),
      },
    });

    await trx.user.update({
      where: { id: tokenRecord.userId },
      data: {
        password: passwordHash,
      },
    });

    await trx.passwordResetToken.updateMany({
      where: {
        userId: tokenRecord.userId,
        consumed: false,
      },
      data: {
        consumed: true,
        consumedAt: new Date(),
      },
    });
  });
}
