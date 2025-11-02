/**
 * Authentication context and hook
 * Manages user authentication state, token storage, and login/logout operations
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { User } from "@/types";
import { getServerUrl } from "@/config";
// Import base64 polyfill for React Native (must be imported early)
import "@/utils/base64Polyfill";

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
  isRefreshing: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const tokenRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Load token from SecureStore on mount
  useEffect(() => {
    loadToken();
  }, []);

  // Set up token expiration monitoring
  useEffect(() => {
    if (token) {
      startTokenExpirationMonitoring();
    } else {
      stopTokenExpirationMonitoring();
    }
    
    return () => {
      stopTokenExpirationMonitoring();
    };
  }, [token]);

  // Token expiration monitoring
  const startTokenExpirationMonitoring = () => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
    }
    
    // Check token expiration every 30 seconds
    tokenRefreshInterval.current = setInterval(async () => {
      if (token) {
        try {
          // Validate token format
          const parts = token.split('.');
          if (parts.length !== 3) {
            console.error("Invalid token format during expiration check");
            await logout();
            return;
          }
          
          const decoded = jwtDecode<JWTPayload>(token);
          const now = Math.floor(Date.now() / 1000);
          const expirationBuffer = 300; // 5 minutes before expiration
          
          if (decoded.exp && decoded.exp - now < expirationBuffer) {
            console.log("Token expiring soon, attempting refresh...");
            const success = await refreshToken();
            if (!success) {
              console.log("Token refresh failed, logging out...");
              await logout();
            }
          }
        } catch (error) {
          console.error("Error checking token expiration:", error);
          await logout();
        }
      }
    }, 30000); // Check every 30 seconds
  };

  const stopTokenExpirationMonitoring = () => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
      tokenRefreshInterval.current = null;
    }
  };

  const loadToken = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("token");
      if (storedToken) {
        // Validate token format
        const parts = storedToken.split('.');
        if (parts.length !== 3) {
          console.warn("Invalid stored token format, clearing...");
          await SecureStore.deleteItemAsync("token");
          setIsLoading(false);
          return;
        }
        
        try {
          const decoded = jwtDecode<JWTPayload>(storedToken);
          
          // Check if token is already expired
          const now = Math.floor(Date.now() / 1000);
          if (decoded.exp && decoded.exp < now) {
            console.log("Stored token is expired, attempting refresh...");
            const success = await refreshToken();
            if (!success) {
              console.log("Token refresh failed, clearing stored token...");
              await SecureStore.deleteItemAsync("token");
              setIsLoading(false);
              return;
            }
          } else {
            setToken(storedToken);
            setUser({
              id: decoded.userId,
              email: decoded.email || "",
              username: decoded.username || "",
              elo: 1000, // Default, will be updated from server
            });
          }
        } catch (decodeError: any) {
          console.error("Error decoding stored token:", decodeError);
          // Clear invalid token
          await SecureStore.deleteItemAsync("token");
        }
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
      // Validate token format before decoding
      if (!newToken || typeof newToken !== 'string') {
        throw new Error("Invalid token: token is not a string");
      }
      
      const parts = newToken.split('.');
      if (parts.length !== 3) {
        throw new Error(`Invalid token format: expected 3 parts, got ${parts.length}`);
      }
      
      const decoded = jwtDecode<JWTPayload>(newToken);
      
      if (!decoded.userId) {
        throw new Error("Invalid token: missing userId in payload");
      }
      
      await SecureStore.setItemAsync("token", newToken);
      setToken(newToken);
      setUser({
        id: decoded.userId,
        email: decoded.email || "",
        username: decoded.username || "",
        elo: 1000, // Will be updated from server
      });
    } catch (error: any) {
      console.error("Error saving token:", error);
      console.error("Token that failed:", newToken ? `${newToken.substring(0, 50)}...` : "null/undefined");
      throw error;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!token) return false;
    
    setIsRefreshing(true);
    try {
      const response = await fetch(`${getServerUrl()}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const newToken = data.token;
        
        if (newToken) {
          // Validate token format before decoding
          const parts = newToken.split('.');
          if (parts.length !== 3) {
            console.error("Invalid token format from refresh endpoint");
            return false;
          }
          
          try {
            const decoded = jwtDecode<JWTPayload>(newToken);
            await SecureStore.setItemAsync("token", newToken);
            setToken(newToken);
            setUser({
              id: decoded.userId,
              email: decoded.email || "",
              username: decoded.username || "",
              elo: user?.elo || 1000,
            });
            console.log("Token refreshed successfully");
            return true;
          } catch (decodeError: any) {
            console.error("Error decoding refreshed token:", decodeError);
            return false;
          }
        }
      }
      
      console.log("Token refresh failed:", response.status);
      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  const logout = async () => {
    try {
      stopTokenExpirationMonitoring();
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
    <AuthContext.Provider value={{ 
      token, 
      user, 
      isLoading, 
      isRefreshing,
      login, 
      logout, 
      updateUser,
      refreshToken 
    }}>
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

