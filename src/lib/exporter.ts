import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { DailyReportData, Order, Shift } from '../types';
import { formatCurrency } from './currency';

export function printReportHTML(title: string, htmlContent: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print reports.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 20px;
            color: #1f2937;
            background-color: #ffffff;
          }
          h1, h2, h3 { color: #111827; margin-bottom: 8px; }
          .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 20px; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #f3f4f6; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fafafa; }
          .card-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; font-weight: bold; }
          .card-value { font-size: 20px; font-weight: bold; color: #111827; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 20px; font-size: 13px; }
          th { background: #f3f4f6; text-align: left; padding: 8px 12px; border-bottom: 2px solid #e5e7eb; font-weight: 600; }
          td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
          .text-right { text-align: right; }
          .total-row { font-weight: bold; background: #f9fafb; font-size: 14px; }
          .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
          @media print {
            body { margin: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export function exportDailyReportPDF(report: DailyReportData) {
  const doc = new jsPDF();

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('GRAND HORIZON HOTEL & RESORT', 14, 18);
  
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'normal');
  doc.text('DAILY BAR & CASHIER FINANCIAL REPORT', 14, 26);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Date: ${report.date}  |  Generated At: ${new Date(report.generatedAt).toLocaleString()}`, 14, 33);
  doc.text(`Cashier-in-Charge: ${report.cashierName}`, 14, 39);

  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 43, 196, 43);

  let y = 50;

  // Financial Summary
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('1. EXECUTIVE FINANCIAL SUMMARY', 14, y);
  y += 6;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  const metrics = [
    ['Gross Revenue:', formatCurrency(report.grossRevenue), 'Total Transactions:', `${report.totalTransactions}`],
    ['Taxes (VAT):', formatCurrency(report.taxes), 'Discounts Applied:', formatCurrency(report.discounts)],
    ['NET REVENUE:', formatCurrency(report.netRevenue), 'Cash Collected:', formatCurrency(report.cashCollected)],
    ['Card Collected:', formatCurrency(report.cardCollected), 'Mobile Money:', formatCurrency(report.mobileMoneyCollected)],
    ['Room/Apt Charges:', formatCurrency(report.outstandingRoomCharges), 'Current Stock Value:', formatCurrency(report.currentStockValue)],
  ];

  metrics.forEach(([lbl1, val1, lbl2, val2]) => {
    doc.text(lbl1, 14, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(val1, 55, y);

    doc.setFont('Helvetica', 'normal');
    doc.text(lbl2, 110, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(val2, 160, y);

    doc.setFont('Helvetica', 'normal');
    y += 6;
  });

  y += 4;
  doc.line(14, y, 196, y);
  y += 8;

  // Departmental Revenues
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. DEPARTMENTAL REVENUE BREAKDOWN', 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  const deptBreakdown = [
    ['Bar (Drink Sales):', `${formatCurrency(report.totalDrinkSales)} (${report.drinksSoldQty} units)`],
    ['Restaurant (Food Orders):', `${formatCurrency(report.foodRevenue)} (${report.totalFoodOrders} orders)`],
    ['Swimming Pool Passes:', `${formatCurrency(report.poolRevenue)} (${report.poolVisitorsCount} passes)`],
    ['Sauna & Steam Sessions:', `${formatCurrency(report.saunaRevenue)} (${report.saunaVisitorsCount} sessions)`],
    ['Hotel Guest Room Charges:', formatCurrency(report.roomRevenue)],
    ['Apartment Suite Charges:', formatCurrency(report.apartmentRevenue)],
  ];

  deptBreakdown.forEach(([dept, amount]) => {
    doc.text(dept, 14, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(amount, 90, y);
    doc.setFont('Helvetica', 'normal');
    y += 6;
  });

  y += 4;
  doc.line(14, y, 196, y);
  y += 8;

  // Best Selling Drinks
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. TOP SELLING DRINKS', 14, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.text('Item Name', 14, y);
  doc.text('Qty Sold', 120, y);
  doc.text('Total Revenue', 160, y);
  y += 4;
  doc.line(14, y, 196, y);
  y += 5;

  doc.setFont('Helvetica', 'normal');
  if (report.bestSellingDrinks.length === 0) {
    doc.text('No drink sales recorded for this date.', 14, y);
    y += 6;
  } else {
    report.bestSellingDrinks.forEach((item) => {
      doc.text(item.name, 14, y);
      doc.text(`${item.qty}`, 120, y);
      doc.text(formatCurrency(item.revenue), 160, y);
      y += 5;
    });
  }

  y += 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('*** Official Hotel System Generated Financial Record - No Manual Signature Required ***', 14, y);

  doc.save(`Daily_Report_Bar_${report.date}.pdf`);
}

export function exportDailyReportExcel(report: DailyReportData) {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['GRAND HORIZON HOTEL & RESORT'],
    ['DAILY BAR & CASHIER FINANCIAL REPORT'],
    [`Report Date`, report.date],
    [`Generated At`, new Date(report.generatedAt).toLocaleString()],
    [`Cashier Name`, report.cashierName],
    [],
    ['FINANCIAL SUMMARY METRIC', 'VALUE (RWF)'],
    ['Gross Revenue', report.grossRevenue],
    ['Taxes (VAT 18%)', report.taxes],
    ['Discounts Applied', report.discounts],
    ['NET REVENUE', report.netRevenue],
    [],
    ['PAYMENT METHOD BREAKDOWN', 'COLLECTED AMOUNT (RWF)'],
    ['Cash Collected', report.cashCollected],
    ['Card Payment', report.cardCollected],
    ['Mobile Money (MoMo)', report.mobileMoneyCollected],
    ['Room & Apartment Charges', report.outstandingRoomCharges],
    [],
    ['DEPARTMENTAL REVENUES', 'REVENUE (RWF)', 'VOLUME'],
    ['Bar (Drink Sales)', report.totalDrinkSales, `${report.drinksSoldQty} units`],
    ['Restaurant (Food Orders)', report.foodRevenue, `${report.totalFoodOrders} orders`],
    ['Swimming Pool', report.poolRevenue, `${report.poolVisitorsCount} passes`],
    ['Sauna & Steam', report.saunaRevenue, `${report.saunaVisitorsCount} sessions`],
    ['Room Charges', report.roomRevenue, '-'],
    ['Apartment Charges', report.apartmentRevenue, '-'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Daily Summary');

  // Bestsellers Sheet
  const bestData = [
    ['TOP SELLING DRINKS'],
    ['Drink Name', 'Quantity Sold', 'Total Revenue (RWF)'],
    ...report.bestSellingDrinks.map(b => [b.name, b.qty, b.revenue])
  ];
  const wsBest = XLSX.utils.aoa_to_sheet(bestData);
  XLSX.utils.book_append_sheet(wb, wsBest, 'Top Drinks');

  XLSX.writeFile(wb, `Daily_Report_Bar_${report.date}.xlsx`);
}

export function exportShiftReportPDF(shift: Shift, orders: Order[]) {
  const doc = new jsPDF();
  const shiftOrders = orders.filter(o => o.shiftId === shift.id && o.status === 'Paid');

  const totalRev = shiftOrders.reduce((sum, o) => sum + o.total, 0);
  const cashTotal = shiftOrders.reduce((sum, o) => sum + (o.paymentDetails?.cashPaid || 0) - (o.paymentDetails?.changeGiven || 0), 0);
  const cardTotal = shiftOrders.reduce((sum, o) => sum + (o.paymentDetails?.cardPaid || 0), 0);
  const momoTotal = shiftOrders.reduce((sum, o) => sum + (o.paymentDetails?.mobileMoneyPaid || 0), 0);
  const roomTotal = shiftOrders.reduce((sum, o) => sum + (o.paymentDetails?.roomChargeAmount || 0), 0);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CASHIER SHIFT RECONCILIATION REPORT', 14, 18);

  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Shift ID: ${shift.id}  |  Cashier: ${shift.cashierName}`, 14, 26);
  doc.text(`Opened: ${new Date(shift.openedAt).toLocaleString()}`, 14, 32);
  if (shift.closedAt) {
    doc.text(`Closed: ${new Date(shift.closedAt).toLocaleString()}`, 14, 38);
  }

  doc.line(14, 42, 196, 42);

  let y = 50;
  doc.setFont('Helvetica', 'bold');
  doc.text('CASH DRAWER RECONCILIATION', 14, y);
  y += 6;

  doc.setFont('Helvetica', 'normal');
  const cashRows = [
    ['Opening Cash Float:', formatCurrency(shift.openingCash)],
    ['Cash Sales Collected:', formatCurrency(cashTotal)],
    ['Expected Cash in Drawer:', formatCurrency(shift.openingCash + cashTotal)],
    ['Actual Cash Counted:', shift.closingCashActual !== undefined ? formatCurrency(shift.closingCashActual) : 'Shift Still Open'],
    ['Discrepancy (Over/Short):', shift.difference !== undefined ? formatCurrency(shift.difference) : 'N/A'],
  ];

  cashRows.forEach(([lbl, val]) => {
    doc.text(lbl, 14, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(val, 80, y);
    doc.setFont('Helvetica', 'normal');
    y += 6;
  });

  y += 4;
  doc.line(14, y, 196, y);
  y += 8;

  doc.setFont('Helvetica', 'bold');
  doc.text('SHIFT REVENUE SUMMARY', 14, y);
  y += 6;

  doc.setFont('Helvetica', 'normal');
  const revRows = [
    ['Total Shift Revenue:', formatCurrency(totalRev)],
    ['Card Revenue:', formatCurrency(cardTotal)],
    ['Mobile Money Revenue:', formatCurrency(momoTotal)],
    ['Room/Apartment Charges:', formatCurrency(roomTotal)],
    ['Completed Transactions:', `${shiftOrders.length}`]
  ];

  revRows.forEach(([lbl, val]) => {
    doc.text(lbl, 14, y);
    doc.setFont('Helvetica', 'bold');
    doc.text(val, 80, y);
    doc.setFont('Helvetica', 'normal');
    y += 6;
  });

  doc.save(`Shift_Report_${shift.id}.pdf`);
}

export function exportGenericExcel(filename: string, sheetName: string, headers: string[], rows: (string | number)[][]) {
  const wb = XLSX.utils.book_new();
  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportGenericPDF(title: string, subtitle: string, headers: string[], rows: (string | number)[][], filename: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GRAND HORIZON HOTEL & RESORT', 14, 15);
  
  doc.setFontSize(12);
  doc.text(title.toUpperCase(), 14, 22);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`${subtitle} | Date: ${new Date().toLocaleDateString()}`, 14, 28);
  
  doc.setLineWidth(0.3);
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 31, 283, 31);

  let y = 37;
  const colWidth = Math.floor(269 / Math.max(1, headers.length));

  // Table Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  headers.forEach((h, idx) => {
    doc.text(h, 14 + (idx * colWidth), y);
  });
  
  y += 3;
  doc.line(14, y, 283, y);
  y += 5;

  // Rows
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  
  rows.forEach((row) => {
    if (y > 190) {
      doc.addPage();
      y = 20;
    }
    row.forEach((cell, idx) => {
      const text = String(cell ?? '');
      doc.text(text.length > 26 ? text.substring(0, 24) + '...' : text, 14 + (idx * colWidth), y);
    });
    y += 5;
  });

  doc.save(`${filename}.pdf`);
}

