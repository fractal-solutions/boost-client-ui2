import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
import { ArrowUpRight, QrCode, Fingerprint, Search, Plus, Minus, Upload, RefreshCcw, Eye, Phone, User, AtSign, DollarSign, X, Camera } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCallback, useEffect, useState } from 'react';
import { makeDeposit, makeWithdrawal, sendTransaction, stripPublicKey } from '@/services/transactions';
import { lookupUserByPhone, lookupUserByUsername } from '@/services/users';
import { getBalance } from '@/services/balance';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';

import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const TRANSACTION_FEE_PERCENTAGE = 0.01; // 1% fee
const PERCENTAGE_TOLERANCE = 0.001; // 0.1% tolerance for rounding errors


interface Transaction {
  type: 'SENT' | 'RECEIVED';
  amount: number;
  fee?: number; // Add this field
  counterparty: string | null;
  timestamp: number;
  blockHeight: number;
  relatedTxId?: string; // Add this to link fee transactions
}

interface AccountStats {
  balance: number;
  totalSent: number;
  totalReceived: number;
  transactionCount: number;
  lastSeen: number | null;
}

const readPrivateKeyFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const cleanKey = content
          .replace('-----BEGIN PRIVATE KEY-----\n', '')
          .replace('\n-----END PRIVATE KEY-----', '')
          .trim();
        resolve(content);
      } catch (error) {
        reject(new Error('Invalid private key file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

const quickContacts = [
  { id: 1, name: 'John Doe', phone: '+254 712 345 678' },
  { id: 2, name: 'Jane Smith', phone: '+254 723 456 789' },
  { id: 3, name: 'Alice Johnson', phone: '+254 734 567 890' },
];

const quickAmounts = [
  { value: "100", label: "KES 100" },
  { value: "500", label: "KES 500" },
  { value: "1000", label: "KES 1,000" },
  { value: "5000", label: "KES 5,000" },
];



const defaultStats: AccountStats = {
  balance: 0,
  totalSent: 0,
  totalReceived: 0,
  transactionCount: 0,
  lastSeen: null
};

export default function Dashboard() {
  const { user, token } = useAuth();
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPrivateKeyInput, setShowPrivateKeyInput] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [accountStats, setAccountStats] = useState<AccountStats>(defaultStats);
  const [showStats, setShowStats] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [recipientType, setRecipientType] = useState<'phone' | 'username'>('phone');
  const [recipientId, setRecipientId] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recipientDetails, setRecipientDetails] = useState<{
    publicKey: string;
    username?: string;
    phoneNumber?: string;
  } | null>(null);
  const [isPrivateKeyActive, setIsPrivateKeyActive] = useState<boolean>(() => {
    // Initialize from localStorage
    return localStorage.getItem('private_key_active') === 'true';
  });
  const [privateKey, setPrivateKey] = useState<string>(() => {
    // Initialize from localStorage
    return localStorage.getItem('private_key') || '';
  });
  const [showSendForm, setShowSendForm] = useState(false);
  const [showQRScan, setShowQRScan] = useState(false);
  const [showBioAuth, setShowBioAuth] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<{
    vendorId: string;
    amount: number;
  } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { socket } = useWebSocket();



  const fetchBalance = useCallback(async () => {
    if (!user?.publicKey || !token) return;

    try {
      setIsLoadingBalance(true);
      
      const [balanceResponse, statsResponse] = await Promise.all([
        fetch('http://localhost:2224/balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: user.publicKey })
        }),
        fetch('http://localhost:2224/stats', {
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
      const response = await fetch('http://localhost:2224/last-transactions', {
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

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateAfterTransaction = () => {
      timeoutId = setTimeout(() => {
        fetchBalance();
      }, 30000);
    };

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchBalance, balance]);

  useEffect(() => {
    if (!user || !token) {
      setPrivateKey('');
      setIsPrivateKeyActive(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (!socket) return;
  
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);
  
        if (data.type === 'payment-request') {
          console.log('Payment request received:', data.data);
          setPaymentRequest(data.data);
          toast.info('New payment request received');
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    };
  
    socket.addEventListener('message', handleMessage);
  
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (isPrivateKeyActive && privateKey) {
      localStorage.setItem('private_key_active', 'true');
      localStorage.setItem('private_key', privateKey);
    } else {
      localStorage.removeItem('private_key_active');
      localStorage.removeItem('private_key');
    }
  }, [isPrivateKeyActive, privateKey]);

  useEffect(() => {
    if (!user || !token) {
      setPrivateKey('');
      setIsPrivateKeyActive(false);
      localStorage.removeItem('private_key_active');
      localStorage.removeItem('private_key');
    }
  }, [user, token]);
  
  const handleDeposit = async (amount: string) => {
    try {
      if (!user?.publicKey || !token) {
        throw new Error('Please login first');
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      toast.info(await makeDeposit(user.publicKey, numAmount, token));
      setAmount('');
      fetchBalance();
    } catch (error: any) {
      toast.error(error.message || 'Deposit failed');
    }
  };

  const handleWithdraw = async (amount: string, method: 'mpesa' | 'bank') => {
    try {
      if (!user?.publicKey || !token) {
        throw new Error('Please login first');
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (!privateKey) {
        throw new Error('Please provide your private key');
      }

      const result = await makeWithdrawal(
        user.publicKey,
        privateKey,
        numAmount,
        token
      );

      toast.info(result);
      setAmount('');
      setPrivateKey('');
      setWithdrawDialogOpen(false);
      fetchBalance();
    } catch (error: any) {
      toast.error(error.message || 'Withdrawal failed');
    }
  };

  const handleSendMoney = async () => {
    try {
      if (!user?.publicKey || !token) {
        throw new Error('Please login first');
      }
  
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }
  
      if (!recipientId) {
        throw new Error('Please enter recipient details');
      }
  
      // Lookup recipient's public key
      const recipientData = recipientType === 'phone' 
        ? await lookupUserByPhone(recipientId)
        : await lookupUserByUsername(recipientId);
  
      setRecipientDetails(recipientData);
      setShowConfirmation(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify recipient');
    }
  };

  const handlePaymentComplete = async () => {
    if (!paymentRequest || !user?.phoneNumber || !isPrivateKeyActive || !privateKey) {
      toast.error('Please ensure private key is active');
      return;
    }
  
    try {
      // First verify the recipient vendor
      const recipientData = await lookupUserByPhone(paymentRequest.vendorId);
      if (!recipientData) {
        throw new Error('Vendor not found');
      }
  
      // Attempt the blockchain transaction
      const result = await sendTransaction(
        user.publicKey,
        privateKey,
        recipientData.publicKey,
        paymentRequest.amount,
        token!
      );
  
      // Only if transaction succeeds, notify the vendor
      await fetch('http://localhost:2225/payment-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.phoneNumber,
          vendorId: paymentRequest.vendorId,
          amount: paymentRequest.amount,
          status: 'success',
          transactionId: result.txId // Add transaction ID if available in result
        })
      });
  
      // Update local state
      setPaymentRequest(null);
      fetchBalance(); // Refresh balance
      fetchRecentTransactions(); // Refresh transactions
      
      toast.success('Payment completed successfully');
    } catch (error: any) {
      console.error('Payment error:', error);
      
      // Notify vendor of failure if needed
      try {
        await fetch('http://localhost:2225/payment-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.phoneNumber,
            vendorId: paymentRequest.vendorId,
            amount: paymentRequest.amount,
            status: 'failed',
            error: error.message
          })
        });
      } catch (notifyError) {
        console.error('Failed to notify vendor of failure:', notifyError);
      }
  
      toast.error(error.message || 'Payment failed');
      setPaymentRequest(null);
    }
  };

  const handleConfirmedSend = async () => {
    try {
      if (!recipientDetails) return;
  
      const numAmount = parseFloat(amount);
      const result = await sendTransaction(
        user!.publicKey,
        privateKey,
        recipientDetails.publicKey,
        numAmount,
        token!
      );
  
      toast.info(result);
      setAmount('');
      setRecipientId('');
      setShowConfirmation(false);
      setRecipientDetails(null);
      setShowSendForm(false);
      fetchBalance();
    } catch (error: any) {
      toast.error(error.message || 'Transaction failed');
    }
  };

  const PrivateKeyActivation = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full sm:w-auto"
          size="sm"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className={cn(
                "h-2 w-2 rounded-full",
                isPrivateKeyActive ? "bg-green-500" : "bg-red-500"
              )} />
              {isPrivateKeyActive && (
                <>
                  <div className="absolute -inset-0.5 rounded-full bg-green-500/30 animate-ping" />
                  <div className="absolute -inset-1 rounded-full bg-green-500/20 animate-pulse" />
                </>
              )}
              {!isPrivateKeyActive && (
                <div className="absolute -inset-0.5 rounded-full bg-red-500/30 animate-pulse" />
              )}
            </div>
            <span>Private Key {isPrivateKeyActive ? 'Active' : 'Inactive'}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Activate Private Key</h4>
            <p className="text-sm text-muted-foreground">
              Upload or paste your private key to enable transactions
            </p>
          </div>
          <div className="grid gap-2">
          <Textarea
            placeholder="Enter your private key"
            value={privateKey}
            onChange={(e) => {
              setPrivateKey(e.target.value);
              const isActive = !!e.target.value;
              setIsPrivateKeyActive(isActive);
            }}
            className="font-mono text-xs"
            rows={4}
          />
            <div className="relative">
              <Input
                type="file"
                accept=".txt"
                className="hidden"
                id="quick-pay-key-file"
                onChange={async (e) => {
                  try {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    const key = await readPrivateKeyFile(file);
                    setPrivateKey(key);
                    setIsPrivateKeyActive(true);
                    toast.success('Private key activated');
                  } catch (error: any) {
                    toast.error(error.message || 'Failed to load private key');
                    setIsPrivateKeyActive(false);
                  }
                }}
              />
              <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById('quick-pay-key-file')?.click()}
              >
              <Upload className="mr-2 h-4 w-4" />
              Upload Key File
            </Button>
          </div>
        </div>
        {isPrivateKeyActive && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              setPrivateKey('');
              setIsPrivateKeyActive(false);
              localStorage.removeItem('private_key_active');
              localStorage.removeItem('private_key');
              toast.success('Private key deactivated');
            }}
          >
            Deactivate Key
          </Button>
        )}
      </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={cn(
            "bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 h-fit",
            isLoadingBalance && "opacity-70"
          )}
        >
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              Available Balance
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

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Quick Pay</CardTitle>
            <PrivateKeyActivation />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput placeholder="Search recipients by name or phone..." />
                    <CommandList>
                      <CommandEmpty>No recipients found.</CommandEmpty>
                      <CommandGroup heading="Frequent Contacts">
                        {quickContacts.map((contact) => (
                          <CommandItem key={contact.id} className="flex justify-between">
                            <span>{contact.name}</span>
                            <span className="text-sm text-muted-foreground">{contact.phone}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <div className="w-full space-y-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-primary/80"
                      onClick={() => setShowSendForm(!showSendForm)}
                    >
                      {showSendForm ? (
                        <X className="mr-2 h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                      )}
                      {showSendForm ? 'Cancel' : 'Send Money'}
                    </Button>

                    <AnimatePresence>
                      {showSendForm && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg font-medium">Send via Boost</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Enter recipient details and amount
                              </p>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                              {!showConfirmation ? (
                                <div className="grid gap-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div
                                      className={cn(
                                        "p-4 rounded-lg border-2 cursor-pointer transition-colors text-center",
                                        recipientType === 'phone' 
                                          ? "border-primary bg-primary/10" 
                                          : "border-muted hover:border-primary/50"
                                      )}
                                      onClick={() => setRecipientType('phone')}
                                    >
                                      <div className="flex flex-col items-center gap-2">
                                        <Phone className="h-6 w-6" />
                                        <span className="text-sm font-medium">Phone Number</span>
                                      </div>
                                    </div>
                                    <div
                                      className={cn(
                                        "p-4 rounded-lg border-2 cursor-pointer transition-colors text-center",
                                        recipientType === 'username' 
                                          ? "border-primary bg-primary/10" 
                                          : "border-muted hover:border-primary/50"
                                      )}
                                      onClick={() => setRecipientType('username')}
                                    >
                                      <div className="flex flex-col items-center gap-2">
                                        <User className="h-6 w-6" />
                                        <span className="text-sm font-medium">Username</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="relative">
                                      <Input
                                        id="recipient"
                                        placeholder={recipientType === 'phone' 
                                          ? "+254 7XX XXX XXX" 
                                          : "@username"
                                        }
                                        value={recipientId}
                                        onChange={(e) => setRecipientId(e.target.value)}
                                        className="pl-8"
                                      />
                                      {recipientType === 'phone' ? (
                                        <Phone className="h-4 w-4 absolute left-2.5 top-3 text-muted-foreground" />
                                      ) : (
                                        <AtSign className="h-4 w-4 absolute left-2.5 top-3 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="relative">
                                      <Input
                                        id="amount"
                                        placeholder="Enter KES"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-8"
                                      />
                                      <DollarSign className="h-4 w-4 absolute left-2.5 top-3 text-muted-foreground" />
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => setShowSendForm(false)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button 
                                      className="flex-1"
                                      onClick={handleSendMoney}
                                    >
                                      Verify Recipient
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid gap-4">
                                  <div className="p-4 rounded-lg border bg-muted/50">
                                    <div className="space-y-3">
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm text-muted-foreground">Recipient</span>
                                          <div className="text-right">
                                            {recipientDetails?.username && (
                                              <div className="font-medium">@{recipientDetails.username}</div>
                                            )}
                                            {recipientDetails?.phoneNumber && (
                                              <div className="text-sm text-muted-foreground">
                                                {recipientDetails.phoneNumber}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Amount</span>
                                        <span className="font-medium">KES {parseFloat(amount).toLocaleString()}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                                        <div className="flex items-center gap-1">
                                          <span>Public Key:</span>
                                          <code className="font-mono bg-muted px-1 rounded">
                                            {recipientDetails?.publicKey.slice(0, 16)}...
                                          </code>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      onClick={() => {
                                        setShowConfirmation(false);
                                        setRecipientDetails(null);
                                      }}
                                    >
                                      Edit
                                    </Button>
                                    <Button 
                                      className="flex-1"
                                      onClick={handleConfirmedSend}
                                      disabled={!isPrivateKeyActive}
                                    >
                                      {isPrivateKeyActive ? 'Confirm Send' : 'Activate Private Key to Send'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* QR Scanner Section */}
              <div className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowQRScan(!showQRScan)}
                >
                  {showQRScan ? (
                    <X className="mr-2 h-4 w-4" />
                  ) : (
                    <QrCode className="mr-2 h-4 w-4" />
                  )}
                  {showQRScan ? 'Close Scanner' : 'Scan QR'}
                </Button>

                <AnimatePresence>
                  {showQRScan && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Card className="mt-4">
                        <CardHeader>
                          <CardTitle className="text-lg font-medium">Scan QR Code</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Point your camera at a Boost QR code
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="border-2 border-dashed rounded-lg aspect-square flex items-center justify-center bg-muted">
                              <div className="text-center space-y-2 p-8">
                                <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Camera access required for QR scanning
                                </p>
                                <Button variant="secondary" size="sm">
                                  Enable Camera
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground text-center">
                              You can also upload a QR code image
                              <div className="mt-2">
                                <Button variant="outline" size="sm">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload QR Image
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bio Auth Section */}
              <div className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowBioAuth(!showBioAuth)}
                >
                  {showBioAuth ? (
                    <X className="mr-2 h-4 w-4" />
                  ) : (
                    <Fingerprint className="mr-2 h-4 w-4" />
                  )}
                  {showBioAuth ? 'Cancel' : 'Bio Auth'}
                </Button>

                <AnimatePresence>
                  {showBioAuth && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Card className="mt-4">
                        <CardHeader>
                          <CardTitle className="text-lg font-medium">Biometric Authentication</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Use your device's biometric sensor
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="border rounded-lg p-8">
                              <div className="text-center space-y-4">
                                <Fingerprint className="w-16 h-16 mx-auto text-primary animate-pulse" />
                                <div className="space-y-2">
                                  <h3 className="font-medium">Ready to Scan</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Place your finger on the sensor
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground text-center">
                              <p>Using biometric authentication for secure transactions</p>
                              <Button variant="link" size="sm" className="mt-2">
                                Learn more about biometric security
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Deposit Money</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="h-24 text-lg">
                      <Plus className="mr-2 h-5 w-5" />
                      M-Pesa
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Deposit via M-Pesa</h4>
                        <p className="text-sm text-muted-foreground">
                          Enter amount to deposit
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {quickAmounts.map((amt) => (
                          <Button 
                            key={amt.value}
                            variant="outline" 
                            onClick={() => setAmount(amt.value)}
                            className={amount === amt.value ? "border-primary" : ""}
                          >
                            {amt.label}
                          </Button>
                        ))}
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="deposit-amount">Amount</Label>
                          <Input
                            id="deposit-amount"
                            className="col-span-2"
                            placeholder="Enter amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => handleDeposit(amount)}
                      >
                        Process Deposit
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="h-24 text-lg" variant="outline">
                      <Plus className="mr-2 h-5 w-5" />
                      Bank Transfer
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Bank Transfer Details</h4>
                        <p className="text-sm text-muted-foreground">
                          Use these details to make a transfer
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label>Bank</Label>
                          <div className="col-span-2 font-medium">NCBA Bank</div>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label>Account</Label>
                          <div className="col-span-2 font-medium">1234567890</div>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label>Name</Label>
                          <div className="col-span-2 font-medium">BOOST FINANCE</div>
                        </div>
                      </div>
                      <Button className="w-full" variant="outline">Copy Details</Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-sm text-muted-foreground">
                Instant deposits available via M-Pesa. Bank transfers may take 1-3 business days.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Withdraw Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="h-24 text-lg" variant="destructive">
                      <Minus className="mr-2 h-5 w-5" />
                      To M-Pesa
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Withdraw to M-Pesa</h4>
                        <p className="text-sm text-muted-foreground">
                          Enter withdrawal details
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {quickAmounts.map((amt) => (
                          <Button 
                            key={amt.value}
                            variant="outline" 
                            onClick={() => setAmount(amt.value)}
                            className={amount === amt.value ? "border-destructive" : ""}
                          >
                            {amt.label}
                          </Button>
                        ))}
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="withdraw-amount">Amount</Label>
                          <Input
                            id="withdraw-amount"
                            className="col-span-2"
                            placeholder="Enter amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full" 
                        variant="destructive"
                        onClick={() => setWithdrawDialogOpen(true)}
                      >
                        Process Withdrawal
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button className="h-24 text-lg" variant="outline">
                      <Minus className="mr-2 h-5 w-5" />
                      To Bank
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Bank Withdrawal</h4>
                        <p className="text-sm text-muted-foreground">
                          Enter bank account details
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="bank-name">Bank</Label>
                          <Input
                            id="bank-name"
                            className="col-span-2"
                            placeholder="Bank name"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="account-number">Account</Label>
                          <Input
                            id="account-number"
                            className="col-span-2"
                            placeholder="Account number"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="withdraw-bank-amount">Amount</Label>
                          <Input
                            id="withdraw-bank-amount"
                            className="col-span-2"
                            placeholder="Enter amount"
                            type="number"
                          />
                        </div>
                      </div>
                      <Button className="w-full">Process Withdrawal</Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="text-sm text-muted-foreground">
                M-Pesa withdrawals are instant. Bank withdrawals processed within 24 hours.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Withdrawal</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Please enter your private key or upload your key file to authorize this withdrawal
            </p>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Amount</Label>
              <div className="text-lg font-medium">KES {amount}</div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="private-key">Private Key</Label>
              <Textarea
                id="private-key"
                placeholder="Enter your private key"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="font-mono text-xs"
                rows={4}
              />
              <div className="relative">
                <Input
                  type="file"
                  accept=".txt"
                  className="hidden"
                  id="key-file"
                  onChange={async (e) => {
                    try {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const key = await readPrivateKeyFile(file);
                      setPrivateKey(key);
                      toast.success('Private key loaded successfully');
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to load private key');
                    }
                  }}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('key-file')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Key File
                </Button>
              </div>
            </div>
            <Button 
              variant="destructive"
              onClick={() => handleWithdraw(amount, 'mpesa')}
            >
              Confirm Withdrawal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={!!paymentRequest} 
        onOpenChange={(open) => {
          if (!open && !isProcessingPayment) setPaymentRequest(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>A vendor has requested payment of:</p>
            <div className="text-2xl font-bold text-center">
              KES {paymentRequest?.amount.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              From vendor: {paymentRequest?.vendorId}
            </p>
            {isProcessingPayment && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <RefreshCcw className="h-4 w-4 animate-spin" />
                Processing payment...
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPaymentRequest(null)}
              disabled={isProcessingPayment}
            >
              Decline
            </Button>
            <Button 
              onClick={async () => {
                setIsProcessingPayment(true);
                try {
                  await handlePaymentComplete();
                } finally {
                  setIsProcessingPayment(false);
                }
              }}
              disabled={!isPrivateKeyActive || isProcessingPayment}
            >
              {!isPrivateKeyActive 
                ? 'Activate Private Key to Pay' 
                : isProcessingPayment 
                ? 'Processing...' 
                : 'Pay Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              ) : recentTransactions
                .reduce((acc, tx) => {
                  // Group transactions by block height
                  const blockTransactions = recentTransactions.filter(t => 
                    t.blockHeight === tx.blockHeight && 
                    t.type === 'SENT'
                  );
              
                  // If we have multiple transactions in the same block
                  if (blockTransactions.length === 2) {
                    const [tx1, tx2] = blockTransactions.sort((a, b) => b.amount - a.amount);
                    // Larger amount is main transaction, smaller is fee
                    const mainAmount = tx1.amount;
                    const feeAmount = tx2.amount;
                    
                    // Verify if the smaller amount matches expected fee percentage
                    const expectedFee = mainAmount * TRANSACTION_FEE_PERCENTAGE;
                    const expectedFeeWithTolerance = expectedFee * (1 + PERCENTAGE_TOLERANCE);
                    
                    if (feeAmount <= expectedFeeWithTolerance && 
                        feeAmount >= expectedFee * (1 - PERCENTAGE_TOLERANCE)) {
                      // This is a transaction + fee pair
                      const existingTx = acc.find(t => t.blockHeight === tx.blockHeight);
                      if (!existingTx) {
                        acc.push({
                          ...tx1,
                          fee: feeAmount
                        });
                      }
                      return acc;
                    }
                  }
                  
                  // If not part of a fee transaction pair, add normally
                  if (!acc.find(t => t.blockHeight === tx.blockHeight)) {
                    acc.push(tx);
                  }
                  return acc;
                }, [] as Transaction[])
                .map((tx) => {
                  const transactionType = tx.type === 'SENT' && !tx.counterparty 
                    ? 'WITHDRAW'
                    : tx.type === 'RECEIVED' && !tx.counterparty
                    ? 'DEPOSIT'
                    : tx.type;
              
                  return (
                    <div
                      key={tx.blockHeight}
                      className="p-1 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="grid grid-cols-5 gap-4 scale-90">
                        {/* Main Transaction Details - Takes 3 columns */}
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
                            {transactionType === 'DEPOSIT' ? (
                              'Deposited to wallet'
                            ) : transactionType === 'WITHDRAW' ? (
                              'Withdrawn from wallet'
                            ) : tx.type === 'SENT' ? (
                              `Sent to ${stripPublicKey(tx.counterparty ?? '').slice(0, 16)}...`
                            ) : (
                              `Received from ${stripPublicKey(tx.counterparty ?? '').slice(0, 16)}...`
                            )}
                          </div>
                        </div>

                        {/* Amount/Fee Details - Takes 2 columns */}
                        <div className="col-span-2 flex flex-col justify-between pl-0 lg:pl-4">
                          {tx.type === 'SENT' && tx.fee ? (
                            <>
                              <div className="space-y-1 text-xs scale-80">
                                <div className="flex justify-between items-center text-muted-foreground">
                                  <span>Network Fee ({((tx.fee / tx.amount) * 100).toFixed(1)}%)</span>
                                  <span className="text-red-500">-{tx.fee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 text-muted-foreground">
                                  <span>Total</span>
                                  <span>-{(tx.amount + tx.fee).toLocaleString()}</span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div /> // Placeholder for spacing
                          )}
                          <div className={cn(
                            "text-sm font-medium text-right",
                            transactionType === 'DEPOSIT' || tx.type === 'RECEIVED' 
                              ? "text-green-500" 
                              : "text-red-500"
                          )}>
                            {transactionType === 'DEPOSIT' || tx.type === 'RECEIVED' ? '+' : '-'}
                            {(tx.amount + (tx.fee ?? 0)).toLocaleString()}
                          </div>
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