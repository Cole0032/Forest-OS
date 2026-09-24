export type UserRole =
  | 'SUPER_ADMIN'
  | 'SYSTEM_ADMIN'
  | 'ENVIRONMENT_OFFICER'
  | 'FOREST_OFFICER'
  | 'FIELD_OFFICER'
  | 'INVESTIGATOR'
  | 'DATA_ANALYST'
  | 'LEGAL_OFFICER'
  | 'AUDITOR'
  | 'READ_ONLY_VIEWER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency: string;
  assignedRegion: string;
  badgeNumber: string;
  avatarUrl?: string;
}

export type IncidentSeverity = 'NORMAL' | 'INFORMATIONAL' | 'SUSPICIOUS' | 'HIGH_PRIORITY' | 'CRITICAL';

export type IncidentStatus =
  | 'DETECTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'INVESTIGATION'
  | 'REFERRED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'FALSE_POSITIVE';

export type EnvironmentalRiskDomain =
  | 'DEFORESTATION'
  | 'WILDFIRE'
  | 'CLIMATE_EXPOSURE'
  | 'ECOSYSTEM_DEGRADATION'
  | 'BIODIVERSITY_LOSS'
  | 'SUPPLY_CHAIN_RISK'
  | 'ENVIRONMENTAL_COMPLIANCE';

export type AiFindingLevel =
  | 'RISK_DETECTED'
  | 'POTENTIAL_ISSUE'
  | 'POSSIBLE_NON_COMPLIANCE'
  | 'CONFIRMED_VIOLATION';

export type TargetUserPerspective =
  | 'CORPORATIONS'
  | 'FINANCIAL_INSTITUTIONS'
  | 'INSURERS'
  | 'GOVERNMENTS'
  | 'CONSERVATION';

export interface ForestRegion {
  id: string;
  name: string;
  sectorCode: string;
  country: string;
  areaHa: number;
  forestCoverPercent: number;
  recentForestLossPercent: number;
  biodiversityObservationsCount: number;
  activeAlertsCount: number;
  climateExposure: 'Low' | 'Moderate' | 'High' | 'Severe';
  environmentalRisk: 'Low' | 'Moderate' | 'High' | 'Critical';
  center: Coordinates;
  ecosystemType: string;
  description: string;
}

export interface SupplyChainFacility {
  id: string;
  name: string;
  facilityType: 'Sawmill' | 'Palm Oil Mill' | 'Mining Extraction' | 'Pulp Facility' | 'Agricultural Concession' | 'Logistics Corridor';
  company: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  certificationStatus: 'FSC_CERTIFIED' | 'RSPO_CERTIFIED' | 'PENDING_AUDIT' | 'UNVERIFIED';
  coordinates: Coordinates;
  deforestationExposure: string;
  annualThroughput: string;
}

export interface BiodiversityRecord {
  id: string;
  species: string;
  commonName: string;
  category: 'Mammal' | 'Bird' | 'Amphibian' | 'Flora' | 'Reptile';
  observationMethod: 'Camera-Trap' | 'Acoustic Sensor' | 'Ranger Patrol' | 'Environmental DNA';
  conservationStatus: 'Critically Endangered' | 'Endangered' | 'Vulnerable' | 'Near Threatened';
  coordinates: Coordinates;
  locationName: string;
  timestamp: string;
  count: number;
}

export interface ComplianceRecord {
  id: string;
  permitNumber: string;
  holder: string;
  permitType: 'Timber Concession' | 'Land Clearing' | 'Water Rights' | 'Mineral Extraction';
  status: 'Compliant' | 'Discrepancy Detected' | 'Missing Documentation' | 'Under Audit';
  coordinates: Coordinates;
  locationName: string;
  areaAuthorizedHa: number;
  inconsistencySummary: string;
}

export type IncidentType =
  | 'ILLEGAL_DEFORESTATION'
  | 'UNAUTHORIZED_ROAD_CONSTRUCTION'
  | 'ACOUSTIC_CHAINSAW_ACTIVITY'
  | 'SUSPICIOUS_TIMBER_TRANSPORT'
  | 'UNAUTHORIZED_ENTRY_RESTRICTED_ZONE'
  | 'FIRE_SMOKE_ANOMALY'
  | 'HEAVY_MACHINERY_ENCROACHMENT'
  | 'MINING_DISTURBANCE'
  | 'WILDLIFE_HABITAT_THREAT';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AiExplanation {
  whatDetected: string;
  whereDetected: string;
  whenDetected: string;
  source: string;
  aiConfidence: number; // 0 - 100
  supportingSignals: string[];
  contradictingSignals: string[];
  whyFlagged: string[];
  whatHumanReviewShouldCheck: string[];
  disclaimer: string;
}

export interface Incident {
  id: string; // e.g. ENV-2026-000182
  type: IncidentType;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  locationName: string;
  zoneId: string;
  coordinates: Coordinates;
  timestamp: string;
  detectionSources: string[]; // e.g. ["Acoustic Sensor A-204", "Camera CAM-041", "Sentinel-2 Satellite"]
  aiConfidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskDomain?: EnvironmentalRiskDomain;
  aiFindingLevel?: AiFindingLevel;
  humanVerificationRequired?: boolean;
  aiExplanation: AiExplanation;
  relatedDeviceIds: string[];
  relatedCameraIds: string[];
  relatedVehiclePlate?: string;
  relatedPermitId?: string;
  assignedInvestigator?: string;
  assignedOfficerBadge?: string;
  reviewerNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  evidenceIds: string[];
  satelliteEvidence?: {
    beforeDate: string;
    afterDate: string;
    hectaresAffected: number;
    ndviDropPercent: number;
    beforeThumb: string;
    afterThumb: string;
  };
  timeline: {
    time: string;
    action: string;
    actor: string;
    details?: string;
  }[];
}

export type DeviceCategory =
  | 'AI_CAMERA'
  | 'THERMAL_CAMERA'
  | 'ACOUSTIC_SENSOR'
  | 'MOTION_SENSOR'
  | 'SMOKE_SENSOR'
  | 'TEMPERATURE_SENSOR'
  | 'HUMIDITY_SENSOR'
  | 'GPS_DEVICE'
  | 'ENVIRONMENTAL_SENSOR'
  | 'EDGE_AI_DEVICE';

export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'LOW_BATTERY' | 'MAINTENANCE' | 'TAMPER_ALERT' | 'UNKNOWN';

export interface Device {
  id: string; // e.g. DEV-CAM-041
  name: string;
  type: DeviceCategory;
  zone: string;
  coordinates: Coordinates;
  batteryPercent: number;
  solarChargingRate: number; // Watts
  signalStrength: number; // 0 - 100%
  networkType: 'LTE-M' | 'Starlink-Mesh' | 'LoRaWAN' | 'Satellite' | 'VHF';
  firmwareVersion: string;
  lastHeartbeat: string;
  temperatureC: number;
  storageUsedPercent: number;
  status: DeviceStatus;
  installedDate: string;
  lastMaintenanceDate: string;
  uptimePercent: number;
  currentReading?: string;
}

export interface CameraFeed extends Device {
  streamUrl: string;
  resolution: string;
  fps: number;
  nightVisionActive: boolean;
  thermalMode: boolean;
  recentDetections: {
    label: string;
    confidence: number;
    timestamp: string;
    bbox?: [number, number, number, number]; // [x, y, w, h] normalized
  }[];
}

export interface AcousticSensorReading {
  sensorId: string;
  sensorName: string;
  zone: string;
  coordinates: Coordinates;
  timestamp: string;
  classification:
    | 'CHAINSAW_LIKE_SOUND'
    | 'HEAVY_MACHINERY'
    | 'VEHICLE_ENGINE'
    | 'EXPLOSION_OR_GUNSHOT'
    | 'FIRE_ENVIRONMENTAL'
    | 'NORMAL_BIOPHONY';
  confidence: number;
  decibels: number;
  durationSeconds: number;
  waveformSample: number[]; // numbers for canvas visualization
  frequencyPeakHz: number;
  spectrogramUrl?: string;
  status: 'PENDING_ANALYSIS' | 'CONFIRMED_ANOMALY' | 'DISMISSED_BACKGROUND';
}

export interface SatelliteChangeRecord {
  id: string;
  zoneName: string;
  coordinates: Coordinates;
  beforeDate: string;
  afterDate: string;
  areaHectares: number;
  changeType:
    | 'TREE_COVER_LOSS'
    | 'NEW_CLEARINGS'
    | 'UNAUTHORIZED_ROAD_CONSTRUCTION'
    | 'LAND_USE_CHANGE'
    | 'BURN_SCARS'
    | 'MINING_DISTURBANCE'
    | 'AGRICULTURAL_EXPANSION';
  aiConfidence: number;
  status: 'REQUIRES_VERIFICATION' | 'CONFIRMED_DEFORESTATION' | 'LEGAL_PERMITTED_HARVEST' | 'NATURAL_FALL';
  satelliteConstellation: 'Sentinel-2 Multispectral' | 'Landsat-9 OLI' | 'PlanetScope High-Res';
  beforeImageUrl: string;
  afterImageUrl: string;
  changeMaskUrl: string;
  notes: string;
}

export interface TimberTransportRecord {
  id: string; // e.g. TMB-2026-9041
  permitId: string;
  transportAuthorization: string;
  vehicleRegistration: string;
  driverName: string;
  originConcession: string;
  destinationFacility: string;
  declaredSpecies: string;
  declaredQuantityM3: number;
  recordedQuantityM3: number;
  discrepancyM3: number;
  timestamp: string;
  checkpointName: string;
  coordinates: Coordinates;
  status: 'AUTHORIZED' | 'DISCREPANCY_DETECTED' | 'HELD_FOR_INSPECTION' | 'PERMIT_INVALID';
  inspectionNotes?: string;
  checkedByOfficer: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  shortCode: string;
  jurisdiction: string;
  category: 'FOREST_LAW' | 'ENVIRONMENTAL_REGULATION' | 'TIMBER_TRANSIT' | 'PROTECTED_AREA_CODE' | 'CRIMINAL_CODE';
  documentDate: string;
  version: string;
  officialSource: string;
  sections: {
    sectionNumber: string;
    title: string;
    page: number;
    text: string;
    penalties?: string;
  }[];
}

export interface EvidenceItem {
  id: string; // e.g. EVD-2026-00412
  incidentId: string;
  title: string;
  type: 'VIDEO' | 'IMAGE' | 'AUDIO' | 'SATELLITE_IMAGE' | 'SENSOR_DATA' | 'GPS_DATA' | 'DOCUMENT' | 'FIELD_PHOTO' | 'FIELD_NOTE';
  sourceDevice: string;
  timestamp: string;
  locationName: string;
  coordinates: Coordinates;
  uploadedBy: string;
  sha256Hash: string;
  sizeBytes: number;
  fileUrl: string;
  previewUrl?: string;
  isVerifiedIntegrity: boolean;
  metadata: Record<string, string | number>;
  chainOfCustody: {
    id: string;
    timestamp: string;
    action: 'CAPTURED' | 'UPLOADED' | 'HASH_GENERATED' | 'REVIEWED' | 'VERIFIED' | 'EXPORTED' | 'SHARED_WITH_PROSECUTOR';
    actorName: string;
    actorRole: string;
    actorAgency: string;
    previousState: string;
    newState: string;
    notes?: string;
  }[];
}

export interface InvestigationCase {
  id: string; // e.g. CASE-2026-0089
  title: string;
  leadInvestigator: string;
  investigatorBadge: string;
  status: 'ACTIVE_INVESTIGATION' | 'EVIDENCE_COLLECTION' | 'LEGAL_REFERRAL_PENDING' | 'REFERRED_TO_COURT' | 'RESOLVED_ENFORCED' | 'CLOSED_INSUFFICIENT_EVIDENCE';
  priority: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  openedDate: string;
  targetZone: string;
  primaryViolation: string;
  incidentIds: string[];
  evidenceIds: string[];
  suspectVehicles: string[];
  suspectEntities: string[];
  checklist: {
    task: string;
    completed: boolean;
    completedAt?: string;
    completedBy?: string;
  }[];
  formalDossierSummary: string;
  chainOfCustodyVerified: boolean;
}

export interface FieldPatrolTeam {
  id: string;
  name: string;
  callsign: string;
  rangerCount: number;
  leaderName: string;
  coordinates: Coordinates;
  batteryPercent: number;
  status: 'ON_PATROL' | 'INVESTIGATING_INCIDENT' | 'RETURNING_TO_BASE' | 'OFFLINE';
  assignedIncidentId?: string;
  lastPingTime: string;
}

export interface FieldReport {
  id: string;
  officerName: string;
  badgeNumber: string;
  coordinates: Coordinates;
  timestamp: string;
  incidentId?: string;
  notes: string;
  photos: string[];
  audioRecordings: string[];
  isOfflineSyncPending: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetEntity: string;
  targetId: string;
  ipAddress: string;
  details: string;
  tamperSealHash: string;
}
