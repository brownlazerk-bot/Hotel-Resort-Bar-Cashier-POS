import React, { useState } from 'react';
import { 
  PackageCheck, AlertTriangle, Plus, Minus, Trash2, 
  Search, RefreshCw, FileText, ArrowUpRight, ArrowDownRight, History 
} from 'lucide-react';
import { MenuItem, StockAdjustmentLog } from '../types';

interface StockManagementProps {
  menuItems: MenuItem[];
  stockLogs: StockAdjustmentLog[];
  onUpdateStock: (itemId: string, qtyChange: number, type: StockAdjustmentLog['type'], reason: string) => void;
  darkMode: boolean;
}

export const StockManagement: React.FC<StockManagementProps> = ({
  menuItems,
  stockLogs,
  onUpdateStock,
  darkMode
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Stock Intake/Adjustment Modal
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustmentLog['type']>('Purchase');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(10);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  const categories = ['All', 'Beers', 'Soft Drinks', 'Wines', 'Whisky', 'Cocktails', 'Juices', 'Water', 'Coffee', 'Tea', 'Food'];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

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
      
      {/* Header */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
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
              Automatic sales stock deduction, purchases, physical counts, waste, and bottle breakage logs.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stock..."
              className="px-3.5 py-2 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Stock Table & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Stock Inventory Table */}
        <div className={`lg:col-span-8 p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Current Bar Stock Levels</h3>
            
            {/* Category filter pills */}
            <div className="flex space-x-1 overflow-x-auto no-scrollbar">
              {categories.slice(0, 6).map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    selectedCategory === c ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
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
                  <th className="py-2.5 px-2">Current Stock</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredItems.map((item) => {
                  const isLow = item.stockQuantity <= (item.minStockAlert || 5);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">{item.name}</td>
                      <td className="py-3 px-2 text-gray-500">{item.category}</td>
                      <td className="py-3 px-2 font-mono font-bold">${item.price.toFixed(2)}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-md font-bold ${
                          isLow ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {item.stockQuantity} {item.unit}s
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button
                          onClick={() => setSelectedItemForModal(item)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px]"
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

        {/* Audit Log Sidebar */}
        <div className={`lg:col-span-4 p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <History className="w-4 h-4 text-amber-500" />
            <span>Stock Audit Trail</span>
          </h3>

          {stockLogs.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No inventory adjustments logged yet.</p>
          ) : (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {stockLogs.slice(0, 15).map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 dark:text-white">{log.itemName}</span>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded-md text-[10px] ${
                      log.quantityChange > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>{log.type}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {log.reason && <p className="text-[10px] text-gray-400 italic mt-0.5">{log.reason}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Stock Adjustment Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 shadow-2xl border transition-colors ${
            darkMode ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <h3 className="font-bold text-base mb-1">
              Adjust Stock: {selectedItemForModal.name}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Current Stock: <span className="font-bold text-amber-500">{selectedItemForModal.stockQuantity} {selectedItemForModal.unit}s</span>
            </p>

            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Adjustment Action</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as StockAdjustmentLog['type'])}
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
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
                  className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Reason / Supplier Note</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g. Delivered by Brasseries, Broken in transit"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
