import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
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
            <Button className="flex-1 md:flex-none">
              <Plus className="mr-2 h-4 w-4" />
              Deposit
            </Button>
            <Button variant="destructive" className="flex-1 md:flex-none">
              <Minus className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
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