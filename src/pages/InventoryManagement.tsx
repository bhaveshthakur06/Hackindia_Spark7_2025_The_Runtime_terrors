import React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RationItem } from "../types/index.ts";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card.tsx";
import { Button } from "../components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form.tsx";
import { Input } from "../components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs.tsx";
import { Progress } from "../components/ui/progress.tsx";
import { Badge } from "../components/ui/badge.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu.tsx";
import { Plus, Package, TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  "https://ayqdbfgwdiejecircotr.supabase.co", // replace with your actual Supabase URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWRiZmd3ZGllamVjaXJjb3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTE1NDIsImV4cCI6MjA2MTY4NzU0Mn0.Ww0HNOgFppX_8WjOm26W2h6zf6iz__fa91YcRCPaYEU"
);

// Form schema for adding a new inventory item
const inventoryItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(2, "Category is required"),
  unit_of_measure: z.string().min(1, "Unit of measure is required"),
  quantity_available: z.coerce.number().min(0, "Quantity cannot be negative"),
  expiry_date: z.string().optional(),
});

export default function InventoryManagement() {
  const [items, setItems] = useState<RationItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const form = useForm<z.infer<typeof inventoryItemSchema>>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: "",
      category: "",
      unit_of_measure: "",
      quantity_available: 0,
      expiry_date: "",
    },
  });

  // Fetch inventory items from Supabase on load
  useEffect(() => {
    async function fetchItems() {
      const { data, error } = await supabase.from("inventory").select("*");
      if (error) {
        console.error(error);
        toast.error("Error loading inventory");
      } else {
        setItems(data);
      }
    }
    fetchItems();
  }, []);

  const onSubmit = async (values: z.infer<typeof inventoryItemSchema>) => {
    const newItem = {
      name: values.name,
      category: values.category,
      unit_of_measure: values.unit_of_measure,
      quantity_available: values.quantity_available,
      expiry_date: values.expiry_date || null,
      image: "/placeholder.svg",
    };

    // Insert new item into Supabase
    const { data, error } = await supabase
      .from("inventory")
      .insert([newItem])
      .single();

    if (error) {
      toast.error("Error adding inventory item");
      console.error(error);
    } else {
      setItems([data as RationItem, ...items]);
      setIsAddDialogOpen(false);
      form.reset();
      toast.success("Inventory item added successfully");
    }
  };

  // Filter items based on active tab
  const filteredItems = activeTab === "all"
    ? items
    : items.filter((item) => item.category.toLowerCase() === activeTab);

  // Add stock to an item
  const handleAddStock = async (itemId: string, quantity: number) => {
    const updatedItem = items.find((item) => item.id === itemId);
    if (!updatedItem) return;

    const newQuantity = updatedItem.quantity_available + quantity;

    // Update stock in Supabase
    const { data, error } = await supabase
      .from("inventory")
      .update({ quantity_available: newQuantity })
      .eq("id", itemId)
      .single();

    if (error) {
      toast.error("Error adding stock");
      console.error(error);
    } else {
      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, quantity_available: newQuantity } : item
        )
      );
      toast.success(`Added ${quantity} ${updatedItem.unit_of_measure} to inventory`);
    }
  };

  // Remove stock from an item
  const handleRemoveStock = async (itemId: string, quantity: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.quantity_available < quantity) {
      toast.error("Cannot remove more than available quantity");
      return;
    }

    const newQuantity = item.quantity_available - quantity;

    // Update stock in Supabase
    const { data, error } = await supabase
      .from("inventory")
      .update({ quantity_available: newQuantity })
      .eq("id", itemId)
      .single();

    if (error) {
      toast.error("Error removing stock");
      console.error(error);
    } else {
      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, quantity_available: newQuantity } : item
        )
      );
      toast.success(`Removed ${quantity} ${item.unit_of_measure} from inventory`);
    }
  };

  // Get unique categories for tabs
  const categories = ["all", ...new Set(items.map((item) => item.category.toLowerCase()))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Manage ration items inventory for distribution
        </p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Add a new item to the ration inventory
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Rice" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="Grains" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit_of_measure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit of Measure</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="kg">Kilogram (kg)</SelectItem>
                              <SelectItem value="liter">Liter</SelectItem>
                              <SelectItem value="packet">Packet</SelectItem>
                              <SelectItem value="unit">Unit</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity_available"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiry_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Item</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>
                {activeTab === "all" ? "All Items" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Items`}
              </CardTitle>
              <CardDescription>
                {activeTab === "all"
                  ? `Showing all ${filteredItems.length} inventory items`
                  : `Showing ${filteredItems.length} items in the ${activeTab} category`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Quantity Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.unit_of_measure}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{item.quantity_available} {item.unit_of_measure}</span>
                            <span>
                              {getStockStatus(item.quantity_available)}%
                            </span>
                          </div>
                          <Progress
                            value={getStockStatus(item.quantity_available)}
                            className={`h-2 ${item.quantity_available < 1000
                                ? "bg-red-100"
                                : item.quantity_available < 3000
                                  ? "bg-amber-100"
                                  : "bg-green-100"
                              }`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <StockLevelBadge quantity={item.quantity_available} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                // deno-lint-ignore no-explicit-any
                                (navigator as any).clipboard.writeText(item.id);
                                toast.success("Item ID copied to clipboard");
                              }}
                            >
                              Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleAddStock(item.id, 100)}
                            >
                              <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                              Add 100 {item.unit_of_measure}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRemoveStock(item.id, 100)}
                            >
                              <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                              Remove 100 {item.unit_of_measure}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              View History
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between text-xs text-muted-foreground">
              <div>Showing {filteredItems.length} items</div>
              <div>Last updated: {new Date().toLocaleString()}</div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InventorySummaryCard
          title="Total Items"
          value={items.length}
          description="Different ration items"
          icon={Package}
        />
        <InventorySummaryCard
          title="Total Quantity"
          value={items.reduce((acc, item) => acc + item.quantity_available, 0)}
          description="Units across all items"
          icon={TrendingUp}
        />
        <InventorySummaryCard
          title="Low Stock Items"
          value={items.filter((item) => item.quantity_available < 1000).length}
          description="Items needing restock"
          icon={TrendingDown}
          variant="warning"
        />
        <InventorySummaryCard
          title="Categories"
          value={new Set(items.map((item) => item.category)).size}
          description="Item classifications"
          icon={Package}
        />
      </div>
    </div>
  );
}

// Helper function to calculate stock status percentage
function getStockStatus(quantity: number): number {
  // Assuming 5000 is the maximum expected stock
  const maxStock = 5000;
  const percentage = (quantity / maxStock) * 100;
  return Math.min(Math.max(percentage, 0), 100);
}

// Stock Level Badge Component
function StockLevelBadge({ quantity }: { quantity: number }) {
  if (quantity <= 500) {
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
        Critical
      </Badge>
    );
  } else if (quantity <= 1000) {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">
        Low
      </Badge>
    );
  } else if (quantity <= 3000) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100">
        Moderate
      </Badge>
    );
  } else {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
        Sufficient
      </Badge>
    );
  }
}

// Inventory Summary Card Component
interface InventorySummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  variant?: "default" | "warning" | "success";
}

function InventorySummaryCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
}: InventorySummaryCardProps) {
  const getBgColor = () => {
    switch (variant) {
      case "warning":
        return "bg-amber-100 text-amber-700";
      case "success":
        return "bg-green-100 text-green-700";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`rounded-full p-2 ${getBgColor()}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
