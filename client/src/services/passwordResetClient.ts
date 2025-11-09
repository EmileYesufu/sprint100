import { getServerUrl } from "@/config";

export async function requestPasswordReset(email: string) {
  const response = await fetch(`${getServerUrl()}/api/auth/forgot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || data?.message || "Unable to send reset link.";
    throw new Error(message);
  }

  return data;
}

export async function submitPasswordReset(token: string, password: string) {
  const response = await fetch(`${getServerUrl()}/api/auth/reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || data?.message || "Unable to reset password.";
    const code = data?.error?.code;
    const error = new Error(message) as Error & { code?: string };
    if (code) error.code = code;
    throw error;
  }

  return data;
}
