import { MenuItem, Table, Waiter, GuestRoom, Shift, Order, KitchenTicket } from '../types';

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Beers
  {
    id: 'm-1',
    name: 'Heineken Lager (330ml)',
    category: 'Beers',
    price: 4.50,
    stockQuantity: 48,
    unit: 'Bottle',
    status: 'Available',
    minStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-2',
    name: 'Guinness Extra Stout (330ml)',
    category: 'Beers',
    price: 5.00,
    stockQuantity: 32,
    unit: 'Bottle',
    status: 'Available',
    minStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-3',
    name: 'Corona Extra with Lime',
    category: 'Beers',
    price: 5.50,
    stockQuantity: 24,
    unit: 'Bottle',
    status: 'Available',
    minStockAlert: 8,
    image: 'https://images.unsplash.com/photo-1584225065152-4a1454aa3d4e?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-4',
    name: 'Draft Local Craft Ale (500ml)',
    category: 'Beers',
    price: 6.00,
    stockQuantity: 60,
    unit: 'Glass',
    status: 'Available',
    minStockAlert: 15,
    image: 'https://images.unsplash.com/photo-1518176258614-41e39a2d8299?auto=format&fit=crop&q=80&w=400'
  },

  // Soft Drinks
  {
    id: 'm-5',
    name: 'Coca-Cola Zero (330ml)',
    category: 'Soft Drinks',
    price: 2.50,
    stockQuantity: 80,
    unit: 'Can',
    status: 'Available',
    minStockAlert: 20,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-6',
    name: 'Sprite Lemon-Lime (330ml)',
    category: 'Soft Drinks',
    price: 2.50,
    stockQuantity: 65,
    unit: 'Can',
    status: 'Available',
    minStockAlert: 15,
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-7',
    name: 'Red Bull Energy Drink (250ml)',
    category: 'Soft Drinks',
    price: 4.00,
    stockQuantity: 40,
    unit: 'Can',
    status: 'Available',
    minStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&q=80&w=400'
  },

  // Wines
  {
    id: 'm-8',
    name: 'Bordeaux Rouge Grand Reserve (Glass)',
    category: 'Wines',
    price: 8.50,
    stockQuantity: 30,
    unit: 'Glass',
    status: 'Available',
    minStockAlert: 8,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-9',
    name: 'Chardonnay White Wine (Bottle)',
    category: 'Wines',
    price: 35.00,
    stockQuantity: 12,
    unit: 'Bottle',
    status: 'Available',
    minStockAlert: 4,
    image: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-10',
    name: 'Moët & Chandon Brut Champagne',
    category: 'Wines',
    price: 110.00,
    stockQuantity: 6,
    unit: 'Bottle',
    status: 'Available',
    minStockAlert: 2,
    image: 'https://images.unsplash.com/photo-1598153346810-860daa814c4b?auto=format&fit=crop&q=80&w=400'
  },

  // Whisky & Spirits
  {
    id: 'm-11',
    name: 'Johnnie Walker Black Label (Shot)',
    category: 'Whisky',
    price: 7.00,
    stockQuantity: 45,
    unit: 'Shot',
    status: 'Available',
    minStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-12',
    name: 'Glenfiddich 12 Single Malt (Shot)',
    category: 'Whisky',
    price: 9.50,
    stockQuantity: 28,
    unit: 'Shot',
    status: 'Available',
    minStockAlert: 8,
    image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=400'
  },

  // Cocktails
  {
    id: 'm-13',
    name: 'Mojito Royale',
    category: 'Cocktails',
    price: 9.00,
    stockQuantity: 100,
    unit: 'Glass',
    status: 'Available',
    minStockAlert: 15,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-14',
    name: 'Pina Colada Resort Special',
    category: 'Cocktails',
    price: 10.00,
    stockQuantity: 80,
    unit: 'Glass',
    status: 'Available',
    minStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1546171753-97d7676e417b?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-15',
    name: 'Espresso Martini',
    category: 'Cocktails',
    price: 11.00,
    stockQuantity: 50,
    unit: 'Glass',
    status: 'Available',
    minStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400'
  },

  // Juices & Water
  {
    id: 'm-16',
    name: 'Fresh Passion Fruit Juice',
    category: 'Juices',
    price: 4.00,
    stockQuantity: 30,
    unit: 'Glass',
    status: 'Available',
    minStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-17',
    name: 'Fresh Watermelon Shake',
    category: 'Juices',
    price: 4.50,
    stockQuantity: 25,
    unit: 'Glass',
    status: 'Available',
    minStockAlert: 5,
    image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-18',
    name: 'Premium Still Mineral Water (750ml)',
    category: 'Water',
    price: 3.00,
    stockQuantity: 120,
    unit: 'Bottle',
    status: 'Available',
    minStockAlert: 25,
    image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&q=80&w=400'
  },

  // Coffee & Tea
  {
    id: 'm-19',
    name: 'Double Espresso',
    category: 'Coffee',
    price: 3.50,
    stockQuantity: 150,
    unit: 'Cup',
    status: 'Available',
    minStockAlert: 20,
    image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-20',
    name: 'Cappuccino Vanilla',
    category: 'Coffee',
    price: 4.20,
    stockQuantity: 150,
    unit: 'Cup',
    status: 'Available',
    minStockAlert: 20,
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-21',
    name: 'Jasmine Green Tea Pot',
    category: 'Tea',
    price: 3.80,
    stockQuantity: 80,
    unit: 'Pot',
    status: 'Available',
    minStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400'
  },

  // Food Items (isFood = true)
  {
    id: 'm-22',
    name: 'Grilled Beef Burger & Fries',
    category: 'Food',
    price: 14.50,
    stockQuantity: 40,
    unit: 'Portion',
    status: 'Available',
    isFood: true,
    minStockAlert: 8,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-23',
    name: 'Club Sandwich with Chips',
    category: 'Food',
    price: 12.00,
    stockQuantity: 35,
    unit: 'Portion',
    status: 'Available',
    isFood: true,
    minStockAlert: 8,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-24',
    name: 'Resort Pepperoni Pizza (Large)',
    category: 'Food',
    price: 16.00,
    stockQuantity: 20,
    unit: 'Portion',
    status: 'Available',
    isFood: true,
    minStockAlert: 5,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-25',
    name: 'Grilled Tiger Prawns Skewers',
    category: 'Food',
    price: 19.50,
    stockQuantity: 15,
    unit: 'Portion',
    status: 'Available',
    isFood: true,
    minStockAlert: 5,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-26',
    name: 'Crispy Buffalo Chicken Wings (10pcs)',
    category: 'Food',
    price: 11.50,
    stockQuantity: 25,
    unit: 'Portion',
    status: 'Available',
    isFood: true,
    minStockAlert: 5,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=400'
  },

  // Pool Services
  {
    id: 'm-27',
    name: 'Adult Swimming Pool Pass (Day)',
    category: 'Pool Services',
    price: 15.00,
    stockQuantity: 999,
    unit: 'Ticket',
    status: 'Available',
    minStockAlert: 0,
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-28',
    name: 'Child Pool Pass (Under 12)',
    category: 'Pool Services',
    price: 8.00,
    stockQuantity: 999,
    unit: 'Ticket',
    status: 'Available',
    minStockAlert: 0,
    image: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-29',
    name: 'VIP Pool Cabana Rental (Full Day)',
    category: 'Pool Services',
    price: 50.00,
    stockQuantity: 8,
    unit: 'Serving',
    status: 'Available',
    minStockAlert: 2,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400'
  },

  // Sauna Services
  {
    id: 'm-30',
    name: 'Sauna Session (60 Mins Pass)',
    category: 'Sauna Services',
    price: 20.00,
    stockQuantity: 999,
    unit: 'Ticket',
    status: 'Available',
    minStockAlert: 0,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'm-31',
    name: 'Steam & Sauna Couples Combo',
    category: 'Sauna Services',
    price: 35.00,
    stockQuantity: 999,
    unit: 'Ticket',
    status: 'Available',
    minStockAlert: 0,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=400'
  }
];

export const INITIAL_TABLES: Table[] = [
  { id: 't-1', tableNumber: 'Table 01', capacity: 2, status: 'Available' },
  { id: 't-2', tableNumber: 'Table 02', capacity: 4, status: 'Occupied', currentOrderId: 'ORD-8001', assignedWaiterId: 'w-1' },
  { id: 't-3', tableNumber: 'Table 03', capacity: 4, status: 'Available' },
  { id: 't-4', tableNumber: 'Table 04', capacity: 6, status: 'Reserved' },
  { id: 't-5', tableNumber: 'Table 05', capacity: 2, status: 'Cleaning' },
  { id: 't-6', tableNumber: 'Pool Deck 01', capacity: 4, status: 'Occupied', currentOrderId: 'ORD-8002', assignedWaiterId: 'w-2' },
  { id: 't-7', tableNumber: 'Pool Deck 02', capacity: 4, status: 'Available' },
  { id: 't-8', tableNumber: 'Terrace VIP 1', capacity: 8, status: 'Available' },
];

export const INITIAL_WAITERS: Waiter[] = [
  { id: 'w-1', name: 'Emmanuel K.', employeeId: 'EMP-101', phone: '+237 671 223 344', shift: 'Morning', active: true },
  { id: 'w-2', name: 'Grace N.', employeeId: 'EMP-102', phone: '+237 699 554 112', shift: 'Morning', active: true },
  { id: 'w-3', name: 'Patrick B.', employeeId: 'EMP-103', phone: '+237 650 889 001', shift: 'Afternoon', active: true },
  { id: 'w-4', name: 'Sarah M.', employeeId: 'EMP-104', phone: '+237 678 334 556', shift: 'Evening', active: true }
];

export const INITIAL_GUEST_ROOMS: GuestRoom[] = [
  { id: 'r-101', type: 'Room', number: 'Room 101', guestName: 'Dr. Jean-Pierre Dupont', checkInDate: '2026-07-26', status: 'Occupied', balance: 45.00 },
  { id: 'r-104', type: 'Room', number: 'Room 104', guestName: 'Sophia Williams', checkInDate: '2026-07-27', status: 'Occupied', balance: 0.00 },
  { id: 'r-205', type: 'Room', number: 'Room 205', guestName: 'Michael Chang', checkInDate: '2026-07-25', status: 'Occupied', balance: 120.00 },
  { id: 'a-101', type: 'Apartment', number: 'Apt A-101', guestName: 'Ambassador Hassan & Family', checkInDate: '2026-07-20', status: 'Occupied', balance: 280.00 },
  { id: 'a-202', type: 'Apartment', number: 'Apt B-202', guestName: 'Victoria Sterling', checkInDate: '2026-07-24', status: 'Occupied', balance: 65.00 },
];

export const INITIAL_ACTIVE_SHIFT: Shift = {
  id: 'sh-501',
  cashierName: 'Alice Johnson',
  cashierId: 'c-01',
  openedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  openingCash: 200.00,
  status: 'Open'
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-8001',
    orderNumber: '#ORD-8001',
    tableId: 't-2',
    tableNumber: 'Table 02',
    waiterId: 'w-1',
    waiterName: 'Emmanuel K.',
    customerName: 'Dr. Jean-Pierre Dupont',
    customerPhone: '+237 670 112 233',
    guestRoomId: 'r-101',
    servicesIncluded: ['Drinks', 'Food', 'Pool Services'],
    items: [
      { itemId: 'm-1', name: 'Heineken Lager (330ml)', category: 'Beers', unitPrice: 4.50, quantity: 2, totalPrice: 9.00 },
      { itemId: 'm-22', name: 'Grilled Beef Burger & Fries', category: 'Food', unitPrice: 14.50, quantity: 1, totalPrice: 14.50, isFood: true, notes: 'Medium rare' },
      { itemId: 'm-27', name: 'Adult Swimming Pool Pass (Day)', category: 'Pool Services', unitPrice: 15.00, quantity: 2, totalPrice: 30.00 }
    ],
    subtotal: 53.50,
    tax: 9.63,
    discount: 3.13,
    total: 60.00,
    amountPaid: 30.00,
    balance: 30.00,
    paymentStatus: 'PARTIALLY PAID',
    status: 'Partially Paid',
    paymentMethod: 'Mixed',
    paymentDetails: { method: 'Mixed', cashPaid: 30.00 },
    paymentHistory: [
      { id: 'pay-1', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), amount: 30.00, method: 'Cash', cashierName: 'Alice Johnson', note: 'Deposit paid' }
    ],
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    shiftId: 'sh-501',
    cashierName: 'Alice Johnson',
    kotGenerated: true,
    kotId: 'KOT-1001'
  },
  {
    id: 'ORD-8002',
    orderNumber: '#ORD-8002',
    tableId: 't-6',
    tableNumber: 'Pool Deck 01',
    waiterId: 'w-2',
    waiterName: 'Grace N.',
    customerName: 'Ambassador Hassan & Family',
    customerPhone: '+237 699 102 030',
    guestRoomId: 'a-101',
    servicesIncluded: ['Drinks', 'Food', 'Pool Services', 'Sauna Services', 'Apartment Services'],
    items: [
      { itemId: 'm-13', name: 'Mojito Royale', category: 'Cocktails', unitPrice: 9.00, quantity: 2, totalPrice: 18.00 },
      { itemId: 'm-24', name: 'Resort Pepperoni Pizza (Large)', category: 'Food', unitPrice: 16.00, quantity: 1, totalPrice: 16.00, isFood: true },
      { itemId: 'm-27', name: 'Adult Swimming Pool Pass (Day)', category: 'Pool Services', unitPrice: 15.00, quantity: 2, totalPrice: 30.00 },
      { itemId: 'm-30', name: 'Sauna Session (60 Mins Pass)', category: 'Sauna Services', unitPrice: 20.00, quantity: 1, totalPrice: 20.00 }
    ],
    subtotal: 84.00,
    tax: 15.12,
    discount: 4.12,
    total: 95.00,
    amountPaid: 0.00,
    balance: 95.00,
    paymentStatus: 'CREDIT',
    status: 'Credit',
    paymentMethod: 'Apartment Charge',
    paymentDetails: { method: 'Apartment Charge', selectedRoomId: 'a-101', roomOrAptNumber: 'Apt A-101', guestName: 'Ambassador Hassan & Family', roomChargeAmount: 95.00 },
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    shiftId: 'sh-501',
    cashierName: 'Alice Johnson',
    kotGenerated: true,
    kotId: 'KOT-1002'
  },
  {
    id: 'ORD-8003',
    orderNumber: '#ORD-8003',
    waiterId: 'w-3',
    waiterName: 'Patrick B.',
    customerName: 'Victoria Sterling',
    customerPhone: '+237 680 445 566',
    servicesIncluded: ['Drinks', 'Wines'],
    items: [
      { itemId: 'm-9', name: 'Chardonnay White Wine (Bottle)', category: 'Wines', unitPrice: 35.00, quantity: 1, totalPrice: 35.00 },
      { itemId: 'm-18', name: 'Premium Still Mineral Water (750ml)', category: 'Water', unitPrice: 3.00, quantity: 2, totalPrice: 6.00 }
    ],
    subtotal: 41.00,
    tax: 7.38,
    discount: 0,
    total: 48.38,
    amountPaid: 48.38,
    balance: 0,
    paymentStatus: 'PAID',
    status: 'Paid',
    paymentMethod: 'Card',
    paymentDetails: { method: 'Card', cardPaid: 48.38 },
    paymentHistory: [
      { id: 'pay-2', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), amount: 48.38, method: 'Card', cashierName: 'Alice Johnson' }
    ],
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    shiftId: 'sh-501',
    cashierName: 'Alice Johnson'
  },
  {
    id: 'ORD-8004',
    orderNumber: '#ORD-8004',
    tableId: 't-3',
    tableNumber: 'Table 03',
    waiterId: 'w-4',
    waiterName: 'Sarah M.',
    customerName: 'Marcus Vance',
    customerPhone: '+237 671 990 011',
    servicesIncluded: ['Food', 'Drinks'],
    items: [
      { itemId: 'm-25', name: 'Grilled Tiger Prawns Skewers', category: 'Food', unitPrice: 19.50, quantity: 2, totalPrice: 39.00, isFood: true },
      { itemId: 'm-14', name: 'Pina Colada Resort Special', category: 'Cocktails', unitPrice: 10.00, quantity: 2, totalPrice: 20.00 }
    ],
    subtotal: 59.00,
    tax: 10.62,
    discount: 0,
    total: 69.62,
    amountPaid: 0,
    balance: 69.62,
    paymentStatus: 'UNPAID',
    status: 'Preparing',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    shiftId: 'sh-501',
    cashierName: 'Alice Johnson',
    kotGenerated: true,
    kotId: 'KOT-1003'
  }
];

export const INITIAL_KITCHEN_TICKETS: KitchenTicket[] = [
  {
    id: 'KOT-1001',
    orderId: 'ORD-8001',
    tableNumber: 'Table 02',
    waiterName: 'Emmanuel K.',
    customerName: 'Dr. Jean-Pierre Dupont',
    items: [
      { itemId: 'm-22', name: 'Grilled Beef Burger & Fries', quantity: 1, notes: 'Medium rare' }
    ],
    orderTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'Ready',
    specialNotes: 'Deliver with extra ketchup'
  },
  {
    id: 'KOT-1002',
    orderId: 'ORD-8002',
    tableNumber: 'Pool Deck 01',
    waiterName: 'Grace N.',
    customerName: 'Ambassador Hassan & Family',
    items: [
      { itemId: 'm-24', name: 'Resort Pepperoni Pizza (Large)', quantity: 1 }
    ],
    orderTime: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    status: 'Preparing',
    specialNotes: 'Extra cheese please'
  },
  {
    id: 'KOT-1003',
    orderId: 'ORD-8004',
    tableNumber: 'Table 03',
    waiterName: 'Sarah M.',
    customerName: 'Marcus Vance',
    items: [
      { itemId: 'm-25', name: 'Grilled Tiger Prawns Skewers', quantity: 2 }
    ],
    orderTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'Pending',
    specialNotes: 'Garlic butter sauce'
  }
];
