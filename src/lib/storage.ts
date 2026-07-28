import { 
  MenuItem, Table, Waiter, Order, KitchenTicket, 
  StockAdjustmentLog, Shift, GuestRoom, AppUser, AuditLog 
} from '../types';
import { 
  INITIAL_MENU_ITEMS, INITIAL_TABLES, INITIAL_WAITERS, 
  INITIAL_GUEST_ROOMS, INITIAL_ORDERS, INITIAL_KITCHEN_TICKETS 
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

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
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
  return getStorage<Waiter[]>(KEYS.WAITERS, INITIAL_WAITERS);
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

// User Management Functions
export function loadUsers(): AppUser[] {
  const users = getStorage<AppUser[]>(KEYS.USERS, []);
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
  setStorage(KEYS.AUDIT_LOGS, [newLog, ...logs].slice(0, 500)); // Keep last 500 logs
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

export function resetAllDataToDefault(): void {
  localStorage.clear();
  initializeCleanSlateIfNeeded();
}
