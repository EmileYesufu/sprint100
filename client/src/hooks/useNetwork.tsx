/**
 * Network Context Hook
 * Provides global network state management using NetInfo
 * Tracks connectivity status and provides offline mode handling
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { AppState, AppStateStatus } from "react-native";

interface NetworkContextType {
  isConnected: boolean;
  isOnline: boolean;
  connectionType: string | null;
  isOfflineMode: boolean;
  lastConnected: Date | null;
  networkError: string | null;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [lastConnected, setLastConnected] = useState<Date | null>(new Date());
  const [networkError, setNetworkError] = useState<string | null>(null);

  useEffect(() => {
    // Initial network state check
    NetInfo.fetch().then((state: NetInfoState) => {
      updateNetworkState(state);
    });

    // Listen for network state changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      updateNetworkState(state);
    });

    // Listen for app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // Re-check network state when app becomes active
        NetInfo.fetch().then((state: NetInfoState) => {
          updateNetworkState(state);
        });
      }
    };

    const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      unsubscribe();
      appStateSubscription?.remove();
    };
  }, []);

  const updateNetworkState = (state: NetInfoState) => {
    const connected = state.isConnected ?? false;
    const online = state.isInternetReachable ?? connected;
    
    setIsConnected(connected);
    setIsOnline(online);
    setConnectionType(state.type);
    setIsOfflineMode(!online);
    
    if (online && !isOnline) {
      // Just came back online
      setLastConnected(new Date());
      setNetworkError(null);
    } else if (!online && isOnline) {
      // Just went offline
      setNetworkError("No internet connection available");
    }
  };

  const contextValue: NetworkContextType = {
    isConnected,
    isOnline,
    connectionType,
    isOfflineMode,
    lastConnected,
    networkError,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextType {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within NetworkProvider");
  }
  return context;
}
