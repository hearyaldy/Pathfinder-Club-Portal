import React, { useState, useEffect } from 'react';
import { ClubProvider, useClub } from './context/ClubContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { LiveAttendance } from './components/LiveAttendance';
import { ChurchAdminDashboard } from './components/ChurchAdminDashboard';
import { RegisterMember } from './components/RegisterMember';
import { MemberDirectory } from './components/MemberDirectory';
import { ClubCalendar } from './components/ClubCalendar';
import { SettingsPage } from './components/SettingsPage';
import { GuestPortal } from './components/GuestPortal';
import { AccessRestricted } from './components/AccessRestricted';
import { QrScannerModal } from './components/QrScannerModal';
import { MemberPassModal } from './components/MemberPassModal';
import { AuthModal } from './components/AuthModal';
import { GeofenceSettingsModal } from './components/GeofenceSettingsModal';
import { MemberHub } from './components/MemberHub';
import { SuperAdminPage } from './components/SuperAdminPage';
import { Member } from './types/club';
import { Compass, ShieldCheck, MapPin } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentOrg, currentClub, currentUser, distanceToCurrentChurch, geoSettings } = useClub();

  // If user is logged in, start on attendance; if guest, start on public church welcome portal
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => 
    currentUser ? 'attendance' : 'guest-home'
  );
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGeofenceModalOpen, setIsGeofenceModalOpen] = useState(false);
  const [selectedPassMember, setSelectedPassMember] = useState<Member | null>(null);

  // Safety Auto-Redirect: If user signs out while on a protected tab, instantly switch to public guest view
  useEffect(() => {
    if (!currentUser && ['attendance', 'admin', 'directory', 'settings', 'super-admin'].includes(activeTab)) {
      setActiveTab('guest-home');
    }
    if (activeTab === 'super-admin' && currentUser?.role !== 'Super Admin') {
      setActiveTab('guest-home');
    }
  }, [currentUser, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-amber-200 selection:text-blue-950">
      {/* Top Bar Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenGeofenceModal={() => setIsGeofenceModalOpen(true)}
      />

      {/* Main View Port */}
      <main className="flex-1 pb-16">
        {/* 1. Public Guest Welcome Portal */}
        {activeTab === 'guest-home' && (
          <GuestPortal
            onGoToRegister={() => setActiveTab('register')}
            onGoToMemberHub={() => setActiveTab('member-hub')}
            onGoToCalendar={() => setActiveTab('calendar')}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onViewPass={(member) => setSelectedPassMember(member)}
          />
        )}

        {/* 2. Live Attendance (Protected) */}
        {activeTab === 'attendance' && (
          currentUser ? (
            <LiveAttendance
              onOpenQrScanner={() => setIsQrScannerOpen(true)}
              onViewMemberPass={(member) => setSelectedPassMember(member)}
            />
          ) : (
            <AccessRestricted
              pageName="Live Event Attendance"
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onGoToGuestHome={() => setActiveTab('guest-home')}
            />
          )
        )}

        {/* 3. Church Leadership Review Queue (Protected) */}
        {activeTab === 'admin' && (
          currentUser ? (
            <ChurchAdminDashboard />
          ) : (
            <AccessRestricted
              pageName="Church Leadership Review Queue"
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onGoToGuestHome={() => setActiveTab('guest-home')}
            />
          )
        )}

        {/* 4. Youth Registration Form (Public) */}
        {activeTab === 'register' && (
          <RegisterMember
            onGoToAdminQueue={() => setActiveTab('admin')}
            onGoToDirectory={() => setActiveTab('directory')}
          />
        )}

        {/* 5. Parent / Member Self-Service Pass Hub (Public) */}
        {activeTab === 'member-hub' && (
          <MemberHub
            onGoToRegister={() => setActiveTab('register')}
            onViewPass={(member) => setSelectedPassMember(member)}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
          />
        )}

        {/* 6. Member Directory & Medical Roster (Protected) */}
        {activeTab === 'directory' && (
          currentUser ? (
            <MemberDirectory
              onSelectMemberPass={(member) => setSelectedPassMember(member)}
              onGoToRegister={() => setActiveTab('register')}
            />
          ) : (
            <AccessRestricted
              pageName="Member Directory & Medical Manifest"
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onGoToGuestHome={() => setActiveTab('guest-home')}
            />
          )
        )}

        {/* 7. Public Club Calendar & Events */}
        {activeTab === 'calendar' && (
          <ClubCalendar
            onGoToLiveAttendance={() => setActiveTab('attendance')}
          />
        )}

        {/* 8. Administrative Hierarchy & Settings (Protected) */}
        {activeTab === 'settings' && (
          currentUser ? (
            <SettingsPage />
          ) : (
            <AccessRestricted
              pageName="Administrative Hierarchy & Settings"
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onGoToGuestHome={() => setActiveTab('guest-home')}
            />
          )
        )}

        {/* 9. Platform User Management (Super Admin only) */}
        {activeTab === 'super-admin' && (
          currentUser?.role === 'Super Admin' ? (
            <SuperAdminPage />
          ) : (
            <AccessRestricted
              pageName="Platform User Management"
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onGoToGuestHome={() => setActiveTab('guest-home')}
            />
          )
        )}
      </main>

      {/* Global Modals */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
      />

      <MemberPassModal
        member={selectedPassMember}
        onClose={() => setSelectedPassMember(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <GeofenceSettingsModal
        isOpen={isGeofenceModalOpen}
        onClose={() => setIsGeofenceModalOpen(false)}
      />

      {/* Footer with Church Scope, Auth State & Geofence Status */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-[10px]">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span>
              {currentClub?.name ?? currentOrg.clubName} · {currentOrg.churchName} ({currentOrg.districtName})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            {distanceToCurrentChurch !== null && (
              <span className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Geofence: {distanceToCurrentChurch} mi away</span>
              </span>
            )}
            <span>·</span>
            <span>Signed in: <strong className="text-slate-700">{currentUser ? `${currentUser.name} (${currentUser.role})` : 'Guest / Parent'}</strong></span>
            <span>·</span>
            <span>Charter: {currentOrg.charterNumber}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ClubProvider>
      <AppContent />
    </ClubProvider>
  );
}
