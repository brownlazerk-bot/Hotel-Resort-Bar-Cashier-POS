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

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('Cashier');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

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

  // Load Initial Data & Session from Storage
  useEffect(() => {
    const loggedInUser = loadCurrentUser();
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
      setUserRole(loggedInUser.role === 'Super Admin' || loggedInUser.role === 'Admin' || loggedInUser.role === 'Manager' ? 'Manager' : 'Cashier');
    }

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
  }, []);

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

  // Handle Updating Existing Order (Payments, Added Items, Status Changes)
  const handleUpdateOrder = (updatedOrder: Order, newKot?: KitchenTicket) => {
    playSound('order');
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
            waiters={waiters}
            menuItems={menuItems}
            guestRooms={guestRooms}
            cashierName={currentShift?.cashierName || currentUser.fullName}
            userRole={userRole}
            darkMode={darkMode}
            onUpdateOrder={handleUpdateOrder}
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

