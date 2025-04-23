import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user?.phoneNumber) return;

    // Determine client type based on current route
    const clientType = window.location.pathname.startsWith('/vendor') ? 'vendor' : 'user';
    console.log(`Connecting as ${clientType} with ID ${user.phoneNumber}`);

    // Fix: Change 'type' to 'clientType' in the query parameter
    const ws = new WebSocket(`ws://localhost:2225/ws?clientType=${clientType}&id=${user.phoneNumber}`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    setSocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user?.phoneNumber]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);