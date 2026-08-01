import { KitchenTicket } from '../types';

export function printKotThermalTicket(
  ticket: KitchenTicket,
  ticketType: 'NEW ORDER' | 'UPDATED ORDER' | 'CANCELLED ITEM' = 'NEW ORDER'
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print Kitchen Order Ticket.');
    return;
  }

  // Format Time (e.g., 07:45 PM)
  const orderDateObj = new Date(ticket.orderTime || Date.now());
  const timeFormatted = orderDateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Table or Room
  const tableVal = ticket.tableNumber 
    ? ticket.tableNumber.toUpperCase() 
    : 'COUNTER';

  // Waiter
  const waiterVal = (ticket.waiterName || 'STAFF').toUpperCase();

  // Order Type (DINE IN, TAKE AWAY, ROOM SERVICE, POOL SERVICE)
  let orderTypeVal = (ticket.orderType || 'DINE IN').toUpperCase();
  if (!ticket.orderType) {
    if (tableVal.includes('ROOM')) orderTypeVal = 'ROOM SERVICE';
    else if (tableVal.includes('POOL')) orderTypeVal = 'POOL SERVICE';
    else if (tableVal.includes('TAKE')) orderTypeVal = 'TAKE AWAY';
  }

  // Generate Item Lines
  const itemsHtml = ticket.items.map(item => {
    const qty = item.quantity;
    const name = item.name.toUpperCase();
    return `
      <div style="margin-bottom: 12px;">
        <div style="font-size: 16px; font-weight: 900; line-height: 1.3;">
          ${qty} &times; ${name}
        </div>
        ${item.notes ? `
          <div style="font-size: 12px; font-weight: 900; margin-top: 3px; padding-left: 8px;">
            * Note: ${item.notes.toUpperCase()}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>KOT ${ticket.id}</title>
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
            font-size: 13px;
            line-height: 1.3;
            font-weight: 700;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .kot-body {
            width: 76mm;
            margin: 0 auto;
            padding: 4mm 2mm 20mm 2mm;
          }
          .text-center { text-align: center; }
          .font-black { font-weight: 900; }
          .uppercase { text-transform: uppercase; }
          .border-double {
            border-top: 3px double #000000;
            border-bottom: 3px double #000000;
            padding: 6px 0;
            margin: 6px 0;
          }
          .border-dashed {
            border-top: 2px dashed #000000;
            margin: 10px 0;
          }
          .meta-row {
            font-size: 14px;
            font-weight: 900;
            margin-bottom: 6px;
            text-transform: uppercase;
          }
          .table-title {
            font-size: 17px;
            font-weight: 900;
          }
        </style>
      </head>
      <body>
        <div class="kot-body">
          <!-- Double Header Box -->
          <div class="border-double text-center">
            <div class="font-black uppercase" style="font-size: 15px;">
              SKY VIEW RESORT APARTMENT
            </div>
            <div class="font-black uppercase" style="font-size: 16px; margin-top: 2px;">
              KITCHEN ORDER ${ticketType !== 'NEW ORDER' ? `(${ticketType})` : ''}
            </div>
          </div>

          <!-- Info Details -->
          <div style="margin: 10px 0;">
            <div class="meta-row table-title">
              TABLE : ${tableVal}
            </div>
            <div class="meta-row">
              WAITER : ${waiterVal}
            </div>
            <div class="meta-row">
              ORDER : ${orderTypeVal}
            </div>
            <div class="meta-row">
              TIME : ${timeFormatted}
            </div>
          </div>

          <!-- Separator Line -->
          <div class="border-dashed"></div>

          <!-- Order Items List -->
          <div style="margin: 10px 0;">
            ${itemsHtml}
          </div>

          ${ticket.specialNotes ? `
            <div style="border: 2px solid #000000; padding: 6px; margin: 10px 0; font-size: 13px; font-weight: 900;">
              SPECIAL INSTRUCTIONS:
              <div style="font-size: 14px; text-transform: uppercase; margin-top: 2px;">
                ${ticket.specialNotes}
              </div>
            </div>
          ` : ''}

          <!-- Bottom Separators -->
          <div class="border-dashed"></div>
          <div style="border-top: 3px double #000000; margin-top: 4px;"></div>
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
}
