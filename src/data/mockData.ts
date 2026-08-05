import { MenuItem, Table, Waiter, GuestRoom, Shift, Order, KitchenTicket, PurchaseOrder, KitchenIngredient } from '../types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [];
export const INITIAL_TABLES: Table[] = [];
export const INITIAL_WAITERS: Waiter[] = [];
export const INITIAL_GUEST_ROOMS: GuestRoom[] = [];
export const INITIAL_ACTIVE_SHIFT: Shift | null = null;
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_KITCHEN_TICKETS: KitchenTicket[] = [];

export const INITIAL_KITCHEN_INGREDIENTS: KitchenIngredient[] = [
  {
    id: 'ing-101',
    code: 'ING-01',
    name: 'Fresh Chicken Meat',
    category: 'Meat & Poultry',
    stockQuantity: 40,
    unit: 'Kg',
    costPerUnit: 4500,
    minStockAlert: 8,
    status: 'Available',
    lastRestocked: new Date().toISOString().split('T')[0],
    notes: 'Whole fresh chicken cutlets for Poulet Frit and Chicken Rice'
  },
  {
    id: 'ing-102',
    code: 'ING-02',
    name: 'White Rice (Riz Blanc)',
    category: 'Grains & Rice',
    stockQuantity: 100,
    unit: 'Kg',
    costPerUnit: 1200,
    minStockAlert: 15,
    status: 'Available',
    lastRestocked: new Date().toISOString().split('T')[0],
    notes: 'Long grain rice for kitchen dishes'
  },
  {
    id: 'ing-103',
    code: 'ING-03',
    name: 'Fresh Beef Fillet',
    category: 'Meat & Poultry',
    stockQuantity: 30,
    unit: 'Kg',
    costPerUnit: 4800,
    minStockAlert: 6,
    status: 'Available',
    lastRestocked: new Date().toISOString().split('T')[0],
    notes: 'Premium beef cut for Brochettes and Beef Stew'
  },
  {
    id: 'ing-104',
    code: 'ING-04',
    name: 'Cooking Vegetable Oil',
    category: 'Spices & Oils',
    stockQuantity: 25,
    unit: 'Liters',
    costPerUnit: 2200,
    minStockAlert: 5,
    status: 'Available',
    lastRestocked: new Date().toISOString().split('T')[0],
    notes: 'Refined cooking oil for frying and sautéing'
  },
  {
    id: 'ing-105',
    code: 'ING-05',
    name: 'Fresh Tomatoes',
    category: 'Vegetables & Produce',
    stockQuantity: 30,
    unit: 'Kg',
    costPerUnit: 800,
    minStockAlert: 5,
    status: 'Available',
    lastRestocked: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ing-106',
    code: 'ING-06',
    name: 'Onions & Garlic',
    category: 'Vegetables & Produce',
    stockQuantity: 20,
    unit: 'Kg',
    costPerUnit: 1000,
    minStockAlert: 4,
    status: 'Available',
    lastRestocked: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ing-107',
    code: 'ING-07',
    name: 'Irish Potatoes (Ibirayi)',
    category: 'Vegetables & Produce',
    stockQuantity: 80,
    unit: 'Kg',
    costPerUnit: 600,
    minStockAlert: 15,
    status: 'Available',
    lastRestocked: new Date().toISOString().split('T')[0],
    notes: 'Potatoes for Frites / French Fries'
  },
  {
    id: 'ing-108',
    code: 'ING-08',
    name: 'Spaghetti / Pasta',
    category: 'Grains & Rice',
    stockQuantity: 35,
    unit: 'Kg',
    costPerUnit: 1500,
    minStockAlert: 5,
    status: 'Available',
    lastRestocked: new Date().toISOString().split('T')[0]
  },
  {
    id: 'ing-109',
    code: 'ING-09',
    name: 'Tilapia Fish (Piscine)',
    category: 'Seafood',
    stockQuantity: 20,
    unit: 'Kg',
    costPerUnit: 3800,
    minStockAlert: 5,
    status: 'Available',
    lastRestocked: new Date().toISOString().split('T')[0]
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-1001',
    poNumber: 'PO-1001',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    supplierName: 'Bralirwa Brasseries Rwanda',
    department: 'Bar / Beverage',
    items: [
      {
        itemId: 'm1',
        itemName: 'Primus 72cl',
        category: 'Beers',
        quantity: 50,
        unitCost: 1000,
        totalCost: 50000,
        destination: 'Main Beverage Stock'
      },
      {
        itemId: 'm2',
        itemName: 'Mutzig 65cl',
        category: 'Beers',
        quantity: 40,
        unitCost: 1100,
        totalCost: 44000,
        destination: 'Main Beverage Stock'
      }
    ],
    totalAmount: 94000,
    status: 'Pending',
    paymentStatus: 'Paid',
    createdByName: 'Patrick Bizimana (Manager)',
    notes: 'Main beverage store replenishment order'
  },
  {
    id: 'PO-1002',
    poNumber: 'PO-1002',
    date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    supplierName: 'Inyange Industries Ltd',
    department: 'Bar / Beverage',
    items: [
      {
        itemId: 'm4',
        itemName: 'Inyange Water 500ml',
        category: 'Water',
        quantity: 100,
        unitCost: 300,
        totalCost: 30000,
        destination: 'Main Beverage Stock'
      }
    ],
    totalAmount: 30000,
    status: 'Pending',
    paymentStatus: 'Unpaid',
    createdByName: 'Patrick Bizimana (Manager)',
    notes: 'Inyange water store intake pending'
  },
  {
    id: 'PO-1003',
    poNumber: 'PO-1003',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    supplierName: 'Kigali Fresh Farm Produce & Meat',
    department: 'Kitchen',
    items: [
      {
        itemId: 'k1',
        itemName: 'Beef Meat Fillet (Kg)',
        category: 'Food',
        quantity: 20,
        unitCost: 4500,
        totalCost: 90000,
        destination: 'Kitchen Stock'
      }
    ],
    totalAmount: 90000,
    status: 'Pending',
    paymentStatus: 'Paid',
    createdByName: 'Chef Eric Nshuti',
    notes: 'Kitchen raw material restock order'
  }
];

