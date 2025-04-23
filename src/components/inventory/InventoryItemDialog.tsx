import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format, subDays, subWeeks, subMonths, subQuarters, subHours, startOfHour } from "date-fns";
import { Package, DollarSign, History, TrendingUp, TrendingDown } from "lucide-react";
import { InventoryItem, Supplier } from "@/pages/vendor/Inventory";
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useState } from 'react';
import { Button } from "@/components/ui/button";

interface InventoryItemDialogProps {
  item: InventoryItem;
  supplier?: Supplier;
  open: boolean;
  onClose: () => void;
}

export function InventoryItemDialog({ item, supplier, open, onClose }: InventoryItemDialogProps) {
  const [timeRange, setTimeRange] = useState<'hourly' | '6h' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'all'>('daily');

  const getStockTrendData = () => {
    const now = new Date();
    const ranges = {
      hourly: subHours(now, 24), // Last 24 hours
      '6h': subHours(now, 72), // Last 72 hours (3 days) in 6h intervals
      daily: subDays(now, 7),
      weekly: subWeeks(now, 8),
      monthly: subMonths(now, 6),
      quarterly: subQuarters(now, 4),
      all: new Date(item.created)
    };

    const startDate = ranges[timeRange];
    const filteredHistory = item.stockHistory
      .filter(history => history.date >= startDate.getTime())
      .sort((a, b) => a.date - b.date);

    const stockLevels: { [key: string]: number } = {};
    let runningStock = item.quantity;

    // Work backwards from current stock to calculate historical levels
    [...filteredHistory].reverse().forEach(history => {
      const date = new Date(history.date);
      let dateKey: string;

      if (timeRange === 'hourly') {
        dateKey = format(date, 'HH:mm MMM dd');
      } else if (timeRange === '6h') {
        // Round to nearest 6 hour interval
        const hours = date.getHours();
        const roundedHours = Math.floor(hours / 6) * 6;
        const roundedDate = startOfHour(date);
        roundedDate.setHours(roundedHours);
        dateKey = format(roundedDate, 'HH:mm MMM dd');
      } else {
        dateKey = format(date, getDateFormat(timeRange));
      }

      if (history.type === 'IN') {
        runningStock -= history.quantity;
      } else {
        runningStock += history.quantity;
      }
      stockLevels[dateKey] = runningStock;
    });

    return Object.entries(stockLevels)
      .map(([date, stock]) => ({
        date,
        stock
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getDateFormat = (range: typeof timeRange) => {
    switch (range) {
      case 'hourly': return 'HH:mm MMM dd';
      case '6h': return 'HH:mm MMM dd';
      case 'daily': return 'MMM dd';
      case 'weekly': return 'MMM dd';
      case 'monthly': return 'MMM yyyy';
      case 'quarterly': return 'QQQ yyyy';
      case 'all': return 'MMM yyyy';
    }
  };

  const stockTrendData = getStockTrendData();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Inventory Item Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="justify-start w-fit">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="stock">Stock History</TabsTrigger>
          </TabsList>

          <TabsContent 
            value="details" 
            className="flex-1 overflow-hidden"
          >
            <ScrollArea className="h-[calc(90vh-120px)]">
              <div className="space-y-6 p-1">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image Section - Make it responsive */}
                  <div className="sm:col-span-2 md:col-span-1 h-[200px] md:h-auto">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-full h-full rounded-lg border flex items-center justify-center bg-muted">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="space-y-4 sm:col-span-2 md:col-span-1 p-8">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchase Cost:</span>
                        <span>KES {item.purchaseCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Selling Price:</span>
                        <span>KES {item.sellingPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Value:</span>
                        <span>KES {(item.quantity * item.sellingPrice).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Current Stock:</span>
                        <Badge variant={item.quantity <= item.lowStockThreshold ? "destructive" : "default"}>
                          {item.quantity} units
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Low Stock Alert:</span>
                        <span>{item.lowStockThreshold} units</span>
                      </div>
                    </div>

                    {supplier && (
                      <div className="border rounded-lg p-4 space-y-2">
                        <h4 className="font-medium">Supplier Details</h4>
                        <p className="text-sm">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                        <p className="text-sm text-muted-foreground">{supplier.email}</p>
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                      <p>Created {formatDistanceToNow(item.created)} ago</p>
                      <p>Last updated {formatDistanceToNow(item.lastUpdated)} ago</p>
                    </div>
                  </div>
                </div>

                {/* Projected Profits Section - Make it full width on mobile */}
                <div className="space-y-4 border rounded-lg p-4 bg-muted/50 sm:col-span-2">
                  <h3 className="font-medium">Projected Profits</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Per Unit Profit</p>
                      <p className="text-lg font-medium">
                        KES {(item.sellingPrice - item.purchaseCost).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Potential Profit</p>
                      <p className="text-lg font-medium">
                        KES {((item.sellingPrice - item.purchaseCost) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                      <p className="text-lg font-medium">
                        {(((item.sellingPrice - item.purchaseCost) / item.sellingPrice) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Return on Investment</p>
                      <p className="text-lg font-medium">
                        {(((item.sellingPrice - item.purchaseCost) / item.purchaseCost) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stock Trend Section - Make it full width */}
                <div className="col-span-2 space-y-4 border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <h3 className="font-medium">Stock Trend</h3>
                    <div className="flex flex-wrap gap-2">
                        {(['hourly', '6h', 'daily', 'weekly', 'monthly', 'quarterly', 'all'] as const).map((range) => (
                            <Button
                            key={range}
                            variant={timeRange === range ? "default" : "outline"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setTimeRange(range)}
                            >
                            {range === '6h' ? '6 Hours' : range.charAt(0).toUpperCase() + range.slice(1)}
                            </Button>
                        ))}
                    </div>
                  </div>
                  
                  <div className="h-[200px] sm:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stockTrendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                            dataKey="date"
                            className="text-xs text-muted-foreground"
                            angle={timeRange === 'hourly' || timeRange === '6h' ? -45 : 0}
                            textAnchor={timeRange === 'hourly' || timeRange === '6h' ? 'end' : 'middle'}
                            height={60}
                            interval={timeRange === 'hourly' ? 2 : 0}
                        />
                        <YAxis 
                          className="text-xs text-muted-foreground"
                          tickFormatter={(value) => value.toLocaleString()}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <span className="text-xs text-muted-foreground">Date:</span>
                                    <span className="text-xs font-medium">{payload[0].payload.date}</span>
                                    <span className="text-xs text-muted-foreground">Stock:</span>
                                    <span className="text-xs font-medium">{payload[0].value?.toLocaleString()} units</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="stock"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent 
            value="stock" 
            className="flex-1 overflow-hidden"
          >
            <ScrollArea className="h-[calc(90vh-120px)]">
              <div className="space-y-4 p-1">
                {item.stockHistory.map(history => (
                  <div 
                    key={history.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {history.type === 'IN' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">
                          {history.type === 'IN' ? 'Stock In' : 'Stock Out'}
                        </span>
                      </div>
                      <Badge>
                        {history.type === 'IN' ? '+' : '-'}{history.quantity} units
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">{history.reason}</p>
                    
                    {history.purchase && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Purchase Cost: </span>
                        <span>KES {history.purchase.cost.toLocaleString()}</span>
                        {history.purchase.invoice && (
                          <span className="ml-2 text-muted-foreground">
                            (Invoice: {history.purchase.invoice})
                          </span>
                        )}
                      </div>
                    )}

                    {history.sale && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Sale Price: </span>
                        <span>KES {(history.sale.price * history.quantity).toLocaleString()}</span>
                        {history.sale.receipt && (
                          <span className="ml-2 text-muted-foreground">
                            (Receipt: {history.sale.receipt})
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(history.date)} ago
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}