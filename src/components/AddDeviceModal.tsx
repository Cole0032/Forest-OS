import React, { useState } from 'react';
import {
  X,
  Radio,
  Cpu,
  Battery,
  Sun,
  Wifi,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Device, DeviceCategory, DeviceStatus } from '../types/forestguard';
import { FOREST_ZONES } from '../services/mockData';
import { useTheme } from '../context/ThemeContext';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDevice: (device: Device) => void;
  existingDeviceCount: number;
}

const DEVICE_TYPE_OPTIONS: { label: string; value: DeviceCategory; defaultReading: string }[] = [
  { label: 'Acoustic Audio Sentinel', value: 'ACOUSTIC_SENSOR', defaultReading: '38.4 dB (Ambient Biophony)' },
  { label: 'Thermal Anomaly Sensor', value: 'THERMAL_CAMERA', defaultReading: '27.4°C Surface Thermal' },
  { label: 'AI Edge Optical Camera', value: 'AI_CAMERA', defaultReading: '1080p Optical Stream Standby' },
  { label: 'Smoke & Combustion Sensor', value: 'SMOKE_SENSOR', defaultReading: '0.01 ppm CO / Normal Air' },
  { label: 'Temperature & Humidity Logger', value: 'TEMPERATURE_SENSOR', defaultReading: '26.8°C / 82% Humidity' },
  { label: 'PIR Motion Perimeter Sensor', value: 'MOTION_SENSOR', defaultReading: 'Clear / No Incursion Detected' },
  { label: 'GPS Asset / Ranger Tracker', value: 'GPS_DEVICE', defaultReading: 'SatFix: 12 Sats / Accuracy 1.8m' },
  { label: 'Edge AI Compute Gateway', value: 'EDGE_AI_DEVICE', defaultReading: 'Neural Model v3.2 Idle' },
  { label: 'Environmental Multi-Sensor', value: 'ENVIRONMENTAL_SENSOR', defaultReading: 'AQI 14 (Pristine Forest)' },
];

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose,
  onAddDevice,
  existingDeviceCount,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const defaultIdNum = (existingDeviceCount + 1).toString().padStart(3, '0');
  const defaultZone = FOREST_ZONES[0];

  const [id, setId] = useState<string>(`DEV-IOT-${defaultIdNum}`);
  const [name, setName] = useState<string>(`Acoustic Sentinel #${defaultIdNum}`);
  const [type, setType] = useState<DeviceCategory>('ACOUSTIC_SENSOR');
  const [zone, setZone] = useState<string>(defaultZone.name);
  const [lat, setLat] = useState<number>(Number((defaultZone.center.lat + (Math.random() * 0.04 - 0.02)).toFixed(5)));
  const [lng, setLng] = useState<number>(Number((defaultZone.center.lng + (Math.random() * 0.04 - 0.02)).toFixed(5)));
  const [networkType, setNetworkType] = useState<Device['networkType']>('Starlink-Mesh');
  const [batteryPercent, setBatteryPercent] = useState<number>(98);
  const [solarChargingRate, setSolarChargingRate] = useState<number>(14.5);
  const [firmwareVersion, setFirmwareVersion] = useState<string>('v3.2.0-edge-node');
  const [status, setStatus] = useState<DeviceStatus>('ONLINE');
  const [currentReading, setCurrentReading] = useState<string>('38.4 dB (Ambient Biophony)');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleZoneChange = (selectedZoneName: string) => {
    setZone(selectedZoneName);
    const found = FOREST_ZONES.find((z) => z.name === selectedZoneName);
    if (found) {
      setLat(Number((found.center.lat + (Math.random() * 0.04 - 0.02)).toFixed(5)));
      setLng(Number((found.center.lng + (Math.random() * 0.04 - 0.02)).toFixed(5)));
    }
  };

  const handleTypeChange = (selectedType: DeviceCategory) => {
    setType(selectedType);
    const option = DEVICE_TYPE_OPTIONS.find((o) => o.value === selectedType);
    if (option) {
      setCurrentReading(option.defaultReading);
      setName(`${option.label.split(' ')[0]} Node #${defaultIdNum}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) {
      setError('Please provide a valid Device ID and Name.');
      return;
    }

    const newDevice: Device = {
      id: id.trim().toUpperCase(),
      name: name.trim(),
      type,
      zone,
      coordinates: { lat: Number(lat), lng: Number(lng) },
      batteryPercent: Number(batteryPercent),
      solarChargingRate: Number(solarChargingRate),
      signalStrength: status === 'ONLINE' ? 95 : 0,
      networkType,
      firmwareVersion,
      lastHeartbeat: 'Just now',
      temperatureC: 26.5,
      storageUsedPercent: 12,
      status,
      installedDate: new Date().toISOString().split('T')[0],
      lastMaintenanceDate: new Date().toISOString().split('T')[0],
      uptimePercent: 100,
      currentReading,
    };

    onAddDevice(newDevice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isDark
            ? 'bg-[#0b1410] border-emerald-900/70 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-[#0f1b15] border-emerald-950' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isDark
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-700'
              }`}
            >
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Provision New IoT Edge Device</h2>
              <p
                className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Register hardware sentinel to mesh network & GIS monitoring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-[#15231c]'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-500 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Device Identifier (Unique ID)
              </label>
              <input
                type="text"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. DEV-IOT-301"
                className={`w-full text-xs font-mono rounded-lg px-3 py-2 border transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-[#121f18] border-emerald-900/60 text-emerald-300 placeholder-slate-600'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Device Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Canopy Acoustic Sentinel"
                className={`w-full text-xs rounded-lg px-3 py-2 border transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-[#121f18] border-emerald-900/60 text-slate-100 placeholder-slate-600'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Sensor Category & Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Sensor Architecture / Type
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value as DeviceCategory)}
                className={`w-full text-xs rounded-lg px-3 py-2 border transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${
                  isDark
                    ? 'bg-[#121f18] border-emerald-900/60 text-slate-200'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {DEVICE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Assigned Forest Zone
              </label>
              <select
                value={zone}
                onChange={(e) => handleZoneChange(e.target.value)}
                className={`w-full text-xs rounded-lg px-3 py-2 border transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer ${
                  isDark
                    ? 'bg-[#121f18] border-emerald-900/60 text-slate-200'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {FOREST_ZONES.map((z) => (
                  <option key={z.id} value={z.name}>
                    {z.name} ({z.type.replace(/_/g, ' ')})
                  </option>
                ))}
                <option value="Kupari Border Checkpoint Sector">Kupari Border Checkpoint Sector</option>
              </select>
            </div>
          </div>

          {/* Geographical Coordinates */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              GIS Placement Coordinates (WGS-84 Decimal)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500">
                  LAT:
                </span>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className={`w-full text-xs font-mono rounded-lg pl-10 pr-3 py-2 border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark
                      ? 'bg-[#121f18] border-emerald-900/60 text-slate-200'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500">
                  LNG:
                </span>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className={`w-full text-xs font-mono rounded-lg pl-10 pr-3 py-2 border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark
                      ? 'bg-[#121f18] border-emerald-900/60 text-slate-200'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Telemetry & Network Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Network Uplink
              </label>
              <select
                value={networkType}
                onChange={(e) => setNetworkType(e.target.value as Device['networkType'])}
                className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-[#121f18] border-emerald-900/60 text-slate-200'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="Starlink-Mesh">Starlink Mesh</option>
                <option value="LoRaWAN">LoRaWAN Long-Range</option>
                <option value="LTE-M">LTE-M Cellular</option>
                <option value="Satellite">Copernicus Satellite</option>
                <option value="VHF">VHF Relay</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Initial Battery (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={batteryPercent}
                  onChange={(e) => setBatteryPercent(parseInt(e.target.value) || 0)}
                  className={`w-full text-xs font-mono rounded-lg px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark
                      ? 'bg-[#121f18] border-emerald-900/60 text-slate-200'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <Battery className="w-3.5 h-3.5 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Solar Panel (Watts)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={solarChargingRate}
                  onChange={(e) => setSolarChargingRate(parseFloat(e.target.value) || 0)}
                  className={`w-full text-xs font-mono rounded-lg px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isDark
                      ? 'bg-[#121f18] border-emerald-900/60 text-slate-200'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
                <Sun className="w-3.5 h-3.5 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Firmware & Initial Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Firmware Version
              </label>
              <input
                type="text"
                value={firmwareVersion}
                onChange={(e) => setFirmwareVersion(e.target.value)}
                className={`w-full text-xs font-mono rounded-lg px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-[#121f18] border-emerald-900/60 text-slate-200'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Provisioning Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DeviceStatus)}
                className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-[#121f18] border-emerald-900/60 text-slate-200'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="ONLINE">ONLINE (Active Telemetry)</option>
                <option value="MAINTENANCE">MAINTENANCE (Diagnostics Mode)</option>
                <option value="LOW_BATTERY">LOW BATTERY (Power Save)</option>
                <option value="OFFLINE">OFFLINE (Standby)</option>
              </select>
            </div>
          </div>

          {/* Current Reading */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Current Initial Reading / Telemetry
            </label>
            <input
              type="text"
              value={currentReading}
              onChange={(e) => setCurrentReading(e.target.value)}
              placeholder="e.g. 38.4 dB (Ambient Biophony)"
              className={`w-full text-xs rounded-lg px-3 py-2 border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                isDark
                  ? 'bg-[#121f18] border-emerald-900/60 text-slate-200'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Live Node Preview */}
          <div
            className={`p-3.5 rounded-xl border text-xs ${
              isDark
                ? 'bg-[#07110c] border-emerald-950 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider block mb-2 ${
                isDark ? 'text-emerald-400' : 'text-emerald-700'
              }`}
            >
              Mesh Provisioning Preview
            </span>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-bold">{id}</span>
                <span className="mx-2 text-slate-400">•</span>
                <span>{name}</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  status === 'ONLINE'
                    ? isDark
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isDark
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {status}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">
              Zone: {zone} · GPS: [{lat}, {lng}] · {networkType} · {batteryPercent}% Battery
            </div>
          </div>
        </form>

        {/* Modal Actions */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${
            isDark ? 'bg-[#0f1b15] border-emerald-950' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              isDark
                ? 'border-emerald-900/60 text-slate-300 hover:bg-[#15231c]'
                : 'border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Provision & Deploy Device
          </button>
        </div>
      </div>
    </div>
  );
};
