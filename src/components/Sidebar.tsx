import React from 'react';
import {
  LayoutDashboard,
  Video,
  MapPin,
  Cpu,
  Radio,
  Satellite,
  Truck,
  AlertOctagon,
  Briefcase,
  FileCheck2,
  Scale,
  Compass,
  BarChart3,
  ShieldCheck,
  History,
  Lock,
} from 'lucide-react';
import { UserRole } from '../types/forestguard';
import { useTheme } from '../context/ThemeContext';

export interface ModuleItem {
  id: string;
  name: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: 'red' | 'amber' | 'emerald' | 'blue';
  minRole?: UserRole[];
}

export const MODULES: ModuleItem[] = [
  { id: 'command-center', name: 'COMMAND CENTER', icon: LayoutDashboard },
  { id: 'live-monitoring', name: 'LIVE MONITORING', icon: Video, badge: 'LIVE', badgeColor: 'emerald' },
  { id: 'forest-gis', name: 'FOREST GIS', icon: MapPin },
  { id: 'ai-detection', name: 'AI INCIDENT DETECTION', icon: Cpu, badge: 'ALERT', badgeColor: 'red' },
  { id: 'iot-network', name: 'IoT DEVICE NETWORK', icon: Radio, badge: 'ACTIVE', badgeColor: 'emerald' },
  { id: 'satellite', name: 'SATELLITE ANALYSIS', icon: Satellite },
  { id: 'timber', name: 'ILLEGAL TRADE / TIMBER', icon: Truck, badge: 'HOLD', badgeColor: 'amber' },
  { id: 'incidents', name: 'INCIDENT MANAGEMENT', icon: AlertOctagon, badge: 'ACTIVE', badgeColor: 'red' },
  { id: 'cases', name: 'INVESTIGATION & CASES', icon: Briefcase, badge: 'INQUIRY', badgeColor: 'blue' },
  { id: 'evidence', name: 'EVIDENCE MANAGEMENT', icon: FileCheck2 },
  { id: 'legal-rag', name: 'LEGAL INTELLIGENCE', icon: Scale },
  { id: 'field-ops', name: 'FIELD OPERATIONS', icon: Compass, badge: 'PATROLS', badgeColor: 'emerald' },
  { id: 'analytics', name: 'ANALYTICS & REPORTS', icon: BarChart3 },
  { id: 'administration', name: 'ADMINISTRATION', icon: ShieldCheck },
  { id: 'system-audit', name: 'SYSTEM AUDIT', icon: History },
];

interface SidebarProps {
  activeModule: string;
  onSelectModule: (id: string) => void;
  currentUserRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  currentUserRole,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const hasAccess = (mod: ModuleItem) => {
    if (currentUserRole === 'READ_ONLY_VIEWER' && mod.id === 'administration') {
      return false;
    }
    return true;
  };

  return (
    <aside
      className={`w-64 border-r flex flex-col shrink-0 select-none overflow-hidden h-[calc(100vh-4rem)] transition-colors ${
        isDark
          ? 'bg-[#0a0f0d] border-emerald-950/60 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Principle Banner */}
      <div
        className={`p-3 border-b transition-colors ${
          isDark ? 'bg-[#0d1612] border-emerald-950/70' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div
          className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
            isDark ? 'text-emerald-400' : 'text-emerald-700'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isDark ? 'bg-emerald-400' : 'bg-emerald-600'
            }`}
          ></span>
          OPERATIONAL DIRECTIVE
        </div>
        <p
          className={`text-[10px] mt-1 font-medium leading-tight ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          AI DETECTS • AI CORRELATES • HUMANS VERIFY • AUTHORITIES DECIDE
        </p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {MODULES.map((mod) => {
          const isActive = activeModule === mod.id;
          const allowed = hasAccess(mod);
          const Icon = mod.icon;

          return (
            <button
              key={mod.id}
              onClick={() => allowed && onSelectModule(mod.id)}
              disabled={!allowed}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all group ${
                isActive
                  ? isDark
                    ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-inner shadow-emerald-900/40'
                    : 'bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm'
                  : allowed
                  ? isDark
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-[#111c16]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? isDark
                        ? 'text-emerald-400'
                        : 'text-emerald-600'
                      : isDark
                      ? 'text-slate-400 group-hover:text-emerald-400'
                      : 'text-slate-500 group-hover:text-emerald-600'
                  }`}
                />
                <span className="truncate text-left">{mod.name}</span>
              </div>

              {!allowed ? (
                <Lock className="w-3 h-3 text-slate-400 shrink-0" />
              ) : mod.badge ? (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1.5 ${
                    mod.badgeColor === 'red'
                      ? isDark
                        ? 'bg-red-950 text-red-400 border border-red-800/50'
                        : 'bg-red-50 text-red-700 border border-red-200'
                      : mod.badgeColor === 'amber'
                      ? isDark
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                      : mod.badgeColor === 'emerald'
                      ? isDark
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isDark
                      ? 'bg-blue-950 text-blue-300 border border-blue-800/50'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {mod.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div
        className={`p-3 border-t text-[11px] transition-colors ${
          isDark
            ? 'bg-[#0c1410] border-emerald-950/60 text-slate-400'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center justify-between text-[10px] mb-1 font-semibold">
          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>SYSTEM TELEMETRY</span>
          <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>OPERATIONAL</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span>COPERNICUS L-2A:</span>
          <span className={isDark ? 'text-slate-300' : 'text-slate-800'}>CONNECTED</span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span>EDGE MESH:</span>
          <span className={isDark ? 'text-slate-300' : 'text-slate-800'}>99.2% UPTIME</span>
        </div>
      </div>
    </aside>
  );
};
