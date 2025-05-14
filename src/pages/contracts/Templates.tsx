import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, FileText, Star, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const templates = [
  {
    id: 1,
    title: 'Service Agreement',
    description: 'Standard template for service-based contracts',
    category: 'Services',
    rating: 4.5,
    uses: 1234,
  },
  {
    id: 2,
    title: 'Fixed Price Contract',
    description: 'Template for fixed-price project agreements',
    category: 'Project',
    rating: 4.8,
    uses: 2156,
  },
  {
    id: 3,
    title: 'Milestone Payment Agreement',
    description: 'Template for milestone-based payment contracts',
    category: 'Payment',
    rating: 4.3,
    uses: 987,
  },
  {
    id: 4,
    title: 'Maintenance Contract',
    description: 'Template for ongoing maintenance services',
    category: 'Services',
    rating: 4.6,
    uses: 1567,
  },
];

export default function ContractsTemplates() {
  const { user } = useAuth();

  if (!user?.publicKey) {
    return (
      <div className="container mx-auto max-w-7xl">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="space-y-4">
              <Star className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Login Required</h3>
              <p className="text-muted-foreground">
                Please login to view Templates
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search templates..."
            className="pl-10"
          />
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary/80">
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-medium">
                    {template.title}
                  </CardTitle>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
                <Button variant="ghost" size="icon">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="h-4 w-4 mr-1" />
                {template.rating} • {template.uses} uses
              </div>
              <Button variant="outline" className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recently Used Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between py-4 border-b last:border-0"
              >
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{template.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Last used: 2 days ago
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Use Again
                </Button>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}