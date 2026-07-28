import React, { useState } from 'react';
import { 
  FileBarChart, Printer, Download, FileSpreadsheet, Wine, 
  ChefHat, Waves, Flame, Building, DollarSign, Calendar, 
  TrendingUp, AlertTriangle, User 
} from 'lucide-react';
import { Order, MenuItem, Shift, DailyReportData } from '../types';
import { printReportHTML, exportDailyReportPDF, exportDailyReportExcel } from '../lib/exporter';

interface DailyReportViewProps {
  orders: Order[];
  menuItems: MenuItem[];
  currentShift: Shift | null;
  darkMode: boolean;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({
  orders,
  menuItems,
  currentShift,
  darkMode
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Filter orders for selected date
  const ordersForDate = orders.filter(
    o => o.createdAt.startsWith(selectedDate) && o.status !== 'Cancelled'
  );
  const paidOrdersForDate = ordersForDate.filter(
    o => o.paymentStatus === 'PAID' || o.status === 'Paid'
  );

  // AUTOMATIC REPORT CALCULATIONS (No manual math!)
  const totalTransactions = paidOrdersForDate.length;
  const grossRevenue = paidOrdersForDate.reduce((sum, o) => sum + o.subtotal + o.tax, 0);
  const discounts = paidOrdersForDate.reduce((sum, o) => sum + o.discount, 0);
  const taxes = paidOrdersForDate.reduce((sum, o) => sum + o.tax, 0);
  const netRevenue = paidOrdersForDate.reduce((sum, o) => sum + o.total, 0);

  // Departmental breakdowns
  let totalDrinkSales = 0;
  let drinksSoldQty = 0;

  let foodRevenue = 0;
  let totalFoodOrders = 0;

  let poolRevenue = 0;
  let poolVisitorsCount = 0;

  let saunaRevenue = 0;
  let saunaVisitorsCount = 0;

  let roomRevenue = 0;
  let apartmentRevenue = 0;

  let cashCollected = 0;
  let cardCollected = 0;
  let mobileMoneyCollected = 0;
  let outstandingRoomCharges = 0;

  const drinkSalesMap: { [name: string]: { qty: number; revenue: number } } = {};

  paidOrdersForDate.forEach((o) => {
    // Payment metrics
    if (o.paymentMethod === 'Cash') {
      cashCollected += o.total;
    } else if (o.paymentMethod === 'Card') {
      cardCollected += o.total;
    } else if (o.paymentMethod === 'Mobile Money') {
      mobileMoneyCollected += o.total;
    } else if (o.paymentMethod === 'Room Charge') {
      roomRevenue += o.total;
      outstandingRoomCharges += o.total;
    } else if (o.paymentMethod === 'Apartment Charge') {
      apartmentRevenue += o.total;
      outstandingRoomCharges += o.total;
    } else if (o.paymentMethod === 'Mixed' && o.paymentDetails) {
      cashCollected += o.paymentDetails.cashPaid || 0;
      cardCollected += o.paymentDetails.cardPaid || 0;
      mobileMoneyCollected += o.paymentDetails.mobileMoneyPaid || 0;
    }

    let orderHasFood = false;

    o.items.forEach((item) => {
      if (item.category === 'Food' || item.isFood) {
        foodRevenue += item.totalPrice;
        orderHasFood = true;
      } else if (item.category === 'Pool Services') {
        poolRevenue += item.totalPrice;
        poolVisitorsCount += item.quantity;
      } else if (item.category === 'Sauna Services') {
        saunaRevenue += item.totalPrice;
        saunaVisitorsCount += item.quantity;
      } else {
        // Drinks / Bar
        totalDrinkSales += item.totalPrice;
        drinksSoldQty += item.quantity;

        if (!drinkSalesMap[item.name]) {
          drinkSalesMap[item.name] = { qty: 0, revenue: 0 };
        }
        drinkSalesMap[item.name].qty += item.quantity;
        drinkSalesMap[item.name].revenue += item.totalPrice;
      }
    });

    if (orderHasFood) totalFoodOrders += 1;
  });

  const bestSellingDrinks = Object.entries(drinkSalesMap)
    .map(([name, data]) => ({ name, qty: data.qty, revenue: data.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const currentStockValue = menuItems.reduce((sum, item) => sum + (item.price * item.stockQuantity), 0);
  const lowStockItemsCount = menuItems.filter(item => item.stockQuantity <= (item.minStockAlert || 5)).length;

  const reportData: DailyReportData = {
    date: selectedDate,
    generatedAt: new Date().toISOString(),
    cashierName: currentShift?.cashierName || 'Bar Cashier',
    totalDrinkSales,
    drinksSoldQty,
    bestSellingDrinks,
    currentStockValue,
    lowStockItemsCount,
    totalFoodOrders,
    foodRevenue,
    poolRevenue,
    poolVisitorsCount,
    saunaRevenue,
    saunaVisitorsCount,
    roomRevenue,
    apartmentRevenue,
    totalOrders: ordersForDate.length,
    paidOrdersCount: ordersForDate.filter(o => o.paymentStatus === 'PAID').length,
    unpaidOrdersCount: ordersForDate.filter(o => o.paymentStatus === 'UNPAID').length,
    creditOrdersCount: ordersForDate.filter(o => o.paymentStatus === 'CREDIT').length,
    partialPaymentsTotal: ordersForDate.reduce((sum, o) => sum + (o.paymentStatus === 'PARTIALLY PAID' ? (o.amountPaid || 0) : 0), 0),
    outstandingBalanceTotal: ordersForDate.reduce((sum, o) => sum + (o.balance > 0 ? o.balance : 0), 0),
    totalTransactions,
    grossRevenue,
    discounts,
    taxes,
    netRevenue,
    cashCollected,
    cardCollected,
    mobileMoneyCollected,
    creditCollected: ordersForDate.filter(o => o.paymentStatus === 'CREDIT').reduce((sum, o) => sum + (o.amountPaid || 0), 0),
    outstandingRoomCharges
  };

  const handlePrintHTML = () => {
    const html = `
      <div class="header">
        <h1>GRAND HORIZON HOTEL & RESORT</h1>
        <h2>BAR & CASHIER DAILY FINANCIAL REPORT</h2>
        <p><strong>Date:</strong> ${selectedDate} | <strong>Cashier:</strong> ${reportData.cashierName}</p>
      </div>

      <h3>1. EXECUTIVE FINANCIAL SUMMARY</h3>
      <div class="grid">
        <div class="card">
          <div class="card-title">Gross Revenue</div>
          <div class="card-value">$${grossRevenue.toFixed(2)}</div>
        </div>
        <div class="card">
          <div class="card-title">Net Revenue</div>
          <div class="card-value">$${netRevenue.toFixed(2)}</div>
        </div>
        <div class="card">
          <div class="card-title">Taxes (VAT)</div>
          <div class="card-value">$${taxes.toFixed(2)}</div>
        </div>
        <div class="card">
          <div class="card-title">Total Transactions</div>
          <div class="card-value">${totalTransactions}</div>
        </div>
      </div>

      <h3>2. DEPARTMENT REVENUE BREAKDOWN</h3>
      <table>
        <thead>
          <tr>
            <th>Department</th>
            <th>Volume</th>
            <th class="text-right">Revenue ($)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Bar (Drink Sales)</td>
            <td>${drinksSoldQty} units</td>
            <td class="text-right">$${totalDrinkSales.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Restaurant (Food Orders)</td>
            <td>${totalFoodOrders} orders</td>
            <td class="text-right">$${foodRevenue.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Swimming Pool Passes</td>
            <td>${poolVisitorsCount} visitors</td>
            <td class="text-right">$${poolRevenue.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Sauna & Steam Sessions</td>
            <td>${saunaVisitorsCount} visitors</td>
            <td class="text-right">$${saunaRevenue.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Hotel Room Charges</td>
            <td>-</td>
            <td class="text-right">$${roomRevenue.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Apartment Charges</td>
            <td>-</td>
            <td class="text-right">$${apartmentRevenue.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <h3>3. PAYMENT COLLECTIONS</h3>
      <table>
        <tbody>
          <tr><td>Cash Collected</td><td class="text-right font-bold">$${cashCollected.toFixed(2)}</td></tr>
          <tr><td>Card Payment</td><td class="text-right font-bold">$${cardCollected.toFixed(2)}</td></tr>
          <tr><td>Mobile Money (MoMo)</td><td class="text-right font-bold">$${mobileMoneyCollected.toFixed(2)}</td></tr>
          <tr><td>Room & Apartment Folio Charges</td><td class="text-right font-bold">$${outstandingRoomCharges.toFixed(2)}</td></tr>
        </tbody>
      </table>
    `;
    printReportHTML(`Daily Report - ${selectedDate}`, html);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Export Actions */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileBarChart className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Automated Daily Financial Report
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Zero manual math required. Real-time compilation across Bar, Kitchen Food, Pool, Sauna & Room Charges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Date picker */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl text-xs font-bold">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-gray-900 dark:text-white focus:outline-hidden"
              />
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrintHTML}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>

            {/* Export PDF */}
            <button
              onClick={() => exportDailyReportPDF(reportData)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={() => exportDailyReportExcel(reportData)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* BAR METRICS CARD */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800 mb-4">
            <div className="flex items-center space-x-2">
              <Wine className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">1. BAR & DRINKS</h3>
            </div>
            <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
              ${totalDrinkSales.toFixed(2)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Number of Drinks Sold:</span>
              <span className="font-bold">{drinksSoldQty} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Current Stock Total Value:</span>
              <span className="font-bold">${currentStockValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Low Stock Items Alert:</span>
              <span className={`font-bold ${lowStockItemsCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {lowStockItemsCount} items
              </span>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Best Selling Drinks Today:</p>
              {bestSellingDrinks.length === 0 ? (
                <p className="text-gray-400 italic text-[11px]">No drink sales recorded.</p>
              ) : (
                bestSellingDrinks.map((b, i) => (
                  <div key={i} className="flex justify-between text-[11px] py-1">
                    <span className="truncate pr-2">{i+1}. {b.name}</span>
                    <span className="font-bold">{b.qty} sold (${b.revenue.toFixed(2)})</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* FOOD METRICS CARD */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800 mb-4">
            <div className="flex items-center space-x-2">
              <ChefHat className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">2. RESTAURANT FOOD</h3>
            </div>
            <span className="font-mono text-sm font-black text-rose-600 dark:text-rose-400">
              ${foodRevenue.toFixed(2)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Food Orders:</span>
              <span className="font-bold">{totalFoodOrders} orders</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Food Revenue:</span>
              <span className="font-bold">${foodRevenue.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px]">
              Bon de Commande tickets generated automatically for kitchen operations.
            </div>
          </div>
        </div>

        {/* POOL & SAUNA METRICS CARD */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800 mb-4">
            <div className="flex items-center space-x-2">
              <Waves className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">3. POOL & SAUNA</h3>
            </div>
            <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400">
              ${(poolRevenue + saunaRevenue).toFixed(2)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Pool Revenue:</span>
              <span className="font-bold">${poolRevenue.toFixed(2)} ({poolVisitorsCount} passes)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sauna Revenue:</span>
              <span className="font-bold">${saunaRevenue.toFixed(2)} ({saunaVisitorsCount} sessions)</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px]">
              Individual entry passes issued with verification barcodes.
            </div>
          </div>
        </div>

        {/* ROOMS & APARTMENT CHARGES */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800 mb-4">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">4. ROOM CHARGES</h3>
            </div>
            <span className="font-mono text-sm font-black text-purple-600 dark:text-purple-400">
              ${(roomRevenue + apartmentRevenue).toFixed(2)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Hotel Room Revenue:</span>
              <span className="font-bold">${roomRevenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Apartment Suite Revenue:</span>
              <span className="font-bold">${apartmentRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* GRAND TOTAL SUMMARY CARD */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800 mb-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">5. TOTAL REVENUE & PAYMENT METHODS</h3>
            </div>
            <span className="font-mono text-lg font-black text-emerald-600 dark:text-emerald-400">
              ${netRevenue.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Gross Revenue</p>
              <p className="font-bold text-sm text-gray-900 dark:text-white">${grossRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Discounts</p>
              <p className="font-bold text-sm text-rose-500">-${discounts.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Taxes (VAT 18%)</p>
              <p className="font-bold text-sm text-gray-900 dark:text-white">${taxes.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
              <p className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase font-bold">Cash Collected</p>
              <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">${cashCollected.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
            <div>Card: <span className="font-bold">${cardCollected.toFixed(2)}</span></div>
            <div>MoMo: <span className="font-bold">${mobileMoneyCollected.toFixed(2)}</span></div>
            <div>Room Folio: <span className="font-bold">${outstandingRoomCharges.toFixed(2)}</span></div>
          </div>
        </div>

      </div>

    </div>
  );
};
