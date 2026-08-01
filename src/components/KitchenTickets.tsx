import React, { useState } from 'react';
import { 
  ChefHat, Clock, CheckCircle2, AlertCircle, Sparkles, 
  ArrowRight, Search, FileText, Check, Printer 
} from 'lucide-react';
import { KitchenTicket, KitchenTicketStatus } from '../types';
import { KotPrintModal } from './KotPrintModal';
import { printKotThermalTicket } from '../lib/kotPrinter';

interface KitchenTicketsProps {
  kitchenTickets: KitchenTicket[];
  onUpdateStatus: (ticketId: string, status: KitchenTicketStatus) => void;
  darkMode: boolean;
}

export const KitchenTickets: React.FC<KitchenTicketsProps> = ({
  kitchenTickets,
  onUpdateStatus,
  darkMode
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('Active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedKot, setSelectedKot] = useState<KitchenTicket | null>(null);

  const filteredTickets = kitchenTickets.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.waiterName.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'Active') return matchesSearch && t.status !== 'Served';
    if (filterStatus === 'All') return matchesSearch;
    return matchesSearch && t.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Bar */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <ChefHat className="w-6 h-6 text-rose-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Bon de Commande (Kitchen Order Tickets)
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Live display of food items ordered at the Bar & Restaurant. <span className="font-bold text-rose-600 dark:text-rose-400">(Drinks strictly excluded)</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['Active', 'Pending', 'Preparing', 'Ready', 'Served', 'All'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === status
                    ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
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

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-50" />
          <h3 className="font-bold text-base text-gray-900 dark:text-white">No Kitchen Tickets Found</h3>
          <p className="text-xs text-gray-500 mt-1">
            Food orders placed in the POS will automatically generate a Bon de Commande here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => {
            const timeAgo = Math.floor((Date.now() - new Date(ticket.orderTime).getTime()) / 60000);

            return (
              <div
                key={ticket.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  ticket.status === 'Ready'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-md'
                    : ticket.status === 'Preparing'
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                      : ticket.status === 'Pending'
                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                        : darkMode
                          ? 'bg-gray-900 border-gray-800 opacity-60'
                          : 'bg-white border-gray-200 opacity-70'
                }`}
              >
                <div>
                  
                  {/* Top Bar */}
                  <div className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-gray-700/60 mb-3">
                    <div>
                      <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">{ticket.id}</span>
                      <p className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">
                        Table: {ticket.tableNumber}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase ${
                        ticket.status === 'Ready'
                          ? 'bg-emerald-500 text-white animate-pulse'
                          : ticket.status === 'Preparing'
                            ? 'bg-blue-500 text-white'
                            : ticket.status === 'Pending'
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-500 text-white'
                      }`}>
                        {ticket.status}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-1 flex items-center justify-end space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{timeAgo < 1 ? 'Just now' : `${timeAgo}m ago`}</span>
                      </p>
                    </div>
                  </div>

                  {/* Waiter & Customer Info */}
                  <div className="text-xs text-gray-600 dark:text-gray-300 mb-3 space-y-0.5">
                    <p>Waiter: <span className="font-bold text-gray-900 dark:text-white">{ticket.waiterName}</span></p>
                    {ticket.customerName && <p>Customer: <span className="font-bold">{ticket.customerName}</span></p>}
                  </div>

                  {/* Food Items List */}
                  <div className="space-y-2 mb-4 bg-white/60 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">
                      Food Order Items:
                    </p>
                    {ticket.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-900 dark:text-white">
                          <span className="text-amber-600 dark:text-amber-400 font-mono mr-1.5">{item.quantity}x</span>
                          {item.name}
                        </span>
                        {item.notes && (
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 italic">
                            ({item.notes})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {ticket.specialNotes && (
                    <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 mb-3 font-medium">
                      Note: {ticket.specialNotes}
                    </div>
                  )}

                </div>

                {/* Progress Status Buttons & Print KOT */}
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => printKotThermalTicket(ticket, 'NEW ORDER')}
                    title="Print KOT Thermal Ticket (80mm)"
                    className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-rose-500" />
                    <span>Print KOT</span>
                  </button>

                  {ticket.status === 'Pending' && (
                    <button
                      onClick={() => onUpdateStatus(ticket.id, 'Preparing')}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Start Preparing
                    </button>
                  )}

                  {ticket.status === 'Preparing' && (
                    <button
                      onClick={() => onUpdateStatus(ticket.id, 'Ready')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Mark Ready
                    </button>
                  )}

                  {ticket.status === 'Ready' && (
                    <button
                      onClick={() => onUpdateStatus(ticket.id, 'Served')}
                      className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Mark Served
                    </button>
                  )}

                  {ticket.status === 'Served' && (
                    <span className="flex-1 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 py-2">
                      ✓ Served
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* KotPrintModal */}
      {selectedKot && (
        <KotPrintModal
          ticket={selectedKot}
          onClose={() => setSelectedKot(null)}
          darkMode={darkMode}
        />
      )}

    </div>
  );
};
