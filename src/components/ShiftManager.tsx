import React, { useState } from 'react';
import { 
  ReceiptText, DollarSign, Clock, CheckCircle2, AlertTriangle, 
  Download, LogOut, Lock, Key, RefreshCw, Calendar, User, FileText, ChevronRight, Search, ShieldAlert, Layers
} from 'lucide-react';
import { Shift, Order, Expense, KitchenTicket, User as UserType } from '../types';
import { exportShiftReportPDF } from '../lib/exporter';

interface ShiftManagerProps {
  currentShift: Shift | null;
  allShifts: Shift[];
  orders: Order[];
  expenses?: Expense[];
  kitchenTickets?: KitchenTicket[];
  currentUser?: UserType | null;
  userRole?: string;
  onOpenShift: (cashierName: string, openingCash: number, businessDate?: string) => void;
  onCloseShift: (actualCash: number, notes?: string) => void;
  onReopenShift?: (shiftId: string) => void;
  darkMode: boolean;
}

export const ShiftManager: React.FC<ShiftManagerProps> = ({
  currentShift,
  allShifts,
  orders,
  expenses = [],
  kitchenTickets = [],
  currentUser,
  userRole = 'Manager',
  onOpenShift,
  onCloseShift,
  onReopenShift,
  darkMode
}) => {
  const isAdmin = userRole === 'Admin' || userRole === 'Super Admin' || currentUser?.isSuperAdmin;

  // State for Open Shift
  const todayFormattedDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const [cashierNameInput, setCashierNameInput] = useState<string>(currentUser?.fullName || 'Alice Johnson');
  const [openingCashInput, setOpeningCashInput] = useState<string>('200.00');
  const [businessDateInput, setBusinessDateInput] = useState<string>(todayFormattedDate);

  // State for Close Shift
  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [closeNotesInput, setCloseNotesInput] = useState<string>('');
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState<boolean>(false);

  // History search and selected shift for modal viewing
  const [historySearch, setHistorySearch] = useState<string>('');
  const [selectedShiftDetails, setSelectedShiftDetails] = useState<Shift | null>(null);

  // Next Shift Number preview
  const maxShiftNum = allShifts.reduce((max, s) => Math.max(max, s.shiftNumber || 0), 249);
  const nextShiftNumber = maxShiftNum + 1;

  // Active shift calculations
  const shiftOrders = currentShift ? orders.filter(o => o.shiftId === currentShift.id) : [];
  const paidOrders = shiftOrders.filter(o => o.status === 'Paid' || o.paymentStatus === 'PAID' || o.paymentStatus === 'PARTIALLY PAID');
  const totalSales = paidOrders.reduce((sum, o) => sum + o.total, 0);

  const cashCollected = paidOrders.reduce((sum, o) => sum + (o.paymentDetails?.cashPaid || 0) - (o.paymentDetails?.changeGiven || 0), 0);
  const cardCollected = paidOrders.reduce((sum, o) => sum + (o.paymentDetails?.cardPaid || 0), 0);
  const momoCollected = paidOrders.reduce((sum, o) => sum + (o.paymentDetails?.mobileMoneyPaid || 0), 0);
  const roomCollected = paidOrders.reduce((sum, o) => sum + (o.paymentDetails?.roomChargeAmount || 0), 0);
  const creditSales = shiftOrders.filter(o => o.paymentStatus === 'CREDIT').reduce((sum, o) => sum + (o.balance > 0 ? o.balance : o.total), 0);

  const shiftExpensesList = currentShift ? expenses.filter(e => e.shiftId === currentShift.id || (e.date && e.date.startsWith(currentShift.businessDate || ''))) : [];
  const totalExpenses = shiftExpensesList.reduce((sum, e) => sum + (e.amount || 0), 0);

  const expectedCashInDrawer = (currentShift?.openingCash || 0) + cashCollected - totalExpenses;

  // Time since shift open
  const getElapsedTime = (openedAtIso?: string) => {
    if (!openedAtIso) return 'N/A';
    const diffMs = Date.now() - new Date(openedAtIso).getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenShift(cashierNameInput.trim() || 'Cashier', parseFloat(openingCashInput) || 0, businessDateInput.trim());
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCloseConfirmModal(true);
  };

  const confirmCloseShift = () => {
    const actual = parseFloat(actualCashInput) || 0;
    onCloseShift(actual, closeNotesInput);
    setShowCloseConfirmModal(false);
    setActualCashInput('');
    setCloseNotesInput('');
  };

  const filteredClosedShifts = allShifts
    .filter(s => s.status === 'Closed')
    .filter(s => {
      if (!historySearch.trim()) return true;
      const q = historySearch.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        (s.shiftNumber && s.shiftNumber.toString().includes(q)) ||
        (s.cashierName && s.cashierName.toLowerCase().includes(q)) ||
        (s.businessDate && s.businessDate.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ReceiptText className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center space-x-2">
                <span>Manual Business Shift Management</span>
                {currentShift ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white uppercase tracking-wider animate-pulse">
                    Shift Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider">
                    No Shift Open
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Overnight business shift register. Manual closing determines business day cutoff (not midnight calendar).
              </p>
            </div>
          </div>

          {currentShift && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportShiftReportPDF(currentShift, orders)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold flex items-center space-x-2 text-gray-900 dark:text-white transition-colors"
              >
                <Download className="w-4 h-4 text-amber-500" />
                <span>Export Active Shift PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Active Shift Overview OR Open Shift Form */}
        <div className="lg:col-span-7 space-y-6">
          {currentShift ? (
            <div className={`p-6 rounded-2xl border space-y-6 transition-colors shadow-sm ${
              darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              
              {/* Active Shift Header Card */}
              <div className="flex flex-wrap justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-5 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-500 text-white uppercase tracking-wider">
                      SHIFT #{currentShift.shiftNumber || nextShiftNumber - 1}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      📅 Business Date: {currentShift.businessDate || todayFormattedDate}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-2">
                    Cashier / Manager: {currentShift.cashierName}
                  </h3>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Opened: {new Date(currentShift.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(currentShift.openedAt).toLocaleDateString()})</span>
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Elapsed: {getElapsedTime(currentShift.openedAt)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Live Shift Sales</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ${totalSales.toFixed(2)}
                  </p>
                  <p className="text-[11px] font-medium text-gray-500">{paidOrders.length} Paid Orders</p>
                </div>
              </div>

              {/* Financial Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Starting Float Cash</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white mt-0.5">${currentShift.openingCash.toFixed(2)}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase">Cash Collected</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">${cashCollected.toFixed(2)}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase">Expected Cash in Drawer</p>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">${expectedCashInDrawer.toFixed(2)}</p>
                </div>
              </div>

              {/* Payment Method Breakdown */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                <p className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                  Payment Channels Breakdown
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-medium">
                  <div>Card Sales: <span className="font-bold text-gray-900 dark:text-white">${cardCollected.toFixed(2)}</span></div>
                  <div>MoMo Sales: <span className="font-bold text-gray-900 dark:text-white">${momoCollected.toFixed(2)}</span></div>
                  <div>Room Charges: <span className="font-bold text-gray-900 dark:text-white">${roomCollected.toFixed(2)}</span></div>
                  <div>Debt / Credit: <span className="font-bold text-amber-600 dark:text-amber-400">${creditSales.toFixed(2)}</span></div>
                </div>
                {totalExpenses > 0 && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 text-rose-600 dark:text-rose-400 font-bold">
                    Shift Expenses Deducted: -${totalExpenses.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Close Shift Form */}
              <form onSubmit={handleCloseShiftSubmit} className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-2">
                  <LogOut className="w-5 h-5 text-rose-500" />
                  <h4 className="font-bold text-base text-gray-900 dark:text-white">Close Active Shift & Reconcile Cash</h4>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                    Physical Drawer Cash Count ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={actualCashInput}
                    onChange={(e) => setActualCashInput(e.target.value)}
                    placeholder={`Enter counted cash (Expected: $${expectedCashInDrawer.toFixed(2)})`}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xl font-mono font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {parseFloat(actualCashInput) >= 0 && (
                  <div className={`p-3.5 rounded-xl border text-xs font-bold flex justify-between items-center ${
                    parseFloat(actualCashInput) - expectedCashInDrawer === 0
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                  }`}>
                    <span className="flex items-center space-x-1.5">
                      {parseFloat(actualCashInput) - expectedCashInDrawer === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                      )}
                      <span>Drawer Discrepancy (Over / Short):</span>
                    </span>
                    <span className="font-mono font-black text-sm">
                      ${(parseFloat(actualCashInput) - expectedCashInDrawer).toFixed(2)}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-gray-300">
                    Manager Handover Remark / Notes
                  </label>
                  <input
                    type="text"
                    value={closeNotesInput}
                    onChange={(e) => setCloseNotesInput(e.target.value)}
                    placeholder="e.g. Balanced shift, night audit completed smoothly"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center justify-center space-x-2 transition-transform active:scale-[0.99]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Review & Close Shift #{currentShift.shiftNumber || nextShiftNumber - 1}</span>
                </button>
              </form>

            </div>
          ) : (
            /* Open Shift Form */
            <div className={`p-6 rounded-2xl border transition-colors shadow-sm space-y-6 ${
              darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center space-x-3 border-b border-gray-200 dark:border-gray-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Open New Business Shift #{nextShiftNumber}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Assign manager, opening float balance, and Business Date to start transactions.
                  </p>
                </div>
              </div>

              <form onSubmit={handleOpenShiftSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-gray-300">
                    Business Date (Not Calendar Day)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={businessDateInput}
                      onChange={(e) => setBusinessDateInput(e.target.value)}
                      placeholder="e.g. 10 August 2026"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    All sales, orders, and payments made during overnight hours will belong to this Business Date until shift closure.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-gray-300">
                    Manager / Cashier Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cashierNameInput}
                      onChange={(e) => setCashierNameInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-gray-300">
                    Starting Float Cash Amount ($)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={openingCashInput}
                      onChange={(e) => setOpeningCashInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono font-bold border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-transform active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Start Business Shift #{nextShiftNumber}</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Shift History & Audit Log */}
        <div className="lg:col-span-5 space-y-4">
          <div className={`p-5 rounded-2xl border transition-colors shadow-sm ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Closed Shifts Audit History</span>
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                {filteredClosedShifts.length} closed
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search shift #, cashier, or business date..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {filteredClosedShifts.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 space-y-2">
                  <ReceiptText className="w-8 h-8 mx-auto opacity-30" />
                  <p>No closed shifts found.</p>
                </div>
              ) : (
                filteredClosedShifts.map((s) => (
                  <div 
                    key={s.id} 
                    className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs space-y-2 hover:border-amber-500/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedShiftDetails(s)}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono text-[10px]">
                          Shift #{s.shiftNumber || s.id}
                        </span>
                        <span className="text-gray-900 dark:text-white font-bold">{s.cashierName}</span>
                      </div>
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                        📅 {s.businessDate || 'N/A'}
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Opened: {new Date(s.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Closed: {s.closedAt ? new Date(s.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Closed'}</span>
                    </div>

                    <div className="flex justify-between font-mono text-[11px] pt-1.5 border-t border-gray-200 dark:border-gray-700">
                      <span>Float: ${s.openingCash.toFixed(2)}</span>
                      <span>Counted: ${s.closingCashActual?.toFixed(2)}</span>
                      <span className={s.difference && s.difference < 0 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                        Diff: ${s.difference?.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportShiftReportPDF(s, orders);
                        }}
                        className="text-[10px] font-bold text-amber-600 hover:underline flex items-center space-x-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download PDF</span>
                      </button>

                      {isAdmin && onReopenShift && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Admin Action: Reopen Shift #${s.shiftNumber || s.id}?`)) {
                              onReopenShift(s.id);
                            }
                          }}
                          className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Reopen (Admin)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Shift Close Review Modal */}
      {showCloseConfirmModal && currentShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className={`relative max-w-md w-full rounded-2xl p-6 shadow-2xl border space-y-4 ${
            darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex items-center space-x-3 border-b border-gray-200 dark:border-gray-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Confirm Shift Closure</h3>
                <p className="text-xs text-gray-500">Shift #{currentShift.shiftNumber || nextShiftNumber - 1} - {currentShift.businessDate}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <div className="flex justify-between">
                <span>Total Shift Sales:</span>
                <span className="font-bold">${totalSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Sales Collected:</span>
                <span className="font-bold">${cashCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Starting Float:</span>
                <span className="font-bold">${currentShift.openingCash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Drawer Cash:</span>
                <span className="font-bold text-amber-600">${expectedCashInDrawer.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 font-bold text-sm">
                <span>Actual Counted Cash:</span>
                <span className="text-emerald-500">${(parseFloat(actualCashInput) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs pt-1">
                <span>Discrepancy (Difference):</span>
                <span className={((parseFloat(actualCashInput) || 0) - expectedCashInDrawer) < 0 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                  ${((parseFloat(actualCashInput) || 0) - expectedCashInDrawer).toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Closing this shift will finalize all transaction records under Business Date <strong>{currentShift.businessDate}</strong>.
            </p>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCloseConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCloseShift}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20"
              >
                Confirm & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Historical Shift Detail Modal */}
      {selectedShiftDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className={`relative max-w-lg w-full rounded-2xl p-6 shadow-2xl border space-y-4 ${
            darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase">
                  Shift #{selectedShiftDetails.shiftNumber || selectedShiftDetails.id}
                </span>
                <h3 className="font-bold text-lg mt-1">Cashier: {selectedShiftDetails.cashierName}</h3>
                <p className="text-xs text-gray-500">Business Date: {selectedShiftDetails.businessDate || 'N/A'}</p>
              </div>
              <button 
                onClick={() => setSelectedShiftDetails(null)}
                className="text-gray-400 hover:text-white font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>Opened: <span className="font-bold">{new Date(selectedShiftDetails.openedAt).toLocaleString()}</span></div>
                <div>Closed: <span className="font-bold">{selectedShiftDetails.closedAt ? new Date(selectedShiftDetails.closedAt).toLocaleString() : 'N/A'}</span></div>
                <div>Opening Float: <span className="font-bold">${selectedShiftDetails.openingCash.toFixed(2)}</span></div>
                <div>Counted Cash: <span className="font-bold">${selectedShiftDetails.closingCashActual?.toFixed(2) || '0.00'}</span></div>
              </div>

              {selectedShiftDetails.notes && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-300">
                  <strong>Notes:</strong> {selectedShiftDetails.notes}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => exportShiftReportPDF(selectedShiftDetails, orders)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
