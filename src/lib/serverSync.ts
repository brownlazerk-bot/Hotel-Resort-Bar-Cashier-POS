/**
 * Central Hotel Server Sync Client
 * Connects any client device (HP laptop, Dell, Mobile Phone, Tablet) to the Express backend server
 * ensuring all hotel data (menu items, orders, tables, shifts, users, stock logs, reports) is 
 * 100% synchronized across all logged-in devices in real-time.
 */

import { notifyDataChange } from './syncEngine';

const API_BASE = '/api/sync';

// Entity keys mapping to backend store
export const ENTITY_KEYS = {
  MENU_ITEMS: 'menuItems',
  TABLES: 'tables',
  WAITERS: 'waiters',
  ORDERS: 'orders',
  KITCHEN_TICKETS: 'kitchenTickets',
  STOCK_LOGS: 'stockLogs',
  SHIFTS: 'shifts',
  CURRENT_SHIFT: 'currentShift',
  GUEST_ROOMS: 'guestRooms',
  USERS: 'users',
  AUDIT_LOGS: 'auditLogs',
  EXPENSES: 'expenses',
  CASH_MOVEMENTS: 'cashMovements',
  DAILY_CLOSINGS: 'dailyClosings',
  PURCHASE_ORDERS: 'purchaseOrders',
  INGREDIENTS: 'ingredients',
  RECIPES: 'recipes',
  STOCK_MOVEMENTS: 'stockMovements',
  WASTE_RECORDS: 'wasteRecords'
};

const LOCAL_KEY_MAP: Record<string, string> = {
  menuItems: 'hotel_menu_items_prod',
  tables: 'hotel_tables_prod',
  waiters: 'hotel_waiters_prod',
  orders: 'hotel_orders_prod',
  kitchenTickets: 'hotel_kitchen_tickets_prod',
  stockLogs: 'hotel_stock_logs_prod',
  shifts: 'hotel_shifts_prod',
  currentShift: 'hotel_current_shift_prod',
  guestRooms: 'hotel_guest_rooms_prod',
  users: 'hotel_users_prod',
  auditLogs: 'hotel_audit_logs_prod',
  expenses: 'hotel_expenses_prod',
  cashMovements: 'hotel_cash_movements_prod',
  dailyClosings: 'hotel_daily_closings_prod',
  purchaseOrders: 'hotel_purchase_orders_prod',
  ingredients: 'hotel_kitchen_ingredients_prod',
  recipes: 'hotel_recipes_prod',
  stockMovements: 'hotel_stock_movement_records_prod',
  wasteRecords: 'hotel_kitchen_waste_records_prod'
};

let isSyncing = false;

/**
 * Pulls all synchronized hotel database state from central server and updates localStorage.
 */
export async function pullServerState(): Promise<boolean> {
  if (isSyncing) return false;
  isSyncing = true;
  try {
    const res = await fetch(`${API_BASE}/all`);
    if (!res.ok) throw new Error('Failed to reach sync server');
    
    const { success, data } = await res.json();
    if (success && data) {
      let hasChanges = false;

      Object.entries(LOCAL_KEY_MAP).forEach(([serverKey, localKey]) => {
        if (data[serverKey] !== undefined) {
          const incomingStr = JSON.stringify(data[serverKey]);
          const currentStr = localStorage.getItem(localKey);
          if (incomingStr !== currentStr) {
            const isIncomingEmptyArray = Array.isArray(data[serverKey]) && data[serverKey].length === 0;
            const hasLocalData = currentStr && currentStr !== '[]' && currentStr !== 'null';

            if (isIncomingEmptyArray && hasLocalData) {
              // Server key is empty array but local storage has data -> push local data to server
              try {
                const parsedLocal = JSON.parse(currentStr);
                pushKeyToServer(serverKey, parsedLocal);
              } catch (e) {
                // Ignore parse error
              }
            } else {
              localStorage.setItem(localKey, incomingStr);
              hasChanges = true;
            }
          }
        }
      });

      if (hasChanges) {
        notifyDataChange('all');
      }
      return true;
    }
  } catch (err) {
    console.warn('[Server Sync] Fetch server state warning:', err);
  } finally {
    isSyncing = false;
  }
  return false;
}

/**
 * Push a single entity key update to the central Express server.
 */
export async function pushKeyToServer(entityKey: string, value: any): Promise<void> {
  try {
    await fetch(`${API_BASE}/key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: entityKey, value })
    });
  } catch (err) {
    console.warn(`[Server Sync] Push error for key ${entityKey}:`, err);
  }
}

/**
 * Pushes full local snapshot to central server (used on initial seed or bulk save).
 */
export async function pushFullStateToServer(fullState: Record<string, any>): Promise<void> {
  try {
    await fetch(`${API_BASE}/all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullState)
    });
  } catch (err) {
    console.warn('[Server Sync] Push full state error:', err);
  }
}

/**
 * Initializes automatic background polling every 3 seconds to keep device 100% in sync with server.
 */
export function startServerSyncPolling(intervalMs: number = 3000): () => void {
  // First immediate pull
  pullServerState();

  const timer = setInterval(() => {
    pullServerState();
  }, intervalMs);

  const handleFocus = () => {
    pullServerState();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleFocus);
  }

  return () => {
    clearInterval(timer);
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', handleFocus);
    }
  };
}
