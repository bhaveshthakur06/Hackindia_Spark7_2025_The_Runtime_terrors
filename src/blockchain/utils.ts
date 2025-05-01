import { ethers } from 'ethers';
import { toast } from "sonner";
import { getProvider, getGrainlyContract } from './contracts';
import type { BlockchainTransaction } from '../types';

// Connect wallet
export const connectWallet = async (): Promise<string | null> => {
  try {
    if (!window.ethereum) {
      toast.error("MetaMask or an Ethereum wallet is required");
      return null;
    }
    
    const provider = getProvider();
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    
    if (accounts.length > 0) {
      toast.success("Wallet connected successfully");
      return accounts[0];
    }
    return null;
  } catch (error) {
    console.error("Error connecting wallet:", error);
    toast.error("Failed to connect wallet");
    return null;
  }
};

// Get wallet balance
export const getWalletBalance = async (address: string): Promise<string> => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return "0.0";
  }
};

// Get wallet network
export const getNetworkName = async (): Promise<string> => {
  try {
    const provider = getProvider();
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
    
    return networks[network.chainId] || `Chain ID: ${network.chainId}`;
  } catch (error) {
    console.error("Error getting network:", error);
    return "Unknown Network";
  }
};

// Register beneficiary on blockchain
export const registerBeneficiary = async (
  beneficiaryAddress: string,
  govtId: string,
  familySize: number
): Promise<BlockchainTransaction | null> => {
  try {
    const contract = getGrainlyContract(true);
    
    const tx = await contract.registerBeneficiary(
      beneficiaryAddress,
      govtId,
      familySize
    );
    
    toast.info("Registration submitted. Please wait for confirmation...");
    
    const receipt = await tx.wait();
    
    const transaction: BlockchainTransaction = {
      hash: receipt.transactionHash,
      from: receipt.from,
      to: receipt.to,
      timestamp: Math.floor(Date.now() / 1000),
      status: 'confirmed',
      description: 'Beneficiary Registration',
      blockNumber: receipt.blockNumber
    };
    
    toast.success("Beneficiary registered successfully");
    return transaction;
  } catch (error) {
    console.error("Error registering beneficiary:", error);
    toast.error("Failed to register beneficiary");
    return null;
  }
};

// Register distributor on blockchain
export const registerDistributor = async (
  distributorAddress: string,
  govtId: string,
  center: string
): Promise<BlockchainTransaction | null> => {
  try {
    const contract = getGrainlyContract(true);
    
    const tx = await contract.registerDistributor(
      distributorAddress,
      govtId,
      center
    );
    
    toast.info("Registration submitted. Please wait for confirmation...");
    
    const receipt = await tx.wait();
    
    const transaction: BlockchainTransaction = {
      hash: receipt.transactionHash,
      from: receipt.from,
      to: receipt.to,
      timestamp: Math.floor(Date.now() / 1000),
      status: 'confirmed',
      description: 'Distributor Registration',
      blockNumber: receipt.blockNumber
    };
    
    toast.success("Distributor registered successfully");
    return transaction;
  } catch (error) {
    console.error("Error registering distributor:", error);
    toast.error("Failed to register distributor");
    return null;
  }
};

// Allocate to distributor
export const allocateToDistributor = async (
  distributorAddress: string,
  amount: number
): Promise<BlockchainTransaction | null> => {
  try {
    const contract = getGrainlyContract(true);
    
    const tx = await contract.allocateToDistributor(
      distributorAddress,
      amount
    );
    
    toast.info("Allocation submitted. Please wait for confirmation...");
    
    const receipt = await tx.wait();
    
    const transaction: BlockchainTransaction = {
      hash: receipt.transactionHash,
      from: receipt.from,
      to: receipt.to,
      timestamp: Math.floor(Date.now() / 1000),
      status: 'confirmed',
      description: `Allocated ${amount} units to distributor`,
      blockNumber: receipt.blockNumber
    };
    
    toast.success("Allocation completed successfully");
    return transaction;
  } catch (error) {
    console.error("Error allocating to distributor:", error);
    toast.error("Failed to allocate to distributor");
    return null;
  }
};

// Schedule distribution
export const scheduleDistribution = async (
  beneficiaryAddress: string,
  amount: number,
  rationId: string
): Promise<BlockchainTransaction | null> => {
  try {
    const contract = getGrainlyContract(true);
    
    const tx = await contract.scheduleDistribution(
      beneficiaryAddress,
      amount,
      rationId
    );
    
    toast.info("Distribution scheduling submitted. Please wait for confirmation...");
    
    const receipt = await tx.wait();
    
    const transaction: BlockchainTransaction = {
      hash: receipt.transactionHash,
      from: receipt.from,
      to: receipt.to,
      timestamp: Math.floor(Date.now() / 1000),
      status: 'confirmed',
      description: `Scheduled distribution for beneficiary`,
      blockNumber: receipt.blockNumber
    };
    
    toast.success("Distribution scheduled successfully");
    return transaction;
  } catch (error) {
    console.error("Error scheduling distribution:", error);
    toast.error("Failed to schedule distribution");
    return null;
  }
};

// Complete distribution with location verification
export const completeDistribution = async (
  rationId: string,
  locationHash: string
): Promise<BlockchainTransaction | null> => {
  try {
    const contract = getGrainlyContract(true);
    
    const tx = await contract.completeDistribution(
      rationId,
      locationHash
    );
    
    toast.info("Distribution completion submitted. Please wait for confirmation...");
    
    const receipt = await tx.wait();
    
    const transaction: BlockchainTransaction = {
      hash: receipt.transactionHash,
      from: receipt.from,
      to: receipt.to,
      timestamp: Math.floor(Date.now() / 1000),
      status: 'confirmed',
      description: 'Distribution completed',
      blockNumber: receipt.blockNumber
    };
    
    toast.success("Distribution completed successfully");
    return transaction;
  } catch (error) {
    console.error("Error completing distribution:", error);
    toast.error("Failed to complete distribution");
    return null;
  }
};

// Generate location hash for geo-verification
export const generateLocationHash = (latitude: number, longitude: number): string => {
  // Simple location hashing, in production use a proper geohash library
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['int256', 'int256'],
      [Math.round(latitude * 1000000), Math.round(longitude * 1000000)]
    )
  );
};

// Get user role from blockchain
export const getUserRole = async (address: string): Promise<string> => {
  try {
    // In a real application, this would query a smart contract
    // For now, we'll simulate different roles based on address
    
    // Convert address to lowercase for consistency
    const lowerAddress = address.toLowerCase();
    
    // Last character of address for deterministic role assignment
    const lastChar = lowerAddress.charAt(lowerAddress.length - 1);
    
    // Assign roles based on address (simulated)
    if (['0', '1', '2'].includes(lastChar)) {
      return 'admin';
    } else if (['3', '4', '5', '6'].includes(lastChar)) {
      return 'distributor';
    } else {
      return 'beneficiary';
    }
  } catch (error) {
    console.error("Error getting user role:", error);
    return 'guest';
  }
};
