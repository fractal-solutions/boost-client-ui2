import { useState, useEffect, useCallback } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';

interface Transaction {
  type: 'SENT' | 'RECEIVED';
  amount: number;
  timestamp: number;
  blockHeight: number;
}

// Update the timeframe type to include more intervals
type TimeframeType = '30min' | 'hour' | '6hours' | '24hours' | 'week' | 'month' | 'quarter';

export default function VendorAnalytics() {
  const { user, token } = useAuth();
  const [timeframe, setTimeframe] = useState<TimeframeType>('24hours');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!user?.publicKey || !token) return;

    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:2224/last-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: user.publicKey,
          limit: 100,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transaction data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.publicKey, token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add data generation for different timeframes
  const generateTimeframeData = useCallback(() => {
    const now = Date.now();
    
    switch(timeframe) {
      case '30min':
        return Array.from({ length: 6 }).map((_, index) => {
          const minutesAgo = now - (5 - index) * 5 * 60 * 1000;
          const relevantTxs = transactions.filter(tx => 
            tx.timestamp > minutesAgo && 
            tx.timestamp <= minutesAgo + 5 * 60 * 1000
          );
          return {
            time: new Date(minutesAgo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            amount: relevantTxs.reduce((sum, tx) => 
              sum + (tx.type === 'RECEIVED' ? tx.amount : 0), 0
            )
          };
        });

      case 'hour':
        return Array.from({ length: 12 }).map((_, index) => {
          const minutesAgo = now - (11 - index) * 5 * 60 * 1000;
          const relevantTxs = transactions.filter(tx => 
            tx.timestamp > minutesAgo && 
            tx.timestamp <= minutesAgo + 5 * 60 * 1000
          );
          return {
            time: new Date(minutesAgo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            amount: relevantTxs.reduce((sum, tx) => 
              sum + (tx.type === 'RECEIVED' ? tx.amount : 0), 0
            )
          };
        });

      case '6hours':
        return Array.from({ length: 12 }).map((_, index) => {
          const hoursAgo = now - (11 - index) * 30 * 60 * 1000;
          const relevantTxs = transactions.filter(tx => 
            tx.timestamp > hoursAgo && 
            tx.timestamp <= hoursAgo + 30 * 60 * 1000
          );
          return {
            time: new Date(hoursAgo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            amount: relevantTxs.reduce((sum, tx) => 
              sum + (tx.type === 'RECEIVED' ? tx.amount : 0), 0
            )
          };
        });

      case '24hours':
        return Array.from({ length: 24 }).map((_, hour) => {
          const todayStart = new Date().setHours(0, 0, 0, 0);
          const hourStart = todayStart + hour * 60 * 60 * 1000;
          const relevantTxs = transactions.filter(tx => 
            tx.timestamp >= hourStart && 
            tx.timestamp < hourStart + 60 * 60 * 1000
          );
          return {
            time: `${hour.toString().padStart(2, '0')}:00`,
            amount: relevantTxs.reduce((sum, tx) => 
              sum + (tx.type === 'RECEIVED' ? tx.amount : 0), 0
            )
          };
        });

      case 'week':
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return weekDays.map(day => {
          const dayTxs = transactions.filter(tx => {
            const txDate = new Date(tx.timestamp);
            const lastWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
            return weekDays[txDate.getDay()] === day && txDate > lastWeek;
          });
          return {
            time: day,
            amount: dayTxs.reduce((sum, tx) => 
              sum + (tx.type === 'RECEIVED' ? tx.amount : 0), 0
            )
          };
        });

      case 'month':
        return Array.from({ length: 30 }).map((_, index) => {
          const dayStart = new Date(now - (29 - index) * 24 * 60 * 60 * 1000);
          const relevantTxs = transactions.filter(tx => {
            const txDate = new Date(tx.timestamp);
            return txDate.toDateString() === dayStart.toDateString();
          });
          return {
            time: dayStart.toLocaleDateString([], { month: 'short', day: 'numeric' }),
            amount: relevantTxs.reduce((sum, tx) => 
              sum + (tx.type === 'RECEIVED' ? tx.amount : 0), 0
            )
          };
        });

      case 'quarter':
        return Array.from({ length: 13 }).map((_, index) => {
          const weekStart = new Date(now - (12 - index) * 7 * 24 * 60 * 60 * 1000);
          const relevantTxs = transactions.filter(tx => {
            const txDate = new Date(tx.timestamp);
            return txDate >= weekStart && 
                   txDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          });
          return {
            time: `Week ${index + 1}`,
            amount: relevantTxs.reduce((sum, tx) => 
              sum + (tx.type === 'RECEIVED' ? tx.amount : 0), 0
            )
          };
        });
    }
  }, [timeframe, transactions]);

  return (
    <div className="space-y-6">
      <Card className="pt-4 px-2 sm:pt-8 sm:-pl-8 sm:pr-16">
        <div className="flex flex-col gap-4 sm:flex-row justify-between items-start sm:items-center pb-4 sm:pb-8">
          <CardTitle className="text-lg font-medium pt-0 pl-4 sm:pl-16">
            {isLoading ? 'Loading...' : 'Transaction Analytics'}
          </CardTitle>
          <div className="grid grid-cols-4 sm:flex gap-2 w-full sm:w-auto px-4">
            <Button
              variant={timeframe === '30min' ? 'default' : 'outline'}
              onClick={() => setTimeframe('30min')}
              className="text-xs sm:text-sm"
            >
              30m
            </Button>
            <Button
              variant={timeframe === 'hour' ? 'default' : 'outline'}
              onClick={() => setTimeframe('hour')}
              className="text-xs sm:text-sm"
            >
              1h
            </Button>
            <Button
              variant={timeframe === '6hours' ? 'default' : 'outline'}
              onClick={() => setTimeframe('6hours')}
              className="text-xs sm:text-sm"
            >
              6h
            </Button>
            <Button
              variant={timeframe === '24hours' ? 'default' : 'outline'}
              onClick={() => setTimeframe('24hours')}
              className="text-xs sm:text-sm"
            >
              24h
            </Button>
            <Button
              variant={timeframe === 'week' ? 'default' : 'outline'}
              onClick={() => setTimeframe('week')}
              className="text-xs sm:text-sm"
            >
              1w
            </Button>
            <Button
              variant={timeframe === 'month' ? 'default' : 'outline'}
              onClick={() => setTimeframe('month')}
              className="text-xs sm:text-sm"
            >
              1m
            </Button>
            <Button
              variant={timeframe === 'quarter' ? 'default' : 'outline'}
              onClick={() => setTimeframe('quarter')}
              className="text-xs sm:text-sm"
            >
              3m
            </Button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={isMobile ? 170 : 280}>
          <BarChart
            data={generateTimeframeData()}
            margin={{ left: isMobile ? 10 : 30, right: 10, bottom: 20, top: 10 }}
          >
            <XAxis dataKey="time" axisLine={true} tickLine={false}>
              <Label
                value={timeframe === '24hours' ? 'Time of Day' : 'Day of Week'}
                position="bottom"
                offset={0}
                style={{
                  textAnchor: 'middle',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 14,
                }}
              />
            </XAxis>
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => (isMobile ? '' : `${value}`)}
              width={isMobile ? 20 : 40}
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Bar dataKey="amount" radius={[7, 7, 0, 0]} fill="#0077FF" >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C6FF" />
                  <stop offset="100%" stopColor="#0072FF" />
                </linearGradient>
              </defs>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}