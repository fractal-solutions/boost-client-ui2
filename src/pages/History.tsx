import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Download, TimerIcon, RefreshCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { metadata_ip, users_ip } from '@/lib/config';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { stripPublicKey } from '@/services/transactions';

interface Transaction {
  type: 'SENT' | 'RECEIVED';
  amount: number;
  fee?: number;
  counterparty: string | null;
  timestamp: number;
  blockHeight: number;
}

interface UserDetails {
  username?: string;
  phoneNumber: string;
  publicKey: string;
}

export default function History() {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionUserDetails, setTransactionUserDetails] = useState<Map<string, UserDetails>>(new Map());

  const fetchUserDetails = async (publicKey: string): Promise<UserDetails | null> => {
    try {
      const response = await fetch(`${users_ip}/user/by-public-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey })
      });

      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      return null;
    }
  };

  const fetchTransactionHistory = useCallback(async () => {
    if (!user?.publicKey || !token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${metadata_ip}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: user.publicKey,
          limit: 100 // Get more transactions for history
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      
      // Fetch user details for transaction counterparties
      const uniqueAddresses = new Set(
        data.transactions
          .map((tx: { counterparty: any; }) => tx.counterparty)
          .filter(Boolean)
      );

      const userDetailsMap = new Map<string, UserDetails>();
      await Promise.all(
        Array.from(uniqueAddresses).map(async (publicKey) => {
          const details = await fetchUserDetails(publicKey as string);
          if (details) {
            userDetailsMap.set(publicKey as string, details);
          }
        })
      );

      setTransactionUserDetails(userDetailsMap);
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  }, [user?.publicKey, token]);

  useEffect(() => {
    fetchTransactionHistory();
  }, [fetchTransactionHistory]);

  const filteredTransactions = transactions.filter((tx) => {
    const searchLower = searchTerm.toLowerCase();
    const userDetails = tx.counterparty ? transactionUserDetails.get(tx.counterparty) : null;
    
    return (
      userDetails?.username?.toLowerCase().includes(searchLower) ||
      userDetails?.phoneNumber?.toLowerCase().includes(searchLower) ||
      tx.type.toLowerCase().includes(searchLower) ||
      tx.amount.toString().includes(searchLower)
    );
  });

  if (!user?.publicKey) {
    return (
      <div className="container mx-auto max-w-7xl">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="space-y-4">
              <TimerIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Login Required</h3>
              <p className="text-muted-foreground">
                Please login to view History
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search transactions..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => fetchTransactionHistory()}
            disabled={isLoading}
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCcw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading transactions...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => {
                    const transactionType = tx.type === 'SENT' && !tx.counterparty 
                      ? 'WITHDRAW'
                      : tx.type === 'RECEIVED' && !tx.counterparty
                      ? 'DEPOSIT'
                      : tx.type;

                    const userDetails = tx.counterparty ? transactionUserDetails.get(tx.counterparty) : null;

                    return (
                      <TableRow key={`${tx.blockHeight}-${tx.timestamp}`}>
                        <TableCell className="whitespace-nowrap">
                          {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transactionType === 'DEPOSIT'
                                ? 'default'
                                : transactionType === 'WITHDRAW'
                                ? 'destructive'
                                : tx.type === 'SENT'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {transactionType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transactionType === 'DEPOSIT' ? (
                            'Deposited to wallet'
                          ) : transactionType === 'WITHDRAW' ? (
                            'Withdrawn from wallet'
                          ) : tx.type === 'SENT' ? (
                            userDetails ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {userDetails.username ? 
                                    `Sent to @${userDetails.username}` : 
                                    `Sent to ${userDetails.phoneNumber}`}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {stripPublicKey(tx.counterparty!).slice(0, 8)}...
                                </span>
                              </div>
                            ) : (
                              `Sent to ${stripPublicKey(tx.counterparty ?? '').slice(0, 16)}...`
                            )
                          ) : (
                            userDetails ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {userDetails.username ? 
                                    `Received from @${userDetails.username}` : 
                                    `Received from ${userDetails.phoneNumber}`}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {stripPublicKey(tx.counterparty!).slice(0, 8)}...
                                </span>
                              </div>
                            ) : (
                              `Received from ${stripPublicKey(tx.counterparty ?? '').slice(0, 16)}...`
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          {tx.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {tx.fee ? tx.fee.toLocaleString() : '-'}
                        </TableCell>
                        <TableCell className={cn(
                          "font-medium",
                          transactionType === 'DEPOSIT' || tx.type === 'RECEIVED' 
                            ? "text-green-500" 
                            : "text-red-500"
                        )}>
                          {transactionType === 'DEPOSIT' || tx.type === 'RECEIVED' ? '+' : '-'}
                          {(tx.amount + (tx.fee ?? 0)).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}