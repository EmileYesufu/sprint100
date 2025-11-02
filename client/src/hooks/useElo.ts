/**
 * Custom hook for fetching and managing user ELO rating
 * Provides a centralized source of truth for ELO across the app
 */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import { getServerUrl } from "@/config";

export function useElo() {
  const { user, token } = useAuth();
  const [elo, setElo] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchElo = useCallback(async () => {
    if (!user?.id || !token) {
      setElo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getServerUrl()}/api/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ELO: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setElo(data.elo ?? null);
    } catch (err: any) {
      console.error("Failed to fetch ELO:", err.message);
      setError(err.message);
      // Fallback to user.elo from auth context if fetch fails
      setElo(user.elo ?? null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, token, user?.elo]);

  useEffect(() => {
    fetchElo();
  }, [fetchElo]);

  return { elo, isLoading, error, refreshElo: fetchElo };
}

