
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { toast } from "sonner";
import { BlockchainTransaction } from '../types';
import { getProvider, isWalletConnected, getConnectedAddress } from '../blockchain/contracts';
import { blockchainTransactions as mockTransactions } from '../mock/data';

interface BlockchainContextType {
  walletConnected: boolean;
  walletAddress: string | null;
  balance: string;
  networkName: string;
  connectWallet: () => Promise<string | null>;
  transactions: BlockchainTransaction[];
  addTransaction: (tx: BlockchainTransaction) => void;
  isLoading: boolean;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0.0');
  const [networkName, setNetworkName] = useState<string>('Unknown Network');
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial check for connected wallet
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const connected = await isWalletConnected();
        setWalletConnected(connected);
        
        if (connected) {
          const address = await getConnectedAddress();
          setWalletAddress(address);
          
          // Get wallet balance
          if (address) {
            const provider = getProvider();
            const balance = await provider.getBalance(address);
            setBalance(ethers.utils.formatEther(balance));
            
            // Get network
            const network = await provider.getNetwork();
            const networks: Record<number, string> = {
              1: "Ethereum Mainnet",
              3: "Ropsten Testnet",
              4: "Rinkeby Testnet",
              5: "Goerli Testnet",
              42: "Kovan Testnet",
              56: "Binance Smart Chain",
              137: "Polygon Mainnet",
              80001: "Mumbai Testnet",
              31337: "Hardhat Local",
              1337: "Local Network",
            };
            
            setNetworkName(networks[network.chainId] || `Chain ID: ${network.chainId}`);
          }
        }
        
        // Load mock transactions for now
        setTransactions(mockTransactions);
        
      } catch (error) {
        console.error('Error checking wallet:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkWallet();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          setWalletConnected(false);
          setWalletAddress(null);
          setBalance('0.0');
        } else {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
          
          // Get wallet balance
          const provider = getProvider();
          const balance = await provider.getBalance(accounts[0]);
          setBalance(ethers.utils.formatEther(balance));
        }
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // Connect wallet function
  const connectWallet = async (): Promise<string | null> => {
    try {
      if (!window.ethereum) {
        toast.error("MetaMask or an Ethereum wallet is required");
        return null;
      }
      
      setIsLoading(true);
      
      const provider = getProvider();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletConnected(true);
        setWalletAddress(address);
        
        // Get wallet balance
        const balance = await provider.getBalance(address);
        setBalance(ethers.utils.formatEther(balance));
        
        // Get network
        const network = await provider.getNetwork();
        const networks: Record<number, string> = {
          1: "Ethereum Mainnet",
          3: "Ropsten Testnet",
          4: "Rinkeby Testnet", 
          5: "Goerli Testnet",
          42: "Kovan Testnet",
          56: "Binance Smart Chain",
          137: "Polygon Mainnet",
          80001: "Mumbai Testnet",
          31337: "Hardhat Local",
          1337: "Local Network",
        };
        
        setNetworkName(networks[network.chainId] || `Chain ID: ${network.chainId}`);
        
        toast.success("Wallet connected successfully");
        return address;
      }
      
      return null;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error("Failed to connect wallet");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a transaction to the list
  const addTransaction = (tx: BlockchainTransaction) => {
    setTransactions(prevTransactions => [tx, ...prevTransactions]);
  };

  return (
    <BlockchainContext.Provider
      value={{
        walletConnected,
        walletAddress,
        balance,
        networkName,
        connectWallet,
        transactions,
        addTransaction,
        isLoading
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  
  return context;
}
