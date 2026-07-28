import React, { useState } from 'react';
import { 
  UtensilsCrossed, Users, CheckCircle, Clock, AlertCircle, 
  Trash2, RefreshCw, UserPlus, ShoppingBag, Plus, Sparkles 
} from 'lucide-react';
import { Table, TableStatus, Order, Waiter } from '../types';

interface TablesGridProps {
  tables: Table[];
  waiters: Waiter[];
  orders: Order[];
  onUpdateTableStatus: (tableId: string, newStatus: TableStatus, waiterId?: string) => void;
  onOpenTableOrder: (table: Table) => void;
  darkMode: boolean;
}

export const TablesGrid: React.FC<TablesGridProps> = ({
  tables,
  waiters,
  orders,
  onUpdateTableStatus,
  onOpenTableOrder,
  darkMode
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedTableForModal, setSelectedTableForModal] = useState<Table | null>(null);
  const [modalWaiterId, setModalWaiterId] = useState<string>(waiters[0]?.id || '');

  const filteredTables = tables.filter(t => filterStatus === 'All' || t.status === filterStatus);

  const handleStatusChange = (tableId: string, status: TableStatus) => {
    onUpdateTableStatus(tableId, status, modalWaiterId);
    setSelectedTableForModal(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Bar */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Restaurant & Terrace Tables
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Manage seating layout, active orders, waiter assignments, and table turnover status.
            </p>
          </div>

          {/* Status Filter Badges */}
          <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
            {['All', 'Available', 'Occupied', 'Reserved', 'Cleaning'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === status
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                    : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const activeOrder = orders.find(o => o.tableId === table.id && o.status === 'Open');
          const assignedWaiter = waiters.find(w => w.id === table.assignedWaiterId);

          return (
            <div
              key={table.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${
                table.status === 'Occupied'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
                  : table.status === 'Reserved'
                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                    : table.status === 'Cleaning'
                      ? 'bg-gray-100 dark:bg-gray-800/80 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                      : darkMode
                        ? 'bg-gray-900 border-gray-800 hover:border-emerald-500/60'
                        : 'bg-white border-gray-200 hover:border-emerald-500 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg ${
                    table.status === 'Occupied'
                      ? 'bg-black/20 text-white'
                      : table.status === 'Available'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-black/10'
                  }`}>
                    {table.status}
                  </span>
                  
                  <div className="flex items-center space-x-1 text-xs opacity-80">
                    <Users className="w-3.5 h-3.5" />
                    <span>{table.capacity} Persons</span>
                  </div>
                </div>

                <h3 className="text-xl font-black tracking-tight my-1">
                  {table.tableNumber}
                </h3>

                {assignedWaiter && (
                  <p className="text-xs opacity-90 font-medium">
                    Waiter: <span className="font-bold">{assignedWaiter.name}</span>
                  </p>
                )}

                {activeOrder && (
                  <div className="mt-3 p-2.5 rounded-xl bg-black/10 dark:bg-white/10 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Active Tab #:</span>
                      <span className="font-bold">{activeOrder.id}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm">
                      <span>Total:</span>
                      <span>${activeOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4 pt-3 border-t border-black/10 dark:border-white/10">
                {table.status === 'Available' && (
                  <button
                    onClick={() => onOpenTableOrder(table)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Take Order</span>
                  </button>
                )}

                {table.status === 'Occupied' && (
                  <button
                    onClick={() => onOpenTableOrder(table)}
                    className="flex-1 py-2 rounded-xl bg-white text-amber-900 hover:bg-amber-100 text-xs font-bold flex items-center justify-center space-x-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add / Checkout</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedTableForModal(table);
                    setModalWaiterId(table.assignedWaiterId || waiters[0]?.id || '');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold ${
                    table.status === 'Occupied'
                      ? 'bg-black/20 hover:bg-black/30 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  Status
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Table Status Modal */}
      {selectedTableForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 shadow-2xl border transition-colors ${
            darkMode ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <h3 className="font-bold text-lg mb-1">
              Update Status: {selectedTableForModal.tableNumber}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Capacity: {selectedTableForModal.capacity} Persons
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Assign Waiter</label>
                <select
                  value={modalWaiterId}
                  onChange={(e) => setModalWaiterId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                >
                  {waiters.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.shift})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { status: 'Available' as TableStatus, color: 'bg-emerald-600' },
                  { status: 'Occupied' as TableStatus, color: 'bg-amber-500' },
                  { status: 'Reserved' as TableStatus, color: 'bg-purple-600' },
                  { status: 'Cleaning' as TableStatus, color: 'bg-gray-600' },
                ].map(s => (
                  <button
                    key={s.status}
                    onClick={() => handleStatusChange(selectedTableForModal.id, s.status)}
                    className={`py-3 rounded-xl text-white font-bold text-xs ${s.color} hover:opacity-90 transition-opacity`}
                  >
                    Set {s.status}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedTableForModal(null)}
                className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
