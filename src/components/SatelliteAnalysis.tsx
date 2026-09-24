import React, { useState } from 'react';
import {
  Satellite,
  Sliders,
  Sparkles,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Maximize2,
  Eye,
  Info,
  ExternalLink,
} from 'lucide-react';
import { SatelliteChangeRecord } from '../types/forestguard';

export const SatelliteAnalysis: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [showChangeMask, setShowChangeMask] = useState<boolean>(true);
  const [activeConstellation, setActiveConstellation] = useState<string>('Sentinel-2 Multispectral');

  const mockRecords: SatelliteChangeRecord[] = [
    {
      id: 'SAT-CHANGE-001',
      zoneName: 'Tapir Ridge Strict Nature Reserve - Sector 4B',
      coordinates: { lat: -3.1254, lng: -60.0248 },
      beforeDate: '2026-09-18 (5 days ago)',
      afterDate: '2026-09-23 (Yesterday)',
      areaHectares: 4.8,
      changeType: 'TREE_COVER_LOSS',
      aiConfidence: 91,
      status: 'REQUIRES_VERIFICATION',
      satelliteConstellation: 'Sentinel-2 Multispectral',
      beforeImageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1000&auto=format&fit=crop&q=80',
      afterImageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1000&auto=format&fit=crop&q=80',
      changeMaskUrl: '',
      notes: 'NDVI dropped from 0.82 to 0.54. Surface reflectance exhibits bare soil signature along access trail Delta.',
    },
    {
      id: 'SAT-CHANGE-002',
      zoneName: 'Northern Canopy Wildlife Corridor - Sector 2A',
      coordinates: { lat: -3.0822, lng: -60.1158 },
      beforeDate: '2026-09-10',
      afterDate: '2026-09-22',
      areaHectares: 8.2,
      changeType: 'UNAUTHORIZED_ROAD_CONSTRUCTION',
      aiConfidence: 88,
      status: 'CONFIRMED_DEFORESTATION',
      satelliteConstellation: 'PlanetScope High-Res',
      beforeImageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000&auto=format&fit=crop&q=80',
      afterImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
      changeMaskUrl: '',
      notes: 'Linear incision advancing 350m/day into virgin biological corridor.',
    },
    {
      id: 'SAT-CHANGE-003',
      zoneName: 'Blackwood Sustainable Forestry Concession',
      coordinates: { lat: -3.2104, lng: -60.0552 },
      beforeDate: '2026-09-01',
      afterDate: '2026-09-20',
      areaHectares: 12.4,
      changeType: 'LAND_USE_CHANGE',
      aiConfidence: 94,
      status: 'LEGAL_PERMITTED_HARVEST',
      satelliteConstellation: 'Landsat-9 OLI',
      beforeImageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1000&auto=format&fit=crop&q=80',
      afterImageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1000&auto=format&fit=crop&q=80',
      changeMaskUrl: '',
      notes: 'Verified against Concession Plot 14 active harvesting quota. Within permitted selective harvest limits.',
    },
  ];

  const [selectedRecord, setSelectedRecord] = useState<SatelliteChangeRecord>(mockRecords[0]);

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1612] p-4 rounded-xl border border-emerald-950/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              SATELLITE CHANGE DETECTION
            </span>
            <h1 className="text-lg font-bold text-slate-100">
              SATELLITE CHANGE DETECTION & CANOPY LOSS
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Automated Bi-Temporal Surface Reflectance Differential • Sentinel-2, Landsat-9 & PlanetScope
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800/50 text-emerald-300">
            LAST PASS: COPERNICUS T20MMA (6h ago)
          </span>
        </div>
      </div>

      {/* Main Split Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Interactive Before/After Split Viewer */}
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 rounded-xl bg-[#091510] border border-emerald-900/60 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-100">{selectedRecord.zoneName}</span>
              </div>
              <span className="text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded border border-amber-800/40">
                {selectedRecord.areaHectares} HECTARES AFFECTED
              </span>
            </div>

            {/* Split Comparison Image Container */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black select-none border border-emerald-950">
              {/* After Image (Full background) */}
              <img
                src={selectedRecord.afterImageUrl}
                alt="After Change"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Before Image (Clipped by slider position) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={selectedRecord.beforeImageUrl}
                  alt="Before Change"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '100%', minWidth: '100%' }}
                />
              </div>

              {/* Change Mask Highlight (Red overlay polygon) */}
              {showChangeMask && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-40 h-28 border-2 border-red-500 bg-red-600/30 rounded-2xl animate-pulse flex items-center justify-center">
                    <span className="bg-red-950/90 text-red-200 text-[10px] px-2 py-0.5 rounded border border-red-700 font-mono font-bold">
                      CANOPY CLEARING: -{selectedRecord.areaHectares} HA
                    </span>
                  </div>
                </div>
              )}

              {/* Split Line Divider */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-emerald-400 cursor-ew-resize z-20 shadow-lg"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold text-xs shadow-md">
                  ⇄
                </div>
              </div>

              {/* OSD Badges */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 text-emerald-400 text-[10px] font-mono z-10">
                BEFORE: {selectedRecord.beforeDate}
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/70 text-amber-400 text-[10px] font-mono z-10">
                AFTER: {selectedRecord.afterDate}
              </div>
            </div>

            {/* Interactive Slider Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>SLIDE TO REVEAL DEFORESTATION</span>
                <span>SPLIT: {sliderPosition}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-ew-resize"
              />
            </div>

            {/* Toggle Change Mask */}
            <div className="flex items-center justify-between pt-2 border-t border-emerald-950 text-xs">
              <button
                onClick={() => setShowChangeMask(!showChangeMask)}
                className={`px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                  showChangeMask
                    ? 'bg-red-950 border-red-700/60 text-red-300'
                    : 'bg-black/60 border-slate-700 text-slate-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Toggle AI Change Mask (NDVI Delta)</span>
              </button>

              <div className="text-[11px] text-slate-400 font-sans">
                Sensor: {selectedRecord.satelliteConstellation}
              </div>
            </div>

            {/* Strict Notice */}
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 font-sans leading-relaxed">
              <span className="font-bold font-mono text-amber-300 block mb-0.5">
                OPERATIONAL PRINCIPLE:
              </span>
              Never claim that satellite detection alone proves illegal activity. Cloud cover, natural seasonal deciduous shedding, or licensed sustainable felling can trigger spectral shifts. Human ground verification is mandatory.
            </div>
          </div>
        </div>

        {/* Right Col: Satellite Change Alerts Registry */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pb-1 border-b border-emerald-950">
            <span>SATELLITE CHANGE ALERTS</span>
            <span className="text-slate-400 text-[10px]">RECENT DELTAS</span>
          </div>

          <div className="space-y-2.5">
            {mockRecords.map((rec) => {
              const isSelected = rec.id === selectedRecord.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500/70 shadow-lg'
                      : 'bg-[#09140f] border-emerald-950 hover:border-emerald-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{rec.id}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        rec.status === 'REQUIRES_VERIFICATION'
                          ? 'bg-red-950 text-red-300'
                          : rec.status === 'CONFIRMED_DEFORESTATION'
                          ? 'bg-orange-950 text-orange-300'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {rec.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans mt-1">
                    {rec.changeType.replace(/_/g, ' ')}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-emerald-950 font-mono">
                    <span className="text-amber-400 font-bold">{rec.areaHectares} ha</span>
                    <span>Confidence: {rec.aiConfidence}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
