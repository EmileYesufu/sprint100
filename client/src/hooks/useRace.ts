/**
 * Race Hook
 * Manages online race state with network disconnect handling
 * Handles reconnection and race state synchronization
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import type { RaceUpdate, MatchResult, PlayerState, LocalEndResult } from "@/types";

interface UseRaceReturn {
  // Race state
  raceState: {
    status: "waiting" | "countdown" | "racing" | "finished" | "disconnected";
    countdown: number | null;
    myMeters: number;
    opponentMeters: number;
    result: MatchResult | null;
    isLocallyEnded: boolean;
    localEndResult: LocalEndResult | null;
    clientPlacings: string[];
  };
  
  // Network state
  networkState: {
    isConnected: boolean;
    isReconnecting: boolean;
    showDisconnectModal: boolean;
  };
  
  // Actions
  handleTap: (side: "left" | "right") => void;
  dismissDisconnectModal: () => void;
  forceReconnect: () => void;
}

export function useRace(matchId: string, opponent: any): UseRaceReturn {
  const { socket, isConnected } = useSocket();
  const { token } = useAuth();
  
  // Race state
  const [raceState, setRaceState] = useState({
    status: "waiting" as const,
    countdown: null as number | null,
    myMeters: 0,
    opponentMeters: 0,
    result: null as MatchResult | null,
    isLocallyEnded: false,
    localEndResult: null as LocalEndResult | null,
    clientPlacings: [] as string[],
  });
  
  // Network state
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    isReconnecting: false,
    showDisconnectModal: false,
  });
  
  // Refs for tracking state
  const lastSide = useRef<"left" | "right" | null>(null);
  const finishedPlayers = useRef<Set<number>>(new Set());
  const playerStates = useRef<Map<number, PlayerState>>(new Map());
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  
  // Track network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;
      
      setNetworkState(prev => ({
        ...prev,
        isConnected,
        isReconnecting: !isConnected && prev.isConnected,
        showDisconnectModal: !isConnected && raceState.status === "racing",
      }));
      
      // If we just reconnected and were in a race, attempt to sync state
      if (isConnected && !prev.isConnected && raceState.status === "racing") {
        handleReconnect();
      }
    });
    
    return unsubscribe;
  }, [raceState.status]);
  
  // Track app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active" && !networkState.isConnected) {
        // App became active but we're still disconnected
        setNetworkState(prev => ({
          ...prev,
          showDisconnectModal: true,
        }));
      }
    };
    
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription?.remove();
  }, [networkState.isConnected]);
  
  // Socket event handlers
  useEffect(() => {
    if (!socket) return;
    
    const handleRaceStart = (data: any) => {
      setRaceState(prev => ({
        ...prev,
        status: "countdown",
        countdown: 3,
      }));
      
      // Start countdown
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(countdownInterval);
          setRaceState(prev => ({
            ...prev,
            status: "racing",
            countdown: null,
          }));
        } else {
          setRaceState(prev => ({
            ...prev,
            countdown,
          }));
        }
      }, 1000);
    };
    
    const handleRaceUpdate = (data: RaceUpdate) => {
      if (raceState.status !== "racing") return;
      
      setRaceState(prev => ({
        ...prev,
        myMeters: data.myMeters,
        opponentMeters: data.opponentMeters,
      }));
      
      // Update player states
      if (data.playerStates) {
        data.playerStates.forEach(player => {
          playerStates.current.set(player.userId, player);
        });
      }
      
      // Check for local early finish threshold
      checkLocalEarlyFinish(data);
    };
    
    const handleRaceEnd = (data: MatchResult) => {
      setRaceState(prev => ({
        ...prev,
        status: "finished",
        result: data,
      }));
    };
    
    const handleDisconnect = () => {
      setNetworkState(prev => ({
        ...prev,
        isConnected: false,
        showDisconnectModal: raceState.status === "racing",
      }));
    };
    
    const handleReconnect = () => {
      setNetworkState(prev => ({
        ...prev,
        isConnected: true,
        isReconnecting: false,
        showDisconnectModal: false,
      }));
      reconnectAttempts.current = 0;
    };
    
    // Register event listeners
    socket.on("race_start", handleRaceStart);
    socket.on("race_update", handleRaceUpdate);
    socket.on("race_end", handleRaceEnd);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleReconnect);
    
    return () => {
      socket.off("race_start", handleRaceStart);
      socket.off("race_update", handleRaceUpdate);
      socket.off("race_end", handleRaceEnd);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleReconnect);
    };
  }, [socket, raceState.status]);
  
  // Handle reconnection logic
  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setNetworkState(prev => ({
        ...prev,
        isReconnecting: false,
        showDisconnectModal: false,
      }));
      return;
    }
    
    reconnectAttempts.current++;
    setNetworkState(prev => ({
      ...prev,
      isReconnecting: true,
    }));
    
    // Attempt to rejoin the race
    if (socket && token) {
      socket.emit("rejoin_race", { matchId, token });
    }
    
    // Reset reconnecting state after a delay
    setTimeout(() => {
      setNetworkState(prev => ({
        ...prev,
        isReconnecting: false,
      }));
    }, 3000);
  }, [socket, token, matchId]);
  
  // Check for local early finish threshold
  const checkLocalEarlyFinish = useCallback((data: RaceUpdate) => {
    // Implementation for early finish logic
    // This would check if enough players have finished locally
    // and show local end result while waiting for server confirmation
  }, []);
  
  // Handle tap events
  const handleTap = useCallback((side: "left" | "right") => {
    if (raceState.status !== "racing" || !networkState.isConnected) {
      return;
    }
    
    // Prevent alternating taps
    if (lastSide.current === side) {
      return;
    }
    
    lastSide.current = side;
    
    if (socket) {
      socket.emit("race_tap", { side, matchId });
    }
  }, [raceState.status, networkState.isConnected, socket, matchId]);
  
  // Dismiss disconnect modal
  const dismissDisconnectModal = useCallback(() => {
    setNetworkState(prev => ({
      ...prev,
      showDisconnectModal: false,
    }));
  }, []);
  
  // Force reconnect
  const forceReconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    handleReconnect();
  }, [handleReconnect]);
  
  return {
    raceState,
    networkState,
    handleTap,
    dismissDisconnectModal,
    forceReconnect,
  };
}
