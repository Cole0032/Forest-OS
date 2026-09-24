import React, { useState } from 'react';
import {
  Plus,
  Radio,
  Camera,
  Battery,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  Search,
  Filter,
  Eye,
  Trash2,
  Activity,
  MapPin,
  Wifi,
  Sliders,
  RotateCcw,
  Check,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Device, DeviceCategory, DeviceStatus } from '../types/forestguard';
import { FOREST_ZONES } from '../services/mockData';

interface DeviceManagementProps {
  devices: Device[];
  onAddDevice: (newDevice: Device) => void;
  onUpdateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
  onRemoveDevice: (deviceId: string) => void;
  onSelectDeviceOnMap?: (device: Device) => void;
}

export const DeviceManagement: React.FC<DeviceManagementProps> = ({
  devices,
  onAddDevice,
  onUpdateDeviceStatus,
  onRemoveDevice,
  onSelectDeviceOnMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceToRemove, setDeviceToRemove] = useState<Device | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; message: string; success: boolean } | null>(null);

  // New device form state (Step-by-step wizard)
  const [formData, setFormData] = useState({
    type: 'AI_CAMERA' as DeviceCategory,
    name: '',
    deviceId: '',
    manufacturer: 'Axis Communications / Biosphere Edge',
    model: 'FG-Vision-Pro 4K',
    zone: FOREST_ZONES[0].name,
    lat: FOREST_ZONES[0].center.lat,
    lng: FOREST_ZONES[0].center.lng,
    connectivity: 'Starlink-Mesh' as Device['networkType'],
    batteryThreshold: 20,
    heartbeatInterval: 30, // seconds
    detectionMode: 'Continuous AI Inference',
  });

  // KPI Calculations
  const onlineCount = devices.filter((d) => d.status === 'ONLINE').length;
  const offlineCount = devices.filter((d) => d.status === 'OFFLINE').length;
  const lowBatteryCount = devices.filter((d) => d.status === 'LOW_BATTERY').length;
  const maintenanceCount = devices.filter((d) => d.status === 'MAINTENANCE').length;
  const tamperCount = devices.filter((d) => d.status === 'TAMPER_ALERT').length;

  const filteredDevices = devices.filter((d) => {
    const matchesSearch =
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || d.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenAddModal = () => {
    const nextNum = (devices.length + 1).toString().padStart(3, '0');
    setFormData({
      type: 'AI_CAMERA',
      name: `Surveillance Camera CAM-${nextNum}`,
      deviceId: `DEV-CAM-${nextNum}`,
      manufacturer: 'Biosphere Edge Corp',
      model: 'FG-Vision-Pro 4K',
      zone: FOREST_ZONES[0].name,
      lat: FOREST_ZONES[0].center.lat + 0.005,
      lng: FOREST_ZONES[0].center.lng + 0.005,
      connectivity: 'Starlink-Mesh',
      batteryThreshold: 20,
      heartbeatInterval: 30,
      detectionMode: 'Continuous AI Inference',
    });
    setCurrentStep(1);
    setIsAddModalOpen(true);
  };

  const handleTestDevice = (device: Device) => {
    setTestResult({
      id: device.id,
      message: `Diagnostic ping sent to ${device.id}. Round-trip: 42ms. Telemetry active.`,
      success: true,
    });
    setTimeout(() => {
      setTestResult(null);
    }, 4000);
  };

  const handleConfirmAdd = () => {
    const newDev: Device = {
      id: formData.deviceId || `DEV-${Date.now().toString().slice(-4)}`,
      name: formData.name || `Device ${formData.deviceId}`,
      type: formData.type,
      zone: formData.zone,
      coordinates: { lat: Number(formData.lat), lng: Number(formData.lng) },
      batteryPercent: 100,
      solarChargingRate: 24.5,
      signalStrength: 95,
      networkType: formData.connectivity,
      firmwareVersion: 'v4.5.0-edge',
      lastHeartbeat: 'Just now',
      temperatureC: 27.2,
      storageUsedPercent: 12,
      status: 'ONLINE',
      installedDate: new Date().toISOString().substring(0, 10),
      lastMaintenanceDate: new Date().toISOString().substring(0, 10),
      uptimePercent: 100,
      currentReading: formData.type === 'ACOUSTIC_SENSOR' ? '41 dB Normal Ambient' : 'Operational',
    };

    onAddDevice(newDev);
    setIsAddModalOpen(false);
  };

  const handleConfirmRetire = () => {
    if (deviceToRemove) {
      onRemoveDevice(deviceToRemove.id);
      setDeviceToRemove(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-950">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              Infrastructure Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Device Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time status, health diagnostics, deployment and configuration across all edge sensors.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="min-h-[44px] px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Add Device</span>
        </button>
      </div>

      {/* Diagnostic Toast */}
      {testResult && (
        <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-between text-sm text-emerald-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{testResult.message}</span>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Large Status Cards (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div
          onClick={() => setStatusFilter(statusFilter === 'ONLINE' ? 'ALL' : 'ONLINE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'ONLINE'
              ? 'bg-emerald-950/70 border-emerald-500 ring-1 ring-emerald-500'
              : 'bg-[#0e1713] border-emerald-950 hover:border-emerald-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>ONLINE</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">{onlineCount}</div>
          <div className="text-xs text-slate-400 mt-1">Normal telemetry</div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'OFFLINE' ? 'ALL' : 'OFFLINE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'OFFLINE'
              ? 'bg-red-950/70 border-red-500 ring-1 ring-red-500'
              : 'bg-[#0e1713] border-emerald-950 hover:border-red-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>OFFLINE</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-extrabold text-red-400 mt-2">{offlineCount}</div>
          <div className="text-xs text-slate-400 mt-1">No heartbeat response</div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'LOW_BATTERY' ? 'ALL' : 'LOW_BATTERY')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'LOW_BATTERY'
              ? 'bg-amber-950/70 border-amber-500 ring-1 ring-amber-500'
              : 'bg-[#0e1713] border-emerald-950 hover:border-amber-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>LOW BATTERY</span>
            <Battery className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">{lowBatteryCount}</div>
          <div className="text-xs text-slate-400 mt-1">&lt; 20% remaining</div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'MAINTENANCE' ? 'ALL' : 'MAINTENANCE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'MAINTENANCE'
              ? 'bg-blue-950/70 border-blue-500 ring-1 ring-blue-500'
              : 'bg-[#0e1713] border-emerald-950 hover:border-blue-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>MAINTENANCE</span>
            <Wrench className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-blue-400 mt-2">{maintenanceCount}</div>
          <div className="text-xs text-slate-400 mt-1">Scheduled service</div>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'TAMPER_ALERT' ? 'ALL' : 'TAMPER_ALERT')}
          className={`p-4 rounded-xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            statusFilter === 'TAMPER_ALERT'
              ? 'bg-orange-950/70 border-orange-500 ring-1 ring-orange-500'
              : 'bg-[#0e1713] border-emerald-950 hover:border-orange-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>TAMPER ALERT</span>
            <ShieldAlert className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-extrabold text-orange-400 mt-2">{tamperCount}</div>
          <div className="text-xs text-slate-400 mt-1">Physical sensor movement</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 rounded-xl bg-[#0d1611] border border-emerald-950 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 flex-1 max-w-md bg-[#131f18] px-3 py-2 rounded-lg border border-emerald-900/60 focus-within:border-emerald-500">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by device ID, model, or zone..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#131f18] border border-emerald-900/60 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Types</option>
              <option value="AI_CAMERA">AI Cameras</option>
              <option value="THERMAL_CAMERA">Thermal Cameras</option>
              <option value="ACOUSTIC_SENSOR">Acoustic Sensors</option>
              <option value="SMOKE_SENSOR">Smoke Sensors</option>
              <option value="TEMPERATURE_SENSOR">Weather / Temp Sensors</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#131f18] border border-emerald-900/60 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="LOW_BATTERY">Low Battery</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="TAMPER_ALERT">Tamper Alert</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Device Table */}
      <div className="rounded-xl bg-[#0d1611] border border-emerald-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#121c16] text-slate-300 font-semibold text-xs uppercase tracking-wider border-b border-emerald-950">
              <tr>
                <th className="p-3.5 pl-4">Device</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Battery</th>
                <th className="p-3.5">Last Seen</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/60 text-slate-200">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
                    No devices match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredDevices.slice(0, 30).map((dev) => {
                  return (
                    <tr
                      key={dev.id}
                      onClick={() => setSelectedDevice(dev)}
                      className="hover:bg-[#132219] transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 pl-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-mono text-xs">{dev.id}</span>
                          <span className="text-xs text-slate-400 font-normal">· {dev.name}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-xs text-slate-300">
                        {dev.type.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3.5 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[180px]">{dev.zone}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                          {dev.status === 'ONLINE' && (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              <span className="text-emerald-300">Online</span>
                            </>
                          )}
                          {dev.status === 'OFFLINE' && (
                            <>
                              <span className="w-2 h-2 rounded-full bg-red-400"></span>
                              <span className="text-red-300">Offline</span>
                            </>
                          )}
                          {dev.status === 'LOW_BATTERY' && (
                            <>
                              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                              <span className="text-amber-300">Low Battery</span>
                            </>
                          )}
                          {dev.status === 'MAINTENANCE' && (
                            <>
                              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                              <span className="text-blue-300">Maintenance</span>
                            </>
                          )}
                          {dev.status === 'TAMPER_ALERT' && (
                            <>
                              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                              <span className="text-orange-300">Tamper Alert</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3.5 text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={
                              dev.batteryPercent < 20
                                ? 'text-amber-400 font-bold'
                                : 'text-slate-200'
                            }
                          >
                            {dev.batteryPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 text-xs text-slate-400 font-mono">
                        {dev.lastHeartbeat}
                      </td>
                      <td className="p-3.5 pr-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => setSelectedDevice(dev)}
                            className="min-h-[36px] px-2.5 py-1 text-xs rounded bg-[#17251e] hover:bg-emerald-950 text-slate-200 hover:text-white border border-emerald-900/60 cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleTestDevice(dev)}
                            className="min-h-[36px] px-2.5 py-1 text-xs rounded bg-[#17251e] hover:bg-emerald-950 text-emerald-400 hover:text-emerald-300 border border-emerald-900/60 cursor-pointer"
                            title="Send ping diagnostic"
                          >
                            Test
                          </button>
                          <button
                            onClick={() => setDeviceToRemove(dev)}
                            className="min-h-[36px] px-2 py-1 text-xs rounded bg-[#1c1214] hover:bg-red-950 text-red-400 hover:text-red-300 border border-red-900/40 cursor-pointer"
                            title="Remove or retire device"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-[#111a14] border-t border-emerald-950 text-xs text-slate-400 flex items-center justify-between">
          <span>Showing {Math.min(30, filteredDevices.length)} of {filteredDevices.length} deployed nodes</span>
          <span className="text-emerald-400">Total Infrastructure: {devices.length} Nodes</span>
        </div>
      </div>

      {/* STEP-BY-STEP ADD DEVICE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1713] border border-emerald-800 rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-emerald-950 bg-[#121c17] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Add New Infrastructure Device</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Step {currentStep} of 6: {
                    currentStep === 1 ? 'Device Type' :
                    currentStep === 2 ? 'Device Information' :
                    currentStep === 3 ? 'Location' :
                    currentStep === 4 ? 'Connectivity' :
                    currentStep === 5 ? 'Configuration' : 'Confirm & Deploy'
                  }
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="flex h-1 bg-[#131f18]">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`flex-1 transition-all ${
                    step <= currentStep ? 'bg-emerald-500' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-sm">
              {/* STEP 1: DEVICE TYPE */}
              {currentStep === 1 && (
                <div className="space-y-3">
                  <span className="text-xs uppercase font-semibold text-slate-400 block">
                    Select Hardware Category
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { type: 'AI_CAMERA', label: 'CCTV Camera', desc: 'Optical 4K edge stream with vehicle/human classifier' },
                      { type: 'THERMAL_CAMERA', label: 'Thermal Camera', desc: 'FLIR radiometric thermal imager for heat/night monitoring' },
                      { type: 'ACOUSTIC_SENSOR', label: 'Acoustic Sensor', desc: 'Omnidirectional microphone array for chainsaw/gunshot triangulation' },
                      { type: 'MOTION_SENSOR', label: 'Motion Sensor', desc: 'PIR perimeter passive infrared detection' },
                      { type: 'ENVIRONMENTAL_SENSOR', label: 'Environmental Sensor', desc: 'CO, PM2.5, smoke, humidity and temperature telemetry' },
                      { type: 'GPS_DEVICE', label: 'GPS Device', desc: 'Ranger patrol or mobile asset tracking collar/tag' },
                      { type: 'EDGE_AI_DEVICE', label: 'Edge AI Device', desc: 'Solar-powered neural accelerator gateway' },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: item.type as DeviceCategory })}
                        className={`p-3 rounded-lg text-left border transition-all ${
                          formData.type === item.type
                            ? 'bg-emerald-950/80 border-emerald-500 ring-1 ring-emerald-500 text-white'
                            : 'bg-[#121c17] border-emerald-950 hover:border-emerald-800 text-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-sm flex items-center justify-between">
                          <span>{item.label}</span>
                          {formData.type === item.type && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: DEVICE INFORMATION */}
              {currentStep === 2 && (
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Device Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ridge Perimeter Optical Gate 4"
                      className="w-full bg-[#121c17] border border-emerald-950 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Hardware Identifier (Device ID) *
                    </label>
                    <input
                      type="text"
                      value={formData.deviceId}
                      onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                      placeholder="e.g. DEV-CAM-151"
                      className="w-full bg-[#121c17] border border-emerald-950 rounded-lg p-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Manufacturer
                      </label>
                      <input
                        type="text"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        className="w-full bg-[#121c17] border border-emerald-950 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Model Specification
                      </label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full bg-[#121c17] border border-emerald-950 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: LOCATION */}
              {currentStep === 3 && (
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Protected Forest Zone *
                    </label>
                    <select
                      value={formData.zone}
                      onChange={(e) => {
                        const zoneObj = FOREST_ZONES.find((z) => z.name === e.target.value);
                        setFormData({
                          ...formData,
                          zone: e.target.value,
                          lat: zoneObj ? zoneObj.center.lat : formData.lat,
                          lng: zoneObj ? zoneObj.center.lng : formData.lng,
                        });
                      }}
                      className="w-full bg-[#121c17] border border-emerald-950 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {FOREST_ZONES.map((z) => (
                        <option key={z.id} value={z.name}>
                          {z.name} ({z.areaHa.toLocaleString()} ha)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Latitude (Decimal) *
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                        className="w-full bg-[#121c17] border border-emerald-950 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Longitude (Decimal) *
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                        className="w-full bg-[#121c17] border border-emerald-950 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-[#111a14] rounded-lg border border-emerald-950/80 text-xs text-slate-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Coordinates are verified against the ForestGuard GPS boundary for {formData.zone}.</span>
                  </div>
                </div>
              )}

              {/* STEP 4: CONNECTIVITY */}
              {currentStep === 4 && (
                <div className="space-y-3">
                  <span className="text-xs uppercase font-semibold text-slate-400 block">
                    Telemetry & Network Uplink
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { key: 'Starlink-Mesh', label: 'Starlink-Mesh', desc: 'Direct low-earth orbit satellite terminal with high bandwidth' },
                      { key: 'LoRaWAN', label: 'LoRaWAN', desc: 'Long-range ultra-low power gateway up to 15km line-of-sight' },
                      { key: 'LTE-M', label: '4G / LTE-M', desc: 'Cellular IoT low power wide area network' },
                      { key: 'Satellite', label: 'Iridium Satellite', desc: 'Emergency telemetry uplink for deep rainforest canyons' },
                      { key: 'VHF', label: 'VHF Radio Mesh', desc: 'Tactical radio repeaters connected to ranger posts' },
                    ].map((conn) => (
                      <button
                        key={conn.key}
                        type="button"
                        onClick={() => setFormData({ ...formData, connectivity: conn.key as Device['networkType'] })}
                        className={`p-3 rounded-lg text-left border transition-all ${
                          formData.connectivity === conn.key
                            ? 'bg-emerald-950/80 border-emerald-500 ring-1 ring-emerald-500 text-white'
                            : 'bg-[#121c17] border-emerald-950 hover:border-emerald-800 text-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-sm flex items-center justify-between">
                          <span>{conn.label}</span>
                          {formData.connectivity === conn.key && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{conn.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: CONFIGURATION */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Low Battery Alarm Threshold</span>
                      <span className="text-amber-400 font-mono font-bold">{formData.batteryThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      value={formData.batteryThreshold}
                      onChange={(e) => setFormData({ ...formData, batteryThreshold: parseInt(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">Heartbeat Diagnostic Interval</span>
                      <span className="text-emerald-400 font-mono font-bold">{formData.heartbeatInterval} seconds</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="10"
                      value={formData.heartbeatInterval}
                      onChange={(e) => setFormData({ ...formData, heartbeatInterval: parseInt(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Edge Detection Profile
                    </label>
                    <select
                      value={formData.detectionMode}
                      onChange={(e) => setFormData({ ...formData, detectionMode: e.target.value })}
                      className="w-full bg-[#121c17] border border-emerald-950 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Continuous AI Inference">Continuous AI Inference (Real-time Vision/Audio)</option>
                      <option value="Event-Triggered Wakeup">Event-Triggered Wakeup (Motion/PIR threshold)</option>
                      <option value="High-Sensitivity Acoustic">High-Sensitivity Acoustic Harmonic Filter</option>
                      <option value="Battery Conservation Mode">Battery Conservation Mode (Periodic snapshot)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 6: CONFIRMATION */}
              {currentStep === 6 && (
                <div className="space-y-3.5">
                  <div className="p-4 bg-[#121c17] rounded-xl border border-emerald-950 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-950 text-emerald-400 font-bold">
                      <span>DEVICE DEPLOYMENT MANIFEST</span>
                      <span>READY</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500 block">Identifier:</span>
                        <span className="font-mono text-white">{formData.deviceId}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Category:</span>
                        <span>{formData.type.replace(/_/g, ' ')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Assigned Zone:</span>
                        <span className="truncate block">{formData.zone}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Uplink:</span>
                        <span>{formData.connectivity}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Coordinates:</span>
                        <span className="font-mono">{formData.lat.toFixed(4)}°, {formData.lng.toFixed(4)}°</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Heartbeat:</span>
                        <span>Every {formData.heartbeatInterval}s</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    By confirming, the device will be provisioned into the ForestGuard IoT network ledger with active telemetry listening.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 sm:p-5 border-t border-emerald-950 bg-[#121c17] flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="min-h-[44px] px-4 py-2 text-xs rounded-lg bg-[#18261e] hover:bg-[#203328] text-slate-200 cursor-pointer"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="min-h-[44px] px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  className="min-h-[44px] px-6 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  <span>Deploy & Activate Device</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DEVICE RETIREMENT / REMOVAL CONFIRMATION MODAL */}
      {deviceToRemove && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#140e10] border border-red-900/80 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-bold text-white">Retire Device {deviceToRemove.id}?</h2>
            </div>

            <div className="text-xs text-slate-300 space-y-2 bg-[#1b1214] p-3 rounded-lg border border-red-950">
              <div><strong className="text-slate-400">Device Name:</strong> {deviceToRemove.name}</div>
              <div><strong className="text-slate-400">Zone:</strong> {deviceToRemove.zone}</div>
              <div><strong className="text-slate-400">Current Status:</strong> {deviceToRemove.status}</div>
              <div><strong className="text-slate-400">Hardware ID:</strong> {deviceToRemove.id}</div>
            </div>

            <div className="p-3 bg-red-950/40 rounded-lg border border-red-800/40 text-xs text-red-200">
              <strong>Notice:</strong> Removing this device will NOT delete historical incident evidence or recorded footage associated with it. The unit will be permanently marked as <strong>RETIRED</strong> in the hardware registry.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeviceToRemove(null)}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-[#221719] hover:bg-[#2d1e21] text-slate-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRetire}
                className="min-h-[44px] px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Retirement</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEVICE DETAILS DRAWER/VIEW MODAL */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1713] border border-emerald-800 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
              <div>
                <span className="text-xs text-emerald-400 font-mono font-bold">{selectedDevice.id}</span>
                <h2 className="text-lg font-bold text-white">{selectedDevice.name}</h2>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#132018] rounded-lg border border-emerald-950">
                <span className="text-slate-400 block">Status</span>
                <span className="font-semibold text-emerald-300 text-sm mt-0.5 block">{selectedDevice.status}</span>
              </div>
              <div className="p-3 bg-[#132018] rounded-lg border border-emerald-950">
                <span className="text-slate-400 block">Battery Level</span>
                <span className="font-semibold text-white text-sm mt-0.5 block">{selectedDevice.batteryPercent}% (Solar {selectedDevice.solarChargingRate}W)</span>
              </div>
              <div className="p-3 bg-[#132018] rounded-lg border border-emerald-950">
                <span className="text-slate-400 block">Network Uplink</span>
                <span className="font-semibold text-slate-200 mt-0.5 block">{selectedDevice.networkType} ({selectedDevice.signalStrength}%)</span>
              </div>
              <div className="p-3 bg-[#132018] rounded-lg border border-emerald-950">
                <span className="text-slate-400 block">Firmware</span>
                <span className="font-mono text-slate-300 mt-0.5 block">{selectedDevice.firmwareVersion}</span>
              </div>
            </div>

            <div className="p-3 bg-[#132018] rounded-lg border border-emerald-950 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Location:</span>
                <span className="text-slate-200">{selectedDevice.zone}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Coordinates:</span>
                <span className="text-slate-200 font-mono">{selectedDevice.coordinates.lat.toFixed(4)}°, {selectedDevice.coordinates.lng.toFixed(4)}°</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Uptime:</span>
                <span className="text-emerald-400 font-bold">{selectedDevice.uptimePercent}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Last Heartbeat:</span>
                <span className="text-slate-200">{selectedDevice.lastHeartbeat}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  handleTestDevice(selectedDevice);
                  setSelectedDevice(null);
                }}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-xs font-semibold border border-emerald-600/40 cursor-pointer"
              >
                Send Diagnostic Ping
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const nextStatus: DeviceStatus = selectedDevice.status === 'ONLINE' ? 'MAINTENANCE' : 'ONLINE';
                    onUpdateDeviceStatus(selectedDevice.id, nextStatus);
                    setSelectedDevice({ ...selectedDevice, status: nextStatus });
                  }}
                  className="min-h-[44px] px-3.5 py-2 rounded-lg bg-[#18261e] hover:bg-[#203328] text-slate-200 text-xs cursor-pointer"
                >
                  {selectedDevice.status === 'ONLINE' ? 'Set to Maintenance' : 'Set to Online'}
                </button>
                <button
                  onClick={() => {
                    setDeviceToRemove(selectedDevice);
                    setSelectedDevice(null);
                  }}
                  className="min-h-[44px] px-3.5 py-2 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 text-xs border border-red-800/40 cursor-pointer"
                >
                  Retire Device
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
