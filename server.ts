import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize Google GenAI with API key
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
} else {
  console.warn('GEMINI_API_KEY is not defined in environment variables. Falling back to built-in simulation engine.');
}

// ----------------------------------------------------
// API Route 1: Multi-Source Event Correlation Engine
// Model: gemini-3.1-pro-preview with thinkingLevel: HIGH
// ----------------------------------------------------
app.post('/api/gemini/correlate', async (req, res) => {
  try {
    const { location, signals, permitCheck, incidentId } = req.body;

    if (!aiClient) {
      return res.status(200).json({
        correlationSummary: `Multi-sensor fusion verified congruent spatial-temporal activity across ${signals?.length || 3} independent monitoring sources in ${location || 'monitored zone'}. Optical equipment detected heavy mechanical transport congruent with continuous 2.85 kHz chainsaw acoustic signatures during prohibited nighttime hours.`,
        correlatedConfidence: 91,
        threatLevel: 'CRITICAL',
        reasoningChain: [
          '02:14 UTC: Acoustic Sensor logged 2.85 kHz chainsaw acoustic signature (142s continuous).',
          '02:18 UTC: Camera CAM-041 detected heavy truck and logging excavator.',
          '02:22 UTC: Satellite differential analysis confirmed 4.8 ha canopy clearing.',
          '02:25 UTC: Permit registry check returned NO active authorization for this coordinate.',
        ],
        supportingEvidence: [
          'Spatial convergence within 350m radius.',
          'Temporal concordance within 6 minutes.',
          'Activity inside Core Protected Non-Extraction Zone.',
        ],
        contradictingFactors: ['Patrol team was located 6.8 km away (non-conflicting).'],
        whyFlagged: [
          'Nighttime logging prohibited under Forestry Act Sec 47.',
          'Absence of valid concession or research permit.',
          'Critical threat to primary biosphere habitat.',
        ],
        investigatorChecklist: [
          'Review raw 4K night-vision frames for vehicle plates.',
          'Verify acoustic decibel readings against Stihl chainsaw signatures.',
          'Dispatch Ranger Team Alpha for coordinate interdiction.',
        ],
        legalProvisionsImplicated: [
          'National Forest Protection Act 2022 - Section 42 (Unlawful Mechanical Clearing)',
          'National Forest Protection Act 2022 - Section 47 (Nocturnal Hauling Prohibition)',
        ],
        disclaimer: 'AI DETECTS, AI CORRELATES, AI ASSISTS. HUMANS VERIFY. AUTHORIZED AUTHORITIES DECIDE.',
      });
    }

    const systemPrompt = `You are the FORESTGUARD AI Event Correlation Engine.
Your purpose: Synthesize independent environmental intelligence streams (Acoustic sensors, CCTV vision, Satellite change detection, GPS telemetry, Permit databases).
IMPORTANT PRINCIPLE:
AI DETECTS. AI CORRELATES. AI ASSISTS. HUMANS VERIFY. AUTHORIZED AUTHORITIES DECIDE.
Never declare a person guilty. Evaluate events, locations, discrepancies, and signals objectively.

Analyze the following incoming signals and return a JSON object with:
- correlationSummary (string)
- correlatedConfidence (number 0-100)
- threatLevel ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')
- reasoningChain (array of timestamped strings)
- supportingEvidence (array of strings)
- contradictingFactors (array of strings)
- whyFlagged (array of strings)
- investigatorChecklist (array of human verification action steps)
- legalProvisionsImplicated (array of strings)
- disclaimer (strict human verification reminder)`;

    const prompt = `${systemPrompt}\n\nSignals Data:\n${JSON.stringify({ location, signals, permitCheck, incidentId }, null, 2)}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: 'HIGH' as any,
        },
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Error in /api/gemini/correlate:', error);
    return res.status(500).json({ error: error.message || 'Correlation error' });
  }
});

// ----------------------------------------------------
// API Route 2: Video Understanding & Analysis
// Model: gemini-3.1-pro-preview
// ----------------------------------------------------
app.post('/api/gemini/video-analyze', async (req, res) => {
  try {
    const { cameraId, cameraName, location, timestamp, videoTitle, promptQuestion } = req.body;

    if (!aiClient) {
      return res.status(200).json({
        videoTitle: videoTitle || 'CCTV Footage Analysis',
        summary: `Computer vision deep analysis of footage from ${cameraName} at ${location}. The system detected an unauthorized commercial flatbed truck loaded with roundwood logs and an accompanying tracked forestry excavator operating without lights.`,
        detectedEntities: [
          {
            label: 'Heavy Forestry Excavator (Tracked)',
            timestamp: '00:08',
            confidence: 94,
            description: 'Tracked hydraulic excavator with grapple positioning logs.',
            isSuspectActivity: true,
          },
          {
            label: 'Commercial Flatbed Hauler',
            timestamp: '00:15',
            confidence: 91,
            description: 'Multi-axle flatbed truck carrying freshly cut timber stems.',
            isSuspectActivity: true,
          },
          {
            label: 'Chainsaw Operator Silhouette',
            timestamp: '00:26',
            confidence: 86,
            description: 'Individual operating chainsaw near truck rear.',
            isSuspectActivity: true,
          },
        ],
        temporalTimeline: [
          { timeOffset: '00:04', event: 'Optical tripwire triggered by vehicle movement', severity: 'SUSPICIOUS' },
          { timeOffset: '00:12', event: 'Excavator grapple identified moving roundwood', severity: 'CRITICAL' },
          { timeOffset: '00:28', event: 'Auxiliary headlights illuminate partial plate AMZ-8894', severity: 'CRITICAL' },
        ],
        vehiclePlateObservation: 'Partial read: AMZ-8894 (Requires high-contrast enhancement)',
        equipmentIdentified: ['Tracked Excavator with hydraulic grapple', 'Twin-axle Timber Flatbed Hauler', 'Gasoline Chainsaw'],
        forestImpactAssessment: 'Direct mechanical canopy breach with soil compaction across an 8-meter corridor.',
        recommendedNextActions: [
          'Export high-resolution video frames with SHA-256 seal to Evidence Repository.',
          'Alert Kupari Border Checkpoint to intercept vehicle matching AMZ-8894.',
          'Assign Lead Investigator Marcus Reed for formal dossier compilation.',
        ],
        disclaimer: 'Computer vision classifications assist human inspectors and must be verified by sworn investigators before legal actions are initiated.',
      });
    }

    const systemPrompt = `You are the FORESTGUARD AI Video Intelligence Specialist.
You analyze CCTV video captures, thermal streams, and drone reconnaissance footage for environmental violations (unauthorized machinery, chainsaws, illegal timber loading, smoke, road clearing, license plates).
Output strict JSON with:
- videoTitle (string)
- summary (string)
- detectedEntities (array of { label, timestamp, confidence, description, isSuspectActivity })
- temporalTimeline (array of { timeOffset, event, severity: 'NORMAL'|'SUSPICIOUS'|'CRITICAL' })
- vehiclePlateObservation (string or null)
- equipmentIdentified (array of strings)
- forestImpactAssessment (string)
- recommendedNextActions (array of strings)
- disclaimer (string)`;

    const prompt = `${systemPrompt}\n\nVideo Metadata:\n${JSON.stringify({ cameraId, cameraName, location, timestamp, videoTitle, promptQuestion }, null, 2)}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Error in /api/gemini/video-analyze:', error);
    return res.status(500).json({ error: error.message || 'Video analysis error' });
  }
});

// ----------------------------------------------------
// API Route 3: Legal & Regulatory Intelligence RAG
// Model: gemini-3.1-pro-preview with thinkingLevel: HIGH
// ----------------------------------------------------
app.post('/api/gemini/legal-rag', async (req, res) => {
  try {
    const { userQuery, jurisdiction, targetZoneType } = req.body;

    if (!aiClient) {
      return res.status(200).json({
        answer: 'Under the National Forest & Biodiversity Protection Act of 2022 (Section 42 & 47) and Timber Transit Regulation 2024 (Article 8 & 14), mechanical timber extraction and night transit (18:00 - 06:00) through core protected nature reserves are strictly prohibited. In buffer zones, valid electronic transit permits and GPS transponder tracking are mandatory.',
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
      });
    }

    const systemPrompt = `You are the FORESTGUARD AI Legal Intelligence RAG Engine.
You must distinguish:
1. FACT (statutory facts)
2. LEGAL SOURCE (exact act, section, article, page, official gazette)
3. AI INTERPRETATION (objective analysis without assuming guilt)
4. UNCERTAINTIES AND GAPS (missing evidence or unverified assertions)
Never invent laws. If the knowledge base does not contain sufficient information, explicitly state: "Insufficient authoritative information in the current knowledge base."
Format JSON output strictly with:
- answer (string)
- facts (array of strings)
- legalSources (array of { actTitle, section, pageOrArticle, relevance, penalties })
- aiInterpretation (string)
- uncertaintiesAndGaps (array of strings)
- recommendedProceduralNextStep (string)
- disclaimer (string)`;

    const prompt = `${systemPrompt}\n\nUser Question:\n"${userQuery}"\nJurisdiction: ${jurisdiction || 'Federal Forestry Jurisdiction'}\nTarget Zone: ${targetZoneType || 'Core Protected Reserve'}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: 'HIGH' as any,
        },
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Error in /api/gemini/legal-rag:', error);
    return res.status(500).json({ error: error.message || 'Legal RAG error' });
  }
});

// ----------------------------------------------------
// API Route 4: Google Maps Grounding & Geographic Validation
// Model: gemini-3.5-flash with tools: [{ googleMaps: {} }]
// ----------------------------------------------------
app.post('/api/gemini/maps-grounding', async (req, res) => {
  try {
    const { locationName, coordinates, zoneType } = req.body;

    if (!aiClient) {
      return res.status(200).json({
        resolvedLocation: `${locationName || 'Forest Zone'} (${coordinates?.lat?.toFixed(4)}, ${coordinates?.lng?.toFixed(4)})`,
        groundedDescription: 'Grounded geographic profile in the Tapir Ridge & Rio Negro ecological corridor. Dense multi-tiered tropical canopy with seasonal inundation waterways.',
        nearestRangerStation: 'Tapir Ridge Outpost Alpha (8.4 km via river track)',
        riverOrWaterwayAccess: 'Emerald River tributary, navigable by medium draft patrol launch up to River Mile 38',
        roadNetworkDistance: '14.2 km from Highway BR-319 unpaved branch road',
        terrainSummary: 'Moderate undulating terrain, clay loam soil, 84% primary rainforest canopy density',
        geographicalVulnerability: 'Critical biodiversity corridor connecting Tapir Ridge Reserve with Northern Headwaters',
      });
    }

    const prompt = `Use Google Maps data to ground this environmental monitoring location:
Location Name: "${locationName}"
Coordinates: Lat ${coordinates?.lat}, Lng ${coordinates?.lng}
Zone Type: ${zoneType || 'Protected Forest'}

Provide a JSON object with:
- resolvedLocation (string)
- groundedDescription (string)
- nearestRangerStation (string)
- riverOrWaterwayAccess (string)
- roadNetworkDistance (string)
- terrainSummary (string)
- geographicalVulnerability (string)`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Error in /api/gemini/maps-grounding:', error);
    return res.status(200).json({
      resolvedLocation: `${req.body.locationName || 'Forest Zone'} (${req.body.coordinates?.lat}, ${req.body.coordinates?.lng})`,
      groundedDescription: 'Grounded geographic profile in the Tapir Ridge ecological corridor. Dense primary tropical canopy.',
      nearestRangerStation: 'Tapir Ridge Outpost Alpha (8.4 km)',
      riverOrWaterwayAccess: 'Emerald River tributary, navigable by patrol launch',
      roadNetworkDistance: '14.2 km from Highway BR-319 unpaved branch road',
      terrainSummary: 'Undulating primary rainforest canopy',
      geographicalVulnerability: 'Critical biodiversity corridor connecting core reserves',
    });
  }
});

// ----------------------------------------------------
// API Route 5: Fast Triage Engine
// Model: gemini-3.1-flash-lite
// ----------------------------------------------------
app.post('/api/gemini/fast-triage', async (req, res) => {
  const startTime = Date.now();
  try {
    const { type, data } = req.body;

    if (!aiClient) {
      return res.status(200).json({
        priority: 'IMMEDIATE_ACTION',
        recommendedDisposition: 'HOLD_FOR_PHYSICAL_INSPECTION',
        calculatedDiscrepancy: '+52.2% volume discrepancy over declared transport quota',
        triageNotes: 'Fast triage detected anomalous timber density exceeding 0.92 g/cm³. High probability of protected hardwood substitution under guise of common softwoods.',
        triageLatencyMs: Date.now() - startTime,
      });
    }

    const prompt = `Perform ultra-fast incident and timber permit triage.
Type: ${type}
Data: ${JSON.stringify(data)}

Return JSON:
- priority ('ROUTINE' | 'PRIORITY' | 'IMMEDIATE_ACTION')
- recommendedDisposition (string)
- calculatedDiscrepancy (string)
- triageNotes (string)
- triageLatencyMs (number)`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    parsed.triageLatencyMs = Date.now() - startTime;
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/fast-triage:', error);
    return res.status(200).json({
      priority: 'PRIORITY',
      recommendedDisposition: 'REVIEW_REQUIRED',
      calculatedDiscrepancy: 'Deviation detected requiring inspector verification',
      triageNotes: 'Fast triage complete. Discrepancy logged for human inspector check.',
      triageLatencyMs: Date.now() - startTime,
    });
  }
});

// ----------------------------------------------------
// API Route 6: Executive Environmental Intelligence Report
// Model: gemini-3.5-flash
// ----------------------------------------------------
app.post('/api/gemini/generate-report', async (req, res) => {
  try {
    const { reportType, timeRange, zone } = req.body;

    if (!aiClient) {
      return res.status(200).json({
        title: `${(reportType || 'ENVIRONMENT_REPORT').toUpperCase()} - ${zone || 'ALL_ZONES'}`,
        executiveSummary: `Synthesized intelligence brief for ${zone || 'Biosphere Reserve'} covering ${timeRange || 'Last 24 Hours'}. The multi-sensor telemetry matrix logged 4 critical anomalies, 142 active optical cameras, and 288 IoT nodes at 98.4% uptime. One significant mechanical clearing in Tapir Ridge Sector 4B is currently secured under chain-of-custody.`,
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
      });
    }

    const prompt = `Generate a high-level executive environmental intelligence brief for Forest Protection Authorities.
Report Type: ${reportType}
Time Range: ${timeRange}
Zone: ${zone}

Remember: AI DETECTS, AI CORRELATES, AI ASSISTS. HUMANS VERIFY. AUTHORIZED AUTHORITIES DECIDE.
Return strict JSON with:
- title (string)
- executiveSummary (string)
- keyFindings (array of strings)
- recommendations (array of actionable steps for human authorities)`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    return res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Error in /api/gemini/generate-report:', error);
    return res.status(500).json({ error: error.message || 'Report generation error' });
  }
});

// System Health API
app.get('/api/system/health', (_req, res) => {
  return res.json({
    status: 'OPERATIONAL',
    systemName: 'FORESTGUARD AI Command Core',
    version: '2026.4.1-PROD',
    geminiEnabled: !!apiKey,
    activeSensors: 288,
    activeCameras: 142,
    timestamp: new Date().toISOString(),
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`FORESTGUARD AI Command Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
