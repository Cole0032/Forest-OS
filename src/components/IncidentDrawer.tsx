import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSearch,
  UserCheck,
  Send,
  Sparkles,
  MapPin,
  Clock,
  Radio,
  Camera,
  Satellite,
  FileText,
  HardDrive,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Volume2,
  Lock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Incident, IncidentStatus, EvidenceItem } from '../types/forestguard';
import { MOCK_EVIDENCE } from '../services/mockData';
import {
  correlateSignalsWithGemini,
  CorrelateResponse,
  getMapsGroundingInfo,
  MapsGroundingResponse,
} from '../services/geminiService';
import { getCachedAccessToken, googleSignIn, uploadToGoogleDrive } from '../services/firebaseAuth';
import { useTheme } from '../context/ThemeContext';

interface IncidentDrawerProps {
  incident: Incident | null;
  onClose: () => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus, notes?: string) => void;
  onOpenVideoAnalysis?: (cameraId: string) => void;
  onOpenGoogleDriveModal?: (incidentId: string) => void;
}

export const IncidentDrawer: React.FC<IncidentDrawerProps> = ({
  incident,
  onClose,
  onUpdateStatus,
  onOpenVideoAnalysis,
  onOpenGoogleDriveModal,
}) => {
  if (!incident) return null;

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'ai' | 'evidence' | 'maps' | 'timeline'>('ai');
  const [reviewerNote, setReviewerNote] = useState<string>('');
  const [isCorrelating, setIsCorrelating] = useState<boolean>(false);
  const [deepThinkingResult, setDeepThinkingResult] = useState<CorrelateResponse | null>(null);

  const [isGroundingMaps, setIsGroundingMaps] = useState<boolean>(false);
  const [mapsGroundingData, setMapsGroundingData] = useState<MapsGroundingResponse | null>(null);

  const [driveExporting, setDriveExporting] = useState<boolean>(false);
  const [driveExportSuccess, setDriveExportSuccess] = useState<string | null>(null);

  // Filter evidence related to this incident
  const relatedEvidence = MOCK_EVIDENCE.filter((e) => incident.evidenceIds.includes(e.id));

  // Trigger Gemini 3.1 Pro Deep Thinking correlation
  const handleRunDeepCorrelation = async () => {
    setIsCorrelating(true);
    try {
      const res = await correlateSignalsWithGemini({
        incidentId: incident.id,
        location: incident.locationName,
        signals: [
          {
            source: incident.detectionSources[0] || 'Acoustic Node A-204',
            type: 'ACOUSTIC',
            timestamp: incident.timestamp,
            details: 'Chainsaw harmonic frequency 2.85 kHz recorded for 142 seconds at 78.4 dB',
            confidence: 89,
          },
          {
            source: incident.detectionSources[1] || 'Camera CAM-041',
            type: 'OPTICAL_THERMAL',
            timestamp: incident.timestamp,
            details: 'Heavy commercial flatbed transport and logging loader identified',
            confidence: 91,
          },
          {
            source: incident.detectionSources[2] || 'Sentinel-2 Satellite',
            type: 'CANOPY_SURFACE_DELTA',
            timestamp: 'Recent cloud-free pass',
            details: '4.8 ha vegetation disturbance detected',
            confidence: 88,
          },
        ],
        permitCheck: {
          hasPermit: false,
          permitDetails: 'No active concession or scientific permit on file in SISFLORA registry',
        },
      });
      setDeepThinkingResult(res);
    } catch (err) {
      console.error('Deep correlation failed:', err);
    } finally {
      setIsCorrelating(false);
    }
  };

  // Trigger Maps Grounding
  const handleRunMapsGrounding = async () => {
    setIsGroundingMaps(true);
    try {
      const res = await getMapsGroundingInfo({
        locationName: incident.locationName,
        coordinates: incident.coordinates,
        zoneType: 'Core Protected Reserve',
      });
      setMapsGroundingData(res);
    } catch (err) {
      console.error('Maps grounding error:', err);
    } finally {
      setIsGroundingMaps(false);
    }
  };

  // Direct export of this incident dossier to Google Drive
  const handleDirectDriveExport = async () => {
    setDriveExporting(true);
    setDriveExportSuccess(null);
    try {
      let token = getCachedAccessToken();
      if (!token) {
        const signin = await googleSignIn();
        if (signin) token = signin.accessToken;
      }
      if (!token) {
        throw new Error('Google authentication required');
      }

      const dossierData = {
        title: `INCIDENT DOSSIER: ${incident.id} - ${incident.title}`,
        exportedAt: new Date().toISOString(),
        system: 'FORESTGUARD AI Command Core v2026.4',
        incident,
        evidenceItems: relatedEvidence.map((e) => ({
          id: e.id,
          title: e.title,
          type: e.type,
          sha256Hash: e.sha256Hash,
          chainOfCustodyCount: e.chainOfCustody.length,
        })),
        legalNotice:
          'OFFICIAL ENVIRONMENTAL ENFORCEMENT DOSSIER. Generated by FORESTGUARD AI for authorized judicial referral. AI assists; humans verify.',
      };

      const filename = `${incident.id}_Evidence_Dossier_${Date.now()}.json`;
      const uploaded = await uploadToGoogleDrive(
        filename,
        'application/json',
        JSON.stringify(dossierData, null, 2),
        token,
        `Sealed evidence dossier for incident ${incident.id} in ${incident.locationName}`
      );

      setDriveExportSuccess(
        uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`
      );
    } catch (err: any) {
      console.error('Drive export failed:', err);
      alert(`Google Drive export error: ${err.message || 'Check OAuth connection'}`);
    } finally {
      setDriveExporting(false);
    }
  };

  const getSeverityBadge = (sev: Incident['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-300 border-red-800/80';
      case 'HIGH_PRIORITY':
        return 'bg-orange-950/80 text-orange-300 border-orange-800/80';
      case 'SUSPICIOUS':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-800/80';
      default:
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl border-l shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 transition-colors ${
        isDark
          ? 'bg-[#0c1410] border-emerald-900/60 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
      }`}
    >
      {/* Top Header */}
      <div
        className={`p-4 border-b flex items-start justify-between gap-3 transition-colors ${
          isDark ? 'bg-[#080f0c] border-emerald-950/80' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`font-mono text-sm font-bold ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}
            >
              {incident.id}
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${getSeverityBadge(
                incident.severity
              )}`}
            >
              {incident.severity}
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                isDark
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800/50'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              STATUS: {incident.status.replace(/_/g, ' ')}
            </span>
          </div>
          <h2
            className={`text-base font-bold leading-snug ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            {incident.title}
          </h2>
          <div
            className={`flex items-center gap-3 text-xs mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-500" />
              {incident.locationName}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {incident.timestamp}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`p-1.5 rounded-lg transition-colors ${
            isDark
              ? 'bg-[#14221b] text-slate-400 hover:text-white hover:bg-emerald-900/50'
              : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Fundamental Principle Banner */}
      <div
        className={`px-4 py-2 border-b flex items-center justify-between text-[11px] font-mono ${
          isDark
            ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-300'
            : 'bg-emerald-50 border-emerald-100 text-emerald-800'
        }`}
      >
        <span className="flex items-center gap-1.5 font-bold">
          <ShieldAlert className="w-4 h-4 text-emerald-500" />
          AI CONFIDENCE: {incident.aiConfidence}% (AWAITING HUMAN VERIFICATION)
        </span>
        <span className={isDark ? 'text-slate-400 text-[10px]' : 'text-slate-500 text-[10px]'}>
          DECISION SUPPORT ONLY
        </span>
      </div>

      {/* Navigation Tabs */}
      <div
        className={`flex items-center border-b px-4 text-xs font-semibold ${
          isDark
            ? 'border-emerald-950/70 bg-[#09110d]'
            : 'border-slate-200 bg-slate-50'
        }`}
      >
        <button
          onClick={() => setActiveTab('ai')}
          className={`py-2.5 px-3 border-b-2 font-bold transition-colors ${
            activeTab === 'ai'
              ? isDark
                ? 'border-emerald-400 text-emerald-300'
                : 'border-emerald-600 text-emerald-800'
              : isDark
              ? 'border-transparent text-slate-400 hover:text-slate-200'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          AI Reasoning & Explanation
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`py-2.5 px-3 border-b-2 font-bold transition-colors ${
            activeTab === 'evidence'
              ? isDark
                ? 'border-emerald-400 text-emerald-300'
                : 'border-emerald-600 text-emerald-800'
              : isDark
              ? 'border-transparent text-slate-400 hover:text-slate-200'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Ground Evidence ({relatedEvidence.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('maps');
            if (!mapsGroundingData) handleRunMapsGrounding();
          }}
          className={`py-2.5 px-3 border-b-2 font-bold transition-colors ${
            activeTab === 'maps'
              ? isDark
                ? 'border-emerald-400 text-emerald-300'
                : 'border-emerald-600 text-emerald-800'
              : isDark
              ? 'border-transparent text-slate-400 hover:text-slate-200'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Maps Grounding
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-2.5 px-3 border-b-2 font-bold transition-colors ${
            activeTab === 'timeline'
              ? isDark
                ? 'border-emerald-400 text-emerald-300'
                : 'border-emerald-600 text-emerald-800'
              : isDark
              ? 'border-transparent text-slate-400 hover:text-slate-200'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Audit Timeline
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: AI EXPLANATIONS & CORRELATION */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            {/* The 5 Key Questions */}
            <div className="p-3.5 rounded-xl bg-[#09140f] border border-emerald-900/60 space-y-2.5 text-xs font-mono">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider pb-1 border-b border-emerald-950 flex items-center justify-between">
                <span>INCIDENT REASONING SUMMARY</span>
                <span className="text-slate-400 font-normal">SOURCE: MULTI-SENSOR FUSION</span>
              </div>

              <div>
                <span className="text-slate-400 block font-bold">1. WHAT WAS DETECTED:</span>
                <p className="text-slate-200 mt-0.5 font-sans leading-relaxed">
                  {incident.aiExplanation.whatDetected}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block font-bold">2. WHERE & WHEN:</span>
                <p className="text-slate-200 mt-0.5 font-sans leading-relaxed">
                  {incident.aiExplanation.whereDetected} at {incident.aiExplanation.whenDetected}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block font-bold">3. HOW WE KNOW (SUPPORTING SIGNALS):</span>
                <ul className="list-disc list-inside mt-1 space-y-1 text-slate-300 font-sans">
                  {incident.aiExplanation.supportingSignals.map((sig, i) => (
                    <li key={i} className="leading-snug">{sig}</li>
                  ))}
                </ul>
              </div>

              {incident.aiExplanation.contradictingSignals.length > 0 && (
                <div>
                  <span className="text-amber-400 block font-bold">4. CONTRADICTING FACTORS CHECKED:</span>
                  <ul className="list-disc list-inside mt-0.5 text-slate-300 font-sans">
                    {incident.aiExplanation.contradictingSignals.map((sig, i) => (
                      <li key={i}>{sig}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <span className="text-emerald-400 block font-bold">5. WHAT A HUMAN MUST CHECK NEXT:</span>
                <ul className="list-disc list-inside mt-1 space-y-1 text-slate-200 font-sans">
                  {incident.aiExplanation.whatHumanReviewShouldCheck.map((chk, i) => (
                    <li key={i} className="text-emerald-200 leading-snug">{chk}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Deep Thinking Correlation Trigger (gemini-3.1-pro-preview) */}
            <div className="p-3.5 rounded-xl bg-[#091510] border border-emerald-800/60">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300 font-mono">
                    GEMINI PRO DEEP THINKING CORRELATION
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800/50 text-emerald-400">
                  gemini-3.1-pro-preview • HIGH THINKING
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mb-3">
                Run forensic spatial-temporal cross-correlation between acoustic spectral audio, optical CCTV frames, satellite canopy reflectance, and national timber concession databases.
              </p>

              <button
                onClick={handleRunDeepCorrelation}
                disabled={isCorrelating}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isCorrelating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>THINKING: CORRELATING MULTI-SOURCE SIGNALS...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>SYNTHESIZE FORENSIC CORRELATION CHAIN</span>
                  </>
                )}
              </button>

              {deepThinkingResult && (
                <div className="mt-3 p-3 rounded-lg bg-[#06100b] border border-emerald-700/60 text-xs font-mono space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-emerald-900 pb-1">
                    <span>CORRELATED CONFIDENCE: {deepThinkingResult.correlatedConfidence}%</span>
                    <span className="text-red-400">THREAT: {deepThinkingResult.threatLevel}</span>
                  </div>
                  <p className="text-slate-200 font-sans leading-relaxed text-xs">
                    {deepThinkingResult.correlationSummary}
                  </p>
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-bold text-[11px]">TIMELINE OF CORRELATED EVENTS:</span>
                    {deepThinkingResult.reasoningChain.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                        <span className="text-emerald-400 font-bold">›</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1 border-t border-emerald-950 text-[10px] text-amber-300 font-sans">
                    {deepThinkingResult.disclaimer}
                  </div>
                </div>
              )}
            </div>

            {/* Legal Notice */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 font-mono leading-relaxed">
              <span className="text-amber-400 font-bold block mb-1">MANDATORY LEGAL SAFEGUARD:</span>
              The system must never declare a person guilty of an offense based solely on an AI prediction. Final charging orders, physical vehicle impoundment, or custodial actions require independent human verification by sworn environmental magistrates.
            </div>
          </div>
        )}

        {/* TAB 2: GROUND EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            {relatedEvidence.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono">
                No digital evidence items linked to this incident yet.
              </div>
            ) : (
              relatedEvidence.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl bg-[#091510] border border-emerald-900/60 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800/40 text-emerald-400 font-bold">
                          {ev.type}
                        </span>
                        <span className="font-mono text-xs text-slate-300 font-bold">
                          {ev.id}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-100 mt-1">
                        {ev.title}
                      </h4>
                    </div>

                    {ev.type === 'VIDEO' && onOpenVideoAnalysis && (
                      <button
                        onClick={() => onOpenVideoAnalysis(incident.relatedCameraIds[0] || 'DEV-CAM-041')}
                        className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-mono font-bold flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>ANALYZE VIDEO (GEMINI)</span>
                      </button>
                    )}
                  </div>

                  {/* Preview Image / Video Frame */}
                  {ev.previewUrl && (
                    <div className="relative rounded-lg overflow-hidden border border-emerald-950/80 bg-black aspect-video max-h-48">
                      <img
                        src={ev.previewUrl}
                        alt={ev.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-400">
                        {ev.sourceDevice}
                      </div>
                    </div>
                  )}

                  {/* Audio waveform sample for Audio evidence */}
                  {ev.type === 'AUDIO' && (
                    <div className="p-2.5 rounded bg-black/60 border border-emerald-950 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-amber-400">
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>HARMONIC PEAK: 2,850 Hz (Chainsaw Spectrum)</span>
                        </span>
                        <span>78.4 dB</span>
                      </div>
                      <div className="flex items-end gap-1 h-10 px-1 bg-[#06100b] rounded">
                        {[12, 18, 45, 88, 92, 76, 85, 94, 60, 42, 85, 96, 91, 74, 40, 15, 22, 54, 82, 95].map(
                          (val, idx) => (
                            <div
                              key={idx}
                              style={{ height: `${val}%` }}
                              className="flex-1 bg-amber-500 rounded-t hover:bg-emerald-400 transition-colors"
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cryptographic SHA-256 Seal */}
                  <div className="p-2 rounded bg-[#06100b] border border-emerald-950 text-[10px] font-mono text-slate-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <ShieldCheck className="w-3 h-3" />
                        <span>SHA-256 INTEGRITY SEAL:</span>
                      </span>
                      <span className="text-emerald-300">VALID / UNTAMPERED</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono break-all bg-black/40 p-1 rounded">
                      {ev.sha256Hash}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: GOOGLE MAPS GROUNDING */}
        {activeTab === 'maps' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#091510] border border-emerald-800/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  GOOGLE MAPS PLATFORM GROUNDING
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                  gemini-3.5-flash with googleMaps
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mb-3">
                Ground this incident in real-world geographic data: verify nearby navigable river access, nearest ranger stations, terrain density, and road access networks.
              </p>

              <button
                onClick={handleRunMapsGrounding}
                disabled={isGroundingMaps}
                className="py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isGroundingMaps ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>QUERYING GOOGLE MAPS GROUNDING...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>REFRESH MAPS GROUNDING DATA</span>
                  </>
                )}
              </button>

              {mapsGroundingData && (
                <div className="mt-3 p-3 rounded-lg bg-[#06100b] border border-emerald-900/60 text-xs font-mono space-y-2.5 animate-in fade-in">
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px]">RESOLVED LOCATION:</span>
                    <span className="text-emerald-300 font-bold">{mapsGroundingData.resolvedLocation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px]">GEOGRAPHIC PROFILE:</span>
                    <p className="text-slate-200 font-sans mt-0.5">{mapsGroundingData.groundedDescription}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-emerald-950">
                    <div>
                      <span className="text-slate-400 block font-bold text-[10px]">NEAREST RANGER STATION:</span>
                      <span className="text-slate-200">{mapsGroundingData.nearestRangerStation}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold text-[10px]">RIVER / WATERWAY ACCESS:</span>
                      <span className="text-slate-200">{mapsGroundingData.riverOrWaterwayAccess}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold text-[10px]">ROAD NETWORK DISTANCE:</span>
                      <span className="text-slate-200">{mapsGroundingData.roadNetworkDistance}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold text-[10px]">VULNERABILITY LEVEL:</span>
                      <span className="text-amber-400">{mapsGroundingData.geographicalVulnerability}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase">
              IMMUTABLE CHRONOLOGICAL AUDIT LOG
            </div>
            <div className="space-y-2">
              {incident.timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#091510] border border-emerald-950 text-xs font-mono flex items-start gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>{item.time}</span>
                      <span className="text-emerald-400 font-bold">{item.actor}</span>
                    </div>
                    <p className="text-slate-200 font-sans text-xs mt-0.5">
                      {item.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Human Verification Action Footer */}
      <div className="p-4 bg-[#080f0c] border-t border-emerald-950/80 space-y-3">
        {/* Reviewer Note Input */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
            HUMAN REVIEWER FINDINGS / JUSTIFICATION NOTE:
          </label>
          <input
            type="text"
            value={reviewerNote}
            onChange={(e) => setReviewerNote(e.target.value)}
            placeholder="Document officer observations, ground team dispatches, or verification reasons..."
            className="w-full bg-[#111a15] border border-emerald-900/60 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onUpdateStatus(incident.id, 'VERIFIED', reviewerNote)}
            className="py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONFIRM (VERIFIED)</span>
          </button>

          <button
            onClick={() => onUpdateStatus(incident.id, 'INVESTIGATION', reviewerNote)}
            className="py-2 px-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>OPEN CASE</span>
          </button>

          <button
            onClick={() => onUpdateStatus(incident.id, 'FALSE_POSITIVE', reviewerNote)}
            className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>FALSE POSITIVE</span>
          </button>

          <button
            onClick={handleDirectDriveExport}
            disabled={driveExporting}
            className="py-2 px-2.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-emerald-700/60 shadow-md"
            title="Export full sealed dossier directly to Google Drive"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>{driveExporting ? 'EXPORTING...' : 'EXPORT TO DRIVE'}</span>
          </button>
        </div>

        {driveExportSuccess && (
          <div className="p-2 rounded bg-emerald-950/80 border border-emerald-600 text-xs font-mono text-emerald-300 flex items-center justify-between">
            <span>✓ DOSSIER EXPORTED TO GOOGLE DRIVE</span>
            <a
              href={driveExportSuccess}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 underline text-emerald-400 font-bold"
            >
              <span>OPEN FILE</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
