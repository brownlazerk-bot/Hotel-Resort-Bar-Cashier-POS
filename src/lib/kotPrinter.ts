import { KitchenTicket } from '../types';

export function getStationForCategory(category?: string, name?: string): string {
  if (!category && !name) return 'MAIN KITCHEN';
  const catLower = (category || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();

  if (catLower.includes('grill') || nameLower.includes('steak') || nameLower.includes('bbq') || nameLower.includes('brochette') || nameLower.includes('ribs') || nameLower.includes('chicken grill')) {
    return 'GRILL STATION';
  }
  if (catLower.includes('pizza') || nameLower.includes('pizza') || nameLower.includes('calzone')) {
    return 'PIZZA STATION';
  }
  if (nameLower.includes('fries') || nameLower.includes('chip') || nameLower.includes('wings') || nameLower.includes('fried') || nameLower.includes('samoosa') || nameLower.includes('fish')) {
    return 'FRYER STATION';
  }
  if (catLower.includes('dessert') || nameLower.includes('cake') || nameLower.includes('ice cream') || nameLower.includes('fruit')) {
    return 'DESSERT STATION';
  }
  if (catLower.includes('drink') || catLower.includes('bar') || catLower.includes('beverage')) {
    return 'DRINKS STATION';
  }
  return 'MAIN KITCHEN';
}

export function printKotThermalTicket(
  ticket: KitchenTicket,
  ticketType: 'NEW ORDER' | 'UPDATED ORDER' | 'CANCELLED ITEM' = 'NEW ORDER'
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print Kitchen Order Ticket.');
    return;
  }

  const orderTimeStr = new Date(ticket.orderTime || Date.now()).toLocaleString('en-GB', {
    dateStyle: 'short',
    timeStyle: 'medium'
  });
  const printedTimeStr = new Date().toLocaleTimeString('en-GB', { timeStyle: 'medium' });

  const totalItemsCount = ticket.items.reduce((sum, item) => sum + item.quantity, 0);

  // Group items by Station
  const stationGroups: { [station: string]: typeof ticket.items } = {};
  ticket.items.forEach(item => {
    const station = getStationForCategory((item as any).category, item.name);
    if (!stationGroups[station]) stationGroups[station] = [];
    stationGroups[station].push(item);
  });

  // Determine Order Type (Dine In / Take Away / Room Service / Pool Service)
  let orderType = ticket.orderType || 'DINE IN';
  if (!ticket.orderType) {
    if (ticket.tableNumber?.toUpperCase().includes('ROOM')) orderType = 'ROOM SERVICE';
    else if (ticket.tableNumber?.toUpperCase().includes('POOL')) orderType = 'POOL SERVICE';
    else if (ticket.tableNumber?.toUpperCase().includes('TAKE')) orderType = 'TAKE AWAY';
  }

  const stationsHtml = Object.keys(stationGroups).map(stationName => {
    const items = stationGroups[stationName];
    const itemsHtml = items.map(item => `
      <div style="margin-bottom: 8px; border-bottom: 1px dashed #000000; padding-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1; padding-right: 8px;">
            <span style="font-size: 15px; font-weight: 900; text-transform: uppercase;">${item.name}</span>
            ${(item as any).variant ? `<div style="font-size: 11px; font-weight: bold; margin-top: 1px;">Variant: ${(item as any).variant}</div>` : ''}
          </div>
          <div style="font-size: 18px; font-weight: 900; min-width: 32px; text-align: right; border: 2px solid #000000; padding: 1px 4px; border-radius: 4px;">
            ${item.quantity}x
          </div>
        </div>
        ${item.notes ? `
          <div style="margin-top: 4px; font-size: 12px; font-weight: 900; background-color: #000000 !important; color: #ffffff !important; padding: 2px 6px; border-radius: 3px; display: inline-block;">
            *** NOTE: ${item.notes.toUpperCase()} ***
          </div>
        ` : ''}
      </div>
    `).join('');

    return `
      <div style="margin-top: 10px; margin-bottom: 10px;">
        <div style="font-size: 13px; font-weight: 900; text-transform: uppercase; border-bottom: 2px solid #000000; border-top: 2px solid #000000; padding: 3px 0; margin-bottom: 6px; text-align: center; background-color: #f0f0f0;">
          [ ${stationName} ]
        </div>
        ${itemsHtml}
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
            font-size: 12px;
            line-height: 1.25;
            font-weight: 700;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .kot-body {
            width: 76mm;
            margin: 0 auto;
            padding: 4mm 2mm 25mm 2mm;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-black { font-weight: 900; }
          .uppercase { text-transform: uppercase; }
          .banner-box {
            border: 3px solid #000000;
            padding: 4px;
            text-align: center;
            font-size: 16px;
            font-weight: 900;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .type-badge {
            border: 2px solid #000000;
            padding: 2px 6px;
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            display: inline-block;
            margin-top: 2px;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: 800;
            margin-bottom: 3px;
          }
          .divider {
            border-top: 2px solid #000000;
            margin: 6px 0;
          }
          .divider-dashed {
            border-top: 2px dashed #000000;
            margin: 6px 0;
          }
        </style>
      </head>
      <body>
        <div class="kot-body">
          <!-- Business Name -->
          <div class="text-center font-black uppercase" style="font-size: 14px; margin-bottom: 2px;">
            GRAND HORIZON RESORT
          </div>
          
          <!-- Large KITCHEN ORDER Banner -->
          <div class="banner-box">
            KITCHEN ORDER (KOT)
          </div>

          <!-- Highlight Status Badge (NEW ORDER / UPDATED ORDER / CANCELLED) -->
          <div class="text-center" style="margin-bottom: 8px;">
            <span class="type-badge">
              *** ${ticketType} ***
            </span>
          </div>

          <!-- Ticket Info Grid -->
          <div class="divider"></div>
          <div class="meta-row">
            <span>TICKET NO:</span>
            <span class="font-black">${ticket.id}</span>
          </div>
          <div class="meta-row">
            <span>ORDER NO:</span>
            <span class="font-black">${ticket.orderId}</span>
          </div>
          <div class="meta-row">
            <span>DATE/TIME:</span>
            <span>${orderTimeStr}</span>
          </div>
          <div class="meta-row">
            <span>TABLE/ROOM:</span>
            <span class="font-black uppercase" style="font-size: 14px; border-bottom: 2px solid #000;">
              ${ticket.tableNumber || 'COUNTER'}
            </span>
          </div>
          <div class="meta-row">
            <span>ORDER TYPE:</span>
            <span class="font-black uppercase">${orderType}</span>
          </div>
          <div class="meta-row">
            <span>WAITER:</span>
            <span class="font-black uppercase">${ticket.waiterName || 'STAFF'}</span>
          </div>
          ${ticket.customerName ? `
            <div class="meta-row">
              <span>CUSTOMER:</span>
              <span class="uppercase">${ticket.customerName}</span>
            </div>
          ` : ''}
          <div class="divider"></div>

          <!-- Station Grouped Items -->
          ${stationsHtml}

          ${ticket.specialNotes ? `
            <div style="border: 2px solid #000000; padding: 6px; margin: 8px 0; font-size: 12px; font-weight: 900;">
              SPECIAL ORDER NOTES:
              <div style="font-size: 13px; text-transform: uppercase; margin-top: 2px;">
                ${ticket.specialNotes}
              </div>
            </div>
          ` : ''}

          <!-- Footer Summary -->
          <div class="divider-dashed"></div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 900; margin: 6px 0;">
            <span>TOTAL ITEMS:</span>
            <span style="border: 2px solid #000; padding: 1px 6px;">${totalItemsCount}</span>
          </div>
          <div class="meta-row" style="font-size: 10px;">
            <span>PRINTED TIME:</span>
            <span>${printedTimeStr}</span>
          </div>

          <div style="margin-top: 15px; font-size: 11px; font-weight: 800; space-y-8">
            <div style="margin-bottom: 12px;">Prepared By: ___________________________</div>
            <div>Checked By:  ___________________________</div>
          </div>

          <div class="text-center font-black uppercase" style="margin-top: 15px; font-size: 11px; border-top: 1px solid #000; padding-top: 4px;">
            *** KITCHEN COPY • NO FINANCIAL DATA ***
          </div>
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
