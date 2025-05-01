import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Simulate blockchain send supply (replace with real function as needed)
async function sendSupplyToBeneficiary(distributorWallet: string, beneficiaryWallet: string, claimId: string) {
    // Here you would call your smart contract function
    toast.success(`Supply sent from ${distributorWallet} to ${beneficiaryWallet} for claim ${claimId}`);
}

export default function DistributionsPage() {
    const [distributions, setDistributions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDistributions = async () => {
            setIsLoading(true);
            // Fetch all claims
            const { data: claims, error: claimsError } = await supabase.from("claims").select("*, beneficiary:beneficiary_id(*), distributor:stock_records(distributor_id, item_name)");
            if (claimsError) {
                toast.error("Failed to fetch distributions");
                setIsLoading(false);
                return;
            }
            // Fetch all users for mapping
            const { data: users } = await supabase.from("users").select("id, name, wallet_address, role");
            // Map beneficiary and distributor details
            const mapped = (claims || []).map((claim: any) => {
                const beneficiary = users?.find((u: any) => u.id === claim.beneficiary_id && u.role === "beneficiary");
                // Find distributor by matching distributor_id in stock_records
                const distributorId = claim.distributor_id || (claim.stock_records && claim.stock_records[0]?.distributor_id);
                const distributor = users?.find((u: any) => u.id === distributorId && u.role === "distributor");
                return {
                    ...claim,
                    beneficiaryName: beneficiary?.name || "",
                    beneficiaryWallet: beneficiary?.wallet_address || "",
                    distributorName: distributor?.name || "",
                    distributorWallet: distributor?.wallet_address || "",
                    geo: claim.latitude && claim.longitude ? { lat: claim.latitude, lng: claim.longitude } : null,
                };
            });
            setDistributions(mapped);
            setIsLoading(false);
        };
        fetchDistributions();
    }, []);

    return (
        <div className="space-y-8 p-8">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Distributions</h1>
            {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading distributions...</div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Distribution Records</CardTitle>
                        <CardDescription>Linking beneficiaries and distributors with geo-verification and blockchain actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {distributions.map((dist) => (
                                <div key={dist.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 border rounded-lg p-4 mb-4 bg-muted/50">
                                    {/* Left: Geo Verification */}
                                    <div className="col-span-1 flex flex-col items-center justify-center">
                                        <div className="font-semibold mb-2">Geo Verification</div>
                                        {dist.geo ? (
                                            <iframe
                                                title="Google Maps Location"
                                                width="250"
                                                height="180"
                                                style={{ border: 0, borderRadius: 8 }}
                                                loading="lazy"
                                                allowFullScreen
                                                src={`https://www.google.com/maps/embed/v1/view?key=YOUR_GOOGLE_MAPS_API_KEY&center=${dist.geo.lat},${dist.geo.lng}&zoom=15`}
                                            ></iframe>
                                        ) : (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </div>
                                    {/* Right: Distribution Details */}
                                    <div className="col-span-2">
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    <TableHead>Beneficiary</TableHead>
                                                    <TableCell>
                                                        <div>{dist.beneficiaryName}</div>
                                                        <div className="text-xs text-muted-foreground">{dist.beneficiaryWallet}</div>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableHead>Distributor</TableHead>
                                                    <TableCell>
                                                        <div>{dist.distributorName}</div>
                                                        <div className="text-xs text-muted-foreground">{dist.distributorWallet}</div>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableHead>Item</TableHead>
                                                    <TableCell>{dist.item_name || dist.stock_records?.[0]?.item_name || "-"}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableCell>{dist.quantity}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableHead>Status</TableHead>
                                                    <TableCell>{dist.status}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableHead>Send Supply</TableHead>
                                                    <TableCell>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => sendSupplyToBeneficiary(dist.distributorWallet, dist.beneficiaryWallet, dist.id)}
                                                            disabled={!dist.distributorWallet || !dist.beneficiaryWallet}
                                                        >
                                                            Send Supply
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 