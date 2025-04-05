import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, BrainCircuit, LineChart, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CreditStatus() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>Credit Score</div>
              <Badge variant="outline" className="flex gap-1">
                <BrainCircuit className="h-3 w-3" />
                AI Powered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-5xl font-bold">689</div>
                  <div className="flex items-center gap-1 text-green-500">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>GOOD</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Interest Rate</div>
                  <div className="font-bold">18.30%</div>
                  <div className="text-xs text-muted-foreground">Base: 17.75%</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Score Range</span>
                  <span>300-850</span>
                </div>
                <Progress value={81} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-muted-foreground">Model Confidence</div>
                  <div className="font-medium">91.6%</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-muted-foreground">Classification</div>
                  <div className="font-medium">GOOD</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Annual Revenue</div>
                  <div className="text-lg font-semibold">KES 5M</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Cash Reserves</div>
                  <div className="text-lg font-semibold">KES 0.8M</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>Payment History</div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">94%</span>
                    <Progress value={94} className="w-20" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>Credit Utilization</div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">40%</span>
                    <Progress value={40} className="w-20" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>Industry Risk</div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">Low</span>
                    <Progress value={40} className="w-20" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="text-muted-foreground">Years in Business</div>
                  <div>4 years</div>
                </div>
                <div className="space-y-2">
                  <div className="text-muted-foreground">Late Payments</div>
                  <div>1 incident</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}