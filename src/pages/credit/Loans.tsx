import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CreditLoans() {
  return (
    <div className="space-y-6">
      {/* <h2 className="text-3xl font-bold tracking-tight">Loans & Repayments</h2> */}
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="text-2xl font-bold">KES 250,000</div>
                <div className="text-sm text-muted-foreground">Total Outstanding</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Repayment Progress</span>
                  <span>65% Complete</span>
                </div>
                <Progress value={65} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Next Payment</div>
                  <div className="text-muted-foreground">Apr 15, 2025</div>
                </div>
                <div>
                  <div className="font-medium">Amount Due</div>
                  <div className="text-muted-foreground">KES 25,000</div>
                </div>
              </div>
              
              <Button className="w-full">Make Payment</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Apr 15, 2025</TableCell>
                  <TableCell>KES 25,000</TableCell>
                  <TableCell className="text-yellow-500">Pending</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mar 15, 2025</TableCell>
                  <TableCell>KES 25,000</TableCell>
                  <TableCell className="text-green-500">Paid</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Feb 15, 2025</TableCell>
                  <TableCell>KES 25,000</TableCell>
                  <TableCell className="text-green-500">Paid</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}