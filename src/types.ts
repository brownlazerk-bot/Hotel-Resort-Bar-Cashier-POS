export type Category = 
  | 'Beers'
  | 'Soft Drinks'
  | 'Wines'
  | 'Whisky'
  | 'Cocktails'
  | 'Juices'
  | 'Water'
  | 'Coffee'
  | 'Tea'
  | 'Food'
  | 'Pool Services'
  | 'Sauna Services'
  | 'Room Services'
  | 'Apartment Services';

export type ItemStatus = 'Available' | 'Out of Stock';

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  stockQuantity: number;
  unit: string; // e.g. 'Bottle', 'Glass', 'Serving', 'Ticket', 'Cup', 'Shot', 'Portion'
  status: ItemStatus;
  image?: string;
  isFood?: boolean;
  minStockAlert?: number;
}

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning';

export interface Table {
  id: string;
  tableNumber: string; // e.g., "T-01"
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  assignedWaiterId?: string;
}

export interface Waiter {
  id: string;
  name: string;
  employeeId: string;
  phone: string;
  shift: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  active: boolean;
}

export type KitchenTicketStatus = 'Pending' | 'Preparing' | 'Ready' | 'Served';

export interface KitchenTicket {
  id: string; // e.g., "KOT-1001"
  orderId: string;
  tableNumber: string;
  waiterName: string;
  customerName?: string;
  items: {
    itemId: string;
    name: string;
    quantity: number;
    notes?: string;
  }[];
  orderTime: string; // ISO string
  status: KitchenTicketStatus;
  specialNotes?: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  category: Category;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  isFood?: boolean;
  notes?: string;
}

export type PaymentMethod = 'Cash' | 'Card' | 'Mobile Money' | 'Room Charge' | 'Apartment Charge' | 'Credit' | 'Mixed';

export type OrderStatus = 
  | 'Pending' 
  | 'Preparing' 
  | 'Ready' 
  | 'Served' 
  | 'Waiting for Payment' 
  | 'Partially Paid' 
  | 'Paid' 
  | 'Credit' 
  | 'Cancelled';

export type PaymentStatus = 'PAID' | 'PARTIALLY PAID' | 'UNPAID' | 'CREDIT';

export interface GuestRoom {
  id: string;
  type: 'Room' | 'Apartment';
  number: string; // e.g. "Room 104" or "Apt B2"
  guestName: string;
  checkInDate: string;
  status: 'Occupied' | 'Vacant';
  balance: number;
}

export interface PaymentTransaction {
  id: string;
  timestamp: string;
  amount: number;
  method: PaymentMethod;
  cashierName: string;
  note?: string;
  cashPaid?: number;
  changeGiven?: number;
}

export interface PaymentDetails {
  method: PaymentMethod;
  cashPaid?: number;
  cardPaid?: number;
  mobileMoneyPaid?: number;
  roomChargeAmount?: number;
  selectedRoomId?: string;
  roomOrAptNumber?: string;
  guestName?: string;
  guestPhone?: string;
  changeGiven?: number;
  referenceNumber?: string;
}

export interface Order {
  id: string; // e.g., "ORD-8821"
  orderNumber?: string;
  tableId?: string;
  tableNumber?: string;
  waiterId: string;
  waiterName: string;
  customerName?: string;
  customerPhone?: string;
  guestRoomId?: string;
  servicesIncluded: string[]; // e.g., ['Drinks', 'Food', 'Pool', 'Sauna', 'Rooms']
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  balance: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentDetails?: PaymentDetails;
  paymentHistory?: PaymentTransaction[];
  createdAt: string; // ISO
  paidAt?: string; // ISO
  shiftId: string;
  cashierName: string;
  kotGenerated?: boolean;
  kotId?: string;
}

export interface StockAdjustmentLog {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Purchase' | 'Sale' | 'Adjustment' | 'Waste' | 'Damaged';
  quantityChange: number; // positive for addition, negative for deduction
  previousStock: number;
  newStock: number;
  reason?: string;
  timestamp: string;
  actor: string;
}

export interface Shift {
  id: string;
  cashierName: string;
  cashierId: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  closingCashExpected?: number;
  closingCashActual?: number;
  difference?: number; // Actual - Expected
  status: 'Open' | 'Closed';
  notes?: string;
}

export interface DailyReportData {
  date: string; // YYYY-MM-DD
  generatedAt: string;
  cashierName: string;
  
  // Bar metrics
  totalDrinkSales: number;
  drinksSoldQty: number;
  bestSellingDrinks: { name: string; qty: number; revenue: number }[];
  currentStockValue: number;
  lowStockItemsCount: number;

  // Food metrics
  totalFoodOrders: number;
  foodRevenue: number;

  // Pool metrics
  poolRevenue: number;
  poolVisitorsCount: number;

  // Sauna metrics
  saunaRevenue: number;
  saunaVisitorsCount: number;

  // Hotel charges
  roomRevenue: number;
  apartmentRevenue: number;

  // Total summary
  totalOrders: number;
  paidOrdersCount: number;
  unpaidOrdersCount: number;
  creditOrdersCount: number;
  partialPaymentsTotal: number;
  outstandingBalanceTotal: number;
  totalTransactions: number;
  grossRevenue: number;
  discounts: number;
  taxes: number;
  netRevenue: number;

  // Payment Breakdown
  cashCollected: number;
  cardCollected: number;
  mobileMoneyCollected: number;
  creditCollected: number;
  outstandingRoomCharges: number;
}

export type SystemRole = 
  | 'Super Admin'
  | 'Admin'
  | 'Manager'
  | 'Cashier'
  | 'Kitchen'
  | 'Storekeeper'
  | 'Receptionist'
  | 'Accountant'
  | 'Housekeeping'
  | 'Waiter';

export type UserRole = SystemRole;

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: SystemRole;
  status: 'Active' | 'Inactive' | 'Suspended';
  passwordHash: string;
  createdAt: string;
  lastLoginAt?: string;
  isSuperAdmin?: boolean; // Hidden internal system marker
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  action: string;
  category: 'Auth' | 'User Management' | 'Inventory' | 'Sales' | 'System' | 'Reports';
  details: string;
  timestamp: string;
  ipAddress?: string;
}
