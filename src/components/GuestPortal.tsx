import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Clock, 
  UserPlus, 
  QrCode, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Building2, 
  ChevronRight, 
  Phone, 
  Mail, 
  Sparkles, 
  HeartHandshake, 
  Award,
  Users,
  ExternalLink
} from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { branchClub, formatClubDues } from '../utils/currency';
import { Member } from '../types/club';
import heroBanner from '../assets/images/pathfinder_hero_banner_1792569497907.jpg';
import adventurerActivities from '../assets/images/adventurer_kids_activities_1792569498236.jpg';

interface GuestPortalProps {
  onGoToRegister: () => void;
  onGoToMemberHub: () => void;
  onGoToCalendar: () => void;
  onOpenQrScanner: () => void;
  onOpenAuthModal: () => void;
  onViewPass: (member: Member) => void;
}

export const GuestPortal: React.FC<GuestPortalProps> = ({
  onGoToRegister,
  onGoToMemberHub,
  onGoToCalendar,
  onOpenQrScanner,
  onOpenAuthModal,
  onViewPass,
}) => {
  const { currentOrg, currentClub, clubs, organizations, setCurrentOrgId, events, members, units } = useClub();

  // Quick lookup state on guest home
  const [quickSearch, setQuickSearch] = useState('');
  const [quickResult, setQuickResult] = useState<Member | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleQuickLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickSearch.trim().toLowerCase();
    if (!query) return;

    setHasSearched(true);
    // Search member within this church or across churches
    const found = members.find(m => 
      m.registrationNumber.toLowerCase() === query ||
      m.id.toLowerCase() === query ||
      m.parentPhone.replace(/\D/g, '') === query.replace(/\D/g, '') ||
      `${m.firstName} ${m.lastName}`.toLowerCase() === query ||
      m.firstName.toLowerCase() === query
    );
    setQuickResult(found || null);
  };

  // Church upcoming events
  const upcomingEvents = events
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-10 pb-12">
      {/* 1. CHURCH & CLUB SELECTOR BAR */}
      <section className="bg-white border-b border-slate-200 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Viewing Church & Club:
              </span>
              <span className="text-sm font-bold text-slate-900">
                {currentOrg.churchName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:inline">Select Another Church:</span>
              <div className="flex flex-wrap gap-1.5">
                {organizations.map(org => {
                  const isSelected = org.id === currentOrg.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => setCurrentOrgId(org.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {org.churchName.split(' ')[0]} ({org.clubName.split(' ')[0]})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HERO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-blue-950 text-white">
          <div className="absolute inset-0 z-0">
            <img 
              src={heroBanner} 
              alt="Pathfinder and Adventurer Club" 
              className="w-full h-full object-cover object-center opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-950/90 to-blue-900/60" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-blue-950 text-xs font-extrabold shadow-sm">
              <Compass className="w-4 h-4" />
              <span>Seventh-day Adventist Youth Ministries</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-amber-300 uppercase block">
                {currentOrg.churchName} · {currentOrg.districtName}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {currentClub?.name ?? currentOrg.clubName}
              </h1>
              <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
                Welcome to our church membership portal. We build youth character, leadership, outdoor survival skills, and Christian service for young people from age 4 to 15.
              </p>
            </div>

            {/* Quick Details Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-blue-200 block uppercase font-bold">Location</span>
                  <strong className="text-white text-xs block leading-tight">{currentOrg.location}</strong>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-blue-200 block uppercase font-bold">Meeting Times</span>
                  <strong className="text-white text-xs block leading-tight">{currentOrg.meetingSchedule}</strong>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-blue-200 block uppercase font-bold">Charter & Leadership</span>
                  <strong className="text-white text-xs block leading-tight">{currentOrg.charterNumber} · {currentOrg.directorName}</strong>
                </div>
              </div>
            </div>

            {/* Primary Guest Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onGoToRegister}
                className="inline-flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Youth Online</span>
              </button>

              <button
                onClick={onGoToMemberHub}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-blue-950 font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-blue-900" />
                <span>Check My Status & Pass</span>
              </button>

              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-2 px-4 py-3 bg-blue-900/60 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl border border-blue-400/30 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Club Director / Staff Sign In</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GUEST SELF-SERVICE LOOKUP & STATUS CHECK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 text-[11px] font-bold mb-1">
                <Search className="w-3 h-3 text-blue-700" />
                <span>Parent & Youth Self-Service</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Check Your Registration Status or Digital QR Pass
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                No password required! Look up your child's application by pass number (e.g. <span className="font-mono font-bold text-slate-700">PF-GRA-101</span>), parent phone number, or child name.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={onOpenQrScanner}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Camera QR Scanner</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleQuickLookup} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="e.g. PF-GRA-101, Josiah Vance, or (555) 234-8901"
                className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap cursor-pointer"
            >
              Check My Child's Pass
            </button>
          </form>

          {/* Quick Result if searched */}
          {hasSearched && (
            <div className="pt-2 border-t border-slate-100">
              {quickResult ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-400 font-bold flex items-center justify-center text-base">
                      {quickResult.firstName[0]}{quickResult.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-slate-900">{quickResult.firstName} {quickResult.lastName}</strong>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {quickResult.registrationStatus}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 space-x-2 mt-0.5">
                        <span className="font-mono font-bold text-blue-900">{quickResult.registrationNumber}</span>
                        <span>·</span>
                        <span>{quickResult.branch} ({quickResult.className})</span>
                        <span>·</span>
                        <span>{quickResult.unitName || 'Unit assignment pending'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewPass(quickResult)}
                      className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-amber-400" />
                      <span>View & Print Pass</span>
                    </button>
                    <button
                      onClick={onGoToMemberHub}
                      className="px-3 py-2 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Full Details <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center justify-between">
                  <span>No member record matching "{quickSearch}". Please check the spelling or enroll your child.</span>
                  <button
                    onClick={onGoToRegister}
                    className="font-bold text-blue-900 underline hover:text-blue-950 ml-2"
                  >
                    Enroll Now →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 4. CLUB BRANCHES & MINISTRIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Club Branches at {currentOrg.churchName}
            </h2>
            <p className="text-xs text-slate-500">
              We offer two active age-graded youth programs under the Seventh-day Adventist Church.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Adventurer Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="h-44 overflow-hidden relative">
                <img 
                  src={adventurerActivities} 
                  alt="Adventurer Club Activities" 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white uppercase tracking-wider shadow-sm">
                  Ages 4 to 9 (Pre-K to 4th Grade)
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">Adventurer Club</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Designed to strengthen parent-child bonds with active hands-on nature exploration, crafts, Bible story awards, and family activities.
                  </p>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Progressive Classes:
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {['Little Lamb (Age 4)', 'Eager Beaver (Age 5)', 'Busy Bee (Gr 1)', 'Sunbeam (Gr 2)', 'Builder (Gr 3)', 'Helping Hand (Gr 4)'].map(cls => (
                        <span key={cls} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[11px] font-semibold border border-emerald-100">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Annual Club Dues: {formatClubDues(branchClub('Adventurers', clubs, currentClub), currentOrg)}</span>
                  <button
                    onClick={onGoToRegister}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                  >
                    Register Adventurer <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Pathfinder Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="h-44 overflow-hidden relative">
                <img 
                  src={heroBanner} 
                  alt="Pathfinder Club Field Activities" 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-900 text-amber-300 uppercase tracking-wider shadow-sm">
                  Ages 10 to 15 (5th to 10th Grade)
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">Pathfinder Club</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A worldwide scouting ministry focused on outdoor survival, wilderness camping, drill team, honors badges, leadership development, and community service.
                  </p>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Progressive Classes:
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {['Friend (Gr 5)', 'Companion (Gr 6)', 'Explorer (Gr 7)', 'Ranger (Gr 8)', 'Voyager (Gr 9)', 'Guide (Gr 10)'].map(cls => (
                        <span key={cls} className="px-2 py-0.5 bg-blue-50 text-blue-900 rounded-md text-[11px] font-semibold border border-blue-100">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Annual Club Dues: {formatClubDues(branchClub('Pathfinders', clubs, currentClub), currentOrg)}</span>
                  <button
                    onClick={onGoToRegister}
                    className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1 cursor-pointer"
                  >
                    Register Pathfinder <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PUBLIC CLUB CALENDAR PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold mb-1">
                <Calendar className="w-3 h-3 text-slate-600" />
                <span>Upcoming Club Schedule</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Public Calendar & Events for {currentClub?.name ?? currentOrg.clubName}
              </h2>
              <p className="text-xs text-slate-500">
                Parents, youth, and visitors can see our meeting schedule and campout dates.
              </p>
            </div>

            <button
              onClick={onGoToCalendar}
              className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full Club Calendar →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingEvents.map(evt => (
              <div key={evt.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                    {evt.type}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">{evt.date}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{evt.title}</h4>
                <p className="text-slate-600 text-[11px] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{evt.location}</span>
                </p>
                <div className="pt-2 text-slate-500 text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-900" />
                  <span>{evt.time} · Branch: {evt.branch}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CHURCH PRIVACY & ACCESS EXPLANATION NOTICE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 sm:p-8 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-700 shrink-0" />
              <h3 className="text-base font-bold text-amber-950">
                Child Privacy & Member Protection Policy
              </h3>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              To protect the privacy and safety of our club youth, sensitive data (such as emergency medical records, child allergy details, full membership rosters, and church board approval workflows) is strictly restricted to authorized church leaders. 
            </p>
            <p className="text-xs text-amber-800">
              Guests and parents can securely view their own child's digital pass and status, enroll new youth, and check public events.
            </p>
          </div>

          <button
            onClick={onOpenAuthModal}
            className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-sm whitespace-nowrap cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Sign In as Church Director or Staff</span>
          </button>
        </div>
      </section>
    </div>
  );
};
