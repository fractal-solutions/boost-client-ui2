import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { stripPublicKey } from '@/services/transactions';
import { toast } from 'sonner';
import { metadata_ip } from '@/lib/config';

interface Transaction {
  type: 'SENT' | 'RECEIVED';
  amount: number;
  fee?: number;
  counterparty: string | null;
  timestamp: number;
  blockHeight: number;
}

interface AccountStats {
  balance: number;
  totalSent: number;
  totalReceived: number;
  transactionCount: number;
  lastSeen: number | null;
}

const defaultStats: AccountStats = {
  balance: 0,
  totalSent: 0,
  totalReceived: 0,
  transactionCount: 0,
  lastSeen: null
};

export default function VendorBalance() {
  const { user, token } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [accountStats, setAccountStats] = useState<AccountStats>(defaultStats);
  const [showStats, setShowStats] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!user?.publicKey || !token) return;

    try {
      setIsLoadingBalance(true);
      
      const [balanceResponse, statsResponse] = await Promise.all([
        fetch(`${metadata_ip}/balance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: user.publicKey })
        }),
        fetch(`${metadata_ip}/stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: user.publicKey })
        })
      ]);

      const balanceData = await balanceResponse.json();
      const statsData = await statsResponse.json();

      setBalance(balanceData.balance);
      setAccountStats(statsData);
      setLastUpdate(new Date());
    } catch (error: any) {
      toast.error('Failed to fetch account data');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [user?.publicKey, token]);

  const fetchRecentTransactions = useCallback(async () => {
    if (!user?.publicKey || !token) return;

    try {
      setIsLoadingTransactions(true);
      const response = await fetch(`${metadata_ip}/last-transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: user.publicKey,
          limit: 10 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setRecentTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load recent transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [user?.publicKey, token]);

  useEffect(() => {
    fetchBalance();
    fetchRecentTransactions();
  }, [fetchBalance, fetchRecentTransactions]);

  return (
    <div className="space-y-6">
      <Card className={cn(
        "bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20",
        isLoadingBalance && "opacity-70"
      )}>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            Account Balance
            <div className="flex items-center gap-2">
              {user?.publicKey && token && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowStats(!showStats)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={fetchBalance}
                disabled={isLoadingBalance || !user?.publicKey || !token}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-4xl font-bold">
                {isLoadingBalance ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `KES ${balance?.toLocaleString() ?? '0'}`
                )}
              </div>
              <Badge className="mt-2" variant="secondary">
                {lastUpdate
                  ? `Updated ${formatDistanceToNow(lastUpdate, { addSuffix: true })}`
                  : 'Not updated yet'}
              </Badge>
            </div>

            {user?.publicKey && token && showStats && (
              <div className="pt-4 border-t border-border/50 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Sent</div>
                    <div className="font-medium">
                      KES {accountStats?.totalSent?.toLocaleString() ?? '0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Received</div>
                    <div className="font-medium">
                      KES {accountStats?.totalReceived?.toLocaleString() ?? '0'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Transactions</div>
                    <div className="font-medium">
                      {accountStats?.transactionCount ?? 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Last Activity</div>
                    <div className="font-medium">
                      {accountStats?.lastSeen 
                        ? formatDistanceToNow(accountStats.lastSeen, { addSuffix: true })
                        : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            Recent Transactions
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={fetchRecentTransactions}
              disabled={isLoadingTransactions}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full pr-4">
            <div className="space-y-4">
              {isLoadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Loading transactions...</span>
                </div>
              ) : recentTransactions.map((tx) => {
                const transactionType = tx.type === 'SENT' && !tx.counterparty 
                  ? 'WITHDRAW'
                  : tx.type === 'RECEIVED' && !tx.counterparty
                  ? 'DEPOSIT'
                  : tx.type;

                return (
                  <div
                    key={tx.blockHeight}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="grid grid-cols-5 gap-4">
                      <div className="col-span-3 space-y-1">
                        <div className="flex items-center gap-2">
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
                          <span className="text-muted-foreground text-sm">
                            {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        <div className="font-medium text-lg">
                          KES {tx.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tx.counterparty && (
                            `${tx.type === 'SENT' ? 'Sent to' : 'Received from'} ${
                              stripPublicKey(tx.counterparty).slice(0, 16)
                            }...`
                          )}
                        </div>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className={cn(
                          "text-sm font-medium",
                          transactionType === 'DEPOSIT' || tx.type === 'RECEIVED' 
                            ? "text-green-500" 
                            : "text-red-500"
                        )}>
                          {transactionType === 'DEPOSIT' || tx.type === 'RECEIVED' ? '+' : '-'}
                          {tx.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}


export function OnlyBalance() {
  const { user, token } = useAuth();
  const [showBalance, setShowBalance] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [accountStats, setAccountStats] = useState<AccountStats>(defaultStats);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!user?.publicKey || !token) return;

    try {
      setIsLoadingBalance(true);
      
      const [balanceResponse, statsResponse] = await Promise.all([
        fetch(`${metadata_ip}/balance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: user.publicKey })
        }),
        fetch(`${metadata_ip}/stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: user.publicKey })
        })
      ]);

      const balanceData = await balanceResponse.json();
      const statsData = await statsResponse.json();

      setBalance(balanceData.balance);
      setAccountStats(statsData);
      setLastUpdate(new Date());
    } catch (error: any) {
      toast.error('Failed to fetch account data');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [user?.publicKey, token]);

  const fetchRecentTransactions = useCallback(async () => {
    if (!user?.publicKey || !token) return;

    try {
      setIsLoadingTransactions(true);
      const response = await fetch(`${metadata_ip}/last-transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: user.publicKey,
          limit: 10 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setRecentTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load recent transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [user?.publicKey, token]);

  useEffect(() => {
    fetchBalance();
    fetchRecentTransactions();
  }, [fetchBalance, fetchRecentTransactions]);

  return (
    <Card className={cn(
      "bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20",
      isLoadingBalance && "opacity-70"
    )}>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          Account Balance
          <div className="flex items-center gap-2">
            {user?.publicKey && token && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowBalance(!showBalance)}
                title={showBalance ? "Hide Balance" : "Show Balance"}
              >
                <Eye className={cn(
                  "h-4 w-4 transition-opacity",
                  !showBalance && "opacity-50"
                )} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={fetchBalance}
              disabled={isLoadingBalance || !user?.publicKey || !token}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className={cn(
              "text-4xl font-bold transition-all duration-200",
              !showBalance && "blur-md select-none"
            )}>
              {isLoadingBalance ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                `KES ${balance?.toLocaleString() ?? '0'}`
              )}
            </div>
            <Badge className="mt-2" variant="secondary">
              {lastUpdate
                ? `Updated ${formatDistanceToNow(lastUpdate, { addSuffix: true })}`
                : 'Not updated yet'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}