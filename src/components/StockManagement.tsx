import React, { useState } from 'react';
import { 
  PackageCheck, AlertTriangle, Plus, Minus, Trash2, 
  Search, RefreshCw, FileText, ArrowUpRight, ArrowDownRight, History,
  Clock, ShoppingBag, Eye, ExternalLink, ShieldAlert, CheckCircle2, AlertCircle, Layers,
  Calendar, Download, ArrowRight, Printer, CheckSquare, Square, Utensils, Wine, Filter, Check
} from 'lucide-react';
import { MenuItem, StockAdjustmentLog, Order, Table, Waiter, AppUser } from '../types';
import { formatCurrency } from '../lib/currency';
import { calculateStockMovementsForDate, ItemStockMovement } from '../lib/stockMovement';
import { printReportHTML } from '../lib/exporter';

import { Language, getTranslation } from '../lib/translations';

export const isKitchenItem = (item: MenuItem | ItemStockMovement | { category: string; productSection?: string; isFood?: boolean }): boolean => {
  const section = 'productSection' in item ? (item as any).productSection : undefined;
  return item.category === 'Food' || section === 'Kitchen Menu' || (item as any).isFood === true;
};

export const isBarItem = (item: MenuItem | ItemStockMovement | { category: string; productSection?: string; isFood?: boolean }): boolean => {
  if (isKitchenItem(item)) return false;
  const section = 'productSection' in item ? (item as any).productSection : undefined;
  return (
    section === 'Bar Menu' ||
    ['Beers', 'Soft Drinks', 'Wines', 'Whisky', 'Cocktails', 'Juices', 'Water', 'Coffee', 'Tea'].includes(item.category)
  );
};

interface StockManagementProps {
  menuItems: MenuItem[];
  stockLogs: StockAdjustmentLog[];
  orders?: Order[];
  tables?: Table[];
  waiters?: Waiter[];
  onUpdateStock: (itemId: string, qtyChange: number, type: StockAdjustmentLog['type'], reason: string) => void;
  onNavigateToOrders?: () => void;
  darkMode: boolean;
  language?: Language;
  loggedInUser?: AppUser;
}

export const StockManagement: React.FC<StockManagementProps> = ({
  menuItems,
  stockLogs,
  orders = [],
  tables = [],
  waiters = [],
  onUpdateStock,
  onNavigateToOrders,
  darkMode,
  language = 'rw',
  loggedInUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'available' | 'unpaid_reserved' | 'reconciliation' | 'logs'>('available');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [reconciliationDate, setReconciliationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  // Department filter for reconciliation sheet
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<'All' | 'Kitchen' | 'Bar' | 'Other'>('All');
  
  // Custom item selection mode
  const [customSelectMode, setCustomSelectMode] = useState<boolean>(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Print Modal State
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printDeptSelection, setPrintDeptSelection] = useState<'All' | 'Kitchen' | 'Bar' | 'Other' | 'Custom'>('All');
  const [printPaperFormat, setPrintPaperFormat] = useState<'80mm' | 'A4'>('80mm');
  const [printHideZeroMovement, setPrintHideZeroMovement] = useState<boolean>(false);
  const [printIncludeValues, setPrintIncludeValues] = useState<boolean>(true);
  const [printIncludeSignatures, setPrintIncludeSignatures] = useState<boolean>(true);

  // Toggle single item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Select handlers
  const handleSelectAllFiltered = (filteredMovements: ItemStockMovement[]) => {
    setSelectedItemIds(new Set(filteredMovements.map(m => m.itemId)));
  };

  const handleSelectKitchenOnly = () => {
    const stockMovements = calculateStockMovementsForDate(menuItems, stockLogs, orders, reconciliationDate);
    setSelectedItemIds(new Set(stockMovements.filter(m => isKitchenItem(m)).map(m => m.itemId)));
  };

  const handleSelectBarOnly = () => {
    const stockMovements = calculateStockMovementsForDate(menuItems, stockLogs, orders, reconciliationDate);
    setSelectedItemIds(new Set(stockMovements.filter(m => isBarItem(m)).map(m => m.itemId)));
  };

  const handleSelectActiveOnly = () => {
    const stockMovements = calculateStockMovementsForDate(menuItems, stockLogs, orders, reconciliationDate);
    setSelectedItemIds(new Set(stockMovements.filter(m => 
      m.openingStock > 0 || m.receivedStock > 0 || m.soldStock > 0 || m.adjustments !== 0 || m.closingStock > 0
    ).map(m => m.itemId)));
  };

  const handleDeselectAll = () => {
    setSelectedItemIds(new Set());
  };

  // Execution of print action
  const handlePrintStockBalanceSheet = () => {
    const allMovements = calculateStockMovementsForDate(menuItems, stockLogs, orders, reconciliationDate);
    
    let itemsToPrint = allMovements;

    // Apply department filter
    if (printDeptSelection === 'Kitchen') {
      itemsToPrint = itemsToPrint.filter(m => isKitchenItem(m));
    } else if (printDeptSelection === 'Bar') {
      itemsToPrint = itemsToPrint.filter(m => isBarItem(m));
    } else if (printDeptSelection === 'Other') {
      itemsToPrint = itemsToPrint.filter(m => !isKitchenItem(m) && !isBarItem(m));
    } else if (printDeptSelection === 'Custom') {
      if (selectedItemIds.size > 0) {
        itemsToPrint = itemsToPrint.filter(m => selectedItemIds.has(m.itemId));
      }
    }

    // Apply zero movement filter
    if (printHideZeroMovement) {
      itemsToPrint = itemsToPrint.filter(m => 
        m.openingStock > 0 || m.receivedStock > 0 || m.soldStock > 0 || m.adjustments !== 0 || m.closingStock > 0
      );
    }

    const deptTitle = printDeptSelection === 'Kitchen' ? 'Kitchen / Igikoni' :
                      printDeptSelection === 'Bar' ? 'Bar & Beverage / Akabari' :
                      printDeptSelection === 'Other' ? 'Other Services' :
                      printDeptSelection === 'Custom' ? `Custom Selected (${itemsToPrint.length} Items)` :
                      'All Departments';

    const totOpening = itemsToPrint.reduce((sum, m) => sum + m.openingStock, 0);
    const totReceived = itemsToPrint.reduce((sum, m) => sum + m.receivedStock, 0);
    const totSold = itemsToPrint.reduce((sum, m) => sum + m.soldStock, 0);
    const totAdjustments = itemsToPrint.reduce((sum, m) => sum + m.adjustments, 0);
    const totClosing = itemsToPrint.reduce((sum, m) => sum + m.closingStock, 0);
    const totValue = itemsToPrint.reduce((sum, m) => sum + m.dispatchedValue, 0);

    const staffName = loggedInUser?.fullName || 'Manager / Store Keeper';
    const printTime = new Date().toLocaleTimeString();

    if (printPaperFormat === '80mm') {
      // Thermal 80mm
      const html = `
        <style>
          @page { size: 80mm auto; margin: 0mm !important; }
          @media print {
            @page { size: 80mm auto; margin: 0mm !important; }
            html, body { width: 72.1mm !important; max-width: 72.1mm !important; margin: 0 auto !important; padding: 0 !important; }
          }
          * { box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 72.1mm;
            margin: 0 auto;
            padding: 2mm 0;
            color: #000000;
            font-size: 10px;
            line-height: 1.25;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .font-black { font-weight: 900; }
          table { width: 100%; border-collapse: collapse; font-size: 9px; margin-top: 4px; }
          th { border-bottom: 1px solid #000; padding: 2px 1px; font-weight: 900; text-align: right; }
          th:first-child { text-align: left; }
          td { padding: 2px 1px; text-align: right; border-bottom: 1px dotted #888; }
          td:first-child { text-align: left; font-weight: bold; }
        </style>

        <div style="text-align: center; margin-bottom: 6px;">
          <div style="font-size: 15px; font-weight: 900; text-transform: uppercase;">SEVEN TO SEVEN</div>
          <div style="font-size: 11px; font-weight: bold;">Sky View Resort</div>
          <div style="font-size: 11px; font-weight: 900; margin: 3px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 2px 0; text-transform: uppercase;">
            DAILY STOCK BALANCE SHEET
          </div>
          <div style="font-size: 10px; font-weight: 900; margin-top: 2px; text-transform: uppercase;">
            SECTION: ${deptTitle}
          </div>
          <div style="font-size: 9px; margin-top: 2px;">
            DATE: ${reconciliationDate} | PRINT: ${printTime}
          </div>
          <div style="font-size: 9px;">
            STAFF: ${staffName}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ITEM</th>
              <th>OPN</th>
              <th>IN</th>
              <th>OUT</th>
              <th>CLS</th>
              ${printIncludeValues ? `<th>VAL</th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${itemsToPrint.map(m => `
              <tr>
                <td>${m.itemName}</td>
                <td>${m.openingStock}</td>
                <td>${m.receivedStock > 0 ? `+${m.receivedStock}` : '0'}</td>
                <td>${m.soldStock > 0 ? `-${m.soldStock}` : '0'}</td>
                <td style="font-weight: 900;">${m.closingStock}</td>
                ${printIncludeValues ? `<td>${m.dispatchedValue.toLocaleString()}</td>` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="border-top: 2px solid #000; margin-top: 6px; padding-top: 4px; font-size: 9px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>TOTAL ITEMS:</span> <span>${itemsToPrint.length}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>OPENING STOCK:</span> <span>${totOpening}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>RECEIVED (+):</span> <span>+${totReceived}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>SOLD (-):</span> <span>-${totSold}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>ADJUSTMENTS:</span> <span>${totAdjustments >= 0 ? `+${totAdjustments}` : totAdjustments}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 900; border-top: 1px dashed #000; padding-top: 2px; margin-top: 2px;">
            <span>CLOSING STOCK:</span> <span>${totClosing}</span>
          </div>
          ${printIncludeValues ? `
          <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 11px; margin-top: 3px; border-top: 1px solid #000; padding-top: 2px;">
            <span>TOTAL SALES:</span> <span>RWF ${totValue.toLocaleString()}</span>
          </div>
          ` : ''}
        </div>

        ${printIncludeSignatures ? `
        <div style="border-top: 1px dashed #000; margin-top: 15px; padding-top: 8px; font-size: 9px;">
          <div style="margin-bottom: 15px;">Stock Keeper: ___________________</div>
          <div>Manager Sign: ___________________</div>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 12px; font-size: 8px; border-top: 1px dotted #888; padding-top: 4px;">
          Seven to Seven • Sky View Resort
        </div>
      `;

      printReportHTML(`Stock Balance Sheet - ${reconciliationDate}`, html);
    } else {
      // Standard A4 Format
      const html = `
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { font-family: Arial, sans-serif; font-size: 12px; color: #111827; margin: 0; padding: 10px; }
          .header { text-align: center; border-bottom: 3px double #111827; padding-bottom: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { background: #f3f4f6; border: 1px solid #d1d5db; padding: 6px 8px; font-weight: bold; text-align: center; }
          td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: center; }
          td.item-name { text-align: left; font-weight: bold; }
          .total-row { background: #f9fafb; font-weight: bold; border-top: 2px solid #111827; font-size: 12px; }
        </style>

        <div class="header">
          <h1 style="font-size: 22px; font-weight: 900; margin: 0; text-transform: uppercase;">SEVEN TO SEVEN</h1>
          <h3 style="font-size: 14px; margin: 2px 0 8px 0; color: #4b5563;">Sky View Resort • Kamonyi-Runda</h3>
          <div style="font-size: 13px; font-weight: 900; background: #111827; color: #ffffff; padding: 4px 12px; display: inline-block; border-radius: 4px; text-transform: uppercase;">
            DAILY STOCK BALANCE SHEET & RECONCILIATION
          </div>
          <div style="font-size: 12px; font-weight: bold; margin-top: 8px;">
            DEPARTMENT: ${deptTitle.toUpperCase()}
          </div>
          <div style="font-size: 11px; margin-top: 4px; color: #6b7280;">
            Target Date: <strong>${reconciliationDate}</strong> | Printed On: ${new Date().toLocaleString()} | Printed By: <strong>${staffName}</strong>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Item Name</th>
              <th style="text-align: left;">Category</th>
              <th>Opening</th>
              <th style="color: #059669;">+ Received</th>
              <th style="color: #d97706;">- Sold</th>
              <th>± Adjustments</th>
              <th style="color: #0284c7;">= Closing</th>
              ${printIncludeValues ? `<th style="text-align: right;">Sales Value (RWF)</th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${itemsToPrint.map(m => `
              <tr>
                <td class="item-name">${m.itemName}</td>
                <td style="text-align: left;">${m.category}</td>
                <td>${m.openingStock}</td>
                <td style="color: #059669; font-weight: bold;">${m.receivedStock > 0 ? `+${m.receivedStock}` : '0'}</td>
                <td style="color: #d97706; font-weight: bold;">${m.soldStock > 0 ? `-${m.soldStock}` : '0'}</td>
                <td>${m.adjustments >= 0 ? `+${m.adjustments}` : m.adjustments}</td>
                <td style="font-weight: 900; color: #0284c7;">${m.closingStock}</td>
                ${printIncludeValues ? `<td style="text-align: right; font-weight: bold;">${m.dispatchedValue.toLocaleString()}</td>` : ''}
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2" style="text-align: left; padding: 10px;">GRAND TOTALS (${itemsToPrint.length} Items)</td>
              <td>${totOpening}</td>
              <td style="color: #059669;">+${totReceived}</td>
              <td style="color: #d97706;">-${totSold}</td>
              <td>${totAdjustments >= 0 ? `+${totAdjustments}` : totAdjustments}</td>
              <td style="color: #0284c7; font-size: 14px;">${totClosing}</td>
              ${printIncludeValues ? `<td style="text-align: right; color: #059669; font-size: 14px;">RWF ${totValue.toLocaleString()}</td>` : ''}
            </tr>
          </tbody>
        </table>

        ${printIncludeSignatures ? `
        <div style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <div style="text-align: center; width: 40%;">
            <div style="border-bottom: 1px solid #111827; margin-bottom: 6px; height: 35px;"></div>
            <strong>Stock Keeper / Store Officer</strong>
            <div style="font-size: 10px; color: #6b7280;">Sign & Date</div>
          </div>
          <div style="text-align: center; width: 40%;">
            <div style="border-bottom: 1px solid #111827; margin-bottom: 6px; height: 35px;"></div>
            <strong>Hotel Manager / Supervisor</strong>
            <div style="font-size: 10px; color: #6b7280;">Sign & Date</div>
          </div>
        </div>
        ` : ''}
      `;

      printReportHTML(`Stock Balance Sheet - ${reconciliationDate}`, html);
    }

    setShowPrintModal(false);
  };
  
  // Stock Intake/Adjustment Modal
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustmentLog['type']>('Purchase');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(10);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  // Selected reserved item modal
  const [inspectReservedItem, setInspectReservedItem] = useState<{
    item: MenuItem;
    reservedQty: number;
    reservedValue: number;
    holdingOrders: {
      order: Order;
      qty: number;
      total: number;
    }[];
  } | null>(null);

  const categories = ['All', 'Beers', 'Soft Drinks', 'Wines', 'Whisky', 'Cocktails', 'Juices', 'Water', 'Coffee', 'Tea', 'Food'];

  // Filter Active Unpaid Orders (Ordered but not yet paid)
  const activeUnpaidOrders = orders.filter(
    o => o.paymentStatus !== 'PAID' && o.status !== 'Paid' && o.status !== 'Cancelled'
  );

  // Map Reserved Stock per MenuItem
  const reservedStockMap: Record<string, {
    reservedQty: number;
    reservedValue: number;
    holdingOrders: { order: Order; qty: number; total: number }[];
  }> = {};

  activeUnpaidOrders.forEach(ord => {
    ord.items.forEach(item => {
      if (!reservedStockMap[item.itemId]) {
        reservedStockMap[item.itemId] = {
          reservedQty: 0,
          reservedValue: 0,
          holdingOrders: []
        };
      }
      reservedStockMap[item.itemId].reservedQty += item.quantity;
      reservedStockMap[item.itemId].reservedValue += (item.unitPrice * item.quantity);
      reservedStockMap[item.itemId].holdingOrders.push({
        order: ord,
        qty: item.quantity,
        total: item.unitPrice * item.quantity
      });
    });
  });

  // Calculate Metrics
  const totalAvailableUnits = menuItems.reduce((acc, m) => acc + (m.stockQuantity || 0), 0);
  const totalReservedUnits = Object.values(reservedStockMap).reduce((acc, r) => acc + r.reservedQty, 0);
  const totalReservedValue = Object.values(reservedStockMap).reduce((acc, r) => acc + r.reservedValue, 0);
  const lowStockCount = menuItems.filter(m => m.stockQuantity <= (m.minStockAlert || 5) && m.status === 'Available').length;

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Reserved items list
  const reservedItemsList = menuItems.map(item => {
    const res = reservedStockMap[item.id] || { reservedQty: 0, reservedValue: 0, holdingOrders: [] };
    return {
      item,
      reservedQty: res.reservedQty,
      reservedValue: res.reservedValue,
      holdingOrders: res.holdingOrders
    };
  }).filter(r => r.reservedQty > 0);

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForModal) return;

    let qtyChange = Math.abs(adjustmentQuantity);
    if (adjustmentType === 'Waste' || adjustmentType === 'Damaged') {
      qtyChange = -qtyChange; // Deduct for waste or damage
    }

    onUpdateStock(
      selectedItemForModal.id,
      qtyChange,
      adjustmentType,
      adjustmentReason || `${adjustmentType} logged via Bar Stock Manager`
    );

    setSelectedItemForModal(null);
    setAdjustmentReason('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <PackageCheck className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Bar Stock & Inventory Control
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Real-time stock control, automated deduction on open orders, reserved unpaid items tracking, and stock audit history.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stock by name or category..."
              className="px-3.5 py-2 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
          
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Available Bar Stock (In Fridge/Shelf)
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                {totalAvailableUnits}
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">units</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Reserved in Unpaid Orders
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-slate-950">
                {activeUnpaidOrders.length} Open Orders
              </span>
            </div>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-lg font-black text-amber-700 dark:text-amber-300">
                {totalReservedUnits}
              </span>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                units ({formatCurrency(totalReservedValue)})
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
              Total Physical Inventory Stock
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-lg font-black text-sky-700 dark:text-sky-300">
                {totalAvailableUnits}
              </span>
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">units total</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
              Low Stock Alerts
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-lg font-black text-rose-700 dark:text-rose-300">
                {lowStockCount}
              </span>
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">items low</span>
            </div>
          </div>

        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        <button
          onClick={() => setActiveSubTab('available')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'available'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Ibisigayemo muri Bar (Available Stock: {totalAvailableUnits})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('unpaid_reserved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'unpaid_reserved'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Ibiri ahandi bitarishyurwa (Unpaid Reserved: {totalReservedUnits})</span>
          {reservedItemsList.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-600 text-white font-black">
              {reservedItemsList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('reconciliation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'reconciliation'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Raporo y'Ububiko / Daily Stock Balance Sheet</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
            activeSubTab === 'logs'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Stock Audit Trail & Logs ({stockLogs.length})</span>
        </button>
      </div>

      {/* VIEW 1: AVAILABLE STOCK IN BAR */}
      {activeSubTab === 'available' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`lg:col-span-8 p-5 rounded-2xl border transition-colors ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">Current Bar Available Stock</h3>
                <p className="text-[11px] text-gray-400">Items available in bar shelf ready for new orders (Unpaid ordered items are deducted & listed separately).</p>
              </div>
              
              {/* Category filter pills */}
              <div className="flex space-x-1 overflow-x-auto no-scrollbar max-w-full">
                {categories.slice(0, 7).map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 cursor-pointer ${
                      selectedCategory === c ? 'bg-amber-500 text-slate-950' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-2">Item Name</th>
                    <th className="py-2.5 px-2">Category</th>
                    <th className="py-2.5 px-2">Price</th>
                    <th className="py-2.5 px-2">Available in Bar</th>
                    <th className="py-2.5 px-2">In Unpaid Orders</th>
                    <th className="py-2.5 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredItems.map((item) => {
                    const isLow = item.stockQuantity <= (item.minStockAlert || 5);
                    const resInfo = reservedStockMap[item.id];
                    const reservedQty = resInfo ? resInfo.reservedQty : 0;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">
                          <div>
                            <span>{item.name}</span>
                            {item.unit && <span className="text-[10px] text-gray-400 ml-1">({item.unit})</span>}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-500 dark:text-gray-400">{item.category}</td>
                        <td className="py-3 px-2 font-mono font-bold text-amber-600 dark:text-amber-400">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] inline-flex items-center gap-1 ${
                            isLow 
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300' 
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          }`}>
                            {item.stockQuantity} {item.unit || 'pcs'}
                            {isLow && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {reservedQty > 0 ? (
                            <button
                              onClick={() => setInspectReservedItem({
                                item,
                                reservedQty,
                                reservedValue: resInfo.reservedValue,
                                holdingOrders: resInfo.holdingOrders
                              })}
                              className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center space-x-1 cursor-pointer"
                            >
                              <span>{reservedQty} in open orders</span>
                              <Eye className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400">0</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => setSelectedItemForModal(item)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition-all shadow-xs cursor-pointer"
                          >
                            Adjust / Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Side Summary */}
          <div className={`lg:col-span-4 p-5 rounded-2xl border transition-colors space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>Unpaid Orders Summary</span>
            </h3>

            {activeUnpaidOrders.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center">
                All table orders are fully paid! No items held in open unpaid orders.
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">
                  There are currently <strong className="text-amber-500">{activeUnpaidOrders.length} open order(s)</strong> where items have been served to customers/tables but payment is pending.
                </p>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-amber-800 dark:text-amber-200">Total Unpaid Items Served:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-mono">{totalReservedUnits} units</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-amber-800 dark:text-amber-200">Total Value Pending:</span>
                    <span className="text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(totalReservedValue)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveSubTab('unpaid_reserved')}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Reserved Items Breakdown</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: UNPAID RESERVED ITEMS BREAKDOWN */}
      {activeSubTab === 'unpaid_reserved' && (
        <div className={`p-6 rounded-2xl border space-y-6 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div>
              <div className="flex items-center space-x-2 text-amber-500">
                <ShoppingBag className="w-5 h-5" />
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Ibiri ahandi bitarishyurwa (Items Served in Unpaid Orders)
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                These items have been ordered on open tables but not yet paid. They are deducted from available bar stock so stock checks don't overcount them.
              </p>
            </div>

            {onNavigateToOrders && (
              <button
                onClick={onNavigateToOrders}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
              >
                <span>Go to Order Center & Collect Payment</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>

          {reservedItemsList.length === 0 ? (
            <div className="p-12 text-center text-gray-400 space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
              <p className="font-bold text-sm text-gray-800 dark:text-gray-200">No Reserved Unpaid Items!</p>
              <p className="text-xs max-w-md mx-auto">
                All orders are currently paid, or no active unpaid orders are open. All inventory in the bar matches available stock.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reservedItemsList.map(({ item, reservedQty, reservedValue, holdingOrders }) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</h4>
                        <span className="text-[10px] text-gray-500">{item.category} • {formatCurrency(item.price)} each</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500 text-slate-950">
                        {reservedQty} reserved
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex justify-between font-bold">
                      <span className="text-amber-800 dark:text-amber-200">Total Unpaid Value:</span>
                      <span className="text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(reservedValue)}</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Open Orders Holding This Item:
                      </span>
                      {holdingOrders.map(({ order, qty, total }) => (
                        <div key={order.id} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 text-[11px] flex justify-between items-center">
                          <div>
                            <span className="font-bold text-amber-500">
                              Table {order.tableNumber || 'N/A'} (Order #{order.orderNumber || order.id.slice(-4)})
                            </span>
                            <p className="text-[10px] text-gray-400">
                              Waiter: {order.waiterName || 'Staff'} • {qty} x {item.name}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                            {formatCurrency(total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: DAILY STOCK BALANCE SHEET & RECONCILIATION */}
      {activeSubTab === 'reconciliation' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border transition-colors ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Daily Stock Movement & Reconciliation Sheet
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Raporo y'Ububiko: Ububiko bwa Mbere (Previous Closing), Ibyinjiye (Restocked), Ibyasohotse (Sold/Dispatched), n'Ububiko Busigaye.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-bold text-gray-500 pl-2">Date:</span>
                  <input
                    type="date"
                    value={reconciliationDate}
                    onChange={(e) => setReconciliationDate(e.target.value)}
                    className="px-2 py-1 text-xs font-bold bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  onClick={() => setShowPrintModal(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Balance Sheet</span>
                </button>

                <button
                  onClick={() => {
                    const stockMovements = calculateStockMovementsForDate(menuItems, stockLogs, orders, reconciliationDate);
                    const filtered = stockMovements.filter(m => {
                      const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
                      const matchesSearch = m.itemName.toLowerCase().includes(searchQuery.toLowerCase());
                      let matchesDept = true;
                      if (selectedDeptFilter === 'Kitchen') matchesDept = isKitchenItem(m);
                      else if (selectedDeptFilter === 'Bar') matchesDept = isBarItem(m);
                      else if (selectedDeptFilter === 'Other') matchesDept = !isKitchenItem(m) && !isBarItem(m);
                      return matchesCat && matchesSearch && matchesDept;
                    });
                    const headers = ['Item Name', 'Category', 'Opening Stock', 'Received (Stock In)', 'Sold (Stock Out)', 'Adjustments (+/-)', 'Closing Stock', 'Current Stock', 'Sales Value (RWF)'];
                    const rows = filtered.map(m => [
                      `"${m.itemName}"`,
                      `"${m.category}"`,
                      m.openingStock,
                      m.receivedStock,
                      m.soldStock,
                      m.adjustments,
                      m.closingStock,
                      m.currentStock,
                      m.dispatchedValue
                    ]);
                    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `Stock_Balance_${selectedDeptFilter}_${reconciliationDate}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Department Selection Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 mb-5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Department:</span>
                </span>

                <button
                  onClick={() => {
                    setSelectedDeptFilter('All');
                    setPrintDeptSelection('All');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    selectedDeptFilter === 'All'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Departments</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedDeptFilter('Kitchen');
                    setPrintDeptSelection('Kitchen');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    selectedDeptFilter === 'Kitchen'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5 text-orange-500" />
                  <span>Igikoni / Kitchen Stock</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedDeptFilter('Bar');
                    setPrintDeptSelection('Bar');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    selectedDeptFilter === 'Bar'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Wine className="w-3.5 h-3.5 text-purple-500" />
                  <span>Akabari / Bar Stock</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedDeptFilter('Other');
                    setPrintDeptSelection('Other');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    selectedDeptFilter === 'Other'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-sky-500" />
                  <span>Other Services</span>
                </button>
              </div>

              {/* Custom Selection Toggle & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const next = !customSelectMode;
                    setCustomSelectMode(next);
                    if (next) {
                      setPrintDeptSelection('Custom');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                    customSelectMode
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{customSelectMode ? 'Custom Selection Active' : 'Choose What to Print'}</span>
                </button>

                {customSelectMode && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handleSelectKitchenOnly}
                      className="px-2 py-1 rounded text-[10px] font-bold bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
                    >
                      Kitchen Only
                    </button>
                    <button
                      onClick={handleSelectBarOnly}
                      className="px-2 py-1 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 hover:bg-purple-500/20"
                    >
                      Bar Only
                    </button>
                    <button
                      onClick={handleSelectActiveOnly}
                      className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                    >
                      Active Today
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="px-2 py-1 rounded text-[10px] font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      Clear
                    </button>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500 text-white">
                      {selectedItemIds.size} Selected
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Reconciliation KPI Summary Cards */}
            {(() => {
              const movements = calculateStockMovementsForDate(menuItems, stockLogs, orders, reconciliationDate);
              
              let filtered = movements.filter(m => {
                const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
                const matchesSearch = m.itemName.toLowerCase().includes(searchQuery.toLowerCase());
                let matchesDept = true;
                if (selectedDeptFilter === 'Kitchen') matchesDept = isKitchenItem(m);
                else if (selectedDeptFilter === 'Bar') matchesDept = isBarItem(m);
                else if (selectedDeptFilter === 'Other') matchesDept = !isKitchenItem(m) && !isBarItem(m);
                return matchesCat && matchesSearch && matchesDept;
              });

              if (customSelectMode && selectedItemIds.size > 0) {
                filtered = filtered.filter(m => selectedItemIds.has(m.itemId));
              }

              const totOpening = filtered.reduce((sum, m) => sum + m.openingStock, 0);
              const totReceived = filtered.reduce((sum, m) => sum + m.receivedStock, 0);
              const totSold = filtered.reduce((sum, m) => sum + m.soldStock, 0);
              const totAdjustments = filtered.reduce((sum, m) => sum + m.adjustments, 0);
              const totClosing = filtered.reduce((sum, m) => sum + m.closingStock, 0);
              const totValue = filtered.reduce((sum, m) => sum + m.dispatchedValue, 0);

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Ububiko bwa Mbere (Opening)
                      </span>
                      <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                        {totOpening} units
                      </span>
                      <span className="text-[10px] text-gray-500">Start of {reconciliationDate}</span>
                    </div>

                    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">
                        + Ibyinjiye (Received / Purchases)
                      </span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                        +{totReceived} units
                      </span>
                      <span className="text-[10px] text-gray-500">Approved restocks on date</span>
                    </div>

                    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
                        - Ibyagurishijwe (Sold / Dispatched)
                      </span>
                      <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                        -{totSold} units
                      </span>
                      <span className="text-[10px] text-gray-500">Value: {formatCurrency(totValue)}</span>
                    </div>

                    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block">
                        ± Impinduka (Adjustments)
                      </span>
                      <span className={`text-xl font-black mt-1 block ${totAdjustments >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {totAdjustments >= 0 ? `+${totAdjustments}` : totAdjustments} units
                      </span>
                      <span className="text-[10px] text-gray-500">Waste/Damaged/Count diffs</span>
                    </div>

                    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider block">
                        = Ububiko Busigaye (Closing)
                      </span>
                      <span className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1 block">
                        {totClosing} units
                      </span>
                      <span className="text-[10px] text-gray-500">End of {reconciliationDate}</span>
                    </div>
                  </div>

                  {/* Quick Filter Info Notice */}
                  {customSelectMode && (
                    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex justify-between items-center text-indigo-700 dark:text-indigo-300">
                      <div className="flex items-center space-x-2">
                        <CheckSquare className="w-4 h-4 text-indigo-500" />
                        <span>
                          Custom Item Selection Mode is active. Tick items below to choose exactly what to print.
                        </span>
                      </div>
                      <button
                        onClick={() => handleSelectAllFiltered(filtered)}
                        className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold text-[10px] hover:bg-indigo-700"
                      >
                        Select All Visible ({filtered.length})
                      </button>
                    </div>
                  )}

                  {/* Stock Reconciliation Table */}
                  <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 dark:bg-gray-800/80 uppercase text-[10px] font-bold text-gray-500">
                        <tr>
                          {customSelectMode && (
                            <th className="py-3 px-3 text-center w-10">Select</th>
                          )}
                          <th className="py-3 px-3">Item / Product Name</th>
                          <th className="py-3 px-3">Category</th>
                          <th className="py-3 px-3 text-center bg-gray-200/50 dark:bg-gray-700/50 text-slate-900 dark:text-white">
                            Ububiko bwa Mbere (Opening)
                          </th>
                          <th className="py-3 px-3 text-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                            + Ibyinjiye (Received)
                          </th>
                          <th className="py-3 px-3 text-center bg-amber-500/10 text-amber-700 dark:text-amber-300">
                            - Ibyagurishijwe (Sold)
                          </th>
                          <th className="py-3 px-3 text-center bg-purple-500/10 text-purple-700 dark:text-purple-300">
                            ± Impinduka (Adjustments)
                          </th>
                          <th className="py-3 px-3 text-center bg-sky-500/10 text-sky-700 dark:text-sky-300 font-black">
                            = Ububiko Busigaye (Closing)
                          </th>
                          <th className="py-3 px-3 text-right">Sales Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={customSelectMode ? 9 : 8} className="py-8 text-center text-gray-400">
                              No items found for department "{selectedDeptFilter}".
                            </td>
                          </tr>
                        ) : (
                          filtered.map(m => {
                            const isSelected = selectedItemIds.has(m.itemId);
                            return (
                              <tr 
                                key={m.itemId} 
                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer ${
                                  isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                                }`}
                                onClick={() => {
                                  if (customSelectMode) {
                                    toggleItemSelection(m.itemId);
                                  }
                                }}
                              >
                                {customSelectMode && (
                                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleItemSelection(m.itemId)}
                                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                  </td>
                                )}
                                <td className="py-3 px-3 font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                                  <span>{m.itemName}</span>
                                  {isKitchenItem(m) ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-orange-500/10 text-orange-600 font-bold">Kitchen</span>
                                  ) : isBarItem(m) ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/10 text-purple-600 font-bold">Bar</span>
                                  ) : null}
                                </td>
                                <td className="py-3 px-3 text-gray-500">
                                  <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px]">
                                    {m.category}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center font-bold font-mono text-gray-800 dark:text-gray-200 bg-gray-50/50 dark:bg-gray-800/30">
                                  {m.openingStock} {m.unit}s
                                </td>
                                <td className="py-3 px-3 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                                  {m.receivedStock > 0 ? `+${m.receivedStock}` : 0}
                                </td>
                                <td className="py-3 px-3 text-center font-bold font-mono text-amber-600 dark:text-amber-400 bg-amber-500/5">
                                  {m.soldStock}
                                  {m.pendingQty > 0 && (
                                    <span className="block text-[9px] text-amber-500 font-normal">
                                      ({m.paidQty} Paid + {m.pendingQty} Open)
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center font-bold font-mono bg-purple-500/5">
                                  <span className={m.adjustments > 0 ? 'text-purple-600 dark:text-purple-400' : m.adjustments < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'}>
                                    {m.adjustments > 0 ? `+${m.adjustments}` : m.adjustments}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center font-black font-mono text-sky-600 dark:text-sky-400 bg-sky-500/10 text-sm">
                                  {m.closingStock}
                                </td>
                                <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(m.dispatchedValue)}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* VIEW 4: STOCK AUDIT TRAIL & LOGS */}
      {activeSubTab === 'logs' && (
        <div className={`p-6 rounded-2xl border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <History className="w-4 h-4 text-amber-500" />
            <span>Complete Stock Audit Log History</span>
          </h3>

          {stockLogs.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No inventory adjustments logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Action Type</th>
                    <th className="py-2.5 px-3">Qty Change</th>
                    <th className="py-2.5 px-3">Previous Stock</th>
                    <th className="py-2.5 px-3">New Stock</th>
                    <th className="py-2.5 px-3">Actor / Staff</th>
                    <th className="py-2.5 px-3">Reason / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stockLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{log.itemName}</td>
                      <td className="py-3 px-3 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          log.type === 'Purchase' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          log.type === 'Sale' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' :
                          log.type === 'Return' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        <span className={log.quantityChange > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                          {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-500">{log.previousStock}</td>
                      <td className="py-3 px-3 font-mono font-bold text-gray-900 dark:text-white">{log.newStock}</td>
                      <td className="py-3 px-3 text-gray-700 dark:text-gray-300 font-bold">{log.actor}</td>
                      <td className="py-3 px-3 text-gray-400 italic text-[11px]">{log.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* INSPECT RESERVED ITEM MODAL */}
      {inspectReservedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`max-w-lg w-full rounded-2xl p-6 shadow-2xl border space-y-4 transition-colors ${
            darkMode ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Reserved Item Details: {inspectReservedItem.item.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {inspectReservedItem.reservedQty} units served across {inspectReservedItem.holdingOrders.length} open unpaid order(s)
                </p>
              </div>
              <button 
                onClick={() => setInspectReservedItem(null)}
                className="px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300"
              >
                Close
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex justify-between font-bold">
              <span className="text-amber-800 dark:text-amber-200">Total Pending Unpaid Value:</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">
                {formatCurrency(inspectReservedItem.reservedValue)}
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Holding Orders List</h4>
              {inspectReservedItem.holdingOrders.map(({ order, qty, total }) => (
                <div key={order.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-amber-500">
                      Table {order.tableNumber || 'N/A'} (Order #{order.orderNumber || order.id.slice(-4)})
                    </span>
                    <span className="font-mono text-gray-900 dark:text-white">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>Waiter: {order.waiterName || 'Staff'}</span>
                    <span>Quantity: {qty} units</span>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Order Time: {new Date(order.createdAt).toLocaleTimeString()} • Status: {order.status} ({order.paymentStatus})
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setInspectReservedItem(null);
                  if (onNavigateToOrders) onNavigateToOrders();
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex justify-center items-center space-x-1.5 cursor-pointer"
              >
                <span>Go to Order Center to Collect Payment</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 shadow-2xl border transition-colors ${
            darkMode ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <h3 className="font-bold text-base mb-1">
              Adjust Stock: {selectedItemForModal.name}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Current Available Stock in Bar: <span className="font-bold text-amber-500">{selectedItemForModal.stockQuantity} {selectedItemForModal.unit || 'pcs'}</span>
            </p>

            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Adjustment Action</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as StockAdjustmentLog['type'])}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="Purchase">Purchase / Restock Intake (+)</option>
                  <option value="Adjustment">Physical Inventory Count (+/-)</option>
                  <option value="Waste">Wasted / Spoiled (-)</option>
                  <option value="Damaged">Damaged / Broken Bottles (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Quantity Units</label>
                <input
                  type="number"
                  min="1"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Reason / Supplier Note</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g. Delivered by Brasseries, Broken in transit"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT BALANCE SHEET CONFIGURATION MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`max-w-xl w-full rounded-2xl p-6 shadow-2xl border space-y-5 transition-colors ${
            darkMode ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <div className="flex justify-between items-center border-b pb-3 border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Print Stock Balance Sheet
                </h3>
              </div>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Department Selection */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                Choose Department Report / Hitamo Igice
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPrintDeptSelection('All')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    printDeptSelection === 'All'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>All Items</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintDeptSelection('Kitchen')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    printDeptSelection === 'Kitchen'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Utensils className="w-4 h-4 text-orange-500" />
                  <span>Kitchen Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintDeptSelection('Bar')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    printDeptSelection === 'Bar'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Wine className="w-4 h-4 text-purple-500" />
                  <span>Bar Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintDeptSelection('Custom')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    printDeptSelection === 'Custom'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                  <span>Selected ({selectedItemIds.size})</span>
                </button>
              </div>
            </div>

            {/* Paper Size Selection */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                Paper Size / Size y'Ipapuro
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPrintPaperFormat('80mm')}
                  className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                    printPaperFormat === '80mm'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/30'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 font-bold text-xs">
                    80mm
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Thermal Receipt (80mm)</span>
                    <span className="text-[10px] text-gray-500">POS printer roll standard paper</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintPaperFormat('A4')}
                  className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                    printPaperFormat === 'A4'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/30'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-xs">
                    A4
                  </div>
                  <div>
                    <span className="font-bold text-xs block">Full A4 Sheet Document</span>
                    <span className="text-[10px] text-gray-500">Official office printer sheet</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Print Options */}
            <div className="space-y-2 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
              <span className="font-bold text-gray-500 text-[10px] uppercase block mb-1">Print Content Options</span>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printHideZeroMovement}
                  onChange={(e) => setPrintHideZeroMovement(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Hide items with no stock activity on date</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printIncludeValues}
                  onChange={(e) => setPrintIncludeValues(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Include Sales Values & Monetary Amounts</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printIncludeSignatures}
                  onChange={(e) => setPrintIncludeSignatures(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Include Signature Lines for Store Keeper & Manager</span>
              </label>
            </div>

            {/* Preview Banner */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex justify-between items-center text-amber-800 dark:text-amber-200 font-bold">
              <span>Ready to print for SEVEN TO SEVEN - Sky View Resort</span>
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px]">
                {reconciliationDate}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePrintStockBalanceSheet}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
