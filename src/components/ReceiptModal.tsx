import React from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import { Order } from '../types';
import { formatCurrency } from '../lib/currency';

interface ReceiptModalProps {
  order: Order;
  onClose: () => void;
  darkMode: boolean;
}

// Crisp inline vector QR Code for 80mm thermal printers (Pure Black #000000)
const ThermalQRCode: React.FC<{ value: string }> = () => {
  return (
    <svg 
      className="w-16 h-16 mx-auto text-black" 
      viewBox="0 0 29 29" 
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      <rect x="0" y="0" width="29" height="29" fill="white" />
      {/* Top-Left Finder */}
      <rect x="2" y="2" width="7" height="7" fill="black" />
      <rect x="3" y="3" width="5" height="5" fill="white" />
      <rect x="4" y="4" width="3" height="3" fill="black" />
      {/* Top-Right Finder */}
      <rect x="20" y="2" width="7" height="7" fill="black" />
      <rect x="21" y="3" width="5" height="5" fill="white" />
      <rect x="22" y="4" width="3" height="3" fill="black" />
      {/* Bottom-Left Finder */}
      <rect x="2" y="20" width="7" height="7" fill="black" />
      <rect x="3" y="21" width="5" height="5" fill="white" />
      <rect x="4" y="22" width="3" height="3" fill="black" />
      {/* Timing and Data Modules */}
      <rect x="10" y="2" width="8" height="1" fill="black" />
      <rect x="10" y="4" width="8" height="1" fill="black" />
      <rect x="2" y="10" width="1" height="8" fill="black" />
      <rect x="4" y="10" width="1" height="8" fill="black" />
      <rect x="10" y="10" width="3" height="3" fill="black" />
      <rect x="14" y="10" width="2" height="2" fill="black" />
      <rect x="17" y="10" width="3" height="1" fill="black" />
      <rect x="11" y="14" width="5" height="2" fill="black" />
      <rect x="18" y="13" width="3" height="3" fill="black" />
      <rect x="10" y="18" width="2" height="4" fill="black" />
      <rect x="13" y="20" width="4" height="2" fill="black" />
      <rect x="18" y="18" width="3" height="3" fill="black" />
      <rect x="22" y="10" width="4" height="2" fill="black" />
      <rect x="20" y="14" width="2" height="4" fill="black" />
      <rect x="23" y="19" width="3" height="3" fill="black" />
    </svg>
  );
};

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
          <meta charset="utf-8">
          <title>Receipt ${order.id}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              color: #000000 !important;
              background-color: transparent !important;
              border-color: #000000 !important;
              text-shadow: none !important;
              box-shadow: none !important;
            }
            html, body {
              width: 80mm;
              margin: 0 auto !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              font-family: 'Courier New', Courier, Consolas, Monaco, monospace;
              font-size: 11px;
              line-height: 1.3;
              font-weight: 700;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .receipt-body {
              width: 76mm;
              margin: 0 auto;
              padding: 4mm 2mm 15mm 2mm;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .divider-dashed {
              border-top: 1px dashed #000000;
              margin: 6px 0;
            }
            .divider-double {
              border-top: 2px solid #000000;
              border-bottom: 2px solid #000000;
              margin: 6px 0;
              padding: 3px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              margin-bottom: 2px;
            }
            .grid-table {
              width: 100%;
              border-collapse: collapse;
              margin: 4px 0;
            }
            .grid-table th {
              border-bottom: 1px solid #000000;
              text-align: left;
              padding: 3px 0;
              font-size: 10px;
              text-transform: uppercase;
            }
            .grid-table td {
              padding: 3px 0;
              vertical-align: top;
            }
            .grand-total {
              font-size: 15px;
              font-weight: 900;
            }
            .cut-padding {
              padding-bottom: 25mm;
            }
            @media print {
              button { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-body">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 600);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const receiptNo = order.orderNumber || order.id;
  const orderDate = new Date(order.paidAt || order.createdAt).toLocaleString();
  const locationOrTable = order.tableNumber 
    ? `TABLE ${order.tableNumber}` 
    : order.paymentDetails?.roomOrAptNumber 
    ? `ROOM ${order.paymentDetails.roomOrAptNumber}` 
    : 'COUNTER / BAR';

  const amountPaid = order.paymentDetails?.cashPaid || order.amountPaid || order.total;
  const changeGiven = order.paymentDetails?.changeGiven || (amountPaid > order.total ? amountPaid - order.total : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`relative max-w-md w-full rounded-2xl p-6 shadow-2xl border transition-colors ${
        darkMode ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
      }`}>
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800 mb-4">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-base">Payment Completed</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 80mm Professional Thermal Receipt Preview Card */}
        <div className="flex justify-center my-2">
          <div 
            id="thermal-receipt-printable" 
            className="w-[300px] bg-white text-black font-mono text-[11px] leading-snug p-4 border border-gray-400 rounded-sm shadow-md select-text"
            style={{ color: '#000000', backgroundColor: '#ffffff' }}
          >
            {/* Header / Business Information */}
            <div className="text-center space-y-0.5 mb-3">
              {/* Hotel / Business Logo Symbol */}
              <div className="flex justify-center mb-1">
                <svg className="w-8 h-8 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                  <path d="M9 7h6" />
                  <path d="M9 11h6" />
                  <path d="M9 15h6" />
                </svg>
              </div>

              <h2 className="font-black text-sm tracking-wider uppercase text-black">
                GRAND HORIZON RESORT
              </h2>
              <p className="text-[10px] font-bold text-black uppercase">
                HOTEL • RESTAURANT • BAR • LOUNGE
              </p>
              <p className="text-[10px] text-black">KG 12 Ave, Lake Kivu Waterfront</p>
              <p className="text-[10px] text-black">Tel: +250 788 000 111 / +237 670 000 111</p>
              <p className="text-[10px] font-bold text-black">TIN: 109823741</p>
            </div>

            {/* Receipt Metadata Section */}
            <div className="border-t border-b border-dashed border-black py-2 my-2 space-y-1 text-[10px] font-bold">
              <div className="flex justify-between">
                <span>RECEIPT NO:</span>
                <span className="font-black">{receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span>ORDER NO:</span>
                <span>{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE & TIME:</span>
                <span>{orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{order.cashierName || 'Cashier'}</span>
              </div>
              {order.waiterName && (
                <div className="flex justify-between">
                  <span>SERVED BY:</span>
                  <span>{order.waiterName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>LOCATION:</span>
                <span className="font-black uppercase">{locationOrTable}</span>
              </div>
              {order.customerName && (
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span className="uppercase">{order.customerName}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="my-2">
              <div className="flex justify-between text-[10px] font-black uppercase border-b border-black pb-1 mb-1.5">
                <span className="w-1/2 text-left">ITEM</span>
                <span className="w-1/6 text-center">QTY</span>
                <span className="w-1/6 text-right">PRICE</span>
                <span className="w-1/6 text-right">TOTAL</span>
              </div>

              <div className="space-y-2 text-[10px] font-bold">
                {order.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="w-1/2 font-black leading-tight text-left pr-1">{item.name}</span>
                      <span className="w-1/6 text-center font-bold">{item.quantity}</span>
                      <span className="w-1/6 text-right font-medium">{formatCurrency(item.unitPrice)}</span>
                      <span className="w-1/6 text-right font-black">{formatCurrency(item.totalPrice)}</span>
                    </div>
                    {item.notes && (
                      <div className="text-[9px] font-normal italic text-black pl-2">
                        * {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-t border-dashed border-black pt-2 mt-2 space-y-1 text-[10px] font-bold">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span>DISCOUNT:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}

              {!!order.serviceCharge && order.serviceCharge > 0 && (
                <div className="flex justify-between">
                  <span>SERVICE CHARGE:</span>
                  <span>+{formatCurrency(order.serviceCharge)}</span>
                </div>
              )}

              {!!order.otherCharges && order.otherCharges > 0 && (
                <div className="flex justify-between">
                  <span>OTHER CHARGES:</span>
                  <span>+{formatCurrency(order.otherCharges)}</span>
                </div>
              )}

              {/* Grand Total Highlight */}
              <div className="border-t-2 border-b-2 border-black py-1.5 my-1.5 flex justify-between items-center">
                <span className="font-black text-xs uppercase tracking-wider">GRAND TOTAL:</span>
                <span className="font-black text-sm text-black">{formatCurrency(order.total)}</span>
              </div>

              {/* Payment Details */}
              <div className="pt-1 space-y-0.5 text-[10px]">
                <div className="flex justify-between font-black uppercase">
                  <span>PAYMENT METHOD:</span>
                  <span>{order.paymentMethod || order.paymentDetails?.method || 'CASH'}</span>
                </div>

                <div className="flex justify-between">
                  <span>AMOUNT PAID:</span>
                  <span className="font-bold">{formatCurrency(amountPaid)}</span>
                </div>

                {changeGiven > 0 && (
                  <div className="flex justify-between">
                    <span>CHANGE:</span>
                    <span className="font-black">{formatCurrency(changeGiven)}</span>
                  </div>
                )}

                {order.balance > 0 && (
                  <div className="flex justify-between font-black">
                    <span>OUTSTANDING BALANCE:</span>
                    <span>{formatCurrency(order.balance)}</span>
                  </div>
                )}

                {order.paymentDetails?.roomOrAptNumber && (
                  <div className="flex justify-between font-bold">
                    <span>ROOM FOLIO:</span>
                    <span>ROOM {order.paymentDetails.roomOrAptNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Verification QR Code & Footer Message */}
            <div className="text-center pt-3 border-t border-dashed border-black mt-3 space-y-1.5">
              <ThermalQRCode value={receiptNo} />
              
              <p className="text-[10px] font-black uppercase tracking-wider text-black pt-1">
                *** THANK YOU FOR YOUR VISIT! ***
              </p>
              <p className="text-[9px] font-bold text-black">
                Please retain this receipt for room / pool / sauna verification.
              </p>
              <p className="text-[8px] font-normal text-black pt-1">
                Software by AI Studio POS Systems
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-5">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Thermal Receipt (80mm)</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 font-bold text-xs transition-all cursor-pointer"
          >
            Done / New Order
          </button>
        </div>

      </div>
    </div>
  );
};
