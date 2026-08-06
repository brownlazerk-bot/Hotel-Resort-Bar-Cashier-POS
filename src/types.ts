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
  | 'Apartment Services'
  | 'Other Services';

export type ProductSection = 
  | 'Bar Menu' 
  | 'Kitchen Menu' 
  | 'Swimming Pool' 
  | 'Sauna' 
  | 'Room Services' 
  | 'Apartment Services' 
  | 'Other Services';

export type ItemStatus = 'Available' | 'Out of Stock';

export interface RecipeIngredient {
  id?: string;
  recipeId?: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number; // Required quantity per 1 portion/serving (e.g. 250 g or 0.25 Kg)
  unit: string; // e.g. 'g', 'Kg', 'ml', 'Litre', 'Piece', 'Bottle', 'Can', 'Pack'
  costPerUnit?: number; // Cost in RWF per unit
  wastePercentage?: number; // e.g. 5 (%)
  yieldPercentage?: number; // e.g. 95 (%)
  preparationNotes?: string;
  optional?: boolean;
  active?: boolean;
}

export type KitchenIngredientCategory = 
  | 'Meat & Poultry' 
  | 'Grains & Rice' 
  | 'Vegetables & Produce' 
  | 'Spices & Oils' 
  | 'Dairy & Eggs' 
  | 'Seafood' 
  | 'Beverage Raw Materials'
  | 'Other Raw Materials';

export interface KitchenIngredient {
  id: string; // e.g. "ing-101"
  code?: string;
  name: string; // e.g. "Chicken Meat", "White Rice", "Cooking Oil", "Tomatoes"
  category: KitchenIngredientCategory;
  stockQuantity: number; // Current stock balance in store
  unit: string; // Default store unit (e.g., 'Kg', 'Litre', 'Piece', 'Box', 'Tray')
  purchaseUnit?: string; // e.g. 'Kg', 'Box', 'Litre'
  recipeUnit?: string; // e.g. 'g', 'ml', 'Piece', 'Bottle'
  conversionRate?: number; // e.g. 1000 (1 Kg = 1000 g), 24 (1 Box = 24 Bottles)
  costPerUnit: number; // e.g. 4500 RWF per Kg/unit
  averageCost?: number; // Average purchase cost
  minStockAlert: number; // Low stock alert threshold
  maxStock?: number; // Maximum stock threshold
  storageLocation?: string; // e.g. "Main Cold Room #1", "Kitchen Dry Store"
  expiryDate?: string; // YYYY-MM-DD
  batchNumber?: string;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
  lastRestocked?: string;
  supplier?: string;
  notes?: string;
}

export type StockMovementType = 
  | 'Purchase' 
  | 'Opening Stock' 
  | 'Kitchen Consumption' 
  | 'Recipe Consumption' 
  | 'Stock Adjustment' 
  | 'Waste' 
  | 'Spoilage' 
  | 'Expired Items' 
  | 'Transfer' 
  | 'Production' 
  | 'Return' 
  | 'Supplier Return' 
  | 'Manual Correction' 
  | 'Inventory Count';

export interface StockMovementRecord {
  id: string; // e.g. "MOV-9001"
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  timestamp: string; // ISO string
  ingredientId: string;
  ingredientName: string;
  movementType: StockMovementType;
  quantityIn: number; // 0 if outgoing
  quantityOut: number; // 0 if incoming
  remainingBalance: number;
  unit: string;
  cost: number; // Total value of movement in RWF
  referenceNumber?: string; // e.g., Order ID, KOT ID, PO Number, Waste ID
  recipeId?: string;
  menuItemId?: string;
  menuItemName?: string;
  user: string;
  department: string; // e.g., 'Restaurant POS', 'Bar POS', 'Room Service', 'Kitchen', 'Main Store'
  reason?: string;
  notes?: string;
}

export type WasteType = 
  | 'Burnt' 
  | 'Expired' 
  | 'Broken' 
  | 'Spoiled' 
  | 'Cooking Error' 
  | 'Returned Plate' 
  | 'Over Production';

export interface KitchenWasteRecord {
  id: string; // e.g. "WST-1001"
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  ingredientId: string;
  ingredientName: string;
  wasteType: WasteType;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalCost: number;
  reportedBy: string; // Chef / Staff name
  approvedBy?: string; // Manager / Chef
  reason: string;
  department: string;
  notes?: string;
}

export interface MenuItem {
  id: string;
  code?: string;
  barcode?: string;
  name: string;
  category: Category;
  productSection?: ProductSection;
  foodCategory?: string;
  price: number; // Selling price (RWF)
  costPrice?: number; // Cost price (RWF)
  stockQuantity: number; // Bar Stock (active selling) or Kitchen Stock
  mainStockQuantity?: number; // Main Beverage Stock (warehouse / store)
  unit: string; // e.g. 'Bottle', 'Glass', 'Serving', 'Ticket', 'Cup', 'Shot', 'Portion', 'Pass', 'Hour', 'Service'
  status: ItemStatus;
  active?: boolean;
  image?: string;
  isFood?: boolean;
  prepTime?: string;
  linkedKitchenItem?: string;
  description?: string;
  minStockAlert?: number;
  hasRecipe?: boolean;
  recipe?: RecipeIngredient[];
}

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning' | 'Out of Service';

export interface Table {
  id: string;
  tableNumber: string; // e.g., "T-01" or "1"
  tableName?: string; // Optional e.g., "VIP Corner Booth"
  tableTag: string; // Unique Table Tag e.g. "TB-001"
  capacity: number;
  location?: string; // Indoor, Outdoor, VIP, Poolside, Terrace, Garden, Bar, etc.
  qrCode?: string; // Optional QR code value or URL
  description?: string;
  status: TableStatus;
  active?: boolean; // Active / Deactivated
  currentOrderId?: string;
  assignedWaiterId?: string;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  createdBy?: string;
  updatedBy?: string;
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
    category?: string;
  }[];
  orderTime: string; // ISO string
  status: KitchenTicketStatus;
  specialNotes?: string;
  orderType?: string;
  ticketType?: 'NEW ORDER' | 'UPDATED ORDER' | 'CANCELLED ITEM';
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
  discount: number;
  serviceCharge?: number;
  otherCharges?: number;
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
  type: 'Purchase' | 'Sale' | 'Adjustment' | 'Waste' | 'Damaged' | 'Return' | 'Transfer';
  quantityChange: number; // positive for addition, negative for deduction
  previousStock: number;
  newStock: number;
  sourceLocation?: 'Main Beverage Stock' | 'Bar Stock' | 'Kitchen Stock' | 'Supplier';
  targetLocation?: 'Main Beverage Stock' | 'Bar Stock' | 'Kitchen Stock';
  reason?: string;
  timestamp: string;
  actor: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  category: Category;
  quantity: number;
  unitCost: number;
  totalCost: number;
  destination: 'Main Beverage Stock' | 'Bar Stock' | 'Kitchen Stock';
}

export interface PurchaseOrder {
  id: string; // e.g. "PO-1001"
  poNumber: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  supplierName: string;
  department: 'Bar / Beverage' | 'Kitchen';
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Received' | 'Cancelled';
  paymentStatus: 'Paid' | 'Unpaid';
  createdByName: string;
  receivedAt?: string;
  receivedByName?: string;
  notes?: string;
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
  netRevenue: number;

  // Payment Breakdown
  cashCollected: number;
  cardCollected: number;
  mobileMoneyCollected: number;
  creditCollected: number;
  outstandingRoomCharges: number;
  
  // Expenses & Cash Ledger additions
  totalExpenses?: number;
  netRevenueAfterExpenses?: number;
}

export type ExpenseDepartment = 'Bar' | 'Kitchen' | 'Pool & Sauna' | 'Rooms' | 'Maintenance' | 'Administration' | 'General';

export interface Expense {
  id: string; // e.g. "EXP-1001"
  expenseNumber: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  department: ExpenseDepartment;
  category: string; // e.g. "Purchased Meat", "Purchased Vegetables", "Purchased Drinks", "Generator Fuel", "Electricity", "Water", "Internet", "Repairs", "Staff Lunch", "Transport", "Cleaning Materials"
  description: string;
  requestedBy: string;
  approvedBy: string;
  amount: number;
  reason: string;
  attachmentName?: string;
  shiftId?: string;
}

export type CashMovementType = 
  | 'Opening Cash' 
  | 'Sales Income' 
  | 'Credit Payment Received' 
  | 'Expense Paid' 
  | 'Refund' 
  | 'Closing Cash'
  | 'Manual Adjustment';

export interface CashMovement {
  id: string; // e.g. "CSH-5001"
  timestamp: string; // ISO
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  amount: number; // positive for cash in, negative for cash out
  movementType: CashMovementType;
  reason: string;
  user: string;
  shiftId?: string;
  referenceId?: string; // Order ID, Expense ID, or Shift ID
}

export interface DailyClosingRecord {
  id: string; // e.g. "DCR-1001"
  date: string; // YYYY-MM-DD
  closedAt: string; // ISO
  closedBy: string; // Cashier / Manager
  shiftId: string;
  openingCash: number;
  cashSales: number;
  cardSales: number;
  mobileMoneySales: number;
  creditSales: number;
  expensesTotal: number;
  creditCollectedTotal: number;
  outstandingCredit: number;
  cashDeposited: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  differenceReason?: string;
  approvedBy: string;
  varianceStatus: 'Approved' | 'Pending Review' | 'Rejected';
}

export interface CreditReportItem {
  id: string;
  orderId: string;
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  transactionDate: string; // ISO or YYYY-MM-DD
  dueDate?: string;
  totalBill: number;
  amountPaid: number;
  outstandingBalance: number;
  status: 'Outstanding' | 'Partially Paid' | 'Fully Paid';
  waiterName?: string;
  cashierName?: string;
  department?: string;
  description?: string;
  paymentMethod?: PaymentMethod;
  paymentHistory?: PaymentTransaction[];
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
  pinCode?: string; // 4-digit quick PIN for POS terminal login
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
  category: 'Auth' | 'User Management' | 'Inventory' | 'Sales' | 'System' | 'Reports' | 'Tables';
  details: string;
  timestamp: string;
  ipAddress?: string;
}
