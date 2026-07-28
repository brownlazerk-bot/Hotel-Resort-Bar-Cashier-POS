import React, { useState } from 'react';
import { 
  Settings, Plus, Edit, Trash2, Users, Shield, 
  RotateCcw, Save, Wine, UserCheck, AlertCircle 
} from 'lucide-react';
import { MenuItem, Waiter, Category, ItemStatus } from '../types';

interface ManagerSettingsProps {
  menuItems: MenuItem[];
  waiters: Waiter[];
  onSaveMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onSaveWaiter: (waiter: Waiter) => void;
  onResetData: () => void;
  darkMode: boolean;
}

export const ManagerSettings: React.FC<ManagerSettingsProps> = ({
  menuItems,
  waiters,
  onSaveMenuItem,
  onDeleteMenuItem,
  onSaveWaiter,
  onResetData,
  darkMode
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'waiters' | 'security'>('menu');

  // Menu Item Modal state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<Category>('Beers');
  const [itemPrice, setItemPrice] = useState('5.00');
  const [itemStock, setItemStock] = useState('50');
  const [itemUnit, setItemUnit] = useState('Bottle');
  const [itemStatus, setItemStatus] = useState<ItemStatus>('Available');
  const [itemIsFood, setItemIsFood] = useState(false);
  const [itemImage, setItemImage] = useState('');

  // Waiter Modal state
  const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);
  const [waiterName, setWaiterName] = useState('');
  const [waiterEmpId, setWaiterEmpId] = useState('');
  const [waiterPhone, setWaiterPhone] = useState('');
  const [waiterShift, setWaiterShift] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Night'>('Morning');

  const handleOpenMenuModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemCategory(item.category);
      setItemPrice(item.price.toString());
      setItemStock(item.stockQuantity.toString());
      setItemUnit(item.unit);
      setItemStatus(item.status);
      setItemIsFood(item.isFood || false);
      setItemImage(item.image || '');
    } else {
      setEditingItem({
        id: `m-${Date.now()}`,
        name: '',
        category: 'Beers',
        price: 5.0,
        stockQuantity: 50,
        unit: 'Bottle',
        status: 'Available',
        isFood: false
      });
      setItemName('');
      setItemCategory('Beers');
      setItemPrice('5.00');
      setItemStock('50');
      setItemUnit('Bottle');
      setItemStatus('Available');
      setItemIsFood(false);
      setItemImage('');
    }
  };

  const handleSaveMenuForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const saved: MenuItem = {
      ...editingItem,
      name: itemName,
      category: itemCategory,
      price: parseFloat(itemPrice) || 0,
      stockQuantity: parseInt(itemStock) || 0,
      unit: itemUnit,
      status: itemStatus,
      isFood: itemIsFood || itemCategory === 'Food',
      image: itemImage || undefined
    };

    onSaveMenuItem(saved);
    setEditingItem(null);
  };

  const handleOpenWaiterModal = (w?: Waiter) => {
    if (w) {
      setEditingWaiter(w);
      setWaiterName(w.name);
      setWaiterEmpId(w.employeeId);
      setWaiterPhone(w.phone);
      setWaiterShift(w.shift);
    } else {
      setEditingWaiter({
        id: `w-${Date.now()}`,
        name: '',
        employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`,
        phone: '',
        shift: 'Morning',
        active: true
      });
      setWaiterName('');
      setWaiterEmpId(`EMP-${Math.floor(100 + Math.random() * 900)}`);
      setWaiterPhone('');
      setWaiterShift('Morning');
    }
  };

  const handleSaveWaiterForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWaiter) return;

    const saved: Waiter = {
      ...editingWaiter,
      name: waiterName,
      employeeId: waiterEmpId,
      phone: waiterPhone,
      shift: waiterShift
    };

    onSaveWaiter(saved);
    setEditingWaiter(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`p-6 rounded-2xl border transition-colors ${
        darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <Settings className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Manager Control & Configuration
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Configure Bar Menu catalog, waiter accounts, pricing, and system security rules.
            </p>
          </div>

          <div className="flex space-x-2">
            {['menu', 'waiters', 'security'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab === 'menu' ? 'Menu Catalog' : tab === 'waiters' ? 'Waiters Roster' : 'Security'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MENU ITEMS TAB */}
      {activeTab === 'menu' && (
        <div className={`p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Bar & Food Menu Catalog</h3>
            <button
              onClick={() => handleOpenMenuModal()}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-2">Item Name</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2">Price ($)</th>
                  <th className="py-2.5 px-2">Stock Qty</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-2 font-bold text-gray-900 dark:text-white">{item.name}</td>
                    <td className="py-3 px-2 text-gray-500">{item.category}</td>
                    <td className="py-3 px-2 font-mono font-bold">${item.price.toFixed(2)}</td>
                    <td className="py-3 px-2">{item.stockQuantity} {item.unit}s</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right space-x-2">
                      <button
                        onClick={() => handleOpenMenuModal(item)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMenuItem(item.id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WAITERS ROSTER TAB */}
      {activeTab === 'waiters' && (
        <div className={`p-5 rounded-2xl border transition-colors ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Waiters & Staff Accounts</h3>
            <button
              onClick={() => handleOpenWaiterModal()}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-purple-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Waiter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {waiters.map((waiter) => (
              <div key={waiter.id} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{waiter.name}</h4>
                  <p className="text-xs text-gray-500">ID: {waiter.employeeId}</p>
                  <p className="text-xs text-gray-500 mt-1">Phone: {waiter.phone}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/50">
                    Shift: {waiter.shift}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenWaiterModal(waiter)}
                  className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECURITY & DATA RESET TAB */}
      {activeTab === 'security' && (
        <div className={`p-5 rounded-2xl border space-y-6 transition-colors ${
          darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        }`}>
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">Security & Role Restrictions</h3>
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 space-y-1">
              <p className="font-bold">Active Cashier Enforcement Rules:</p>
              <p>• Cashiers CANNOT delete completed transactions.</p>
              <p>• Cashiers CANNOT edit paid receipts or daily reports.</p>
              <p>• Manager PIN (Default: 1234) required for Manager override.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400 mb-1">Reset Demo Database</h4>
            <p className="text-xs text-gray-500 mb-3">Clear local state and restore factory demo menu items, tables, and stock levels.</p>
            <button
              onClick={onResetData}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Data to Demo Default</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Menu Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 shadow-2xl border transition-colors ${
            darkMode ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <h3 className="font-bold text-base mb-4">Edit / Add Menu Item</h3>
            <form onSubmit={handleSaveMenuForm} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold mb-1">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as Category)}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                  >
                    {['Beers', 'Soft Drinks', 'Wines', 'Whisky', 'Cocktails', 'Juices', 'Water', 'Coffee', 'Tea', 'Food', 'Pool Services', 'Sauna Services'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={itemStock}
                    onChange={(e) => setItemStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    placeholder="Bottle, Glass, Ticket"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  value={itemImage}
                  onChange={(e) => setItemImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Waiter Modal */}
      {editingWaiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 shadow-2xl border transition-colors ${
            darkMode ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200'
          }`}>
            <h3 className="font-bold text-base mb-4">Edit / Add Waiter</h3>
            <form onSubmit={handleSaveWaiterForm} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1">Waiter Full Name</label>
                <input
                  type="text"
                  required
                  value={waiterName}
                  onChange={(e) => setWaiterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={waiterPhone}
                  onChange={(e) => setWaiterPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Assigned Shift</label>
                <select
                  value={waiterShift}
                  onChange={(e) => setWaiterShift(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingWaiter(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                >
                  Save Waiter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
