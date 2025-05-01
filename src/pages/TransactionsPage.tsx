
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BlockchainTransaction } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BlockchainVerification } from '@/components/BlockchainVerification';
import { Loader2, Search, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<BlockchainTransaction | null>(null);
  const { user } = useAuth();
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      // If user is admin, get all transactions
      // Otherwise, filter by user's wallet address
      let query = supabase.from('blockchain_transactions').select('*');
      
      if (user?.role !== 'admin' && user?.walletAddress) {
        query = query.or(`from_address.eq.${user.walletAddress},to_address.eq.${user.walletAddress}`);
      }
      
      const { data, error } = await query.order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data as BlockchainTransaction[];
    },
    enabled: !!user
  });
  
  const filteredTransactions = transactions?.filter(tx => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      tx.hash.toLowerCase().includes(query) ||
      tx.from_address.toLowerCase().includes(query) ||
      tx.to_address.toLowerCase().includes(query) ||
      tx.action.toLowerCase().includes(query)
    );
  });
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Blockchain Transactions</h1>
            <p className="text-muted-foreground">
              View all transactions recorded on the blockchain
            </p>
          </div>
          
          <div className="flex w-full md:w-80 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Records of all blockchain transactions in the GrainLink system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : transactions?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hash</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions?.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs">
                          {formatAddress(tx.hash)}
                        </TableCell>
                        <TableCell>{tx.action}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatAddress(tx.from_address)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {formatAddress(tx.to_address)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              tx.status === 'confirmed' 
                                ? 'bg-green-50 text-green-700' 
                                : tx.status === 'pending' 
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : 'bg-red-50 text-red-700'
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {typeof tx.timestamp === 'string' 
                            ? format(new Date(tx.timestamp), 'MMM d, yyyy HH:mm')
                            : format(new Date(tx.timestamp), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedTransaction(tx)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Hash</div>
                <div className="col-span-2 font-mono text-xs break-all">{selectedTransaction.hash}</div>
                
                <div className="font-medium">From</div>
                <div className="col-span-2 font-mono text-xs break-all">{selectedTransaction.from_address}</div>
                
                <div className="font-medium">To</div>
                <div className="col-span-2 font-mono text-xs break-all">{selectedTransaction.to_address}</div>
                
                <div className="font-medium">Action</div>
                <div className="col-span-2">{selectedTransaction.action}</div>
                
                <div className="font-medium">Status</div>
                <div className="col-span-2">
                  <Badge
                    variant="outline"
                    className={
                      selectedTransaction.status === 'confirmed' 
                        ? 'bg-green-50 text-green-700' 
                        : selectedTransaction.status === 'pending' 
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                    }
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
                
                <div className="font-medium">Block</div>
                <div className="col-span-2">{selectedTransaction.block_number || 'Pending'}</div>
                
                <div className="font-medium">Date</div>
                <div className="col-span-2">
                  {typeof selectedTransaction.timestamp === 'string'
                    ? format(new Date(selectedTransaction.timestamp), 'PPpp')
                    : format(new Date(selectedTransaction.timestamp), 'PPpp')}
                </div>
              </div>
              
              <div className="pt-4">
                <BlockchainVerification 
                  transactionHash={selectedTransaction.hash} 
                  actionType="delivery"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
