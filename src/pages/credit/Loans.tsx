import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BadgeCheck, Link } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { RefreshCcw, Upload } from "lucide-react";
import { toast } from "sonner";

interface CreditData {
  features: {
    annualRevenue: number;
    cashReserves: number;
  };
  predictions: {
    finalScore: string;
    interestRate: {
      baseRate: string;
      finalRate: string;
    };
    ordinalClassification: {
      category: string;
      range: string;
    };
  };
}

export default function CreditLoans() {
  const { user } = useAuth();
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [overdraftLimit, setOverdraftLimit] = useState(0);
  const [creditLimit, setCreditLimit] = useState(0);
  const [isEligible, setIsEligible] = useState(false);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [repaymentPeriod, setRepaymentPeriod] = useState<number>(3);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [privateKey, setPrivateKey] = useState('');
  const [isProcessingLoan, setIsProcessingLoan] = useState(false);

  useEffect(() => {
    if (user?.publicKey) {
      const storedDataMap = localStorage.getItem('creditDataMap');
      if (storedDataMap) {
        const parsedDataMap = JSON.parse(storedDataMap);
        const userCreditData = parsedDataMap[user.publicKey];
        if (userCreditData) {
          setCreditData(userCreditData);
          
          // Check credit score eligibility (above 680)
          const creditScore = Number(userCreditData.predictions.finalScore);
          setIsEligible(creditScore >= 680);

          // Calculate overdraft limit (1% of annual revenue)
          const annualRevenue = userCreditData.features.annualRevenue;
          setOverdraftLimit(annualRevenue * 0.01 * 1000000);

          // Calculate credit facility limit based on credit score and revenue
          // Standard calculation: (Credit Score / 850) * Annual Revenue * Risk Multiplier
          const riskMultiplier = creditScore >= 750 ? 0.5 : 
                               creditScore >= 700 ? 0.4 : 
                               creditScore >= 680 ? 0.3 : 0.2;
          const calculatedLimit = (creditScore / 850) * annualRevenue * riskMultiplier;
          setCreditLimit(calculatedLimit * 1000000); 
        }
      }
    }
  }, [user?.publicKey]);

  const handleLoanApplication = async () => {
    if (!privateKey) {
      toast.error('Please provide your private key');
      return;
    }

    try {
      setIsProcessingLoan(true);
      const response = await fetch('https://n8n.fractal.co.ke/webhook/80cc7abc-19ee-468e-946f-ce4b05a2f7f2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          publicKey: user?.publicKey,
          privateKey: privateKey,
          loanAmount: loanAmount,
          repaymentPeriod: repaymentPeriod,
          monthlyPayment: monthlyPayment,
          interestRate: parseFloat(creditData?.predictions.interestRate.finalRate.replace('%', ''))
        })
      });

      if (!response.ok) throw new Error('Failed to submit loan application');
      const data = await response.json();

      toast.success('Loan application submitted successfully');
      setPrivateKey('');
      setLoanAmount(0);
      setMonthlyPayment(0);
    } catch (error) {
      console.error('Loan application error:', error);
      toast.error('Failed to submit loan application');
    } finally {
      setIsProcessingLoan(false);
    }
  };

  const calculateMonthlyPayment = (amount: number, months: number, interestRate: string) => {
    // Convert interest rate from string (e.g. "22.39%") to decimal
    const rate = parseFloat(interestRate.replace('%', '')) / 100 / 12; // monthly rate
    
    // PMT formula: rate * principal / (1 - (1 + rate)^-months)
    const payment = (rate * amount) / (1 - Math.pow(1 + rate, -months));
    
    return Math.round(payment); // Round to nearest shilling
  };

  if (!user?.publicKey) {
    return (
      <div className="container mx-auto max-w-7xl">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="space-y-4">
              <BadgeCheck className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Login Required</h3>
              <p className="text-muted-foreground">
                Please login to view your Loans Panel
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!creditData) {
    return (
      <div className="container mx-auto max-w-7xl">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="space-y-4">
              <BadgeCheck className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Credit Assessment Required</h3>
              <p className="text-muted-foreground">
                Please complete your credit assessment to access loan facilities
              </p>
              <Link href="/credit/underwriting">
                <a className="mt-4 align-middle">
                  <Button>
                    Complete Credit Assessment
                  </Button>
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isEligible) {
    return (
      <div className="container mx-auto max-w-7xl">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="space-y-4">
              <BadgeCheck className="h-12 w-12 mx-auto text-yellow-500" />
              <h3 className="text-lg font-medium">Credit Score Too Low</h3>
              <p className="text-muted-foreground">
                A minimum credit score of 680 is required to access loan facilities.
                Your current score: {creditData.predictions.finalScore}
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
            <CardTitle>Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="text-2xl font-bold">KES 250,000</div>
                <div className="text-sm text-muted-foreground">Total Outstanding</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Repayment Progress</span>
                  <span>65% Complete</span>
                </div>
                <Progress value={65} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Next Payment</div>
                  <div className="text-muted-foreground">Apr 15, 2025</div>
                </div>
                <div>
                  <div className="font-medium">Amount Due</div>
                  <div className="text-muted-foreground">KES 25,000</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="secondary">
                      Overdraft
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Overdraft Facility</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Available Overdraft</span>
                          <span className="font-semibold">
                            KES {overdraftLimit.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={65} className="h-2" />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BadgeCheck className="h-4 w-4 text-green-500" />
                          <span>Credit Score: {creditData.predictions.finalScore}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Transfer Amount</Label>
                        <Input 
                          type="number" 
                          placeholder="Enter amount" 
                          className="col-span-3" 
                        />
                        <Label>Transfer to</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="payments">Payments Account</SelectItem>
                            <SelectItem value="vendor">Vendor Account</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button className="w-full">Transfer Funds</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Credit Facility</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] h-[90vh] flex flex-col">
                    <DialogHeader className="flex-none">
                      <DialogTitle>Credit Facility</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
                    <div className="grid gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Credit Score</span>
                          <span className="font-semibold text-green-500">
                            {creditData.predictions.finalScore}
                          </span>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="font-medium mb-2">Available Credit</div>
                          <div className="text-2xl font-bold">
                            KES {creditLimit.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Interest Rate: {creditData.predictions.interestRate.finalRate}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Loan Amount</Label>
                        <Input 
                          type="number" 
                          placeholder="Enter amount" 
                          value={loanAmount || ''}
                          onChange={(e) => {
                            const amount = Number(e.target.value);
                            setLoanAmount(amount);
                            if (amount && repaymentPeriod) {
                              setMonthlyPayment(
                                calculateMonthlyPayment(
                                  amount, 
                                  repaymentPeriod, 
                                  creditData.predictions.interestRate.finalRate
                                )
                              );
                            }
                          }}
                          max={creditLimit}
                        />
                        <Label>Repayment Period</Label>
                        <Select 
                          value={repaymentPeriod.toString()}
                          onValueChange={(value) => {
                            const months = parseInt(value);
                            setRepaymentPeriod(months);
                            if (loanAmount && months) {
                              setMonthlyPayment(
                                calculateMonthlyPayment(
                                  loanAmount, 
                                  months, 
                                  creditData.predictions.interestRate.finalRate
                                )
                              );
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 Months</SelectItem>
                            <SelectItem value="6">6 Months</SelectItem>
                            <SelectItem value="12">12 Months</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span>Monthly Payment:</span>
                            <span className="font-medium">
                              KES {monthlyPayment.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span>Interest Rate:</span>
                            <span className="font-medium">
                              {creditData.predictions.interestRate.finalRate}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span>Total Repayment:</span>
                            <span className="font-medium">
                              KES {(monthlyPayment * repaymentPeriod).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium mb-2">Private Key</h4>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Enter your private key"
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                                className="font-mono text-xs min-h-[100px]"
                              />
                              <div className="relative">
                                <Input
                                  type="file"
                                  accept=".txt"
                                  className="hidden"
                                  id="key-file"
                                  onChange={async (e) => {
                                    try {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      
                                      const text = await file.text();
                                      setPrivateKey(text.trim());
                                      toast.success('Private key loaded successfully');
                                    } catch (error: any) {
                                      toast.error('Failed to load private key file');
                                    }
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => document.getElementById('key-file')?.click()}
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Key File
                                </Button>
                              </div>
                            </div>
                          </div>

                          <Button 
                            className="w-full"
                            disabled={!loanAmount || loanAmount > creditLimit || !monthlyPayment || !privateKey || isProcessingLoan}
                            onClick={handleLoanApplication}
                          >
                            {isProcessingLoan ? (
                              <>
                                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Apply for Loan'
                            )}
                          </Button>
                        </div>
                      </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Apr 15, 2025</TableCell>
                  <TableCell>KES 25,000</TableCell>
                  <TableCell className="text-yellow-500">Pending</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mar 15, 2025</TableCell>
                  <TableCell>KES 25,000</TableCell>
                  <TableCell className="text-green-500">Paid</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Feb 15, 2025</TableCell>
                  <TableCell>KES 25,000</TableCell>
                  <TableCell className="text-green-500">Paid</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}