import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Lock,
  Download,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { AuditLogEntry } from '../types/forestguard';
import { MOCK_AUDIT_LOGS } from '../services/mockData';

export const SystemAudit: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = logs.filter(
    (l) =>
      l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1612] p-4 rounded-xl border border-emerald-950/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              AUDIT LEDGER
            </span>
            <h1 className="text-lg font-bold text-slate-100">
              SYSTEM AUDIT & IMMUTABLE GOVERNANCE LOGS
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Append-Only Cryptographically Sealed System Logs • Every Verification, Access & Export Recorded
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800/50 text-emerald-300">
            AUDIT SEAL: UNTAMPERED
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-[#091510] rounded-xl border border-emerald-950 flex items-center gap-2 text-xs">
        <Search className="w-4 h-4 text-emerald-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by action, user name, or entity ID..."
          className="w-full bg-[#111a15] border border-emerald-900/60 rounded px-2.5 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Audit Log Entries List */}
      <div className="space-y-3">
        {filtered.map((log) => (
          <div
            key={log.id}
            className="p-3.5 rounded-xl bg-[#091510] border border-emerald-950 space-y-2 text-xs hover:border-emerald-800/60 transition-colors shadow-md"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">{log.id}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800/40 text-emerald-300 font-bold uppercase">
                  {log.action}
                </span>
                <span className="text-slate-400">
                  Target: <strong className="text-slate-200">{log.targetEntity} #{log.targetId}</strong>
                </span>
              </div>

              <div className="text-[11px] text-slate-400">
                {log.timestamp}
              </div>
            </div>

            <p className="text-slate-200 font-sans text-xs leading-relaxed bg-[#06100b] p-2.5 rounded border border-emerald-950/70">
              {log.details}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 pt-1 border-t border-emerald-950/60">
              <div>
                User: <span className="text-slate-200 font-bold">{log.userName}</span> ({log.userRole}) • IP: {log.ipAddress}
              </div>

              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="font-mono text-[9px] truncate max-w-xs">{log.tamperSealHash}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
