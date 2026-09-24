import React, { useState } from 'react';
import {
  Truck,
  Scale,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  Printer,
  FileText,
} from 'lucide-react';
import { TimberTransportRecord } from '../types/forestguard';
import { MOCK_TIMBER_RECORDS } from '../services/mockData';
import { performFastTriage, FastTriageResponse } from '../services/geminiService';

export const TimberMonitoring: React.FC = () => {
  const [records, setRecords] = useState<TimberTransportRecord[]>(MOCK_TIMBER_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<TimberTransportRecord>(MOCK_TIMBER_RECORDS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Fast Triage with gemini-3.1-flash-lite
  const [isTriaging, setIsTriaging] = useState<boolean>(false);
  const [triageResult, setTriageResult] = useState<FastTriageResponse | null>(null);

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicleRegistration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.permitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.driverName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRunFastTriage = async (rec: TimberTransportRecord) => {
    setIsTriaging(true);
    setTriageResult(null);
    try {
      const res = await performFastTriage({
        type: 'TIMBER_PERMIT_DISCREPANCY',
        data: {
          permitId: rec.permitId,
          vehiclePlate: rec.vehicleRegistration,
          declaredSpecies: rec.declaredSpecies,
          declaredQuantityM3: rec.declaredQuantityM3,
          recordedQuantityM3: rec.recordedQuantityM3,
          discrepancyM3: rec.discrepancyM3,
          checkpoint: rec.checkpointName,
        },
      });
      setTriageResult(res);
    } catch (err) {
      console.error('Fast triage error:', err);
    } finally {
      setIsTriaging(false);
    }
  };

  const getStatusBadge = (status: TimberTransportRecord['status']) => {
    switch (status) {
      case 'AUTHORIZED':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700/60';
      case 'DISCREPANCY_DETECTED':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      case 'HELD_FOR_INSPECTION':
        return 'bg-red-950 text-red-300 border-red-700/60';
      default:
        return 'bg-rose-950 text-rose-300 border-rose-700/60';
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1612] p-4 rounded-xl border border-emerald-950/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              TIMBER SURVEILLANCE
            </span>
            <h1 className="text-lg font-bold text-slate-100">
              ILLEGAL TRADE & TIMBER TRANSPORT MONITORING
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Automated Weighbridge Telemetry Cross-Referenced with SISFLORA / DOF Electronic Permits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunFastTriage(selectedRecord)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>FAST TRIAGE (GEMINI FLASH-LITE)</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 bg-[#091510] rounded-xl border border-emerald-950 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-emerald-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search license plate, permit ID, or driver..."
            className="w-full bg-[#111a15] border border-emerald-900/60 rounded px-2.5 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#111a15] border border-emerald-900/60 text-slate-300 rounded px-2.5 py-1"
          >
            <option value="ALL">All Inspection Statuses</option>
            <option value="AUTHORIZED">Authorized Transits</option>
            <option value="DISCREPANCY_DETECTED">Discrepancy Detected</option>
            <option value="HELD_FOR_INSPECTION">Held for Inspection</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table View (Left 2 cols) */}
        <div className="lg:col-span-2 rounded-xl bg-[#091510] border border-emerald-900/60 overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0c1a14] text-slate-400 sticky top-0 border-b border-emerald-950">
                <tr>
                  <th className="p-3">LOG ID</th>
                  <th className="p-3">VEHICLE PLATE</th>
                  <th className="p-3">PERMIT ID</th>
                  <th className="p-3">DECLARED</th>
                  <th className="p-3">RECORDED</th>
                  <th className="p-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60 text-slate-300">
                {filtered.map((rec) => {
                  const isSelected = selectedRecord?.id === rec.id;
                  const hasDiscrepancy = rec.discrepancyM3 > 1;

                  return (
                    <tr
                      key={rec.id}
                      onClick={() => setSelectedRecord(rec)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-950/80 text-emerald-200'
                          : 'hover:bg-[#111e17]'
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-100">{rec.id}</td>
                      <td className="p-3 text-[11px] font-bold text-emerald-400">{rec.vehicleRegistration}</td>
                      <td className="p-3 text-[11px] text-slate-400">{rec.permitId}</td>
                      <td className="p-3 text-[11px]">{rec.declaredQuantityM3} m³</td>
                      <td className={`p-3 text-[11px] font-bold ${hasDiscrepancy ? 'text-amber-400' : 'text-slate-200'}`}>
                        {rec.recordedQuantityM3} m³
                        {hasDiscrepancy && (
                          <span className="text-[10px] text-red-400 block">
                            (+{rec.discrepancyM3} m³)
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getStatusBadge(rec.status)}`}>
                          {rec.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Record Detail & Fast Triage (Right 1 col) */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-[#091510] border border-emerald-900/60 space-y-3.5">
            <div className="flex items-start justify-between pb-2 border-b border-emerald-950">
              <div>
                <span className="text-[10px] text-slate-400 block">TRANSIT INSPECTION DOSSIER:</span>
                <h3 className="font-bold text-emerald-400 text-sm">
                  {selectedRecord.id}
                </h3>
                <span className="text-[10px] text-slate-400">
                  Checkpoint: {selectedRecord.checkpointName}
                </span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getStatusBadge(selectedRecord.status)}`}>
                {selectedRecord.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Comparison Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-[#0b1812] border border-emerald-950">
                <span className="text-slate-400 text-[10px] block">DECLARED VOLUME:</span>
                <span className="text-slate-200 font-bold text-sm">
                  {selectedRecord.declaredQuantityM3} m³
                </span>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                  Species: {selectedRecord.declaredSpecies}
                </span>
              </div>

              <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/40">
                <span className="text-amber-400 text-[10px] block font-bold">RECORDED ON SCALE:</span>
                <span className="text-amber-300 font-bold text-sm">
                  {selectedRecord.recordedQuantityM3} m³
                </span>
                <span className="text-[10px] text-red-400 block font-bold mt-0.5">
                  DELTA: +{selectedRecord.discrepancyM3} m³ (+{((selectedRecord.discrepancyM3 / selectedRecord.declaredQuantityM3) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Origin & Destination */}
            <div className="p-2.5 rounded bg-[#06100b] border border-emerald-950 text-[11px] space-y-1">
              <div>
                <span className="text-slate-500 block text-[10px]">ORIGIN CONCESSION:</span>
                <span className="text-slate-200">{selectedRecord.originConcession}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DESTINATION FACILITY:</span>
                <span className="text-slate-200">{selectedRecord.destinationFacility}</span>
              </div>
            </div>

            {/* Fast Triage Box (Gemini Flash-Lite) */}
            {triageResult && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-700/60 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-emerald-900 pb-1">
                  <span>DISPOSITION: {triageResult.recommendedDisposition}</span>
                  <span className="text-[10px] text-slate-400">{triageResult.triageLatencyMs}ms (Lite)</span>
                </div>
                <p className="text-slate-200 font-sans text-xs">
                  {triageResult.triageNotes}
                </p>
              </div>
            )}

            {/* Administrative Action */}
            <div className="pt-2 border-t border-emerald-950 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase block font-bold">
                OFFICER DISPOSITION CONTROLS:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => alert(`Vehicle Hold Directive Form ADO-04 generated for ${selectedRecord.vehicleRegistration}.`)}
                  className="py-1.5 px-2 rounded bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700 font-bold transition-colors"
                >
                  Hold Vehicle
                </button>
                <button
                  onClick={() => alert(`Cleared for transit with inspection stamp.`)}
                  className="py-1.5 px-2 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 font-bold transition-colors"
                >
                  Authorize Transit
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-[10px] text-slate-400 font-sans leading-relaxed">
              AI detects volumetric discrepancies. Discrepancies do not automatically constitute a crime; human physical measurement is required.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
