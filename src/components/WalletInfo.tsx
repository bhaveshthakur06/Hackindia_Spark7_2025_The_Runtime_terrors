
import { useBlockchain } from "../contexts/BlockchainContext";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";

export function WalletInfo() {
  const { walletConnected, walletAddress, balance, networkName, connectWallet, isLoading } = useBlockchain();

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Wallet</CardTitle>
          <CardDescription>Connect your Ethereum wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!walletConnected) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Wallet</CardTitle>
          <CardDescription>Connect your Ethereum wallet</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-muted-foreground mb-4">
            Connect your wallet to access blockchain features
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleConnectWallet} className="w-full">
            Connect Wallet
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center justify-between">
          Wallet
          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 hover:bg-green-100">
            Connected
          </Badge>
        </CardTitle>
        <CardDescription>Your Ethereum wallet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Address:</span>
          <span className="font-mono text-sm">{walletAddress && formatAddress(walletAddress)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Balance:</span>
          <span className="font-semibold">{parseFloat(balance).toFixed(4)} ETH</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Network:</span>
          <Badge variant="outline" className="font-normal">
            {networkName}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            if (walletAddress) {
              navigator.clipboard.writeText(walletAddress);
              toast.success("Address copied to clipboard");
            }
          }}
        >
          Copy Address
        </Button>
      </CardFooter>
    </Card>
  );
}
