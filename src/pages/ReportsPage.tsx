import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

export default function ReportsPage() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [distributors, setDistributors] = useState<any[]>([]);
    const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [invRes, distRes, benRes] = await Promise.all([
                supabase.from("inventory").select("*"),
                supabase.from("users").select("*").eq("role", "distributor"),
                supabase.from("users").select("*").eq("role", "beneficiary"),
            ]);
            setInventory(invRes.data || []);
            setDistributors(distRes.data || []);
            setBeneficiaries(benRes.data || []);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8 p-8">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Reports</h1>
            {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading reports...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory Items</CardTitle>
                                <CardDescription>Total items in inventory</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{inventory.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Distributors</CardTitle>
                                <CardDescription>Total registered distributors</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{distributors.length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Beneficiaries</CardTitle>
                                <CardDescription>Total registered beneficiaries</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{beneficiaries.length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Inventory Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventory.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{item.quantity_available}</TableCell>
                                            <TableCell>{item.unit_of_measure}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Distributors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Wallet Address</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Assigned Center</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {distributors.map((d) => (
                                        <TableRow key={d.id}>
                                            <TableCell>{d.name}</TableCell>
                                            <TableCell>{d.wallet_address}</TableCell>
                                            <TableCell>{d.phone}</TableCell>
                                            <TableCell>{d.assigned_center}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Beneficiaries</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Wallet Address</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Govt ID</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {beneficiaries.map((b) => (
                                        <TableRow key={b.id}>
                                            <TableCell>{b.name}</TableCell>
                                            <TableCell>{b.wallet_address}</TableCell>
                                            <TableCell>{b.phone}</TableCell>
                                            <TableCell>{b.govt_id}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
} 