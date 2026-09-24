import React, { useState } from 'react';
import {
  Scale,
  BookOpen,
  Search,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Shield,
  Layers,
  Info,
} from 'lucide-react';
import { LegalDocument } from '../types/forestguard';
import { MOCK_LEGAL_DOCUMENTS } from '../services/mockData';
import { queryLegalIntelligenceRAG, LegalRagResponse } from '../services/geminiService';

export const LegalRag: React.FC = () => {
  const [documents] = useState<LegalDocument[]>(MOCK_LEGAL_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument>(MOCK_LEGAL_DOCUMENTS[0]);
  const [userQuery, setUserQuery] = useState<string>(
    'What authorization is required for timber transportation through a protected buffer zone at night, and what are the penalties for a volume discrepancy exceeding 5%?'
  );
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [ragResult, setRagResult] = useState<LegalRagResponse | null>(null);

  const sampleQueries = [
    'What authorization is required for timber transportation through a protected buffer zone at night?',
    'What are the statutory powers of checkpoint officers if volumetric scale reading deviates by more than 5%?',
    'Is mechanical chainsaw entry permitted in Core Strict Nature Reserves under any circumstances?',
    'What special permits are mandated for CITES Appendix timber species like Brazilian Rosewood?',
  ];

  const handleExecuteRag = async (queryText?: string) => {
    const q = queryText || userQuery;
    if (!q.trim()) return;
    setIsQuerying(true);
    setRagResult(null);

    try {
      const res = await queryLegalIntelligenceRAG({
        userQuery: q,
        jurisdiction: 'Federal Environmental Protection Authority',
        targetZoneType: 'Core & Buffer Forest Zones',
      });
      setRagResult(res);
    } catch (err) {
      console.error('Legal RAG query failed:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1612] p-4 rounded-xl border border-emerald-950/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              LEGAL INTELLIGENCE
            </span>
            <h1 className="text-lg font-bold text-slate-100">
              LEGAL INTELLIGENCE & STATUTORY RAG
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Strict Retrieval-Augmented Generation • Authoritative Forest Acts, Transit Codes & Environmental Statutes
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800/50 text-emerald-300">
            ENGINE: gemini-3.1-pro-preview • HIGH THINKING
          </span>
        </div>
      </div>

      {/* Query Bar */}
      <div className="p-4 rounded-xl bg-[#091510] border border-emerald-900/60 space-y-3">
        <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
          QUERY AUTHORITATIVE LEGAL KNOWLEDGE BASE:
        </label>
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecuteRag()}
            placeholder="Ask questions about forest acts, transport permits, weighbridge tolerances, or legal penalties..."
            className="flex-1 bg-[#111a15] border border-emerald-900/60 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            onClick={() => handleExecuteRag()}
            disabled={isQuerying}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 shrink-0"
          >
            {isQuerying ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>DEEP STATUTORY REASONING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>QUERY LEGAL RAG</span>
              </>
            )}
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-500 font-bold">SUGGESTED:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setUserQuery(sq);
                handleExecuteRag(sq);
              }}
              className="text-[10px] px-2 py-0.5 rounded bg-[#111f18] hover:bg-emerald-950 text-emerald-300 border border-emerald-900/40 transition-colors truncate max-w-xs"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid: Knowledge Base Documents (Left) and RAG Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 1 Col: Ingested Legal Documents */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pb-1 border-b border-emerald-950">
            <span>OFFICIAL LEGAL SOURCES ({documents.length})</span>
            <span className="text-slate-400 text-[10px]">VERIFIED ACTS</span>
          </div>

          <div className="space-y-2">
            {documents.map((doc) => {
              const isSelected = selectedDoc.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500/70 shadow-lg'
                      : 'bg-[#09140f] border-emerald-950 hover:border-emerald-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300">{doc.shortCode}</span>
                    <span className="text-[10px] text-slate-400">{doc.documentDate}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 font-sans mt-1 leading-snug">
                    {doc.title}
                  </h4>
                  <div className="text-[10px] text-slate-500 mt-1 truncate">
                    {doc.officialSource}
                  </div>
                  <div className="mt-2 pt-1 border-t border-emerald-950/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{doc.sections.length} Sections Ingested</span>
                    <span className="text-emerald-400">{doc.category}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Document Sections Browser */}
          <div className="p-3 rounded-xl bg-[#091510] border border-emerald-950 space-y-2 text-xs">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">
              {selectedDoc.shortCode} SECTIONS:
            </span>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {selectedDoc.sections.map((sec, i) => (
                <div key={i} className="p-2 rounded bg-[#06100b] border border-emerald-950/60 space-y-1">
                  <div className="flex items-center justify-between text-emerald-400 font-bold text-[11px]">
                    <span>{sec.sectionNumber}: {sec.title}</span>
                    <span className="text-slate-500 text-[10px]">p. {sec.page}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    {sec.text}
                  </p>
                  {sec.penalties && (
                    <div className="text-[10px] text-rose-300 pt-1 border-t border-emerald-950">
                      <span className="font-bold">PENALTIES: </span>
                      {sec.penalties}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Formatted Legal RAG Analysis */}
        <div className="lg:col-span-2 space-y-4">
          {ragResult ? (
            <div className="p-4 rounded-xl bg-[#091510] border border-emerald-900/60 space-y-4 shadow-xl">
              {/* Answer Header */}
              <div className="pb-3 border-b border-emerald-950">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    AUTHORIZED LEGAL SYNTHESIS
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Jurisdiction: Federal Environmental Authority
                  </span>
                </div>
                <p className="text-slate-100 font-sans text-xs leading-relaxed mt-2 bg-[#06100b] p-3 rounded-lg border border-emerald-950">
                  {ragResult.answer}
                </p>
              </div>

              {/* Strict 4-Part Structure */}
              {/* 1. FACT */}
              <div className="p-3 rounded-lg bg-[#06100b] border border-emerald-950 space-y-1.5">
                <span className="text-xs font-bold text-emerald-400 block uppercase">
                  1. STATUTORY FACTS:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-200 font-sans text-xs">
                  {ragResult.facts.map((fact, idx) => (
                    <li key={idx} className="leading-snug">{fact}</li>
                  ))}
                </ul>
              </div>

              {/* 2. LEGAL SOURCES WITH CITATIONS */}
              <div className="p-3 rounded-lg bg-[#06100b] border border-emerald-950 space-y-2">
                <span className="text-xs font-bold text-emerald-400 block uppercase">
                  2. AUTHORITATIVE LEGAL SOURCES & CITATIONS:
                </span>
                <div className="space-y-2">
                  {ragResult.legalSources.map((src, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-[#091510] border border-emerald-900/50 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-100">
                        <span className="text-emerald-300">{src.actTitle} ({src.section})</span>
                        <span className="text-slate-400 text-[10px]">{src.pageOrArticle}</span>
                      </div>
                      <p className="text-slate-300 font-sans text-[11px]">
                        {src.relevance}
                      </p>
                      {src.penalties && (
                        <div className="text-[10px] text-rose-400 font-mono">
                          <span className="font-bold">STATUTORY PENALTY:</span> {src.penalties}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. AI INTERPRETATION */}
              <div className="p-3 rounded-lg bg-[#06100b] border border-emerald-950 space-y-1 text-xs">
                <span className="font-bold text-emerald-400 block uppercase">
                  3. OBJECTIVE AI INTERPRETATION:
                </span>
                <p className="text-slate-200 font-sans leading-relaxed">
                  {ragResult.aiInterpretation}
                </p>
              </div>

              {/* 4. UNCERTAINTIES & GAPS */}
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-1 text-xs">
                <span className="font-bold text-amber-400 block uppercase">
                  4. UNCERTAINTIES & MISSING FACTUAL DATA:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-amber-200/90 font-sans text-xs">
                  {ragResult.uncertaintiesAndGaps.map((gap, idx) => (
                    <li key={idx}>{gap}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Procedural Step */}
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs">
                <span className="font-bold text-emerald-400 block uppercase text-[10px] mb-1">
                  RECOMMENDED PROCEDURAL NEXT STEP FOR HUMAN AUTHORITIES:
                </span>
                <p className="text-slate-100 font-sans font-bold">
                  {ragResult.recommendedProceduralNextStep}
                </p>
              </div>

              {/* Statutory Disclaimer */}
              <div className="text-[10px] text-slate-500 font-sans leading-relaxed pt-2 border-t border-emerald-950">
                {ragResult.disclaimer}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-xl bg-[#091510] border border-emerald-950/80 text-xs text-slate-400 space-y-2">
              <Scale className="w-8 h-8 text-emerald-500/50 mx-auto" />
              <p className="font-bold text-slate-300">LEGAL RAG KNOWLEDGE BASE READY</p>
              <p className="max-w-md mx-auto font-sans text-slate-500">
                Enter any query above or select a suggested topic to perform deep statutory reasoning across verified forest acts, transport rules, and environmental penal codes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
