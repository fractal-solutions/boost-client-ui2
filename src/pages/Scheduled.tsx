import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Calendar } from '@/components/ui/calendar';
import { Plus, AlertCircle } from 'lucide-react';

const scheduledPayments = [
  {
    id: 1,
    recipient: 'John Doe',
    amount: 'KES 25,000',
    nextDate: '2024-04-01',
    frequency: 'Monthly',
    status: 'active',
  },
  {
    id: 2,
    recipient: 'Jane Smith',
    amount: 'KES 50,000',
    nextDate: '2024-04-15',
    frequency: 'Bi-weekly',
    status: 'paused',
  },
  {
    id: 3,
    recipient: 'Alice Johnson',
    amount: 'KES 100,000',
    nextDate: '2024-05-01',
    frequency: 'Monthly',
    status: 'active',
  },
];

export default function Scheduled() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Payment Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
              <Plus className="mr-2 h-4 w-4" />
              Schedule New Payment
            </Button>
            <div className="bg-muted/50 rounded-lg p-4 flex items-start space-x-4">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Upcoming Payments</p>
                <p className="text-sm text-muted-foreground">
                  You have 3 payments scheduled for next week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Next Date</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.recipient}</TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>{payment.nextDate}</TableCell>
                    <TableCell>{payment.frequency}</TableCell>
                    <TableCell>
                      <Badge
                        variant={payment.status === 'active' ? 'default' : 'secondary'}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
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