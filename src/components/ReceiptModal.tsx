import React from 'react';
import { Printer, Download, X, CheckCircle2, QrCode } from 'lucide-react';
import { Order } from '../types';
import { formatCurrency } from '../lib/currency';

interface ReceiptModalProps {
  order: Order;
  onClose: () => void;
  darkMode: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose, darkMode }) => {
  const handlePrint = () => {
    const printContent = document.getElementById('thermal-receipt-printable');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print receipt.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${order.id}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 78mm;
              margin: 0 auto;
              padding: 10px;
              font-size: 11px;
              color: #000;
              background: #fff;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { text-align: left; padding: 2px 0; }
            .table .num { text-align: right; }
            .badge { display: inline-block; border: 1px solid #000; padding: 2px 4px; font-size: 10px; font-weight: bold; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`relative max-w-md w-full rounded-2xl p-6 shadow-2xl border transition-colors ${
        darkMode ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
      }`}>
        {/* Header bar */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800 mb-4">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-base">Payment Completed</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Card */}
        <div 
          id="thermal-receipt-printable" 
          className="bg-amber-50/50 dark:bg-gray-950 p-6 rounded-xl border border-amber-200/60 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-mono text-xs shadow-inner"
        >
          <div className="text-center space-y-1 mb-4">
            <h2 className="font-bold text-base tracking-wider text-gray-900 dark:text-white uppercase">
              GRAND HORIZON RESORT
            </h2>
            <p className="text-[11px] text-gray-600 dark:text-gray-400">BAR & LOUNGE CASHIER</p>
            <p className="text-[10px] text-gray-500">Tel: +237 670 000 111</p>
          </div>

          <div className="border-t border-b border-dashed border-gray-300 dark:border-gray-700 py-2 my-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span className="font-bold">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span>{new Date(order.paidAt || order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{order.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Waiter:</span>
              <span>{order.waiterName}</span>
            </div>
            <div className="flex justify-between">
              <span>Location / Table:</span>
              <span className="font-bold text-amber-700 dark:text-amber-400">
                {order.tableNumber || order.paymentDetails?.roomOrAptNumber || 'Walk-In'}
              </span>
            </div>
            {order.customerName && (
              <div className="flex justify-between">
                <span>Customer Name:</span>
                <span>{order.customerName}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="my-3">
            <div className="grid grid-cols-12 font-bold text-[10px] border-b border-gray-300 dark:border-gray-700 pb-1 mb-2 uppercase">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              {order.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 items-center">
                  <div className="col-span-6 truncate pr-1">
                    <span className="font-medium">{item.name}</span>
                    {item.notes && <p className="text-[9px] text-gray-500 italic">({item.notes})</p>}
                  </div>
                  <span className="col-span-2 text-center">{item.quantity}</span>
                  <span className="col-span-2 text-right">{formatCurrency(item.unitPrice)}</span>
                  <span className="col-span-2 text-right font-semibold">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal, Discount, Total */}
          <div className="border-t border-dashed border-gray-300 dark:border-gray-700 pt-2 mt-3 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount Applied:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white pt-1 border-t border-gray-300 dark:border-gray-700">
              <span>GRAND TOTAL:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          {order.paymentDetails && (
            <div className="border-t border-dashed border-gray-300 dark:border-gray-700 pt-2 mt-2 space-y-1 text-[10px] text-gray-600 dark:text-gray-400">
              <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200">
                <span>PAYMENT METHOD:</span>
                <span className="uppercase font-bold text-amber-600 dark:text-amber-400">
                  {order.paymentDetails.method}
                </span>
              </div>
              {order.paymentDetails.cashPaid ? (
                <div className="flex justify-between">
                  <span>Cash Paid:</span>
                  <span>{formatCurrency(order.paymentDetails.cashPaid)}</span>
                </div>
              ) : null}
              {order.paymentDetails.changeGiven ? (
                <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Change Tendered:</span>
                  <span>{formatCurrency(order.paymentDetails.changeGiven)}</span>
                </div>
              ) : null}
              {order.paymentDetails.cardPaid ? (
                <div className="flex justify-between">
                  <span>Card Charged:</span>
                  <span>{formatCurrency(order.paymentDetails.cardPaid)}</span>
                </div>
              ) : null}
              {order.paymentDetails.mobileMoneyPaid ? (
                <div className="flex justify-between">
                  <span>Mobile Money Paid:</span>
                  <span>{formatCurrency(order.paymentDetails.mobileMoneyPaid)}</span>
                </div>
              ) : null}
              {order.paymentDetails.roomChargeAmount ? (
                <div className="flex justify-between font-semibold text-amber-700 dark:text-amber-300">
                  <span>Charged to Folio:</span>
                  <span>{order.paymentDetails.roomOrAptNumber} ({formatCurrency(order.paymentDetails.roomChargeAmount)})</span>
                </div>
              ) : null}
            </div>
          )}

          {/* Footer QR & Message */}
          <div className="text-center pt-4 border-t border-dashed border-gray-300 dark:border-gray-700 mt-3 space-y-2">
            <div className="flex justify-center">
              <QrCode className="w-12 h-12 text-gray-700 dark:text-gray-300 opacity-80" />
            </div>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Thank you for visiting Grand Horizon!</p>
            <p className="text-[9px] text-gray-400">Please keep receipt for pool & sauna entry access.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 font-bold text-xs transition-all"
          >
            Done / New Order
          </button>
        </div>

      </div>
    </div>
  );
};
