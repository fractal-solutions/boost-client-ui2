import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  Package, 
  AlertTriangle,
  Edit2,  // Change Edit to Edit2
  Trash2, // Change Trash to Trash2
  FileDown,
  FileUp,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  category: string;
  description?: string;
}

const getStorageKey = (publicKey: string) => `inventory_${publicKey}`;

export const saveInventoryToStorage = (publicKey: string, inventory: InventoryItem[]) => {
  localStorage.setItem(getStorageKey(publicKey), JSON.stringify(inventory));
};

export const loadInventoryFromStorage = (publicKey: string): InventoryItem[] => {
  const stored = localStorage.getItem(getStorageKey(publicKey));
  return stored ? JSON.parse(stored) : [];
};

export default function VendorInventory() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    if (!user?.publicKey) return [];
    return loadInventoryFromStorage(user.publicKey);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({});
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const [restockAmount, setRestockAmount] = useState<number>(0);
  const [showLowStockAlerts, setShowLowStockAlerts] = useState(false);

  useEffect(() => {
    if (user?.publicKey) {
      saveInventoryToStorage(user.publicKey, inventory);
    }
  }, [inventory, user?.publicKey]);

  const lowStockItems = inventory.filter(item => 
    item.quantity <= item.lowStockThreshold
  );

  const handleAddItem = () => {
    if (!user?.publicKey) {
      toast.error('Please login to manage inventory');
      return;
    }

    if (!newItem.name || !newItem.sku || !newItem.price || !newItem.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const item: InventoryItem = {
      ...newItem as Required<InventoryItem>,
      id: Date.now().toString(), // Replace with proper ID generation
      lowStockThreshold: newItem.lowStockThreshold || 10,
    };

    setInventory(prev => [...prev, item]);
    setNewItem({});
    setShowAddItem(false);
    toast.success('Item added successfully');
  };

  const handleEditItem = () => {
    if (!user?.publicKey) return;
    if (!selectedItem) return;

    setInventory(prev => 
      prev.map(item => 
        item.id === selectedItem.id ? selectedItem : item
      )
    );
    setSelectedItem(null);
    setShowEditDialog(false);
    toast.success('Item updated successfully');
  };

  const handleDeleteItem = () => {
    if (!user?.publicKey) return;
    if (!selectedItem) return;

    setInventory(prev => 
      prev.filter(item => item.id !== selectedItem.id)
    );
    setSelectedItem(null);
    setShowDeleteDialog(false);
    toast.success('Item deleted successfully');
  };

  const handleRestock = () => {
    if (!user?.publicKey || !selectedItem || restockAmount <= 0) return;

    setInventory(prev => 
      prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, quantity: item.quantity + restockAmount }
          : item
      )
    );
    setSelectedItem(null);
    setShowRestockDialog(false);
    setRestockAmount(0);
    toast.success('Stock updated successfully');
  };

  if (!user?.publicKey) {
    return (
      <div className="container mx-auto max-w-7xl">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="space-y-4">
              <Package className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Login Required</h3>
              <p className="text-muted-foreground">
                Please login to manage your inventory
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-primary/80"
            onClick={() => setShowAddItem(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Inventory Summary Card */}
        <Card className='h-fit'>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Inventory Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Items</span>
                <span className="font-medium">{inventory.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Low Stock Alerts</span>
                <Badge variant="destructive">{lowStockItems.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="md:col-span-2 h-fit">
          <CardHeader 
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setShowLowStockAlerts(!showLowStockAlerts)}
          >
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Low Stock Alerts
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                showLowStockAlerts && "transform rotate-180"
              )} />
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {showLowStockAlerts && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-6">
                      {lowStockItems.map(item => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-lg border bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} units remaining
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowRestockDialog(true);
                            }}
                          >
                            Restock
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>KES {item.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.quantity}
                        {item.quantity <= item.lowStockThreshold && (
                          <Badge variant="destructive" className="text-xs">Low</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 p-0 hover:bg-muted"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 p-0 hover:bg-muted"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newItem.name || ''}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={newItem.sku || ''}
                  onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newItem.category || ''}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={newItem.price || ''}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newItem.quantity || ''}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="threshold">Low Stock Threshold</Label>
              <Input
                id="threshold"
                type="number"
                value={newItem.lowStockThreshold || ''}
                onChange={(e) => setNewItem({ ...newItem, lowStockThreshold: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItem(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={selectedItem?.name || ''}
                onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value } as InventoryItem)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={selectedItem?.sku || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, sku: e.target.value } as InventoryItem)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={selectedItem?.category || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value } as InventoryItem)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={selectedItem?.price || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, price: parseFloat(e.target.value) } as InventoryItem)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={selectedItem?.quantity || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, quantity: parseInt(e.target.value) } as InventoryItem)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="threshold">Low Stock Threshold</Label>
              <Input
                id="threshold"
                type="number"
                value={selectedItem?.lowStockThreshold || ''}
                onChange={(e) => setSelectedItem({ ...selectedItem, lowStockThreshold: parseInt(e.target.value) } as InventoryItem)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={selectedItem?.description || ''}
                onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value } as InventoryItem)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {selectedItem?.name}? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={showRestockDialog} onOpenChange={setShowRestockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Current Stock: {selectedItem?.quantity || 0}</Label>
              <Input
                type="number"
                value={restockAmount}
                onChange={(e) => setRestockAmount(parseInt(e.target.value))}
                placeholder="Enter amount to add"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestock}>Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}