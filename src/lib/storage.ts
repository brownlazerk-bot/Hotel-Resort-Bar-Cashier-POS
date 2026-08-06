import { 
  MenuItem, Table, Waiter, Order, KitchenTicket, 
  StockAdjustmentLog, Shift, GuestRoom, AppUser, AuditLog,
  Expense, CashMovement, DailyClosingRecord, PurchaseOrder, KitchenIngredient,
  StockMovementRecord, KitchenWasteRecord
} from '../types';
import { 
  INITIAL_MENU_ITEMS, INITIAL_TABLES, INITIAL_WAITERS, 
  INITIAL_GUEST_ROOMS, INITIAL_ORDERS, INITIAL_KITCHEN_TICKETS,
  INITIAL_PURCHASE_ORDERS, INITIAL_KITCHEN_INGREDIENTS
} from '../data/mockData';

const KEYS = {
  PROD_INIT: 'hotel_prod_v1_init',
  MENU_ITEMS: 'hotel_menu_items_prod',
  TABLES: 'hotel_tables_prod',
  WAITERS: 'hotel_waiters_prod',
  ORDERS: 'hotel_orders_prod',
  KITCHEN_TICKETS: 'hotel_kitchen_tickets_prod',
  STOCK_LOGS: 'hotel_stock_logs_prod',
  SHIFTS: 'hotel_shifts_prod',
  CURRENT_SHIFT: 'hotel_current_shift_prod',
  GUEST_ROOMS: 'hotel_guest_rooms_prod',
  USERS: 'hotel_users_prod',
  AUDIT_LOGS: 'hotel_audit_logs_prod',
  CURRENT_USER: 'hotel_current_user_session',
  EXPENSES: 'hotel_expenses_prod',
  CASH_MOVEMENTS: 'hotel_cash_movements_prod',
  DAILY_CLOSINGS: 'hotel_daily_closings_prod',
  PURCHASE_ORDERS: 'hotel_purchase_orders_prod',
  KITCHEN_INGREDIENTS: 'hotel_kitchen_ingredients_prod',
  STOCK_MOVEMENT_RECORDS: 'hotel_stock_movement_records_prod',
  KITCHEN_WASTE_RECORDS: 'hotel_kitchen_waste_records_prod',
};

export const SUPER_ADMIN_CREDENTIALS: AppUser = {
  id: 'super-admin-internal-01',
  fullName: 'System Owner',
  email: 'yuskar@gmail.com',
  phone: '+250 780 000 000',
  role: 'Super Admin',
  status: 'Active',
  passwordHash: 'Pksquare@1',
  createdAt: new Date().toISOString(),
  isSuperAdmin: true
};

// Ensure database starts completely empty for production
function initializeCleanSlateIfNeeded() {
  try {
    const isInit = localStorage.getItem(KEYS.PROD_INIT);
    if (!isInit) {
      // Clear legacy sample keys
      localStorage.removeItem('bar_pos_menu_items');
      localStorage.removeItem('bar_pos_tables');
      localStorage.removeItem('bar_pos_waiters');
      localStorage.removeItem('bar_pos_orders_v2');
      localStorage.removeItem('bar_pos_kitchen_tickets_v2');
      localStorage.removeItem('bar_pos_stock_logs');
      localStorage.removeItem('bar_pos_shifts');
      localStorage.removeItem('bar_pos_current_shift');
      localStorage.removeItem('bar_pos_guest_rooms');

      // Set clean empty defaults
      localStorage.setItem(KEYS.MENU_ITEMS, JSON.stringify([]));
      localStorage.setItem(KEYS.TABLES, JSON.stringify([]));
      localStorage.setItem(KEYS.WAITERS, JSON.stringify([]));
      localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
      localStorage.setItem(KEYS.KITCHEN_TICKETS, JSON.stringify([]));
      localStorage.setItem(KEYS.STOCK_LOGS, JSON.stringify([]));
      localStorage.setItem(KEYS.SHIFTS, JSON.stringify([]));
      localStorage.setItem(KEYS.GUEST_ROOMS, JSON.stringify([]));
      localStorage.setItem(KEYS.USERS, JSON.stringify([]));
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify([]));
      
      localStorage.setItem(KEYS.PROD_INIT, 'true');
    }
  } catch (err) {
    console.error('Error initializing clean slate:', err);
  }
}

initializeCleanSlateIfNeeded();

// Safe JSON parse
function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

import { notifyDataChange } from './syncEngine';
import { pushKeyToServer } from './serverSync';
import { getSupabaseClient } from './supabaseSync';

const LOCAL_TO_SERVER_KEY: Record<string, string> = {
  [KEYS.MENU_ITEMS]: 'menuItems',
  [KEYS.TABLES]: 'tables',
  [KEYS.WAITERS]: 'waiters',
  [KEYS.ORDERS]: 'orders',
  [KEYS.KITCHEN_TICKETS]: 'kitchenTickets',
  [KEYS.STOCK_LOGS]: 'stockLogs',
  [KEYS.SHIFTS]: 'shifts',
  [KEYS.CURRENT_SHIFT]: 'currentShift',
  [KEYS.GUEST_ROOMS]: 'guestRooms',
  [KEYS.USERS]: 'users',
  [KEYS.AUDIT_LOGS]: 'auditLogs',
  [KEYS.EXPENSES]: 'expenses',
  [KEYS.CASH_MOVEMENTS]: 'cashMovements',
  [KEYS.DAILY_CLOSINGS]: 'dailyClosings',
  [KEYS.PURCHASE_ORDERS]: 'purchaseOrders',
};

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyDataChange(key);
    
    // Asynchronously push to central Express backend server for cross-device sync (HP, Dell, Phone)
    const serverKey = LOCAL_TO_SERVER_KEY[key];
    if (serverKey) {
      pushKeyToServer(serverKey, value);

      // Also auto-push to Supabase Cloud if configured
      const client = getSupabaseClient();
      if (client) {
        Promise.resolve(
          client.from('hotel_store').upsert([{
            key: serverKey,
            data: value,
            updated_at: new Date().toISOString()
          }], { onConflict: 'key' })
        ).catch(() => {});
      }
    }
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export function loadMenuItems(): MenuItem[] {
  return getStorage<MenuItem[]>(KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS);
}

export function saveMenuItems(items: MenuItem[]): void {
  setStorage(KEYS.MENU_ITEMS, items);
}

export function loadTables(): Table[] {
  return getStorage<Table[]>(KEYS.TABLES, INITIAL_TABLES);
}

export function saveTables(tables: Table[]): void {
  setStorage(KEYS.TABLES, tables);
}

export function loadWaiters(): Waiter[] {
  const customWaiters = getStorage<Waiter[]>(KEYS.WAITERS, INITIAL_WAITERS);
  let users: AppUser[] = [];
  try {
    users = loadUsers();
  } catch (err) {
    users = [];
  }

  const waiterUsers = users.filter(u => u.role === 'Waiter' && u.status === 'Active');
  const combined = [...customWaiters];

  waiterUsers.forEach(u => {
    const existingIndex = combined.findIndex(
      w => w.id === u.id || w.name.toLowerCase() === u.fullName.toLowerCase()
    );
    if (existingIndex === -1) {
      combined.push({
        id: u.id,
        name: u.fullName,
        employeeId: u.pinCode ? `PIN-${u.pinCode}` : `W-${u.id.slice(-4)}`,
        phone: u.phone || '+250 780 000 000',
        shift: 'Morning',
        active: true
      });
    }
  });

  return combined;
}

export function saveWaiters(waiters: Waiter[]): void {
  setStorage(KEYS.WAITERS, waiters);
}

export function loadOrders(): Order[] {
  return getStorage<Order[]>(KEYS.ORDERS, INITIAL_ORDERS);
}

export function saveOrders(orders: Order[]): void {
  setStorage(KEYS.ORDERS, orders);
}

export function loadKitchenTickets(): KitchenTicket[] {
  return getStorage<KitchenTicket[]>(KEYS.KITCHEN_TICKETS, INITIAL_KITCHEN_TICKETS);
}

export function saveKitchenTickets(tickets: KitchenTicket[]): void {
  setStorage(KEYS.KITCHEN_TICKETS, tickets);
}

export function loadStockLogs(): StockAdjustmentLog[] {
  return getStorage<StockAdjustmentLog[]>(KEYS.STOCK_LOGS, []);
}

export function saveStockLogs(logs: StockAdjustmentLog[]): void {
  setStorage(KEYS.STOCK_LOGS, logs);
}

export function loadShifts(): Shift[] {
  return getStorage<Shift[]>(KEYS.SHIFTS, []);
}

export function saveShifts(shifts: Shift[]): void {
  setStorage(KEYS.SHIFTS, shifts);
}

export function loadCurrentShift(): Shift | null {
  return getStorage<Shift | null>(KEYS.CURRENT_SHIFT, null);
}

export function saveCurrentShift(shift: Shift | null): void {
  setStorage(KEYS.CURRENT_SHIFT, shift);
}

export function loadGuestRooms(): GuestRoom[] {
  return getStorage<GuestRoom[]>(KEYS.GUEST_ROOMS, INITIAL_GUEST_ROOMS);
}

export function saveGuestRooms(rooms: GuestRoom[]): void {
  setStorage(KEYS.GUEST_ROOMS, rooms);
}

export const INITIAL_STAFF_USERS: AppUser[] = [
  {
    id: 'usr-cashier-01',
    fullName: 'John Mugisha',
    email: 'cashier@grandhorizon.com',
    phone: '+250 788 111 222',
    role: 'Cashier',
    status: 'Active',
    passwordHash: 'Cashier@123',
    pinCode: '1234',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-kitchen-01',
    fullName: 'Chef Eric Nshuti',
    email: 'kitchen@grandhorizon.com',
    phone: '+250 788 333 444',
    role: 'Kitchen',
    status: 'Active',
    passwordHash: 'Kitchen@123',
    pinCode: '2345',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-reception-01',
    fullName: 'Grace Uwase',
    email: 'reception@grandhorizon.com',
    phone: '+250 788 555 666',
    role: 'Receptionist',
    status: 'Active',
    passwordHash: 'Reception@123',
    pinCode: '3456',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-accountant-01',
    fullName: 'David Habimana',
    email: 'accountant@grandhorizon.com',
    phone: '+250 788 777 888',
    role: 'Accountant',
    status: 'Active',
    passwordHash: 'Accountant@123',
    pinCode: '4567',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-manager-01',
    fullName: 'Patrick Bizimana',
    email: 'manager@grandhorizon.com',
    phone: '+250 788 999 000',
    role: 'Manager',
    status: 'Active',
    passwordHash: 'Manager@123',
    pinCode: '5678',
    createdAt: new Date().toISOString()
  }
];

// User Management Functions
export function loadUsers(): AppUser[] {
  const users = getStorage<AppUser[]>(KEYS.USERS, INITIAL_STAFF_USERS);
  // ALWAYS filter out Super Admin if somehow saved, to keep Super Admin strictly hidden
  return users.filter(u => u.email.toLowerCase() !== SUPER_ADMIN_CREDENTIALS.email.toLowerCase() && !u.isSuperAdmin);
}

export function saveUsers(users: AppUser[]): void {
  const filteredUsers = users.filter(u => u.email.toLowerCase() !== SUPER_ADMIN_CREDENTIALS.email.toLowerCase() && !u.isSuperAdmin);
  setStorage(KEYS.USERS, filteredUsers);
}

// Audit Logs Functions
export function loadAuditLogs(): AuditLog[] {
  return getStorage<AuditLog[]>(KEYS.AUDIT_LOGS, []);
}

export function addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
  const logs = loadAuditLogs();
  const newLog: AuditLog = {
    ...log,
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString()
  };
  setStorage(KEYS.AUDIT_LOGS, [newLog, ...logs].slice(0, 10000)); // Keep up to 10000 detailed logs
}

// Session Functions
export function loadCurrentUser(): AppUser | null {
  return getStorage<AppUser | null>(KEYS.CURRENT_USER, null);
}

export function saveCurrentUser(user: AppUser | null): void {
  setStorage(KEYS.CURRENT_USER, user);
}

export function clearCurrentUser(): void {
  localStorage.removeItem(KEYS.CURRENT_USER);
}

// Expenses Storage
export function loadExpenses(): Expense[] {
  return getStorage<Expense[]>(KEYS.EXPENSES, []);
}

export function saveExpenses(expenses: Expense[]): void {
  setStorage(KEYS.EXPENSES, expenses);
}

export function addExpense(expense: Omit<Expense, 'id' | 'expenseNumber' | 'timestamp'>): Expense {
  const expenses = loadExpenses();
  const num = expenses.length + 1001;
  const newExp: Expense = {
    ...expense,
    id: `EXP-${Date.now()}-${Math.floor(Math.random() * 100)}`,
    expenseNumber: `EXP-${num}`,
    timestamp: new Date().toISOString()
  };
  saveExpenses([newExp, ...expenses]);
  return newExp;
}

// Cash Movements Storage
export function loadCashMovements(): CashMovement[] {
  return getStorage<CashMovement[]>(KEYS.CASH_MOVEMENTS, []);
}

export function saveCashMovements(movements: CashMovement[]): void {
  setStorage(KEYS.CASH_MOVEMENTS, movements);
}

export function addCashMovement(movement: Omit<CashMovement, 'id' | 'timestamp' | 'date' | 'time'>): CashMovement {
  const movements = loadCashMovements();
  const now = new Date();
  const newMov: CashMovement = {
    ...movement,
    id: `CSH-${Date.now()}-${Math.floor(Math.random() * 100)}`,
    timestamp: now.toISOString(),
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
  saveCashMovements([newMov, ...movements]);
  return newMov;
}

// Daily Closings Storage
export function loadDailyClosings(): DailyClosingRecord[] {
  return getStorage<DailyClosingRecord[]>(KEYS.DAILY_CLOSINGS, []);
}

export function saveDailyClosings(records: DailyClosingRecord[]): void {
  setStorage(KEYS.DAILY_CLOSINGS, records);
}

export function addDailyClosing(record: Omit<DailyClosingRecord, 'id' | 'closedAt'>): DailyClosingRecord {
  const closings = loadDailyClosings();
  const newClosing: DailyClosingRecord = {
    ...record,
    id: `DCR-${Date.now()}`,
    closedAt: new Date().toISOString()
  };
  saveDailyClosings([newClosing, ...closings]);
  return newClosing;
}

// Purchase Orders Storage
export function loadPurchaseOrders(): PurchaseOrder[] {
  const stored = getStorage<PurchaseOrder[]>(KEYS.PURCHASE_ORDERS, []);
  if (!stored || stored.length === 0) {
    savePurchaseOrders(INITIAL_PURCHASE_ORDERS);
    return INITIAL_PURCHASE_ORDERS;
  }
  return stored;
}

export function savePurchaseOrders(pos: PurchaseOrder[]): void {
  setStorage(KEYS.PURCHASE_ORDERS, pos);
}

// Kitchen Ingredients Storage
export function loadIngredients(): KitchenIngredient[] {
  const stored = getStorage<KitchenIngredient[]>(KEYS.KITCHEN_INGREDIENTS, []);
  if (!stored || stored.length === 0) {
    saveIngredients(INITIAL_KITCHEN_INGREDIENTS);
    return INITIAL_KITCHEN_INGREDIENTS;
  }
  return stored;
}

export function saveIngredients(ingredients: KitchenIngredient[]): void {
  setStorage(KEYS.KITCHEN_INGREDIENTS, ingredients);
}

// Stock Movement Records Ledger Storage
export function loadStockMovementRecords(): StockMovementRecord[] {
  return getStorage<StockMovementRecord[]>(KEYS.STOCK_MOVEMENT_RECORDS, []);
}

export function saveStockMovementRecords(records: StockMovementRecord[]): void {
  setStorage(KEYS.STOCK_MOVEMENT_RECORDS, records);
}

export function addStockMovementRecord(rec: Omit<StockMovementRecord, 'id' | 'timestamp' | 'date' | 'time'>): StockMovementRecord {
  const records = loadStockMovementRecords();
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];
  const created: StockMovementRecord = {
    ...rec,
    id: `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    date,
    time,
    timestamp: now.toISOString()
  };
  saveStockMovementRecords([created, ...records]);
  return created;
}

// Kitchen Waste Records Storage
export function loadWasteRecords(): KitchenWasteRecord[] {
  return getStorage<KitchenWasteRecord[]>(KEYS.KITCHEN_WASTE_RECORDS, []);
}

export function saveWasteRecords(records: KitchenWasteRecord[]): void {
  setStorage(KEYS.KITCHEN_WASTE_RECORDS, records);
}

export function addWasteRecord(rec: Omit<KitchenWasteRecord, 'id' | 'timestamp' | 'date'>): KitchenWasteRecord {
  const records = loadWasteRecords();
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const created: KitchenWasteRecord = {
    ...rec,
    id: `WST-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    date,
    timestamp: now.toISOString()
  };
  saveWasteRecords([created, ...records]);
  return created;
}

export function resetAllDataToDefault(): void {
  localStorage.clear();
  initializeCleanSlateIfNeeded();
}
