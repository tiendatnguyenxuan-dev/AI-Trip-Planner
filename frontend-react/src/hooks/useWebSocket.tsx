import React, { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (destination: string, callback: (message: any) => void) => any;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

const getAuthToken = () => {
  try {
    return localStorage.getItem('token') || '';
  } catch (e) {
    return '';
  }
};

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<any>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    if (clientRef.current) return;

    const StompClient = (StompJs as any).Client || (StompJs as any).default?.Client;
    if (!StompClient) return;

    const client = new StompClient({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || 'http://localhost:8090/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      console.log('Connected to WebSocket (Global)');
    };

    client.onDisconnect = () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket');
    };

    client.onStompError = (frame: any) => {
      console.error('Broker reported error: ' + frame.headers['message']);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setIsConnected(false);
      }
    };
  }, []);

  const subscribe = useCallback((
    destination: string,
    callback: (message: any) => void
  ): any => {
    if (!clientRef.current || !clientRef.current.connected) return null;
    return clientRef.current.subscribe(destination, (msg: any) => {
      try {
        callback(JSON.parse(msg.body));
      } catch (e) {
        callback(msg.body);
      }
    });
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
