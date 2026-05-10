import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, type StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Helper to safely parse local storage token
const getAuthToken = () => {
  try {
    return localStorage.getItem('token') || '';
  } catch (e) {
    return '';
  }
};

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return; // Do not connect without a token

    const client = new Client({
      // Provide SockJS factory for fallback and proper connection
      webSocketFactory: () => new SockJS('http://localhost:8081/ws'), 
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      // debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      console.log('Connected to WebSocket');
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setIsConnected(false);
    };
  }, []);

  // Helper to subscribe to specific topics/queues
  const subscribe = useCallback((
    destination: string,
    callback: (message: any) => void
  ): StompSubscription | null => {
    if (!clientRef.current || !isConnected) return null;
    return clientRef.current.subscribe(destination, (msg) => {
      callback(JSON.parse(msg.body));
    });
  }, [isConnected]);

  return { isConnected, subscribe };
};
