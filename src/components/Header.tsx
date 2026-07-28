import React, { useState, useEffect } from 'react';
import { 
  Wine, Shield, UserCheck, Clock, Moon, Sun, 
  AlertTriangle, DollarSign, Key, LogOut, Lock 
} from 'lucide-react';
import { Shift, UserRole } from '../types';

interface HeaderProps {
  currentShift: Shift | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  lowStockCount: number;
  openShiftModal: () => void;
  onNavigateToStock: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentShift,
  userRole,
  setUserRole,
  darkMode,
  setDarkMode,
  lowStockCount,
  openShiftModal,
  onNavigateToStock
}) => {
  const [time, setTime] = useState(new Date());
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRoleToggle = () => {
    if (userRole === 'Cashier') {
      // Require Manager PIN (default: 1234)
      setShowPinModal(true);
      setPinInput('');
      setPinError('');
    } else {
      setUserRole('Cashier');
    }
  };

  const verifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === '8888') {
      setUserRole('Manager');
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Invalid Manager PIN. Default PIN is 1234.');
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-30 transition-colors duration-200 border-b ${
        darkMode 
          ? 'bg-gray-900 border-gray-800 text-white' 
          : 'bg-white border-gray-200 text-gray-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand / Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Wine className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-bold text-lg tracking-tight leading-tight">
                    GRAND HORIZON
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                    BAR & POS
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hotel & Resort Cashier Terminal
                </p>
              </div>
            </div>

            {/* Shift & Time Status */}
            <div className="hidden md:flex items-center space-x-6">
              
              {/* Shift info badge */}
              <button 
                onClick={openShiftModal}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  currentShift 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <div>
                  <div className="font-semibold text-left">
                    {currentShift ? `Shift Open (${currentShift.cashierName})` : 'No Active Shift'}
                  </div>
                  <div className="text-[10px] opacity-80 text-left">
                    {currentShift ? `Float: $${currentShift.openingCash.toFixed(2)}` : 'Click to Open Shift'}
                  </div>
                </div>
              </button>

              {/* Low Stock Alert Badge */}
              {lowStockCount > 0 && (
                <button
                  onClick={onNavigateToStock}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 text-xs font-medium animate-pulse"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>{lowStockCount} Low Stock</span>
                </button>
              )}

              {/* Realtime Clock */}
              <div className="flex items-center space-x-2 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Right Controls: Role & Theme Switcher */}
            <div className="flex items-center space-x-3">
              
              {/* Role Badge Button */}
              <button
                onClick={handleRoleToggle}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  userRole === 'Manager'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-sm shadow-purple-500/20'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                }`}
                title={userRole === 'Cashier' ? 'Switch to Manager Mode' : 'Switch to Cashier Mode'}
              >
                {userRole === 'Manager' ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-amber-300" />
                    <span>Manager Mode</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Cashier Mode</span>
                  </>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                title="Toggle Dark/Light Mode"
              >
                {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Manager PIN Security Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                <Lock className="w-5 h-5" />
                <h3 className="font-bold text-base">Manager Access Required</h3>
              </div>
              <button 
                onClick={() => setShowPinModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Enter Manager PIN code to unlock override privileges, price edits, and manager settings.
            </p>

            <form onSubmit={verifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Manager PIN Code</label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN (Default: 1234)"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-center tracking-widest text-lg font-mono focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              {pinError && (
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 text-xs text-center font-medium">
                  {pinError}
                </div>
              )}

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/30"
                >
                  Unlock Manager Mode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
