
// User roles
export type UserRole = 'admin' | 'distributor' | 'beneficiary' | 'guest';

// User interface
export interface User {
  id: string;
  name?: string;
  email?: string;
  walletAddress?: string;
  role: UserRole;
  isAuthenticated: boolean;
  govtId?: string; // Add this field to match our usage in AuthContext
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

// Ration types
export interface RationItem {
  id: string;
  name: string;
  category: string;
  unit_of_measure: string;
  quantity_available: number;
  expiry_date?: string;
  image?: string;
}

// Distribution Center
export interface DistributionCenter {
  id: string;
  name: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  capacity: number;
  inCharge: string;
  contactNumber: string;
}

// Beneficiary
export interface Beneficiary {
  id: string;
  name: string;
  walletAddress?: string;
  govtId: string;
  contactNumber: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  familySize: number;
  eligibilityStatus: 'pending' | 'approved' | 'rejected';
  registrationDate: string;
}

// Distributor
export interface Distributor {
  id: string;
  name: string;
  walletAddress?: string;
  govtId: string;
  contactNumber: string;
  assignedCenter: string;
  registrationDate: string;
  status: 'active' | 'inactive';
}

// Distribution
export interface Distribution {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  distributorId: string;
  distributorName: string;
  centerId: string;
  centerName: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  items: DistributionItem[];
  transactionHash?: string;
}

// Distribution Item
export interface DistributionItem {
  rationItemId: string;
  name: string;
  quantity: number;
  received?: boolean;
}

// Blockchain Transaction
export interface BlockchainTransaction {
  id?: string;
  hash: string;
  from_address: string;  // Changed from 'from' to match database schema
  to_address: string;    // Changed from 'to' to match database schema
  value?: string;
  timestamp: number | string;
  status: 'pending' | 'confirmed' | 'failed';
  action: string;       // Changed from 'description' to match database schema
  block_number?: number; // Changed from 'blockNumber' to match database schema
}

// Inventory Transaction
export interface InventoryTransaction {
  id: string;
  rationItemId: string;
  itemName: string;
  quantity: number;
  type: 'inbound' | 'outbound';
  date: string;
  handledBy: string;
  notes?: string;
  transactionHash?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalBeneficiaries: number;
  totalDistributors: number;
  totalDistributions: number;
  pendingDistributions: number;
  completedDistributions: number;
  inventoryItems: number;
  inventoryValue: number;
  lowStockItems: number;
}
