/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MenuItem, Table, Waiter, Order, KitchenTicket, 
  StockAdjustmentLog, Shift, GuestRoom, UserRole, KitchenTicketStatus, TableStatus, AppUser,
  Expense, CashMovement, DailyClosingRecord
} from './types';
import { 
  loadMenuItems, saveMenuItems, loadTables, saveTables, 
  loadWaiters, saveWaiters, loadOrders, saveOrders, 
  loadKitchenTickets, saveKitchenTickets, loadStockLogs, saveStockLogs, 
  loadShifts, saveShifts, loadCurrentShift, saveCurrentShift, 
  loadGuestRooms, saveGuestRooms, resetAllDataToDefault,
  loadCurrentUser, saveCurrentUser, clearCurrentUser, addAuditLog,
  loadExpenses, saveExpenses, addExpense,
  loadCashMovements, saveCashMovements, addCashMovement,
  loadDailyClosings, saveDailyClosings, addDailyClosing
} from './lib/storage';

import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { PosTerminal } from './components/PosTerminal';
import { TablesGrid } from './components/TablesGrid';
import { KitchenTickets } from './components/KitchenTickets';
import { PoolSaunaModule } from './components/PoolSaunaModule';
import { StockManagement } from './components/StockManagement';
import { ShiftManager } from './components/ShiftManager';
import { DailyReportView } from './components/DailyReportView';
import { ManagerSettings } from './components/ManagerSettings';
import { ReceiptModal } from './components/ReceiptModal';
import { OrderCenterList } from './components/OrderCenterList';
import { LoginView } from './components/LoginView';
import { UserManagement } from './components/UserManagement';
import { AuditLogView } from './components/AuditLogView';
import { ProductServiceManager } from './components/ProductServiceManager';
import { subscribeToSync, createDailyBackup, flushOfflineQueue } from './lib/syncEngine';
import { startServerSyncPolling, pullServerState } from './lib/serverSync';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('Cashier');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Core Data States
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>([]);
  const [stockLogs, setStockLogs] = useState<StockAdjustmentLog[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [guestRooms, setGuestRooms] = useState<GuestRoom[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [dailyClosings, setDailyClosings] = useState<DailyClosingRecord[]>([]);

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // Helper to refresh all data states from storage
  const refreshAllStateFromStorage = () => {
    setMenuItems(loadMenuItems());
    setTables(loadTables());
    setWaiters(loadWaiters());
    setOrders(loadOrders());
    setKitchenTickets(loadKitchenTickets());
    setStockLogs(loadStockLogs());
    setShifts(loadShifts());
    setCurrentShift(loadCurrentShift());
    setGuestRooms(loadGuestRooms());
    setExpenses(loadExpenses());
    setCashMovements(loadCashMovements());
    setDailyClosings(loadDailyClosings());
  };

  // Load Initial Data, Sync Engine, Online/Offline & Auto-Backup
  useEffect(() => {
    const loggedInUser = loadCurrentUser();
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
      setUserRole(loggedInUser.role === 'Super Admin' || loggedInUser.role === 'Admin' || loggedInUser.role === 'Manager' ? 'Manager' : 'Cashier');
    }

    refreshAllStateFromStorage();

    // Trigger daily backup
    try {
      createDailyBackup(loggedInUser?.fullName || 'System Auto-Backup');
    } catch (e) {
      // Backup fallback
    }

    // Subscribe to real-time sync across connected tabs/windows & devices
    const unsubscribeSync = subscribeToSync((_entityKey) => {
      refreshAllStateFromStorage();
    });

    // Start central Express server polling (syncs HP, Dell, Phone, etc.)
    const stopServerPolling = startServerSyncPolling(3000);

    // Initial pull from server
    pullServerState().then(() => {
      refreshAllStateFromStorage();
    });

    // Handle online/offline network transitions
    const handleOnline = () => {
      setIsOnline(true);
      flushOfflineQueue();
      pullServerState().then(() => refreshAllStateFromStorage());
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribeSync();
      stopServerPolling();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Inactivity Auto-Logout Timer (15 Minutes)
  useEffect(() => {
    if (!currentUser) return;
    let timeoutId: any;

    const resetInactivityTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        addAuditLog({
          userId: currentUser.id,
          userName: currentUser.fullName,
          userRole: currentUser.role,
          userEmail: currentUser.email,
          action: 'Auto-Logout',
          category: 'Auth',
          details: 'User automatically logged out due to 15 minutes of inactivity'
        });
        clearCurrentUser();
        setCurrentUser(null);
        alert('Security Alert: You have been logged out due to 15 minutes of inactivity.');
      }, 15 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);

    resetInactivityTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
      window.removeEventListener('scroll', resetInactivityTimer);
    };
  }, [currentUser]);

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    if (user.role === 'Super Admin' || user.role === 'Admin' || user.role === 'Manager') {
      setUserRole('Manager');
    } else {
      setUserRole('Cashier');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        userEmail: currentUser.email,
        action: 'User Logout',
        category: 'Auth',
        details: 'User logged out of session'
      });
    }
    clearCurrentUser();
    setCurrentUser(null);
  };

  // Sync to Storage on State Changes
  const updateMenuItemsState = (newItems: MenuItem[]) => {
    setMenuItems(newItems);
    saveMenuItems(newItems);
  };

  const updateTablesState = (newTables: Table[]) => {
    setTables(newTables);
    saveTables(newTables);
  };

  const updateWaitersState = (newWaiters: Waiter[]) => {
    setWaiters(newWaiters);
    saveWaiters(newWaiters);
  };

  const updateOrdersState = (newOrders: Order[]) => {
    setOrders(newOrders);
    saveOrders(newOrders);
  };

  const updateKitchenTicketsState = (newTickets: KitchenTicket[]) => {
    setKitchenTickets(newTickets);
    saveKitchenTickets(newTickets);
  };

  const updateStockLogsState = (newLogs: StockAdjustmentLog[]) => {
    setStockLogs(newLogs);
    saveStockLogs(newLogs);
  };

  const updateShiftsState = (newShifts: Shift[]) => {
    setShifts(newShifts);
    saveShifts(newShifts);
  };

  const updateCurrentShiftState = (shift: Shift | null) => {
    setCurrentShift(shift);
    saveCurrentShift(shift);
  };

  const updateGuestRoomsState = (newRooms: GuestRoom[]) => {
    setGuestRooms(newRooms);
    saveGuestRooms(newRooms);
  };

  const updateExpensesState = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    saveExpenses(newExpenses);
  };

  const handleAddExpense = (exp: Omit<Expense, 'id' | 'expenseNumber' | 'timestamp'>) => {
    const created = addExpense(exp);
    setExpenses(loadExpenses());
    
    // Also record cash movement if expense was paid in cash
    addCashMovement({
      amount: -Math.abs(exp.amount),
      movementType: 'Expense Paid',
      reason: `Expense [${exp.category}]: ${exp.description}`,
      user: exp.approvedBy || exp.requestedBy || 'Staff',
      shiftId: currentShift?.id,
      referenceId: created.id
    });
    setCashMovements(loadCashMovements());
    return created;
  };

  const updateCashMovementsState = (newMovements: CashMovement[]) => {
    setCashMovements(newMovements);
    saveCashMovements(newMovements);
  };

  const handleAddCashMovement = (mov: Omit<CashMovement, 'id' | 'timestamp' | 'date' | 'time'>) => {
    const created = addCashMovement(mov);
    setCashMovements(loadCashMovements());
    return created;
  };

  const updateDailyClosingsState = (newClosings: DailyClosingRecord[]) => {
    setDailyClosings(newClosings);
    saveDailyClosings(newClosings);
  };

  // Play audio chime feedback
  const playSound = (type: 'order' | 'kitchen') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === 'order' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(type === 'order' ? 880 : 587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio fallback
    }
  };

  // Handle Order Completion from POS or Pool/Sauna
  const handleOrderCompleted = (completedOrder: Order, newKot?: KitchenTicket) => {
    playSound('order');

    // 1. Add Order
    const updatedOrders = [completedOrder, ...orders];
    updateOrdersState(updatedOrders);

    // 2. Automatic Drink Stock Deduction
    let updatedMenuItems = [...menuItems];
    let newLogs: StockAdjustmentLog[] = [...stockLogs];

    completedOrder.items.forEach((item) => {
      const targetIndex = updatedMenuItems.findIndex(m => m.id === item.itemId);
      if (targetIndex > -1) {
        const prevStock = updatedMenuItems[targetIndex].stockQuantity;
        const newStock = Math.max(0, prevStock - item.quantity);
        const isNowOut = newStock === 0;

        updatedMenuItems[targetIndex] = {
          ...updatedMenuItems[targetIndex],
          stockQuantity: newStock,
          status: isNowOut ? 'Out of Stock' : updatedMenuItems[targetIndex].status
        };

        newLogs.unshift({
          id: `log-${Date.now()}-${Math.random()}`,
          itemId: item.itemId,
          itemName: item.name,
          type: 'Sale',
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          reason: `Auto-deducted from Order ${completedOrder.id}`,
          timestamp: new Date().toISOString(),
          actor: completedOrder.cashierName
        });
      }
    });

    updateMenuItemsState(updatedMenuItems);
    updateStockLogsState(newLogs);

    // 3. Automatic Kitchen Order Ticket (Bon de Commande) handling
    if (newKot) {
      playSound('kitchen');
      updateKitchenTicketsState([newKot, ...kitchenTickets]);
    }

    // 4. Update Table Status if table was assigned
    if (completedOrder.tableId) {
      const updatedTables = tables.map(t => {
        if (t.id === completedOrder.tableId) {
          return {
            ...t,
            status: 'Occupied' as TableStatus,
            currentOrderId: completedOrder.id
          };
        }
        return t;
      });
      updateTablesState(updatedTables);
    }

    // 5. Update Guest Room Balance if Room/Apartment Charge
    if (completedOrder.paymentDetails?.selectedRoomId) {
      const updatedRooms = guestRooms.map(r => {
        if (r.id === completedOrder.paymentDetails?.selectedRoomId) {
          return {
            ...r,
            balance: r.balance + completedOrder.total
          };
        }
        return r;
      });
      updateGuestRoomsState(updatedRooms);
    }

    // 6. Audit Log
    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        userEmail: currentUser.email,
        action: 'New Order Completed',
        category: 'Sales',
        details: `Created order #${completedOrder.id} (${completedOrder.servicesIncluded?.join(', ') || 'Bar Order'}) for ${completedOrder.total} RWF - Status: ${completedOrder.status}`
      });
    }

    // 7. Show Printable Thermal Receipt Modal
    setReceiptOrder(completedOrder);
  };

  // Helper to Return Stock to Inventory for an order
  const restoreOrderStockToInventory = (orderToCancel: Order, reasonText: string) => {
    let updatedMenuItems = [...menuItems];
    let newLogs: StockAdjustmentLog[] = [...stockLogs];

    orderToCancel.items.forEach((item) => {
      const targetIndex = updatedMenuItems.findIndex(m => m.id === item.itemId);
      if (targetIndex > -1) {
        const prevStock = updatedMenuItems[targetIndex].stockQuantity;
        const newStock = prevStock + item.quantity;

        updatedMenuItems[targetIndex] = {
          ...updatedMenuItems[targetIndex],
          stockQuantity: newStock,
          status: newStock > 0 ? 'Available' : updatedMenuItems[targetIndex].status
        };

        newLogs.unshift({
          id: `log-${Date.now()}-${Math.random()}`,
          itemId: item.itemId,
          itemName: item.name,
          type: 'Return',
          quantityChange: item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          reason: `${reasonText} (Order #${orderToCancel.orderNumber || orderToCancel.id})`,
          timestamp: new Date().toISOString(),
          actor: currentShift?.cashierName || currentUser?.fullName || 'System'
        });
      }
    });

    updateMenuItemsState(updatedMenuItems);
    updateStockLogsState(newLogs);
  };

  // Helper to release table if no other active order exists on it
  const releaseTableIfEmpty = (tableId?: string) => {
    if (!tableId) return;
    const remainingActiveOrders = orders.filter(
      o => o.tableId === tableId && o.status !== 'Cancelled' && o.status !== 'Paid'
    );
    if (remainingActiveOrders.length <= 1) {
      const updatedTables = tables.map(t => {
        if (t.id === tableId) {
          return {
            ...t,
            status: 'Available' as TableStatus,
            currentOrderId: undefined
          };
        }
        return t;
      });
      updateTablesState(updatedTables);
    }
  };

  // 1. Cancel Order with Direct Stock Restoration
  const handleCancelOrderAndReturnStock = (orderToCancel: Order) => {
    playSound('order');

    // Return Stock if not already cancelled
    if (orderToCancel.status !== 'Cancelled') {
      restoreOrderStockToInventory(orderToCancel, 'Direct Stock Restoration on Order Cancellation');
    }

    // Release Table
    if (orderToCancel.tableId) {
      releaseTableIfEmpty(orderToCancel.tableId);
    }

    // Update Order Status
    const updatedOrder: Order = {
      ...orderToCancel,
      status: 'Cancelled',
      paymentStatus: 'UNPAID'
    };

    const updatedOrders = orders.map(o => o.id === orderToCancel.id ? updatedOrder : o);
    updateOrdersState(updatedOrders);

    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        userEmail: currentUser.email,
        action: 'Cancel Order & Return Stock',
        category: 'Sales',
        details: `Cancelled order #${orderToCancel.orderNumber || orderToCancel.id} - ${orderToCancel.items.length} items directly returned to inventory stock`
      });
    }
  };

  // 2. Delete Order completely with Direct Stock Restoration
  const handleDeleteOrderAndReturnStock = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    if (targetOrder.status !== 'Cancelled') {
      restoreOrderStockToInventory(targetOrder, 'Stock Restored on Order Deletion');
      if (targetOrder.tableId) {
        releaseTableIfEmpty(targetOrder.tableId);
      }
    }

    const updatedOrders = orders.filter(o => o.id !== orderId);
    updateOrdersState(updatedOrders);

    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        userEmail: currentUser.email,
        action: 'Delete Order & Return Stock',
        category: 'Sales',
        details: `Deleted order #${targetOrder.orderNumber || targetOrder.id} - Stock restored`
      });
    }
  };

  // 3. Save Comprehensive Order Edits (Table, Waiter, Items, Customer)
  const handleSaveOrderEdits = (updatedOrder: Order) => {
    playSound('order');

    const oldOrder = orders.find(o => o.id === updatedOrder.id);
    if (!oldOrder) return;

    // Check item quantity changes & adjust stock accordingly
    let updatedMenuItems = [...menuItems];
    let newLogs: StockAdjustmentLog[] = [...stockLogs];

    // Find items that were changed or removed
    oldOrder.items.forEach(oldItem => {
      const newItem = updatedOrder.items.find(i => i.itemId === oldItem.itemId);
      const newQty = newItem ? newItem.quantity : 0;
      const diff = newQty - oldItem.quantity; // positive means added, negative means returned

      if (diff !== 0) {
        const targetIdx = updatedMenuItems.findIndex(m => m.id === oldItem.itemId);
        if (targetIdx > -1) {
          const prevStock = updatedMenuItems[targetIdx].stockQuantity;
          const newStock = Math.max(0, prevStock - diff);

          updatedMenuItems[targetIdx] = {
            ...updatedMenuItems[targetIdx],
            stockQuantity: newStock,
            status: newStock === 0 ? 'Out of Stock' : 'Available'
          };

          newLogs.unshift({
            id: `log-${Date.now()}-${Math.random()}`,
            itemId: oldItem.itemId,
            itemName: oldItem.name,
            type: diff < 0 ? 'Return' : 'Sale',
            quantityChange: -diff,
            previousStock: prevStock,
            newStock: newStock,
            reason: `Order Edit #${updatedOrder.orderNumber || updatedOrder.id} (${diff < 0 ? 'Item Returned to Stock' : 'Item Added'})`,
            timestamp: new Date().toISOString(),
            actor: currentShift?.cashierName || currentUser?.fullName || 'System'
          });
        }
      }
    });

    // Find brand new items added in edit
    updatedOrder.items.forEach(newItem => {
      const existsInOld = oldOrder.items.some(i => i.itemId === newItem.itemId);
      if (!existsInOld) {
        const targetIdx = updatedMenuItems.findIndex(m => m.id === newItem.itemId);
        if (targetIdx > -1) {
          const prevStock = updatedMenuItems[targetIdx].stockQuantity;
          const newStock = Math.max(0, prevStock - newItem.quantity);

          updatedMenuItems[targetIdx] = {
            ...updatedMenuItems[targetIdx],
            stockQuantity: newStock,
            status: newStock === 0 ? 'Out of Stock' : 'Available'
          };

          newLogs.unshift({
            id: `log-${Date.now()}-${Math.random()}`,
            itemId: newItem.itemId,
            itemName: newItem.name,
            type: 'Sale',
            quantityChange: -newItem.quantity,
            previousStock: prevStock,
            newStock: newStock,
            reason: `Order Edit #${updatedOrder.orderNumber || updatedOrder.id} (New Item Added)`,
            timestamp: new Date().toISOString(),
            actor: currentShift?.cashierName || currentUser?.fullName || 'System'
          });
        }
      }
    });

    updateMenuItemsState(updatedMenuItems);
    updateStockLogsState(newLogs);

    // Table Reassignment handling
    if (oldOrder.tableId !== updatedOrder.tableId) {
      let updatedTables = [...tables];

      // Release old table if no other active order
      if (oldOrder.tableId) {
        const remainingOnOld = orders.filter(o => o.id !== oldOrder.id && o.tableId === oldOrder.tableId && o.status !== 'Cancelled' && o.status !== 'Paid');
        if (remainingOnOld.length === 0) {
          updatedTables = updatedTables.map(t => t.id === oldOrder.tableId ? { ...t, status: 'Available' as TableStatus, currentOrderId: undefined } : t);
        }
      }

      // Assign new table
      if (updatedOrder.tableId) {
        updatedTables = updatedTables.map(t => t.id === updatedOrder.tableId ? { ...t, status: 'Occupied' as TableStatus, currentOrderId: updatedOrder.id, assignedWaiterId: updatedOrder.waiterId } : t);
      }

      updateTablesState(updatedTables);
    }

    // Save updated order
    const updatedOrders = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    updateOrdersState(updatedOrders);

    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        userEmail: currentUser.email,
        action: 'Edit Order',
        category: 'Sales',
        details: `Edited order #${updatedOrder.orderNumber || updatedOrder.id}: Table updated to ${updatedOrder.tableNumber}, Waiter: ${updatedOrder.waiterName}, Total: ${updatedOrder.total}`
      });
    }
  };

  // Handle Updating Existing Order (Payments, Added Items, Status Changes)
  const handleUpdateOrder = (updatedOrder: Order, newKot?: KitchenTicket) => {
    playSound('order');
    const oldOrder = orders.find(o => o.id === updatedOrder.id);
    
    // If order is changed to Cancelled, trigger stock restoration
    if (updatedOrder.status === 'Cancelled' && oldOrder && oldOrder.status !== 'Cancelled') {
      restoreOrderStockToInventory(updatedOrder, 'Restored stock on order cancellation');
      if (updatedOrder.tableId) {
        releaseTableIfEmpty(updatedOrder.tableId);
      }
    }

    const updatedOrders = orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    updateOrdersState(updatedOrders);

    if (newKot) {
      playSound('kitchen');
      updateKitchenTicketsState([newKot, ...kitchenTickets]);
    }

    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        userEmail: currentUser.email,
        action: 'Update Order',
        category: 'Sales',
        details: `Updated order #${updatedOrder.id} status to ${updatedOrder.status} / Payment: ${updatedOrder.paymentStatus}`
      });
    }
  };

  // Kitchen Ticket Status Updates
  const handleUpdateKitchenStatus = (ticketId: string, newStatus: KitchenTicketStatus) => {
    const updated = kitchenTickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t);
    updateKitchenTicketsState(updated);
  };

  // Table Status Update
  const handleUpdateTableStatus = (tableId: string, newStatus: TableStatus, waiterId?: string) => {
    const updated = tables.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status: newStatus,
          assignedWaiterId: waiterId || t.assignedWaiterId,
          currentOrderId: newStatus === 'Available' ? undefined : t.currentOrderId
        };
      }
      return t;
    });
    updateTablesState(updated);
  };

  // Open Table Order in POS
  const handleOpenTableOrder = (table: Table) => {
    setActiveTab('pos');
  };

  // Stock Adjustment Manual Action
  const handleUpdateStock = (
    itemId: string, 
    qtyChange: number, 
    type: StockAdjustmentLog['type'], 
    reason: string
  ) => {
    const targetIdx = menuItems.findIndex(m => m.id === itemId);
    if (targetIdx === -1) return;

    const prevStock = menuItems[targetIdx].stockQuantity;
    const newStock = Math.max(0, prevStock + qtyChange);

    const updatedItems = [...menuItems];
    updatedItems[targetIdx] = {
      ...updatedItems[targetIdx],
      stockQuantity: newStock,
      status: newStock > 0 ? 'Available' : 'Out of Stock'
    };

    const newLog: StockAdjustmentLog = {
      id: `log-${Date.now()}`,
      itemId,
      itemName: menuItems[targetIdx].name,
      type,
      quantityChange: qtyChange,
      previousStock: prevStock,
      newStock,
      reason,
      timestamp: new Date().toISOString(),
      actor: currentShift?.cashierName || currentUser?.fullName || 'Bar Manager'
    };

    updateMenuItemsState(updatedItems);
    updateStockLogsState([newLog, ...stockLogs]);

    if (currentUser) {
      addAuditLog({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        userEmail: currentUser.email,
        action: 'Manual Stock Adjustment',
        category: 'Inventory',
        details: `Adjusted stock for ${menuItems[targetIdx].name} (${qtyChange > 0 ? '+' : ''}${qtyChange}) - Reason: ${reason}`
      });
    }
  };

  // Open New Shift
  const handleOpenShift = (cashierName: string, openingCash: number) => {
    const newShift: Shift = {
      id: `sh-${Math.floor(500 + Math.random() * 500)}`,
      cashierName,
      cashierId: `c-${Date.now()}`,
      openedAt: new Date().toISOString(),
      openingCash,
      status: 'Open'
    };

    updateCurrentShiftState(newShift);
    updateShiftsState([newShift, ...shifts]);

    // Record Opening Cash Movement
    addCashMovement({
      amount: openingCash,
      movementType: 'Opening Cash',
      reason: `Shift Opened with Float RWF ${openingCash.toLocaleString()}`,
      user: cashierName,
      shiftId: newShift.id,
      referenceId: newShift.id
    });
    setCashMovements(loadCashMovements());
  };

  // Close Active Shift
  const handleCloseShift = (actualCash: number, notes?: string) => {
    if (!currentShift) return;

    const shiftOrders = orders.filter(o => o.shiftId === currentShift.id);
    const paidShiftOrders = shiftOrders.filter(o => o.status === 'Paid');
    const cashCollected = paidShiftOrders.reduce((sum, o) => sum + (o.paymentDetails?.cashPaid || 0) - (o.paymentDetails?.changeGiven || 0), 0);
    const cardCollected = paidShiftOrders.reduce((sum, o) => sum + (o.paymentDetails?.cardPaid || 0), 0);
    const momoCollected = paidShiftOrders.reduce((sum, o) => sum + (o.paymentDetails?.mobileMoneyPaid || 0), 0);
    const creditSalesTotal = shiftOrders.filter(o => o.paymentStatus === 'CREDIT').reduce((sum, o) => sum + (o.balance > 0 ? o.balance : o.total), 0);
    
    const expectedCash = currentShift.openingCash + cashCollected;
    const diff = actualCash - expectedCash;

    const closedShift: Shift = {
      ...currentShift,
      closedAt: new Date().toISOString(),
      closingCashExpected: expectedCash,
      closingCashActual: actualCash,
      difference: diff,
      status: 'Closed',
      notes
    };

    const updatedAllShifts = shifts.map(s => s.id === closedShift.id ? closedShift : s);
    updateShiftsState(updatedAllShifts);
    updateCurrentShiftState(null);

    // Record Closing Cash Movement
    addCashMovement({
      amount: actualCash,
      movementType: 'Closing Cash',
      reason: `Shift Closed - Drawer Cash RWF ${actualCash.toLocaleString()}`,
      user: currentShift.cashierName,
      shiftId: currentShift.id,
      referenceId: currentShift.id
    });
    setCashMovements(loadCashMovements());

    // Record Daily Closing Reconciliation Record
    addDailyClosing({
      date: new Date().toISOString().split('T')[0],
      closedBy: currentShift.cashierName,
      shiftId: currentShift.id,
      openingCash: currentShift.openingCash,
      cashSales: cashCollected,
      cardSales: cardCollected,
      mobileMoneySales: momoCollected,
      creditSales: creditSalesTotal,
      expensesTotal: expenses.reduce((s, e) => s + e.amount, 0),
      creditCollectedTotal: 0,
      outstandingCredit: creditSalesTotal,
      cashDeposited: actualCash,
      expectedCash,
      actualCash,
      difference: diff,
      differenceReason: notes || (diff === 0 ? 'Balanced' : `Discrepancy of RWF ${diff}`),
      approvedBy: currentUser?.fullName || 'Manager',
      varianceStatus: diff === 0 ? 'Approved' : 'Pending Review'
    });
    setDailyClosings(loadDailyClosings());
  };

  // Manager Actions
  const handleSaveMenuItem = (item: MenuItem) => {
    const exists = menuItems.some(m => m.id === item.id);
    if (exists) {
      updateMenuItemsState(menuItems.map(m => m.id === item.id ? item : m));
    } else {
      updateMenuItemsState([...menuItems, item]);
    }
  };

  const handleDeleteMenuItem = (itemId: string) => {
    if (confirm('Delete this menu item from catalog?')) {
      updateMenuItemsState(menuItems.filter(m => m.id !== itemId));
    }
  };

  const handleSaveWaiter = (waiter: Waiter) => {
    const exists = waiters.some(w => w.id === waiter.id);
    if (exists) {
      updateWaitersState(waiters.map(w => w.id === waiter.id ? waiter : w));
    } else {
      updateWaitersState([...waiters, waiter]);
    }
  };

  const handleSaveTable = (table: Table) => {
    const exists = tables.some(t => t.id === table.id);
    let updatedTables: Table[];
    if (exists) {
      updatedTables = tables.map(t => t.id === table.id ? table : t);
    } else {
      updatedTables = [...tables, table];
    }
    updateTablesState(updatedTables);
    addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.fullName || 'Manager',
      userRole: currentUser?.role || 'Admin',
      userEmail: currentUser?.email || '',
      action: exists ? 'Update Table' : 'Create Table',
      category: 'Tables',
      details: `${exists ? 'Updated' : 'Created'} Table ${table.tableNumber} (${table.tableTag})`
    });
  };

  const handleDeleteTable = (tableId: string) => {
    const tableToDelete = tables.find(t => t.id === tableId);
    if (!tableToDelete) return;

    // Active order check
    const hasActiveOrders = orders.some(o => 
      (o.tableId === tableId || o.tableNumber === tableToDelete.tableNumber) && 
      o.status !== 'Paid' && 
      o.status !== 'Cancelled'
    );

    if (hasActiveOrders) {
      alert('This table has active orders and cannot be deleted.');
      return;
    }

    const updatedTables = tables.filter(t => t.id !== tableId);
    updateTablesState(updatedTables);
    addAuditLog({
      userId: currentUser?.id || 'sys',
      userName: currentUser?.fullName || 'Manager',
      userRole: currentUser?.role || 'Admin',
      userEmail: currentUser?.email || '',
      action: 'Delete Table',
      category: 'Tables',
      details: `Deleted Table ${tableToDelete.tableNumber} (${tableToDelete.tableTag})`
    });
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data?')) {
      resetAllDataToDefault();
      window.location.reload();
    }
  };

  // Unauthenticated Guard
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} darkMode={darkMode} />;
  }

  // Pending counts
  const pendingKitchenCount = kitchenTickets.filter(k => k.status === 'Pending' || k.status === 'Preparing').length;
  const unpaidOrdersCount = orders.filter(o => o.paymentStatus !== 'PAID' && o.status !== 'Cancelled').length;
  const lowStockCount = menuItems.filter(m => m.stockQuantity <= (m.minStockAlert || 5) && m.status === 'Available').length;

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>

      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-black flex flex-col sm:flex-row items-center justify-between shadow-lg sticky top-0 z-50 border-b border-amber-600 gap-2">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 animate-bounce text-slate-950 shrink-0" />
            <span>Offline Mode — Network disconnected. System operating in local safe mode. Pending changes will auto-synchronize when connection is restored.</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[10px] bg-slate-950 text-amber-400 font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
              Offline Queue Active
            </span>
          </div>
        </div>
      )}
      
      {/* Top Header */}
      <Header
        currentShift={currentShift}
        userRole={userRole}
        setUserRole={setUserRole}
        currentUser={currentUser}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lowStockCount={lowStockCount}
        openShiftModal={() => setActiveTab('shifts')}
        onNavigateToStock={() => setActiveTab('stock')}
      />

      {/* Main Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingKitchenCount={pendingKitchenCount}
        unpaidOrdersCount={unpaidOrdersCount}
        lowStockCount={lowStockCount}
        userRole={userRole}
        darkMode={darkMode}
      />

      {/* Primary Module Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            orders={orders}
            tables={tables}
            kitchenTickets={kitchenTickets}
            menuItems={menuItems}
            currentShift={currentShift}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'order_center' && (
          <OrderCenterList
            orders={orders}
            tables={tables}
            waiters={waiters}
            menuItems={menuItems}
            guestRooms={guestRooms}
            cashierName={currentShift?.cashierName || currentUser.fullName}
            userRole={userRole}
            darkMode={darkMode}
            onUpdateOrder={handleUpdateOrder}
            onSaveOrderEdits={handleSaveOrderEdits}
            onCancelOrderAndReturnStock={handleCancelOrderAndReturnStock}
            onDeleteOrderAndReturnStock={handleDeleteOrderAndReturnStock}
            onPrintReceipt={(ord) => setReceiptOrder(ord)}
            onOpenPosForNewOrder={() => setActiveTab('pos')}
          />
        )}

        {activeTab === 'pos' && (
          <PosTerminal
            menuItems={menuItems}
            tables={tables}
            waiters={waiters}
            guestRooms={guestRooms}
            currentShift={currentShift}
            onOrderCompleted={handleOrderCompleted}
            darkMode={darkMode}
            openShiftModal={() => setActiveTab('shifts')}
          />
        )}

        {activeTab === 'tables' && (
          <TablesGrid
            tables={tables}
            waiters={waiters}
            orders={orders}
            onUpdateTableStatus={handleUpdateTableStatus}
            onOpenTableOrder={handleOpenTableOrder}
            onSaveTable={handleSaveTable}
            onDeleteTable={handleDeleteTable}
            currentUser={currentUser}
            userRole={userRole}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'kitchen' && (
          <KitchenTickets
            kitchenTickets={kitchenTickets}
            onUpdateStatus={handleUpdateKitchenStatus}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'pool_sauna' && (
          <PoolSaunaModule
            menuItems={menuItems}
            currentShift={currentShift}
            onTicketSold={(order) => handleOrderCompleted(order)}
            darkMode={darkMode}
            openShiftModal={() => setActiveTab('shifts')}
          />
        )}

        {activeTab === 'stock' && (
          <StockManagement
            menuItems={menuItems}
            stockLogs={stockLogs}
            onUpdateStock={handleUpdateStock}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'shifts' && (
          <ShiftManager
            currentShift={currentShift}
            allShifts={shifts}
            orders={orders}
            onOpenShift={handleOpenShift}
            onCloseShift={handleCloseShift}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'report' && (
          <DailyReportView
            orders={orders}
            menuItems={menuItems}
            currentShift={currentShift}
            allShifts={shifts}
            guestRooms={guestRooms}
            expenses={expenses}
            cashMovements={cashMovements}
            dailyClosings={dailyClosings}
            currentUser={currentUser}
            onAddExpense={handleAddExpense}
            onAddCashMovement={handleAddCashMovement}
            onUpdateOrder={handleUpdateOrder}
            onUpdateDailyClosing={(updatedClosings) => updateDailyClosingsState(updatedClosings)}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'products_services' && (userRole === 'Manager' || userRole === 'Super Admin') && (
          <ProductServiceManager
            menuItems={menuItems}
            onSaveMenuItem={handleSaveMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'users' && (userRole === 'Manager' || userRole === 'Super Admin') && (
          <UserManagement
            currentUser={currentUser}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'audit_logs' && (userRole === 'Manager' || userRole === 'Super Admin') && (
          <AuditLogView
            darkMode={darkMode}
          />
        )}

        {activeTab === 'settings' && (userRole === 'Manager' || userRole === 'Super Admin') && (
          <ManagerSettings
            menuItems={menuItems}
            waiters={waiters}
            onSaveMenuItem={handleSaveMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onSaveWaiter={handleSaveWaiter}
            onResetData={handleResetData}
            darkMode={darkMode}
          />
        )}
      </main>

      {/* Thermal Receipt Printable Modal */}
      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
          darkMode={darkMode}
        />
      )}

    </div>
  );
}

