import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  Search,
  Filter,
  Plus,
  History,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  Archive,
  Trash2,
  FileCheck,
  ChevronDown,
  ArrowRight,
  UserCheck,
  AlertTriangle,
  X,
  Calendar,
} from 'lucide-react';
import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from '../types/forestguard';
import { FOREST_ZONES } from '../services/mockData';

interface IncidentManagementProps {
  incidents: Incident[];
  initialTab?: 'active' | 'history';
  onSelectIncident: (incident: Incident) => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus, notes?: string) => void;
  onAddIncident?: (newIncident: Incident) => void;
  onArchiveIncident?: (incidentId: string) => void;
  onDeleteIncident?: (incidentId: string) => void;
}

export const IncidentManagement: React.FC<IncidentManagementProps> = ({
  incidents,
  initialTab = 'active',
  onSelectIncident,
  onUpdateStatus,
  onAddIncident,
  onArchiveIncident,
  onDeleteIncident,
}) => {
  const [currentTab, setCurrentTab] = useState<'active' | 'history'>(initialTab);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [incidentToArchive, setIncidentToArchive] = useState<Incident | null>(null);
  const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null);

  // New Incident Form State
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<IncidentType>('ILLEGAL_DEFORESTATION');
  const [formLocation, setFormLocation] = useState(FOREST_ZONES[0].name + ' - Sector 4');
  const [formZone, setFormZone] = useState(FOREST_ZONES[0].id);
  const [formSeverity, setFormSeverity] = useState<IncidentSeverity>('HIGH_PRIORITY');
  const [formDescription, setFormDescription] = useState('');
  const [formSource, setFormSource] = useState('Acoustic Triangulation + Optical CCTV');
  const [formOfficer, setFormOfficer] = useState('Commander Vance (FG-0941)');
  const [formVehicle, setFormVehicle] = useState('');
  const [formPermit, setFormPermit] = useState('');

  // Tab Filtering: Active vs History
  const displayedIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Tab split: Active incidents are those not yet closed/resolved
      if (currentTab === 'active') {
        if (inc.status === 'RESOLVED' || inc.status === 'CLOSED' || inc.status === 'FALSE_POSITIVE') {
          return false;
        }
      } else {
        // In History tab, show all past audited records or resolved/verified
        // (can show all or specifically resolved/closed)
      }

      // Search match
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.locationName.toLowerCase().includes(q) ||
        (inc.assignedInvestigator && inc.assignedInvestigator.toLowerCase().includes(q));

      // Severity match
      const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;

      // Status match
      const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

      // Zone match
      const matchesZone = zoneFilter === 'ALL' || inc.zoneId === zoneFilter;

      // Type match
      const matchesType = typeFilter === 'ALL' || inc.type === typeFilter;

      return matchesSearch && matchesSeverity && matchesStatus && matchesZone && matchesType;
    });
  }, [incidents, currentTab, searchQuery, severityFilter, statusFilter, zoneFilter, typeFilter]);

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const nextIdNum = (incidents.length + 185).toString().padStart(6, '0');
    const newId = `ENV-2026-${nextIdNum}`;

    const newInc: Incident = {
      id: newId,
      title: formTitle,
      type: formType,
      severity: formSeverity,
      status: 'DETECTED',
      locationName: formLocation,
      zoneId: formZone,
      coordinates: FOREST_ZONES[0].center,
      timestamp: new Date().toISOString(),
      detectionSources: [formSource],
      aiConfidence: 88,
      riskLevel: formSeverity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      aiExplanation: {
        whatDetected: formDescription || formTitle,
        whereDetected: formLocation,
        whenDetected: 'Just now',
        source: formSource,
        aiConfidence: 88,
        supportingSignals: ['Sworn officer initial intake', formSource],
        contradictingSignals: [],
        whyFlagged: [
          'Direct field or sensor telemetry intake logged by officer',
          'Located in protected environmental polygon',
        ],
        whatHumanReviewShouldCheck: [
          'Verify sensor timestamps and ground patrol dispatch status',
          'Cross-reference SISFLORA timber transport register',
        ],
        disclaimer: 'Logged under sworn authority according to National Environmental Forestry Code.',
      },
      relatedDeviceIds: [],
      relatedCameraIds: [],
      relatedVehiclePlate: formVehicle || undefined,
      relatedPermitId: formPermit || undefined,
      assignedInvestigator: formOfficer,
      evidenceIds: [],
      timeline: [
        {
          time: new Date().toISOString().substring(11, 19) + ' UTC',
          action: 'Incident Created by Officer',
          actor: formOfficer,
          details: formDescription || 'Field incident report submitted.',
        },
      ],
    };

    if (onAddIncident) {
      onAddIncident(newInc);
    }
    setIsAddModalOpen(false);
    // Reset form
    setFormTitle('');
    setFormDescription('');
  };

  const handleConfirmArchive = () => {
    if (incidentToArchive) {
      if (onArchiveIncident) {
        onArchiveIncident(incidentToArchive.id);
      } else {
        onUpdateStatus(incidentToArchive.id, 'CLOSED', 'Archived for compliance retention.');
      }
      setIncidentToArchive(null);
    }
  };

  const handleConfirmDelete = () => {
    if (incidentToDelete) {
      if (onDeleteIncident) {
        onDeleteIncident(incidentToDelete.id);
      }
      setIncidentToDelete(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-950">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
            Incident Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Incident Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Verify, investigate, and dispatch interdiction resources for environmental violations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="min-h-[44px] px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>+ Add Incident</span>
        </button>
      </div>

      {/* Primary Section Switcher: Active Incidents vs Incident History */}
      <div className="flex items-center gap-2 border-b border-emerald-950 pb-2">
        <button
          onClick={() => setCurrentTab('active')}
          className={`min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            currentTab === 'active'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-[#132018]'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Active Incidents</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/30 font-mono">
            {incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED' && i.status !== 'FALSE_POSITIVE').length}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('history')}
          className={`min-h-[44px] px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            currentTab === 'history'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-[#132018]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Incident History</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/30 font-mono">
            {incidents.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0d1611] border border-emerald-950 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-sm">
          {/* Search box */}
          <div className="flex items-center gap-2.5 flex-1 max-w-md bg-[#131f18] px-3.5 py-2 rounded-lg border border-emerald-900/60 focus-within:border-emerald-500">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by incident ID, title, zone, officer..."
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-sm"
            />
          </div>

          {/* Quick Select Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Severity */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="min-h-[38px] bg-[#131f18] border border-emerald-900/60 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH_PRIORITY">High Priority</option>
              <option value="SUSPICIOUS">Suspicious</option>
              <option value="INFORMATIONAL">Informational</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-[38px] bg-[#131f18] border border-emerald-900/60 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="DETECTED">Detected</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="INVESTIGATION">Investigation</option>
              <option value="RESOLVED">Resolved</option>
              <option value="FALSE_POSITIVE">False Positive</option>
            </select>

            {/* Zone */}
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="min-h-[38px] bg-[#131f18] border border-emerald-900/60 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Monitored Zones</option>
              {FOREST_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name.split(' ')[0]} Sector
                </option>
              ))}
            </select>

            {(searchQuery || severityFilter !== 'ALL' || statusFilter !== 'ALL' || zoneFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSeverityFilter('ALL');
                  setStatusFilter('ALL');
                  setZoneFilter('ALL');
                  setTypeFilter('ALL');
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-xl bg-[#0d1611] border border-emerald-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#121c16] text-slate-300 font-semibold text-xs uppercase tracking-wider border-b border-emerald-950">
              <tr>
                <th className="p-3.5 pl-4">Incident ID</th>
                <th className="p-3.5">Title & Location</th>
                <th className="p-3.5">Date Detected</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">AI Confidence</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/60 text-slate-200">
              {displayedIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-400">
                    {currentTab === 'active'
                      ? 'All monitored areas are currently clear of active unreviewed threats.'
                      : 'No incident records match the selected history filters.'}
                  </td>
                </tr>
              ) : (
                displayedIncidents.map((inc) => {
                  const isCritical = inc.severity === 'CRITICAL';
                  const isHigh = inc.severity === 'HIGH_PRIORITY';

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className="hover:bg-[#132219] transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 pl-4 font-mono font-semibold text-xs text-emerald-400">
                        {inc.id}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white">{inc.title}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{inc.locationName}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-xs text-slate-300 font-mono">
                        {inc.timestamp.substring(0, 10)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`text-xs font-semibold ${
                            isCritical
                              ? 'text-red-400'
                              : isHigh
                              ? 'text-amber-400'
                              : 'text-yellow-400'
                          }`}
                        >
                          {inc.severity.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-emerald-400 font-semibold text-xs">
                        {inc.aiConfidence}%
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded ${
                            inc.status === 'VERIFIED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : inc.status === 'RESOLVED'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {inc.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 pr-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onSelectIncident(inc)}
                            className="min-h-[36px] px-3 py-1 text-xs rounded bg-[#17251e] hover:bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-medium cursor-pointer"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => setIncidentToArchive(inc)}
                            className="min-h-[36px] px-2.5 py-1 text-xs rounded bg-[#17251e] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 cursor-pointer"
                            title="Archive Incident Record"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setIncidentToDelete(inc)}
                            className="min-h-[36px] px-2 py-1 text-xs rounded bg-[#1c1214] hover:bg-red-950 text-red-400 hover:text-red-300 border border-red-900/40 cursor-pointer"
                            title="Delete Incident Record"
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
      </div>

      {/* + ADD INCIDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1713] border border-emerald-800 rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-emerald-950 bg-[#121c17] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Create New Incident</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Log a verified field observation or telemetry alert into the official register.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Incident Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Unauthorized Mechanical Clearing at Ridge Border"
                  className="w-full bg-[#131f18] border border-emerald-950 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Incident Type *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as IncidentType)}
                    className="w-full bg-[#131f18] border border-emerald-950 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ILLEGAL_DEFORESTATION">Illegal Deforestation</option>
                    <option value="ACOUSTIC_CHAINSAW_ACTIVITY">Acoustic Chainsaw Activity</option>
                    <option value="SUSPICIOUS_TIMBER_TRANSPORT">Suspicious Timber Transport</option>
                    <option value="UNAUTHORIZED_ROAD_CONSTRUCTION">Unauthorized Logging Road</option>
                    <option value="HEAVY_MACHINERY_ENCROACHMENT">Heavy Machinery Incursion</option>
                    <option value="FIRE_SMOKE_ANOMALY">Fire / Thermal Anomaly</option>
                    <option value="WILDLIFE_HABITAT_THREAT">Wildlife Habitat Disturbance</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Severity *
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as IncidentSeverity)}
                    className="w-full bg-[#131f18] border border-emerald-950 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CRITICAL">Critical (Immediate Interdiction)</option>
                    <option value="HIGH_PRIORITY">High Priority</option>
                    <option value="SUSPICIOUS">Suspicious</option>
                    <option value="INFORMATIONAL">Informational</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Forest Zone *
                  </label>
                  <select
                    value={formZone}
                    onChange={(e) => {
                      setFormZone(e.target.value);
                      const z = FOREST_ZONES.find((fz) => fz.id === e.target.value);
                      if (z) setFormLocation(`${z.name} - Sector 4`);
                    }}
                    className="w-full bg-[#131f18] border border-emerald-950 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {FOREST_ZONES.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Specific Location Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-[#131f18] border border-emerald-950 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Primary Detection Source *
                </label>
                <input
                  type="text"
                  required
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  placeholder="e.g. Ranger Patrol Alpha-01, Acoustic Node A-204, or Sentinel-2"
                  className="w-full bg-[#131f18] border border-emerald-950 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description & Officer Observations *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detail observed machinery, audio harmonics, tree species, or trail markers..."
                  className="w-full bg-[#131f18] border border-emerald-950 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Vehicle License Plate (Optional)
                  </label>
                  <input
                    type="text"
                    value={formVehicle}
                    onChange={(e) => setFormVehicle(e.target.value)}
                    placeholder="e.g. BRA-4912"
                    className="w-full bg-[#131f18] border border-emerald-950 rounded-lg p-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Related Concession / Permit (Optional)
                  </label>
                  <input
                    type="text"
                    value={formPermit}
                    onChange={(e) => setFormPermit(e.target.value)}
                    placeholder="e.g. PMT-AMZ-2026-081"
                    className="w-full bg-[#131f18] border border-emerald-950 rounded-lg p-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-emerald-950 bg-[#121c17] flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-[#18261e] hover:bg-[#203328] text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg cursor-pointer"
                >
                  Create Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARCHIVE CONFIRMATION MODAL */}
      {incidentToArchive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121a15] border border-emerald-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <Archive className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-white">Archive Incident Record?</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Archiving <strong>{incidentToArchive.id}</strong> ({incidentToArchive.title}) stores it in the immutable compliance archive with all associated chain of custody records and evidence hashes intact.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIncidentToArchive(null)}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-[#18261e] hover:bg-[#203328] text-slate-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmArchive}
                className="min-h-[44px] px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer shadow-lg"
              >
                Confirm Archival
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {incidentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#170e11] border border-red-900 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-white">Delete Incident {incidentToDelete.id}?</h2>
            </div>
            <div className="text-xs text-red-200 bg-red-950/40 p-3 rounded-lg border border-red-900/50">
              Warning: Deleting an incident requires verified administrative clearance. Any verified evidence items will remain sealed in the legal evidence vault.
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIncidentToDelete(null)}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-[#221619] hover:bg-[#2d1e22] text-slate-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="min-h-[44px] px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs cursor-pointer shadow-lg"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
