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
import { Search, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const investments = [
  {
    id: 1,
    name: 'Tech Growth Fund',
    type: 'Mutual Fund',
    risk: 'Moderate',
    return: '+12.5%',
    trend: 'up',
    minAmount: 'KES 50,000',
  },
  {
    id: 2,
    name: 'Real Estate Trust',
    type: 'REIT',
    risk: 'Low',
    return: '+8.2%',
    trend: 'up',
    minAmount: 'KES 100,000',
  },
  {
    id: 3,
    name: 'Green Energy Portfolio',
    type: 'ETF',
    risk: 'High',
    return: '-5.1%',
    trend: 'down',
    minAmount: 'KES 25,000',
  },
];

export default function InvestmentsMarket() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search investments..."
            className="pl-10"
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="mutual">Mutual Funds</SelectItem>
            <SelectItem value="reit">REITs</SelectItem>
            <SelectItem value="etf">ETFs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.map((investment) => (
          <Card key={investment.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-medium">
                    {investment.name}
                  </CardTitle>
                  <Badge variant="secondary">{investment.type}</Badge>
                </div>
                {investment.trend === 'up' ? (
                  <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    {investment.return}
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <ArrowDownRight className="mr-1 h-4 w-4" />
                    {investment.return}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Risk Level</span>
                  <span>{investment.risk}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minimum Investment</span>
                  <span>{investment.minAmount}</span>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
                <TrendingUp className="mr-2 h-4 w-4" />
                Invest Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

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