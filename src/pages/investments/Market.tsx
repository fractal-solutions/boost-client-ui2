import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { invest_ip } from '@/lib/config';

interface Pool {
  id: string;
  name: string;
  description: string;
  totalSupply: number;
  currentAmount: number;
  threshold: number;
  status: 'OPEN' | 'THRESHOLD_MET' | 'ACTIVE' | 'COMPLETED' | 'CLOSED';
  interestRate: number;
}

interface PoolDetails extends Pool {
  borrowers: [string, any][];
  lenders: [string, number][];
}


const quickInvestAmounts = [
  { value: "50000", label: "KES 50,000" },
  { value: "100000", label: "KES 100,000" },
  { value: "250000", label: "KES 250,000" },
  { value: "500000", label: "KES 500,000" },
];



export default function InvestmentsMarket() {
  const { user, token } = useAuth();
  const [showInvestForm, setShowInvestForm] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [amount, setAmount] = useState('');
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  // Fetch pools on mount
  useEffect(() => {
    const fetchPools = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching pools from:', `${invest_ip}/pools/active`);
        const response = await fetch(`${invest_ip}/pools/active`);
        console.log('Response status:', response.status);
        
        if (!response.ok) throw new Error('Failed to fetch pools');
        
        const data = await response.json();
        console.log('Received pools data:', data);
        
        if (data.success) {
          setPools(data.pools);
          console.log('Set pools:', data.pools.length, 'pools');
        } else {
          console.error('Failed to fetch pools:', data.error);
        }
      } catch (error) {
        console.error('Failed to fetch pools:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPools();
  }, []);

  const handleInvest = async (poolId: string) => {
    if (!user?.publicKey || !token) {
      toast.error('Please login first');
      return;
    }

    try {
      const response = await fetch(`${invest_ip}/pool/${poolId}/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          publicKey: user.publicKey,
          amount: Number(amount)
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Investment successful!');
        setShowInvestForm(false);
        setAmount('');
        // Refresh pools
        const poolsResponse = await fetch(`${invest_ip}/pools/active`);
        const poolsData = await poolsResponse.json();
        if (poolsData.success) {
          setPools(poolsData.pools);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Investment failed');
    }
  };

  if (!user?.publicKey) {
    return (
      <div className="container mx-auto max-w-7xl">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="space-y-4">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Login Required</h3>
              <p className="text-muted-foreground">
                Please login to view Market
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : pools.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent>
            <div className="space-y-4">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">No Investment Pools Available</h3>
              <p className="text-muted-foreground">
                Check back later for new investment opportunities
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => (
            <Card key={pool.id} className="flex flex-col h-fit">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-medium">
                      {pool.name}
                    </CardTitle>
                    <Badge variant="secondary">Investment Pool</Badge>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    {(pool.interestRate * 100).toFixed(1)}% APR
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex gap-6">
                  <div className="flex items-end gap-2">
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-muted-foreground mb-1">Progress</div>
                      <div className="w-4 h-20 bg-gray-200 rounded-full overflow-hidden rotate-180">
                        <div
                          className="w-full bg-blue-500 rounded-full"
                          style={{ height: `${(pool.currentAmount / pool.totalSupply) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-muted-foreground mb-1">Threshold</div>
                      <div className="w-4 h-20 bg-gray-200 rounded-full overflow-hidden rotate-180">
                        <div
                          className="w-full bg-green-500 rounded-full"
                          style={{ height: `${(pool.threshold / pool.totalSupply) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Supply</span>
                        <span>KES {pool.totalSupply.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Amount</span>
                        <span>KES {pool.currentAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-primary/80"
                      onClick={() => {
                        setSelectedPool(pool);
                        setShowInvestForm(!showInvestForm);
                      }}
                      disabled={pool.status !== 'OPEN'}
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      {pool.status === 'OPEN' ? 'Invest Now' : pool.status}
                    </Button>
                  </div>
                </div>

                {/* Keep existing investment form code but update the confirm button */}
                {showInvestForm && selectedPool?.id === pool.id && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden w-full"
                    >
                      <Card className="mt-4 w-full">
                        <CardHeader>
                          <CardTitle className="text-lg font-medium">
                            Invest in {pool.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                          {/* Keep existing quick invest amounts */}
                          <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-2">
                              {quickInvestAmounts.map((amt) => (
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
                                <Label htmlFor="invest-amount">Amount</Label>
                                <Input
                                  id="invest-amount"
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
                              onClick={() => handleInvest(pool.id)}
                              disabled={!amount || isNaN(Number(amount)) || Number(amount) <= 0}
                            >
                              Confirm Investment
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {[
              'Market showing strong growth in tech sector',
              'Real estate investments trending upward',
              'New sustainable energy funds available',
              'Global market analysis update',
            ].map((insight, index) => (
              <div
                key={index}
                className="flex items-center py-4 border-b last:border-0"
              >
                <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}