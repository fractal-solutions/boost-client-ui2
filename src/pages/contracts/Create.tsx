import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText,
   Upload,  
   RefreshCw, 
   CircleDollarSign, 
   Flag, 
   Calendar as CalendarIcon, 
   User as UserIcon 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

interface IntervalConfig {
  value: number;
  unit: TimeUnit;
}

interface ContractFormData {
  amount: number;
  interval: number;
  intervalConfig: IntervalConfig;
  endDate: string;
  type: 'RECURRING_PAYMENT' | 'FIXED_PAYMENT' | 'MILESTONE_PAYMENT';
  terms: {
    paymentMethod: 'BOOST';
    penalties?: {
      lateFee?: number;
    };
  };
  participants: string[];
  metadata?: {
    title?: string;
    description?: string;
  };
}

export default function ContractsCreate() {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState<ContractFormData>({
    amount: 0,
    interval: 604800000, // 1 week in milliseconds
    intervalConfig: {
      value: 1,
      unit: 'weeks'
    },
    endDate: '',
    type: 'RECURRING_PAYMENT',
    terms: {
      paymentMethod: 'BOOST'
    },
    participants: [],
    metadata: {
      title: '',
      description: ''
    }
  });

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

  const handleCreateContract = async () => {
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
          participants: formData.participants,
          amount: formData.amount,
          interval: formData.interval,
          endDate: new Date(formData.endDate).getTime(),
          type: formData.type,
          terms: formData.terms,
          metadata: formData.metadata
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create contract');
      }

      toast.success('Contract created successfully');
      // Reset form or redirect
    } catch (error: any) {
      toast.error(error.message || 'Failed to create contract');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Create New Contract</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              {/* Contract Type Selection with Icons */}
              <div className="space-y-4">
                <Label>Contract Type</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'RECURRING_PAYMENT', label: 'Recurring', icon: RefreshCw },
                    { value: 'FIXED_PAYMENT', label: 'One-time', icon: CircleDollarSign },
                    { value: 'MILESTONE_PAYMENT', label: 'Milestone', icon: Flag }
                  ].map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant="outline"
                      className={cn(
                        "flex flex-col items-center justify-center h-24 gap-2 transition-colors",
                        formData.type === type.value && [
                          "border-primary",
                          "bg-primary/5 dark:bg-primary/10",
                          "hover:bg-primary/10 dark:hover:bg-primary/15",
                          "[&>svg]:text-primary"
                        ]
                      )}
                      onClick={() => setFormData({ ...formData, type: type.value as ContractFormData['type'] })}
                    >
                      <type.icon className={cn(
                        "h-6 w-6",
                        formData.type === type.value 
                          ? "text-primary" 
                          : "text-muted-foreground group-hover:text-primary"
                      )} />
                      <span className="text-sm">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Basic Details Section */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Contract Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter contract title"
                    value={formData.metadata?.title}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, title: e.target.value }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount (KES)</Label>
                  <div className="relative">
                    <Input 
                      id="amount" 
                      type="number"
                      placeholder="Enter amount"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value)
                      })}
                      className="pl-10"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      KES  
                    </span>
                  </div>
                </div>
              </div>

              {/* Interval Selection */}
              {formData.type === 'RECURRING_PAYMENT' && (
                <div className="space-y-4">
                  <Label>Payment Interval</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input 
                        type="number"
                        min="1"
                        placeholder="Interval"
                        value={formData.intervalConfig.value}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          const newInterval = calculateMilliseconds(value, formData.intervalConfig.unit);
                          setFormData({
                            ...formData,
                            interval: newInterval,
                            intervalConfig: {
                              ...formData.intervalConfig,
                              value
                            }
                          });
                        }}
                      />
                    </div>
                    <Select
                      value={formData.intervalConfig.unit}
                      onValueChange={(unit: TimeUnit) => {
                        const newInterval = calculateMilliseconds(formData.intervalConfig.value, unit);
                        setFormData({
                          ...formData,
                          interval: newInterval,
                          intervalConfig: {
                            ...formData.intervalConfig,
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
              )}

              {/* Timeline Section */}
              <div className="space-y-4">
                <Label>Contract Timeline</Label>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="grid flex-1">
                      <Label htmlFor="endDate" className="text-sm">End Date</Label>
                      <Input 
                        id="endDate" 
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({
                          ...formData,
                          endDate: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipient Section */}
              <div className="space-y-4">
                <Label>Recipient Details</Label>
                <div className="flex items-center gap-4">
                  <UserIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="grid flex-1">
                    <Input 
                      placeholder="Enter recipient's public key"
                      value={formData.participants[0] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        participants: [e.target.value]
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <Label htmlFor="description">Contract Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter contract details"
                  className="min-h-[100px]"
                  value={formData.metadata?.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    metadata: { ...formData.metadata, description: e.target.value }
                  })}
                />
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-primary to-primary/80"
              onClick={handleCreateContract}
            >
              Create Contract
            </Button>
          </CardContent>
        </Card>

        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['Service Agreement', 'Fixed Price Contract', 'Milestone Payment'].map((template) => (
                <Button
                  key={template}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {template}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contract Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 text-center min-h-[200px] flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Contract preview will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}