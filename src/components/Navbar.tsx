import React, { useEffect, useRef, useState } from 'react';
import {
  Compass, UserPlus, ClipboardCheck, Clock, Users, Calendar, QrCode,
  Settings, ShieldCheck, ChevronDown, MapPin, UserCog, FileBarChart,
} from 'lucide-react';
import { useClub } from '../context/ClubContext';

export type ActiveTab =
  | 'guest-home' | 'member-hub' | 'register' | 'calendar' | 'attendance'
  | 'admin' | 'directory' | 'settings' | 'super-admin' | 'reports' | 'member-detail';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQrScanner: () => void;
  onOpenAuthModal: () => void;
  onOpenGeofenceModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab, setActiveTab, onOpenQrScanner, onOpenAuthModal, onOpenGeofenceModal,
}) => {
  const {
    members, currentOrg, currentClub, geofencedChurches, setCurrentOrgId,
    currentUser, distanceToCurrentChurch, geoSettings,
  } = useClub();
  const [toolsOpen, setToolsOpen] = useState(false);
  const tools = useRef<HTMLDivElement>(null);
  const toolsButton = useRef<HTMLButtonElement>(null);
  const pendingCount = members.filter(member => member.registrationStatus === 'Pending Review').length;
  const clubName = currentClub?.name ?? currentOrg.clubName;

  useEffect(() => { setToolsOpen(false); }, [currentUser?.id, currentOrg.id, activeTab]);
  useEffect(() => {
    if (!toolsOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!tools.current?.contains(event.target as Node)) setToolsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setToolsOpen(false); toolsButton.current?.focus(); }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [toolsOpen]);

  const openTool = (action: () => void) => { setToolsOpen(false); action(); };
  const navItems: { id: ActiveTab; label: string; icon: typeof Compass; count?: number }[] = currentUser ? [
    { id: 'attendance', label: 'Live Attendance', icon: Clock },
    { id: 'admin', label: 'Church Review', icon: ClipboardCheck, count: pendingCount },
    { id: 'directory', label: 'Members & Passes', icon: Users },
    { id: 'register', label: 'Register', icon: UserPlus },
    { id: 'calendar', label: 'Events', icon: Calendar },
  ] : [
    { id: 'guest-home', label: 'Church & Club', icon: Compass },
    { id: 'member-hub', label: 'My Pass & Status', icon: QrCode },
    { id: 'register', label: 'Register Youth', icon: UserPlus },
    { id: 'calendar', label: 'Club Calendar', icon: Calendar },
  ];
  const toolClass = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-900';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-xs">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button type="button" aria-label="Home" title="Home" onClick={() => setActiveTab('guest-home')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-amber-400 shadow-sm hover:bg-blue-800">
              <Compass className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <button type="button" title={clubName} onClick={() => setActiveTab('guest-home')}
                className="block max-w-full truncate text-left text-xs font-extrabold leading-tight tracking-tight text-slate-900 hover:text-blue-900 sm:text-sm">
                {clubName}
              </button>
              <select value={currentOrg.id} onChange={event => setCurrentOrgId(event.target.value)} aria-label="Active church"
                className="block max-w-full truncate border-none bg-transparent py-0 pr-4 text-[11px] font-semibold text-slate-600 focus:ring-0">
                {geofencedChurches.map(org => <option key={org.id} value={org.id}>{org.churchName}{org.distanceMiles !== undefined ? ` (${org.distanceMiles} mi)` : ''}</option>)}
              </select>
            </div>
          </div>

          <div ref={tools} className="relative shrink-0">
            <button ref={toolsButton} type="button" aria-label="Account and tools" aria-expanded={toolsOpen} aria-controls="account-tools"
              onClick={() => setToolsOpen(open => !open)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${toolsOpen || activeTab === 'settings' || activeTab === 'super-admin' || activeTab === 'reports' ? 'border-blue-900 bg-blue-50 text-blue-950' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden max-w-36 truncate sm:block">{currentUser ? currentUser.name : 'Sign in & tools'}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
            </button>
            {toolsOpen && (
              <div id="account-tools" className="absolute right-0 top-full z-50 mt-2 max-h-[calc(100dvh_-_5rem)] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <div className="border-b border-slate-100 px-3 py-2.5">
                  <p className="break-words text-sm font-bold text-slate-900">{currentUser?.name ?? 'Welcome'}</p>
                  <p className="text-xs text-slate-500">{currentUser?.role ?? 'Guest / Parent'}</p>
                </div>
                <button type="button" onClick={() => openTool(onOpenQrScanner)} className={toolClass}><QrCode className="h-4 w-4 shrink-0 text-amber-600" />Scan QR</button>
                <button type="button" onClick={() => openTool(onOpenGeofenceModal)} className={toolClass}>
                  <MapPin className="h-4 w-4 shrink-0 text-blue-900" />
                  <span>Location settings<span className="block text-xs font-normal text-slate-500">{distanceToCurrentChurch !== null ? `${distanceToCurrentChurch} mi from church` : geoSettings.enabled ? 'Geofencing enabled' : 'Geofencing disabled'}</span></span>
                </button>
                {currentUser && <button type="button" onClick={() => openTool(() => setActiveTab('settings'))} className={toolClass} aria-current={activeTab === 'settings' ? 'page' : undefined}><Settings className="h-4 w-4 shrink-0" />Settings & Levels</button>}
                {currentUser && <button type="button" onClick={() => openTool(() => setActiveTab('reports'))} className={toolClass} aria-current={activeTab === 'reports' ? 'page' : undefined}><FileBarChart className="h-4 w-4 shrink-0" />Reports</button>}
                {currentUser?.role === 'Super Admin' && <button type="button" onClick={() => openTool(() => setActiveTab('super-admin'))} className={toolClass} aria-current={activeTab === 'super-admin' ? 'page' : undefined}><UserCog className="h-4 w-4 shrink-0" />Manage Users</button>}
                <div className="mt-1 border-t border-slate-100 pt-1">
                  <button type="button" onClick={() => openTool(onOpenAuthModal)} className={toolClass}><ShieldCheck className="h-4 w-4 shrink-0" />{currentUser ? 'Account & Sign Out' : 'Leader Sign In'}</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav aria-label="Main navigation" className="flex max-w-full gap-1 overflow-x-auto border-t border-slate-100 py-2 sm:flex-wrap sm:overflow-visible">
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)} aria-current={activeTab === id ? 'page' : undefined}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${activeTab === id ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
              <Icon className="h-3.5 w-3.5" /><span>{label}</span>
              {!!count && <span className="rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-blue-950">{count}</span>}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
