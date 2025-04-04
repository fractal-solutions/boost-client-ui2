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
import { FileText, Upload } from 'lucide-react';

export default function ContractsCreate() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Create New Contract</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Contract Title</Label>
              <Input id="title" placeholder="Enter contract title" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Contract Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Payment</SelectItem>
                  <SelectItem value="recurring">Recurring Payment</SelectItem>
                  <SelectItem value="milestone">Milestone Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Contract Amount (KES)</Label>
              <Input id="amount" type="number" placeholder="Enter amount" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Contract Description</Label>
              <Textarea
                id="description"
                placeholder="Enter contract details"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Documents</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop files here or click to browse
                </p>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
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