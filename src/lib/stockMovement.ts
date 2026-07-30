import { MenuItem, Order, StockAdjustmentLog } from '../types';

export interface ItemStockMovement {
  itemId: string;
  itemName: string;
  category: string;
  unit: string;
  price: number;
  openingStock: number;    // Ububiko bwa mbere (Opening Stock before target date)
  addedStock: number;      // Ibyinjiye uwo munsi (Stock added/restocked on target date)
  dispatchedStock: number; // Ibyasohotse / Ibyacurujwe (Dispatched on target date, paid + pending)
  paidQty: number;         // Paid dispatched qty
  pendingQty: number;      // Pending dispatched qty in open tables
  closingStock: number;    // Ububiko busigaye (Closing stock at end of target date)
  currentStock: number;    // Live stock quantity right now
  dispatchedValue: number; // Dispatched total value (dispatchedStock * price)
}

/**
 * Calculates accurate stock movements (Opening Stock, Stock In, Stock Out, Closing Stock)
 * for any given date string (YYYY-MM-DD).
 */
export function calculateStockMovementsForDate(
  menuItems: MenuItem[],
  stockLogs: StockAdjustmentLog[],
  orders: Order[],
  targetDateStr: string // "YYYY-MM-DD"
): ItemStockMovement[] {
  // Parse target date boundaries in local time
  const [year, month, day] = targetDateStr.split('-').map(Number);
  const targetDayStart = new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
  const targetDayEnd = new Date(year, month - 1, day, 23, 59, 59, 999).getTime();

  return menuItems.map(item => {
    let dispatchedAfter = 0;
    let addedAfter = 0;

    let dispatchedOnDate = 0;
    let paidQtyOnDate = 0;
    let pendingQtyOnDate = 0;

    let addedOnDate = 0;

    // 1. Calculate order dispatches (Sales / Pending orders)
    orders.forEach(order => {
      if (order.status === 'Cancelled') return;
      if (!order.createdAt) return;

      const orderTime = new Date(order.createdAt).getTime();
      const isPaid = order.paymentStatus === 'PAID' || order.status === 'Paid';

      order.items.forEach(orderItem => {
        if (orderItem.itemId === item.id || (orderItem.name && item.name && orderItem.name.toLowerCase() === item.name.toLowerCase())) {
          const qty = orderItem.quantity || 0;

          if (orderTime > targetDayEnd) {
            dispatchedAfter += qty;
          } else if (orderTime >= targetDayStart && orderTime <= targetDayEnd) {
            dispatchedOnDate += qty;
            if (isPaid) {
              paidQtyOnDate += qty;
            } else {
              pendingQtyOnDate += qty;
            }
          }
        }
      });
    });

    // 2. Calculate stock log adjustments / intakes
    stockLogs.forEach(log => {
      if (log.itemId === item.id || (log.itemName && item.name && log.itemName.toLowerCase() === item.name.toLowerCase())) {
        if (!log.timestamp) return;
        const logTime = new Date(log.timestamp).getTime();
        const change = log.quantityChange || 0;

        if (logTime > targetDayEnd) {
          addedAfter += change;
        } else if (logTime >= targetDayStart && logTime <= targetDayEnd) {
          addedOnDate += change;
        }
      }
    });

    const currentStock = item.stockQuantity || 0;

    // Closing stock at end of target date
    const closingStock = currentStock + dispatchedAfter - addedAfter;

    // Opening stock at start of target date (i.e. Closing stock of previous day)
    const openingStock = closingStock - addedOnDate + dispatchedOnDate;

    return {
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      unit: item.unit || 'Bottle',
      price: item.price || 0,
      openingStock: Math.max(0, openingStock),
      addedStock: Math.max(0, addedOnDate),
      dispatchedStock: Math.max(0, dispatchedOnDate),
      paidQty: paidQtyOnDate,
      pendingQty: pendingQtyOnDate,
      closingStock: Math.max(0, closingStock),
      currentStock,
      dispatchedValue: Math.max(0, dispatchedOnDate) * (item.price || 0)
    };
  });
}
