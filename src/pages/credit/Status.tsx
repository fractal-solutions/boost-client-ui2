import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, BrainCircuit, LineChart, AlertTriangle, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { metadata_ip } from '@/lib/config';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreditData {
  features: {
    annualRevenue: number;
    cashReserves: number;
    creditUtilization: number;
    debtToEquity: number;
    industryRisk: number;
    latePayments: number;
    paymentHistory: number;
    yearsInBusiness: number;
  };
  predictions: {
    finalScore: string;
    interestRate: {
      baseRate: string;
      finalRate: string;
      riskMultiplier: string;
      riskFactors: string[];
    };
    ordinalClassification: {
      score: number;
      category: string;
      range: string;
    };
  };
  standardizedFICOScore: number;
  thresholdsMet: number;
  lastUpdated: string;
}

export default function CreditStatus() {
  const { user, token } = useAuth();
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (user?.publicKey) {
      const storedDataMap = localStorage.getItem('creditDataMap');
      if (storedDataMap) {
        const parsedDataMap = JSON.parse(storedDataMap);
        const userCreditData = parsedDataMap[user.publicKey];
        if (userCreditData) {
          setCreditData(userCreditData);
        } else {
          setCreditData(null);
        }
      }
    }
  }, [user?.publicKey]);

  useEffect(() => {
    const fetchBalanceAndRevenue = async () => {
      if (!user?.publicKey) return;

      try {
        // Fetch current balance
        const balanceResponse = await fetch(`${metadata_ip}/balance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: user.publicKey })
        });

        const balanceData = await balanceResponse.json();
        setCurrentBalance(balanceData.balance);

        // Fetch transaction history
        const historyResponse = await fetch(`${metadata_ip}/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            address: user.publicKey,
            limit: 100
          })
        });

        const historyData = await historyResponse.json();
        
        // Calculate total revenue from transactions
        const revenue = historyData.transactions.reduce((acc: number, tx: any) => {
          if (tx.type === 'RECEIVED' && !tx.counterparty) {
            return acc + tx.amount;
          }
          return acc;
        }, 0);

        setTotalRevenue(revenue);
      } catch (error) {
        console.error('Failed to fetch balance and revenue:', error);
      }
    };

    fetchBalanceAndRevenue();
  }, [user?.publicKey]);

  const handleRefresh = async () => {
    if (!user?.publicKey) return;

    try {
      setIsRefreshing(true);

      const boostBalance = currentBalance;
      const boostRevenue = totalRevenue;

      // Get existing features
      const currentFeatures = creditData?.features;
      if (!currentFeatures) throw new Error('No existing credit data');

      // Create updated features array
      const existingRevenue = currentFeatures.annualRevenue || 0;
      const updatedFeatures = [
        (existingRevenue + (boostRevenue/1000000)), // Add transaction volume to revenue
        currentFeatures.debtToEquity,
        currentFeatures.paymentHistory,
        (currentFeatures.cashReserves + (boostBalance/1000000)), // Add current balance to reserves
        currentFeatures.yearsInBusiness,
        currentFeatures.industryRisk,
        currentFeatures.latePayments,
        currentFeatures.creditUtilization
      ];

      console.log('Updated Features:', updatedFeatures);
      // Send request for credit recalculation
      const response = await fetch('https://n8n.fractal.co.ke/webhook/95aa2d14-6aa7-44f8-9704-1e74fba96dda', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          features: updatedFeatures
        })
      });

      const responseData = await response.json();

      if (responseData.success && user?.publicKey) {
        // Update localStorage with new credit data
        const existingData = localStorage.getItem('creditDataMap');
        const creditDataMap = existingData ? JSON.parse(existingData) : {};
        
        // Create updated credit data while preserving revenue and reserves
        const updatedCreditData = {
          ...responseData.prediction,
          features: {
            ...responseData.prediction.features,
            annualRevenue: currentFeatures.annualRevenue, // Keep original revenue
            cashReserves: currentFeatures.cashReserves, // Keep original reserves
          },
          lastUpdated: new Date().toISOString()
        };

        creditDataMap[user.publicKey] = updatedCreditData;
        localStorage.setItem('creditDataMap', JSON.stringify(creditDataMap));
        setCreditData(updatedCreditData);
        toast.success('Credit score recalculated successfully');
      }

    } catch (error) {
      console.error('Failed to refresh credit score:', error);
      toast.error('Failed to refresh credit score');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user?.publicKey) {
    return (
      <div className="container mx-auto max-w-7xl">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="space-y-4">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Login Required</h3>
              <p className="text-muted-foreground">
                Please login to view Credit Status
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>Credit Score</div>
                <Badge variant="outline" className="flex gap-1">
                  <BrainCircuit className="h-3 w-3" />
                  AI Powered
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || !creditData}
                className="h-8 w-8 p-0"
              >
                <RefreshCcw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-5xl font-bold">
                    {creditData?.predictions.finalScore || '---'}
                  </div>
                  <div className="flex items-center gap-1 text-green-500">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>{creditData?.predictions.ordinalClassification.category || 'PENDING'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Interest Rate</div>
                  <div className="font-bold">{creditData?.predictions.interestRate.finalRate || '---'}</div>
                  <div className="text-xs text-muted-foreground">
                    Base: {creditData?.predictions.interestRate.baseRate || '---'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Score Range</span>
                  <span>{creditData?.predictions.ordinalClassification.range || '300-850'}</span>
                </div>
                <Progress 
                  value={creditData ? 
                    ((Number(creditData.predictions.finalScore) - 300) / (850 - 300)) * 100 
                    : 0
                  } 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Annual Revenue</div>
                  <div className="text-lg font-semibold">
                    KES {((creditData?.features.annualRevenue || 0) + (totalRevenue/1000000)).toLocaleString()}M
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Cash Reserves</div>
                  <div className="text-lg font-semibold">
                    KES {((creditData?.features.cashReserves || 0) + (currentBalance/1000000)).toLocaleString()}M
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>Payment History</div>
                  <div className="flex items-center gap-2">
                    <span className={creditData?.features.paymentHistory === 0 ? 'text-green-500' : 'text-yellow-500'}>
                      {creditData ? (100 - (creditData.features.paymentHistory * 100)).toFixed(0) : '0'}%
                    </span>
                    <Progress value={creditData ? 100 - (creditData.features.paymentHistory * 100) : 0} className="w-20" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>Credit Utilization</div>
                  <div className="flex items-center gap-2">
                    <span className={creditData?.features.creditUtilization < 0.7 ? 'text-green-500' : 'text-yellow-500'}>
                      {creditData ? (creditData.features.creditUtilization * 100).toFixed(0) : '0'}%
                    </span>
                    <Progress value={creditData ? creditData.features.creditUtilization * 100 : 0} className="w-20" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="text-muted-foreground">Years in Business</div>
                  <div>{creditData?.features.yearsInBusiness || 0} years</div>
                </div>
                <div className="space-y-2">
                  <div className="text-muted-foreground">Late Payments</div>
                  <div>{creditData?.features.latePayments || 0} incidents</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}