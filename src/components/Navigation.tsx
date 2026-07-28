import React from 'react';
import { 
  LayoutDashboard, Receipt, ShoppingCart, UtensilsCrossed, ChefHat, 
  Waves, PackageCheck, ReceiptText, FileBarChart, Settings 
} from 'lucide-react';
import { UserRole } from '../types';

export type TabType = 
  | 'dashboard' 
  | 'order_center'
  | 'pos' 
  | 'tables' 
  | 'kitchen' 
  | 'pool_sauna' 
  | 'stock' 
  | 'shifts' 
  | 'report' 
  | 'settings';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingKitchenCount: number;
  unpaidOrdersCount?: number;
  lowStockCount: number;
  userRole: UserRole;
  darkMode: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  pendingKitchenCount,
  unpaidOrdersCount = 0,
  lowStockCount,
  userRole,
  darkMode
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'order_center' as TabType, 
      label: 'Order Center', 
      icon: Receipt,
      badge: unpaidOrdersCount > 0 ? unpaidOrdersCount : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    { id: 'pos' as TabType, label: 'Take Order (POS)', icon: ShoppingCart },
    { id: 'tables' as TabType, label: 'Tables', icon: UtensilsCrossed },
    { 
      id: 'kitchen' as TabType, 
      label: 'Kitchen Orders', 
      icon: ChefHat, 
      badge: pendingKitchenCount > 0 ? pendingKitchenCount : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    { id: 'pool_sauna' as TabType, label: 'Pool & Sauna', icon: Waves },
    { 
      id: 'stock' as TabType, 
      label: 'Bar Stock', 
      icon: PackageCheck,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    { id: 'shifts' as TabType, label: 'Shift Register', icon: ReceiptText },
    { id: 'report' as TabType, label: 'Daily Report', icon: FileBarChart },
    { id: 'settings' as TabType, label: 'Staff & Menu', icon: Settings, managerOnly: true },
  ];

  return (
    <nav className={`border-b sticky top-16 z-20 transition-colors ${
      darkMode 
        ? 'bg-gray-900/95 border-gray-800 text-gray-300 backdrop-blur-md' 
        : 'bg-gray-50/95 border-gray-200 text-gray-700 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-2">
          {navItems.map((item) => {
            if (item.managerOnly && userRole !== 'Manager') return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : darkMode
                      ? 'hover:bg-gray-800 text-gray-300'
                      : 'hover:bg-gray-200/60 text-gray-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                <span>{item.label}</span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
