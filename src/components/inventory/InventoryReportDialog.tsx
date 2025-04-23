import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Download,
  Loader2,
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatDistanceToNow, format, subHours, subDays, subWeeks, subMonths, subQuarters, subYears } from "date-fns";
import { InventoryItem } from "@/pages/vendor/Inventory";

interface InventoryReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: InventoryItem[];
  dateGenerated?: Date;
}

export function InventoryReportDialog({
  open,
  onOpenChange,
  inventory,
  dateGenerated = new Date(),
}: InventoryReportDialogProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [timeRange, setTimeRange] = useState<'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');


  // Calculate report data
  const totalValue = inventory.reduce(
    (sum, item) => sum + item.quantity * item.sellingPrice,
    0
  );
  const totalCost = inventory.reduce(
    (sum, item) => sum + item.quantity * item.purchaseCost,
    0
  );
  const potentialProfit = totalValue - totalCost;

  // Enhanced analytics calculations
  const analytics = {
    totalItems: inventory.length,
    totalUnits: inventory.reduce((sum, item) => sum + item.quantity, 0),
    averageUnitCost: totalCost / inventory.reduce((sum, item) => sum + item.quantity, 0),
    averageMargin:
      inventory.reduce(
        (sum, item) =>
          sum +
          ((item.sellingPrice - item.purchaseCost) / item.sellingPrice) * 100,
        0
      ) / inventory.length || 0,
    topPerformers: inventory
      .map((item) => ({
        ...item,
        potentialProfit:
          (item.sellingPrice - item.purchaseCost) * item.quantity,
        margin:
          ((item.sellingPrice - item.purchaseCost) / item.sellingPrice) * 100,
      }))
      .sort((a, b) => b.potentialProfit - a.potentialProfit)
      .slice(0, 5),
    lowStock: inventory.filter(
      (item) => item.quantity <= item.lowStockThreshold
    ),
    categoryBreakdown: Object.entries(
      inventory.reduce((acc, item) => {
        const category = item.category || "Uncategorized";
        acc[category] =
          (acc[category] || 0) + item.quantity * item.sellingPrice;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]),
  };

  // Prepare chart data
  const categoryData = Array.from(
    inventory.reduce((acc, item) => {
      const category = item.category || "Uncategorized";
      const current = acc.get(category) || { value: 0, items: 0 };
      acc.set(category, {
        value: current.value + item.quantity * item.sellingPrice,
        items: current.items + item.quantity,
      });
      return acc;
    }, new Map())
  ).map(([name, data]) => ({
    name,
    value: data.value,
    items: data.items,
  }));

  const stockData = inventory
    .filter((item) => item.quantity <= item.lowStockThreshold * 1.5)
    .map((item) => ({
      name: item.name,
      quantity: item.quantity,
      threshold: item.lowStockThreshold,
    }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const stockTrendData = inventory.reduce((acc, item) => {
    item.stockHistory.forEach(history => {
      const date = new Date(history.date);
      const monthYear = format(date, 'MMM yyyy');
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          name: monthYear,
          sales: 0,
          value: 0,
          units: 0
        };
      }
      
      if (history.type === 'OUT' && history.sale) {
        acc[monthYear].sales += history.quantity * history.sale.price;
        acc[monthYear].units += history.quantity;
        acc[monthYear].value = acc[monthYear].sales; // For trend visualization
      }
    });
    
    return acc;
  }, {} as Record<string, { name: string; sales: number; value: number; units: number }>);

  // Convert to array and sort by date
  const trendChartData = Object.values(stockTrendData)
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPDF(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      pdf.save(
        `inventory-report-${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getTimeRangeData = () => {
    const now = new Date();
    const ranges = {
      hourly: subHours(now, 24), // Last 24 hours
      daily: subDays(now, 7), // Last 7 days
      weekly: subWeeks(now, 12), // Last 12 weeks
      monthly: subMonths(now, 12), // Last 12 months
      quarterly: subQuarters(now, 4), // Last 4 quarters
      yearly: subYears(now, 3) // Last 3 years
    };
  
    const startDate = ranges[timeRange];
    const data = inventory.reduce((acc, item) => {
      item.stockHistory.forEach(history => {
        if (history.date < startDate.getTime() || history.type !== 'OUT' || !history.sale) return;
  
        const date = new Date(history.date);
        let key = '';
        switch (timeRange) {
          case 'hourly':
            key = format(date, 'HH:mm MMM dd');
            break;
          case 'daily':
            key = format(date, 'MMM dd');
            break;
          case 'weekly':
            key = `Week ${format(date, 'w')}`;
            break;
          case 'monthly':
            key = format(date, 'MMM yyyy');
            break;
          case 'quarterly':
            key = `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
            break;
          case 'yearly':
            key = format(date, 'yyyy');
            break;
        }
  
        if (!acc[key]) {
          acc[key] = { name: key, sales: 0, units: 0 };
        }
        acc[key].sales += history.quantity * history.sale.price;
        acc[key].units += history.quantity;
      });
      return acc;
    }, {} as Record<string, { name: string; sales: number; units: number }>);
  
    return Object.values(data).sort((a, b) => 
      timeRange === 'weekly' 
        ? parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1])
        : new Date(a.name).getTime() - new Date(b.name).getTime()
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Inventory Report</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Generated on {format(dateGenerated, "PPP")} at{" "}
                {format(dateGenerated, "pp")}
              </p>
            </div>
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              variant="outline"
            >
              {isGeneratingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <div ref={reportRef} className="space-y-6 p-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total Stock Value
                    </div>
                    <div className="text-2xl font-bold">
                      KES {totalValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {analytics.totalUnits} units
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Potential Profit
                    </div>
                    <div className="text-2xl font-bold text-green-500">
                      KES {potentialProfit.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {analytics.averageMargin.toFixed(1)}% avg margin
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <DollarSign className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Avg Unit Cost
                    </div>
                    <div className="text-2xl font-bold">
                      KES {analytics.averageUnitCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">per unit</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-destructive/10 rounded-full">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Low Stock Items
                    </div>
                    <div className="text-2xl font-bold text-destructive">
                      {analytics.lowStock.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      need attention
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Category Distribution</h3>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) =>
                          `${entry.name}: ${(
                            (entry.value / totalValue) *
                            100
                          ).toFixed(1)}%`
                        }
                      >
                        {categoryData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          `KES ${Number(value).toLocaleString()}`
                        }
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChartIcon className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Stock Levels</h3>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="quantity"
                        fill="#0088FE"
                        name="Current Stock"
                      />
                      <Bar
                        dataKey="threshold"
                        fill="#FF8042"
                        name="Low Stock Threshold"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <Card className="p-6 col-span-1 lg:col-span-2">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <div className="flex flex-col">
                      <h3 className="font-semibold">Sales Performance Trend</h3>
                      <p className="text-sm text-muted-foreground">Sales performance over time</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const).map((range) => (
                        <Button
                        key={range}
                        variant={timeRange === range ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setTimeRange(range)}
                        >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                        </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTimeRangeData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        angle={timeRange === 'hourly' ? -45 : 0}
                        textAnchor={timeRange === 'hourly' ? 'end' : 'middle'}
                        height={timeRange === 'hourly' ? 60 : 30}
                        interval={timeRange === 'hourly' ? 2 : 0}
                    />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `KES ${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value} units`}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "Sales") return `KES ${Number(value).toLocaleString()}`;
                        return `${value} units`;
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="sales" 
                      name="Sales" 
                      fill="#0088FE"
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="units" 
                      name="Units Sold" 
                      fill="#00C49F"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Sales ({timeRange})</div>
                  <div className="font-medium">
                    KES {getTimeRangeData().reduce((sum, item) => sum + item.sales, 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Units ({timeRange})</div>
                  <div className="font-medium">
                    {getTimeRangeData().reduce((sum, item) => sum + item.units, 0).toLocaleString()} units
                  </div>
                </div>
              </div>
            </Card>

            {/* Top Performers & Low Stock Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Top Performing Items</h3>
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">Item</th>
                      <th className="pb-2">Potential Profit</th>
                      <th className="pb-2">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topPerformers.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">{item.name}</td>
                        <td className="py-2">
                          KES {item.potentialProfit.toLocaleString()}
                        </td>
                        <td className="py-2">{item.margin.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Low Stock Alert</h3>
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2">Item</th>
                      <th className="pb-2">Current Stock</th>
                      <th className="pb-2">Threshold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.lowStock.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">{item.name}</td>
                        <td className="py-2">{item.quantity}</td>
                        <td className="py-2">{item.lowStockThreshold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}