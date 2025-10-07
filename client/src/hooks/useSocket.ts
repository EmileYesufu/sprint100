/**
 * Socket.io client hook
 * Manages WebSocket connection and provides helper methods for socket communication
 */

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SERVER_URL } from "@/config";
import { useAuth } from "@/hooks/useAuth";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinQueue: () => void;
  leaveQueue: () => void;
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

export function useSocket(): UseSocketReturn {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      // Disconnect if no token
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Connect to socket.io server with token authentication
    const socket = io(SERVER_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token]);

  const joinQueue = () => {
    if (socketRef.current) {
      socketRef.current.emit("join_queue");
    }
  };

  const leaveQueue = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave_queue");
    }
  };

  const emit = (event: string, ...args: any[]) => {
    if (socketRef.current) {
      socketRef.current.emit(event, ...args);
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinQueue,
    leaveQueue,
    emit,
    on,
    off,
  };
}

