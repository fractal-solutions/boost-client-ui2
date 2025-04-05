import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { AlertCircle, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [selectedPayment, setSelectedPayment] = useState(null);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Payment Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" className="rounded-md border" />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule New Payment
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">New Scheduled Payment</h4>
                    <p className="text-sm text-muted-foreground">
                      Set up a recurring payment
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="recipient">Recipient</Label>
                      <Input
                        id="recipient"
                        placeholder="Name or phone"
                        className="col-span-2"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        placeholder="Enter amount"
                        type="number"
                        className="col-span-2"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select>
                        <SelectTrigger className="col-span-2">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full">Create Schedule</Button>
                </div>
              </PopoverContent>
            </Popover>
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">Edit Schedule</h4>
                              <p className="text-sm text-muted-foreground">
                                Modify payment schedule details
                              </p>
                            </div>
                            <div className="grid gap-2">
                              <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="edit-recipient">Recipient</Label>
                                <Input
                                  id="edit-recipient"
                                  defaultValue={payment.recipient}
                                  className="col-span-2"
                                />
                              </div>
                              <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="edit-amount">Amount</Label>
                                <Input
                                  id="edit-amount"
                                  defaultValue={payment.amount}
                                  type="number"
                                  className="col-span-2"
                                />
                              </div>
                              <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select defaultValue={payment.status}>
                                  <SelectTrigger className="col-span-2">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="paused">Paused</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button className="flex-1">Save Changes</Button>
                              <Button 
                                variant="destructive"
                                className="flex-1"
                              >
                                Delete Schedule
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
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