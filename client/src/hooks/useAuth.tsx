/**
 * Authentication context and hook
 * Manages user authentication state, token storage, and login/logout operations
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { User } from "@/types";

interface JWTPayload {
  userId: number;
  email?: string;
  username?: string;
  iat?: number;
  exp?: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from SecureStore on mount
  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("token");
      if (storedToken) {
        const decoded = jwtDecode<JWTPayload>(storedToken);
        setToken(storedToken);
        setUser({
          id: decoded.userId,
          email: decoded.email || "",
          username: decoded.username || "",
          elo: 1000, // Default, will be updated from server
        });
      }
    } catch (error) {
      console.error("Error loading token:", error);
      // Clear invalid token
      await SecureStore.deleteItemAsync("token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string) => {
    try {
      const decoded = jwtDecode<JWTPayload>(newToken);
      await SecureStore.setItemAsync("token", newToken);
      setToken(newToken);
      setUser({
        id: decoded.userId,
        email: decoded.email || "",
        username: decoded.username || "",
        elo: 1000, // Will be updated from server
      });
    } catch (error) {
      console.error("Error saving token:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

