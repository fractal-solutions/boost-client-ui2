import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function VendorAnalytics() {
  const [timeframe, setTimeframe] = useState<'day' | 'week'>('day');

  const hourlyData = Array.from({ length: 24 }).map((_, i) => {
    const hour = i < 10 ? `0${i}` : `${i}`;
    let amount: number;
    switch (i) {
      case 0:
      case 1:
      case 2:
      case 3:
        // between midnight and 3am, minimal activity
        amount = Math.floor(Math.random() * (10 - 5 + 1) + 5);
        break;
      case 4:
      case 5:
      case 6:
        // between 4am and 6am, some early birds
        amount = Math.floor(Math.random() * (50 - 20 + 1) + 20);
        break;
      case 7:
      case 8:
      case 9:
        // between 7am and 9am, morning rush
        amount = Math.floor(Math.random() * (200 - 100 + 1) + 100);
        break;
      case 10:
      case 11:
      case 12:
        // between 10am and 12pm, moderate activity
        amount = Math.floor(Math.random() * (150 - 80 + 1) + 80);
        break;
      case 13:
      case 14:
      case 15:
        // between 1pm and 3pm, lunch break
        amount = Math.floor(Math.random() * (100 - 50 + 1) + 50);
        break;
      case 16:
      case 17:
      case 18:
        // between 4pm and 6pm, evening rush
        amount = Math.floor(Math.random() * (250 - 150 + 1) + 150);
        break;
      case 19:
      case 20:
      case 21:
        // between 7pm and 9pm, evening activity
        amount = Math.floor(Math.random() * (180 - 100 + 1) + 100);
        break;
      case 22:
      case 23:
        // between 10pm and 11pm, winding down
        amount = Math.floor(Math.random() * (120 - 80 + 1) + 80);
        break;

      default:
        throw new Error(`Unexpected hour: ${hour}`);
    }
    return { time: `${hour}PM`, amount };
  });

  const weeklyData = [
    { time: 'Mon', amount: 1200 },
    { time: 'Tue', amount: 1400 },
    { time: 'Wed', amount: 1100 },
    { time: 'Thu', amount: 1300 },
    { time: 'Fri', amount: 1500 },
    { time: 'Sat', amount: 900 },
    { time: 'Sun', amount: 1000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Transaction Analytics</h2>
        <div className="space-x-2">
          <Button 
            variant={timeframe === 'day' ? 'default' : 'outline'}
            onClick={() => setTimeframe('day')}
          >
            Today
          </Button>
          <Button 
            variant={timeframe === 'week' ? 'default' : 'outline'}
            onClick={() => setTimeframe('week')}
          >
            This Week
          </Button>
        </div>
      </div>
      
      <Card className="p-3 -pl-8 pr-8">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={timeframe === 'day' ? hourlyData : weeklyData}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              cursor={false}
              contentStyle={{
                background: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Bar 
              dataKey="amount" 
              radius={[7, 7, 0, 0]}
              fill="aqua"
            >
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