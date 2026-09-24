import React, { useState } from 'react';
import {
  Camera,
  Play,
  Pause,
  Maximize2,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Battery,
  Wifi,
  Thermometer,
  Eye,
  Crosshair,
  Clock,
  Video,
  FileCheck2,
} from 'lucide-react';
import { CameraFeed } from '../types/forestguard';
import { analyzeVideoWithGeminiPro, VideoAnalysisResponse } from '../services/geminiService';

interface LiveMonitoringProps {
  cameras: CameraFeed[];
  onInspectCamera?: (camera: CameraFeed) => void;
}

export const LiveMonitoring: React.FC<LiveMonitoringProps> = ({
  cameras,
  onInspectCamera,
}) => {
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed>(
    cameras.find((c) => c.id === 'DEV-CAM-041') || cameras[0]
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [nightVisionMode, setNightVisionMode] = useState<boolean>(false);
  const [thermalMode, setThermalMode] = useState<boolean>(false);
  const [filterZone, setFilterZone] = useState<string>('ALL');

  // Video Intelligence Modal State
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState<boolean>(false);
  const [videoAnalysisResult, setVideoAnalysisResult] = useState<VideoAnalysisResponse | null>(null);

  const zones = Array.from(new Set(cameras.map((c) => c.zone)));

  const filteredCameras = cameras.filter(
    (c) => filterZone === 'ALL' || c.zone === filterZone
  );

  const handleRunVideoAnalysis = async (cam: CameraFeed) => {
    setShowVideoModal(true);
    setIsAnalyzingVideo(true);
    setVideoAnalysisResult(null);

    try {
      const res = await analyzeVideoWithGeminiPro({
        cameraId: cam.id,
        cameraName: cam.name,
        location: cam.zone,
        timestamp: new Date().toISOString(),
        durationSeconds: 45,
        videoTitle: `CCTV Surveillance Capture - ${cam.name}`,
        promptQuestion:
          'Analyze video for chainsaws, unauthorized heavy machinery, truck license plates, timber loading, and tree-cutting activity.',
      });
      setVideoAnalysisResult(res);
    } catch (err) {
      console.error('Video analysis failed:', err);
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1612] p-4 rounded-xl border border-emerald-950/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              OPTICAL INTELLIGENCE
            </span>
            <h1 className="text-lg font-bold font-mono text-slate-100">
              LIVE CCTV & OPTICAL INTELLIGENCE
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            150 Edge Optical & Thermal Sensors • On-device Object Classification • Human Verification Gateway
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="bg-[#111a15] border border-emerald-900/60 text-xs font-mono text-emerald-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Zones ({cameras.length} Cameras)</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleRunVideoAnalysis(selectedCamera)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono font-bold transition-all shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ANALYZE VIDEO (GEMINI PRO)</span>
          </button>
        </div>
      </div>

      {/* Main Video Stage & Feeds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Feed Player (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-black border border-emerald-900/60 aspect-video shadow-2xl flex flex-col justify-between">
            {/* Camera Simulated Viewport */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-all ${
                nightVisionMode
                  ? 'brightness-125 contrast-150 grayscale hue-rotate-90'
                  : thermalMode
                  ? 'invert hue-rotate-180 contrast-200'
                  : ''
              }`}
              style={{ backgroundImage: `url(${selectedCamera.streamUrl})` }}
            >
              {/* Scanline / Grid overlay */}
              <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40"></div>
            </div>

            {/* AI Bounding Boxes Overlay */}
            {showBoundingBoxes && (
              <div className="absolute inset-0 pointer-events-none p-6">
                {/* Simulated Bounding Box for Logging Vehicle */}
                <div className="absolute top-[28%] left-[22%] w-[46%] h-[48%] border-2 border-red-500 bg-red-500/10 rounded">
                  <div className="absolute -top-6 left-0 bg-red-600 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1 shadow">
                    <span>HEAVY MACHINERY / TRUCK</span>
                    <span className="text-red-200">91%</span>
                  </div>
                  <div className="absolute bottom-1 right-1 text-[9px] font-mono text-red-300 bg-black/70 px-1 rounded">
                    AWAITING HUMAN VERIFICATION
                  </div>
                </div>

                {/* Secondary Box for Operator */}
                <div className="absolute top-[35%] right-[22%] w-[12%] h-[32%] border border-amber-400 bg-amber-400/10 rounded">
                  <div className="absolute -top-5 left-0 bg-amber-500 text-black font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                    PERSON (86%)
                  </div>
                </div>
              </div>
            )}

            {/* Live Camera OSD Header */}
            <div className="relative z-10 p-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span className="font-bold text-white tracking-wider">LIVE FEED:</span>
                <span className="text-emerald-400 font-bold">{selectedCamera.name}</span>
                <span className="text-slate-400 text-[10px]">({selectedCamera.id})</span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-300">
                <span>FPS: {selectedCamera.fps}</span>
                <span>{selectedCamera.resolution}</span>
                <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                  {selectedCamera.status}
                </span>
              </div>
            </div>

            {/* Live Camera OSD Footer / Controls */}
            <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className={`px-2 py-1 rounded border text-[11px] transition-colors ${
                    showBoundingBoxes
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-black/60 border-slate-700 text-slate-400'
                  }`}
                >
                  AI Bounding Boxes
                </button>

                <button
                  onClick={() => {
                    setNightVisionMode(!nightVisionMode);
                    if (thermalMode) setThermalMode(false);
                  }}
                  className={`px-2 py-1 rounded border text-[11px] transition-colors ${
                    nightVisionMode
                      ? 'bg-green-950 border-green-500 text-green-300'
                      : 'bg-black/60 border-slate-700 text-slate-400'
                  }`}
                >
                  Night Vision IR
                </button>

                <button
                  onClick={() => {
                    setThermalMode(!thermalMode);
                    if (nightVisionMode) setNightVisionMode(false);
                  }}
                  className={`px-2 py-1 rounded border text-[11px] transition-colors ${
                    thermalMode
                      ? 'bg-orange-950 border-orange-500 text-orange-300'
                      : 'bg-black/60 border-slate-700 text-slate-400'
                  }`}
                >
                  Thermal FLIR
                </button>
              </div>

              {/* Telemetry info */}
              <div className="flex items-center gap-3 text-[10px] text-slate-300">
                <span className="flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  {selectedCamera.batteryPercent}%
                </span>
                <span className="flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  {selectedCamera.solarChargingRate}W
                </span>
                <span className="flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                  {selectedCamera.temperatureC}°C
                </span>
              </div>
            </div>
          </div>

          {/* Camera Info Card */}
          <div className="p-3.5 rounded-xl bg-[#091510] border border-emerald-950/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-400">ZONE: </span>
              <span className="text-emerald-300 font-bold">{selectedCamera.zone}</span>
              <span className="text-slate-500 mx-2">•</span>
              <span className="text-slate-400">COORDS: </span>
              <span className="text-slate-200">
                {selectedCamera.coordinates.lat.toFixed(4)}, {selectedCamera.coordinates.lng.toFixed(4)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">NETWORK:</span>
              <span className="text-slate-200">{selectedCamera.networkType}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">STORAGE:</span>
              <span className="text-slate-200">{selectedCamera.storageUsedPercent}%</span>
            </div>
          </div>
        </div>

        {/* Camera List & Detections (Right 1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 pb-1 border-b border-emerald-950">
            <span>SURVEILLANCE CAMERAS ({filteredCameras.length})</span>
            <span className="text-slate-400 text-[10px]">CLICK TO SWITCH</span>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredCameras.slice(0, 16).map((cam) => {
              const isSelected = cam.id === selectedCamera.id;
              const hasAlert = cam.id === 'DEV-CAM-041';

              return (
                <div
                  key={cam.id}
                  onClick={() => setSelectedCamera(cam)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500/70 shadow-lg'
                      : 'bg-[#09140f] border-emerald-950 hover:border-emerald-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      {cam.id.replace('DEV-', '')}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        cam.status === 'ONLINE'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-red-950 text-red-300'
                      }`}
                    >
                      {cam.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 truncate font-sans">
                    {cam.zone}
                  </p>

                  {/* Recent detection preview */}
                  {cam.recentDetections && cam.recentDetections[0] && (
                    <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-300 pt-1 border-t border-emerald-950/60">
                      <span className="text-amber-300 font-bold truncate max-w-[140px]">
                        {cam.recentDetections[0].label}
                      </span>
                      <span className="text-emerald-400">
                        {cam.recentDetections[0].confidence}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Video Understanding Modal (gemini-3.1-pro-preview) */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0c1410] border border-emerald-800/80 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-950">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    GEMINI PRO VIDEO UNDERSTANDING ANALYSIS
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Model: gemini-3.1-pro-preview • Automated Temporal Object Detection
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {isAnalyzingVideo ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-emerald-300 font-bold">
                  DEEP VIDEO UNDERSTANDING IN PROGRESS...
                </p>
                <p className="text-[10px] text-slate-400 font-sans max-w-sm mx-auto">
                  Extracting temporal frames, logging equipment signatures, engine thermal blooms, and vehicle registration markers...
                </p>
              </div>
            ) : videoAnalysisResult ? (
              <div className="space-y-3 animate-in fade-in">
                {/* Summary */}
                <div className="p-3 rounded-lg bg-[#06100b] border border-emerald-900/60">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    INTELLIGENCE SUMMARY:
                  </span>
                  <p className="text-slate-200 font-sans text-xs mt-1 leading-relaxed">
                    {videoAnalysisResult.summary}
                  </p>
                </div>

                {/* Detected Entities */}
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold block uppercase mb-1.5">
                    IDENTIFIED ENTITIES & CONFIDENCE:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {videoAnalysisResult.detectedEntities.map((ent, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-[#091510] border border-emerald-950 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className={ent.isSuspectActivity ? 'text-red-400' : 'text-slate-200'}>
                            {ent.label}
                          </span>
                          <span className="text-emerald-400">{ent.confidence}%</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                          {ent.description}
                        </p>
                        <span className="text-[9px] text-slate-500 font-mono mt-1">
                          Offset: {ent.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* License Plate & Equipment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded bg-[#091510] border border-emerald-950">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      VEHICLE REGISTRATION OBSERVATION:
                    </span>
                    <span className="text-amber-400 font-bold text-xs mt-0.5 block">
                      {videoAnalysisResult.vehiclePlateObservation || 'No readable license plate in frame'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-[#091510] border border-emerald-950">
                    <span className="text-[10px] text-slate-400 block font-bold">
                      FOREST IMPACT ASSESSMENT:
                    </span>
                    <span className="text-slate-200 font-sans text-xs mt-0.5 block">
                      {videoAnalysisResult.forestImpactAssessment}
                    </span>
                  </div>
                </div>

                {/* Recommended Human Actions */}
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">
                    RECOMMENDED HUMAN ACTION STEPS:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-200 font-sans text-xs">
                    {videoAnalysisResult.recommendedNextActions.map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-[10px] text-slate-500 font-sans pt-1 border-t border-emerald-950">
                  {videoAnalysisResult.disclaimer}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2 border-t border-emerald-950">
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
