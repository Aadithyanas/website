"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useERPAuth, apiClient } from "./ERPAuthContext";

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
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
    const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  
    const sendMessage = (msg: WSMessage) => {
      if (ws.current && isConnected) {
        ws.current.send(JSON.stringify(msg));
      } else {
        console.warn("WebSocket not connected, cannot send message");
      }
    };

    const connect = () => {
      if (!token || !user) return;
      
      // Cleanup previous
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }

      const wsBase = API.replace(/^http/, "ws").replace(/\/api\/?$/, "");
      const wsUrl = `${wsBase}/ws/erp/${token}`;
      
      console.log("🔄 Connecting to WebSocket:", wsUrl);
      const socket = new WebSocket(wsUrl);
      ws.current = socket;
      
      const markAsDelivered = async (msgId: string) => {
        try {
          await apiClient.patch("/api/erp/chat/messages/status", 
            { message_ids: [msgId], status: "delivered" },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (e) {
          // Silent fail for status updates
        }
      };

      socket.onopen = () => {
        console.log("✅ WebSocket Connected");
        setIsConnected(true);

        // Sync pending delivery status
        apiClient.patch("/api/erp/chat/messages/status/sync").catch(() => {});
        
        // Start Heartbeat (prevent Render idle timeout)
        if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: "ping" }));
          }
        }, 30000); // 30 seconds
      };

      socket.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          // Ignore pong responses
          if (msg.type === "pong") return;
          
          console.log("📩 WS Message:", msg);
          setLastMessage(msg);
          
          if (msg.type === "chat_message") {
            const newMsg = msg.data;
            // 1. Dispatch to UI FIRST (User Experience Priority)
            window.dispatchEvent(new CustomEvent("erp:chat_message", { detail: msg }));
            
            // 2. Mark as delivered in the background
            if (!newMsg.is_group) {
              markAsDelivered(newMsg.id).catch(() => {});
            }
          } else if (msg.type === "chat_status_update") {
            window.dispatchEvent(new CustomEvent("erp:chat_status_update", { detail: msg }));
          } else if (msg.type === "chat_group_created") {
            window.dispatchEvent(new CustomEvent("erp:chat_group_created", { detail: msg }));
          } else if (msg.type === "user_online") {
            window.dispatchEvent(new CustomEvent("erp:user_online", { detail: msg }));
          } else if (msg.type === "user_offline") {
            window.dispatchEvent(new CustomEvent("erp:user_offline", { detail: msg }));
          } else if (msg.type === "task_event") {
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
        console.log("❌ WebSocket Disconnected. Reconnecting in 5s...");
        setIsConnected(false);
        ws.current = null;
        if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
        
        // Auto-reconnect logic
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = setTimeout(connect, 5000);
      };
    };
  
    useEffect(() => {
      connect();

      return () => {
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
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
