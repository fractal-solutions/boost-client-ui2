import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { AlertCircle, Plus, X, ChevronDown, CalendarCheck } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from "framer-motion";

type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

interface ScheduleFormData {
  amount: number;
  interval: number;
  intervalConfig: {
    value: number;
    unit: TimeUnit;
  };
  endDate: string;
  recipient: string;
  title: string;
  description: string;
}

const calculateMilliseconds = (value: number, unit: TimeUnit): number => {
  const milliseconds = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
    months: 30 * 24 * 60 * 60 * 1000
  };
  return value * milliseconds[unit];
};

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
  const { user, token } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
    amount: 0,
    interval: 604800000,
    intervalConfig: {
      value: 1,
      unit: 'weeks'
    },
    endDate: '',
    recipient: '',
    title: '',
    description: ''
  });
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleCreateSchedule = async () => {
    try {
      if (!user?.publicKey || !token) {
        throw new Error('Please login first');
      }

      const response = await fetch('http://localhost:2223/contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          creator: user.publicKey,
          participants: [scheduleForm.recipient],
          amount: scheduleForm.amount,
          interval: scheduleForm.interval,
          endDate: new Date(scheduleForm.endDate).getTime(),
          type: 'RECURRING_PAYMENT',
          terms: {
            paymentMethod: 'BOOST'
          },
          metadata: {
            title: scheduleForm.title,
            description: scheduleForm.description
          }
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create schedule');
      }

      toast.success('Payment schedule created successfully');
      // Reset form or close popover
    } catch (error: any) {
      toast.error(error.message || 'Failed to create schedule');
    }
  };

  if (!user?.publicKey) {
    return (
      <div className="container mx-auto max-w-7xl">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="space-y-4">
              <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Login Required</h3>
              <p className="text-muted-foreground">
                Please login to Schedule Payments
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        <Card 
          className="flex-1 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              Payment Calendar
              {showCalendar ? (
                <X className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <CardContent>
                  <Calendar 
                    mode="single" 
                    className="rounded-md border" 
                  />
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full bg-gradient-to-r from-primary to-primary/80"
              onClick={() => setShowScheduleForm(!showScheduleForm)}
            >
              {showScheduleForm ? (
                <X className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {showScheduleForm ? 'Cancel' : 'Schedule New Payment'}
            </Button>

            <AnimatePresence>
              {showScheduleForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-medium">New Scheduled Payment</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Set up automatic recurring payments
                      </p>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="title">Payment Title</Label>
                          <Input
                            id="title"
                            placeholder="e.g. Monthly Rent"
                            value={scheduleForm.title}
                            onChange={(e) => setScheduleForm({
                              ...scheduleForm,
                              title: e.target.value
                            })}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="amount">Amount (KES)</Label>
                          <div className="relative">
                            <Input
                              id="amount"
                              type="number"
                              placeholder="Enter amount"
                              className="pl-12"
                              value={scheduleForm.amount || ''}
                              onChange={(e) => setScheduleForm({
                                ...scheduleForm,
                                amount: parseFloat(e.target.value)
                              })}
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                              KES
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Payment Frequency</Label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                min="1"
                                placeholder="Interval"
                                value={scheduleForm.intervalConfig.value}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  setScheduleForm({
                                    ...scheduleForm,
                                    interval: calculateMilliseconds(value, scheduleForm.intervalConfig.unit),
                                    intervalConfig: {
                                      ...scheduleForm.intervalConfig,
                                      value
                                    }
                                  });
                                }}
                              />
                              <Select
                                value={scheduleForm.intervalConfig.unit}
                                onValueChange={(unit: TimeUnit) => {
                                  const newInterval = calculateMilliseconds(
                                    scheduleForm.intervalConfig.value,
                                    unit
                                  );
                                  setScheduleForm({
                                    ...scheduleForm,
                                    interval: newInterval,
                                    intervalConfig: {
                                      ...scheduleForm.intervalConfig,
                                      unit
                                    }
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="minutes">Minutes</SelectItem>
                                  <SelectItem value="hours">Hours</SelectItem>
                                  <SelectItem value="days">Days</SelectItem>
                                  <SelectItem value="weeks">Weeks</SelectItem>
                                  <SelectItem value="months">Months</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={scheduleForm.endDate}
                              onChange={(e) => setScheduleForm({
                                ...scheduleForm,
                                endDate: e.target.value
                              })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="recipient">Recipient</Label>
                          <Input
                            id="recipient"
                            placeholder="Enter recipient's public key"
                            value={scheduleForm.recipient}
                            onChange={(e) => setScheduleForm({
                              ...scheduleForm,
                              recipient: e.target.value
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Textarea
                            id="description"
                            placeholder="Add any notes or details"
                            value={scheduleForm.description}
                            onChange={(e) => setScheduleForm({
                              ...scheduleForm,
                              description: e.target.value
                            })}
                          />
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="space-y-3">
                            {scheduleForm.amount > 0 && (
                            <div className="space-y-2 text-sm">
                              <h5 className="font-medium">{scheduleForm.title}</h5>
                              <div className="flex justify-between">
                              <span className="text-muted-foreground">Payment Amount:</span>
                              <span className="font-medium">KES {scheduleForm.amount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                              <span className="text-muted-foreground">Frequency:</span>
                              <span className="font-medium">
                                Every {scheduleForm.intervalConfig.value} {scheduleForm.intervalConfig.unit}
                              </span>
                              </div>
                              {scheduleForm.endDate && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Until:</span>
                                <span className="font-medium">{new Date(scheduleForm.endDate).toLocaleDateString()}</span>
                              </div>
                              )}
                              {scheduleForm.recipient && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Recipient:</span>
                                <span className="font-medium">{scheduleForm.recipient}</span>
                              </div>
                              )}
                              {scheduleForm.description && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Description:</span>
                                <span className="font-medium">{scheduleForm.description}</span>
                              </div>
                              )}
                            </div>
                            )}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button 
                          className="flex-1"
                          variant="outline"
                          onClick={() => setShowScheduleForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={handleCreateSchedule}
                          disabled={!scheduleForm.amount || !scheduleForm.recipient}
                        >
                          Create Schedule
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

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