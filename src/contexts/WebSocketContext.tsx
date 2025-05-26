import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { users_ws, chain_ws } from '@/lib/config';

interface WebSocketContextType {
  socketGeneral: WebSocket | null;
  socketTransaction: WebSocket | null;
  isConnectedGeneral: boolean;
  isConnectedTransaction: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socketGeneral: null,
  socketTransaction: null,
  isConnectedGeneral: false,
  isConnectedTransaction: false,
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socketGeneral, setSocketGeneral] = useState<WebSocket | null>(null);
  const [socketTransaction, setSocketTransaction] = useState<WebSocket | null>(null);
  const [isConnectedGeneral, setIsConnectedGeneral] = useState(false);
  const [isConnectedTransaction, setIsConnectedTransaction] = useState(false);
  const { user } = useAuth();

  
  useEffect(() => {
    if (!user?.phoneNumber) return;

    // Determine client type based on current route
    const clientType = window.location.pathname.startsWith('/vendor') ? 'vendor' : 'user';
    console.log(`Connecting as ${clientType} with ID ${user.phoneNumber}`);

    //const ws = new WebSocket(`ws://localhost:2225/ws?clientType=${clientType}&id=${user.phoneNumber}`);
    const wsGeneral = new WebSocket(`${users_ws}?clientType=${clientType}&id=${user.phoneNumber}`);
    
    wsGeneral.onopen = () => {
      console.log('General WebSocket Connected');
      setIsConnectedGeneral(true);
    };

    wsGeneral.onclose = () => {
      console.log('General WebSocket Disconnected');
      setIsConnectedGeneral(false);
    };

    wsGeneral.onerror = (error) => {
      console.error('General WebSocket Error:', error);
    };

    setSocketGeneral(wsGeneral);

    return () => {
      if (wsGeneral.readyState === WebSocket.OPEN) {
        wsGeneral.close();
      }
    };
  }, [user?.phoneNumber]);

  useEffect(() => {
    if (!user?.phoneNumber) return;

    // Connect to the transaction WebSocket server (port 2222)
    const wsTransaction = new WebSocket(`${chain_ws}?clientType=user&id=${user.phoneNumber}`);
    
    wsTransaction.onopen = () => {
      console.log('Transaction WebSocket Connected');
      setIsConnectedTransaction(true);
    };

    wsTransaction.onclose = () => {
      console.log('Transaction WebSocket Disconnected');
      setIsConnectedTransaction(false);
    };

    wsTransaction.onerror = (error) => {
      console.error('Transaction WebSocket Error:', error);
    };

    setSocketTransaction(wsTransaction);

    return () => {
      if (wsTransaction.readyState === WebSocket.OPEN) {
        wsTransaction.close();
      }
    };
  }, [user?.phoneNumber]);

  useEffect(() => {
    if (!socketGeneral) return;

    const handleMessageGeneral = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received General WebSocket message:', data);

        // Handle general messages here
      } catch (error) {
        console.error('Error handling General WebSocket message:', error);
      }
    };

    socketGeneral.addEventListener('message', handleMessageGeneral);

    return () => {
      socketGeneral.removeEventListener('message', handleMessageGeneral);
    };
  }, [socketGeneral]);

  useEffect(() => {
    if (!socketTransaction) return;

    const handleMessageTransaction = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received Transaction WebSocket message:', data);

        if (data.type === 'transaction-notification') {
          toast.success(`Transaction received: KES ${data.data.amount} from ${data.data.senderId}`);
        }
      } catch (error) {
        console.error('Error handling Transaction WebSocket message:', error);
      }
    };

    socketTransaction.addEventListener('message', handleMessageTransaction);

    return () => {
      socketTransaction.removeEventListener('message', handleMessageTransaction);
    };
  }, [socketTransaction]);

  return (
    <WebSocketContext.Provider value={{ socketGeneral, socketTransaction, isConnectedGeneral, isConnectedTransaction }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);