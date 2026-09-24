import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CommandCenter } from './components/CommandCenter';
import { GisMap } from './components/GisMap';
import { LiveMonitoring } from './components/LiveMonitoring';
import { AcousticAi } from './components/AcousticAi';
import { IotNetwork } from './components/IotNetwork';
import { SatelliteAnalysis } from './components/SatelliteAnalysis';
import { TimberMonitoring } from './components/TimberMonitoring';
import { IncidentManagement } from './components/IncidentManagement';
import { CaseManagement } from './components/CaseManagement';
import { EvidenceVault } from './components/EvidenceVault';
import { LegalRag } from './components/LegalRag';
import { FieldOperations } from './components/FieldOperations';
import { AnalyticsReports } from './components/AnalyticsReports';
import { Administration } from './components/Administration';
import { SystemAudit } from './components/SystemAudit';
import { IncidentDrawer } from './components/IncidentDrawer';
import { GoogleDriveExportModal } from './components/GoogleDriveExportModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';

import {
  Incident,
  IncidentStatus,
  UserProfile,
  UserRole,
  CameraFeed,
  Device,
  FieldPatrolTeam,
} from './types/forestguard';
import {
  CURRENT_USER,
  MOCK_INCIDENTS,
  MOCK_CAMERAS,
  MOCK_DEVICES,
  MOCK_FIELD_TEAMS,
} from './services/mockData';

function AppContent() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [activeModule, setActiveModule] = useState<string>('command-center');
  const [selectedZone, setSelectedZone] = useState<string>('All Monitored Zones (184,500 ha)');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [cameras] = useState<CameraFeed[]>(MOCK_CAMERAS);
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [fieldTeams] = useState<FieldPatrolTeam[]>(MOCK_FIELD_TEAMS);

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [targetIncidentForDrive, setTargetIncidentForDrive] = useState<Incident | null>(null);

  // Role Switcher Handler
  const handleSelectRole = (newRole: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role: newRole,
      badgeNumber:
        newRole === 'SUPER_ADMIN'
          ? 'FG-0941'
          : newRole === 'INVESTIGATOR'
          ? 'FG-INV-44'
          : newRole === 'FIELD_OFFICER'
          ? 'FG-RNG-012'
          : newRole === 'LEGAL_OFFICER'
          ? 'FG-LEG-08'
          : 'FG-OFF-20',
    }));
  };

  // Device Management Handlers
  const handleAddDevice = (newDevice: Device) => {
    setDevices((prev) => [newDevice, ...prev]);
  };

  const handleUpdateDevice = (updatedDevice: Device) => {
    setDevices((prev) => prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)));
  };

  const handleDeleteDevice = (deviceId: string) => {
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
  };

  // Human Verification Status Update (consequential decision by authorized officer)
  const handleUpdateIncidentStatus = (
    incidentId: string,
    newStatus: IncidentStatus,
    notes?: string
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const updatedTimeline = [
            ...inc.timeline,
            {
              time: new Date().toISOString().substring(11, 19) + ' UTC',
              action: `Human verification status updated to ${newStatus}`,
              actor: `${currentUser.name} (${currentUser.role})`,
              details: notes || 'Sworn officer verification action executed.',
            },
          ];

          return {
            ...inc,
            status: newStatus,
            reviewerNotes: notes || inc.reviewerNotes,
            verifiedBy: `${currentUser.name} (${currentUser.badgeNumber})`,
            verifiedAt: new Date().toISOString(),
            timeline: updatedTimeline,
          };
        }
        return inc;
      })
    );

    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              reviewerNotes: notes || prev.reviewerNotes,
              verifiedBy: `${currentUser.name} (${currentUser.badgeNumber})`,
              verifiedAt: new Date().toISOString(),
            }
          : null
      );
    }
  };

  const handleOpenDriveModal = (incident?: Incident) => {
    setTargetIncidentForDrive(incident || selectedIncident || null);
    setIsDriveModalOpen(true);
  };

  const unreadAlertCount = incidents.filter(
    (i) => i.status === 'DETECTED' || i.status === 'UNDER_REVIEW'
  ).length;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark
          ? 'bg-[#060a08] text-slate-100 selection:bg-emerald-500 selection:text-black'
          : 'bg-[#f4f6f5] text-slate-900 selection:bg-emerald-200 selection:text-emerald-950'
      }`}
    >
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSelectRole={handleSelectRole}
        selectedZone={selectedZone}
        onSelectZone={setSelectedZone}
        globalSearch={globalSearch}
        onSearchChange={setGlobalSearch}
        onOpenDriveModal={() => handleOpenDriveModal()}
        unreadAlertCount={unreadAlertCount}
        onNavigateToModule={setActiveModule}
      />

      {/* Main Layout: Left Sidebar + Central Stage */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Left Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          currentUserRole={currentUser.role}
        />

        {/* Dynamic Center Module Stage */}
        <main
          className={`flex-1 overflow-y-auto relative transition-colors duration-200 ${
            isDark ? 'bg-[#070c09]' : 'bg-[#fafbfb]'
          }`}
        >
          {activeModule === 'command-center' && (
            <CommandCenter
              incidents={incidents}
              cameras={cameras}
              devices={devices}
              fieldTeams={fieldTeams}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              onNavigateToModule={setActiveModule}
            />
          )}

          {activeModule === 'live-monitoring' && (
            <LiveMonitoring cameras={cameras} />
          )}

          {activeModule === 'forest-gis' && (
            <div className="p-2 sm:p-3 h-[calc(100vh-4.5rem)]">
              <GisMap
                incidents={incidents}
                cameras={cameras}
                devices={devices}
                fieldTeams={fieldTeams}
                selectedIncidentId={selectedIncident?.id}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
              />
            </div>
          )}

          {activeModule === 'ai-detection' && <AcousticAi />}

          {activeModule === 'iot-network' && (
            <IotNetwork
              devices={devices}
              onAddDevice={handleAddDevice}
              onUpdateDevice={handleUpdateDevice}
              onDeleteDevice={handleDeleteDevice}
            />
          )}

          {activeModule === 'satellite' && <SatelliteAnalysis />}

          {activeModule === 'timber' && <TimberMonitoring />}

          {activeModule === 'incidents' && (
            <IncidentManagement
              incidents={incidents}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              onUpdateStatus={handleUpdateIncidentStatus}
            />
          )}

          {activeModule === 'cases' && <CaseManagement />}

          {activeModule === 'evidence' && <EvidenceVault />}

          {activeModule === 'legal-rag' && <LegalRag />}

          {activeModule === 'field-ops' && <FieldOperations />}

          {activeModule === 'analytics' && <AnalyticsReports />}

          {activeModule === 'administration' && (
            <Administration
              currentUser={currentUser}
              onSelectRole={handleSelectRole}
            />
          )}

          {activeModule === 'system-audit' && <SystemAudit />}
        </main>
      </div>

      {/* Side Incident Drawer */}
      <IncidentDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdateStatus={handleUpdateIncidentStatus}
        onOpenVideoAnalysis={() => {
          setSelectedIncident(null);
          setActiveModule('live-monitoring');
        }}
        onOpenGoogleDriveModal={() => handleOpenDriveModal(selectedIncident || undefined)}
      />

      {/* Google Drive Export Modal */}
      <GoogleDriveExportModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        targetIncident={targetIncidentForDrive}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
