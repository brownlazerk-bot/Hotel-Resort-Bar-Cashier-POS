import { 
  MenuItem, Table, Waiter, Order, KitchenTicket, 
  StockAdjustmentLog, Shift, GuestRoom 
} from '../types';
import { 
  INITIAL_MENU_ITEMS, INITIAL_TABLES, INITIAL_WAITERS, 
  INITIAL_GUEST_ROOMS, INITIAL_ACTIVE_SHIFT, INITIAL_ORDERS, INITIAL_KITCHEN_TICKETS 
} from '../data/mockData';

const KEYS = {
  MENU_ITEMS: 'bar_pos_menu_items',
  TABLES: 'bar_pos_tables',
  WAITERS: 'bar_pos_waiters',
  ORDERS: 'bar_pos_orders_v2',
  KITCHEN_TICKETS: 'bar_pos_kitchen_tickets_v2',
  STOCK_LOGS: 'bar_pos_stock_logs',
  SHIFTS: 'bar_pos_shifts',
  CURRENT_SHIFT: 'bar_pos_current_shift',
  GUEST_ROOMS: 'bar_pos_guest_rooms',
};

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
  return getStorage<Shift[]>(KEYS.SHIFTS, [INITIAL_ACTIVE_SHIFT]);
}

export function saveShifts(shifts: Shift[]): void {
  setStorage(KEYS.SHIFTS, shifts);
}

export function loadCurrentShift(): Shift | null {
  return getStorage<Shift | null>(KEYS.CURRENT_SHIFT, INITIAL_ACTIVE_SHIFT);
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

export function resetAllDataToDefault(): void {
  localStorage.clear();
}
