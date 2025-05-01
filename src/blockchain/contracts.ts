
import { ethers } from 'ethers';

// ABI for our GrainLy Distribution contract
export const GrainlyDistributionABI = [
  // Read functions
  "function getRoleFor(address user) external view returns (string memory)",
  "function getBeneficiaryAllocation(address beneficiary) external view returns (uint256)",
  "function getDistributorInventory(address distributor) external view returns (uint256)",
  "function isApprovedBeneficiary(address beneficiary) external view returns (bool)",
  "function isApprovedDistributor(address distributor) external view returns (bool)",
  
  // Write functions
  "function registerBeneficiary(address beneficiary, string memory govtId, uint256 familySize) external",
  "function approveBeneficiary(address beneficiary) external",
  "function registerDistributor(address distributor, string memory govtId, string memory center) external",
  "function approveDistributor(address distributor) external",
  "function allocateToDistributor(address distributor, uint256 amount) external",
  "function scheduleDistribution(address beneficiary, uint256 amount, string memory rationId) external",
  "function completeDistribution(string memory rationId, string memory locationHash) external",
  
  // Events
  "event BeneficiaryRegistered(address indexed beneficiary, string govtId, uint256 timestamp)",
  "event DistributorRegistered(address indexed distributor, string govtId, string center, uint256 timestamp)",
  "event AllocationAdded(address indexed distributor, uint256 amount, uint256 timestamp)",
  "event DistributionScheduled(address indexed beneficiary, address indexed distributor, uint256 amount, string rationId, uint256 timestamp)",
  "event DistributionCompleted(string rationId, string locationHash, uint256 timestamp)"
];

// Mock contract address - in a real app you'd deploy your contract first and use its address
export const GRAINLY_CONTRACT_ADDRESS = "0x8942595A2dC5181Df0465AF0D7be08c8f23C93af";

// Get Ethereum provider
export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  
  // Fallback to a read-only provider
  return new ethers.providers.JsonRpcProvider(
    "https://mainnet.infura.io/v3/your-infura-id"
  );
};

// Get GrainLy Distribution contract instance
export const getGrainlyContract = (withSigner = false) => {
  const provider = getProvider();
  
  if (withSigner) {
    const signer = provider.getSigner();
    return new ethers.Contract(GRAINLY_CONTRACT_ADDRESS, GrainlyDistributionABI, signer);
  }
  
  return new ethers.Contract(GRAINLY_CONTRACT_ADDRESS, GrainlyDistributionABI, provider);
};

// Check if a wallet is connected
export const isWalletConnected = async () => {
  try {
    const provider = getProvider();
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  } catch (error) {
    console.error("Error checking wallet connection:", error);
    return false;
  }
};

// Get connected wallet address
export const getConnectedAddress = async () => {
  try {
    const provider = getProvider();
    const accounts = await provider.listAccounts();
    return accounts[0];
  } catch (error) {
    console.error("Error getting connected address:", error);
    return null;
  }
};

// Get user role from contract
export const getUserRole = async (address: string): Promise<string> => {
  try {
    const contract = getGrainlyContract();
    const role = await contract.getRoleFor(address);
    return role.toLowerCase();
  } catch (error) {
    console.error("Error getting user role:", error);
    return 'guest';
  }
};
