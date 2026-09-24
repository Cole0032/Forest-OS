import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Camera,
  Mic,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileText,
  Navigation,
  Send,
  Radio,
  Clock,
} from 'lucide-react';
import { FieldReport, FieldPatrolTeam, Incident } from '../types/forestguard';
import { MOCK_FIELD_TEAMS, MOCK_INCIDENTS } from '../services/mockData';

export const FieldOperations: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [syncQueue, setSyncQueue] = useState<FieldReport[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Field officer capture form
  const [fieldNotes, setFieldNotes] = useState<string>('');
  const [capturedPhotoName, setCapturedPhotoName] = useState<string | null>(null);
  const [capturedAudioName, setCapturedAudioName] = useState<string | null>(null);
  const [currentGps, setCurrentGps] = useState<{ lat: number; lng: number }>({
    lat: -3.129,
    lng: -60.035,
  });

  const nearbyIncidents = MOCK_INCIDENTS.slice(0, 3);
  const myTeam = MOCK_FIELD_TEAMS[0];

  const handleCaptureFieldNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldNotes.trim()) return;

    const newReport: FieldReport = {
      id: `FLD-${Date.now()}`,
      officerName: 'Capt. Mateo Santos',
      badgeNumber: 'FG-RNG-012',
      coordinates: currentGps,
      timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
      incidentId: nearbyIncidents[0]?.id,
      notes: fieldNotes,
      photos: capturedPhotoName ? [capturedPhotoName] : [],
      audioRecordings: capturedAudioName ? [capturedAudioName] : [],
      isOfflineSyncPending: isOffline,
    };

    if (isOffline) {
      setSyncQueue((prev) => [newReport, ...prev]);
    } else {
      alert(`Field report ${newReport.id} transmitted directly to Command Core.`);
    }

    setFieldNotes('');
    setCapturedPhotoName(null);
    setCapturedAudioName(null);
  };

  const handleSimulateSync = () => {
    if (syncQueue.length === 0) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncQueue([]);
      alert(`Synchronized ${syncQueue.length} offline field records to Central Command Core.`);
    }, 1500);
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto text-slate-100 font-mono">
      {/* Header with Offline Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1612] p-4 rounded-xl border border-emerald-950/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              FIELD RADAR
            </span>
            <h1 className="text-lg font-bold text-slate-100">
              FIELD OFFICER MOBILE RADAR & OFFLINE CAPTURE
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Optimized for Rugged Field Tablets & Handhelds • Local Cache & Store-and-Forward
          </p>
        </div>

        {/* Connectivity Switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-2 ${
              isOffline
                ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                : 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
            }`}
          >
            {isOffline ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
            <span>{isOffline ? 'OFFLINE MODE (QUEUING)' : 'ONLINE (STARLINK MESH)'}</span>
          </button>
        </div>
      </div>

      {/* Sync Queue Banner if offline data queued */}
      {syncQueue.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <UploadCloud className="w-4 h-4 animate-bounce" />
            <span>
              {syncQueue.length} field reports pending upload in local encrypted queue.
            </span>
          </div>

          <button
            onClick={handleSimulateSync}
            disabled={isSyncing}
            className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'SYNCING...' : 'SYNC TO SERVER NOW'}</span>
          </button>
        </div>
      )}

      {/* Patrol Status & GPS Coordinates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-[#091510] border border-emerald-950">
          <span className="text-[10px] text-slate-400 block">PATROL UNIT:</span>
          <span className="text-emerald-300 font-bold text-sm">{myTeam.name}</span>
          <span className="text-[10px] text-slate-500 block font-sans">
            Callsign: {myTeam.callsign} ({myTeam.rangerCount} Rangers)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#091510] border border-emerald-950">
          <span className="text-[10px] text-slate-400 block">GPS BEARING:</span>
          <span className="text-slate-100 font-bold text-sm">
            {currentGps.lat.toFixed(4)}°, {currentGps.lng.toFixed(4)}°
          </span>
          <span className="text-[10px] text-emerald-400 block">
            Accuracy: ±2.4m (RTK Lock)
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#091510] border border-emerald-950">
          <span className="text-[10px] text-slate-400 block">BATTERY & TRANSCEIVER:</span>
          <span className="text-emerald-300 font-bold text-sm">88% (VHF & Mesh Active)</span>
          <span className="text-[10px] text-slate-500 block">Heartbeat: 2m ago</span>
        </div>
      </div>

      {/* Nearby Incidents Radar (< 5km) */}
      <div className="p-4 rounded-xl bg-[#091510] border border-emerald-900/60 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
          <span className="flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-400" />
            NEARBY INCIDENTS RADAR (&lt; 5 KM)
          </span>
          <span className="text-[10px] text-slate-400">DISPATCH ALERTS</span>
        </div>

        <div className="space-y-2">
          {nearbyIncidents.map((inc) => (
            <div
              key={inc.id}
              className="p-3 rounded-lg bg-[#06100b] border border-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{inc.id}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 border border-red-700 text-red-300 font-bold">
                    {inc.severity}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    Distance: ~1.4 km North-East
                  </span>
                </div>
                <p className="text-slate-300 font-sans text-xs mt-0.5">
                  {inc.title}
                </p>
              </div>

              <button
                onClick={() => alert(`Navigation route to ${inc.id} loaded on field compass.`)}
                className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>NAVIGATE</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Evidence Capture Form */}
      <form
        onSubmit={handleCaptureFieldNote}
        className="p-4 rounded-xl bg-[#091510] border border-emerald-900/60 space-y-3"
      >
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
          RAPID FIELD EVIDENCE CAPTURE & REPORT:
        </span>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">
            FIELD OBSERVATION NOTES:
          </label>
          <textarea
            rows={3}
            value={fieldNotes}
            onChange={(e) => setFieldNotes(e.target.value)}
            placeholder="Document vehicle tracks, freshly cut tree stumps, chainsaw markings, or witness statements..."
            className="w-full bg-[#111a15] border border-emerald-900/60 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
          />
        </div>

        {/* Media attachments */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setCapturedPhotoName('PHOTO_STUMP_CUT_01.JPG')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              capturedPhotoName
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-[#111e17] border-emerald-900/50 text-slate-300 hover:bg-emerald-950'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>{capturedPhotoName || 'Capture Photo'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCapturedAudioName('AUDIO_NOTE_48KHZ.WAV')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              capturedAudioName
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-[#111e17] border-emerald-900/50 text-slate-300 hover:bg-emerald-950'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>{capturedAudioName || 'Record Voice Note'}</span>
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg"
        >
          <Send className="w-4 h-4" />
          <span>{isOffline ? 'QUEUE OFFLINE EVIDENCE' : 'TRANSMIT REPORT TO COMMAND CORE'}</span>
        </button>
      </form>
    </div>
  );
};
