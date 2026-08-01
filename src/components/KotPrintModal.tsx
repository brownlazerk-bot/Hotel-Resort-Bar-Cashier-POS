import React from 'react';
import { Printer, X, ChefHat } from 'lucide-react';
import { KitchenTicket } from '../types';
import { printKotThermalTicket, getStationForCategory } from '../lib/kotPrinter';

interface KotPrintModalProps {
  ticket: KitchenTicket;
  onClose: () => void;
  darkMode: boolean;
  ticketType?: 'NEW ORDER' | 'UPDATED ORDER' | 'CANCELLED ITEM';
}

export const KotPrintModal: React.FC<KotPrintModalProps> = ({
  ticket,
  onClose,
  darkMode,
  ticketType = 'NEW ORDER'
}) => {
  const handlePrint = () => {
    printKotThermalTicket(ticket, ticketType as 'NEW ORDER' | 'UPDATED ORDER' | 'CANCELLED ITEM');
  };

  const totalItemsCount = ticket.items.reduce((sum, item) => sum + item.quantity, 0);

  // Group items by station for UI preview
  const stationGroups: { [station: string]: typeof ticket.items } = {};
  ticket.items.forEach(item => {
    const station = getStationForCategory((item as any).category, item.name);
    if (!stationGroups[station]) stationGroups[station] = [];
    stationGroups[station].push(item);
  });

  const orderTimeStr = new Date(ticket.orderTime || Date.now()).toLocaleString('en-GB', {
    dateStyle: 'short',
    timeStyle: 'medium'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`relative max-w-md w-full rounded-2xl p-6 shadow-2xl border transition-colors ${
        darkMode ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
      }`}>
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800 mb-4">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
            <ChefHat className="w-5 h-5" />
            <h3 className="font-bold text-base">Kitchen Order Ticket (KOT)</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 80mm High-Contrast Thermal Preview Card */}
        <div className="flex justify-center my-2">
          <div 
            className="w-[300px] bg-white text-black font-mono text-[12px] leading-tight p-4 border-2 border-black rounded-sm shadow-md select-text"
            style={{ color: '#000000', backgroundColor: '#ffffff' }}
          >
            {/* Business Header */}
            <div className="text-center space-y-0.5 mb-2">
              <h2 className="font-black text-sm uppercase tracking-wider text-black">
                GRAND HORIZON RESORT
              </h2>
              
              <div className="border-2 border-black p-1 my-1 text-center font-black text-sm uppercase tracking-wider">
                KITCHEN ORDER (KOT)
              </div>

              <div className="inline-block border-2 border-black px-2 py-0.5 font-black text-xs uppercase my-1">
                *** {ticketType} ***
              </div>
            </div>

            {/* Ticket Info */}
            <div className="border-t-2 border-b-2 border-black py-2 my-2 space-y-1 text-[11px] font-bold">
              <div className="flex justify-between">
                <span>TICKET NO:</span>
                <span className="font-black">{ticket.id}</span>
              </div>
              <div className="flex justify-between">
                <span>ORDER NO:</span>
                <span className="font-black">{ticket.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE/TIME:</span>
                <span>{orderTimeStr}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span>TABLE/ROOM:</span>
                <span className="font-black text-sm uppercase border-b-2 border-black">
                  {ticket.tableNumber || 'COUNTER'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ORDER TYPE:</span>
                <span className="font-black uppercase">{ticket.orderType || 'DINE IN'}</span>
              </div>
              <div className="flex justify-between">
                <span>WAITER:</span>
                <span className="font-black uppercase">{ticket.waiterName || 'STAFF'}</span>
              </div>
              {ticket.customerName && (
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span className="uppercase">{ticket.customerName}</span>
                </div>
              )}
            </div>

            {/* Station Items List */}
            <div className="my-2 space-y-3">
              {Object.keys(stationGroups).map((stationName) => (
                <div key={stationName} className="space-y-1.5">
                  <div className="text-center font-black text-xs uppercase border-y-2 border-black py-1 bg-gray-100">
                    [ {stationName} ]
                  </div>
                  {stationGroups[stationName].map((item, idx) => (
                    <div key={idx} className="border-b border-dashed border-black pb-1.5 pt-0.5">
                      <div className="flex justify-between items-start">
                        <span className="font-black text-sm uppercase pr-1 flex-1">{item.name}</span>
                        <span className="font-black text-base border-2 border-black px-1 rounded-xs ml-1">
                          {item.quantity}x
                        </span>
                      </div>
                      {item.notes && (
                        <div className="mt-1 font-black text-[11px] bg-black text-white px-1.5 py-0.5 rounded-xs inline-block">
                          *** NOTE: {item.notes.toUpperCase()} ***
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {ticket.specialNotes && (
              <div className="border-2 border-black p-2 my-2 font-black text-[11px]">
                SPECIAL ORDER NOTES:
                <div className="uppercase font-extrabold mt-0.5">{ticket.specialNotes}</div>
              </div>
            )}

            {/* Footer Summary */}
            <div className="border-t-2 border-dashed border-black pt-2 mt-3 space-y-2">
              <div className="flex justify-between items-center font-black text-sm">
                <span>TOTAL ITEMS:</span>
                <span className="border-2 border-black px-2 py-0.5">{totalItemsCount}</span>
              </div>

              <div className="pt-2 text-[10px] space-y-3 font-bold">
                <div>Prepared By: _________________________</div>
                <div>Checked By:  _________________________</div>
              </div>

              <div className="text-center font-black text-[10px] uppercase border-t border-black pt-2 mt-2">
                *** KITCHEN COPY • NO FINANCIAL DATA ***
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-5">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print KOT Ticket (80mm)</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 font-bold text-xs transition-all cursor-pointer"
          >
            Done / Close
          </button>
        </div>

      </div>
    </div>
  );
};
