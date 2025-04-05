import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calculator, TrendingUp } from 'lucide-react';

interface CalculatorState {
  initialInvestment: number;
  monthlyContribution: number;
  years: number;
  expectedReturn: number;
  riskLevel: string;
}

export default function InvestmentsCalculator() {
  const [state, setState] = useState<CalculatorState>({
    initialInvestment: 100000,
    monthlyContribution: 10000,
    years: 5,
    expectedReturn: 8,
    riskLevel: 'moderate',
  });

  const [results, setResults] = useState({
    totalInvestment: 0,
    expectedValue: 0,
    totalReturns: 0,
    returnRate: 0,
    yearlyData: [] as Array<{
      year: number;
      investment: number;
      returns: number;
      balance: number;
    }>,
  });

  useEffect(() => {
    calculateReturns();
  }, [state]);

  const calculateReturns = () => {
    const yearlyData = [];
    let totalInvestment = state.initialInvestment;
    let currentBalance = state.initialInvestment;
    const monthlyRate = state.expectedReturn / 100 / 12;
    const currentYear = new Date().getFullYear();

    for (let year = 1; year <= state.years; year++) {
      let yearlyReturns = 0;

      // Calculate monthly compounding
      for (let month = 1; month <= 12; month++) {
        currentBalance += state.monthlyContribution;
        const monthlyReturn = currentBalance * monthlyRate;
        currentBalance += monthlyReturn;
        yearlyReturns += monthlyReturn;
      }

      totalInvestment += state.monthlyContribution * 12;

      yearlyData.push({
        year: currentYear + year - 1,
        investment: totalInvestment,
        returns: yearlyReturns,
        balance: currentBalance,
      });
    }

    const totalReturns = currentBalance - totalInvestment;
    const returnRate = (totalReturns / totalInvestment) * 100;

    setResults({
      totalInvestment,
      expectedValue: currentBalance,
      totalReturns,
      returnRate,
      yearlyData,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Investment Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Initial Investment (KES)</Label>
                <Input
                  type="number"
                  value={state.initialInvestment}
                  onChange={(e) =>
                    setState({ ...state, initialInvestment: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Monthly Contribution (KES)</Label>
                <Input
                  type="number"
                  value={state.monthlyContribution}
                  onChange={(e) =>
                    setState({ ...state, monthlyContribution: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Investment Period (Years): {state.years} years</Label>
                <div className="pt-2">
                  <Slider
                    value={[state.years]}
                    onValueChange={(value) => setState({ ...state, years: value[0] })}
                    max={30}
                    min={1}
                    step={1}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-muted-foreground">1 year</span>
                    <span className="text-sm text-muted-foreground">30 years</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Expected Annual Return: {state.expectedReturn}%</Label>
                <div className="pt-2">
                  <Slider
                    value={[state.expectedReturn]}
                    onValueChange={(value) =>
                      setState({ ...state, expectedReturn: value[0] })
                    }
                    max={20}
                    min={1}
                    step={0.5}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-muted-foreground">1%</span>
                    <span className="text-sm text-muted-foreground">20%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Risk Level</Label>
                <Select
                  value={state.riskLevel}
                  onValueChange={(value) => setState({ ...state, riskLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative (4-6%)</SelectItem>
                    <SelectItem value="moderate">Moderate (6-8%)</SelectItem>
                    <SelectItem value="aggressive">Aggressive (8-12%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-primary to-primary/80"
                onClick={calculateReturns}
              >
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Returns
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projected Returns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold">
                  KES {results.totalInvestment.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Expected Value</p>
                <p className="text-2xl font-bold text-green-500">
                  KES {results.expectedValue.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold text-green-500">
                  KES {results.totalReturns.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Return Rate</p>
                <p className="text-2xl font-bold">{results.returnRate.toFixed(1)}%</p>
              </div>
            </div>

            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Investment</TableHead>
                    <TableHead>Returns</TableHead>
                    <TableHead>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.yearlyData.map((year, i) => (
                    <TableRow key={i}>
                      <TableCell>{year.year}</TableCell>
                      <TableCell>KES {year.investment.toLocaleString()}</TableCell>
                      <TableCell className="text-green-500">
                        +KES {year.returns.toLocaleString()}
                      </TableCell>
                      <TableCell>KES {year.balance.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Conservative Portfolio',
                description: 'Low-risk investment mix suitable for stable returns',
                return: '4-6%',
              },
              {
                title: 'Balanced Growth',
                description: 'Moderate-risk portfolio with balanced returns',
                return: '6-8%',
              },
              {
                title: 'High Growth',
                description: 'High-risk portfolio for maximum potential returns',
                return: '8-12%',
              },
            ].map((recommendation, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">{recommendation.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.description}
                    </p>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                      Expected Return: {recommendation.return}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}