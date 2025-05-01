import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Distributor } from "@/types";
import { registerDistributor } from "@/blockchain/utils";
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { ethers } from "ethers";

const distributorSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    walletAddress: z.string().min(42, "Wallet address must be 42 characters").optional(),
    govtId: z.string().min(5, "Government ID is required"),
    contactNumber: z.string().min(5, "Contact number is required"),
    assignedCenter: z.string().min(2, "Assigned center is required"),
    status: z.enum(["active", "inactive"]),
});

export default function DistributorsPage() {
    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [networkFee, setNetworkFee] = useState<string | null>(null);
    const [isEstimating, setIsEstimating] = useState(false);

    const form = useForm<z.infer<typeof distributorSchema>>({
        resolver: zodResolver(distributorSchema),
        defaultValues: {
            name: "",
            walletAddress: "",
            govtId: "",
            contactNumber: "",
            assignedCenter: "",
            status: "active",
        },
    });

    useEffect(() => {
        const fetchDistributors = async () => {
            setIsLoading(true);
            try {
                // Test: Add a distributor
                const testDistributor = {
                    name: "Test Distributor",
                    wallet_address: "0x1234567890123456789012345678901234567890",
                    govt_id: "TEST123",
                    phone: "1234567890",
                    role: "distributor",
                    assigned_center: "Test Center"
                };

                console.log("Adding test distributor...");
                const { data: insertData, error: insertError } = await supabase
                    .from("users")
                    .insert([testDistributor])
                    .select()
                    .single();

                if (insertError) {
                    console.error("Error adding test distributor:", insertError);
                }

                console.log("Fetching distributors...");
                const { data, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("role", "distributor");

                if (error) {
                    console.error("Supabase error:", error);
                    toast.error(`Failed to fetch distributors: ${error.message}`);
                    setIsLoading(false);
                    return;
                }

                console.log("Fetched distributors:", data);
                setDistributors((data || []).map(mapUserToDistributor));
                setIsLoading(false);
            } catch (err) {
                console.error("Unexpected error:", err);
                toast.error("An unexpected error occurred while fetching distributors");
                setIsLoading(false);
            }
        };
        fetchDistributors();
    }, []);

    // Estimate network fee for registerDistributor
    const estimateNetworkFee = async (walletAddress: string, govtId: string, assignedCenter: string) => {
        setIsEstimating(true);
        setNetworkFee(null);
        try {
            // Import from contracts, not utils
            const { getGrainlyContract } = await import("@/blockchain/contracts");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = getGrainlyContract(true);
            const signer = provider.getSigner();
            const contractWithSigner = contract.connect(signer);
            const gasPrice = await provider.getGasPrice();
            const estimatedGas = await contractWithSigner.estimateGas.registerDistributor(walletAddress, govtId, assignedCenter);
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

    const onSubmit = async (values: z.infer<typeof distributorSchema>) => {
        setIsProcessing(true);
        try {
            // Register on blockchain if wallet address is provided
            if (values.walletAddress) {
                await estimateNetworkFee(values.walletAddress, values.govtId, values.assignedCenter);
                const transaction = await registerDistributor(
                    values.walletAddress,
                    values.govtId,
                    values.assignedCenter
                );
                if (!transaction) {
                    toast.error("Failed to register on blockchain. Please try again.");
                    return;
                }
            }
            // Insert into Supabase
            const { data, error } = await supabase.from("users").insert([
                {
                    name: values.name,
                    wallet_address: values.walletAddress,
                    govt_id: values.govtId,
                    phone: values.contactNumber,
                    assigned_center: values.assignedCenter,
                    status: values.status,
                    role: "distributor",
                },
            ]).select().single();
            if (error) {
                toast.error("Failed to add distributor");
                return;
            }
            setDistributors([mapUserToDistributor(data), ...distributors]);
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

    return (
        <div className="space-y-6 p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Distributors</h1>
                <p className="text-muted-foreground">Manage distributors of the ration distribution system</p>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{distributors.length} Distributors</span>
                <Dialog open={isAddDialogOpen} onOpenChange={open => open ? onDialogOpen() : onDialogClose()}>
                    <DialogTrigger asChild>
                        <Button>+ Add Distributor</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>Add New Distributor</DialogTitle>
                            <DialogDescription>Enter distributor details to register them in the system.</DialogDescription>
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="govtId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Government ID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="EMP-123-45-6789" {...field} />
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
                                                <Input placeholder="555-2345" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="assignedCenter"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Assigned Center</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Central Distribution Center" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <FormControl>
                                                <select {...field} className="w-full border rounded p-2">
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Network Fee Estimate */}
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
                                            if (values.walletAddress && values.govtId && values.assignedCenter) {
                                                await estimateNetworkFee(values.walletAddress, values.govtId, values.assignedCenter);
                                            } else {
                                                toast.info("Fill wallet address, government ID, and assigned center to estimate fee.");
                                            }
                                        }}
                                    >
                                        Refresh Estimate
                                    </Button>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={onDialogClose}>
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
                    <CardDescription>List of all registered distributors in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading distributors...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Wallet Address</TableHead>
                                    <TableHead>Govt ID</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Assigned Center</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {distributors.map((distributor) => (
                                    <TableRow key={distributor.id}>
                                        <TableCell className="font-medium">{distributor.name}</TableCell>
                                        <TableCell>{distributor.walletAddress}</TableCell>
                                        <TableCell>{distributor.govtId}</TableCell>
                                        <TableCell>{distributor.contactNumber}</TableCell>
                                        <TableCell>{distributor.assignedCenter}</TableCell>
                                        <TableCell>{distributor.status}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" className="h-8 w-8 p-0 mr-2">Edit</Button>
                                            <Button variant="destructive" className="h-8 w-8 p-0">Delete</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                <CardFooter className="justify-between text-xs text-muted-foreground">
                    <div>Showing {distributors.length} distributors</div>
                    <div>Last updated: {new Date().toLocaleString()}</div>
                </CardFooter>
            </Card>
        </div>
    );
}

// Helper to map Supabase user row to Distributor
function mapUserToDistributor(user: any): Distributor {
    return {
        id: user.id,
        name: user.name || '',
        walletAddress: user.wallet_address || '',
        govtId: user.govt_id || '',
        contactNumber: user.phone || '',
        assignedCenter: user.assigned_center || '',
        registrationDate: user.created_at ? user.created_at.slice(0, 10) : '',
        status: user.status || 'active',
    };
} 