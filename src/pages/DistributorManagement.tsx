import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Plus, MoreHorizontal, Check, X, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Define the Distributor type
interface Distributor {
  id: string;
  name: string;
  licenseNumber: string;
  contactNumber: string;
  location: string;
  status: "active" | "inactive" | "pending";
  registrationDate: string;
}

// Form schema for adding a new distributor
const distributorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  licenseNumber: z.string().min(5, "License number is required"),
  contactNumber: z.string().min(5, "Contact number is required"),
  location: z.string().min(2, "Location is required"),
  status: z.enum(["active", "inactive", "pending"]),
});

export default function DistributorManagement() {
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof distributorSchema>>({
    resolver: zodResolver(distributorSchema),
    defaultValues: {
      name: "",
      licenseNumber: "",
      contactNumber: "",
      location: "",
      status: "pending",
    },
  });

  // Fetch distributors on component mount
  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("role", "distributor");

        if (error) {
          console.error("Error fetching distributors:", error);
          toast.error("Failed to fetch distributors");
          return;
        }

        if (data) {
          setDistributors(data.map(mapUserToDistributor));
        }
      } catch (error) {
        console.error("Error fetching distributors:", error);
        toast.error("Failed to fetch distributors");
      }
    };

    fetchDistributors();
  }, []);

  const onSubmit = async (values: z.infer<typeof distributorSchema>) => {
    setIsProcessing(true);
    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            name: values.name,
            govt_id: values.licenseNumber,
            phone: values.contactNumber,
            location: values.location,
            status: values.status,
            role: "distributor",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding distributor:", error);
        toast.error("Failed to add distributor");
        return;
      }

      // Add to local state
      const newDistributor = mapUserToDistributor(data);
      setDistributors([newDistributor, ...distributors]);
      setIsAddDialogOpen(false);
      form.reset();
      toast.success("Distributor added successfully");
    } catch (error) {
      console.error("Error adding distributor:", error);
      toast.error("Failed to add distributor");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (distributorId: string, newStatus: "active" | "inactive" | "pending") => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", distributorId);

      if (error) {
        console.error("Error updating status:", error);
        toast.error("Failed to update distributor status");
        return;
      }

      setDistributors(
        distributors.map((distributor) =>
          distributor.id === distributorId
            ? { ...distributor, status: newStatus }
            : distributor
        )
      );
      toast.success(`Distributor status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update distributor status");
    }
  };

  const handleDelete = async (distributorId: string) => {
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", distributorId);

      if (error) {
        console.error("Error deleting distributor:", error);
        toast.error("Failed to delete distributor");
        return;
      }

      setDistributors(distributors.filter((d) => d.id !== distributorId));
      toast.success("Distributor removed successfully");
    } catch (error) {
      console.error("Error deleting distributor:", error);
      toast.error("Failed to delete distributor");
    }
  };

  // Helper to map Supabase user row to Distributor
  function mapUserToDistributor(user: any): Distributor {
    return {
      id: user.id,
      name: user.name || '',
      licenseNumber: user.govt_id || '',
      contactNumber: user.phone || '',
      location: user.location || '',
      status: user.status || 'pending',
      registrationDate: user.created_at ? user.created_at.slice(0, 10) : '',
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Distributor Management</h1>
        <p className="text-muted-foreground">
          Manage distributors in the ration distribution system
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">
            {distributors.length} Distributors
          </span>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Distributor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Distributor</DialogTitle>
              <DialogDescription>
                Enter distributor details to register them in the system.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input placeholder="LIC-123-456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="555-123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="New York City, NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Add Distributor"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Distributors</CardTitle>
          <CardDescription>
            List of all registered distributors in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributors.map((distributor) => (
                <TableRow key={distributor.id}>
                  <TableCell className="font-medium">{distributor.name}</TableCell>
                  <TableCell>{distributor.licenseNumber}</TableCell>
                  <TableCell>{distributor.contactNumber}</TableCell>
                  <TableCell>{distributor.location}</TableCell>
                  <TableCell>{distributor.registrationDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={distributor.status} />
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
                            navigator.clipboard.writeText(distributor.id);
                            toast.success("Distributor ID copied to clipboard");
                          }}
                        >
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(distributor.id, "active")}
                        >
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          Mark as Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(distributor.id, "inactive")}
                        >
                          <X className="mr-2 h-4 w-4 text-red-500" />
                          Mark as Inactive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(distributor.id, "pending")}
                        >
                          Reset to Pending
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(distributor.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
          <div>Showing {distributors.length} distributors</div>
          <div>Last updated: {new Date().toLocaleString()}</div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
          Inactive
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          Pending
        </Badge>
      );
  }
} 