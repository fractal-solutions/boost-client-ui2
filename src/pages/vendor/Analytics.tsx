import { useState, useEffect } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export default function VendorAnalytics() {
  const [timeframe, setTimeframe] = useState<'day' | 'week'>('day');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    return { time: `${hour}:00`, amount };
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
      <Card className="pt-4 px-2 sm:pt-8 sm:-pl-8 sm:pr-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 sm:pb-8">
          <CardTitle className="text-lg font-medium pt-0 pl-4 sm:pl-16 mb-4 sm:mb-0">
            Transaction Analytics
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
        <ResponsiveContainer width="100%" height={280}>
          <BarChart 
            data={timeframe === 'day' ? hourlyData : weeklyData}
            margin={{ left: isMobile ? 10 : 30, right: 10, bottom: 20, top: 10 }}
          >
            <XAxis 
              dataKey="time" 
              axisLine={true}
              tickLine={false}
            >
              <Label
                value={timeframe === 'day' ? 'Time of Day' : 'Day of Week'}
                position="bottom"
                offset={0}
                style={{ 
                  textAnchor: 'middle',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 14
                }}
              />
            </XAxis>
            <YAxis 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => isMobile ? '' : `${value}`}
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
            <Bar 
              dataKey="amount" 
              radius={[7, 7, 0, 0]}
              fill="green"
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