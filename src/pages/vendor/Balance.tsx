import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function VendorBalance() {
  const transactions = [
    { id: 1, date: '2025-04-05 14:30', amount: 25.99, type: 'Payment received' },
    { id: 2, date: '2025-04-05 13:15', amount: 42.50, type: 'Payment received' },
    // Add more mock transactions
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <CardTitle className="text-lg font-medium pb-4">Account Balance</CardTitle>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-2xl font-bold mb-2">KES 1,234.56</div>
            <div className="text-muted-foreground">Current Balance</div>
          </div>
          <div className="flex gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button className="flex-1 md:flex-none">
                  <Plus className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Deposit to Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose deposit method and amount
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="deposit-method">Method</Label>
                      <Input
                        id="deposit-method"
                        defaultValue="M-Pesa"
                        className="col-span-2"
                        disabled
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        placeholder="Enter amount"
                        className="col-span-2"
                        type="number"
                      />
                    </div>
                  </div>
                  <Button className="w-full">Proceed to Deposit</Button>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="destructive" className="flex-1 md:flex-none">
                  <Minus className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Withdraw Funds</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter withdrawal details
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="withdraw-to">Withdraw to</Label>
                      <Input
                        id="withdraw-to"
                        defaultValue="M-Pesa"
                        className="col-span-2"
                        disabled
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="+254 7XX XXX XXX"
                        className="col-span-2"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        placeholder="Enter amount"
                        className="col-span-2"
                        type="number"
                      />
                    </div>
                  </div>
                  <Button variant="destructive" className="w-full">
                    Withdraw Now
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Card>
      
      <h3 className="text-xl font-semibold mt-8">Recent Transactions</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{tx.date}</TableCell>
              <TableCell>{tx.type}</TableCell>
              <TableCell className="text-right">KES {tx.amount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}