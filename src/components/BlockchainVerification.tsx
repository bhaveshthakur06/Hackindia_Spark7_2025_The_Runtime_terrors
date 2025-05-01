
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle2, XCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useBlockchain } from '../contexts/BlockchainContext';

interface BlockchainVerificationProps {
  transactionHash?: string;
  actionType: 'delivery' | 'stock' | 'claim';
  onVerifySuccess?: () => void;
}

export function BlockchainVerification({ 
  transactionHash, 
  actionType,
  onVerifySuccess 
}: BlockchainVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
  const { walletConnected } = useBlockchain();
  
  // This would be replaced with a real verification call to the blockchain
  const verifyTransaction = async () => {
    if (!transactionHash) {
      toast.error('No transaction hash to verify');
      return;
    }
    
    setIsVerifying(true);
    setVerificationStatus('verifying');
    
    try {
      // Simulating blockchain verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 90% chance of success for demo purposes
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        setVerificationStatus('verified');
        toast.success('Transaction verified on blockchain!');
        onVerifySuccess?.();
      } else {
        setVerificationStatus('failed');
        toast.error('Transaction verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('failed');
      toast.error('Error verifying transaction');
    } finally {
      setIsVerifying(false);
    }
  };
  
  const getActionTitle = () => {
    switch (actionType) {
      case 'delivery':
        return 'Delivery Verification';
      case 'stock':
        return 'Stock Record Verification';
      case 'claim':
        return 'Claim Verification';
      default:
        return 'Blockchain Verification';
    }
  };
  
  const getActionDescription = () => {
    switch (actionType) {
      case 'delivery':
        return 'Verify this delivery has been recorded on the blockchain';
      case 'stock':
        return 'Verify this stock record exists on the blockchain';
      case 'claim':
        return 'Verify this claim has been recorded on the blockchain';
      default:
        return 'Verify transaction on the blockchain';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{getActionTitle()}</CardTitle>
          {verificationStatus === 'verified' && (
            <Badge variant="outline" className="bg-green-50 text-green-700">Verified</Badge>
          )}
          {verificationStatus === 'failed' && (
            <Badge variant="outline" className="bg-red-50 text-red-700">Failed</Badge>
          )}
        </div>
        <CardDescription>{getActionDescription()}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {transactionHash ? (
            <div className="bg-muted p-3 rounded-md flex items-center justify-between">
              <code className="text-xs md:text-sm font-mono truncate">
                {transactionHash}
              </code>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2" 
                onClick={() => {
                  navigator.clipboard.writeText(transactionHash);
                  toast.success('Transaction hash copied');
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="bg-muted p-3 rounded-md text-center text-muted-foreground">
              No transaction hash available
            </div>
          )}
          
          {verificationStatus === 'verifying' && (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Verifying on blockchain...</p>
            </div>
          )}
          
          {verificationStatus === 'verified' && (
            <div className="flex flex-col items-center justify-center py-4 text-green-600">
              <CheckCircle2 className="h-8 w-8 mb-2" />
              <p className="text-sm">Successfully verified on the blockchain</p>
              <p className="text-xs text-muted-foreground mt-1">Transaction is valid and immutable</p>
            </div>
          )}
          
          {verificationStatus === 'failed' && (
            <div className="flex flex-col items-center justify-center py-4 text-red-600">
              <XCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">Verification failed</p>
              <p className="text-xs text-muted-foreground mt-1">Unable to verify this transaction</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={verifyTransaction} 
          className="w-full"
          disabled={!walletConnected || isVerifying || !transactionHash || verificationStatus === 'verified'}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : verificationStatus === 'verified' ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Verified
            </>
          ) : (
            'Verify on Blockchain'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
