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
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Label } from '@/components/ui/label';

const investments = [
  {
    id: 1,
    name: 'Tech Growth Fund',
    type: 'Mutual Fund',
    risk: 'Moderate',
    return: '+12.5%',
    trend: 'up',
    minAmount: 'KES 50,000',
    demand: 75,
    supply: 60,
    demandThreshold: 'KES 2,000,000',
    supplyThreshold: 'KES 1,500,000',
    currentSupply: 'KES 900,000'
  },
  {
    id: 2,
    name: 'Real Estate Trust',
    type: 'REIT',
    risk: 'Low',
    return: '+8.2%',
    trend: 'up',
    minAmount: 'KES 100,000',
    demand: 90,
    supply: 45,
    demandThreshold: 'KES 3,500,000',
    supplyThreshold: 'KES 2,800,000',
    currentSupply: 'KES 1,260,000'
  },
  {
    id: 3,
    name: 'Green Energy Portfolio',
    type: 'ETF',
    risk: 'High',
    return: '-5.1%',
    trend: 'down',
    minAmount: 'KES 25,000',
    demand: 30,
    supply: 80,
    demandThreshold: 'KES 1,200,000',
    supplyThreshold: 'KES 1,000,000',
    currentSupply: 'KES 800,000'
  },
];

const quickInvestAmounts = [
  { value: "50000", label: "KES 50,000" },
  { value: "100000", label: "KES 100,000" },
  { value: "250000", label: "KES 250,000" },
  { value: "500000", label: "KES 500,000" },
];

export default function InvestmentsMarket() {
  const [showInvestForm, setShowInvestForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<typeof investments[0] | null>(null);
  const [amount, setAmount] = useState('');

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
          <Card key={investment.id} className="flex flex-col h-fit">
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
            <CardContent className="flex-1">
              <div className="flex gap-6">
                <div className="flex items-end gap-2">
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-muted-foreground mb-1">Demand</div>
                    <div className="w-4 h-20 bg-gray-200 rounded-full overflow-hidden rotate-180">
                      <div
                        className="w-full bg-blue-500 rounded-full"
                        style={{ height: `${investment.demand}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-muted-foreground mb-1">Supply</div>
                    <div className="w-4 h-20 bg-gray-200 rounded-full overflow-hidden rotate-180">
                      <div
                        className="w-full bg-green-500 rounded-full"
                        style={{ height: `${investment.supply}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
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
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-primary/80"
                    onClick={() => {
                      setSelectedInvestment(investment);
                      setShowInvestForm(!showInvestForm);
                    }}
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Invest Now
                  </Button>
                </div>
              </div>

              {showInvestForm && selectedInvestment?.id === investment.id && (
                <AnimatePresence>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0, width:0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden w-full"
                  >
                    <Card className="mt-4 w-full">
                      <CardHeader>
                        <CardTitle className="text-lg font-medium">
                          Invest in {investment.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-6">
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
                          <Button className="w-full">
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