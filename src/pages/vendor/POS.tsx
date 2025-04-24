import { useState, useCallback, useEffect } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QrCode, Undo2, RefreshCcw, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  Minus, 
  Package,
  ShoppingCart,
  ChevronDown
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { InventoryItem, loadInventoryFromStorage, saveInventoryToStorage } from './Inventory';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Label } from '@/components/ui/label';
import { OnlyBalance } from './Balance';
import { getBalance } from '@/services/balance';
import { getFullUserDetails } from '@/services/users';

interface CartItem {
  id: string;
  name: string;
  sellingPrice: number;
  quantity: number;
  sku: string;
  imageUrl?: string;
}

interface PurchaseHistory {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: number;
  purchaseId: string;
  transactionId?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  transaction?: {
    blockHeight?: number;
    timestamp: number;
    userId: string;
  };
  customerDetails?: {
    phoneNumber: string;
    username: string;
    publicKey: string;
  };
}

interface Transaction {
  type: 'SENT' | 'RECEIVED';
  amount: number;
  fee?: number;
  counterparty: string | null;
  timestamp: number;
  blockHeight: number;
}

const getPurchaseHistoryKey = (publicKey: string) => {
  // Clean the key first
  const cleanKey = publicKey
    .replace(/\r?\n|\r/g, '')
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .trim();

  // Get a slice from the middle of the key
  const startIndex = Math.floor(cleanKey.length / 3); // Start at 1/3rd of the key
  const keySlice = cleanKey.slice(startIndex, startIndex + 16);

  return `purchase_history_${keySlice}`;
};

const savePurchaseHistory = (publicKey: string, history: PurchaseHistory[]) => {
  try {
    const key = getPurchaseHistoryKey(publicKey);
    // Limit history size to prevent quota issues
    const limitedHistory = history.slice(0, 100); // Keep only last 100 records
    localStorage.setItem(key, JSON.stringify(limitedHistory));
  } catch (error) {
    //console.error('Failed to save purchase history:', error);
    // Optionally show toast notification
    toast.error('Failed to save purchase history');
  }
};

const loadPurchaseHistory = (publicKey: string): PurchaseHistory[] => {
  try {
    const key = getPurchaseHistoryKey(publicKey);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    toast.error(`Failed to load purchase history:` + error);
    return [];
  }
};

const undoPurchase = (publicKey: string, purchase: PurchaseHistory) => {
  // Restore inventory
  const inventory = loadInventoryFromStorage(publicKey);
  const updatedInventory = inventory.map(item => {
    const purchasedItem = purchase.items.find(pi => pi.id === item.id);
    if (purchasedItem) {
      return {
        ...item,
        quantity: item.quantity + purchasedItem.quantity
      };
    }
    return item;
  });
  saveInventoryToStorage(publicKey, updatedInventory);

  // Remove from purchase history
  const history = loadPurchaseHistory(publicKey);
  const updatedHistory = history.filter(p => p.id !== purchase.id);
  savePurchaseHistory(publicKey, updatedHistory);

  return updatedInventory;
};

export default function VendorPOS() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>(() => {
    if (!user?.publicKey) return [];
    return loadPurchaseHistory(user.publicKey);
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const [showQrItems, setShowQrItems] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseHistory | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showPaymentRequestDialog, setShowPaymentRequestDialog] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { socket } = useWebSocket();

  const inventory = user?.publicKey 
    ? loadInventoryFromStorage(user.publicKey) 
    : [];

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = cart.reduce((sum, item) => 
    sum + (item.sellingPrice * item.quantity), 0
  );

  const addToCart = (item: InventoryItem) => {
    if (item.quantity <= 0) {
      toast.error('Item out of stock');
      return;
    }

    setCart(currentCart => {
      const existingItem = currentCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        if (existingItem.quantity >= item.quantity) {
          toast.error('Not enough stock available');
          return currentCart;
        }
        
        return currentCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      
      return [...currentCart, { ...item, quantity: 1 }];
    });
  };

  const updateCartItemQuantity = (itemId: string, delta: number) => {
    const inventoryItem = inventory.find(item => item.id === itemId);
    if (!inventoryItem) return;

    setCart(currentCart => 
      currentCart.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity > inventoryItem.quantity) {
            toast.error('Not enough stock available');
            return item;
          }
          return newQuantity >= 0 
            ? { ...item, quantity: newQuantity }
            : item;
        }
        return item;
      }).filter(item => item.quantity > 0) // This removes items with quantity 0
    );
  };

  const updateInventoryAfterPurchase = () => {
    if (!user?.publicKey) return;

    const updatedInventory = inventory.map(item => {
      const cartItem = cart.find(ci => ci.id === item.id);
      if (cartItem) {
        return {
          ...item,
          quantity: item.quantity - cartItem.quantity,
          lastUpdated: Date.now(),
          stockHistory: [
            ...item.stockHistory,
            {
              id: Date.now().toString(),
              type: 'OUT' as 'OUT',
              quantity: cartItem.quantity,
              date: Date.now(),
              reason: 'Sale',
              sale: {
                price: cartItem.sellingPrice,
                receipt: Date.now().toString() // You might want to use a proper receipt number
              }
            }
          ]
        };
      }
      return item;
    });

    saveInventoryToStorage(user.publicKey, updatedInventory);
  };

  const generateQR = async (customAmount?: number) => {
    if (!user?.publicKey) {
      toast.error('Please login to generate payment QR');
      return;
    }

    const finalAmount = customAmount ?? totalAmount;
    if (!finalAmount || finalAmount <= 0) {
      toast.error('Please enter a valid amount or add items to cart');
      return;
    }

    setPendingAmount(finalAmount);
    setShowConfirmDialog(true);
  };

  const handlePaymentRequest = async () => {
    if (!user?.phoneNumber || cart.length === 0 || !userPhoneNumber) return;
  
    try {
      // Get full user details including username
      const userData = await getFullUserDetails(userPhoneNumber.trim());
      
      // Create the purchase record first with pending status
      const purchase: PurchaseHistory = {
        id: Date.now().toString(),
        items: [...cart],
        total: totalAmount,
        timestamp: Date.now(),
        paymentStatus: 'pending',
        purchaseId: Date.now().toString(),
        customerDetails: {
          phoneNumber: userData.phoneNumber,
          username: userData.username,
          publicKey: userData.publicKey
        }
      };
  
      // Send the payment request
      const response = await fetch('http://localhost:2225/payment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userPhoneNumber.trim(),
          vendorId: user.phoneNumber,
          amount: totalAmount,
          purchaseId: purchase.purchaseId
        })
      });
  
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to send payment request');
      }
  
      // Save the pending purchase to history
      setPurchaseHistory(prev => {
        const updated = [purchase, ...prev];
        savePurchaseHistory(user.publicKey, updated);
        return updated;
      });
  
      setCart([]);
      setShowPaymentRequestDialog(false);
      toast.success('Payment request sent');
    } catch (error) {
      console.error('Payment request error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send payment request');
    }
  };
  

  const confirmPurchase = () => {
    if (!user?.publicKey || !pendingAmount) return;

    const paymentData = {
      publicKey: user.publicKey,
      amount: pendingAmount,
      timestamp: Date.now(),
      //items: !amount ? cart : undefined
    };

    const purchase: PurchaseHistory = {
      id: Date.now().toString(),
      items: [...cart],
      total: pendingAmount,
      timestamp: Date.now(),
      paymentStatus: 'pending',
      purchaseId: Date.now().toString()
    };

    setPurchaseHistory(prev => {
      const updated = [purchase, ...prev];
      savePurchaseHistory(user.publicKey, updated);
      return updated;
    });

    updateInventoryAfterPurchase();
    setCart([]);
    
    const qrData = JSON.stringify(paymentData);
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`);
    
    setShowConfirmDialog(false);
    setShowQrDialog(true);
    toast.success('Purchase recorded and inventory updated');
  };

  const handleUndoPurchase = (purchase: PurchaseHistory) => {
    if (!user?.publicKey) return;

    const updatedInventory = undoPurchase(user.publicKey, purchase);
    setPurchaseHistory(prev => prev.filter(p => p.id !== purchase.id));
    toast.success('Purchase undone and inventory restored');
  };

  const generatePurchaseQR = (purchase: PurchaseHistory) => {
    if (!user?.publicKey) return;

    const paymentData = {
      publicKey: user.publicKey,
      amount: purchase.total,
      timestamp: purchase.timestamp,
      items: purchase.items
    };

    const qrData = JSON.stringify(paymentData);
    setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`);
    setSelectedPurchase(purchase);
    setShowQrDialog(true);
  };

  const fetchRecentTransactions = useCallback(async () => {
    if (!user?.publicKey) return;

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
  }, [user?.publicKey]);

  const fetchBalance = useCallback(async () => {
    if (!user?.publicKey) return;

    try {
      setIsLoadingBalance(true);
      const balance = await getBalance(user.publicKey);
      setBalance(balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      toast.error('Failed to update balance');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [user?.publicKey]);

  useEffect(() => {
    fetchRecentTransactions();
  }, [fetchRecentTransactions]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (!socket) return;
  
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'payment-complete') {
        const { userId, amount, status, purchaseId } = data.data;
  
        console.log('Payment completion received:', data.data);
  
        // Update purchase history status and handle inventory
        setPurchaseHistory(prev => {
          const updated = prev.map(purchase => {
            if (purchase.purchaseId === purchaseId) {
              // If payment successful, update inventory
              if (status === 'success' && user?.publicKey) {
                updateInventoryForPurchase(purchase.items);
              }
  
              return {
                ...purchase,
                paymentStatus: status === 'success' ? 'completed' as const : 'failed' as const,
                transaction: status === 'success' ? {
                  timestamp: Date.now(),
                  userId
                } : undefined
              };
            }
            return purchase;
          });
          
          // Save updated history to local storage
          if (user?.publicKey) {
            savePurchaseHistory(user.publicKey, updated);
          }
          
          return updated;
        });
  
        // Show appropriate notification and update UI
        if (status === 'success') {
          toast.success(`Payment of KES ${amount} received from ${userId}`);
          fetchRecentTransactions();
          fetchBalance();
        } else {
          toast.error(`Payment failed from ${userId}`);
        }
      } else if (data.type === 'payment-error') {
        // Handle payment error type explicitly
        const { userId, purchaseId } = data.data || {};
        
        // Update purchase history to mark as failed
        setPurchaseHistory(prev => {
          const updated = prev.map(purchase => {
            if (purchase.purchaseId === purchaseId) {
              return {
                ...purchase,
                paymentStatus: 'failed' as const,
                transaction: undefined
              };
            }
            return purchase;
          });
          
          if (user?.publicKey) {
            savePurchaseHistory(user.publicKey, updated);
          }
          
          return updated;
        });
  
        toast.error(`Payment failed${userId ? ` from ${userId}` : ''}`);
      }
    };
  }, [socket, fetchRecentTransactions, fetchBalance, user?.publicKey]);

  const updateInventoryForPurchase = (items: CartItem[]) => {
    if (!user?.publicKey) return;
  
    const updatedInventory = inventory.map(item => {
      const purchaseItem = items.find(pi => pi.id === item.id);
      if (purchaseItem) {
        return {
          ...item,
          quantity: item.quantity - purchaseItem.quantity,
          lastUpdated: Date.now(),
          stockHistory: [
            ...item.stockHistory,
            {
              id: Date.now().toString(),
              type: 'OUT' as const,
              quantity: purchaseItem.quantity,
              date: Date.now(),
              reason: 'Sale',
              sale: {
                price: purchaseItem.sellingPrice,
                receipt: Date.now().toString()
              }
            }
          ]
        };
      }
      return item;
    });
  
    saveInventoryToStorage(user.publicKey, updatedInventory);
  };

  return (
    <div className="space-y-6">
      <OnlyBalance />

      <Tabs defaultValue="catalog" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted">
          <TabsTrigger 
            value="catalog"
            className="data-[state=active]:bg-background"
          >
            <Package className="h-4 w-4 mr-2" />
            Product Catalog
          </TabsTrigger>
          <TabsTrigger 
            value="custom"
            className="data-[state=active]:bg-background"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Custom Amount
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="catalog">
          <Card>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShoppingCart className="h-4 w-4" />
                  <span>{cart.length} items</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-6">
                  <Card>
                    <ScrollArea className="h-[400px]">
                      <div className="p-4 space-y-4">
                        {filteredInventory.map(item => (
                          <div 
                            key={item.id}
                            className="flex items-center gap-4 p-2 rounded-lg border"
                          >
                            <div className="w-16 h-16 rounded-lg border overflow-hidden flex-shrink-0">
                              {item.imageUrl ? (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  SKU: {item.sku}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  KES {item.sellingPrice.toLocaleString()} ({item.quantity} in stock)
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => addToCart(item)}
                              >
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>

                  <Card>
                    <div className="border-b">
                      <button
                        className={cn(
                          "w-full p-4 flex items-center justify-between",
                          "bg-background hover:bg-muted/50 transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2",
                          "focus-visible:ring-ring focus-visible:ring-offset-2",
                          "disabled:pointer-events-none disabled:opacity-50"
                        )}
                        onClick={() => setShowCart(!showCart)}
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingCart className={cn(
                            "h-4 w-4",
                            cart.length > 0 ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span className="text-sm font-medium flex items-center gap-2">
                            Shopping Cart
                            {cart.length > 0 && (
                              <Badge 
                                variant="secondary"
                                className="ml-2 bg-primary/10 text-primary hover:bg-primary/20"
                              >
                                {cart.length} {cart.length === 1 ? 'item' : 'items'}
                              </Badge>
                            )}
                          </span>
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          showCart && "transform rotate-180"
                        )} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {showCart && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <ScrollArea className="h-[300px]">
                            <div className="p-4 space-y-4">
                              {cart.map(item => (
                                <div 
                                  key={item.id}
                                  className="flex items-center gap-4 p-2 rounded-lg border"
                                >
                                  <div className="w-12 h-12 rounded-lg border overflow-hidden flex-shrink-0">
                                    {item.imageUrl ? (
                                      <img 
                                        src={item.imageUrl} 
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-muted flex items-center justify-center">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 flex justify-between items-center">
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        KES {item.sellingPrice.toLocaleString()} × {item.quantity}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="icon"
                                        className="h-8 w-8 p-0 hover:bg-muted"
                                        onClick={() => updateCartItemQuantity(item.id, -1)}
                                      >
                                        <Minus className="h-4 w-4 text-muted-foreground" />
                                      </Button>
                                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                                      <Button 
                                        variant="outline" 
                                        size="icon"
                                        className="h-8 w-8 p-0 hover:bg-muted"
                                        onClick={() => updateCartItemQuantity(item.id, 1)}
                                      >
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="p-4 border-t space-y-4">
                      <div className="flex justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-medium">
                          KES {totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          className="w-full"
                          onClick={() => generateQR()}
                          disabled={cart.length === 0}
                        >
                          <QrCode className="mr-2 h-4 w-4" />
                          Generate QR
                        </Button>
                        <Button 
                          className="w-full"
                          variant="secondary"
                          onClick={() => setShowPaymentRequestDialog(true)}
                          disabled={cart.length === 0}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Request Pay
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="w-full">
                  <div className="border-b">
                    <button
                      className={cn(
                        "w-full p-4 flex items-center justify-between",
                        "bg-background hover:bg-muted/50 transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-ring focus-visible:ring-offset-2"
                      )}
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Recent Purchase History</span>
                        <Badge variant="secondary" className="ml-2">
                          {purchaseHistory.length} receipts
                        </Badge>
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        showHistory && "transform rotate-180"
                      )} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showHistory && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <ScrollArea className="h-[400px]">
                          <div className="p-4 space-y-4">
                          {purchaseHistory.map(purchase => (
                            <div 
                              key={purchase.id}
                              className="border rounded-lg p-4 space-y-2"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">
                                    KES {purchase.total.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(purchase.timestamp).toLocaleString()}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={
                                      purchase.paymentStatus === 'completed' ? 'default' :
                                      purchase.paymentStatus === 'pending' ? 'secondary' : 
                                      'destructive'
                                    }>
                                      {purchase.paymentStatus}
                                    </Badge>
                                    {purchase.transaction && (
                                      <>
                                        <span className="text-xs text-muted-foreground">
                                          Block #{purchase.transaction.blockHeight}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          From: {purchase.transaction.userId}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  {purchase.transactionId && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Transaction ID: {purchase.transactionId.slice(0, 8)}...
                                    </div>
                                  )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost" 
                                      size="icon"
                                      className={cn(
                                        "h-8 w-8 p-0",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        "transition-colors duration-200"
                                      )}
                                      onClick={() => generatePurchaseQR(purchase)}
                                      title="View QR Code"
                                    >
                                      <QrCode className={cn(
                                        "h-4 w-4",
                                        "text-muted-foreground",
                                        "group-hover:text-accent-foreground"
                                      )} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "h-8 w-8 p-0",
                                        "hover:bg-destructive/10 hover:text-destructive",
                                        "transition-colors duration-200"
                                      )}
                                      onClick={() => handleUndoPurchase(purchase)}
                                      title="Undo Purchase"
                                    >
                                      <Undo2 className={cn(
                                        "h-4 w-4",
                                        "text-muted-foreground",
                                        "group-hover:text-destructive"
                                      )} />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="space-y-1 pt-2 border-t">
                                  {purchase.items.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                      <span>{item.quantity}x {item.name}</span>
                                      <span>KES {(item.sellingPrice * item.quantity).toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                <Card className="w-full">
                  <div className="border-b">
                    <button
                      className={cn(
                        "w-full p-4 flex items-center justify-between",
                        "bg-background hover:bg-muted/50 transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-ring focus-visible:ring-offset-2"
                      )}
                      onClick={() => setShowTransactions(!showTransactions)}
                    >
                      <div className="flex items-center gap-2">
                        <RefreshCcw 
                          className={cn(
                            "h-4 w-4",
                            isLoadingTransactions && "animate-spin",
                            "text-muted-foreground"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchRecentTransactions();
                          }}
                        />
                        <span className="text-sm font-medium">Recent Transactions</span>
                        {recentTransactions.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {recentTransactions.length} transactions
                          </Badge>
                        )}
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        showTransactions && "transform rotate-180"
                      )} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showTransactions && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <ScrollArea className="h-[400px]">
                          <div className="p-4 space-y-4">
                            {isLoadingTransactions ? (
                              <div className="flex items-center justify-center py-8 text-muted-foreground">
                                <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
                                <span>Loading transactions...</span>
                              </div>
                            ) : recentTransactions.length > 0 ? (
                              recentTransactions.map((tx) => (
                                <div
                                  key={tx.blockHeight}
                                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={tx.type === 'RECEIVED' ? 'default' : 'destructive'}
                                      >
                                        {tx.type}
                                      </Badge>
                                      <span className="text-muted-foreground text-sm">
                                        Block #{tx.blockHeight}
                                      </span>
                                    </div>
                                    <div className="font-medium text-lg">
                                      KES {tx.amount.toLocaleString()}
                                    </div>
                                    {tx.counterparty && (
                                      <div className="text-sm text-muted-foreground">
                                        {tx.type === 'SENT' ? 'To:' : 'From:'} {tx.counterparty.slice(0, 16)}...
                                      </div>
                                    )}
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(tx.timestamp).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                No transactions found
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-12"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  KES
                </span>
              </div>
              <Button 
                onClick={() => generateQR(parseFloat(amount))}
                className="w-full"
                disabled={!user?.publicKey}
              >
                <QrCode className="mr-2 h-4 w-4" />
                Generate Payment QR
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {qrCode && (
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4">
            <img 
              src={qrCode} 
              alt="Payment QR Code" 
              className="border p-2 bg-white rounded-lg" 
            />
            <div className="w-full text-sm text-muted-foreground">
              <div className="text-center mb-4">
                <p>Amount: KES {pendingAmount?.toLocaleString()}</p>
                <p className="text-xs mt-1">
                  Merchant ID: {user?.publicKey.slice(0, 8)}...{user?.publicKey.slice(-8)}
                </p>
              </div>

              {cart.length > 0 && (
                <div className="border rounded-lg">
                  <button
                    className={cn(
                      "w-full p-3 flex items-center justify-between",
                      "hover:bg-muted transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                    onClick={() => setShowQrItems(!showQrItems)}
                  >
                    <span className="font-medium text-foreground">
                      {selectedPurchase?.items.length ?? cart.length} items in purchase
                    </span>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      "text-muted-foreground",
                      showQrItems && "transform rotate-180"
                    )} />
                  </button>

                  <AnimatePresence>
                    {showQrItems && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-2">
                          {cart.map(item => (
                            <div key={item.id} className="flex justify-between text-sm py-1 border-t">
                              <div>
                                <span className="font-medium">{item.quantity}x</span> {item.name}
                                <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                              </div>
                              <div className="text-right">
                                <div>KES {(item.sellingPrice * item.quantity).toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">
                                  @ KES {item.sellingPrice.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between font-medium pt-2 border-t">
                            <span>Total</span>
                            <span>KES {totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              Generating a QR code will record this sale and update your inventory. 
              This action cannot be undone.
            </p>
            
            {cart.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                <p className="font-medium">Purchase Summary:</p>
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>KES {(item.sellingPrice * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between font-medium">
              <span>Total Amount:</span>
              <span>KES {pendingAmount?.toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPurchase}>
              Confirm & Generate QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPurchase ? 'Previous Purchase QR Code' : 'Payment QR Code'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <img 
              src={qrCode} 
              alt="Payment QR Code" 
              className="border p-2 bg-white rounded-lg" 
            />
            <div className="w-full text-sm text-muted-foreground">
              <div className="text-center mb-4">
                <p className="text-lg font-medium">
                  KES {(selectedPurchase?.total ?? pendingAmount)?.toLocaleString()}
                </p>
                <p className="text-xs mt-1">
                  Merchant ID: {user?.publicKey.slice(0, 8)}...{user?.publicKey.slice(-8)}
                </p>
                {selectedPurchase && (
                  <p className="text-xs mt-1">
                    Purchase Date: {new Date(selectedPurchase.timestamp).toLocaleString()}
                  </p>
                )}
              </div>

              {(selectedPurchase?.items.length ?? cart.length) > 0 && (
                <div className="border rounded-lg">
                  <button
                    className={cn(
                      "w-full p-3 flex items-center justify-between",
                      "hover:bg-muted transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                    onClick={() => setShowQrItems(!showQrItems)}
                  >
                    <span className="font-medium text-foreground">
                      {selectedPurchase?.items.length ?? cart.length} items in purchase
                    </span>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      "text-muted-foreground",
                      showQrItems && "transform rotate-180"
                    )} />
                  </button>

                  <AnimatePresence>
                    {showQrItems && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-2">
                          {(selectedPurchase?.items ?? cart).map(item => (
                            <div key={item.id} className="flex justify-between text-sm py-1 border-t">
                              <div>
                                <span className="font-medium">{item.quantity}x</span> {item.name}
                                <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                              </div>
                              <div className="text-right">
                                <div>KES {(item.sellingPrice * item.quantity).toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">
                                  @ KES {item.sellingPrice.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between font-medium pt-2 border-t">
                            <span>Total</span>
                            <span>KES {(selectedPurchase?.total ?? totalAmount).toLocaleString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              className={cn(
                "border-border",
                "hover:bg-muted hover:text-foreground",
                "transition-colors duration-200"
              )}
              onClick={() => {
                setShowQrDialog(false);
                setQrCode('');
                setAmount('');
                setSelectedPurchase(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentRequestDialog} onOpenChange={setShowPaymentRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Customer Phone Number</Label>
              <Input
                placeholder="+254 7XX XXX XXX"
                value={userPhoneNumber}
                onChange={(e) => setUserPhoneNumber(e.target.value)}
              />
            </div>
            
            <div className="border rounded-lg p-4 space-y-2">
              <p className="font-medium">Purchase Summary:</p>
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>KES {(item.sellingPrice * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium pt-2 border-t mt-2">
                <span>Total Amount:</span>
                <span>KES {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentRequest}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}