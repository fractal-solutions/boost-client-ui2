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

export default function VendorAnalytics() {
  const { user, token } = useAuth();
  const [timeframe, setTimeframe] = useState<'day' | 'week'>('day');
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

  const hourlyData = Array.from({ length: 24 }).map((_, hour) => {
    const hourTransactions = transactions.filter((tx) => {
      const txHour = new Date(tx.timestamp).getHours();
      const txDate = new Date(tx.timestamp).setHours(0, 0, 0, 0);
      const today = new Date().setHours(0, 0, 0, 0);
      return txHour === hour && txDate === today;
    });

    const amount = hourTransactions.reduce(
      (sum, tx) => sum + (tx.type === 'RECEIVED' ? tx.amount : 0),
      0
    );

    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      amount,
    };
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = weekDays.map((day) => {
    const dayTransactions = transactions.filter((tx) => {
      const txDate = new Date(tx.timestamp);
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      return weekDays[txDate.getDay()] === day && txDate > lastWeek;
    });

    const amount = dayTransactions.reduce(
      (sum, tx) => sum + (tx.type === 'RECEIVED' ? tx.amount : 0),
      0
    );

    return {
      time: day,
      amount,
    };
  });

  return (
    <div className="space-y-6">
      <Card className="pt-4 px-2 sm:pt-8 sm:-pl-8 sm:pr-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 sm:pb-8">
          <CardTitle className="text-lg font-medium pt-0 pl-4 sm:pl-16 mb-4 sm:mb-0">
            {isLoading ? 'Loading...' : 'Transaction Analytics'}
          </CardTitle>
          <div className="space-x-2 w-full sm:w-auto px-4 flex justify-end">
            <Button
              variant={timeframe === 'day' ? 'default' : 'outline'}
              onClick={() => setTimeframe('day')}
              className="flex-1 sm:flex-none"
            >
              Today
            </Button>
            <Button
              variant={timeframe === 'week' ? 'default' : 'outline'}
              onClick={() => setTimeframe('week')}
              className="flex-1 sm:flex-none"
            >
              This Week
            </Button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={isMobile ? 170 : 280}>
          <BarChart
            data={timeframe === 'day' ? hourlyData : weeklyData}
            margin={{ left: isMobile ? 10 : 30, right: 10, bottom: 20, top: 10 }}
          >
            <XAxis dataKey="time" axisLine={true} tickLine={false}>
              <Label
                value={timeframe === 'day' ? 'Time of Day' : 'Day of Week'}
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