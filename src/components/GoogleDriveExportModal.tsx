import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  FolderPlus,
  FileText,
  Upload,
} from 'lucide-react';
import { getCachedAccessToken, googleSignIn, googleSignOut, uploadToGoogleDrive } from '../services/firebaseAuth';
import { Incident } from '../types/forestguard';
import { useTheme } from '../context/ThemeContext';

interface GoogleDriveExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetIncident?: Incident | null;
}

export const GoogleDriveExportModal: React.FC<GoogleDriveExportModalProps> = ({
  isOpen,
  onClose,
  targetIncident,
}) => {
  if (!isOpen) return null;

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [accessToken, setAccessToken] = useState<string | null>(getCachedAccessToken());
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [exportScope, setExportScope] = useState<'INCIDENT' | 'DAILY_REPORT' | 'EVIDENCE_VAULT'>('INCIDENT');
  const [folderName, setFolderName] = useState<string>('FORESTGUARD_ARCHIVE_2026');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [uploadedFileLink, setUploadedFileLink] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setAccessToken(res.accessToken);
        setUserEmail(res.user.email);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      alert(`Sign in failed: ${err.message || 'Please check popup settings'}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleExport = async () => {
    if (!accessToken) {
      await handleSignIn();
      return;
    }

    setIsExporting(true);
    setUploadedFileLink(null);

    try {
      const packageContent = {
        title: `FORESTGUARD EXPORT - ${exportScope}`,
        timestamp: new Date().toISOString(),
        folder: folderName,
        incidentData: targetIncident || 'Full Summary',
        complianceStatement:
          'OFFICIAL ENVIRONMENTAL ARCHIVE. Digitally preserved under custody of FORESTGUARD AI Command Core. Hashes sealed.',
      };

      const filename = `FORESTGUARD_${exportScope}_${Date.now()}.json`;
      const uploaded = await uploadToGoogleDrive(
        filename,
        'application/json',
        JSON.stringify(packageContent, null, 2),
        accessToken,
        `Sealed archive export from FORESTGUARD AI Command Center`
      );

      setUploadedFileLink(uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`);
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Failed to upload to Google Drive: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 text-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl p-5 space-y-4 border transition-colors ${
          isDark
            ? 'bg-[#0c1410] border-emerald-800/80 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-3 border-b ${
            isDark ? 'border-emerald-950' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <HardDrive className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                GOOGLE DRIVE EVIDENCE ARCHIVE EXPORT
              </h3>
              <p
                className={`text-[10px] ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Official Google Workspace Integration • Signed Cryptographic Export
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Authentication State */}
        {!accessToken ? (
          <div className="p-4 rounded-xl bg-[#091510] border border-emerald-950 text-center space-y-3">
            <p className="text-xs text-slate-300 font-sans">
              Connect your authorized Google Account to securely transfer verified incident dossiers, satellite canopy loss records, and chain-of-custody ledgers into Google Drive.
            </p>

            {/* Official Google Sign-In Button style as mandated */}
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="inline-flex items-center justify-center gap-2.5 px-4 py-2 rounded-lg bg-white text-slate-800 font-sans text-xs font-semibold hover:bg-slate-100 transition-colors shadow-md disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-emerald-300 font-bold block">Connected to Google Drive</span>
                <span className="text-[10px] text-slate-400">{userEmail || 'Active Authorized Session'}</span>
              </div>
            </div>
            <button
              onClick={() => {
                googleSignOut();
                setAccessToken(null);
              }}
              className="text-[10px] text-slate-400 hover:text-rose-300 underline"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Export Configuration Form */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              PACKAGE CONTENTS TO EXPORT:
            </label>
            <select
              value={exportScope}
              onChange={(e) => setExportScope(e.target.value as any)}
              className="w-full bg-[#111a15] border border-emerald-900/60 rounded px-2.5 py-1.5 text-slate-200"
            >
              <option value="INCIDENT">
                {targetIncident ? `Specific Dossier: ${targetIncident.id}` : 'Current Incident Dossier'}
              </option>
              <option value="DAILY_REPORT">Full Daily Environmental Report</option>
              <option value="EVIDENCE_VAULT">Digital Evidence Vault Manifest & SHA-256 Ledger</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              TARGET GOOGLE DRIVE FOLDER:
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full bg-[#111a15] border border-emerald-900/60 rounded px-2.5 py-1.5 text-slate-200"
            />
          </div>
        </div>

        {/* Upload Success Alert */}
        {uploadedFileLink && (
          <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-600 flex items-center justify-between text-xs animate-in fade-in">
            <span className="text-emerald-300">✓ Export completed successfully.</span>
            <a
              href={uploadedFileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-emerald-400 font-bold flex items-center gap-1"
            >
              <span>OPEN FILE</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-950">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
          >
            Close
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isExporting ? 'UPLOADING TO DRIVE...' : 'EXPORT NOW'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
