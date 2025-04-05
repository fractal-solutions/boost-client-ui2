import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

export default function CreditStatus() {
  return (
    <div className="space-y-6">
      {/* <h2 className="text-3xl font-bold tracking-tight">Credit Status</h2> */}
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Credit Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-5xl font-bold">725</div>
                  <div className="flex items-center gap-1 text-green-500">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+15 points</span>
                  </div>
                </div>
                <div className="text-muted-foreground">
                  <div>Good</div>
                  <div className="text-sm">Updated 3 days ago</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Score Range</span>
                  <span>300-850</span>
                </div>
                <Progress value={85} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>Payment History</div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">Excellent</span>
                  <Progress value={95} className="w-20" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>Credit Utilization</div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">Good</span>
                  <Progress value={75} className="w-20" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>Credit Age</div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">Very Good</span>
                  <Progress value={85} className="w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}