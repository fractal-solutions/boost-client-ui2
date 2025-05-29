import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, BrainCircuit, LineChart, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

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
  const { user } = useAuth();
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  

  // useEffect(() => {
  //   const storedData = localStorage.getItem('creditData');
  //   if (storedData) {
  //     setCreditData(JSON.parse(storedData));
  //   }
  // }, []);

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
              <div>Credit Score</div>
              <Badge variant="outline" className="flex gap-1">
                <BrainCircuit className="h-3 w-3" />
                AI Powered
              </Badge>
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
                    KES {(creditData?.features.annualRevenue || 0).toLocaleString()}M
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Cash Reserves</div>
                  <div className="text-lg font-semibold">
                    KES {(creditData?.features.cashReserves || 0).toLocaleString()}M
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