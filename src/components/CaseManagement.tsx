import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
  Truck,
  ExternalLink,
  HardDrive,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { InvestigationCase } from '../types/forestguard';
import { MOCK_CASES, MOCK_INCIDENTS } from '../services/mockData';
import { getCachedAccessToken, googleSignIn, uploadToGoogleDrive } from '../services/firebaseAuth';

export const CaseManagement: React.FC = () => {
  const [cases, setCases] = useState<InvestigationCase[]>(MOCK_CASES);
  const [selectedCase, setSelectedCase] = useState<InvestigationCase>(MOCK_CASES[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [driveCaseLink, setDriveCaseLink] = useState<string | null>(null);

  const filtered = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.leadInvestigator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleChecklist = (taskIndex: number) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === selectedCase.id) {
          const updatedChecklist = [...c.checklist];
          updatedChecklist[taskIndex].completed = !updatedChecklist[taskIndex].completed;
          return { ...c, checklist: updatedChecklist };
        }
        return c;
      })
    );
    setSelectedCase((prev) => {
      const updatedChecklist = [...prev.checklist];
      updatedChecklist[taskIndex].completed = !updatedChecklist[taskIndex].completed;
      return { ...prev, checklist: updatedChecklist };
    });
  };

  const handleExportCaseDossier = async (c: InvestigationCase) => {
    setIsExporting(true);
    setDriveCaseLink(null);
    try {
      let token = getCachedAccessToken();
      if (!token) {
        const signin = await googleSignIn();
        if (signin) token = signin.accessToken;
      }
      if (!token) throw new Error('Google authorization required');

      const caseDossier = {
        caseId: c.id,
        title: c.title,
        status: c.status,
        leadInvestigator: c.leadInvestigator,
        primaryViolation: c.primaryViolation,
        targetZone: c.targetZone,
        linkedIncidents: c.incidentIds,
        linkedEvidence: c.evidenceIds,
        suspectVehicles: c.suspectVehicles,
        suspectEntities: c.suspectEntities,
        forensicChecklist: c.checklist,
        formalSummary: c.formalDossierSummary,
        exportedAt: new Date().toISOString(),
      };

      const filename = `PROSECUTORIAL_DOSSIER_${c.id}_${Date.now()}.json`;
      const uploaded = await uploadToGoogleDrive(
        filename,
        'application/json',
        JSON.stringify(caseDossier, null, 2),
        token,
        `Sealed Prosecutorial Dossier for Case ${c.id}`
      );

      setDriveCaseLink(uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`);
    } catch (err: any) {
      console.error('Case Drive export failed:', err);
      alert(`Drive export error: ${err.message || 'Check OAuth'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1612] p-4 rounded-xl border border-emerald-950/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              INVESTIGATIONS
            </span>
            <h1 className="text-lg font-bold text-slate-100">
              INVESTIGATION DOSSIERS & CASE MANAGEMENT
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Formal Case Binders • Chain-of-Custody Linking • Prosecutorial Referral to Public Environmental Ministry
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-blue-950 border border-blue-800/50 text-blue-300">
            ACTIVE CASES: {cases.length}
          </span>
        </div>
      </div>

      {/* Main Grid: Cases List (Left) and Case Dossier Viewer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 1 Col: Cases List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pb-1 border-b border-emerald-950">
            <span>INVESTIGATION CASES</span>
            <span className="text-slate-400 text-[10px]">ACTIVE DOSSIERS</span>
          </div>

          <div className="space-y-2">
            {filtered.map((c) => {
              const isSelected = selectedCase.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedCase(c);
                    setDriveCaseLink(null);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500/70 shadow-lg'
                      : 'bg-[#09140f] border-emerald-950 hover:border-emerald-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{c.id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800/40 text-blue-300 font-bold uppercase">
                      {c.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 font-sans mt-1 leading-snug">
                    {c.title}
                  </h4>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-emerald-950/60 font-mono">
                    <span>Lead: {c.leadInvestigator}</span>
                    <span className="text-emerald-400">{c.incidentIds.length} Incidents</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Selected Case Dossier */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-[#091510] border border-emerald-900/60 space-y-4 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-emerald-950">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-emerald-400">
                    {selectedCase.id}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 border border-blue-800/50 text-blue-300 font-bold uppercase">
                    {selectedCase.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 font-sans">
                  {selectedCase.title}
                </h3>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                  <span>Lead: {selectedCase.leadInvestigator} ({selectedCase.investigatorBadge})</span>
                  <span>•</span>
                  <span>Zone: {selectedCase.targetZone}</span>
                </div>
              </div>

              <button
                onClick={() => handleExportCaseDossier(selectedCase)}
                disabled={isExporting}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>{isExporting ? 'EXPORTING...' : 'EXPORT DOSSIER TO DRIVE'}</span>
              </button>
            </div>

            {driveCaseLink && (
              <div className="p-3 rounded bg-emerald-950 border border-emerald-600 text-xs flex items-center justify-between">
                <span className="text-emerald-300">
                  ✓ Case dossier exported to Google Drive.
                </span>
                <a
                  href={driveCaseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-emerald-400 font-bold flex items-center gap-1"
                >
                  <span>OPEN DOSSIER</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Primary Violation & Suspects */}
            <div className="p-3 rounded-lg bg-[#06100b] border border-emerald-950 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block font-bold text-[10px]">PRIMARY STATUTORY VIOLATION:</span>
                <p className="text-slate-200 font-sans mt-0.5">{selectedCase.primaryViolation}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-950">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">SUSPECT VEHICLES:</span>
                  <div className="space-y-0.5 mt-0.5">
                    {selectedCase.suspectVehicles.map((v, i) => (
                      <span key={i} className="block text-amber-300 text-[11px] font-mono">
                        • {v}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">IMPLICATED ENTITIES:</span>
                  <div className="space-y-0.5 mt-0.5">
                    {selectedCase.suspectEntities.map((e, i) => (
                      <span key={i} className="block text-slate-200 text-[11px] font-sans">
                        • {e}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Formal Summary */}
            <div className="p-3 rounded-lg bg-[#06100b] border border-emerald-950 text-xs">
              <span className="text-slate-400 block font-bold text-[10px]">FORMAL PROSECUTORIAL SYNOPSIS:</span>
              <p className="text-slate-200 font-sans text-xs mt-1 leading-relaxed">
                {selectedCase.formalDossierSummary}
              </p>
            </div>

            {/* Investigator Milestones Checklist */}
            <div className="space-y-2 pt-2 border-t border-emerald-950">
              <span className="text-xs font-bold text-emerald-400 uppercase block">
                FORENSIC MILESTONES & INVESTIGATION CHECKLIST:
              </span>

              <div className="space-y-2">
                {selectedCase.checklist.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleChecklist(idx)}
                    className="p-2.5 rounded-lg bg-[#06100b] border border-emerald-950 flex items-start gap-2.5 cursor-pointer hover:border-emerald-800 transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                        item.completed
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-600'
                      }`}
                    >
                      {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 text-xs">
                      <span
                        className={`font-sans ${
                          item.completed ? 'text-slate-400 line-through' : 'text-slate-200 font-medium'
                        }`}
                      >
                        {item.task}
                      </span>
                      {item.completedAt && (
                        <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                          Completed: {item.completedAt} by {item.completedBy}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
