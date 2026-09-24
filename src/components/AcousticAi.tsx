import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Radio,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Sliders,
  Compass,
  MapPin,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { AcousticSensorReading } from '../types/forestguard';
import { MOCK_ACOUSTIC_READINGS } from '../services/mockData';

export const AcousticAi: React.FC = () => {
  const [readings, setReadings] = useState<AcousticSensorReading[]>(MOCK_ACOUSTIC_READINGS);
  const [selectedReading, setSelectedReading] = useState<AcousticSensorReading>(MOCK_ACOUSTIC_READINGS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeFrequencyBand, setActiveFrequencyBand] = useState<string>('2,850 Hz (Chainsaw Primary)');
  const [simulatedLiveDecibels, setSimulatedLiveDecibels] = useState<number>(78.4);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setSimulatedLiveDecibels((prev) => {
          const delta = (Math.random() - 0.48) * 3;
          return Math.max(55, Math.min(88, +(prev + delta).toFixed(1)));
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const getClassificationBadge = (cls: AcousticSensorReading['classification']) => {
    switch (cls) {
      case 'CHAINSAW_LIKE_SOUND':
        return 'bg-red-950 text-red-300 border-red-700/60';
      case 'HEAVY_MACHINERY':
        return 'bg-orange-950 text-orange-300 border-orange-700/60';
      case 'EXPLOSION_OR_GUNSHOT':
        return 'bg-rose-950 text-rose-300 border-rose-700/60';
      case 'VEHICLE_ENGINE':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-700/60';
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto text-slate-100 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1612] p-4 rounded-xl border border-emerald-950/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              ACOUSTIC SENSING
            </span>
            <h1 className="text-lg font-bold text-slate-100">
              ACOUSTIC AI & BIOACOUSTIC MONITORING
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Continuous 24/7 Edge Spectral Analysis • Chainsaw, Vehicle & Explosion Triangulation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50 text-xs">
            • 42 NODES ACTIVE IN TAPIR RIDGE
          </span>
        </div>
      </div>

      {/* Main Acoustic Analysis Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Waveform, Spectrogram, Decibels */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl bg-[#091510] border border-emerald-900/60 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 text-sm">
                    {selectedReading.sensorName}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${getClassificationBadge(
                      selectedReading.classification
                    )}`}
                  >
                    {selectedReading.classification.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  {selectedReading.zone} • Radial Bearing 142°
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">AI CONFIDENCE:</span>
                <span className="text-base font-extrabold text-amber-400">
                  {selectedReading.confidence}%
                </span>
              </div>
            </div>

            {/* Audio Waveform Canvas Box */}
            <div className="p-4 rounded-xl bg-black border border-emerald-950/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  REAL-TIME SPECTRAL WAVEFORM (48 kHz MEMS)
                </span>
                <span className="text-emerald-400 font-bold">
                  PEAK FREQUENCY: {selectedReading.frequencyPeakHz} Hz
                </span>
              </div>

              {/* Dynamic Animated Waveform */}
              <div className="h-28 flex items-end gap-1 px-2 bg-[#06100b] rounded-lg border border-emerald-950/60">
                {selectedReading.waveformSample.map((val, idx) => {
                  const animatedVal = isPlayingAudio
                    ? Math.max(10, Math.min(100, val + (Math.sin(idx + Date.now() / 200) * 18)))
                    : val;
                  return (
                    <div
                      key={idx}
                      style={{ height: `${animatedVal}%` }}
                      className={`flex-1 rounded-t transition-all duration-150 ${
                        selectedReading.classification === 'CHAINSAW_LIKE_SOUND'
                          ? 'bg-amber-400 hover:bg-emerald-400'
                          : 'bg-emerald-500'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Audio Player Controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="p-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
                  >
                    {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingAudio ? 'PAUSE PLAYBACK' : 'PLAY ACOUSTIC SAMPLE'}</span>
                  </button>

                  <span className="text-xs text-slate-400 font-sans">
                    Duration: {selectedReading.durationSeconds}s
                  </span>
                </div>

                {/* Decibel Indicator */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">AMPLITUDE:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      simulatedLiveDecibels > 75
                        ? 'bg-red-950 text-red-300 border border-red-800/50'
                        : 'bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    {simulatedLiveDecibels} dB
                  </span>
                </div>
              </div>
            </div>

            {/* Spectrogram Frequency Spectrum View */}
            <div className="p-3 rounded-lg bg-[#06100b] border border-emerald-950 space-y-2 text-xs">
              <span className="text-slate-400 font-bold block">
                FREQUENCY HARMONIC BANDS (FFT 2048-POINT):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded bg-[#091510] border border-emerald-900/50">
                  <span className="text-slate-500 block">0 - 500 Hz (Diesel)</span>
                  <span className="text-slate-300 font-bold">Low (18 dB)</span>
                </div>
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60">
                  <span className="text-amber-400 font-bold block">2.0 - 3.2 kHz (Chainsaw)</span>
                  <span className="text-amber-300 font-bold">DOMINANT (78.4 dB)</span>
                </div>
                <div className="p-2 rounded bg-[#091510] border border-emerald-900/50">
                  <span className="text-slate-500 block">4 - 8 kHz (Avian)</span>
                  <span className="text-slate-300 font-bold">Suppressed (-14 dB)</span>
                </div>
                <div className="p-2 rounded bg-[#091510] border border-emerald-900/50">
                  <span className="text-slate-500 block">8+ kHz (Insects)</span>
                  <span className="text-slate-300 font-bold">Ambient (22 dB)</span>
                </div>
              </div>
            </div>

            {/* Principle Warning Banner */}
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 font-sans leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono text-amber-300 block mb-0.5">
                  LEGAL SAFEGUARD PRINCIPLE:
                </span>
                Acoustic AI detects chainsaw-like or mechanical acoustic signatures. The platform does NOT automatically declare the sound as an illegal crime without verifying spatial coordinates against licensed logging plans and on-ground ranger validation.
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Acoustic Sensor Nodes Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pb-1 border-b border-emerald-950">
            <span>DETECTED ACOUSTIC EVENTS</span>
            <span className="text-slate-400 text-[10px]">RECENT LOGS</span>
          </div>

          <div className="space-y-2">
            {readings.map((r, i) => {
              const isSelected = r.sensorId === selectedReading.sensorId;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedReading(r)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500/70 shadow-lg'
                      : 'bg-[#09140f] border-emerald-950 hover:border-emerald-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{r.sensorName}</span>
                    <span className="text-emerald-400 font-bold">{r.confidence}%</span>
                  </div>

                  <div className="mt-1 text-[11px] font-sans text-slate-300">
                    {r.classification.replace(/_/g, ' ')}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-emerald-950/60 font-mono">
                    <span>{r.decibels} dB</span>
                    <span>{r.timestamp.split(' ')[1]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
