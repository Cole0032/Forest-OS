import React from 'react';
import {
  ShieldCheck,
  Users,
  Lock,
  Key,
  Database,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
} from 'lucide-react';
import { UserRole, UserProfile } from '../types/forestguard';
import { AVAILABLE_ROLES } from '../services/mockData';

interface AdministrationProps {
  currentUser: UserProfile;
  onSelectRole: (role: UserRole) => void;
}

export const Administration: React.FC<AdministrationProps> = ({
  currentUser,
  onSelectRole,
}) => {
  const permissionsMatrix = [
    { module: '01 COMMAND CENTER', admin: true, env: true, forest: true, field: true, inv: true, analyst: true, legal: true, auditor: true, readOnly: true },
    { module: '02 LIVE CCTV & VIDEO', admin: true, env: true, forest: true, field: true, inv: true, analyst: false, legal: false, auditor: true, readOnly: true },
    { module: '03 FOREST GIS MAP', admin: true, env: true, forest: true, field: true, inv: true, analyst: true, legal: true, auditor: true, readOnly: true },
    { module: '04 AI INCIDENT DETECTION', admin: true, env: true, forest: true, field: true, inv: true, analyst: true, legal: true, auditor: true, readOnly: true },
    { module: '05 IoT DEVICE REBOOT/CONFIG', admin: true, env: false, forest: false, field: false, inv: false, analyst: false, legal: false, auditor: false, readOnly: false },
    { module: '06 SATELLITE ANALYSIS', admin: true, env: true, forest: true, field: false, inv: true, analyst: true, legal: false, auditor: true, readOnly: true },
    { module: '07 TIMBER WEIGHBRIDGE CITATION', admin: true, env: true, forest: true, field: false, inv: true, analyst: false, legal: true, auditor: true, readOnly: false },
    { module: '08 VERIFY INCIDENT (CONSEQUENTIAL)', admin: true, env: true, forest: true, field: false, inv: true, analyst: false, legal: false, auditor: false, readOnly: false },
    { module: '09 CASE PROSECUTORIAL REFERRAL', admin: true, env: false, forest: false, field: false, inv: true, analyst: false, legal: true, auditor: false, readOnly: false },
    { module: '10 EVIDENCE HASH EXPORT', admin: true, env: true, forest: true, field: true, inv: true, analyst: false, legal: true, auditor: true, readOnly: false },
    { module: '11 LEGAL RAG AMENDMENT', admin: true, env: false, forest: false, field: false, inv: false, analyst: false, legal: true, auditor: false, readOnly: false },
    { module: '14 USER ROLE RBAC MANAGEMENT', admin: true, env: false, forest: false, field: false, inv: false, analyst: false, legal: false, auditor: false, readOnly: false },
    { module: '15 IMMUTABLE AUDIT LOG PURGE', admin: false, env: false, forest: false, field: false, inv: false, analyst: false, legal: false, auditor: false, readOnly: false }, // NO ONE CAN PURGE AUDIT LOGS!
  ];

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1612] p-4 rounded-xl border border-emerald-950/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              ADMINISTRATION & RBAC
            </span>
            <h1 className="text-lg font-bold text-slate-100">
              SYSTEM ADMINISTRATION & RBAC PERMISSION MATRIX
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Role-Based Access Control • Multi-Agency Enforcement Governance • Zero-Trust Security Policies
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800/50 text-emerald-300">
            CURRENT: {currentUser.role.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Role Switcher Cards */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-emerald-400 uppercase">
          ACTIVE USER IDENTITY & ROLE SIMULATOR:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {AVAILABLE_ROLES.map(({ role, label }) => {
            const isSelected = currentUser.role === role;
            return (
              <button
                key={role}
                onClick={() => onSelectRole(role)}
                className={`p-2.5 rounded-xl border text-xs font-mono text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-md font-bold'
                    : 'bg-[#091510] border-emerald-950 text-slate-400 hover:text-slate-200 hover:border-emerald-800'
                }`}
              >
                <div className="truncate">{label}</div>
                <div className="text-[9px] text-slate-500 mt-1 uppercase">
                  {isSelected ? '● ACTIVE' : 'SWITCH'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RBAC Permission Matrix Table */}
      <div className="p-4 rounded-xl bg-[#091510] border border-emerald-900/60 space-y-3 shadow-xl">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pb-1 border-b border-emerald-950">
          <span>STATUTORY ROLE-BASED ACCESS CONTROL (RBAC) MATRIX</span>
          <span className="text-slate-400 text-[10px]">ENFORCED AT API GATEWAY</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0c1a14] text-slate-400 text-[10px] border-b border-emerald-950">
              <tr>
                <th className="p-2.5">CAPABILITY / PERMISSION</th>
                <th className="p-2.5 text-center">ADMIN</th>
                <th className="p-2.5 text-center">ENV OFF.</th>
                <th className="p-2.5 text-center">FOREST OFF.</th>
                <th className="p-2.5 text-center">FIELD OFF.</th>
                <th className="p-2.5 text-center">INVESTIGATOR</th>
                <th className="p-2.5 text-center">ANALYST</th>
                <th className="p-2.5 text-center">LEGAL</th>
                <th className="p-2.5 text-center">AUDITOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/60 text-slate-300 text-[11px]">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#111e17] transition-colors">
                  <td className="p-2.5 font-bold text-slate-200">{row.module}</td>
                  <td className="p-2.5 text-center">{row.admin ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}</td>
                  <td className="p-2.5 text-center">{row.env ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}</td>
                  <td className="p-2.5 text-center">{row.forest ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}</td>
                  <td className="p-2.5 text-center">{row.field ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}</td>
                  <td className="p-2.5 text-center">{row.inv ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}</td>
                  <td className="p-2.5 text-center">{row.analyst ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}</td>
                  <td className="p-2.5 text-center">{row.legal ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}</td>
                  <td className="p-2.5 text-center">{row.auditor ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-700 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
