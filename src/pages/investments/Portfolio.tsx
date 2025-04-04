import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, PieChart, TrendingUp } from 'lucide-react';

const portfolioData = [
  {
    name: 'Jan',
    value: 150000,
  },
  {
    name: 'Feb',
    value: 180000,
  },
  {
    name: 'Mar',
    value: 210000,
  },
  {
    name: 'Apr',
    value: 240000,
  },
];

const investments = [
  {
    id: 1,
    name: 'Tech Growth Fund',
    invested: 'KES 100,000',
    currentValue: 'KES 112,500',
    return: '+12.5%',
    trend: 'up',
  },
  {
    id: 2,
    name: 'Real Estate Trust',
    invested: 'KES 200,000',
    currentValue: 'KES 216,400',
    return: '+8.2%',
    trend: 'up',
  },
  {
    id: 3,
    name: 'Green Energy Portfolio',
    invested: 'KES 50,000',
    currentValue: 'KES 47,450',
    return: '-5.1%',
    trend: 'down',
  },
];

export default function InvestmentsPortfolio() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Total Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KES 376,350</div>
            <Badge className="mt-2 bg-green-500/10 text-green-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +8.2% (30d)
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KES 350,000</div>
            <Badge variant="secondary" className="mt-2">
              3 Active Investments
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Total Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KES 26,350</div>
            <Badge className="mt-2 bg-green-500/10 text-green-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +7.5% Overall
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-1))] mr-2" />
                  <span className="text-sm">Tech Growth</span>
                </div>
                <span className="text-sm font-medium">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))] mr-2" />
                  <span className="text-sm">Real Estate</span>
                </div>
                <span className="text-sm font-medium">55%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))] mr-2" />
                  <span className="text-sm">Green Energy</span>
                </div>
                <span className="text-sm font-medium">15%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investment</TableHead>
                  <TableHead>Invested Amount</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Return</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((investment) => (
                  <TableRow key={investment.id}>
                    <TableCell className="font-medium">{investment.name}</TableCell>
                    <TableCell>{investment.invested}</TableCell>
                    <TableCell>{investment.currentValue}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          investment.trend === 'up'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-destructive/10 text-destructive'
                        }
                      >
                        {investment.trend === 'up' ? (
                          <ArrowUpRight className="mr-1 h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-4 w-4" />
                        )}
                        {investment.return}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}