const APP_NAME = process.env.APP_NAME || "Sprint100";
const RESET_BASE_URL = process.env.APP_RESET_URL || "app://reset";

export interface PasswordResetMailOptions {
  email: string;
  token: string;
  expiresAt: Date;
}

function buildResetLink(token: string) {
  const baseUrl = RESET_BASE_URL;
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("token", token);
    return url.toString();
  } catch (error) {
    // If baseUrl is not a valid URL (e.g., custom scheme), fallback to manual concatenation
    if (baseUrl.includes("?")) {
      return `${baseUrl}&token=${encodeURIComponent(token)}`;
    }
    const separator = baseUrl.endsWith("?") ? "" : baseUrl.includes("?") ? "&" : baseUrl.includes("#") ? "" : "?";
    return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
  }
}

export async function sendPasswordResetEmail({ email, token, expiresAt }: PasswordResetMailOptions) {
  const resetLink = buildResetLink(token);
  const subject = `${APP_NAME} Password Reset`;
  const body = `
You requested a password reset for ${APP_NAME}.

Reset link: ${resetLink}

This link expires at ${expiresAt.toISOString()}.
If you did not request this reset, you can ignore this email.
`;

  if (process.env.NODE_ENV !== "production") {
    console.log("[mailService] Password reset email", { email, subject, body });
    return;
  }

  // Placeholder for future delivery integration
  // e.g., send via SES, SendGrid, etc.
  console.info(`Password reset email dispatched to ${email}`);
}
