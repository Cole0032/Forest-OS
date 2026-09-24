import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Bell,
  Clock,
  HardDrive,
  UserCheck,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Wifi,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/forestguard';
import { AVAILABLE_ROLES } from '../services/mockData';
import { getCachedAccessToken, googleSignIn, initAuth } from '../services/firebaseAuth';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentUser: UserProfile;
  onSelectRole: (role: UserRole) => void;
  selectedZone: string;
  onSelectZone: (zone: string) => void;
  globalSearch: string;
  onSearchChange: (query: string) => void;
  onOpenDriveModal: () => void;
  unreadAlertCount: number;
  onNavigateToModule: (moduleId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectRole,
  selectedZone,
  onSelectZone,
  globalSearch,
  onSearchChange,
  onOpenDriveModal,
  unreadAlertCount,
  onNavigateToModule,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [driveConnected, setDriveConnected] = useState<boolean>(!!getCachedAccessToken());
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setDriveConnected(true);
        setGoogleUserEmail(user.email);
      },
      () => {
        setDriveConnected(false);
        setGoogleUserEmail(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleDriveConnectClick = async () => {
    if (driveConnected) {
      onOpenDriveModal();
    } else {
      try {
        const res = await googleSignIn();
        if (res) {
          setDriveConnected(true);
          setGoogleUserEmail(res.user.email);
        }
      } catch (err) {
        console.error('Drive connection error:', err);
      }
    }
  };

  const zones = [
    'All Monitored Zones (184,500 ha)',
    'Tapir Ridge Strict Nature Reserve',
    'Emerald River Corridor',
    'Northern Canopy Wildlife Corridor',
    'Blackwood Sustainable Concession',
    'Rio Negro Tributary Headwaters',
    'Kupari Border Checkpoint Sector',
  ];

  return (
    <header
      className={`sticky top-0 z-40 h-16 backdrop-blur-md border-b px-4 flex items-center justify-between gap-3 transition-colors ${
        isDark
          ? 'bg-[#0a0f0d]/95 border-emerald-950/60 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Brand & Mission Statement Tag */}
      <div className="flex items-center gap-3 min-w-[260px]">
        <div
          onClick={() => onNavigateToModule('command-center')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div
            className={`relative w-9 h-9 rounded-lg border flex items-center justify-center shadow-lg transition-colors ${
              isDark
                ? 'bg-emerald-950/80 border-emerald-500/40 shadow-emerald-950/50 group-hover:border-emerald-400'
                : 'bg-emerald-50 border-emerald-300 shadow-emerald-100 group-hover:border-emerald-500'
            }`}
          >
            <ShieldAlert
              className={`w-5 h-5 ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}
            />
            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-ping ${
                isDark ? 'bg-emerald-400' : 'bg-emerald-500'
              }`}
            />
            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                isDark ? 'bg-emerald-500' : 'bg-emerald-600'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-bold text-base tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                FORESTGUARD<span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}> AI</span>
              </span>
            </div>
            <p
              className={`text-[10px] tracking-tight flex items-center gap-1.5 font-medium ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${
                  isDark ? 'bg-emerald-400' : 'bg-emerald-600'
                }`}
              ></span>
              Environmental Risk Intelligence Platform
            </p>
          </div>
        </div>
      </div>

      {/* Global Search */}
      <div className="hidden md:flex flex-1 max-w-md relative">
        <Search
          className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
            isDark ? 'text-emerald-400/70' : 'text-slate-400'
          }`}
        />
        <input
          type="text"
          value={globalSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search incidents, cameras, sensors, plates, permits, or legal acts (Press /)..."
          className={`w-full rounded-lg pl-9 pr-14 py-1.5 text-xs transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500/40 ${
            isDark
              ? 'bg-[#111a15] border border-emerald-900/60 text-slate-200 placeholder-slate-500 focus:border-emerald-500/60'
              : 'bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-emerald-500'
          }`}
        />
        <span
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded font-mono ${
            isDark
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
              : 'bg-slate-200 text-slate-600 border border-slate-300'
          }`}
        >
          ⌘K
        </span>
      </div>

      {/* Center Zone Selector */}
      <div className="hidden lg:flex items-center gap-2">
        <span
          className={`text-[11px] font-semibold ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          ZONE:
        </span>
        <select
          value={selectedZone}
          onChange={(e) => onSelectZone(e.target.value)}
          className={`text-xs rounded-lg px-2.5 py-1.5 font-medium border focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${
            isDark
              ? 'bg-[#111a15] border-emerald-900/60 text-emerald-300'
              : 'bg-slate-50 border-slate-300 text-emerald-800'
          }`}
        >
          {zones.map((z) => (
            <option
              key={z}
              value={z}
              className={isDark ? 'bg-[#0e1612] text-slate-200' : 'bg-white text-slate-800'}
            >
              {z}
            </option>
          ))}
        </select>
      </div>

      {/* Right Controls & Utilities */}
      <div className="flex items-center gap-2">
        {/* Live UTC Clock */}
        <div
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono tabular-nums ${
            isDark
              ? 'bg-[#111a15] border-emerald-900/50 text-slate-300'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <span>{currentTime || 'SYNCHRONIZING...'}</span>
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${
            isDark
              ? 'bg-[#111a15] border-emerald-900/50 text-amber-300 hover:text-amber-200 hover:border-amber-400/50'
              : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Color Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Google Drive Status & Export Trigger */}
        <button
          onClick={handleDriveConnectClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border transition-all ${
            driveConnected
              ? isDark
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              : isDark
              ? 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:border-emerald-500/40'
              : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
          }`}
          title={
            driveConnected
              ? `Connected as ${googleUserEmail || 'Google Drive'}. Click to export.`
              : 'Connect Google Drive for evidence export'
          }
        >
          <HardDrive
            className={`w-3.5 h-3.5 ${
              driveConnected
                ? isDark
                  ? 'text-emerald-400'
                  : 'text-emerald-600'
                : 'text-slate-400'
            }`}
          />
          <span className="hidden sm:inline font-medium">
            {driveConnected ? 'Drive Linked' : 'Connect Drive'}
          </span>
          {driveConnected && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isDark ? 'bg-emerald-400' : 'bg-emerald-600'
              }`}
            ></span>
          )}
        </button>

        {/* Notifications Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#111a15] border-emerald-900/50 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-emerald-700 hover:bg-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center font-mono">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 border ${
                isDark
                  ? 'bg-[#0e1612] border-emerald-800/60 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-2 border-b mb-2 ${
                  isDark ? 'border-emerald-900/50' : 'border-slate-200'
                }`}
              >
                <span
                  className={`text-xs font-bold flex items-center gap-1.5 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  PRIORITY ALERTS ({unreadAlertCount})
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  LIVE FEED
                </span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                <div
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigateToModule('incidents');
                  }}
                  className={`p-2 rounded border text-xs cursor-pointer transition-colors ${
                    isDark
                      ? 'bg-red-950/30 border-red-800/40 hover:bg-red-900/30'
                      : 'bg-red-50 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-red-600 dark:text-red-400 font-mono text-[11px] font-bold">
                    <span>ENV-2026-000182</span>
                    <span className="text-[10px] opacity-75">02:18 UTC</span>
                  </div>
                  <p className="text-[11px] mt-0.5 font-medium leading-snug">
                    Chainsaw acoustic frequency + heavy vehicle incursion inside Tapir Ridge Core Reserve.
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                    <span>AI Confidence: 91%</span>
                    <span className="opacity-60">• Review Pending</span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigateToModule('timber');
                  }}
                  className={`p-2 rounded border text-xs cursor-pointer transition-colors ${
                    isDark
                      ? 'bg-amber-950/30 border-amber-800/40 hover:bg-amber-900/30'
                      : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">
                    <span>TMB-2026-9041</span>
                    <span className="text-[10px] opacity-75">06:45 UTC</span>
                  </div>
                  <p className="text-[11px] mt-0.5 font-medium leading-snug">
                    +48.9% timber volume discrepancy at Kupari Checkpoint. Suspected Rosewood substitution.
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    <span>Hold Order Active</span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigateToModule('satellite');
                  }}
                  className={`p-2 rounded border text-xs cursor-pointer transition-colors ${
                    isDark
                      ? 'bg-emerald-950/40 border-emerald-800/40 hover:bg-emerald-900/40'
                      : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                    <span>SAT-CHANGE-09</span>
                    <span className="text-[10px] opacity-75">Yesterday</span>
                  </div>
                  <p className="text-[11px] mt-0.5 font-medium leading-snug">
                    Sentinel-2 detected 4.8 ha canopy clearing near Tapir Ridge border.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher & Profile */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-colors text-left ${
              isDark
                ? 'bg-[#111a15] border-emerald-900/60 hover:border-emerald-500/60'
                : 'bg-slate-100 border-slate-300 hover:border-slate-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${
                isDark
                  ? 'bg-emerald-900/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-emerald-100 border-emerald-300 text-emerald-800'
              }`}
            >
              {currentUser.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="hidden sm:block">
              <div
                className={`text-xs font-bold flex items-center gap-1 ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                <span>{currentUser.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
              <div
                className={`text-[10px] font-semibold flex items-center gap-1 ${
                  isDark ? 'text-emerald-400' : 'text-emerald-700'
                }`}
              >
                <span>{currentUser.role.replace(/_/g, ' ')}</span>
                <span className="text-slate-400">•</span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>AUTHORIZED</span>
              </div>
            </div>
          </button>

          {showRoleDropdown && (
            <div
              className={`absolute right-0 mt-2 w-72 rounded-xl shadow-2xl p-2.5 z-50 border ${
                isDark
                  ? 'bg-[#0e1612] border-emerald-800/70 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
              }`}
            >
              <div
                className={`px-2 py-1.5 border-b mb-2 ${
                  isDark ? 'border-emerald-950/60' : 'border-slate-200'
                }`}
              >
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  SWITCH ACTIVE ROLE (RBAC)
                </span>
                <p
                  className={`text-xs mt-0.5 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Test platform permissions across enforcement roles:
                </p>
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                {AVAILABLE_ROLES.map(({ role, label, desc }) => {
                  const isSelected = currentUser.role === role;
                  return (
                    <button
                      key={role}
                      onClick={() => {
                        onSelectRole(role);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-start justify-between gap-2 transition-colors ${
                        isSelected
                          ? isDark
                            ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300'
                            : 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                          : isDark
                          ? 'hover:bg-emerald-950/40 text-slate-300'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          {label}
                          {isSelected && (
                            <CheckCircle2
                              className={`w-3 h-3 ${
                                isDark ? 'text-emerald-400' : 'text-emerald-600'
                              }`}
                            />
                          )}
                        </div>
                        <p
                          className={`text-[10px] mt-0.5 leading-tight ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                className={`mt-2 pt-2 border-t px-2 flex items-center justify-between text-[11px] ${
                  isDark ? 'border-emerald-950/60 text-slate-400' : 'border-slate-200 text-slate-500'
                }`}
              >
                <span>Agency: IBAMA / CONAF</span>
                <span
                  className={`font-semibold ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  ENFORCEMENT MODE
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
