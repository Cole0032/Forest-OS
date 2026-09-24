import React, { useState } from 'react';
import {
  ShieldAlert,
  Camera,
  Radio,
  MapPin,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  TrendingDown,
  Satellite,
  Truck,
  Eye,
  Crosshair,
  Volume2,
  Sparkles,
  ArrowRight,
  Maximize2,
  Play,
  Pause,
  Layers,
} from 'lucide-react';
import { Incident, CameraFeed, Device, FieldPatrolTeam } from '../types/forestguard';
import { GisMap } from './GisMap';
import { useTheme } from '../context/ThemeContext';

interface CommandCenterProps {
  incidents: Incident[];
  cameras: CameraFeed[];
  devices: Device[];
  fieldTeams: FieldPatrolTeam[];
  onSelectIncident: (incident: Incident) => void;
  onNavigateToModule: (moduleId: string) => void;
  onTriggerMapsGrounding?: (locationName: string, lat: number, lng: number) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  incidents,
  cameras,
  devices,
  fieldTeams,
  onSelectIncident,
  onNavigateToModule,
  onTriggerMapsGrounding,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Focus incident (top priority)
  const topPriorityIncident =
    incidents.find((i) => i.severity === 'CRITICAL') || incidents[0];

  // CCTV live preview camera
  const [activeCamera, setActiveCamera] = useState<CameraFeed>(
    cameras.find((c) => c.id === 'DEV-CAM-041') || cameras[0]
  );
  const [isPlayingCctv, setIsPlayingCctv] = useState<boolean>(true);

  // Statistics
  const activeCamerasCount = cameras.filter((c) => c.status === 'ONLINE').length;
  const activeSensorsCount = devices.filter((d) => d.status === 'ONLINE').length;
  const activeAlertsCount = incidents.filter(
    (i) => i.status === 'DETECTED' || i.status === 'UNDER_REVIEW'
  ).length;
  const verifiedCount = incidents.filter((i) => i.status === 'VERIFIED').length;
  const openInvestigationsCount = 6;
  const offlineDevicesCount = devices.filter((d) => d.status === 'OFFLINE').length;

  return (
    <div
      className={`p-4 space-y-4 max-w-[1600px] mx-auto transition-colors ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div
          onClick={() => onNavigateToModule('live-monitoring')}
          className={`p-3 rounded-xl border cursor-pointer transition-all shadow-sm group ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60 hover:border-emerald-500/60'
              : 'bg-white border-slate-200 hover:border-emerald-400'
          }`}
        >
          <div
            className={`flex items-center justify-between text-[11px] font-semibold ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>ACTIVE CAMERAS</span>
            <Camera className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-500 mt-1">
            {activeCamerasCount}{' '}
            <span
              className={`text-xs font-normal font-sans ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              / {cameras.length}
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
            94.6% Online
          </span>
        </div>

        <div
          onClick={() => onNavigateToModule('iot-network')}
          className={`p-3 rounded-xl border cursor-pointer transition-all shadow-sm group ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60 hover:border-emerald-500/60'
              : 'bg-white border-slate-200 hover:border-emerald-400'
          }`}
        >
          <div
            className={`flex items-center justify-between text-[11px] font-semibold ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>ACTIVE SENSORS</span>
            <Radio className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-500 mt-1">
            {activeSensorsCount}{' '}
            <span
              className={`text-xs font-normal font-sans ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              / {devices.length}
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
            96.0% Online
          </span>
        </div>

        <div
          onClick={() => onNavigateToModule('incidents')}
          className={`p-3 rounded-xl border cursor-pointer transition-all shadow-sm group ${
            isDark
              ? 'bg-[#140b0d] border-red-900/60 hover:border-red-500/60'
              : 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
          }`}
        >
          <div
            className={`flex items-center justify-between text-[11px] font-semibold ${
              isDark ? 'text-red-300' : 'text-rose-700'
            }`}
          >
            <span>ACTIVE ALERTS</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-red-500 mt-1">
            {activeAlertsCount}
          </div>
          <span
            className={`text-[10px] block mt-0.5 font-medium ${
              isDark ? 'text-red-300' : 'text-rose-600'
            }`}
          >
            4 Critical Actions
          </span>
        </div>

        <div
          onClick={() => onNavigateToModule('incidents')}
          className={`p-3 rounded-xl border cursor-pointer transition-all shadow-sm group ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60 hover:border-emerald-500/60'
              : 'bg-white border-slate-200 hover:border-emerald-400'
          }`}
        >
          <div
            className={`flex items-center justify-between text-[11px] font-semibold ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>VERIFIED INCIDENTS</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div
            className={`text-xl font-bold font-mono tabular-nums mt-1 ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            {verifiedCount}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
            Human Confirmed
          </span>
        </div>

        <div
          onClick={() => onNavigateToModule('forest-gis')}
          className={`p-3 rounded-xl border cursor-pointer transition-all shadow-sm group ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60 hover:border-emerald-500/60'
              : 'bg-white border-slate-200 hover:border-emerald-400'
          }`}
        >
          <div
            className={`flex items-center justify-between text-[11px] font-semibold ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>MONITORED FOREST</span>
            <MapPin className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-300 mt-1">
            184.5k{' '}
            <span
              className={`text-[10px] font-normal font-sans ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              ha
            </span>
          </div>
          <span
            className={`text-[10px] block mt-0.5 font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            8 Protected Zones
          </span>
        </div>

        <div
          onClick={() => onNavigateToModule('cases')}
          className={`p-3 rounded-xl border cursor-pointer transition-all shadow-sm group ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60 hover:border-emerald-500/60'
              : 'bg-white border-slate-200 hover:border-blue-400'
          }`}
        >
          <div
            className={`flex items-center justify-between text-[11px] font-semibold ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>OPEN CASES</span>
            <Briefcase className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-blue-500 mt-1">
            {openInvestigationsCount}
          </div>
          <span
            className={`text-[10px] block mt-0.5 font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Active Inquiries
          </span>
        </div>

        <div
          onClick={() => onNavigateToModule('iot-network')}
          className={`p-3 rounded-xl border cursor-pointer transition-all shadow-sm group ${
            isDark
              ? 'bg-[#141209] border-amber-900/60 hover:border-amber-500/60'
              : 'bg-amber-50/70 border-amber-200 hover:border-amber-400'
          }`}
        >
          <div
            className={`flex items-center justify-between text-[11px] font-semibold ${
              isDark ? 'text-amber-300' : 'text-amber-800'
            }`}
          >
            <span>OFFLINE NODES</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-500 mt-1">
            {offlineDevicesCount}
          </div>
          <span
            className={`text-[10px] block mt-0.5 font-medium ${
              isDark ? 'text-amber-300' : 'text-amber-700'
            }`}
          >
            Service Dispatched
          </span>
        </div>

        <div
          onClick={() => onNavigateToModule('satellite')}
          className={`p-3 rounded-xl border cursor-pointer transition-all shadow-sm group ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60 hover:border-emerald-500/60'
              : 'bg-white border-slate-200 hover:border-emerald-400'
          }`}
        >
          <div
            className={`flex items-center justify-between text-[11px] font-semibold ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>FOREST LOSS (MTD)</span>
            <Satellite className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-500 mt-1">
            28.4{' '}
            <span
              className={`text-[10px] font-normal font-sans ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              ha
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 flex items-center gap-0.5 font-medium">
            <TrendingDown className="w-2.5 h-2.5" /> -32% YoY
          </span>
        </div>
      </div>

      {/* Main Central Workspace: GIS Map (Center) + Live CCTV & Priority Alert (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[580px]">
        {/* CENTER: Dominant GIS Map (8 cols) */}
        <div className="lg:col-span-8 h-full flex flex-col">
          <GisMap
            incidents={incidents}
            cameras={cameras}
            devices={devices}
            fieldTeams={fieldTeams}
            selectedIncidentId={topPriorityIncident?.id}
            onSelectIncident={onSelectIncident}
            onTriggerMapsGrounding={onTriggerMapsGrounding}
          />
        </div>

        {/* RIGHT: Live CCTV Stream & Top Priority Incident Card (4 cols) */}
        <div className="lg:col-span-4 h-full flex flex-col space-y-3 overflow-hidden">
          {/* Live CCTV Video Card */}
          <div
            className={`rounded-xl overflow-hidden border flex flex-col shadow-lg shrink-0 ${
              isDark ? 'bg-black border-emerald-900/60' : 'bg-slate-900 border-slate-300'
            }`}
          >
            <div
              className="relative aspect-video bg-cover bg-center"
              style={{ backgroundImage: `url(${activeCamera.streamUrl})` }}
            >
              {/* Scanlines */}
              <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40"></div>

              {/* Bounding Box on live CCTV */}
              <div className="absolute top-[28%] left-[22%] w-[46%] h-[48%] border-2 border-red-500 bg-red-500/10 rounded pointer-events-none">
                <div className="absolute -top-5 left-0 bg-red-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                  HEAVY TRUCK (91%)
                </div>
              </div>

              {/* Top Banner */}
              <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono z-10">
                <div className="flex items-center gap-1.5 bg-black/80 px-2 py-0.5 rounded text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <span>LIVE: {activeCamera.id.replace('DEV-', '')}</span>
                </div>
                <div className="bg-black/80 px-2 py-0.5 rounded text-slate-300">
                  {activeCamera.zone.split(' ')[0]}
                </div>
              </div>

              {/* Bottom OSD */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono z-10">
                <span className="bg-black/80 px-2 py-0.5 rounded text-slate-300">
                  {activeCamera.resolution}
                </span>
                <button
                  onClick={() => onNavigateToModule('live-monitoring')}
                  className="bg-emerald-900/90 hover:bg-emerald-800 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/50 flex items-center gap-1 font-bold"
                >
                  <span>ALL FEEDS</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Critical Priority Incident Spotlight */}
          {topPriorityIncident && (
            <div
              onClick={() => onSelectIncident(topPriorityIncident)}
              className={`flex-1 p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between shadow-md ${
                isDark
                  ? 'bg-[#0e1612] border-red-900/60 hover:border-red-500/60'
                  : 'bg-white border-red-200 hover:border-red-400'
              }`}
            >
              <div>
                <div
                  className={`flex items-center justify-between text-xs pb-1.5 border-b ${
                    isDark ? 'border-emerald-950' : 'border-slate-100'
                  }`}
                >
                  <span className="text-red-500 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                    <span>CRITICAL PRIORITY INTERDICTION</span>
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold ${
                      isDark
                        ? 'text-red-300 bg-red-950 border-red-800/50'
                        : 'text-red-700 bg-red-50 border-red-200'
                    }`}
                  >
                    {topPriorityIncident.id}
                  </span>
                </div>

                <h3
                  className={`text-xs font-bold mt-2 leading-snug ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  {topPriorityIncident.title}
                </h3>

                <p
                  className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {topPriorityIncident.aiExplanation.whatDetected}
                </p>

                <div
                  className={`mt-2 space-y-1 text-[10px] ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    <span className="truncate">{topPriorityIncident.locationName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-amber-500" />
                    <span className="font-mono">Acoustic 2.85 kHz Chainsaw Harmonic Triangulated</span>
                  </div>
                </div>
              </div>

              <div
                className={`pt-2 border-t flex items-center justify-between text-xs ${
                  isDark ? 'border-emerald-950' : 'border-slate-100'
                }`}
              >
                <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  AI Confidence: {topPriorityIncident.aiConfidence}%
                </span>
                <span className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-semibold text-[10px] flex items-center gap-1">
                  <span>VERIFY INCIDENT</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Alerts + Satellite Delta + Timber Discrepancy + Device Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recent Alerts Feed */}
        <div
          className={`p-3.5 rounded-xl border space-y-2.5 transition-colors ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold pb-1 border-b ${
              isDark ? 'text-emerald-400 border-emerald-950' : 'text-emerald-700 border-slate-100'
            }`}
          >
            <span>RECENT ALERTS FEED</span>
            <span
              onClick={() => onNavigateToModule('incidents')}
              className={`text-[10px] font-semibold cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-emerald-300' : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              VIEW ALL
            </span>
          </div>
          <div className="space-y-2">
            {incidents.slice(0, 3).map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className={`p-2 rounded-lg border cursor-pointer transition-colors text-xs ${
                  isDark
                    ? 'bg-[#06100b] border-emerald-950 hover:border-emerald-800'
                    : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className={isDark ? 'text-slate-200' : 'text-slate-800 font-mono'}>
                    {inc.id}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      inc.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'
                    }`}
                  >
                    {inc.severity}
                  </span>
                </div>
                <p
                  className={`text-[11px] mt-0.5 truncate ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {inc.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Deforestation Change Detection */}
        <div
          onClick={() => onNavigateToModule('satellite')}
          className={`p-3.5 rounded-xl border space-y-2.5 cursor-pointer transition-colors ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60 hover:border-emerald-700/60'
              : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm'
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold pb-1 border-b ${
              isDark ? 'text-emerald-400 border-emerald-950' : 'text-emerald-700 border-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5" />
              <span>SATELLITE CHANGE DELTA</span>
            </span>
            <span className="text-[10px] text-amber-500 font-bold font-mono">-4.8 HA</span>
          </div>
          <p
            className={`text-[11px] leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Sentinel-2 MSI surface reflectance delta flagged canopy loss in Tapir Ridge Sector 4B. NDVI dropped from 0.82 to 0.54.
          </p>
          <div
            className={`p-2 rounded border flex items-center justify-between text-[10px] ${
              isDark
                ? 'bg-[#06100b] border-emerald-950 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span>Pass: Copernicus T20MMA</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              91% Confidence
            </span>
          </div>
        </div>

        {/* Timber Checkpoint Transit Discrepancies */}
        <div
          onClick={() => onNavigateToModule('timber')}
          className={`p-3.5 rounded-xl border space-y-2.5 cursor-pointer transition-colors ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60 hover:border-emerald-700/60'
              : 'bg-white border-slate-200 hover:border-amber-400 shadow-sm'
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold pb-1 border-b ${
              isDark ? 'text-amber-400 border-emerald-950' : 'text-amber-700 border-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>TIMBER TRADE DISCREPANCY</span>
            </span>
            <span className="text-[10px] text-red-500 font-bold font-mono">+48.9% VOL</span>
          </div>
          <p
            className={`text-[11px] leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Truck TRK-9021-BR detained at Kupari Checkpoint. Declared 18 m³ softwoods; electronic weighbridge recorded 27.4 m³ high-density hardwood.
          </p>
          <div
            className={`p-2 rounded border flex items-center justify-between text-[10px] ${
              isDark
                ? 'bg-[#06100b] border-emerald-950 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span>Species: Handroanthus (Ipê)</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">Hold Active</span>
          </div>
        </div>

        {/* IoT Edge Health Overview */}
        <div
          onClick={() => onNavigateToModule('iot-network')}
          className={`p-3.5 rounded-xl border space-y-2.5 cursor-pointer transition-colors ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60 hover:border-emerald-700/60'
              : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm'
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold pb-1 border-b ${
              isDark ? 'text-emerald-400 border-emerald-950' : 'text-emerald-700 border-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>IoT DEVICE HEALTH</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              98.4% UP
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                Online Transceivers:
              </span>
              <span className="text-emerald-600 dark:text-emerald-300 font-bold font-mono">
                {activeSensorsCount} / {devices.length} Nodes
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                Starlink Mesh Latency:
              </span>
              <span className="font-mono tabular-nums">38 ms</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                Low Power Alerts:
              </span>
              <span className="text-amber-500 font-bold font-mono tabular-nums">
                {devices.filter((d) => d.status === 'LOW_BATTERY').length} Nodes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
