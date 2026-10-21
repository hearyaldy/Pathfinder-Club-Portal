import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Keyboard, 
  Volume2, 
  VolumeX, 
  RefreshCw 
} from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { Member } from '../types/club';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScannedSuccess?: (member: Member) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ 
  isOpen, 
  onClose,
  onScannedSuccess
}) => {
  const { members, activeEvent, recordAttendance, getMemberAttendanceForEvent } = useClub();
  const [manualCode, setManualCode] = useState('');
  const [lastScannedMember, setLastScannedMember] = useState<Member | null>(null);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [rapidMode, setRapidMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Audio tone generator using Web Audio API
  const playChime = (success: boolean) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (success) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.setValueAtTime(240, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio not permitted or supported
    }
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera API not available on this browser.');
      }
    } catch (err: unknown) {
      console.warn('Camera access note:', err);
      setCameraError('Camera preview requires physical webcam permissions. You can use the Quick-Scan button or barcode input below.');
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      stopCamera();
      setScanMessage(null);
      setLastScannedMember(null);
      setManualCode('');
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProcessCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    // Look for member by registration number, ID, or full name match
    const found = members.find(m => 
      m.registrationNumber.toUpperCase() === cleanCode || 
      m.id.toUpperCase() === cleanCode ||
      `${m.firstName} ${m.lastName}`.toUpperCase() === cleanCode
    );

    if (!found) {
      playChime(false);
      setScanMessage({ 
        type: 'error', 
        text: `No active member found with pass code "${code}". Please check spelling or verify registration.` 
      });
      return;
    }

    if (found.registrationStatus !== 'Approved') {
      playChime(false);
      setScanMessage({ 
        type: 'error', 
        text: `${found.firstName} ${found.lastName} registration status is "${found.registrationStatus}". Church leadership approval is required.` 
      });
      setLastScannedMember(found);
      return;
    }

    if (!activeEvent) {
      setScanMessage({ type: 'info', text: 'No active event selected to log attendance.' });
      return;
    }

    // Check if already checked in
    const existingRec = getMemberAttendanceForEvent(activeEvent.id, found.id);
    const wasAlreadyPresent = existingRec?.status === 'Present';

    // Record attendance
    recordAttendance(activeEvent.id, found.id, 'Present', 'QR Code');
    playChime(true);
    setLastScannedMember(found);

    if (wasAlreadyPresent) {
      setScanMessage({ 
        type: 'info', 
        text: `${found.firstName} was already checked in earlier (${existingRec?.checkInTime || 'Earlier'}). Attendance re-verified!` 
      });
    } else {
      setScanMessage({ 
        type: 'success', 
        text: `Checked in! Welcome ${found.firstName} ${found.lastName} (${found.className})` 
      });
    }

    if (onScannedSuccess) {
      onScannedSuccess(found);
    }

    setManualCode('');

    // If not rapid mode, close after brief delay
    if (!rapidMode) {
      setTimeout(() => {
        onClose();
      }, 1400);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessCode(manualCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-400 text-blue-950 rounded-lg">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Live Event QR Check-In Scanner</h3>
              <p className="text-xs text-blue-200 leading-tight">
                {activeEvent ? activeEvent.title : 'No active event selected'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 text-blue-200 hover:text-white rounded-md hover:bg-blue-900 transition-colors"
              title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white rounded-md hover:bg-blue-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Camera Viewport / Scanner target */}
          <div className="relative rounded-lg overflow-hidden bg-slate-900 aspect-video flex flex-col items-center justify-center text-white border border-slate-800 shadow-inner">
            <video 
              ref={videoRef} 
              playsInline 
              muted 
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`} 
            />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-amber-400/80 rounded-2xl relative shadow-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400 -mt-1 -ml-1 rounded-tl-sm" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400 -mt-1 -mr-1 rounded-tr-sm" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400 -mb-1 -ml-1 rounded-bl-sm" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400 -mb-1 -mr-1 rounded-br-sm" />
                <div className="absolute inset-x-2 top-1/2 h-0.5 bg-amber-400/60 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
              </div>
            </div>

            {!cameraActive && (
              <div className="p-6 text-center z-10">
                <Camera className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-200">Camera Scanner Ready</p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Point camera at the digital pass or physical card QR code.
                </p>
                {cameraError && (
                  <p className="text-xs text-amber-300 mt-2 bg-amber-950/40 p-2 rounded border border-amber-800/60">
                    {cameraError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-700 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Camera
                </button>
              </div>
            )}
          </div>

          {/* Scanned Result Banner */}
          {scanMessage && (
            <div className={`p-3.5 rounded-lg flex items-start gap-3 border ${
              scanMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : scanMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
              {scanMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-sm">
                <p className="font-semibold">{scanMessage.text}</p>
                {lastScannedMember && (
                  <div className="mt-1 text-xs text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
                    <span>Pass: <strong className="font-mono text-slate-900">{lastScannedMember.registrationNumber}</strong></span>
                    <span>·</span>
                    <span>Branch: <strong className="text-slate-900">{lastScannedMember.branch}</strong></span>
                    <span>·</span>
                    <span>Class: <strong className="text-slate-900">{lastScannedMember.className}</strong></span>
                    {lastScannedMember.unitName && (
                      <>
                        <span>·</span>
                        <span>Unit: <strong className="text-slate-900">{lastScannedMember.unitName}</strong></span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manual Input / Barcode Scanner Input */}
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Manual Pass / Barcode Scanner Input
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter or scan pass code (e.g. PF-2026-101)"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900 font-mono"
                />
                <Keyboard className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Check In
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Standard USB/Bluetooth barcode scanners will automatically submit through this field.
            </p>
          </form>

          {/* Quick-Select Demo Roster for Fast Simulation */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick-Test Roster Simulator:
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rapidMode}
                  onChange={(e) => setRapidMode(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-900"
                />
                <span>Keep scanner open (Rapid Mode)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
              {members.filter(m => m.registrationStatus === 'Approved').slice(0, 9).map(m => {
                const rec = activeEvent ? getMemberAttendanceForEvent(activeEvent.id, m.id) : undefined;
                const isPresent = rec?.status === 'Present';
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleProcessCode(m.registrationNumber)}
                    className={`text-left p-2 rounded-md border text-xs transition-colors flex flex-col justify-between ${
                      isPresent 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                        : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800'
                    }`}
                  >
                    <span className="font-semibold truncate">{m.firstName} {m.lastName}</span>
                    <span className="font-mono text-[10px] text-slate-500">{m.registrationNumber}</span>
                    <span className="text-[10px] text-slate-500 mt-1">
                      {isPresent ? '✓ Checked in' : `${m.className}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Connected to <strong>{activeEvent?.title || 'Current Event'}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Done Scanning
          </button>
        </div>
      </div>
    </div>
  );
};
