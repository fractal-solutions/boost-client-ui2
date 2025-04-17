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

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

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
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              Create New Contract
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8">
              {/* Contract Type Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <Label className="text-lg">Choose Contract Type</Label>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'RECURRING_PAYMENT', label: 'Recurring', icon: RefreshCw, description: 'Regular scheduled payments' },
                    { value: 'FIXED_PAYMENT', label: 'One-time', icon: CircleDollarSign, description: 'Single payment contract' },
                    { value: 'MILESTONE_PAYMENT', label: 'Milestone', icon: Flag, description: 'Payment based on goals' }
                  ].map((type) => (
                    <Button
                      key={type.value}
                      type="button"
                      variant="outline"
                      className={cn(
                        "relative flex flex-col items-center justify-center h-32 gap-2 transition-all hover:scale-[1.02]",
                        "group hover:border-primary/50",
                        formData.type === type.value && [
                          "border-primary/50 shadow-lg",
                          "bg-primary/5 dark:bg-primary/10",
                          "[&>svg]:text-primary"
                        ]
                      )}
                      onClick={() => setFormData({ ...formData, type: type.value as ContractFormData['type'] })}
                    >
                      <type.icon className={cn(
                        "h-8 w-8 transition-all group-hover:scale-110",
                        formData.type === type.value 
                          ? "text-primary" 
                          : "text-muted-foreground"
                      )} />
                      <div className="space-y-1 text-center">
                        <span className="text-sm font-medium">{type.label}</span>
                        <p className="text-xs text-muted-foreground hidden md:block">
                          {type.description}
                        </p>
                      </div>
                      {formData.type === type.value && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Contract Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <Label className="text-lg">Contract Details</Label>
                </div>

                {/* Basic Details Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Contract Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter contract title"
                      className="transition-all hover:border-primary/50"
                      value={formData.metadata?.title}
                      onChange={(e) => setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, title: e.target.value }
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium">Payment Amount</Label>
                    <div className="relative">
                      <Input 
                        id="amount" 
                        type="number"
                        placeholder="Enter amount"
                        className="pl-12 transition-all hover:border-primary/50"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          amount: parseFloat(e.target.value)
                        })}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                        KES
                      </span>
                    </div>
                  </div>

                  {/* Interval Selection for Recurring Payments */}
                  {formData.type === 'RECURRING_PAYMENT' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Payment Frequency</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Input 
                            type="number"
                            min="1"
                            placeholder="Interval"
                            className="transition-all hover:border-primary/50"
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
                            <SelectTrigger className="transition-all hover:border-primary/50">
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
                        <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                        <Input 
                          id="endDate" 
                          type="date"
                          className="transition-all hover:border-primary/50"
                          value={formData.endDate}
                          onChange={(e) => setFormData({
                            ...formData,
                            endDate: e.target.value
                          })}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Recipient Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Recipient</Label>
                  <div className="relative">
                    <Input 
                      placeholder="Enter recipient's public key"
                      className="pl-10 transition-all hover:border-primary/50"
                      value={formData.participants[0] || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        participants: [e.target.value]
                      })}
                    />
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter contract details and terms"
                    className="min-h-[120px] transition-all hover:border-primary/50"
                    value={formData.metadata?.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, description: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Contract Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-6 space-y-6">
              {!formData.metadata?.title && !formData.amount ? (
                <div className="text-center text-sm text-muted-foreground">
                  Start filling in the contract details to see a preview
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold tracking-tight">
                        {formData.metadata?.title || 'Untitled Contract'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formData.metadata?.description || 'No description provided'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <div className="text-sm text-muted-foreground">Contract Type</div>
                        <div className="font-medium">
                          {formData.type === 'RECURRING_PAYMENT' && 'Recurring Payment'}
                          {formData.type === 'FIXED_PAYMENT' && 'One-time Payment'}
                          {formData.type === 'MILESTONE_PAYMENT' && 'Milestone Payment'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Amount</div>
                        <div className="font-medium">
                          {formData.amount ? `KES ${formData.amount.toLocaleString()}` : '-'}
                        </div>
                      </div>
                    </div>

                    {formData.type === 'RECURRING_PAYMENT' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Payment Interval</div>
                          <div className="font-medium">
                            {formData.intervalConfig.value} {formData.intervalConfig.unit}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">End Date</div>
                          <div className="font-medium">
                            {formatDate(formData.endDate) || '-'}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-2">Participants</div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-primary/10 text-primary rounded px-2 py-1">Creator</div>
                          <code className="text-xs">
                            {user?.publicKey ? `${user.publicKey.slice(0, 8)}...${user.publicKey.slice(-8)}` : '-'}
                          </code>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-primary/10 text-primary rounded px-2 py-1">Recipient</div>
                          <code className="text-xs">
                            {formData.participants[0] 
                              ? `${formData.participants[0].slice(0, 8)}...${formData.participants[0].slice(-8)}`
                              : '-'
                            }
                          </code>
                        </div>
                      </div>
                    </div>

                    {formData.type === 'RECURRING_PAYMENT' && (
                      <div className="bg-primary/5 rounded-lg p-4 mt-4">
                        <div className="text-sm">
                          <span className="text-primary font-medium">Payment Schedule: </span>
                          {`${formData.intervalConfig.value} ${formData.intervalConfig.unit} payments`}
                          {formData.endDate && ` until ${formatDate(formData.endDate)}`}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-6">
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80"
                onClick={handleCreateContract}
                disabled={!formData.metadata?.title || !formData.amount || !formData.participants[0]}
              >
                <FileText className="mr-2 h-4 w-4" />
                Create Contract
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}