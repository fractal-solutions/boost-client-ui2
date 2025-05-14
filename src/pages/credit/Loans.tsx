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
import { BadgeCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

export default function CreditLoans() {
  const { user } = useAuth();
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
                          <span className="font-semibold">KES 50,000</span>
                        </div>
                        <Progress value={65} className="h-2" />
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BadgeCheck className="h-4 w-4 text-green-500" />
                          <span>Approved based on your credit score</span>
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
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Credit Facility</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Credit Score</span>
                          <span className="font-semibold text-green-500">725</span>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="font-medium mb-2">Available Credit</div>
                          <div className="text-2xl font-bold">KES 500,000</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Based on your business performance
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Loan Amount</Label>
                        <Input 
                          type="number" 
                          placeholder="Enter amount" 
                        />
                        <Label>Repayment Period</Label>
                        <Select>
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
                            <span className="font-medium">KES 45,000</span>
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span>Interest Rate:</span>
                            <span className="font-medium">14% p.a.</span>
                          </div>
                        </div>
                        <Button className="w-full">Apply for Loan</Button>
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