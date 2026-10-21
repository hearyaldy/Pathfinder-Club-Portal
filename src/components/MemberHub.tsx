import React, { useState } from 'react';
import { 
  Search, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Compass, 
  Calendar, 
  Phone, 
  Mail, 
  ShieldAlert, 
  Printer, 
  UserPlus, 
  Award, 
  Check, 
  ArrowRight, 
  Sparkles, 
  DollarSign 
} from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { Member } from '../types/club';

interface MemberHubProps {
  onGoToRegister: () => void;
  onViewPass: (member: Member) => void;
  onOpenQrScanner: () => void;
}

export const MemberHub: React.FC<MemberHubProps> = ({ 
  onGoToRegister, 
  onViewPass,
  onOpenQrScanner 
}) => {
  const { members, events, attendance, units, currentOrg } = useClub();
  const [searchCode, setSearchCode] = useState('');
  const [searchedMember, setSearchedMember] = useState<Member | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchCode.trim().toLowerCase();
    if (!query) return;

    setHasSearched(true);

    // Search by exact pass code, ID, parent phone, or full name
    const found = members.find(m => 
      m.registrationNumber.toLowerCase() === query ||
      m.id.toLowerCase() === query ||
      m.parentPhone.replace(/\D/g, '') === query.replace(/\D/g, '') ||
      `${m.firstName} ${m.lastName}`.toLowerCase() === query ||
      m.firstName.toLowerCase() === query
    );

    setSearchedMember(found || null);
  };

  // Helper to get attendance history for member
  const memberAttendance = searchedMember 
    ? attendance.filter(a => a.memberId === searchedMember.id)
    : [];

  const counselor = searchedMember?.unitId 
    ? units.find(u => u.id === searchedMember.unitId)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner for Guests & Members */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-semibold border border-amber-400/30">
            <Compass className="w-3.5 h-3.5" />
            <span>Parent & Member Self-Service Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Check Your Registration Status & Digital Pass
          </h1>
          <p className="text-sm text-blue-200 leading-relaxed">
            No password required! Simply enter your club pass number (e.g. <strong className="font-mono text-white">PF-2026-101</strong>) or parent phone number below to view your real-time approval status, assigned unit counselor, dues record, and digital check-in QR code.
          </p>

          {/* Quick Action Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onGoToRegister}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll New Member for 2026–2027</span>
            </button>
            <button
              onClick={onOpenQrScanner}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800/80 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl border border-blue-600 transition-colors"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Camera QR Check-In Scanner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lookup Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="max-w-xl">
          <h2 className="text-base font-bold text-slate-900">
            Member Pass & Application Lookup
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter your registration code, child's full name, or parent phone number.
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="e.g. PF-2026-101, Josiah Vance, or (555) 234-8901"
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap"
          >
            Check Status
          </button>
        </form>

        {/* Quick Sample Chips for Test Lookup */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
          <span className="text-[11px] font-semibold text-slate-600">Quick test sample codes:</span>
          {members.slice(0, 4).map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setSearchCode(m.registrationNumber);
                setSearchedMember(m);
                setHasSearched(true);
              }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-mono text-[11px] text-slate-700 transition-colors"
            >
              {m.registrationNumber} ({m.firstName})
            </button>
          ))}
        </div>
      </div>

      {/* Lookup Results Display */}
      {hasSearched && (
        <div>
          {searchedMember ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6 md:p-8">
              {/* Member Card Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-xs ${
                    searchedMember.branch === 'Pathfinders' 
                      ? 'bg-blue-900 text-amber-400' 
                      : searchedMember.branch === 'Adventurers'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-amber-600 text-white'
                  }`}>
                    {searchedMember.firstName[0]}{searchedMember.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {searchedMember.firstName} {searchedMember.lastName}
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono font-bold text-blue-900">{searchedMember.registrationNumber}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700">{searchedMember.branch} ({searchedMember.className})</span>
                      <span>·</span>
                      <span>{currentOrg.churchName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewPass(searchedMember)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Digital QR Pass</span>
                  </button>
                </div>
              </div>

              {/* Status & Review Ribbon */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                searchedMember.registrationStatus === 'Approved'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : searchedMember.registrationStatus === 'Pending Review'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-blue-50 border-blue-200 text-blue-950'
              }`}>
                {searchedMember.registrationStatus === 'Approved' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">
                      Registration Status: {searchedMember.registrationStatus}
                    </span>
                    <span className="text-[11px] opacity-80">
                      Applied: {searchedMember.registrationDate}
                    </span>
                  </div>
                  <p className="opacity-90 leading-relaxed">
                    {searchedMember.statusNotes || 'Your registration is in good standing with Grace SDA Church leadership.'}
                  </p>
                </div>
              </div>

              {/* 4 Detail Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Unit & Counselor */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider block">
                    Assigned Unit & Counselor
                  </span>
                  <strong className="text-slate-900 text-sm block">
                    {searchedMember.unitName || 'Pending Unit Assignment'}
                  </strong>
                  <span className="text-slate-600 block">
                    {counselor ? `Counselor: ${counselor.counselorName}` : 'Leadership will assign unit'}
                  </span>
                </div>

                {/* Annual Club Dues */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider block">
                    Annual Club Dues ($35)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${searchedMember.duesPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <strong className={`text-sm ${searchedMember.duesPaid ? 'text-emerald-700' : 'text-amber-800'}`}>
                      {searchedMember.duesPaid ? '$35 Paid in Full' : 'Payment Awaiting Confirmation'}
                    </strong>
                  </div>
                  <span className="text-slate-500 block text-[11px]">
                    {searchedMember.duesPaid ? 'Covers scarf, slide & book' : 'Payable to club treasurer'}
                  </span>
                </div>

                {/* Uniform Sizing */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider block">
                    Uniform Field Shirt
                  </span>
                  <strong className="text-slate-900 text-sm block">
                    Size: {searchedMember.uniformSize}
                  </strong>
                  <span className="text-slate-500 block text-[11px]">
                    Fitting at opening meeting
                  </span>
                </div>

                {/* Emergency & Medical Verification */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider block">
                    Medical & Consent On File
                  </span>
                  <strong className="text-slate-900 text-sm block">
                    {searchedMember.parentConsentSigned ? 'Signed & Verified' : 'Needs Signature'}
                  </strong>
                  <span className="text-slate-500 block text-[11px]">
                    Emergency: {searchedMember.emergencyPhone}
                  </span>
                </div>
              </div>

              {/* Attendance Record History */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-slate-900">
                    Live Event Attendance Record ({memberAttendance.length} records logged)
                  </h3>
                  <span className="text-xs text-slate-500">
                    Club Year 2026–2027
                  </span>
                </div>

                {memberAttendance.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-200">
                    No event attendance recorded yet. Attendance will update automatically when scanned by leaders during club meetings.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {memberAttendance.map(rec => {
                      const evt = events.find(e => e.id === rec.eventId);
                      return (
                        <div key={rec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <strong className="text-slate-900 block truncate max-w-[200px]">
                              {evt?.title || 'Club Meeting'}
                            </strong>
                            <span className="text-slate-500 text-[11px]">
                              {evt?.date || 'Date'} · Method: {rec.checkInMethod}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.status === 'Late'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {rec.status} {rec.checkInTime ? `@ ${rec.checkInTime}` : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Member Record Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We could not find an enrollment record matching "<strong className="text-slate-800">{searchCode}</strong>". Please verify the registration number, or enroll your youth below.
              </p>
              <button
                onClick={onGoToRegister}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Fill Out New Online Application</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Guest Information Section: What is Pathfinders & Adventurers? */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Adventurer Club Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Ages 4 to 9 (Pre-K to 4th Grade)
            </span>
            <span className="text-xs font-semibold text-slate-500">Grace SDA Church</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Adventurer Club Ministry</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Designed to strengthen parent-child bonds with active hands-on learning, nature discovery, and Bible story awards. Classes include Little Lamb, Eager Beaver, Busy Bee, Sunbeam, Builder, and Helping Hand.
          </p>
          <div className="pt-2 text-xs text-emerald-800 font-semibold flex items-center gap-1">
            <span>Meeting time: 1st & 3rd Sabbath at 2:30 PM</span>
          </div>
        </div>

        {/* Pathfinder Club Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 uppercase tracking-wider">
              Ages 10 to 15 (5th to 10th Grade)
            </span>
            <span className="text-xs font-semibold text-slate-500">Maranatha Club</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Pathfinder Club Ministry</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            A worldwide scouting ministry focused on camping, outdoor survival, marching drill, community service, and over 450 vocational and nature honors. Classes include Friend, Companion, Explorer, Ranger, Voyager, and Guide.
          </p>
          <div className="pt-2 text-xs text-blue-900 font-semibold flex items-center gap-1">
            <span>Meeting time: 1st & 3rd Sabbath at 2:30 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
