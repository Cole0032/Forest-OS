import React, { useState } from 'react';
import {
  Radio,
  Wifi,
  Battery,
  Sun,
  Thermometer,
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Sliders,
  Cpu,
  ShieldAlert,
  Plus,
  Trash2,
  Download,
  Activity,
  ArrowUpDown,
  Settings,
} from 'lucide-react';
import { Device, DeviceStatus, DeviceCategory } from '../types/forestguard';
import { MOCK_DEVICES } from '../services/mockData';
import { AddDeviceModal } from './AddDeviceModal';
import { useTheme } from '../context/ThemeContext';

interface IotNetworkProps {
  devices?: Device[];
  onAddDevice?: (device: Device) => void;
  onUpdateDevice?: (device: Device) => void;
  onDeleteDevice?: (deviceId: string) => void;
}

export const IotNetwork: React.FC<IotNetworkProps> = ({
  devices: propDevices,
  onAddDevice: propOnAddDevice,
  onUpdateDevice: propOnUpdateDevice,
  onDeleteDevice: propOnDeleteDevice,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State fallback if not controlled from parent
  const [localDevices, setLocalDevices] = useState<Device[]>(MOCK_DEVICES);
  const devices = propDevices || localDevices;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'id' | 'battery' | 'uptime' | 'status'>('id');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(devices[0] || null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Statistics
  const total = devices.length;
  const onlineCount = devices.filter((d) => d.status === 'ONLINE').length;
  const lowBatteryCount = devices.filter((d) => d.status === 'LOW_BATTERY').length;
  const offlineCount = devices.filter((d) => d.status === 'OFFLINE').length;
  const tamperCount = devices.filter((d) => d.status === 'TAMPER_ALERT').length;
  const maintenanceCount = devices.filter((d) => d.status === 'MAINTENANCE').length;

  const handleAddDevice = (newDevice: Device) => {
    if (propOnAddDevice) {
      propOnAddDevice(newDevice);
    } else {
      setLocalDevices((prev) => [newDevice, ...prev]);
    }
    setSelectedDevice(newDevice);
    setActionMessage(`Device ${newDevice.id} (${newDevice.name}) successfully registered into mesh telemetry.`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleUpdateStatus = (newStatus: DeviceStatus) => {
    if (!selectedDevice) return;
    const updated: Device = {
      ...selectedDevice,
      status: newStatus,
      lastHeartbeat: 'Just now',
    };
    if (propOnUpdateDevice) {
      propOnUpdateDevice(updated);
    } else {
      setLocalDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    }
    setSelectedDevice(updated);
    setActionMessage(`Device ${updated.id} status modified to ${newStatus}.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleDeleteDevice = () => {
    if (!selectedDevice) return;
    const idToDelete = selectedDevice.id;
    if (propOnDeleteDevice) {
      propOnDeleteDevice(idToDelete);
    } else {
      setLocalDevices((prev) => prev.filter((d) => d.id !== idToDelete));
    }
    const remaining = devices.filter((d) => d.id !== idToDelete);
    setSelectedDevice(remaining[0] || null);
    setIsDeleting(false);
    setActionMessage(`Device ${idToDelete} decommissioned from network.`);
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleDeviceAction = (action: string) => {
    if (!selectedDevice) return;
    setActionMessage(`${action} command dispatched to node ${selectedDevice.id}...`);
    setTimeout(() => {
      setActionMessage(`${action} completed successfully. Telemetry refreshed.`);
      setTimeout(() => setActionMessage(null), 3000);
    }, 1200);
  };

  const handleExportRegistry = () => {
    const csvHeader = 'ID,Name,Type,Zone,Status,Battery,SolarWatts,Signal,Network,Firmware,Lat,Lng\n';
    const csvRows = devices
      .map(
        (d) =>
          `"${d.id}","${d.name}","${d.type}","${d.zone}","${d.status}",${d.batteryPercent},${d.solarChargingRate},${d.signalStrength},"${d.networkType}","${d.firmwareVersion}",${d.coordinates.lat},${d.coordinates.lng}`
      )
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ForestGuard_IoT_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = devices
    .filter((d) => {
      const matchesSearch =
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.zone.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || d.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'battery') return b.batteryPercent - a.batteryPercent;
      if (sortBy === 'uptime') return b.uptimePercent - a.uptimePercent;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return a.id.localeCompare(b.id);
    });

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case 'ONLINE':
        return isDark
          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LOW_BATTERY':
        return isDark
          ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'TAMPER_ALERT':
        return isDark
          ? 'bg-red-950 text-red-300 border-red-700/60 animate-pulse'
          : 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      case 'OFFLINE':
        return isDark
          ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
          : 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MAINTENANCE':
        return isDark
          ? 'bg-blue-950/80 text-blue-300 border-blue-700/60'
          : 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return isDark
          ? 'bg-slate-900 text-slate-300 border-slate-700'
          : 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div
      className={`p-5 space-y-4 max-w-7xl mx-auto transition-colors ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* Header Bar */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-colors ${
          isDark
            ? 'bg-[#0d1612] border-emerald-950/70'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                isDark
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              IoT TELEMETRY
            </span>
            <h1 className="text-base font-bold tracking-tight">
              IoT Edge Sensor Network & Device Management
            </h1>
          </div>
          <p
            className={`text-xs mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {total} Deployed Edge Gateways • Starlink Mesh, LoRaWAN, & Satellite Telemetry
          </p>
        </div>

        {/* Primary Actions: Add Device & Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportRegistry}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#111e17] border-emerald-900/60 text-slate-300 hover:bg-[#16271e]'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Download CSV device registry"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add IoT Device</span>
          </button>
        </div>
      </div>

      {/* Global Status Banner / Message */}
      {actionMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between animate-in fade-in duration-200 ${
            isDark
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs opacity-75 hover:opacity-100 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <span className={`text-[11px] block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ONLINE NODES
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-500">
              {onlineCount}
            </span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400 opacity-70" />
        </div>

        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <span className={`text-[11px] block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              LOW BATTERY
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-500">
              {lowBatteryCount}
            </span>
          </div>
          <Battery className="w-6 h-6 text-amber-400 opacity-70" />
        </div>

        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <span className={`text-[11px] block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              OFFLINE / INACTIVE
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-500">
              {offlineCount}
            </span>
          </div>
          <XCircle className="w-6 h-6 text-rose-400 opacity-70" />
        </div>

        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <span className={`text-[11px] block font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              TAMPER / ANOMALY
            </span>
            <span className="text-2xl font-bold font-mono tabular-nums text-red-500">
              {tamperCount}
            </span>
          </div>
          <ShieldAlert className="w-6 h-6 text-red-500 opacity-70" />
        </div>
      </div>

      {/* Search, Filters, and Sorting Controls */}
      <div
        className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
          isDark
            ? 'bg-[#091510] border-emerald-950'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
          <Search
            className={`w-4 h-4 ${
              isDark ? 'text-emerald-400' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search device ID, name, or forest zone..."
            className={`w-full rounded-lg px-3 py-1.5 text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              isDark
                ? 'bg-[#111a15] border border-emerald-900/60 text-slate-100 placeholder-slate-500'
                : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`rounded-lg px-2.5 py-1.5 text-xs border transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              isDark
                ? 'bg-[#111a15] border-emerald-900/60 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="ALL">All Statuses ({total})</option>
            <option value="ONLINE">Online ({onlineCount})</option>
            <option value="LOW_BATTERY">Low Battery ({lowBatteryCount})</option>
            <option value="OFFLINE">Offline ({offlineCount})</option>
            <option value="TAMPER_ALERT">Tamper Alert ({tamperCount})</option>
            <option value="MAINTENANCE">Maintenance ({maintenanceCount})</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`rounded-lg px-2.5 py-1.5 text-xs border transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              isDark
                ? 'bg-[#111a15] border-emerald-900/60 text-slate-200'
                : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="ALL">All Device Types</option>
            <option value="ACOUSTIC_SENSOR">Acoustic Sensors</option>
            <option value="SMOKE_SENSOR">Smoke Sensors</option>
            <option value="TEMPERATURE_SENSOR">Temperature & Humidity</option>
            <option value="MOTION_SENSOR">Motion Sensors</option>
            <option value="GPS_DEVICE">GPS Trackers</option>
            <option value="THERMAL_CAMERA">Thermal Cameras</option>
            <option value="AI_CAMERA">AI Optical Cameras</option>
            <option value="EDGE_AI_DEVICE">Edge AI Gateways</option>
            <option value="ENVIRONMENTAL_SENSOR">Environmental Multi-Sensors</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`rounded-lg px-2.5 py-1.5 text-xs border transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                isDark
                  ? 'bg-[#111a15] border-emerald-900/60 text-slate-200'
                  : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value="id">Sort: Device ID</option>
              <option value="battery">Sort: Battery Level</option>
              <option value="uptime">Sort: Uptime %</option>
              <option value="status">Sort: Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Devices Table (Left) + Selected Inspector & Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table View */}
        <div
          className={`lg:col-span-2 rounded-xl border overflow-hidden flex flex-col transition-colors ${
            isDark
              ? 'bg-[#091510] border-emerald-900/60'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="px-4 py-3 border-b flex items-center justify-between text-xs font-semibold">
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              Telemetry Nodes ({filtered.length} matching)
            </span>
            <span
              className={`text-[11px] font-mono tabular-nums ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Showing active devices
            </span>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead
                className={`sticky top-0 z-10 border-b text-[11px] font-semibold uppercase tracking-wider ${
                  isDark
                    ? 'bg-[#0c1a14] border-emerald-950 text-slate-400'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <tr>
                  <th className="p-3">Device ID</th>
                  <th className="p-3">Name & Type</th>
                  <th className="p-3">Forest Zone</th>
                  <th className="p-3">Battery</th>
                  <th className="p-3">Signal</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y text-xs ${
                  isDark
                    ? 'divide-emerald-950/60 text-slate-300'
                    : 'divide-slate-100 text-slate-700'
                }`}
              >
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No devices found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.slice(0, 50).map((dev) => {
                    const isSelected = selectedDevice?.id === dev.id;
                    return (
                      <tr
                        key={dev.id}
                        onClick={() => setSelectedDevice(dev)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? isDark
                              ? 'bg-emerald-950/80 text-emerald-200'
                              : 'bg-emerald-50 text-emerald-900 font-medium'
                            : isDark
                            ? 'hover:bg-[#111e17]'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-3 font-mono font-bold">{dev.id}</td>
                        <td className="p-3">
                          <div className="font-medium truncate max-w-[140px]">{dev.name}</div>
                          <div
                            className={`text-[10px] ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            {dev.type.replace(/_/g, ' ')}
                          </div>
                        </td>
                        <td className="p-3 text-[11px] truncate max-w-[140px]">{dev.zone}</td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 font-mono tabular-nums text-[11px]">
                            <Battery
                              className={`w-3.5 h-3.5 ${
                                dev.batteryPercent > 50
                                  ? 'text-emerald-500'
                                  : dev.batteryPercent > 20
                                  ? 'text-amber-500'
                                  : 'text-rose-500'
                              }`}
                            />
                            {dev.batteryPercent}%
                          </span>
                        </td>
                        <td className="p-3 text-[11px]">
                          <span className="font-mono tabular-nums">{dev.signalStrength}%</span>{' '}
                          <span
                            className={`text-[10px] ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            ({dev.networkType})
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold inline-block ${getStatusBadge(
                              dev.status
                            )}`}
                          >
                            {dev.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Device Inspector & Management Panel */}
        <div className="space-y-3">
          {selectedDevice ? (
            <div
              className={`p-4 rounded-xl border space-y-4 transition-colors ${
                isDark
                  ? 'bg-[#091510] border-emerald-900/60 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}
            >
              {/* Header */}
              <div
                className={`flex items-start justify-between pb-3 border-b ${
                  isDark ? 'border-emerald-950' : 'border-slate-200'
                }`}
              >
                <div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider block ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    DEVICE INSPECTOR
                  </span>
                  <h3 className="font-bold text-sm tracking-tight">{selectedDevice.name}</h3>
                  <span
                    className={`text-[11px] font-mono ${
                      isDark ? 'text-emerald-400' : 'text-emerald-700'
                    }`}
                  >
                    ID: {selectedDevice.id}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded border uppercase font-bold ${getStatusBadge(
                    selectedDevice.status
                  )}`}
                >
                  {selectedDevice.status}
                </span>
              </div>

              {/* Current Telemetry Reading */}
              <div
                className={`p-3 rounded-lg border ${
                  isDark
                    ? 'bg-[#06100b] border-emerald-950'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider block ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Current Telemetry Feed:
                </span>
                <span className="font-semibold text-xs mt-1 block">
                  {selectedDevice.currentReading || 'Normal Range Operational'}
                </span>
                <span
                  className={`text-[10px] block mt-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Heartbeat: {selectedDevice.lastHeartbeat}
                </span>
              </div>

              {/* Hardware Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  className={`p-2.5 rounded border ${
                    isDark
                      ? 'bg-[#0b1812] border-emerald-950'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className={`text-[10px] block ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    SOLAR HARVEST:
                  </span>
                  <span className="font-mono tabular-nums font-bold text-amber-500">
                    {selectedDevice.solarChargingRate} W
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded border ${
                    isDark
                      ? 'bg-[#0b1812] border-emerald-950'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className={`text-[10px] block ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    TEMPERATURE:
                  </span>
                  <span className="font-mono tabular-nums font-bold text-blue-500">
                    {selectedDevice.temperatureC} °C
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded border ${
                    isDark
                      ? 'bg-[#0b1812] border-emerald-950'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className={`text-[10px] block ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    FLASH STORAGE:
                  </span>
                  <span className="font-mono tabular-nums font-bold">
                    {selectedDevice.storageUsedPercent}% used
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded border ${
                    isDark
                      ? 'bg-[#0b1812] border-emerald-950'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span
                    className={`text-[10px] block ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    FIRMWARE:
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-emerald-500">
                    {selectedDevice.firmwareVersion}
                  </span>
                </div>
              </div>

              {/* Geographical Coordinates */}
              <div
                className={`p-2.5 rounded border text-xs ${
                  isDark
                    ? 'bg-[#0b1812] border-emerald-950 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold">Zone: {selectedDevice.zone}</span>
                </div>
                <div className="font-mono text-[10px] text-slate-400 mt-1">
                  GPS: [{selectedDevice.coordinates.lat.toFixed(4)},{' '}
                  {selectedDevice.coordinates.lng.toFixed(4)}] • Mesh: {selectedDevice.networkType}
                </div>
              </div>

              {/* Status Switcher & Management */}
              <div
                className={`space-y-2 pt-2 border-t ${
                  isDark ? 'border-emerald-950' : 'border-slate-200'
                }`}
              >
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider block ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Operational State Management:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    onClick={() => handleUpdateStatus('ONLINE')}
                    className={`py-1 px-1.5 rounded border text-center font-semibold transition-colors ${
                      selectedDevice.status === 'ONLINE'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : isDark
                        ? 'bg-[#111e17] border-emerald-900/60 text-slate-300 hover:border-emerald-500'
                        : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Online
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('MAINTENANCE')}
                    className={`py-1 px-1.5 rounded border text-center font-semibold transition-colors ${
                      selectedDevice.status === 'MAINTENANCE'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isDark
                        ? 'bg-[#111e17] border-emerald-900/60 text-slate-300 hover:border-blue-500'
                        : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Maintain
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('OFFLINE')}
                    className={`py-1 px-1.5 rounded border text-center font-semibold transition-colors ${
                      selectedDevice.status === 'OFFLINE'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : isDark
                        ? 'bg-[#111e17] border-emerald-900/60 text-slate-300 hover:border-rose-500'
                        : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Offline
                  </button>
                </div>
              </div>

              {/* Remote Diagnostics Controls */}
              <div
                className={`space-y-2 pt-2 border-t ${
                  isDark ? 'border-emerald-950' : 'border-slate-200'
                }`}
              >
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider block ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Remote Diagnostics:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDeviceAction('PING DIAGNOSTIC')}
                    className={`py-1.5 px-2 rounded border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      isDark
                        ? 'bg-[#111e17] hover:bg-emerald-950 text-emerald-300 border-emerald-800/60'
                        : 'bg-slate-50 hover:bg-emerald-50 text-emerald-700 border-slate-300'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Ping Test
                  </button>
                  <button
                    onClick={() => handleDeviceAction('REBOOT EDGE NODE')}
                    className={`py-1.5 px-2 rounded border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      isDark
                        ? 'bg-[#111e17] hover:bg-amber-950 text-amber-300 border-amber-800/60'
                        : 'bg-slate-50 hover:bg-amber-50 text-amber-700 border-slate-300'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reboot Node
                  </button>
                </div>
              </div>

              {/* Decommission / Delete Device */}
              <div
                className={`pt-2 border-t ${
                  isDark ? 'border-emerald-950' : 'border-slate-200'
                }`}
              >
                {isDeleting ? (
                  <div
                    className={`p-3 rounded-lg border text-xs space-y-2 ${
                      isDark
                        ? 'bg-red-950/40 border-red-800 text-red-200'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <p className="font-semibold">Confirm deprovisioning {selectedDevice.id}?</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDeleteDevice}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-xs"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setIsDeleting(false)}
                        className={`px-3 py-1 rounded font-semibold text-xs border ${
                          isDark
                            ? 'bg-[#111e17] border-slate-700 text-slate-300'
                            : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsDeleting(true)}
                    className={`w-full py-1.5 px-2 rounded border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      isDark
                        ? 'bg-rose-950/20 text-rose-400 border-rose-900/50 hover:bg-rose-950/50'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Decommission & Remove Node
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              className={`p-8 text-center text-xs rounded-xl border ${
                isDark
                  ? 'bg-[#091510] border-emerald-950 text-slate-500'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              Select a device from the table to view live hardware telemetry and controls.
            </div>
          )}
        </div>
      </div>

      {/* Add Device Modal */}
      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDevice={handleAddDevice}
        existingDeviceCount={devices.length}
      />
    </div>
  );
};
