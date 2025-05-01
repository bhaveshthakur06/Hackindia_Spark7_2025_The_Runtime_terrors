
import { 
  RationItem, 
  Beneficiary, 
  Distributor, 
  Distribution, 
  DistributionCenter,
  InventoryTransaction,
  BlockchainTransaction,
  DashboardStats,
 } from '../types/index.ts';

// Mock Ration Items
export const rationItems: RationItem[] = [
  {
    id: '1',
    name: 'Rice',
    category: 'Grains',
    unit_of_measure: 'kg',
    quantity_available: 5000,
    expiry_date: '2025-12-01',
    image: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'Wheat Flour',
    category: 'Grains',
    unit_of_measure: 'kg',
    quantity_available: 3200,
    expiry_date: '2025-11-15',
    image: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'Sugar',
    category: 'Essentials',
    unit_of_measure: 'kg',
    quantity_available: 1800,
    expiry_date: '2025-10-20',
    image: '/placeholder.svg'
  },
  {
    id: '4',
    name: 'Cooking Oil',
    category: 'Essentials',
    unit_of_measure: 'liter',
    quantity_available: 2500,
    expiry_date: '2025-09-10',
    image: '/placeholder.svg'
  },
  {
    id: '5',
    name: 'Lentils',
    category: 'Proteins',
    unit_of_measure: 'kg',
    quantity_available: 1500,
    expiry_date: '2025-08-15',
    image: '/placeholder.svg'
  }
];

// Mock Distribution Centers
export const distributionCenters: DistributionCenter[] = [
  {
    id: '1',
    name: 'Central Distribution Center',
    location: 'New York City, NY',
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    capacity: 10000,
    inCharge: 'John Smith',
    contactNumber: '555-1234'
  },
  {
    id: '2',
    name: 'Eastern Regional Center',
    location: 'Boston, MA',
    coordinates: {
      latitude: 42.3601,
      longitude: -71.0589
    },
    capacity: 7500,
    inCharge: 'Emily Johnson',
    contactNumber: '555-2345'
  },
  {
    id: '3',
    name: 'Western Distribution Hub',
    location: 'San Francisco, CA',
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    capacity: 8500,
    inCharge: 'Michael Brown',
    contactNumber: '555-3456'
  }
];

// Mock Beneficiaries
export const beneficiaries: Beneficiary[] = [
  {
    id: '1',
    name: 'Sarah Wilson',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    govtId: 'SSN-123-45-6789',
    contactNumber: '555-7890',
    location: 'Brooklyn, NY',
    coordinates: {
      latitude: 40.6782,
      longitude: -73.9442
    },
    familySize: 4,
    eligibilityStatus: 'approved',
    registrationDate: '2025-04-01'
  },
  {
    id: '2',
    name: 'David Martinez',
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    govtId: 'SSN-234-56-7890',
    contactNumber: '555-8901',
    location: 'Queens, NY',
    coordinates: {
      latitude: 40.7282,
      longitude: -73.7949
    },
    familySize: 3,
    eligibilityStatus: 'approved',
    registrationDate: '2025-04-02'
  },
  {
    id: '3',
    name: 'Jennifer Thompson',
    govtId: 'SSN-345-67-8901',
    contactNumber: '555-9012',
    location: 'Bronx, NY',
    coordinates: {
      latitude: 40.8448,
      longitude: -73.8648
    },
    familySize: 5,
    eligibilityStatus: 'pending',
    registrationDate: '2025-04-10'
  },
  {
    id: '4',
    name: 'Robert Garcia',
    govtId: 'SSN-456-78-9012',
    contactNumber: '555-0123',
    location: 'Manhattan, NY',
    familySize: 2,
    eligibilityStatus: 'approved',
    registrationDate: '2025-04-05'
  },
  {
    id: '5',
    name: 'Lisa Johnson',
    govtId: 'SSN-567-89-0123',
    contactNumber: '555-1234',
    location: 'Staten Island, NY',
    familySize: 6,
    eligibilityStatus: 'rejected',
    registrationDate: '2025-04-08'
  }
];

// Mock Distributors
export const distributors: Distributor[] = [
  {
    id: '1',
    name: 'James Anderson',
    walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
    govtId: 'EMP-123-45-6789',
    contactNumber: '555-2345',
    assignedCenter: 'Central Distribution Center',
    registrationDate: '2025-03-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Maria Rodriguez',
    walletAddress: '0xfedcba9876543210fedcba9876543210fedcba98',
    govtId: 'EMP-234-56-7890',
    contactNumber: '555-3456',
    assignedCenter: 'Eastern Regional Center',
    registrationDate: '2025-03-20',
    status: 'active'
  },
  {
    id: '3',
    name: 'Thomas Wilson',
    govtId: 'EMP-345-67-8901',
    contactNumber: '555-4567',
    assignedCenter: 'Western Distribution Hub',
    registrationDate: '2025-03-25',
    status: 'inactive'
  }
];

// Mock Distributions
export const distributions: Distribution[] = [
  {
    id: '1',
    beneficiaryId: '1',
    beneficiaryName: 'Sarah Wilson',
    distributorId: '1',
    distributorName: 'James Anderson',
    centerId: '1',
    centerName: 'Central Distribution Center',
    date: '2025-05-05',
    status: 'completed',
    items: [
      { rationItemId: '1', name: 'Rice', quantity: 5, received: true },
      { rationItemId: '3', name: 'Sugar', quantity: 2, received: true },
      { rationItemId: '4', name: 'Cooking Oil', quantity: 2, received: true }
    ],
    transactionHash: '0xabc123def456ghi789jkl123mno456pqr789stu123vwx456yz789abc123'
  },
  {
    id: '2',
    beneficiaryId: '2',
    beneficiaryName: 'David Martinez',
    distributorId: '1',
    distributorName: 'James Anderson',
    centerId: '1',
    centerName: 'Central Distribution Center',
    date: '2025-05-06',
    status: 'scheduled',
    items: [
      { rationItemId: '1', name: 'Rice', quantity: 4 },
      { rationItemId: '2', name: 'Wheat Flour', quantity: 3 },
      { rationItemId: '5', name: 'Lentils', quantity: 2 }
    ]
  },
  {
    id: '3',
    beneficiaryId: '4',
    beneficiaryName: 'Robert Garcia',
    distributorId: '2',
    distributorName: 'Maria Rodriguez',
    centerId: '2',
    centerName: 'Eastern Regional Center',
    date: '2025-05-07',
    status: 'pending',
    items: [
      { rationItemId: '1', name: 'Rice', quantity: 3 },
      { rationItemId: '4', name: 'Cooking Oil', quantity: 1 }
    ]
  },
  {
    id: '4',
    beneficiaryId: '1',
    beneficiaryName: 'Sarah Wilson',
    distributorId: '1',
    distributorName: 'James Anderson',
    centerId: '1',
    centerName: 'Central Distribution Center',
    date: '2025-05-10',
    status: 'scheduled',
    items: [
      { rationItemId: '2', name: 'Wheat Flour', quantity: 5 },
      { rationItemId: '5', name: 'Lentils', quantity: 3 }
    ]
  }
];

// Mock Inventory Transactions
export const inventoryTransactions: InventoryTransaction[] = [
  {
    id: '1',
    rationItemId: '1',
    itemName: 'Rice',
    quantity: 1000,
    type: 'inbound',
    date: '2025-04-10',
    handledBy: 'Admin',
    notes: 'Initial stock',
    transactionHash: '0x123abc456def789ghi123jkl456mno789pqr123stu456vwx789yz123abc456'
  },
  {
    id: '2',
    rationItemId: '2',
    itemName: 'Wheat Flour',
    quantity: 800,
    type: 'inbound',
    date: '2025-04-10',
    handledBy: 'Admin',
    notes: 'Initial stock',
    transactionHash: '0x456def789ghi123jkl456mno789pqr123stu456vwx789yz123abc456def789'
  },
  {
    id: '3',
    rationItemId: '1',
    itemName: 'Rice',
    quantity: 50,
    type: 'outbound',
    date: '2025-05-01',
    handledBy: 'James Anderson',
    notes: 'For Distribution #1',
    transactionHash: '0x789ghi123jkl456mno789pqr123stu456vwx789yz123abc456def789ghi123'
  },
  {
    id: '4',
    rationItemId: '3',
    itemName: 'Sugar',
    quantity: 500,
    type: 'inbound',
    date: '2025-04-15',
    handledBy: 'Admin',
    notes: 'Weekly supply',
    transactionHash: '0x321cba654fed987ihg654jkl321onm987rqp654uts321xwv987zyx654cba321'
  }
];

// Mock Blockchain Transactions
export const blockchainTransactions: BlockchainTransaction[] = [
  {
    hash: '0xabc123def456ghi789jkl123mno456pqr789stu123vwx456yz789abc123',
    from_address: '0x1234567890abcdef1234567890abcdef12345678',
    to_address: '0x9876543210fedcba9876543210fedcba98765432',
    timestamp: 1682899200, // 2023-05-01
    status: 'confirmed',
    action: 'Distribution Completed',
    block_number: 14567890
  },
  {
    hash: '0x123abc456def789ghi123jkl456mno789pqr123stu456vwx789yz123abc456',
    from_address: '0x0000000000000000000000000000000000000000',
    to_address: '0x1234567890abcdef1234567890abcdef12345678',
    timestamp: 1681516800, // 2023-04-15
    status: 'confirmed',
    action: 'Inventory Addition',
    block_number: 14560001
  },
  {
    hash: '0x456def789ghi123jkl456mno789pqr123stu456vwx789yz123abc456def789',
    from_address: '0x9876543210fedcba9876543210fedcba98765432',
    to_address: '0x1234567890abcdef1234567890abcdef12345678',
    timestamp: 1682467200, // 2023-04-26
    status: 'confirmed',
    action: 'Beneficiary Registration',
    block_number: 14564532
  },
  {
    hash: '0x789ghi123jkl456mno789pqr123stu456vwx789yz123abc456def789ghi123',
    from_address: '0x9876543210fedcba9876543210fedcba98765432',
    to_address: '0xabcdef1234567890abcdef1234567890abcdef12',
    timestamp: 1682812800, // 2023-04-30
    status: 'pending',
    action: 'Distribution Scheduled',
    block_number: 14567123
  }
];

// Mock Dashboard Stats
export const dashboardStats: DashboardStats = {
  totalBeneficiaries: 5,
  totalDistributors: 3,
  totalDistributions: 4,
  pendingDistributions: 1,
  completedDistributions: 1,
  inventoryItems: 5,
  inventoryValue: 25000,
  lowStockItems: 1
};
