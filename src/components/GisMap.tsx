import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  X,
  Plus,
  Minus,
  Compass,
  Layers,
  Maximize2,
  Minimize2,
  MapPin,
  Flame,
  AlertTriangle,
  Radio,
  Camera,
  Droplets,
  Trees,
  Factory,
  FileText,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sliders,
  Info,
  ShieldCheck,
  PawPrint,
  Bird,
  Wind,
  Thermometer,
  ExternalLink,
  Filter,
  Map as MapIcon,
  Globe,
  Mountain,
  Navigation,
  Activity,
  Calendar,
  Clock,
  Sparkles,
  Play,
  Pause,
} from 'lucide-react';
import {
  Incident,
  CameraFeed,
  Device,
  FieldPatrolTeam,
  ForestRegion,
  SupplyChainFacility,
  BiodiversityRecord,
  ComplianceRecord,
  TargetUserPerspective,
  EnvironmentalRiskDomain,
  IncidentSeverity,
} from '../types/forestguard';
import {
  FOREST_ZONES,
  MOCK_FOREST_REGIONS,
  MOCK_SUPPLIERS_FACILITIES,
  MOCK_BIODIVERSITY_RECORDS,
  MOCK_COMPLIANCE_RECORDS,
} from '../services/mockData';
import { useTheme } from '../context/ThemeContext';

interface GisMapProps {
  incidents: Incident[];
  cameras: CameraFeed[];
  devices: Device[];
  fieldTeams: FieldPatrolTeam[];
  selectedIncidentId?: string | null;
  onSelectIncident: (incident: Incident) => void;
  onSelectCamera?: (camera: CameraFeed) => void;
  onSelectDevice?: (device: Device) => void;
  onTriggerMapsGrounding?: (locationName: string, lat: number, lng: number) => void;
  standaloneFullscreen?: boolean;
}

export type BaseMapStyle = 'map' | 'satellite' | 'terrain';

export interface MarkerCluster {
  id: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  count: number;
  highestSeverity: IncidentSeverity;
  items: Array<{
    type: 'incident' | 'camera' | 'sensor' | 'biodiversity' | 'facility';
    data: any;
  }>;
}

export const GisMap: React.FC<GisMapProps> = ({
  incidents,
  cameras,
  devices,
  fieldTeams,
  selectedIncidentId,
  onSelectIncident,
  onSelectCamera,
  onSelectDevice,
  onTriggerMapsGrounding,
  standaloneFullscreen = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Map viewport transform (standard GIS 1000 x 700 virtual canvas)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(standaloneFullscreen);

  // Basemap style: Map (default clean vector), Satellite (earth imagery), Terrain (topography)
  const [baseMapStyle, setBaseMapStyle] = useState<BaseMapStyle>('map');

  // Target User Perspective Lens
  const [perspectiveLens, setPerspectiveLens] = useState<TargetUserPerspective | 'ALL'>('ALL');

  // Global Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // Floating Popovers & Drawers
  const [showLayersPopover, setShowLayersPopover] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [showHeatmapControls, setShowHeatmapControls] = useState<boolean>(false);

  // Selected interactive entities
  const [activeIncidentCard, setActiveIncidentCard] = useState<Incident | null>(null);
  const [activeLocationCard, setActiveLocationCard] = useState<ForestRegion | null>(null);
  const [activeFacilityCard, setActiveFacilityCard] = useState<SupplyChainFacility | null>(null);
  const [activeBioCard, setActiveBioCard] = useState<BiodiversityRecord | null>(null);

  // Progressive Disclosure Layers State
  const [layers, setLayers] = useState({
    // Environmental Intelligence
    forestCover: true,
    deforestation: true,
    wildfire: true,
    biodiversity: true,
    water: true,
    soil: false,
    climate: true,
    carbon: false,
    ecosystemDegradation: true,

    // Operations
    cameras: true,
    sensors: true,
    gpsTrackers: true,
    activeAlerts: true,
    incidents: true,
    fieldOperations: true,

    // Risk Domains
    environmentalRisk: true,
    climateExposure: true,
    supplyChainRisk: true,
    complianceRisk: true,

    // Heatmap Overlay
    incidentHeatmap: true,
    clustering: true,
  });

  // Heatmap Parameters
  const [heatmapRadius, setHeatmapRadius] = useState<number>(45);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.65);
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Coordinate projection boundaries (Amazon / South-East Asia test biome coordinates)
  const minLat = -3.28;
  const maxLat = -3.02;
  const minLng = -60.22;
  const maxLng = -59.84;

  const projectToMap = useCallback((lat: number, lng: number): { x: number; y: number } => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 1000;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 700;
    return { x, y };
  }, [minLat, maxLat, minLng, maxLng]);

  const unprojectFromMap = useCallback((x: number, y: number): { lat: number; lng: number } => {
    const lng = minLng + (x / 1000) * (maxLng - minLng);
    const lat = maxLat - (y / 700) * (maxLat - minLat);
    return { lat, lng };
  }, [minLat, maxLat, minLng, maxLng]);

  // Keep activeIncidentCard in sync when selectedIncidentId changes from outside
  useEffect(() => {
    if (selectedIncidentId) {
      const match = incidents.find((i) => i.id === selectedIncidentId);
      if (match) {
        setActiveIncidentCard(match);
        const pt = projectToMap(match.coordinates.lat, match.coordinates.lng);
        setPan({ x: 500 - pt.x * 1.5, y: 350 - pt.y * 1.5 });
        setZoom(1.5);
      }
    }
  }, [selectedIncidentId, incidents, projectToMap]);

  // Handle Perspective Lens Switch: automatically prioritizes relevant layers
  const handleSelectPerspective = (lens: TargetUserPerspective | 'ALL') => {
    setPerspectiveLens(lens);
    if (lens === 'CORPORATIONS') {
      setLayers((prev) => ({
        ...prev,
        supplyChainRisk: true,
        complianceRisk: true,
        deforestation: true,
        climateExposure: true,
        fieldOperations: false,
      }));
    } else if (lens === 'FINANCIAL_INSTITUTIONS') {
      setLayers((prev) => ({
        ...prev,
        environmentalRisk: true,
        climateExposure: true,
        biodiversity: true,
        carbon: true,
        cameras: false,
      }));
    } else if (lens === 'INSURERS') {
      setLayers((prev) => ({
        ...prev,
        wildfire: true,
        water: true,
        climate: true,
        climateExposure: true,
        incidentHeatmap: true,
      }));
    } else if (lens === 'GOVERNMENTS') {
      setLayers((prev) => ({
        ...prev,
        complianceRisk: true,
        incidents: true,
        fieldOperations: true,
        forestCover: true,
        deforestation: true,
      }));
    } else if (lens === 'CONSERVATION') {
      setLayers((prev) => ({
        ...prev,
        biodiversity: true,
        ecosystemDegradation: true,
        forestCover: true,
        cameras: true,
        supplyChainRisk: false,
      }));
    }
  };

  // Smooth Pan & Zoom Controls
  const handleZoom = (delta: number, clientX?: number, clientY?: number) => {
    setZoom((prevZoom) => {
      const newZoom = Math.min(3.8, Math.max(0.65, Number((prevZoom + delta).toFixed(2))));
      // If mouse coordinates provided, zoom toward mouse center
      if (clientX !== undefined && clientY !== undefined && mapContainerRef.current) {
        const rect = mapContainerRef.current.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        const scaleChange = newZoom / prevZoom;
        setPan((prevPan) => ({
          x: mouseX - (mouseX - prevPan.x) * scaleChange,
          y: mouseY - (mouseY - prevPan.y) * scaleChange,
        }));
      }
      return newZoom;
    });
  };

  const handleCenterCurrentLocation = () => {
    // Smooth reset to Sector A17 / Central Monitored Reserve
    const target = projectToMap(-3.1425, -60.0384);
    setPan({ x: 500 - target.x, y: 350 - target.y });
    setZoom(1.15);
    setActiveLocationCard(MOCK_FOREST_REGIONS[0]);
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    handleZoom(delta, e.clientX, e.clientY);
  };

  // Double click zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    handleZoom(0.4, e.clientX, e.clientY);
  };

  // Universal Geographic Search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      category: 'Place / Region' | 'Protected Area' | 'Incident' | 'Device' | 'Biodiversity' | 'Supply Chain' | 'Compliance' | 'Coordinates';
      title: string;
      subtitle: string;
      badge?: string;
      lat: number;
      lng: number;
      entity: any;
      actionType: 'incident' | 'region' | 'facility' | 'bio' | 'device' | 'coords';
    }> = [];

    // 1. Check coordinates search (e.g. "16.8409, 96.1735" or "-3.14, -60.03")
    const coordMatch = q.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      results.push({
        category: 'Coordinates',
        title: `GPS: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
        subtitle: 'Geographic coordinate lookup · Click to fly to position',
        badge: 'GPS',
        lat,
        lng,
        entity: { lat, lng },
        actionType: 'coords',
      });
    }

    // 2. Forest Regions & Places
    MOCK_FOREST_REGIONS.forEach((reg) => {
      if (
        reg.name.toLowerCase().includes(q) ||
        reg.sectorCode.toLowerCase().includes(q) ||
        reg.country.toLowerCase().includes(q) ||
        reg.description.toLowerCase().includes(q) ||
        (q === 'yangon' && reg.country.toLowerCase().includes('myanmar'))
      ) {
        results.push({
          category: 'Place / Region',
          title: reg.name,
          subtitle: `${reg.country} · ${reg.areaHa.toLocaleString()} ha · Risk: ${reg.environmentalRisk}`,
          badge: reg.sectorCode,
          lat: reg.center.lat,
          lng: reg.center.lng,
          entity: reg,
          actionType: 'region',
        });
      }
    });

    // 3. Incidents
    incidents.forEach((inc) => {
      if (
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.locationName.toLowerCase().includes(q) ||
        inc.type.toLowerCase().includes(q)
      ) {
        results.push({
          category: 'Incident',
          title: inc.title,
          subtitle: `${inc.id} · ${inc.locationName} · AI: ${inc.aiConfidence}%`,
          badge: inc.severity,
          lat: inc.coordinates.lat,
          lng: inc.coordinates.lng,
          entity: inc,
          actionType: 'incident',
        });
      }
    });

    // 4. Devices & Cameras
    cameras.forEach((cam) => {
      if (cam.id.toLowerCase().includes(q) || cam.name.toLowerCase().includes(q) || cam.zone.toLowerCase().includes(q)) {
        results.push({
          category: 'Device',
          title: cam.name,
          subtitle: `${cam.id} · ${cam.type.replace(/_/g, ' ')} · Battery: ${cam.batteryPercent}%`,
          badge: cam.status,
          lat: cam.coordinates.lat,
          lng: cam.coordinates.lng,
          entity: cam,
          actionType: 'device',
        });
      }
    });

    // 5. Supply Chain Facilities
    MOCK_SUPPLIERS_FACILITIES.forEach((fac) => {
      if (
        fac.name.toLowerCase().includes(q) ||
        fac.company.toLowerCase().includes(q) ||
        fac.facilityType.toLowerCase().includes(q) ||
        q.includes('supplier')
      ) {
        results.push({
          category: 'Supply Chain',
          title: fac.name,
          subtitle: `${fac.company} · ${fac.facilityType} · Risk: ${fac.riskLevel}`,
          badge: fac.certificationStatus.replace(/_/g, ' '),
          lat: fac.coordinates.lat,
          lng: fac.coordinates.lng,
          entity: fac,
          actionType: 'facility',
        });
      }
    });

    // 6. Biodiversity Records
    MOCK_BIODIVERSITY_RECORDS.forEach((bio) => {
      if (
        bio.commonName.toLowerCase().includes(q) ||
        bio.species.toLowerCase().includes(q) ||
        bio.locationName.toLowerCase().includes(q)
      ) {
        results.push({
          category: 'Biodiversity',
          title: `${bio.commonName} (${bio.species})`,
          subtitle: `${bio.conservationStatus} · ${bio.observationMethod} · ${bio.locationName}`,
          badge: bio.category,
          lat: bio.coordinates.lat,
          lng: bio.coordinates.lng,
          entity: bio,
          actionType: 'bio',
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, incidents, cameras]);

  // Handle Search Result Selection
  const handleSelectSearchResult = (item: typeof searchResults[0]) => {
    const pt = projectToMap(item.lat, item.lng);
    setPan({ x: 500 - pt.x * 1.8, y: 350 - pt.y * 1.8 });
    setZoom(1.8);
    setSearchQuery('');
    setIsSearchFocused(false);

    // Open appropriate detail card
    if (item.actionType === 'incident') {
      setActiveIncidentCard(item.entity);
      setActiveLocationCard(null);
      setActiveFacilityCard(null);
      setActiveBioCard(null);
      onSelectIncident(item.entity);
    } else if (item.actionType === 'region') {
      setActiveLocationCard(item.entity);
      setActiveIncidentCard(null);
      setActiveFacilityCard(null);
      setActiveBioCard(null);
    } else if (item.actionType === 'facility') {
      setActiveFacilityCard(item.entity);
      setActiveIncidentCard(null);
      setActiveLocationCard(null);
      setActiveBioCard(null);
    } else if (item.actionType === 'bio') {
      setActiveBioCard(item.entity);
      setActiveIncidentCard(null);
      setActiveLocationCard(null);
      setActiveFacilityCard(null);
    }
  };

  // Marker Clustering Algorithm (Groups close markers when zoomed out)
  const markerClusters = useMemo<MarkerCluster[]>(() => {
    if (!layers.clustering || zoom > 2.2) return [];

    // Cluster threshold distance in map pixels
    const clusterDistThreshold = Math.max(38, 70 / zoom);

    const itemsToCluster: Array<{
      type: 'incident' | 'camera' | 'sensor' | 'biodiversity' | 'facility';
      lat: number;
      lng: number;
      data: any;
      severity: IncidentSeverity;
    }> = [];

    if (layers.incidents) {
      incidents.forEach((inc) => {
        itemsToCluster.push({
          type: 'incident',
          lat: inc.coordinates.lat,
          lng: inc.coordinates.lng,
          data: inc,
          severity: inc.severity,
        });
      });
    }

    if (layers.cameras) {
      cameras.slice(0, 45).forEach((cam) => {
        itemsToCluster.push({
          type: 'camera',
          lat: cam.coordinates.lat,
          lng: cam.coordinates.lng,
          data: cam,
          severity: cam.status === 'OFFLINE' ? 'HIGH_PRIORITY' : 'INFORMATIONAL',
        });
      });
    }

    const clusters: MarkerCluster[] = [];
    const visited = new Set<number>();

    itemsToCluster.forEach((item, idx) => {
      if (visited.has(idx)) return;

      const pt = projectToMap(item.lat, item.lng);
      const clusterGroup = [item];
      visited.add(idx);

      itemsToCluster.forEach((other, otherIdx) => {
        if (visited.has(otherIdx)) return;
        const otherPt = projectToMap(other.lat, other.lng);
        const d = Math.hypot(pt.x - otherPt.x, pt.y - otherPt.y);
        if (d < clusterDistThreshold) {
          clusterGroup.push(other);
          visited.add(otherIdx);
        }
      });

      if (clusterGroup.length > 2) {
        // Find highest severity in cluster
        let highSev: MarkerCluster['highestSeverity'] = 'INFORMATIONAL';
        if (clusterGroup.some((i) => i.severity === 'CRITICAL')) highSev = 'CRITICAL';
        else if (clusterGroup.some((i) => i.severity === 'HIGH_PRIORITY')) highSev = 'HIGH_PRIORITY';
        else if (clusterGroup.some((i) => i.severity === 'SUSPICIOUS')) highSev = 'SUSPICIOUS';

        clusters.push({
          id: `cluster-${idx}`,
          x: pt.x,
          y: pt.y,
          lat: item.lat,
          lng: item.lng,
          count: clusterGroup.length,
          highestSeverity: highSev,
          items: clusterGroup.map((c) => ({ type: c.type, data: c.data })),
        });
      }
    });

    return clusters;
  }, [layers.clustering, zoom, layers.incidents, layers.cameras, incidents, cameras, projectToMap]);

  // Filter unclustered incidents for direct marker rendering
  const unclusteredIncidents = useMemo(() => {
    if (!layers.incidents) return [];
    if (!layers.clustering || zoom > 2.2) return incidents;

    // Filter out items that are within a rendered cluster
    return incidents.filter((inc) => {
      const pt = projectToMap(inc.coordinates.lat, inc.coordinates.lng);
      return !markerClusters.some((c) => Math.hypot(c.x - pt.x, c.y - pt.y) < 40);
    });
  }, [incidents, layers.incidents, layers.clustering, zoom, markerClusters, projectToMap]);

  // Canvas Heatmap Renderer (Clean & smooth KDE)
  useEffect(() => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas || !layers.incidentHeatmap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (incidents.length === 0) return;

    // Render radial density blurs
    incidents.forEach((inc) => {
      const pt = projectToMap(inc.coordinates.lat, inc.coordinates.lng);
      if (pt.x < -50 || pt.x > 1050 || pt.y < -50 || pt.y > 750) return;

      const r = inc.severity === 'CRITICAL' ? heatmapRadius * 1.25 : heatmapRadius;
      const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r);

      if (inc.severity === 'CRITICAL') {
        grad.addColorStop(0, `rgba(239, 68, 68, ${0.45 * heatmapOpacity})`);
        grad.addColorStop(0.5, `rgba(249, 115, 22, ${0.25 * heatmapOpacity})`);
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (inc.severity === 'HIGH_PRIORITY') {
        grad.addColorStop(0, `rgba(245, 158, 11, ${0.38 * heatmapOpacity})`);
        grad.addColorStop(0.5, `rgba(234, 179, 8, ${0.18 * heatmapOpacity})`);
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      } else {
        grad.addColorStop(0, `rgba(16, 185, 129, ${0.3 * heatmapOpacity})`);
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [incidents, layers.incidentHeatmap, heatmapRadius, heatmapOpacity, projectToMap]);

  // Click handler for marker cluster: zooms smoothly into the cluster area
  const handleClusterClick = (cluster: MarkerCluster, e: React.MouseEvent) => {
    e.stopPropagation();
    const newZoom = Math.min(3.5, zoom + 0.7);
    setPan({
      x: 500 - cluster.x * newZoom,
      y: 350 - cluster.y * newZoom,
    });
    setZoom(newZoom);
  };

  // Dynamic Scale representation (in km)
  const currentScaleKm = useMemo(() => {
    // 1000px on map covers approx 42km in this bounding box
    const totalKm = 42;
    const pxPerKm = (1000 * zoom) / totalKm;
    // Aim for ~120px scale bar
    const barKm = Math.round((120 / pxPerKm) * 10) / 10;
    return barKm >= 1 ? `${Math.round(barKm)} km` : `${Math.round(barKm * 1000)} m`;
  }, [zoom]);

  return (
    <div
      ref={mapContainerRef}
      className={`relative w-full h-full overflow-hidden select-none font-sans transition-colors ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-slate-900' : 'rounded-2xl border'
      } ${
        isDark
          ? 'bg-[#151d18] border-slate-800 text-slate-100 shadow-xl'
          : 'bg-[#edf2ee] border-slate-200 text-slate-800 shadow-sm'
      }`}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      {/* -------------------------------------------------- */}
      {/* 1. TOP-LEFT: GLOBAL SEARCH BAR (GOOGLE MAPS STYLE) */}
      {/* -------------------------------------------------- */}
      <div className="absolute top-4 left-4 z-30 w-full max-w-sm sm:max-w-md pointer-events-auto">
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-lg transition-all ${
            isDark
              ? 'bg-[#1e2822]/95 border border-slate-700/80 text-white backdrop-blur-md'
              : 'bg-white border border-slate-200/90 text-slate-900 shadow-slate-300/40 backdrop-blur-md'
          } ${isSearchFocused ? 'ring-2 ring-emerald-500/50 shadow-xl' : ''}`}
        >
          <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search places, coordinates, devices, incidents, forests..."
            className={`w-full bg-transparent text-xs font-normal focus:outline-none placeholder-slate-400 ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Autocomplete / Search Results Dropdown */}
        {isSearchFocused && searchResults.length > 0 && (
          <div
            className={`mt-2 rounded-xl shadow-2xl border overflow-hidden backdrop-blur-lg animate-in fade-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-[#1a231e]/98 border-slate-700 text-slate-200'
                : 'bg-white/98 border-slate-200 text-slate-800 shadow-slate-300/60'
            }`}
          >
            <div className="p-2 divide-y divide-slate-100 dark:divide-slate-800/80 max-h-80 overflow-y-auto">
              {searchResults.map((res, idx) => (
                <button
                  key={`${res.category}-${idx}`}
                  onClick={() => handleSelectSearchResult(res)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors ${
                    isDark ? 'hover:bg-emerald-950/40' : 'hover:bg-emerald-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        res.actionType === 'incident'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                          : res.actionType === 'region'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : res.actionType === 'facility'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                          : res.actionType === 'bio'
                          ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {res.actionType === 'incident' && <AlertTriangle className="w-3.5 h-3.5" />}
                      {res.actionType === 'region' && <Trees className="w-3.5 h-3.5" />}
                      {res.actionType === 'facility' && <Factory className="w-3.5 h-3.5" />}
                      {res.actionType === 'bio' && <PawPrint className="w-3.5 h-3.5" />}
                      {res.actionType === 'device' && <Camera className="w-3.5 h-3.5" />}
                      {res.actionType === 'coords' && <Navigation className="w-3.5 h-3.5" />}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                        <span>{res.title}</span>
                        {res.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                            {res.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                        {res.subtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Press ESC to close</span>
              <button
                onClick={() => setIsSearchFocused(false)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Close Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------- */}
      {/* 2. TOP-CENTER: PERSPECTIVE LENS BAR (TARGET USERS) */}
      {/* -------------------------------------------------- */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-1 p-1 rounded-2xl shadow-lg backdrop-blur-md border pointer-events-auto transition-all bg-white/95 dark:bg-[#1a231e]/95 border-slate-200 dark:border-slate-700/80">
        {[
          { key: 'ALL', label: 'Overview' },
          { key: 'GOVERNMENTS', label: 'Government / Agencies' },
          { key: 'CORPORATIONS', label: 'Corporations' },
          { key: 'FINANCIAL_INSTITUTIONS', label: 'Financial' },
          { key: 'INSURERS', label: 'Insurers' },
          { key: 'CONSERVATION', label: 'Conservation' },
        ].map((item) => {
          const isActive = perspectiveLens === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleSelectPerspective(item.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* -------------------------------------------------- */}
      {/* 3. TOP-RIGHT: GOOGLE MAPS CONTROLS STACK           */}
      {/* -------------------------------------------------- */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Floating Stack */}
        <div
          className={`flex flex-col rounded-2xl shadow-lg border backdrop-blur-md overflow-hidden transition-all ${
            isDark
              ? 'bg-[#1e2822]/95 border-slate-700/80 text-slate-200 divide-y divide-slate-700/60'
              : 'bg-white border-slate-200/90 text-slate-700 shadow-slate-300/40 divide-y divide-slate-100'
          }`}
        >
          {/* Zoom In */}
          <button
            onClick={() => handleZoom(0.3)}
            title="Zoom In"
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>
          {/* Zoom Out */}
          <button
            onClick={() => handleZoom(-0.3)}
            title="Zoom Out"
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            <Minus className="w-4 h-4" />
          </button>
          {/* Current Location / Target Sector */}
          <button
            onClick={handleCenterCurrentLocation}
            title="Center on Monitored Area (Sector A17)"
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
          >
            <Compass className="w-4 h-4" />
          </button>
          {/* Layers Popover Toggle */}
          <button
            onClick={() => setShowLayersPopover(!showLayersPopover)}
            title="Map Layers"
            className={`p-3 transition-colors flex items-center justify-center ${
              showLayersPopover
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Google Maps-Style Basemap Switcher Chips */}
        <div
          className={`flex items-center p-1 rounded-xl shadow-md border backdrop-blur-md ${
            isDark
              ? 'bg-[#1e2822]/95 border-slate-700/80 text-slate-300'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <button
            onClick={() => setBaseMapStyle('map')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1 ${
              baseMapStyle === 'map'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MapIcon className="w-3 h-3" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setBaseMapStyle('satellite')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1 ${
              baseMapStyle === 'satellite'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Satellite</span>
          </button>
          <button
            onClick={() => setBaseMapStyle('terrain')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all flex items-center gap-1 ${
              baseMapStyle === 'terrain'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Mountain className="w-3 h-3" />
            <span>Terrain</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* 4. GOOGLE MAPS-STYLE LAYERS POPOVER DRAWER         */}
      {/* -------------------------------------------------- */}
      {showLayersPopover && (
        <div
          className={`absolute top-20 right-4 z-40 w-80 max-h-[82vh] overflow-y-auto rounded-2xl shadow-2xl border backdrop-blur-xl p-4 animate-in fade-in zoom-in-95 duration-150 space-y-4 ${
            isDark
              ? 'bg-[#18221c]/98 border-slate-700/80 text-slate-100'
              : 'bg-white/98 border-slate-200 text-slate-900 shadow-slate-400/30'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-2.5 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Map Layers & Risk Intelligence</h3>
            </div>
            <button
              onClick={() => setShowLayersPopover(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* BASE MAP Selection */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Map</span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['map', 'satellite', 'terrain'] as BaseMapStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setBaseMapStyle(style)}
                  className={`p-2 rounded-xl text-center text-xs font-medium border transition-all ${
                    baseMapStyle === style
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700/70 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="capitalize">{style}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ENVIRONMENTAL INTELLIGENCE */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Environmental Intelligence
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'forestCover', label: 'Forest Cover', icon: Trees },
                { key: 'deforestation', label: 'Deforestation', icon: AlertTriangle },
                { key: 'wildfire', label: 'Wildfire', icon: Flame },
                { key: 'biodiversity', label: 'Biodiversity', icon: PawPrint },
                { key: 'water', label: 'Water & Rivers', icon: Droplets },
                { key: 'climate', label: 'Climate Anomalies', icon: Wind },
                { key: 'ecosystemDegradation', label: 'Degradation', icon: Activity },
              ].map(({ key, label, icon: Icon }) => {
                const checked = (layers as any)[key];
                return (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setLayers((prev) => ({ ...prev, [key]: !checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-[11px] truncate">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* OPERATIONS */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Operations & In-Situ
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'cameras', label: 'AI Cameras', icon: Camera },
                { key: 'sensors', label: 'IoT Sensors', icon: Radio },
                { key: 'incidents', label: 'Active Alerts', icon: AlertTriangle },
                { key: 'fieldOperations', label: 'Field Patrols', icon: Navigation },
              ].map(({ key, label, icon: Icon }) => {
                const checked = (layers as any)[key];
                return (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setLayers((prev) => ({ ...prev, [key]: !checked }))}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-[11px] truncate">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* RISK & ANALYTICAL OVERLAYS */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Risk & Heatmap Overlays
            </span>
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center justify-between p-1.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <span className="flex items-center gap-2 text-[11px]">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  Geospatial Incident Density Heatmap
                </span>
                <input
                  type="checkbox"
                  checked={layers.incidentHeatmap}
                  onChange={() => setLayers((prev) => ({ ...prev, incidentHeatmap: !prev.incidentHeatmap }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <span className="flex items-center gap-2 text-[11px]">
                  <Factory className="w-3.5 h-3.5 text-amber-500" />
                  Supply Chain Facilities & Corridors
                </span>
                <input
                  type="checkbox"
                  checked={layers.supplyChainRisk}
                  onChange={() => setLayers((prev) => ({ ...prev, supplyChainRisk: !prev.supplyChainRisk }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <span className="flex items-center gap-2 text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Compliance & Permit Boundaries
                </span>
                <input
                  type="checkbox"
                  checked={layers.complianceRisk}
                  onChange={() => setLayers((prev) => ({ ...prev, complianceRisk: !prev.complianceRisk }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* 5. INTERACTIVE GOOGLE MAPS INFORMATION CARDS       */}
      {/* -------------------------------------------------- */}

      {/* A. INCIDENT / ENVIRONMENTAL FEATURE CARD */}
      {activeIncidentCard && (
        <div
          className={`absolute bottom-12 left-4 z-40 w-80 sm:w-96 rounded-2xl shadow-2xl border backdrop-blur-xl p-4 animate-in slide-in-from-bottom-3 duration-200 ${
            isDark
              ? 'bg-[#18221c]/98 border-slate-700/80 text-slate-100'
              : 'bg-white/98 border-slate-200 text-slate-900 shadow-slate-300/60'
          }`}
        >
          <div className="flex items-start justify-between border-b pb-2.5 border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                {activeIncidentCard.aiFindingLevel || 'Potential Issue (Under Review)'}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                {activeIncidentCard.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeIncidentCard.locationName}
              </p>
            </div>
            <button
              onClick={() => setActiveIncidentCard(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs my-3">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Risk Level</span>
              <span
                className={`font-semibold ${
                  activeIncidentCard.riskLevel === 'CRITICAL'
                    ? 'text-red-500'
                    : activeIncidentCard.riskLevel === 'HIGH'
                    ? 'text-orange-500'
                    : 'text-amber-500'
                }`}
              >
                {activeIncidentCard.riskLevel}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Detected</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {activeIncidentCard.timestamp.split(' ')[0]}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">AI Confidence</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {activeIncidentCard.aiConfidence}%
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Human Verification</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">Required</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 space-y-1">
            <div>
              <strong className="text-slate-700 dark:text-slate-200">Sources: </strong>
              {activeIncidentCard.detectionSources.join(', ')}
            </div>
            <div className="text-[10px] italic text-slate-400 pt-1">
              Note: AI identifies risk indicators only. Formal non-compliance or violations require human verification.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectIncident(activeIncidentCard)}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors text-center"
            >
              View Full Incident Details
            </button>
            <button
              onClick={() => setActiveIncidentCard(null)}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* B. FOREST REGION / LOCATION DETAILS CARD */}
      {activeLocationCard && (
        <div
          className={`absolute bottom-12 left-4 z-40 w-80 sm:w-96 rounded-2xl shadow-2xl border backdrop-blur-xl p-4 animate-in slide-in-from-bottom-3 duration-200 ${
            isDark
              ? 'bg-[#18221c]/98 border-slate-700/80 text-slate-100'
              : 'bg-white/98 border-slate-200 text-slate-900 shadow-slate-300/60'
          }`}
        >
          <div className="flex items-start justify-between border-b pb-2.5 border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                {activeLocationCard.sectorCode} · {activeLocationCard.country}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                {activeLocationCard.name}
              </h3>
            </div>
            <button
              onClick={() => setActiveLocationCard(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs my-3">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Total Area</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {activeLocationCard.areaHa.toLocaleString()} ha
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Forest Cover</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {activeLocationCard.forestCoverPercent}%
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Recent Forest Loss</span>
              <span className="font-semibold text-rose-500">
                +{activeLocationCard.recentForestLossPercent}%
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Active Alerts</span>
              <span className="font-semibold text-amber-500">
                {activeLocationCard.activeAlertsCount}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-3">
            {activeLocationCard.description}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const pt = projectToMap(activeLocationCard.center.lat, activeLocationCard.center.lng);
                setPan({ x: 500 - pt.x * 2.0, y: 350 - pt.y * 2.0 });
                setZoom(2.0);
              }}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors text-center"
            >
              Explore Sector
            </button>
            <button
              onClick={() => setActiveLocationCard(null)}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* C. SUPPLY CHAIN / FACILITY CARD */}
      {activeFacilityCard && (
        <div
          className={`absolute bottom-12 left-4 z-40 w-80 sm:w-96 rounded-2xl shadow-2xl border backdrop-blur-xl p-4 animate-in slide-in-from-bottom-3 duration-200 ${
            isDark
              ? 'bg-[#18221c]/98 border-slate-700/80 text-slate-100'
              : 'bg-white/98 border-slate-200 text-slate-900 shadow-slate-300/60'
          }`}
        >
          <div className="flex items-start justify-between border-b pb-2.5 border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
                Supply Chain Facility · {activeFacilityCard.facilityType}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">
                {activeFacilityCard.name}
              </h3>
              <p className="text-xs text-slate-400">{activeFacilityCard.company}</p>
            </div>
            <button
              onClick={() => setActiveFacilityCard(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs my-3">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Risk Tier</span>
              <span className="font-semibold text-rose-500">{activeFacilityCard.riskLevel}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Certification</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {activeFacilityCard.certificationStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 space-y-1">
            <div>
              <strong className="text-slate-700 dark:text-slate-200">Deforestation Exposure: </strong>
              {activeFacilityCard.deforestationExposure}
            </div>
            <div>
              <strong className="text-slate-700 dark:text-slate-200">Throughput: </strong>
              {activeFacilityCard.annualThroughput}
            </div>
          </div>

          <button
            onClick={() => setActiveFacilityCard(null)}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* 6. BOTTOM-LEFT: COLLAPSIBLE MAP LEGEND             */}
      {/* -------------------------------------------------- */}
      <div className="absolute bottom-4 left-4 z-30 pointer-events-auto">
        {showLegend ? (
          <div
            className={`p-3 rounded-2xl shadow-xl border backdrop-blur-md space-y-2 text-xs animate-in fade-in duration-150 ${
              isDark
                ? 'bg-[#18221c]/95 border-slate-700/80 text-slate-200'
                : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/40'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-1.5 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Map Legend
              </span>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Critical Incident</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>High Priority</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>Active Camera</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>IoT Sensor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span>Biodiversity Trace</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span>Supply Chain Hub</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLegend(true)}
            className={`px-3 py-1.5 rounded-xl shadow-md border backdrop-blur-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              isDark
                ? 'bg-[#1e2822]/95 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-emerald-500" />
            <span>Legend</span>
          </button>
        )}
      </div>

      {/* -------------------------------------------------- */}
      {/* 7. BOTTOM-RIGHT: SCALE & ATTRIBUTION               */}
      {/* -------------------------------------------------- */}
      <div className="absolute bottom-2 right-4 z-20 flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 select-none pointer-events-none">
        {/* Dynamic Scale Indicator */}
        <div className="flex items-center gap-1.5 bg-white/70 dark:bg-black/40 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-800">
          <div className="w-12 h-1 border-b-2 border-l-2 border-r-2 border-slate-500"></div>
          <span className="font-mono">{currentScaleKm}</span>
        </div>
        {/* Map Attribution */}
        <div className="hidden sm:block">
          ForestGuard Earth Intelligence © 2026 · Sentinel-2, Landsat & Ground Telemetry
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* 8. INTERACTIVE GIS SVG CANVAS (THE MAP VIEWPORT)   */}
      {/* -------------------------------------------------- */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.12s ease-out',
          }}
        >
          <defs>
            {/* Map Grid Pattern */}
            <pattern id="gmapGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke={baseMapStyle === 'satellite' ? '#1b2d22' : isDark ? '#1a251e' : '#e2e8e4'}
                strokeWidth="0.5"
              />
            </pattern>

            {/* Satellite Forest Canopy Pattern */}
            <pattern id="satelliteCanopy" width="30" height="30" patternUnits="userSpaceOnUse">
              <rect width="30" height="30" fill="#0d2317" />
              <circle cx="8" cy="8" r="6" fill="#122d1e" opacity="0.8" />
              <circle cx="22" cy="18" r="7" fill="#0b1e14" opacity="0.9" />
              <circle cx="16" cy="24" r="5" fill="#143322" opacity="0.6" />
            </pattern>

            {/* Terrain Contours Pattern */}
            <pattern id="terrainContours" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 0 30 Q 30 15 60 30" fill="none" stroke="#2a3f32" strokeWidth="0.5" opacity="0.35" />
              <path d="M 0 50 Q 30 35 60 50" fill="none" stroke="#2a3f32" strokeWidth="0.5" opacity="0.35" />
            </pattern>
          </defs>

          {/* BASE CANVAS COLOR */}
          <rect
            width="1000"
            height="700"
            fill={
              baseMapStyle === 'satellite'
                ? '#0a160f'
                : baseMapStyle === 'terrain'
                ? isDark ? '#16201a' : '#e6ede8'
                : isDark ? '#141d18' : '#eef3ef'
            }
          />

          {/* BACKGROUND TEXTURE GRID / SATELLITE TEXTURE */}
          <rect
            width="1000"
            height="700"
            fill={baseMapStyle === 'satellite' ? 'url(#satelliteCanopy)' : 'url(#gmapGrid)'}
            opacity={baseMapStyle === 'satellite' ? 0.75 : 0.6}
          />

          {/* TERRAIN ELEVATION RIDGE LINES (When in Terrain Mode) */}
          {baseMapStyle === 'terrain' && (
            <g opacity="0.6">
              <rect width="1000" height="700" fill="url(#terrainContours)" />
              {/* Topographic elevation contours */}
              <path
                d="M 60 120 Q 240 60 480 140 T 920 100"
                fill="none"
                stroke={isDark ? '#2f4538' : '#bdcbbe'}
                strokeWidth="1.2"
                strokeDasharray="4 2"
              />
              <path
                d="M 80 280 Q 320 220 540 300 T 950 260"
                fill="none"
                stroke={isDark ? '#2f4538' : '#bdcbbe'}
                strokeWidth="1.2"
              />
              <path
                d="M 120 480 Q 360 420 620 500 T 900 460"
                fill="none"
                stroke={isDark ? '#2f4538' : '#bdcbbe'}
                strokeWidth="1.2"
              />
            </g>
          )}

          {/* 1. FOREST COVER POLYGONS */}
          {layers.forestCover && (
            <g id="layer-forest-cover" opacity={baseMapStyle === 'satellite' ? 0.45 : 0.88}>
              {/* Primary Strict Reserve Core */}
              <path
                d="M 80,60 Q 280,20 500,80 T 920,60 Q 980,180 950,420 T 780,640 Q 480,680 260,620 T 60,520 Q 30,260 80,60 Z"
                fill={
                  baseMapStyle === 'satellite'
                    ? '#0d281a'
                    : isDark ? '#153123' : '#c8e2cf'
                }
                stroke={isDark ? '#1c422f' : '#b2d3ba'}
                strokeWidth="1.5"
              />
              {/* Intact Deep Rainforest Core */}
              <path
                d="M 160,130 Q 340,90 560,150 T 840,160 Q 900,240 860,460 T 640,560 Q 400,600 240,530 T 120,340 Z"
                fill={
                  baseMapStyle === 'satellite'
                    ? '#081e13'
                    : isDark ? '#183a2a' : '#b7dcbf'
                }
                stroke={isDark ? '#224e38' : '#a2cca9'}
                strokeWidth="1.2"
              />
            </g>
          )}

          {/* 2. RIVERS & WATERWAYS */}
          {layers.water && (
            <g id="layer-waterways">
              {/* Emerald River Main Stem */}
              <path
                d="M 40,220 C 180,260 300,180 440,320 S 680,420 820,380 S 960,460 990,520"
                fill="none"
                stroke={isDark ? '#1e40af' : '#60a5fa'}
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M 40,220 C 180,260 300,180 440,320 S 680,420 820,380 S 960,460 990,520"
                fill="none"
                stroke={isDark ? '#3b82f6' : '#93c5fd'}
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.9"
              />

              {/* Rio Negro Tributary */}
              <path
                d="M 440,320 C 380,440 280,500 220,660"
                fill="none"
                stroke={isDark ? '#1e3a8a' : '#93c5fd'}
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.75"
              />

              {/* Water Labels */}
              <text x="560" y="360" fill={isDark ? '#93c5fd' : '#2563eb'} fontSize="9" fontWeight="600" opacity="0.8">
                Emerald River
              </text>
              <text x="250" y="550" fill={isDark ? '#93c5fd' : '#2563eb'} fontSize="8" fontWeight="500" opacity="0.75">
                Rio Negro Tributary
              </text>
            </g>
          )}

          {/* 3. ROADS & TRANSPORTATION ARTERIALS */}
          <g id="layer-roads" opacity="0.9">
            {/* Primary Highway / Logging Corridor */}
            <path
              d="M 10,480 Q 220,440 420,460 T 780,480 Q 880,520 990,540"
              fill="none"
              stroke={isDark ? '#334155' : '#cbd5e1'}
              strokeWidth="5"
            />
            <path
              d="M 10,480 Q 220,440 420,460 T 780,480 Q 880,520 990,540"
              fill="none"
              stroke={isDark ? '#94a3b8' : '#ffffff'}
              strokeWidth="2.5"
            />

            {/* Perimeter Access Road */}
            <path
              d="M 420,460 Q 460,280 500,100"
              fill="none"
              stroke={isDark ? '#475569' : '#e2e8f0'}
              strokeWidth="3"
              strokeDasharray="4 3"
            />

            {/* Road Label */}
            <text x="180" y="470" fill={isDark ? '#94a3b8' : '#64748b'} fontSize="8" fontWeight="600">
              Corridor Access Route 4
            </text>
          </g>

          {/* 4. FOREST REGION BOUNDARIES & LABELS */}
          {MOCK_FOREST_REGIONS.map((reg) => {
            const pt = projectToMap(reg.center.lat, reg.center.lng);
            return (
              <g
                key={reg.id}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLocationCard(reg);
                  setActiveIncidentCard(null);
                  setActiveFacilityCard(null);
                  setActiveBioCard(null);
                }}
              >
                {/* Subtle regional boundary marker ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="34"
                  fill="none"
                  stroke={isDark ? '#10b981' : '#059669'}
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.4"
                  className="group-hover:opacity-90 group-hover:stroke-width-2 transition-all"
                />
                {/* Sector Label Tag */}
                <rect
                  x={pt.x - 48}
                  y={pt.y - 12}
                  width="96"
                  height="18"
                  rx="9"
                  fill={isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)'}
                  stroke={isDark ? '#334155' : '#cbd5e1'}
                  strokeWidth="0.8"
                />
                <text
                  x={pt.x}
                  y={pt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={isDark ? '#f8fafc' : '#0f172a'}
                  fontSize="8.5"
                  fontWeight="600"
                >
                  {reg.sectorCode}
                </text>
              </g>
            );
          })}

          {/* 5. SUPPLY CHAIN FACILITIES (When Enabled) */}
          {layers.supplyChainRisk &&
            MOCK_SUPPLIERS_FACILITIES.map((fac) => {
              const pt = projectToMap(fac.coordinates.lat, fac.coordinates.lng);
              return (
                <g
                  key={fac.id}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFacilityCard(fac);
                    setActiveIncidentCard(null);
                    setActiveLocationCard(null);
                    setActiveBioCard(null);
                  }}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill={fac.riskLevel === 'CRITICAL' ? '#ef4444' : '#f59e0b'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="group-hover:scale-125 transition-transform"
                  />
                  <rect x={pt.x - 3} y={pt.y - 3} width="6" height="6" fill="#ffffff" rx="1" />
                </g>
              );
            })}

          {/* 6. BIODIVERSITY OBSERVATIONS (When Enabled) */}
          {layers.biodiversity &&
            MOCK_BIODIVERSITY_RECORDS.map((bio) => {
              const pt = projectToMap(bio.coordinates.lat, bio.coordinates.lng);
              return (
                <g
                  key={bio.id}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveBioCard(bio);
                    setActiveIncidentCard(null);
                    setActiveLocationCard(null);
                    setActiveFacilityCard(null);
                  }}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="6.5"
                    fill="#6366f1"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    className="group-hover:scale-125 transition-transform"
                  />
                  <circle cx={pt.x} cy={pt.y} r="2" fill="#ffffff" />
                </g>
              );
            })}

          {/* 7. CONTINUOUS GEOSPATIAL HEATMAP LAYER (CANVAS MOUNTED IN SVG) */}
          {layers.incidentHeatmap && (
            <foreignObject x="0" y="0" width="1000" height="700" className="pointer-events-none">
              <canvas
                ref={heatmapCanvasRef}
                width={1000}
                height={700}
                className="w-full h-full pointer-events-none"
              />
            </foreignObject>
          )}

          {/* 8. CLEAN MINIMAL MARKERS & CLUSTERING */}

          {/* A. Render Clusters (e.g., '47', '12') */}
          {markerClusters.map((cluster) => {
            const isCrit = cluster.highestSeverity === 'CRITICAL';
            return (
              <g
                key={cluster.id}
                className="cursor-pointer group"
                onClick={(e) => handleClusterClick(cluster, e)}
              >
                {/* Cluster Halo */}
                <circle
                  cx={cluster.x}
                  cy={cluster.y}
                  r="18"
                  fill={isCrit ? '#fee2e2' : '#dcfce7'}
                  opacity="0.8"
                />
                {/* Cluster Main Badge */}
                <circle
                  cx={cluster.x}
                  cy={cluster.y}
                  r="13"
                  fill={isCrit ? '#ef4444' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="group-hover:scale-110 transition-transform"
                />
                {/* Count Label */}
                <text
                  x={cluster.x}
                  y={cluster.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {cluster.count}
                </text>
              </g>
            );
          })}

          {/* B. Render Individual Unclustered Incident Markers */}
          {unclusteredIncidents.map((inc) => {
            const pt = projectToMap(inc.coordinates.lat, inc.coordinates.lng);
            const isCrit = inc.severity === 'CRITICAL';
            const isHigh = inc.severity === 'HIGH_PRIORITY';
            const isSelected = activeIncidentCard?.id === inc.id;

            return (
              <g
                key={inc.id}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIncidentCard(inc);
                  setActiveLocationCard(null);
                  setActiveFacilityCard(null);
                  setActiveBioCard(null);
                  onSelectIncident(inc);
                }}
              >
                {/* Selected Ring */}
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="14"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                )}
                {/* Pin Head */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isCrit ? '7' : '5.5'}
                  fill={isCrit ? '#ef4444' : isHigh ? '#f97316' : '#eab308'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="group-hover:scale-125 transition-transform"
                />
                {/* Pin Center Dot */}
                <circle cx={pt.x} cy={pt.y} r="2" fill="#ffffff" />
              </g>
            );
          })}

          {/* C. Render In-Situ Cameras (When Enabled & Unclustered) */}
          {layers.cameras &&
            zoom > 1.4 &&
            cameras.slice(0, 30).map((cam) => {
              const pt = projectToMap(cam.coordinates.lat, cam.coordinates.lng);
              return (
                <g
                  key={cam.id}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectCamera) onSelectCamera(cam);
                  }}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill={cam.status === 'ONLINE' ? '#3b82f6' : '#94a3b8'}
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                </g>
              );
            })}
        </svg>
      </div>
    </div>
  );
};
