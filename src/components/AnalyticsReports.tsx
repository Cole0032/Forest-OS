import React, { useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  FileText,
  Sparkles,
  Download,
  HardDrive,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import { generateExecutiveReportWithAi } from '../services/geminiService';
import { getCachedAccessToken, googleSignIn, uploadToGoogleDrive } from '../services/firebaseAuth';

export const AnalyticsReports: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState<string>('DAILY ENVIRONMENT REPORT');
  const [timeRange, setTimeRange] = useState<string>('Last 24 Hours');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedReport, setGeneratedReport] = useState<{
    title: string;
    executiveSummary: string;
    keyFindings: string[];
    recommendations: string[];
  } | null>(null);

  const [isExportingToDrive, setIsExportingToDrive] = useState<boolean>(false);
  const [driveReportLink, setDriveReportLink] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGeneratedReport(null);
    setDriveReportLink(null);

    try {
      const res = await generateExecutiveReportWithAi(
        selectedReportType,
        timeRange,
        'Tapir Ridge Biosphere & Amazonian Basin'
      );
      setGeneratedReport(res);
    } catch (err) {
      console.error('Report generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportReportToDrive = async () => {
    if (!generatedReport) return;
    setIsExportingToDrive(true);
    try {
      let token = getCachedAccessToken();
      if (!token) {
        const signin = await googleSignIn();
        if (signin) token = signin.accessToken;
      }
      if (!token) throw new Error('Google authorization required');

      const filename = `FORESTGUARD_${selectedReportType.replace(/\s+/g, '_')}_${Date.now()}.json`;
      const uploaded = await uploadToGoogleDrive(
        filename,
        'application/json',
        JSON.stringify(generatedReport, null, 2),
        token,
        `Official Intelligence Report: ${generatedReport.title}`
      );

      setDriveReportLink(uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`);
    } catch (err: any) {
      console.error('Report Drive export failed:', err);
      alert(`Google Drive export failed: ${err.message || 'Check OAuth'}`);
    } finally {
      setIsExportingToDrive(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1612] p-4 rounded-xl border border-emerald-950/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              ANALYTICS & REPORTS
            </span>
            <h1 className="text-lg font-bold text-slate-100">
              ENVIRONMENTAL ANALYTICS & STATUTORY REPORTING
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Deforestation Metrics • Sensor Reliability • Automated Gemini 3.5 Executive Synthesis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'SYNTHESIZING REPORT...' : 'GENERATE AI REPORT'}</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#091510] border border-emerald-900/60">
          <span className="text-[10px] text-slate-400 block">DEFORESTATION (MTD)</span>
          <span className="text-xl font-extrabold text-amber-400">28.4 ha</span>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
            <TrendingDown className="w-3 h-3" />
            <span>-32% vs prior month</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#091510] border border-emerald-900/60">
          <span className="text-[10px] text-slate-400 block">AVERAGE RESPONSE TIME</span>
          <span className="text-xl font-extrabold text-emerald-400">18.2 min</span>
          <div className="text-[10px] text-slate-400 mt-1">From acoustic trigger to triage</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#091510] border border-emerald-900/60">
          <span className="text-[10px] text-slate-400 block">HUMAN VERIFICATION RATE</span>
          <span className="text-xl font-extrabold text-blue-400">95.8%</span>
          <div className="text-[10px] text-slate-400 mt-1">38 of 40 reviewed</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#091510] border border-emerald-900/60">
          <span className="text-[10px] text-slate-400 block">FALSE POSITIVE RATE</span>
          <span className="text-xl font-extrabold text-slate-200">4.2%</span>
          <div className="text-[10px] text-emerald-400 mt-1">Excellent edge filter accuracy</div>
        </div>
      </div>

      {/* Visual Charts Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Canopy Loss by Month */}
        <div className="p-4 rounded-xl bg-[#091510] border border-emerald-900/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-400">
              MONTHLY CANOPY DISTURBANCE (HECTARES)
            </span>
            <span className="text-[10px] text-slate-400">2026 YTD</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 bg-[#06100b] rounded-lg border border-emerald-950/70">
            {[
              { month: 'APR', ha: 64 },
              { month: 'MAY', ha: 52 },
              { month: 'JUN', ha: 48 },
              { month: 'JUL', ha: 38 },
              { month: 'AUG', ha: 41 },
              { month: 'SEP', ha: 28 },
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] text-slate-300 font-bold">{d.ha} ha</span>
                <div
                  style={{ height: `${(d.ha / 70) * 100}%` }}
                  className="w-full bg-emerald-600/80 hover:bg-emerald-400 rounded-t transition-all"
                />
                <span className="text-[9px] text-slate-500 font-mono">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Incident Categories */}
        <div className="p-4 rounded-xl bg-[#091510] border border-emerald-900/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-400">
              INCIDENTS BY CLASSIFICATION CATEGORY
            </span>
            <span className="text-[10px] text-slate-400">TOTAL: 40</span>
          </div>

          <div className="space-y-2 text-xs pt-1">
            {[
              { label: 'Illegal Deforestation / Felling', pct: 45, count: 18, color: 'bg-red-500' },
              { label: 'Timber Transport Discrepancies', pct: 25, count: 10, color: 'bg-amber-500' },
              { label: 'Unauthorized Road Incursions', pct: 15, count: 6, color: 'bg-orange-500' },
              { label: 'Fire & Thermal Anomalies', pct: 10, count: 4, color: 'bg-rose-500' },
              { label: 'Vessel / River Incursions', pct: 5, count: 2, color: 'bg-blue-500' },
            ].map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-200">{cat.label}</span>
                  <span className="text-slate-400 font-bold">{cat.count} ({cat.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-[#06100b] rounded-full overflow-hidden border border-emerald-950">
                  <div style={{ width: `${cat.pct}%` }} className={`h-full ${cat.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Generation Center */}
      <div className="p-4 rounded-xl bg-[#091510] border border-emerald-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-950">
          <div>
            <h3 className="text-sm font-bold text-emerald-400 uppercase">
              EXECUTIVE REPORT GENERATOR (GEMINI 3.5 FLASH)
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Select statutory report parameters to compile an official briefing packet.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="bg-[#111a15] border border-emerald-900/60 text-xs text-slate-200 rounded px-2.5 py-1.5"
            >
              <option value="DAILY ENVIRONMENT REPORT">Daily Environment Report</option>
              <option value="WEEKLY FOREST REPORT">Weekly Forest Protection Report</option>
              <option value="DEFORESTATION REPORT">Deforestation & Canopy Loss Audit</option>
              <option value="DEVICE HEALTH REPORT">IoT Device Infrastructure Health</option>
              <option value="TIMBER MONITORING REPORT">Timber Transit Discrepancy Log</option>
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-[#111a15] border border-emerald-900/60 text-xs text-slate-200 rounded px-2.5 py-1.5"
            >
              <option value="Last 24 Hours">Last 24 Hours</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Generated Report Output */}
        {generatedReport ? (
          <div className="p-4 rounded-xl bg-[#06100b] border border-emerald-800/60 space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between pb-2 border-b border-emerald-950">
              <div>
                <span className="text-[10px] text-slate-400 block">OFFICIAL BRIEF:</span>
                <h4 className="text-sm font-bold text-emerald-300">{generatedReport.title}</h4>
                <span className="text-[10px] text-slate-500">
                  Compiled on: {new Date().toUTCString()}
                </span>
              </div>

              <button
                onClick={handleExportReportToDrive}
                disabled={isExportingToDrive}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>{isExportingToDrive ? 'SAVING...' : 'SAVE REPORT TO DRIVE'}</span>
              </button>
            </div>

            {driveReportLink && (
              <div className="p-2.5 rounded bg-emerald-950 border border-emerald-600 text-xs flex items-center justify-between">
                <span className="text-emerald-300">✓ Report successfully saved to Google Drive.</span>
                <a
                  href={driveReportLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-emerald-400 font-bold flex items-center gap-1"
                >
                  <span>OPEN IN GOOGLE DRIVE</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Executive Summary */}
            <div className="p-3 rounded-lg bg-[#091510] border border-emerald-950">
              <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">
                EXECUTIVE SUMMARY:
              </span>
              <p className="text-slate-200 font-sans text-xs leading-relaxed">
                {generatedReport.executiveSummary}
              </p>
            </div>

            {/* Key Findings */}
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">
                KEY FORENSIC FINDINGS:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-200 font-sans text-xs">
                {generatedReport.keyFindings.map((finding, idx) => (
                  <li key={idx}>{finding}</li>
                ))}
              </ul>
            </div>

            {/* Action Recommendations */}
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">
                ACTIONABLE DIRECTIVES FOR FIELD FORCES:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-200 font-sans text-xs">
                {generatedReport.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            Click &quot;GENERATE AI REPORT&quot; above to synthesize multi-sensor intelligence into a formal executive dossier.
          </div>
        )}
      </div>
    </div>
  );
};
