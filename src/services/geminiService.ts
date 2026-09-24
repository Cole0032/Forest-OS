export interface CorrelateRequest {
  incidentId?: string;
  location: string;
  signals: {
    source: string;
    type: string;
    timestamp: string;
    details: string;
    confidence: number;
  }[];
  permitCheck?: {
    hasPermit: boolean;
    permitDetails?: string;
  };
}

export interface CorrelateResponse {
  correlationSummary: string;
  correlatedConfidence: number;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasoningChain: string[];
  supportingEvidence: string[];
  contradictingFactors: string[];
  whyFlagged: string[];
  investigatorChecklist: string[];
  legalProvisionsImplicated: string[];
  disclaimer: string;
}

export interface VideoAnalysisRequest {
  cameraId: string;
  cameraName: string;
  location: string;
  timestamp: string;
  durationSeconds: number;
  videoTitle: string;
  promptQuestion?: string;
}

export interface VideoAnalysisResponse {
  videoTitle: string;
  summary: string;
  detectedEntities: {
    label: string;
    timestamp: string;
    confidence: number;
    description: string;
    isSuspectActivity: boolean;
  }[];
  temporalTimeline: {
    timeOffset: string;
    event: string;
    severity: 'NORMAL' | 'SUSPICIOUS' | 'CRITICAL';
  }[];
  vehiclePlateObservation?: string;
  equipmentIdentified: string[];
  forestImpactAssessment: string;
  recommendedNextActions: string[];
  disclaimer: string;
}

export interface LegalRagQueryRequest {
  userQuery: string;
  jurisdiction?: string;
  targetZoneType?: string;
}

export interface LegalRagResponse {
  answer: string;
  facts: string[];
  legalSources: {
    actTitle: string;
    section: string;
    pageOrArticle: string;
    relevance: string;
    penalties?: string;
  }[];
  aiInterpretation: string;
  uncertaintiesAndGaps: string[];
  recommendedProceduralNextStep: string;
  disclaimer: string;
}

export interface MapsGroundingRequest {
  locationName: string;
  coordinates: { lat: number; lng: number };
  zoneType?: string;
}

export interface MapsGroundingResponse {
  resolvedLocation: string;
  groundedDescription: string;
  nearestRangerStation: string;
  riverOrWaterwayAccess: string;
  roadNetworkDistance: string;
  terrainSummary: string;
  geographicalVulnerability: string;
}

export interface FastTriageRequest {
  type: 'SENSOR_ANOMALY' | 'TIMBER_PERMIT_DISCREPANCY' | 'ACOUSTIC_SPIKE';
  data: Record<string, unknown>;
}

export interface FastTriageResponse {
  priority: 'ROUTINE' | 'PRIORITY' | 'IMMEDIATE_ACTION';
  recommendedDisposition: string;
  calculatedDiscrepancy?: string;
  triageNotes: string;
  triageLatencyMs: number;
}

// Client service functions calling backend proxy routes
export async function correlateSignalsWithGemini(
  request: CorrelateRequest
): Promise<CorrelateResponse> {
  try {
    const res = await fetch('/api/gemini/correlate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend Gemini proxy unavailable, using client-side fallback engine:', err);
    return getFallbackCorrelation(request);
  }
}

export async function analyzeVideoWithGeminiPro(
  request: VideoAnalysisRequest
): Promise<VideoAnalysisResponse> {
  try {
    const res = await fetch('/api/gemini/video-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend video analysis proxy unavailable, using fallback:', err);
    return getFallbackVideoAnalysis(request);
  }
}

export async function queryLegalIntelligenceRAG(
  request: LegalRagQueryRequest
): Promise<LegalRagResponse> {
  try {
    const res = await fetch('/api/gemini/legal-rag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend legal RAG proxy unavailable, using fallback:', err);
    return getFallbackLegalRag(request);
  }
}

export async function getMapsGroundingInfo(
  request: MapsGroundingRequest
): Promise<MapsGroundingResponse> {
  try {
    const res = await fetch('/api/gemini/maps-grounding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend maps grounding proxy unavailable, using fallback:', err);
    return {
      resolvedLocation: `${request.locationName} (${request.coordinates.lat.toFixed(4)}, ${request.coordinates.lng.toFixed(4)})`,
      groundedDescription: 'Grounded geographic profile in the Tapir Ridge & Rio Negro ecological corridor. Dense multi-tiered tropical canopy with seasonal inundation waterways.',
      nearestRangerStation: 'Tapir Ridge Outpost Alpha (8.4 km via river track)',
      riverOrWaterwayAccess: 'Emerald River tributary, navigable by medium draft patrol launch up to River Mile 38',
      roadNetworkDistance: '14.2 km from Highway BR-319 unpaved branch road',
      terrainSummary: 'Moderate undulating terrain, clay loam soil, 84% primary rainforest canopy density',
      geographicalVulnerability: 'Critical biodiversity corridor connecting Tapir Ridge Reserve with Northern Headwaters',
    };
  }
}

export async function performFastTriage(
  request: FastTriageRequest
): Promise<FastTriageResponse> {
  try {
    const res = await fetch('/api/gemini/fast-triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      priority: 'IMMEDIATE_ACTION',
      recommendedDisposition: 'HOLD_FOR_PHYSICAL_INSPECTION',
      calculatedDiscrepancy: '+52.2% volume discrepancy over declared transport quota',
      triageNotes: 'Fast triage detected anomalous timber density exceeding 0.92 g/cm³. High probability of protected hardwood substitution under guise of common softwoods.',
      triageLatencyMs: 145,
    };
  }
}

export async function generateExecutiveReportWithAi(
  reportType: string,
  timeRange: string,
  zone: string
): Promise<{ title: string; executiveSummary: string; keyFindings: string[]; recommendations: string[] }> {
  try {
    const res = await fetch('/api/gemini/generate-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportType, timeRange, zone }),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      title: `${reportType.toUpperCase()} - ${zone}`,
      executiveSummary: `Synthesized intelligence brief for ${zone} during ${timeRange}. Sensor triangulation and satellite change detection flagged 4 critical deforestation incursions and 2 timber volume discrepancies at border transit points. Zero legal concessions were found matching nocturnal heavy machinery signatures in strict core reserves.`,
      keyFindings: [
        'Acoustic nodes confirmed 2.85 kHz chainsaw frequencies in Tapir Ridge Sector 4B without forestry permit.',
        'High-resolution satellite delta calculated 4.8 ha canopy opening progressing towards wildlife migration corridors.',
        'Kupari border weighbridge recorded 48.9% mass surplus on flatbed truck TRK-9021-BR carrying disguised rosewood.',
        'All 4 incidents have been secured in the Digital Evidence Vault with SHA-256 cryptographic seals.',
      ],
      recommendations: [
        'Deploy Field Patrol Team Alpha for on-ground verification of extraction equipment in Tapir Ridge.',
        'Issue administrative detention order for suspect transport vehicle TRK-9021-BR.',
        'Schedule high-frequency PlanetScope daily satellite tasking over Northern Canopy Corridor.',
        'Refer evidence package EVD-2026-00412 to Public Environmental Prosecutor for formal judicial proceedings.',
      ],
    };
  }
}

// Fallbacks for offline / instant client preview
function getFallbackCorrelation(req: CorrelateRequest): CorrelateResponse {
  return {
    correlationSummary: `Multi-sensor fusion verified congruent spatial-temporal activity across ${req.signals.length} independent monitoring sources in ${req.location}. Optical equipment detected heavy mechanical transport congruent with continuous 2.85 kHz chainsaw acoustic signatures during prohibited nighttime hours.`,
    correlatedConfidence: 91,
    threatLevel: 'CRITICAL',
    reasoningChain: [
      '02:14 UTC: Acoustic Sensor Triangulator logged high-frequency chainsaw harmonic (2.85 kHz) for 142s.',
      '02:18 UTC: CCTV Camera CAM-041 triggered optical motion alert, classifying flatbed hauler and forestry loader with 89% confidence.',
      '02:22 UTC: Satellite Sentinel-2 MSI differential analysis confirmed 4.8 ha canopy disturbance.',
      '02:25 UTC: SISFLORA National Permit Registry query returned NULL records for commercial extraction at these coordinates.',
    ],
    supportingEvidence: [
      'Simultaneous spatial proximity within 350 meters radial error margin.',
      'Temporal synchronization within 6 minutes of mechanical ignition and acoustic cutting sound.',
      'Physical location lies 14 km inside gazetted non-extraction Core Protected Zone.',
    ],
    contradictingFactors: [
      'Ranger patrol unit Charlie was logged 6.8 km East (disproven as source of heavy machinery).',
    ],
    whyFlagged: [
      'Prohibited nighttime logging activity under National Forest Act 2022 Section 47.',
      'Absence of any active forestry concession or scientific research clearance.',
      'Risk of irreversible primary habitat loss in Tapir Ridge Biosphere.',
    ],
    investigatorChecklist: [
      'Inspect CAM-041 raw 4K night-vision frames for vehicle registration and cabin occupant silhouettes.',
      'Verify acoustic sensor decibel calibration against standard Stihl/Husqvarna chainsaw engine profiles.',
      'Dispatch Field Ranger Unit Alpha to seal access trail Delta and secure chain of custody.',
    ],
    legalProvisionsImplicated: [
      'National Forest Protection Act 2022 - Section 42 (Unlawful Mechanical Clearing)',
      'National Forest Protection Act 2022 - Section 47 (Nocturnal Hauling Prohibition)',
      'Protected Wildlife & Flora Conservation Code Title 18 Section 104',
    ],
    disclaimer:
      'AI DETECTS, AI CORRELATES, AI ASSISTS. HUMANS VERIFY. AUTHORIZED AUTHORITIES DECIDE. This analysis is an investigative aid and does not constitute a judicial conclusion of guilt.',
  };
}

function getFallbackVideoAnalysis(req: VideoAnalysisRequest): VideoAnalysisResponse {
  return {
    videoTitle: req.videoTitle,
    summary: `Computer vision deep analysis of 45-second high-resolution footage from ${req.cameraName} at ${req.location}. The system detected an unauthorized commercial flatbed truck with loaded roundwood stems and an accompanying tracked forestry excavator operating without lights.`,
    detectedEntities: [
      {
        label: 'Heavy Forestry Excavator (Tracked)',
        timestamp: '00:08',
        confidence: 94,
        description: 'Tracked hydraulic excavator with log grapple attachment clearing primary vegetation.',
        isSuspectActivity: true,
      },
      {
        label: 'Commercial Flatbed Hauler',
        timestamp: '00:15',
        confidence: 91,
        description: 'Multi-axle flatbed truck bearing Brazilian chassis profile loaded with freshly felled timber logs.',
        isSuspectActivity: true,
      },
      {
        label: 'Chainsaw Operator Silhouette',
        timestamp: '00:26',
        confidence: 86,
        description: 'Individual wearing dark clothing operating gasoline chainsaw near tailgate.',
        isSuspectActivity: true,
      },
      {
        label: 'Thermal Engine Exhaust Plume',
        timestamp: '00:34',
        confidence: 92,
        description: 'High heat bloom indicative of continuous heavy diesel engine load under towing stress.',
        isSuspectActivity: false,
      },
    ],
    temporalTimeline: [
      { timeOffset: '00:04', event: 'Optical tripwire triggered by moving vehicle silhouette', severity: 'SUSPICIOUS' },
      { timeOffset: '00:12', event: 'Excavator grapple identified positioning logs onto truck bed', severity: 'CRITICAL' },
      { timeOffset: '00:28', event: 'Partial license plate AMZ-88** illuminated by auxiliary work lights', severity: 'CRITICAL' },
      { timeOffset: '00:42', event: 'Convoys exit frame navigating Southward towards unpaved logging trail', severity: 'SUSPICIOUS' },
    ],
    vehiclePlateObservation: 'Partial read: AMZ-8894 (Pending forensic contrast enhancement)',
    equipmentIdentified: ['Tracked Excavator with hydraulic grapple', 'Twin-axle Timber Flatbed Hauler', 'Gasoline Chainsaw (~70cc class)'],
    forestImpactAssessment: 'Direct mechanical canopy breach with soil compaction across an 8-meter corridor.',
    recommendedNextActions: [
      'Export high-resolution video frames with SHA-256 seal to Evidence Repository.',
      'Alert Kupari Border Checkpoint to intercept vehicle matching AMZ-8894.',
      'Forward footage to Lead Investigator Marcus Reed for Case CASE-2026-0089.',
    ],
    disclaimer:
      'Computer vision classifications assist human inspectors and must be verified by sworn investigators before legal actions are initiated.',
  };
}

function getFallbackLegalRag(req: LegalRagQueryRequest): LegalRagResponse {
  return {
    answer: `Under the National Forest & Biodiversity Protection Act of 2022 (Section 42 and Section 47) and Timber Transit Regulation 2024 (Article 8 & 14), commercial logging and timber transit through protected and buffer zones require explicit prior statutory authorization. Specifically, all mechanical logging within Core Protected Nature Reserves is strictly prohibited, and nocturnal transit between 18:00 and 06:00 is barred even for valid commercial concessions without a specialized night permit. Furthermore, transport permits are void ab initio if physical scale volume exceeds declared volume by more than 5%.`,
    facts: [
      'Section 42 of NFBPA-2022 establishes zero-tolerance mechanical entry for core nature reserves.',
      'Section 47 of NFBPA-2022 enacts a mandatory nocturnal transit curfew from 18:00 to 06:00 local time.',
      'Timber Transit Regulation 2024 Rule 14 mandates route geometry transponder tracking through all buffer corridors.',
      'Statutory volume tolerance threshold is capped strictly at 5.0% by electronic weighbridge measurement.',
    ],
    legalSources: [
      {
        actTitle: 'National Forest & Biodiversity Protection Act of 2022',
        section: 'Section 42',
        pageOrArticle: 'Page 28 (Official Gazette No. 84)',
        relevance: 'Defines unauthorized entry with chainsaws and mechanical equipment as a Category A statutory crime.',
        penalties: 'Mandatory vehicle forfeiture, 3-8 years custodial sentence, and $50,000/ha civil restoration fine.',
      },
      {
        actTitle: 'National Forest & Biodiversity Protection Act of 2022',
        section: 'Section 47',
        pageOrArticle: 'Page 32',
        relevance: 'Prohibits nighttime hauling and felling of logs between 18:00 and 06:00 hours.',
        penalties: '180-day license suspension and $25,000 administrative penalty.',
      },
      {
        actTitle: 'Timber Transit and Electronic Manifest Regulation (Regulation 2024/14)',
        section: 'Article 8 & Article 14',
        pageOrArticle: 'Pages 12 & 18',
        relevance: 'Empowers checkpoint officers to detain vehicles with volume discrepancy > 5% or suspected protected species substitution.',
        penalties: '72-hour administrative vehicle hold, cargo seizure, and public prosecutor referral.',
      },
    ],
    aiInterpretation:
      'AI Analysis: Operating chainsaws or transporting timber inside Tapir Ridge Reserve at night constitutes a prima facie violation of Sections 42 and 47. Any accompanying discrepancy at the Kupari checkpoint triggers Article 8 detention powers.',
    uncertaintiesAndGaps: [
      'Whether the subject vehicle holds a registered emergency road clearance authorization from the Regional Directorate (requires manual registry query).',
      'Definitive species identification requires laboratory microscopic wood anatomy examination to confirm CITES Appendix status.',
    ],
    recommendedProceduralNextStep:
      'Issue an Administrative Vehicle Detention Order (Form ADO-04) and refer the verified incident package to the Environmental Public Prosecutor for formal indictment.',
    disclaimer:
      'STATUTORY NOTICE: This legal analysis is generated by FORESTGUARD Legal RAG for decision-support purposes only. Final charging decisions and judicial orders must be executed exclusively by licensed legal counsel and sworn environmental magistrates.',
  };
}
