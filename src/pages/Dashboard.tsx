import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpRight, QrCode, Fingerprint, Search, Plus, Minus } from 'lucide-react';

const recentTransactions = [
  {
    id: 1,
    recipient: 'John Doe',
    amount: 'KES 25,000',
    date: '2024-03-20',
    status: 'completed',
  },
  {
    id: 2,
    recipient: 'Jane Smith',
    amount: 'KES 100,000',
    date: '2024-03-19',
    status: 'pending',
  },
  {
    id: 3,
    recipient: 'Alice Johnson',
    amount: 'KES 50,000',
    date: '2024-03-18',
    status: 'completed',
  },
];

const quickContacts = [
  { id: 1, name: 'John Doe', phone: '+254 712 345 678' },
  { id: 2, name: 'Jane Smith', phone: '+254 723 456 789' },
  { id: 3, name: 'Alice Johnson', phone: '+254 734 567 890' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">KES 1,234,567</div>
            <Badge className="mt-2" variant="secondary">
              Updated just now
            </Badge>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Quick Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Command className="rounded-lg border shadow-md">
                  <CommandInput placeholder="Search recipients by name or phone..." />
                  <CommandList>
                    <CommandEmpty>No recipients found.</CommandEmpty>
                    <CommandGroup heading="Frequent Contacts">
                      {quickContacts.map((contact) => (
                        <CommandItem key={contact.id} className="flex justify-between">
                          <span>{contact.name}</span>
                          <span className="text-sm text-muted-foreground">{contact.phone}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Send Money
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan QR
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Bio Auth
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Deposit Money</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-24 text-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  M-Pesa
                </Button>
                <Button className="h-24 text-lg" variant="outline">
                  <Plus className="mr-2 h-5 w-5" />
                  Bank Transfer
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Instant deposits available via M-Pesa. Bank transfers may take 1-3 business days.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Withdraw Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-24 text-lg" variant="destructive">
                  <Minus className="mr-2 h-5 w-5" />
                  To M-Pesa
                </Button>
                <Button className="h-24 text-lg" variant="outline">
                  <Minus className="mr-2 h-5 w-5" />
                  To Bank
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                M-Pesa withdrawals are instant. Bank withdrawals processed within 24 hours.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.recipient}</TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === 'completed'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}