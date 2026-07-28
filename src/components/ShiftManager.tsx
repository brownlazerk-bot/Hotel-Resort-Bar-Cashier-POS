import React, { useState } from 'react';
import { 
  ReceiptText, DollarSign, Clock, CheckCircle2, AlertTriangle, 
  Download, LogOut, Lock, Key 
} from 'lucide-react';
import { Shift, Order } from '../types';
import { exportShiftReportPDF } from '../lib/exporter';

interface ShiftManagerProps {
  currentShift: Shift | null;
  allShifts: Shift[];
  orders: Order[];
  onOpenShift: (cashierName: string, openingCash: number) => void;
  onCloseShift: (actualCash: number, notes?: string) => void;
  darkMode: boolean;
}

export const ShiftManager: React.FC<ShiftManagerProps> = ({
  currentShift,
  allShifts,
  orders,
  onOpenShift,
  onCloseShift,
  darkMode
}) => {
  const [cashierNameInput, setCashierNameInput] = useState<string>('Alice Johnson');
  const [openingCashInput, setOpeningCashInput] = useState<string>('200.00');
  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [closeNotesInput, setCloseNotesInput] = useState<string>('');

  // Calculate live shift numbers if shift is active
  const shiftOrders = currentShift ? orders.filter(o => o.shiftId === currentShift.id && o.status === 'Paid') : [];
  const shiftTotalRev = shiftOrders.reduce((sum, o) => sum + o.total, 0);
  const shiftCashCollected = shiftOrders.reduce((sum, o) => sum + (o.paymentDetails?.cashPaid || 0) - (o.paymentDetails?.changeGiven || 0), 0);
  const shiftCardCollected = shiftOrders.reduce((sum, o) => sum + (o.paymentDetails?.cardPaid || 0), 0);
  const shiftMomoCollected = shiftOrders.reduce((sum, o) => sum + (o.paymentDetails?.mobileMoneyPaid || 0), 0);
  const shiftRoomCollected = shiftOrders.reduce((sum, o) => sum + (o.paymentDetails?.roomChargeAmount || 0), 0);

  const expectedCashInDrawer = (currentShift?.openingCash || 0) + shiftCashCollected;

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenShift(cashierNameInput.trim() || 'Cashier', parseFloat(openingCashInput) || 0);
  };

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    const actual = parseFloat(actualCashInput) || 0;
    onCloseShift(actual, closeNotesInput);
    setActualCashInput('');
    setCloseNotesInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ReceiptText className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Cashier Shift Register & Cash Drawer
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Float opening balance, live drawer reconciliation, expected vs counted cash, and shift log exports.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Active Shift Overview or Open Shift Form */}
        <div className="lg:col-span-7">
          {currentShift ? (
            <div className={`p-6 rounded-2xl border space-y-6 transition-colors ${
              darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              
              <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4">
                <div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500 text-white uppercase">
                    ACTIVE SHIFT
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                    Cashier: {currentShift.cashierName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Opened at {new Date(currentShift.openedAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => exportShiftReportPDF(currentShift, orders)}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4 text-amber-500" />
                  <span>PDF Summary</span>
                </button>
              </div>

              {/* Shift Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Opening Float Cash</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white mt-0.5">${currentShift.openingCash.toFixed(2)}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Cash Sales Collected</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">${shiftCashCollected.toFixed(2)}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase">Expected Drawer Cash</p>
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">${expectedCashInDrawer.toFixed(2)}</p>
                </div>
              </div>

              {/* Other Payment Totals */}
              <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-800">
                <div>Card: <span className="font-bold text-gray-900 dark:text-white">${shiftCardCollected.toFixed(2)}</span></div>
                <div>MoMo: <span className="font-bold text-gray-900 dark:text-white">${shiftMomoCollected.toFixed(2)}</span></div>
                <div>Room: <span className="font-bold text-gray-900 dark:text-white">${shiftRoomCollected.toFixed(2)}</span></div>
              </div>

              {/* Close Shift Form */}
              <form onSubmit={handleCloseShift} className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Close Shift & Count Cash</h4>

                <div>
                  <label className="block text-xs font-bold mb-1">Actual Physical Cash in Drawer ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={actualCashInput}
                    onChange={(e) => setActualCashInput(e.target.value)}
                    placeholder={`Expected: $${expectedCashInDrawer.toFixed(2)}`}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-lg font-mono font-bold"
                  />
                </div>

                {parseFloat(actualCashInput) >= 0 && (
                  <div className={`p-3 rounded-xl border text-xs font-bold flex justify-between ${
                    parseFloat(actualCashInput) - expectedCashInDrawer === 0
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    <span>Drawer Discrepancy (Over/Short):</span>
                    <span className="font-black">${(parseFloat(actualCashInput) - expectedCashInDrawer).toFixed(2)}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold mb-1">Shift Notes / Handover Remark</label>
                  <input
                    type="text"
                    value={closeNotesInput}
                    onChange={(e) => setCloseNotesInput(e.target.value)}
                    placeholder="e.g. Balanced, $5 tip left for waiter"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Close Shift & Reconcile Cash</span>
                </button>
              </form>

            </div>
          ) : (
            <div className={`p-6 rounded-2xl border transition-colors ${
              darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
            }`}>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Open New Cashier Shift</h3>
              <p className="text-xs text-gray-500 mb-6">Enter opening cash float balance to start selling.</p>

              <form onSubmit={handleOpenShift} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Cashier Full Name</label>
                  <input
                    type="text"
                    required
                    value={cashierNameInput}
                    onChange={(e) => setCashierNameInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Starting Float Cash Amount ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={openingCashInput}
                    onChange={(e) => setOpeningCashInput(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-mono font-bold border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Start Active Shift</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Historical Shift Register Logs */}
        <div className="lg:col-span-5">
          <div className={`p-5 rounded-2xl border transition-colors ${
            darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          }`}>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4">Past Closed Shifts</h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {allShifts.filter(s => s.status === 'Closed').length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">No closed shifts recorded yet.</p>
              ) : (
                allShifts.filter(s => s.status === 'Closed').map((s) => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-gray-900 dark:text-white">{s.cashierName}</span>
                      <span className="text-gray-400 font-mono text-[10px]">{s.id}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Opened: {new Date(s.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Closed: {s.closedAt ? new Date(s.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px] pt-1 border-t border-gray-200 dark:border-gray-700">
                      <span>Float: ${s.openingCash.toFixed(2)}</span>
                      <span>Counted: ${s.closingCashActual?.toFixed(2)}</span>
                      <span className={s.difference && s.difference < 0 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
                        Diff: ${s.difference?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
