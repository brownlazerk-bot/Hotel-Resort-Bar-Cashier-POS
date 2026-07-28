import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, Hotel, Key, Eye, EyeOff } from 'lucide-react';
import { AppUser } from '../types';
import { SUPER_ADMIN_CREDENTIALS, loadUsers, addAuditLog, saveCurrentUser } from '../lib/storage';

interface LoginViewProps {
  onLoginSuccess: (user: AppUser) => void;
  darkMode?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, darkMode = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setTimeout(() => {
      // 1. Check Super Admin Hidden Account
      if (
        cleanEmail === SUPER_ADMIN_CREDENTIALS.email.toLowerCase() &&
        cleanPassword === SUPER_ADMIN_CREDENTIALS.passwordHash
      ) {
        const loggedUser: AppUser = {
          ...SUPER_ADMIN_CREDENTIALS,
          lastLoginAt: new Date().toISOString()
        };
        saveCurrentUser(loggedUser);
        addAuditLog({
          userId: loggedUser.id,
          userName: loggedUser.fullName,
          userRole: loggedUser.role,
          userEmail: loggedUser.email,
          action: 'User Login',
          category: 'Auth',
          details: 'Super Admin authenticated successfully'
        });
        setIsSubmitting(false);
        onLoginSuccess(loggedUser);
        return;
      }

      // 2. Check Standard Admin / Staff Users
      const users = loadUsers();
      const foundUser = users.find(
        u => u.email.toLowerCase() === cleanEmail && u.passwordHash === cleanPassword
      );

      if (foundUser) {
        if (foundUser.status !== 'Active') {
          setErrorMsg(`Account is ${foundUser.status.toLowerCase()}. Please contact Super Admin.`);
          addAuditLog({
            userId: foundUser.id,
            userName: foundUser.fullName,
            userRole: foundUser.role,
            userEmail: foundUser.email,
            action: 'Failed Login Attempt',
            category: 'Auth',
            details: `Login blocked: account is ${foundUser.status}`
          });
          setIsSubmitting(false);
          return;
        }

        const updatedUser: AppUser = {
          ...foundUser,
          lastLoginAt: new Date().toISOString()
        };
        saveCurrentUser(updatedUser);
        addAuditLog({
          userId: updatedUser.id,
          userName: updatedUser.fullName,
          userRole: updatedUser.role,
          userEmail: updatedUser.email,
          action: 'User Login',
          category: 'Auth',
          details: `${updatedUser.role} user logged in successfully`
        });
        setIsSubmitting(false);
        onLoginSuccess(updatedUser);
        return;
      }

      // 3. Invalid credentials
      setErrorMsg('Invalid email address or password. Please check your credentials.');
      addAuditLog({
        userId: 'anonymous',
        userName: 'Guest',
        userRole: 'Visitor',
        userEmail: cleanEmail || 'unknown',
        action: 'Failed Login Attempt',
        category: 'Auth',
        details: `Failed login attempt for email: ${cleanEmail}`
      });
      setIsSubmitting(false);
    }, 400);
  };

  const handleQuickFillSuperAdmin = () => {
    setEmail(SUPER_ADMIN_CREDENTIALS.email);
    setPassword(SUPER_ADMIN_CREDENTIALS.passwordHash);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-800'}`}>
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="bg-slate-800 border border-slate-700/80 rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-4 shadow-inner">
              <Hotel className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Grand Horizon Resort
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Hotel & Resort Production System
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-bold">Authentication Error</p>
                <p className="mt-0.5 opacity-90">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. yuskar@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Sign In to System</span>
                </>
              )}
            </button>
          </form>

          {/* System Currency Footer */}
          <div className="mt-8 pt-6 border-t border-slate-700/60 text-center">
            <p className="text-[11px] text-slate-500">
              System Currency: <strong className="text-slate-400">Rwandan Franc (RWF)</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
