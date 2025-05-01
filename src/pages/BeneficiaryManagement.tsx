import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Beneficiary } from "@/types";
import { registerBeneficiary } from "@/blockchain/utils";
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
import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";

// Initialize Supabase client
const supabase = createClient(
  "https://ayqdbfgwdiejecircotr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5cWRiZmd3ZGllamVjaXJjb3RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTE1NDIsImV4cCI6MjA2MTY4NzU0Mn0.Ww0HNOgFppX_8WjOm26W2h6zf6iz__fa91YcRCPaYEU"
);

// Form schema for adding a new beneficiary
const beneficiarySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  walletAddress: z.string().min(42, "Wallet address must be 42 characters").optional(),
  govtId: z.string().min(5, "Government ID is required"),
  contactNumber: z.string().min(5, "Contact number is required"),
  location: z.string().min(2, "Location is required"),
  familySize: z.coerce.number().min(1, "Family size must be at least 1"),
  eligibilityStatus: z.enum(["pending", "approved", "rejected"]),
});

// Define Supabase user type
interface SupabaseUser {
  id: string;
  name: string;
  wallet_address: string | null;
  govt_id: string;
  contact_number: string;
  location: string;
  family_size: number;
  eligibility_status: "pending" | "approved" | "rejected";
  created_at: string;
}

export default function BeneficiaryManagement() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [networkFee, setNetworkFee] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const form = useForm<z.infer<typeof beneficiarySchema>>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      name: "",
      walletAddress: "",
      govtId: "",
      contactNumber: "",
      location: "",
      familySize: 1,
      eligibilityStatus: "pending",
    },
  });

  // Fetch beneficiaries from Supabase on load
  useEffect(() => {
    async function fetchBeneficiaries() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("beneficiaries")
          .select("*");

        if (error) {
          console.error("Supabase error details:", error);
          toast.error(`Error loading beneficiaries: ${error.message}`);
          return;
        }

        if (!data) {
          console.warn("No data returned from Supabase");
          setBeneficiaries([]);
          return;
        }

        console.log("Fetched beneficiaries:", data);
        setBeneficiaries(data.map(mapUserToBeneficiary));
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred while loading beneficiaries");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBeneficiaries();
  }, []);

  const onSubmit = async (values: z.infer<typeof beneficiarySchema>) => {
    setIsProcessing(true);
    try {
      console.log("Form values:", values);
      
      // Validate required fields
      if (!values.name || !values.govtId || !values.contactNumber || !values.location) {
        throw new Error("All required fields must be filled");
      }

      const newBeneficiary = {
        name: values.name,
        wallet_address: values.walletAddress || null,
        govt_id: values.govtId,
        contact_number: values.contactNumber,
        location: values.location,
        family_size: values.familySize,
        eligibility_status: values.eligibilityStatus,
      };

      console.log("Prepared Supabase data:", newBeneficiary);

      // If a wallet address is provided, register on blockchain
      if (values.walletAddress) {
        const transaction = await registerBeneficiary(
          values.walletAddress,
          values.govtId,
          values.familySize
        );

        if (!transaction) {
          toast.error("Failed to register on blockchain. Please try again.");
          return;
        }
      }

      // Insert into Supabase
      const { data, error } = await supabase
        .from("beneficiaries")
        .insert([newBeneficiary])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned after insert");
      }

      console.log("Successfully inserted beneficiary:", data);
      setBeneficiaries([mapUserToBeneficiary(data), ...beneficiaries]);
      setIsAddDialogOpen(false);
      form.reset();
      toast.success("Beneficiary added successfully");
    } catch (error) {
      console.error("Error adding beneficiary:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to add beneficiary: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (beneficiaryId: string, newStatus: "pending" | "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("beneficiaries")
        .update({ eligibility_status: newStatus })
        .eq("id", beneficiaryId);

      if (error) throw error;

      setBeneficiaries(
        beneficiaries.map((beneficiary) =>
          beneficiary.id === beneficiaryId
            ? { ...beneficiary, eligibilityStatus: newStatus }
            : beneficiary
        )
      );

      toast.success(`Beneficiary status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update beneficiary status");
    }
  };

  const handleDelete = async (beneficiaryId: string) => {
    try {
      const { error } = await supabase
        .from("beneficiaries")
        .delete()
        .eq("id", beneficiaryId);

      if (error) throw error;

      setBeneficiaries(beneficiaries.filter((b) => b.id !== beneficiaryId));
      toast.success("Beneficiary removed successfully");
    } catch (error) {
      console.error("Error deleting beneficiary:", error);
      toast.error("Failed to delete beneficiary");
    }
  };

  // Add estimateNetworkFee function
  const estimateNetworkFee = async (walletAddress: string, govtId: string, familySize: number) => {
    setIsEstimating(true);
    setNetworkFee(null);
    try {
      const { getGrainlyContract } = await import("@/blockchain/contracts");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getGrainlyContract(true);
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const gasPrice = await provider.getGasPrice();
      const estimatedGas = await contractWithSigner.estimateGas.registerBeneficiary(walletAddress, govtId, familySize);
      const feeInWei = estimatedGas.mul(gasPrice);
      const feeInEth = ethers.utils.formatEther(feeInWei);
      setNetworkFee(feeInEth);
    } catch (err) {
      setNetworkFee(null);
      toast.error("Failed to estimate network fee");
    } finally {
      setIsEstimating(false);
    }
  };

  const onDialogOpen = () => {
    setIsAddDialogOpen(true);
    setNetworkFee(null);
  };

  const onDialogClose = () => {
    setIsAddDialogOpen(false);
    setNetworkFee(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Beneficiary Management</h1>
        <p className="text-muted-foreground">
          Manage beneficiaries of the ration distribution system
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">
            {beneficiaries.length} Beneficiaries
          </span>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={onDialogOpen}>
              <Plus className="mr-2 h-4 w-4" />
              Add Beneficiary
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Beneficiary</DialogTitle>
              <DialogDescription>
                Enter beneficiary details to register them in the system.
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
                  name="walletAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ethereum Wallet Address (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} />
                      </FormControl>
                      <FormDescription>
                        If provided, beneficiary can use blockchain authentication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="govtId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Government ID</FormLabel>
                        <FormControl>
                          <Input placeholder="SSN-123-45-6789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="familySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Size</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="4"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eligibilityStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eligibility Status</FormLabel>
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
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Add Network Fee Estimate section */}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Network Fee:</span>
                  {isEstimating ? (
                    <span className="text-muted-foreground">Estimating...</span>
                  ) : networkFee ? (
                    <span className="text-green-700">~{networkFee} ETH</span>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const values = form.getValues();
                      if (values.walletAddress && values.govtId && values.familySize) {
                        await estimateNetworkFee(values.walletAddress, values.govtId, values.familySize);
                      } else {
                        toast.info("Fill wallet address, government ID, and family size to estimate fee.");
                      }
                    }}
                  >
                    Refresh Estimate
                  </Button>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onDialogClose}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? "Processing..." : "Add Beneficiary"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Beneficiaries</CardTitle>
          <CardDescription>
            List of all registered beneficiaries in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading beneficiaries...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Govt ID</TableHead>
                  <TableHead>Family Size</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beneficiaries.map((beneficiary) => (
                  <TableRow key={beneficiary.id}>
                    <TableCell className="font-medium">
                      {beneficiary.name}
                      {beneficiary.walletAddress && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Wallet
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{beneficiary.govtId}</TableCell>
                    <TableCell>{beneficiary.familySize}</TableCell>
                    <TableCell>{beneficiary.contactNumber}</TableCell>
                    <TableCell>{beneficiary.registrationDate}</TableCell>
                    <TableCell>
                      <StatusBadge status={beneficiary.eligibilityStatus} />
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
                              navigator.clipboard.writeText(beneficiary.id);
                              toast.success("Beneficiary ID copied to clipboard");
                            }}
                          >
                            Copy ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(beneficiary.id, "approved")}
                          >
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            Mark as Approved
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(beneficiary.id, "rejected")}
                          >
                            <X className="mr-2 h-4 w-4 text-red-500" />
                            Mark as Rejected
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(beneficiary.id, "pending")}
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
                            onClick={() => handleDelete(beneficiary.id)}
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
          )}
        </CardContent>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <div>Showing {beneficiaries.length} beneficiaries</div>
          <div>Last updated: {new Date().toLocaleString()}</div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
          Rejected
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

// Helper to map Supabase user row to Beneficiary
function mapUserToBeneficiary(user: SupabaseUser): Beneficiary {
  return {
    id: user.id,
    name: user.name || '',
    walletAddress: user.wallet_address || '',
    govtId: user.govt_id || '',
    contactNumber: user.contact_number || '',
    location: user.location || '',
    familySize: user.family_size || 1,
    eligibilityStatus: user.eligibility_status || 'pending',
    registrationDate: new Date().toISOString().slice(0, 10),
  };
}
