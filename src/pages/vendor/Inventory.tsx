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
  ChevronDown,
  Upload,
  Users,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { InventoryItemDialog } from '@/components/inventory/InventoryItemDialog';
import { SuppliersDialog } from '@/pages/vendor/SuppliersDialog';
import { InventoryReportDialog } from '@/components/inventory/InventoryReportDialog';

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface StockHistory {
  id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  date: number;
  reason: string;
  purchase?: {
    cost: number;
    invoice?: string;
  };
  sale?: {
    price: number;
    receipt?: string;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  imageUrl?: string;
  purchaseCost: number;
  sellingPrice: number;
  quantity: number;
  lowStockThreshold: number;
  supplierId?: string;
  category?: string;
  location?: string;
  barcode?: string;
  created: number;
  lastUpdated: number;
  stockHistory: StockHistory[];
}

// Add supplier storage functions
const getSuppliersKey = (publicKey: string) => `suppliers_${publicKey}`;

const saveSuppliers = (publicKey: string, suppliers: Supplier[]) => {
  localStorage.setItem(getSuppliersKey(publicKey), JSON.stringify(suppliers));
};

const loadSuppliers = (publicKey: string): Supplier[] => {
  const stored = localStorage.getItem(getSuppliersKey(publicKey));
  return stored ? JSON.parse(stored) : [];
};

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
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    if (!user?.publicKey) return [];
    return loadSuppliers(user.publicKey);
  });
  const [showSuppliers, setShowSuppliers] = useState(false);
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);
  const [showReport, setShowReport] = useState(false);

  const getSupplier = (supplierId?: string) => {
    return suppliers.find(s => s.id === supplierId);
  };

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

    if (!newItem.name || !newItem.sku || !newItem.purchaseCost || !newItem.sellingPrice || !newItem.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const item: InventoryItem = {
      ...newItem as Required<InventoryItem>,
      id: Date.now().toString(),
      lowStockThreshold: newItem.lowStockThreshold || 10,
      created: Date.now(),
      lastUpdated: Date.now(),
      stockHistory: [{
        id: Date.now().toString(),
        type: 'IN',
        quantity: newItem.quantity,
        date: Date.now(),
        reason: 'Initial stock',
        purchase: {
          cost: newItem.purchaseCost
        }
      }]
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

    const updatedItem = {
      ...selectedItem,
      quantity: selectedItem.quantity + restockAmount,
      lastUpdated: Date.now(),
      stockHistory: [
        ...selectedItem.stockHistory,
        {
          id: Date.now().toString(),
          type: 'IN',
          quantity: restockAmount,
          date: Date.now(),
          reason: 'Restock',
          purchase: {
            cost: selectedItem.purchaseCost
          }
        }
      ]
    };

    setInventory(prev => 
      prev.map(item => 
        item.id === selectedItem.id ? { ...updatedItem, stockHistory: updatedItem.stockHistory.map(history => ({ ...history, type: history.type as 'IN' | 'OUT' })) } : item
      )
    );
    
    setSelectedItem(null);
    setShowRestockDialog(false);
    setRestockAmount(0);
    toast.success('Stock updated successfully');
  };

  const handleAddSupplier = (supplier: Supplier) => {
    if (!user?.publicKey) return;
    const updatedSuppliers = [...suppliers, supplier];
    saveSuppliers(user.publicKey, updatedSuppliers);
    setSuppliers(updatedSuppliers);
  };
  
  const handleEditSupplier = (updatedSupplier: Supplier) => {
    if (!user?.publicKey) return;
    const updatedSuppliers = suppliers.map(s => 
      s.id === updatedSupplier.id ? updatedSupplier : s
    );
    saveSuppliers(user.publicKey, updatedSuppliers);
    setSuppliers(updatedSuppliers);
  };
  
  const handleDeleteSupplier = (id: string) => {
    if (!user?.publicKey) return;
    const updatedSuppliers = suppliers.filter(s => s.id !== id);
    saveSuppliers(user.publicKey, updatedSuppliers);
    setSuppliers(updatedSuppliers);
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
        <div className="grid grid-cols-4 sm:flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <FileDown className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button 
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <FileUp className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button 
            className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/80"
            onClick={() => setShowAddItem(true)}
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowSuppliers(true)}
            className="flex-1 sm:flex-none"
          >
            <Users className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Suppliers</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Inventory Summary Card */}
        <Card className='h-fit'>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">
                Inventory Summary
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowReport(true)}
                className="h-8"
              >
                <FileText className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Generate Report</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-muted-foreground text-sm">Total Items</div>
                  <div className="font-medium text-lg">{inventory.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Low Stock Items</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">{lowStockItems.length}</span>
                    {lowStockItems.length > 0 && (
                      <Badge variant="destructive">Alert</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground text-sm">Total Stock Value</div>
                    <div className="font-medium text-lg">
                      KES {inventory.reduce((sum, item) => 
                        sum + (item.quantity * item.sellingPrice), 0
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm">Cost of Goods</div>
                    <div className="font-medium text-lg">
                      KES {inventory.reduce((sum, item) => 
                        sum + (item.quantity * item.purchaseCost), 0
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground text-sm">Categories</div>
                    <div className="font-medium text-lg">
                      {new Set(inventory.map(item => item.category).filter(Boolean)).size}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm">Total Units</div>
                    <div className="font-medium text-lg">
                      {inventory.reduce((sum, item) => sum + item.quantity, 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-muted-foreground text-sm">Potential Profit</div>
                    <div className="font-medium text-lg text-green-500">
                      KES {inventory.reduce((sum, item) => 
                        sum + (item.quantity * (item.sellingPrice - item.purchaseCost)), 0
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm">Avg. Margin</div>
                    <div className="font-medium text-lg">
                      {(inventory.reduce((sum, item) => 
                        sum + ((item.sellingPrice - item.purchaseCost) / item.sellingPrice * 100), 0
                      ) / (inventory.length || 1)).toFixed(1)}%
                    </div>
                  </div>
                </div>
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
                  <TableHead>Purchase Cost</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map(item => (
                  <TableRow 
                    key={item.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setViewItem(item)}
                  >
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>KES {item.purchaseCost.toLocaleString()}</TableCell>
                    <TableCell>KES {item.sellingPrice.toLocaleString()}</TableCell>
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
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
              <Label>Product Image</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-accent/50 transition-colors cursor-pointer">
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewItem({ ...newItem, imageUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload Image</span>
                    </div>
                  </label>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Image URL"
                    value={newItem.imageUrl || ''}
                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                  />
                  {newItem.imageUrl && (
                    <img 
                      src={newItem.imageUrl} 
                      alt="Preview"
                      className="w-full h-20 object-cover rounded-md"
                    />
                  )}
                </div>
              </div>
            </div>
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
                <Label htmlFor="purchaseCost">Purchase Cost</Label>
                <Input
                  id="purchaseCost"
                  type="number"
                  value={newItem.purchaseCost || ''}
                  onChange={(e) => setNewItem({ ...newItem, purchaseCost: parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={newItem.sellingPrice || ''}
                  onChange={(e) => setNewItem({ ...newItem, sellingPrice: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newItem.quantity || ''}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                />
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select 
                value={newItem.supplierId} 
                onValueChange={(value) => setNewItem({ ...newItem, supplierId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Label htmlFor="purchaseCost">Purchase Cost</Label>
                <Input
                  id="purchaseCost"
                  type="number"
                  value={selectedItem?.purchaseCost || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, purchaseCost: parseFloat(e.target.value) } as InventoryItem)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={selectedItem?.sellingPrice || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, sellingPrice: parseFloat(e.target.value) } as InventoryItem)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={selectedItem?.quantity || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, quantity: parseInt(e.target.value) } as InventoryItem)}
                />
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

      {/* Selected Item Dialog */}
      
      {selectedItem && (
        <InventoryItemDialog
          item={selectedItem}
          supplier={getSupplier(selectedItem.supplierId)}
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* View Item Dialog */}
      {viewItem && (
        <InventoryItemDialog
          item={viewItem}
          supplier={getSupplier(viewItem.supplierId)}
          open={!!viewItem}
          onClose={() => setViewItem(null)}
        />
      )}

      {/* Suppliers Dialog */}
      
      
      <SuppliersDialog
              open={showSuppliers}
              onOpenChange={setShowSuppliers}
              suppliers={suppliers}
              onAddSupplier={handleAddSupplier}
              onEditSupplier={handleEditSupplier}
              onDeleteSupplier={handleDeleteSupplier}
      />

      {/* Inventory Report Dialog */}
      <InventoryReportDialog
        open={showReport}
        onOpenChange={setShowReport}
        inventory={inventory}
        dateGenerated={new Date()}
      />
    </div>
  );
}