import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calculator, TrendingUp } from 'lucide-react';

export default function InvestmentsCalculator() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Investment Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Initial Investment (KES)</Label>
                <Input type="number" placeholder="Enter amount" defaultValue="100000" />
              </div>

              <div className="space-y-2">
                <Label>Monthly Contribution (KES)</Label>
                <Input type="number" placeholder="Enter amount" defaultValue="10000" />
              </div>

              <div className="space-y-2">
                <Label>Investment Period (Years)</Label>
                <div className="pt-2">
                  <Slider
                    defaultValue={[5]}
                    max={30}
                    min={1}
                    step={1}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-muted-foreground">1 year</span>
                    <span className="text-sm font-medium">5 years</span>
                    <span className="text-sm text-muted-foreground">30 years</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Expected Annual Return (%)</Label>
                <div className="pt-2">
                  <Slider
                    defaultValue={[8]}
                    max={20}
                    min={1}
                    step={0.5}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-muted-foreground">1%</span>
                    <span className="text-sm font-medium">8%</span>
                    <span className="text-sm text-muted-foreground">20%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Risk Level</Label>
                <Select defaultValue="moderate">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative (4-6%)</SelectItem>
                    <SelectItem value="moderate">Moderate (6-8%)</SelectItem>
                    <SelectItem value="aggressive">Aggressive (8-12%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Returns
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projected Returns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold">KES 700,000</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Expected Value</p>
                <p className="text-2xl font-bold text-green-500">KES 892,345</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold text-green-500">KES 192,345</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Return Rate</p>
                <p className="text-2xl font-bold">27.5%</p>
              </div>
            </div>

            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Investment</TableHead>
                    <TableHead>Returns</TableHead>
                    <TableHead>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>{2024 + i}</TableCell>
                      <TableCell>KES {(100000 + i * 120000).toLocaleString()}</TableCell>
                      <TableCell className="text-green-500">
                        +KES {(8000 + i * 12000).toLocaleString()}
                      </TableCell>
                      <TableCell>KES {(108000 + i * 140000).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Conservative Portfolio',
                description: 'Low-risk investment mix suitable for stable returns',
                return: '4-6%',
              },
              {
                title: 'Balanced Growth',
                description: 'Moderate-risk portfolio with balanced returns',
                return: '6-8%',
              },
              {
                title: 'High Growth',
                description: 'High-risk portfolio for maximum potential returns',
                return: '8-12%',
              },
            ].map((recommendation, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">{recommendation.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.description}
                    </p>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                      Expected Return: {recommendation.return}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}