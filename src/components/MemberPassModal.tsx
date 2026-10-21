import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Printer, 
  Download, 
  Compass, 
  ShieldAlert, 
  Phone, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { Member } from '../types/club';

interface MemberPassModalProps {
  member: Member | null;
  onClose: () => void;
}

export const MemberPassModal: React.FC<MemberPassModalProps> = ({ 
  member, 
  onClose 
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (member) {
      QRCode.toDataURL(member.registrationNumber, {
        width: 256,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate QR code:', err));
    } else {
      setQrDataUrl('');
    }
  }, [member]);

  if (!member) return null;

  const isAdventurer = member.branch === 'Adventurers';
  const isStaff = member.branch === 'Staff';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top actions bar */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Digital Membership & Check-in Pass
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              title="Print membership card"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Card Container */}
        <div className="p-6 bg-slate-100 flex justify-center">
          <div 
            id="printable-member-pass"
            className={`w-full max-w-sm rounded-2xl shadow-lg overflow-hidden border ${
              isAdventurer 
                ? 'bg-gradient-to-b from-blue-900 via-blue-950 to-slate-900 border-blue-700 text-white' 
                : isStaff
                ? 'bg-gradient-to-b from-amber-950 via-slate-900 to-black border-amber-600 text-white'
                : 'bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 border-amber-500/60 text-white'
            }`}
          >
            {/* Card Header */}
            <div className={`p-4 border-b ${
              isAdventurer 
                ? 'bg-blue-800/80 border-blue-700' 
                : isStaff 
                ? 'bg-amber-900/60 border-amber-800'
                : 'bg-blue-900/80 border-amber-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-amber-300">
                      {isAdventurer ? 'Adventurer Club' : isStaff ? 'Staff & Leadership' : 'Pathfinder Club'}
                    </h3>
                    <p className="text-[10px] text-blue-200">Grace Seventh-day Adventist Church</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono uppercase text-amber-400/90 block">Club Year</span>
                  <span className="text-xs font-bold font-mono">2026–2027</span>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex flex-col items-center text-center space-y-4">
              {/* Member Photo Avatar & Name */}
              <div>
                <div className="w-16 h-16 rounded-full mx-auto bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-md border-2 border-white/20 mb-2">
                  {member.firstName[0]}{member.lastName[0]}
                </div>
                <h2 className="text-lg font-extrabold tracking-tight text-white">
                  {member.firstName} {member.lastName}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-amber-400">
                    {member.className}
                  </span>
                  <span className="text-white/40">·</span>
                  <span className="text-xs text-slate-300">
                    {member.unitName || 'Unassigned Unit'}
                  </span>
                </div>
              </div>

              {/* High Resolution Scannable QR Code */}
              <div className="p-3 bg-white rounded-xl shadow-md border-2 border-white/40">
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt={`Check-in QR for ${member.registrationNumber}`}
                    className="w-40 h-40 object-contain mx-auto" 
                  />
                ) : (
                  <div className="w-40 h-40 bg-slate-200 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-500">
                    Generating QR...
                  </div>
                )}
                <span className="block font-mono font-bold text-xs text-slate-900 tracking-wider mt-1.5">
                  {member.registrationNumber}
                </span>
              </div>

              {/* Safety & Emergency Contacts */}
              <div className="w-full text-left text-[11px] bg-white/10 rounded-lg p-2.5 space-y-1 text-slate-200 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-400" />
                    Emergency Contact:
                  </span>
                  <span className="font-semibold text-white truncate max-w-[170px]">
                    {member.emergencyContact}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Emergency Phone:</span>
                  <span className="font-mono font-semibold text-amber-300">
                    {member.emergencyPhone}
                  </span>
                </div>
                {member.allergies && member.allergies !== 'None' && (
                  <div className="flex items-center gap-1 text-rose-300 pt-1 border-t border-white/10">
                    <ShieldAlert className="w-3 h-3 shrink-0" />
                    <span className="truncate">Alert: {member.allergies}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer Bar */}
            <div className="px-4 py-2 bg-black/40 text-center border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Authorized Club Member</span>
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Show this pass to leadership during Sabbath meetings or campouts.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Pass
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
