"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useERPAuth } from "./ERPAuthContext";

interface WSMessage {
  type: string;
  data?: any;
  action?: string;
  task_id?: string;
}

interface ERPWebSocketContextType {
  isConnected: boolean;
  lastMessage: WSMessage | null;
  sendMessage: (msg: WSMessage) => void;
}

const ERPWebSocketContext = createContext<ERPWebSocketContextType | null>(null);

export function ERPWebSocketProvider({ children }: { children: React.ReactNode }) {
    const { token, user, API } = useERPAuth() as any;
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
    const ws = useRef<WebSocket | null>(null);
  
    const sendMessage = (msg: WSMessage) => {
      if (ws.current && isConnected) {
        ws.current.send(JSON.stringify(msg));
      } else {
        console.warn("WebSocket not connected, cannot send message");
      }
    };
  
    useEffect(() => {
      if (!token || !user) {
        if (ws.current) {
          ws.current.close();
          ws.current = null;
        }
        setIsConnected(false);
        return;
      }
  
      // Use the centralized API URL to determine the WebSocket endpoint
      // Replace http/https with ws/wss and REMOVE the /api suffix if it exists
      // The backend WebSocket router is at /ws/erp, while the REST API is often at /api
      const wsBase = API.replace(/^http/, "ws").replace(/\/api\/?$/, "");
      const wsUrl = `${wsBase}/ws/erp/${token}`;
      
      console.log("Connecting to WebSocket:", wsUrl);
      const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket Connected");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        console.log("📩 WS Message:", msg);
        setLastMessage(msg);
        
        // Dispatch global events for specific pages to listen
        if (msg.type === "task_event") {
          window.dispatchEvent(new CustomEvent("erp:task_update", { detail: msg }));
        } else if (msg.type === "leave_event") {
          window.dispatchEvent(new CustomEvent("erp:leave_update", { detail: msg }));
        } else if (msg.type === "notification_new") {
           window.dispatchEvent(new CustomEvent("erp:notification_new", { detail: msg }));
        }
      } catch (e) {
        console.error("Format error in WS message:", e);
      }
    };

    socket.onclose = () => {
      console.log("❌ WebSocket Disconnected");
      setIsConnected(false);
      ws.current = null;
    };

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [token, user]);

  return (
    <ERPWebSocketContext.Provider value={{ isConnected, lastMessage, sendMessage }}>
      {children}
    </ERPWebSocketContext.Provider>
  );
}

export function useERPWS() {
  const ctx = useContext(ERPWebSocketContext);
  if (!ctx) throw new Error("useERPWS must be used within ERPWebSocketProvider");
  return ctx;
}
