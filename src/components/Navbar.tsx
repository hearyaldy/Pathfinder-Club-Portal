import React from 'react';
import { 
  Compass, 
  UserPlus, 
  ClipboardCheck, 
  Clock, 
  Users, 
  Calendar, 
  QrCode, 
  Settings, 
  ShieldCheck, 
  ChevronDown,
  MapPin,
  Eye,
  Radio
} from 'lucide-react';
import { useClub } from '../context/ClubContext';

export type ActiveTab = 
  | 'guest-home' 
  | 'member-hub' 
  | 'register' 
  | 'calendar' 
  | 'attendance' 
  | 'admin' 
  | 'directory' 
  | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQrScanner: () => void;
  onOpenAuthModal: () => void;
  onOpenGeofenceModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenQrScanner,
  onOpenAuthModal,
  onOpenGeofenceModal,
}) => {
  const { 
    members, 
    currentOrg, 
    geofencedChurches, 
    setCurrentOrgId, 
    currentUser,
    distanceToCurrentChurch,
    isWithinCurrentChurchGeofence,
    geoSettings
  } = useClub();

  const pendingCount = members.filter(m => m.registrationStatus === 'Pending Review').length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 lg:gap-6 h-16">
          {/* Zone 1: Brand Wordmark & Active Church Scope */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              onClick={() => setActiveTab(currentUser ? 'attendance' : 'guest-home')} 
              className="w-9 h-9 rounded-xl bg-blue-900 flex items-center justify-center text-amber-400 shadow-sm cursor-pointer hover:scale-105 transition-transform"
              title="Home"
            >
              <Compass className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span 
                onClick={() => setActiveTab(currentUser ? 'attendance' : 'guest-home')} 
                className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight whitespace-nowrap leading-tight cursor-pointer hover:text-blue-900 transition-colors"
              >
                {currentOrg.clubName}
              </span>
              <div className="flex items-center gap-1.5">
                {/* Church Quick Selector */}
                <select
                  value={currentOrg.id}
                  onChange={(e) => setCurrentOrgId(e.target.value)}
                  className="text-[11px] text-slate-600 hover:text-blue-900 bg-transparent border-none p-0 pr-4 font-semibold focus:ring-0 cursor-pointer"
                  title="Switch church & club"
                >
                  {geofencedChurches.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.churchName.split(' ')[0]} {org.distanceMiles !== undefined ? `(${org.distanceMiles} mi)` : ''}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  · {currentOrg.districtName.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Strictly Role-Gated) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5">
            {!currentUser ? (
              /* Public Guest Navigation */
              <>
                <button
                  onClick={() => setActiveTab('guest-home')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'guest-home'
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Church & Club</span>
                </button>

                <button
                  onClick={() => setActiveTab('member-hub')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'member-hub'
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-500" />
                  <span>My Pass & Status</span>
                </button>

                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Youth</span>
                </button>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'calendar'
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Club Calendar</span>
                </button>
              </>
            ) : (
              /* Authorized Leadership Navigation */
              <>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'attendance'
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Live Attendance</span>
                </button>

                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 relative cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Church Review</span>
                  {pendingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('directory')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'directory'
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Members & Passes</span>
                </button>

                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>

                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'calendar'
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Events</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-blue-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings & Levels</span>
                </button>

                <button
                  onClick={() => setActiveTab('guest-home')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === 'guest-home'
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Preview what guests & parents see"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-900" />
                  <span>Guest Portal View</span>
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Primary Actions, Geofencing Pill & User Auth */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Geofence Button Pill */}
            <button
              onClick={onOpenGeofenceModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                geoSettings.enabled
                  ? 'border-blue-300 bg-blue-50 text-blue-950 hover:bg-blue-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title="Configure geofencing and location settings"
            >
              <MapPin className={`w-3.5 h-3.5 ${distanceToCurrentChurch !== null ? 'text-emerald-600' : 'text-blue-900'}`} />
              <span className="hidden sm:inline font-mono">
                {distanceToCurrentChurch !== null ? `${distanceToCurrentChurch} mi` : 'Geofence'}
              </span>
              <span className="sm:hidden">Geo</span>
            </button>

            {/* Quick QR Scanner Trigger */}
            <button
              onClick={onOpenQrScanner}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Open camera QR check-in pass scanner"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* Auth Trigger */}
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-2xs cursor-pointer ${
                currentUser
                  ? 'border-blue-900 bg-blue-50 text-blue-950 hover:bg-blue-100'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-blue-900'
              }`}
              title={currentUser ? 'Manage active session' : 'Sign in as Club Director or Church Leader'}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${currentUser ? 'text-blue-900' : 'text-slate-500'}`} />
              <div className="text-left hidden lg:block">
                <span className="block text-[11px] font-bold leading-tight truncate max-w-[110px]">
                  {currentUser ? currentUser.name : 'Leader Sign In'}
                </span>
                <span className="block text-[9px] text-slate-500 leading-tight">
                  {currentUser ? currentUser.role : 'Director / Staff'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-2 border-t border-slate-100 no-scrollbar">
          {!currentUser ? (
            /* Mobile Guest Links */
            <>
              <button
                onClick={() => setActiveTab('guest-home')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap ${
                  activeTab === 'guest-home' ? 'bg-blue-900 text-white' : 'text-slate-700 bg-slate-100'
                }`}
              >
                Church & Club
              </button>
              <button
                onClick={() => setActiveTab('member-hub')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                  activeTab === 'member-hub' ? 'bg-blue-900 text-white' : 'text-slate-700 bg-slate-100'
                }`}
              >
                My Pass & Status
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                  activeTab === 'register' ? 'bg-blue-900 text-white' : 'text-slate-700 bg-slate-100'
                }`}
              >
                Register Youth
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                  activeTab === 'calendar' ? 'bg-blue-900 text-white' : 'text-slate-700 bg-slate-100'
                }`}
              >
                Club Calendar
              </button>
            </>
          ) : (
            /* Mobile Leadership Links */
            <>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                  activeTab === 'attendance' ? 'bg-blue-900 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Live Attendance
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap relative ${
                  activeTab === 'admin' ? 'bg-blue-900 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Review {pendingCount > 0 ? `(${pendingCount})` : ''}
              </button>
              <button
                onClick={() => setActiveTab('directory')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                  activeTab === 'directory' ? 'bg-blue-900 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Directory
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                  activeTab === 'settings' ? 'bg-blue-900 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Settings
              </button>
              <button
                onClick={() => setActiveTab('guest-home')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                  activeTab === 'guest-home' ? 'bg-slate-300 text-slate-900 font-bold' : 'text-slate-500 bg-slate-100'
                }`}
              >
                Guest View
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
