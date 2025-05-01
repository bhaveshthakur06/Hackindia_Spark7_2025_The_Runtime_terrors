
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
  unitOfMeasure: string;
  quantityAvailable: number;
  expiryDate?: string;
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
  hash: string;
  from: string;
  to: string;
  value?: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  description: string;
  blockNumber?: number;
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
