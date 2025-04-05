import { Card } from '@/components/ui/card';
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
      <h2 className="text-3xl font-bold tracking-tight">Account Balance</h2>
      <Card className="p-6">
        <div className="text-2xl font-bold mb-2">KES 1,234.56</div>
        <div className="text-muted-foreground">Current Balance</div>
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