import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Layers, 
  DollarSign, 
  Save, 
  Plus, 
  Users, 
  Compass, 
  Download,
  CheckCircle2,
  ChevronRight, 
  Globe2, 
  MapPin, 
  FileCheck,
  Trash2,
  Phone,
  Award,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Pencil
} from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { EditUnitModal } from './EditUnitModal';
import { EditClubModal } from './EditClubModal';
import { ChurchOrganization, UserRole, ClubUnit, ClubBranch, ClubEntity, ClubType } from '../types/club';

export const SettingsPage: React.FC = () => {
  const {
    organizations,
    currentOrgId,
    currentOrg,
    setCurrentOrgId,
    updateOrganization,
    addOrganization,
    staffUsers,
    currentUser,
    clubs,
    currentClubId,
    currentClub,
    setCurrentClubId,
    addClub,
    deleteClub,
    divisions,
    allDivisions,
    addDivision,
    deleteDivision,
    units,
    allUnits,
    addUnit,
    deleteUnit,
    members,
    assignUnit,
    getDistrictRollupStats,
    exportDatabaseJson,
  } = useClub();

  const [activeTab, setActiveTab] = useState<'clubs' | 'units' | 'hierarchy' | 'profile' | 'policy' | 'district' | 'staff' | 'permissions'>('clubs');
  const [showAddClubModal, setShowAddClubModal] = useState(false);
  const [clubSaving, setClubSaving] = useState(false);
  const [clubSaveError, setClubSaveError] = useState('');
  const [editingClub, setEditingClub] = useState<ClubEntity | null>(null);
  const [clubSaveMessage, setClubSaveMessage] = useState('');
  const [showAddDivisionModal, setShowAddDivisionModal] = useState(false);

  // New Club Entity Form State
  const [newClubEntityName, setNewClubEntityName] = useState('');
  const [newClubType, setNewClubType] = useState<ClubType>('Pathfinder');
  const [newClubDirector, setNewClubDirector] = useState('');
  const [newClubDirectorEmail, setNewClubDirectorEmail] = useState('');
  const [newClubCharter, setNewClubCharter] = useState('');
  const [newClubMeetingSchedule, setNewClubMeetingSchedule] = useState('');
  const [newClubAnnualDues, setNewClubAnnualDues] = useState(30);
  const [newClubMotto, setNewClubMotto] = useState('');

  // New Division Form State
  const [newDivisionName, setNewDivisionName] = useState('');
  const [newDivisionAgeRange, setNewDivisionAgeRange] = useState('');
  const [newDivisionLeaderName, setNewDivisionLeaderName] = useState('');
  const [newDivisionLeaderPhone, setNewDivisionLeaderPhone] = useState('');

  // New Unit Form: optional Division assignment
  const [newUnitDivisionId, setNewUnitDivisionId] = useState('');

  const [unitBranchFilter, setUnitBranchFilter] = useState<'All' | 'Pathfinders' | 'Adventurers'>('All');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddChurchModal, setShowAddChurchModal] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ClubUnit | null>(null);
  const [unitSaveMessage, setUnitSaveMessage] = useState('');
  const canEditHierarchy = !!currentUser && currentUser.role !== 'Parent / Member' && (
    currentUser.orgId === currentOrgId || ['Super Admin', 'Mission Youth Director', 'District Coordinator'].includes(currentUser.role)
  );
  React.useEffect(() => { setEditingUnit(null); setUnitSaveMessage(''); }, [currentOrgId, currentClubId, currentUser?.id]);
  React.useEffect(() => { setEditingClub(null); setClubSaveMessage(''); }, [currentOrgId, currentClubId, currentUser?.id]);

  // New Unit Form State
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitBranch, setNewUnitBranch] = useState<ClubBranch>('Pathfinders');
  const [newCounselorName, setNewCounselorName] = useState('');
  const [newCounselorPhone, setNewCounselorPhone] = useState('');
  const [newGenderDivision, setNewGenderDivision] = useState<'Boys' | 'Girls' | 'Co-ed'>('Boys');
  const [newAgeRange, setNewAgeRange] = useState('Ages 10–12');
  const [newMotto, setNewMotto] = useState('');

  // Editable Form State for Current Organization
  const [churchName, setChurchName] = useState(currentOrg.churchName);
  const [districtName, setDistrictName] = useState(currentOrg.districtName);
  const [missionName, setMissionName] = useState(currentOrg.missionName);
  const [charterNumber, setCharterNumber] = useState(currentOrg.charterNumber);
  const [meetingSchedule, setMeetingSchedule] = useState(currentOrg.meetingSchedule);
  const [location, setLocation] = useState(currentOrg.location);
  const [annualDuesAmount, setAnnualDuesAmount] = useState(currentOrg.annualDuesAmount);
  const [directorName, setDirectorName] = useState(currentOrg.directorName);
  const [pastorName, setPastorName] = useState(currentOrg.pastorName);
  const [contactEmail, setContactEmail] = useState(currentOrg.contactEmail);
  const [requireMedicalRelease, setRequireMedicalRelease] = useState(currentOrg.requireMedicalRelease);
  const [requireBaptismVerification, setRequireBaptismVerification] = useState(currentOrg.requireBaptismVerification);

  // New Church Onboarding Form State
  const [newChurchName, setNewChurchName] = useState('');
  const [newClubName, setNewClubName] = useState('');
  const [newDistrict, setNewDistrict] = useState('District 4 (Cascade Metro)');
  const [newDirector, setNewDirector] = useState('');
  const [newPastor, setNewPastor] = useState('');

  // Sync state when org switcher changes
  React.useEffect(() => {
    setChurchName(currentOrg.churchName);
    setDistrictName(currentOrg.districtName);
    setMissionName(currentOrg.missionName);
    setCharterNumber(currentOrg.charterNumber);
    setMeetingSchedule(currentOrg.meetingSchedule);
    setLocation(currentOrg.location);
    setAnnualDuesAmount(currentOrg.annualDuesAmount);
    setDirectorName(currentOrg.directorName);
    setPastorName(currentOrg.pastorName);
    setContactEmail(currentOrg.contactEmail);
    setRequireMedicalRelease(currentOrg.requireMedicalRelease);
    setRequireBaptismVerification(currentOrg.requireBaptismVerification);
  }, [currentOrg]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization(currentOrgId, {
      churchName,
      districtName,
      missionName,
      charterNumber,
      meetingSchedule,
      location,
      annualDuesAmount: Number(annualDuesAmount),
      directorName,
      pastorName,
      contactEmail,
      requireMedicalRelease,
      requireBaptismVerification,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddNewChurch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChurchName.trim()) return;

    const created = addOrganization({
      churchName: newChurchName.trim(),
      clubName: newClubName.trim() || `${newChurchName.trim()} Pathfinder & Adventurer Club`,
      districtId: 'dist-4',
      districtName: newDistrict,
      missionName: 'Cascade Conference / Mission',
      unionName: 'North Pacific Union Conference',
      charterNumber: `PF-CC-${Math.floor(1000 + Math.random() * 9000)}`,
      meetingSchedule: '1st & 3rd Sabbath at 3:00 PM',
      location: 'Springfield Metro Area',
      annualDuesAmount: 35,
      directorName: newDirector.trim() || 'New Director, MG',
      pastorName: newPastor.trim() || 'Pastor',
      requireMedicalRelease: true,
      requireBaptismVerification: false,
      latitude: 44.0500,
      longitude: -123.0300,
      geofenceRadiusMeters: 800,
      geofenceDistrictRadiusMiles: 20,
      contactEmail: 'club@church.org',
    });

    // Auto-provision one Pathfinder club and one Adventurer club for the new church
    const shortName = newChurchName.trim().split(' ')[0];
    try {
      const pfClub = await addClub({
        orgId: created.id,
        name: newClubName.trim() || `${shortName} Pathfinder Club`,
        clubType: 'Pathfinder',
        directorName: newDirector.trim() || 'New Director, MG',
        charterNumber: created.charterNumber,
        meetingSchedule: created.meetingSchedule,
        annualDues: created.annualDuesAmount,
      });
      const advClub = await addClub({
        orgId: created.id,
        name: `${shortName} Adventurer Club`,
        clubType: 'Adventurer',
        directorName: 'Adventurer Leader',
        charterNumber: `ADV-CC-${Math.floor(1000 + Math.random() * 9000)}`,
        meetingSchedule: created.meetingSchedule,
        annualDues: Math.round(created.annualDuesAmount * 0.7),
      });

      // Auto-provision a default unit under each club
      addUnit({
        orgId: created.id,
        clubId: pfClub.id,
        name: `${shortName} Falcons`,
        branch: 'Pathfinders',
        counselorName: newDirector.trim() || 'Unit Counselor',
        genderDivision: 'Co-ed',
        ageRange: 'Ages 10–13',
        motto: 'Eyes on Heaven',
      });
      addUnit({
        orgId: created.id,
        clubId: advClub.id,
        name: `${shortName} Busy Bees`,
        branch: 'Adventurers',
        counselorName: 'Adventurer Leader',
        genderDivision: 'Co-ed',
        ageRange: 'Ages 6–9',
        motto: 'Always Willing to Serve',
      });

      setShowAddChurchModal(false);
      setNewChurchName('');
      setNewClubName('');
      setNewDirector('');
    } catch (error) {
      console.error('Failed to provision church clubs:', error);
      alert('The church was created, but its default clubs could not be saved. Open that church in Settings and register the clubs again.');
      setShowAddChurchModal(false);
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubEntityName.trim() || clubSaving) return;

    setClubSaveError('');
    setClubSaving(true);
    try {
      const created = await addClub({
        orgId: currentOrgId,
        name: newClubEntityName.trim(),
        clubType: newClubType,
        directorName: newClubDirector.trim() || 'Club Director',
        directorEmail: newClubDirectorEmail.trim() || undefined,
        charterNumber: newClubCharter.trim() || `${newClubType.substring(0, 2).toUpperCase()}-CC-${Math.floor(1000 + Math.random() * 9000)}`,
        meetingSchedule: newClubMeetingSchedule.trim() || currentOrg.meetingSchedule,
        annualDues: Number(newClubAnnualDues) || 0,
        motto: newClubMotto.trim() || undefined,
      });

      setCurrentClubId(created.id);
      setShowAddClubModal(false);
      setNewClubEntityName('');
      setNewClubDirector('');
      setNewClubDirectorEmail('');
      setNewClubCharter('');
      setNewClubMeetingSchedule('');
      setNewClubMotto('');
    } catch (error) {
      console.error('Failed to register club:', error);
      const code = (error as { code?: string })?.code;
      setClubSaveError(code === 'permission-denied'
        ? 'The club could not be saved because access was denied. Check that you are signed in and try again.'
        : 'The club could not be saved. Check your connection and try again.');
    } finally {
      setClubSaving(false);
    }
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;

    addUnit({
      orgId: currentOrgId,
      divisionId: newUnitDivisionId || undefined,
      name: newUnitName.trim(),
      branch: newUnitBranch,
      counselorName: newCounselorName.trim() || 'Unit Counselor',
      counselorPhone: newCounselorPhone.trim(),
      genderDivision: newGenderDivision,
      ageRange: newAgeRange.trim(),
      motto: newMotto.trim(),
    });

    setShowAddUnitModal(false);
    setNewUnitName('');
    setNewCounselorName('');
    setNewCounselorPhone('');
    setNewMotto('');
    setNewUnitDivisionId('');
  };

  const handleCreateDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDivisionName.trim() || !currentClubId) return;

    addDivision({
      orgId: currentOrgId,
      clubId: currentClubId,
      name: newDivisionName.trim(),
      ageRange: newDivisionAgeRange.trim() || undefined,
      leaderName: newDivisionLeaderName.trim() || undefined,
      leaderPhone: newDivisionLeaderPhone.trim() || undefined,
    });

    setShowAddDivisionModal(false);
    setNewDivisionName('');
    setNewDivisionAgeRange('');
    setNewDivisionLeaderName('');
    setNewDivisionLeaderPhone('');
  };

  const districtStats = getDistrictRollupStats(currentOrg.districtId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Club & Hierarchy Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure church organizational levels, leadership accounts, registration policies, and multi-church federation.
          </p>
        </div>

        {/* Current Church Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Active Church:</span>
          <select
            value={currentOrgId}
            onChange={(e) => setCurrentOrgId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg shadow-xs text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
          >
            {organizations.map(org => (
              <option key={org.id} value={org.id}>
                {org.churchName} ({org.districtName})
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAddChurchModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Church</span>
          </button>

          {clubs.length > 0 && (
            <>
              <span className="text-xs text-slate-500 font-medium">Active Club:</span>
              <select
                value={currentClubId}
                onChange={(e) => setCurrentClubId(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg shadow-xs text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              >
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>
                    {club.name} ({club.clubType})
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'clubs', label: '1. Register Clubs', icon: Building2 },
          { id: 'units', label: '2. Register Club Units', icon: Compass },
          { id: 'permissions', label: '3. Tier Data Access Matrix', icon: ShieldCheck },
          { id: 'hierarchy', label: '4. Administrative Levels & Multi-Church', icon: Layers },
          { id: 'profile', label: '5. Church & Club Profile', icon: Building2 },
          { id: 'policy', label: '6. Registration & Fee Policies', icon: DollarSign },
          { id: 'district', label: '7. District Coordinator Rollup', icon: Globe2 },
          { id: 'staff', label: '8. Leadership Directory', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-900 text-blue-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Register Clubs */}
      {activeTab === 'clubs' && (
        <div className="space-y-6">
          {clubSaveMessage && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{clubSaveMessage}</p>}
          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                  Club Registration
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Clubs Registered at {currentOrg.churchName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  A church can sponsor more than one club (Pathfinder, Adventurer, Master Guide, etc.) — each with its own director, charter, dues, and meeting schedule.
                </p>
              </div>

              <button
                onClick={() => setShowAddClubModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Register New Club</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clubs.map((club) => (
                <div
                  key={club.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900">
                          {club.clubType}
                        </span>
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                          {club.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                      {canEditHierarchy && (
                        <button onClick={() => { setClubSaveMessage(''); setEditingClub(club); }}
                          aria-label={`Edit club ${club.name}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete club "${club.name}"? Its units will become unassigned.`)) {
                            deleteClub(club.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete club"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      </div>
                    </div>

                    {club.motto && (
                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 italic border border-slate-100">
                        Club Motto: "{club.motto}"
                      </div>
                    )}

                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-950 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                          {club.directorName[0]}
                        </div>
                        <div>
                          <strong className="block text-slate-900">{club.directorName}</strong>
                          <span className="text-[11px] text-slate-500">Club Director</span>
                        </div>
                      </div>
                      {club.directorPhone && (
                        <span className="text-[11px] font-mono text-slate-600">
                          {club.directorPhone}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-500 block">Charter Number</span>
                        <span className="font-mono font-semibold text-slate-800">{club.charterNumber}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-500 block">Annual Dues</span>
                        <span className="font-semibold text-slate-800">${club.annualDues}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 col-span-2">
                        <span className="text-slate-500 block">Meeting Schedule</span>
                        <span className="font-semibold text-slate-800">{club.meetingSchedule}</span>
                      </div>
                    </div>

                    <div className="pt-1 text-[11px] text-slate-500">
                      {allUnits.filter(u => u.clubId === club.id).length} unit(s) ·{' '}
                      {members.filter(m => m.clubId === club.id).length} member(s)
                    </div>

                    {(() => {
                      const clubDivisions = allDivisions.filter(d => d.clubId === club.id);
                      const clubUnits = allUnits.filter(u => u.clubId === club.id);
                      const ungroupedCount = clubUnits.filter(u => !u.divisionId).length;
                      if (clubDivisions.length === 0) return null;
                      return (
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10px]">
                          {clubDivisions.map(div => (
                            <span key={div.id} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                              {div.name} ({clubUnits.filter(u => u.divisionId === div.id).length} units)
                            </span>
                          ))}
                          {ungroupedCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 font-medium border border-slate-200">
                              {ungroupedCount} unit(s) ungrouped
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>

            {clubs.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Clubs Registered Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Register your first club (e.g. a Pathfinder club or Adventurer club) under {currentOrg.churchName}.
                </p>
                <button
                  onClick={() => setShowAddClubModal(true)}
                  className="px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Register First Club
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Register Club Units */}
      {activeTab === 'units' && (
        <div className="space-y-6">
          {unitSaveMessage && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{unitSaveMessage}</p>}
          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                  Patrol & Counselor Management
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Registered Units for {currentClub?.name ?? currentOrg.clubName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Units are small patrols of 6–8 youth led by a Counselor for weekly curriculum, marching drill, and camporee honors.
                </p>
              </div>

              <button
                onClick={() => setShowAddUnitModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Register New Unit</span>
              </button>
            </div>

            {/* Divisions: optional grouping of units within this club */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800">Divisions in this club</span>
                  <p className="text-[11px] text-slate-500">
                    Optional — group units together (e.g. a Teen Division and a Junior Division) if this club is large enough to need it.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddDivisionModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-800 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Division</span>
                </button>
              </div>

              {divisions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {divisions.map(div => (
                    <div
                      key={div.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px]"
                    >
                      <span className="font-bold text-slate-900">{div.name}</span>
                      {div.ageRange && <span className="text-slate-500">{div.ageRange}</span>}
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600">{units.filter(u => u.divisionId === div.id).length} unit(s)</span>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete division "${div.name}"? Its units become ungrouped.`)) {
                            deleteDivision(div.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete division"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* KPI summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider block">
                  Registered Units
                </span>
                <strong className="text-2xl font-bold font-mono text-slate-900 block mt-1">
                  {units.length}
                </strong>
                <span className="text-slate-500 text-[11px]">
                  {units.filter(u => u.branch === 'Pathfinders').length} Pathfinders · {units.filter(u => u.branch === 'Adventurers').length} Adventurers
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider block">
                  Assigned Youth
                </span>
                <strong className="text-2xl font-bold font-mono text-emerald-700 block mt-1">
                  {members.filter(m => m.unitId).length}
                </strong>
                <span className="text-slate-500 text-[11px]">Placed into units</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider block">
                  Awaiting Unit Placement
                </span>
                <strong className="text-2xl font-bold font-mono text-amber-700 block mt-1">
                  {members.filter(m => !m.unitId).length}
                </strong>
                <span className="text-slate-500 text-[11px]">Needs assignment</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 uppercase text-[10px] font-bold tracking-wider block">
                  Active Counselors
                </span>
                <strong className="text-2xl font-bold font-mono text-blue-900 block mt-1">
                  {units.filter(u => u.counselorName).length}
                </strong>
                <span className="text-slate-500 text-[11px]">Leading units</span>
              </div>
            </div>

            {/* Branch Filter */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Filter Branch:</span>
                {(['All', 'Pathfinders', 'Adventurers'] as const).map(br => (
                  <button
                    key={br}
                    onClick={() => setUnitBranchFilter(br)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      unitBranchFilter === br
                        ? 'bg-blue-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {br}
                  </button>
                ))}
              </div>
            </div>

            {/* Units Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {units
                .filter(u => unitBranchFilter === 'All' ? true : u.branch === unitBranchFilter)
                .map((unit) => {
                  const unitYouth = members.filter(m => m.unitId === unit.id || m.unitName === unit.name);
                  const unassigned = members.filter(m => !m.unitId && (m.branch === unit.branch || m.branch === 'Staff'));

                  return (
                    <div
                      key={unit.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                unit.branch === 'Pathfinders'
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {unit.branch}
                              </span>
                              {unit.genderDivision && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                  {unit.genderDivision}
                                </span>
                              )}
                              {unit.ageRange && (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {unit.ageRange}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                              {unit.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1">
                          {canEditHierarchy && (
                            <button onClick={() => { setUnitSaveMessage(''); setEditingUnit(unit); }}
                              aria-label={`Edit unit ${unit.name}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100">
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete unit "${unit.name}"? Members will become unassigned.`)) {
                                deleteUnit(unit.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete unit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          </div>
                        </div>

                        {unit.motto && (
                          <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 italic border border-slate-100">
                            Unit Motto: "{unit.motto}"
                          </div>
                        )}

                        {/* Counselor Info */}
                        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-950 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                              {unit.counselorName[0]}
                            </div>
                            <div>
                              <strong className="block text-slate-900">{unit.counselorName}</strong>
                              <span className="text-[11px] text-slate-500">Unit Counselor</span>
                            </div>
                          </div>
                          {unit.counselorPhone && (
                            <span className="text-[11px] font-mono text-slate-600">
                              {unit.counselorPhone}
                            </span>
                          )}
                        </div>

                        {/* Enrolled Youth List */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">
                              Enrolled Youth ({unitYouth.length})
                            </span>
                            <span className="text-[11px] text-slate-500">Target: 6–8 youth</span>
                          </div>

                          {unitYouth.length === 0 ? (
                            <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400 border border-slate-100">
                              No youth assigned yet to this unit.
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {unitYouth.map(y => (
                                <span
                                  key={y.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                                >
                                  <span>{y.firstName} {y.lastName}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">({y.className})</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Assign Youth to this Unit */}
                      {unassigned.length > 0 && (
                        <div className="pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  assignUnit(e.target.value, unit.id);
                                  e.target.value = '';
                                }
                              }}
                              defaultValue=""
                              className="w-full text-xs py-1.5 px-2.5 border border-slate-300 rounded-lg text-slate-700 bg-white cursor-pointer"
                            >
                              <option value="" disabled>+ Assign unassigned youth to {unit.name}...</option>
                              {unassigned.map(u => (
                                <option key={u.id} value={u.id}>
                                  {u.firstName} {u.lastName} ({u.branch} - {u.className})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {units.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <Compass className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">No Units Registered Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create your first Pathfinder or Adventurer unit patrol (e.g. Golden Eagles, Busy Bees) to begin grouping your club members.
                </p>
                <button
                  onClick={() => setShowAddUnitModal(true)}
                  className="px-4 py-2 bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Register First Unit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Tier Data Access Matrix */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                  Data Privacy & Role-Based Access Control (RBAC)
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  How Each Administrative Tier Sees & Manages Data
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-tenant isolation ensures data security, HIPAA-grade medical confidentiality, and appropriate organizational oversight.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Currently viewing as:</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                  {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Guest'}
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Tier Level</th>
                    <th className="py-3 px-4">Authorized Roles</th>
                    <th className="py-3 px-4">Data Scope (What They See)</th>
                    <th className="py-3 px-4">Medical & Contact Access</th>
                    <th className="py-3 px-4">Permissions (What They Can Edit)</th>
                    <th className="py-3 px-4">Cross-Church Boundary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Tier 1: Mission */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-purple-900">
                      Tier 1: Mission / Conference
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      Mission Youth Director, Conference Secretary
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <strong>All Districts & All Churches</strong>: Total youth headcount, active club charters, conference camporee quotas, leader certifications.
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      Emergency safety manifest during Conference Camporees; statistical aggregations.
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      Approve club charters, sanction conference honors, clear background checks.
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-purple-700">
                      Conference-wide (All Churches)
                    </td>
                  </tr>

                  {/* Tier 2: District */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-amber-900">
                      Tier 2: District
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      District Coordinator, Area Master Guide
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <strong>Clubs within Assigned District</strong> (e.g. 4–8 churches). Rollup attendance rates, Bible Bowl rosters, district honor events.
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      District rally safety sheets and emergency contacts for joint campouts.
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      District event scheduling, coordinate joint drill scoring, view club readiness.
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-amber-700">
                      Assigned District Only
                    </td>
                  </tr>

                  {/* Tier 3: Local Church */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-blue-900">
                      Tier 3: Local Church Board
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      Church Sponsoring Pastor, Youth Elder
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <strong>Their Own Church Clubs Only</strong>: Adventurers and Pathfinders registered at this local congregation.
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      Full pastoral contact and family information; baptism status tracking.
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      Sign-off on church board sponsorship, pastoral endorsements, baptismal records.
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-700">
                      Strictly Isolated (Own Church Only)
                    </td>
                  </tr>

                  {/* Tier 4: Club Directorate */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-emerald-900">
                      Tier 4: Club Directorate
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      Club Director, Deputy Director, Scribe, Treasurer
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <strong>Full Operational Access for Own Club</strong>: In-depth registration review queue, dues status ($35), uniform sizes, unit rosters.
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <strong className="text-rose-700">Full Access:</strong> Allergies, asthma, dietary, doctor, parental waivers & phone.
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      Approve/clarify member registrations, assign youth to units, mark dues paid, create club meetings.
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-700">
                      Strictly Isolated (Own Club Only)
                    </td>
                  </tr>

                  {/* Tier 5: Unit Counselors */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Tier 5: Unit Counselor
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      Counselors for Eagles, Wolves, Bees, Builders...
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <strong>Assigned Unit Scope</strong>: 6–8 youth in their specific unit, class requirements progress, live weekly meeting attendance.
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      Unit emergency phone numbers and immediate allergy flags (e.g. EpiPen alerts).
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      Real-time live attendance check-in, QR scanning, unit attendance remarks.
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      Scoped to Unit & Club
                    </td>
                  </tr>

                  {/* Tier 6: Parent / Member */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      Tier 6: Parent & Youth
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      Parents, Guardians, Youth Members
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <strong>Own Family Only</strong>: Application submission, status tracking code, own youth's Digital ID Card and QR Pass.
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      Own child's profile only. Absolutely no visibility into other families' private medical forms.
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      Submit application, update contact details, present QR pass on arrival.
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-500">
                      Private / Own Record
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Privacy Architecture Callout */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Three Core Data Separation Principles
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>
                  <strong>Church Boundary (Multi-Tenant Isolation):</strong> Youth registered at <em>Grace SDA Church</em> never leak into <em>Berean SDA Church</em>'s review queue or live attendance roster. Each congregation maintains their own private roster.
                </li>
                <li>
                  <strong>Medical Privacy (Need-to-Know Rule):</strong> Confidential medical alerts (asthma, bee sting allergies, prescription meds) are only accessible to the Club Director, Club Nurse, and the youth's immediate Unit Counselor during camping trips.
                </li>
                <li>
                  <strong>Rollup Summaries for Leaders:</strong> Higher tiers (District Coordinators and Conference Directors) see statistical counts (e.g. "Grace SDA: 18 youth, 16 approved, 90% attendance") without needing to browse individual parents' home addresses.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Hierarchy & Multi-Church Architecture */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                SDA Youth Ministries Administrative Hierarchy
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                How membership registration and real-time attendance scale across Seventh-day Adventist administrative tiers:
              </p>
            </div>

            {/* Visual Multi-Tier Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Level 1: Mission / Conference */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                    Tier 1 · Mission / Conference
                  </span>
                  <h3 className="font-bold text-sm text-purple-950 mt-1">{currentOrg.missionName}</h3>
                  <p className="text-[11px] text-purple-800 mt-2 leading-relaxed">
                    Oversees charter issuance, background check clearances, annual conference camporees, and youth insurance coverage.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-200 text-[10px] text-purple-900 font-semibold">
                  Youth Director: Dr. Angela Vance
                </div>
              </div>

              {/* Level 2: District */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                    Tier 2 · District
                  </span>
                  <h3 className="font-bold text-sm text-amber-950 mt-1">{currentOrg.districtName}</h3>
                  <p className="text-[11px] text-amber-800 mt-2 leading-relaxed">
                    Clusters 4–8 local church clubs together. Coordinates joint drill competitions, Bible Bowl, and district campouts.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-200 text-[10px] text-amber-900 font-semibold">
                  Coordinator: Elder Samuel Vance
                </div>
              </div>

              {/* Level 3: Local Church */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                    Tier 3 · Local Church
                  </span>
                  <h3 className="font-bold text-sm text-blue-950 mt-1">{currentOrg.churchName}</h3>
                  <p className="text-[11px] text-blue-800 mt-2 leading-relaxed">
                    Church Board officially approves club charter, sponsors budget, provides fellowship hall facilities, and pastoral care.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-200 text-[10px] text-blue-900 font-semibold">
                  Pastor: {currentOrg.pastorName}
                </div>
              </div>

              {/* Level 4: Club */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Tier 4 · Club Directorate
                  </span>
                  <h3 className="font-bold text-sm text-emerald-950 mt-1">{currentClub?.name ?? currentOrg.clubName}</h3>
                  <p className="text-[11px] text-emerald-800 mt-2 leading-relaxed">
                    Manages online member applications, verifies dues payment, orders uniforms, conducts investitures and live attendance.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-200 text-[10px] text-emerald-900 font-semibold">
                  Director: {currentOrg.directorName}
                </div>
              </div>

              {/* Level 5: Unit & Member */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                    Tier 5 · Units & Youth
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">Units (Eagles, Wolves, Bees)</h3>
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                    Unit counselors lead 6–8 youth in weekly curriculum, marching drill, honors, craft badges, and QR check-ins.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-700 font-semibold">
                  Youth: Companion, Explorer, Sunbeam...
                </div>
              </div>
            </div>

            {/* Federation Table: Churches in this system */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Federated Churches in this System
                </h3>
                <span className="text-xs text-slate-500">
                  Click any church to switch active management scope
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {organizations.map(org => {
                  const isSelected = org.id === currentOrgId;
                  return (
                    <div
                      key={org.id}
                      onClick={() => setCurrentOrgId(org.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-900 bg-blue-50/40 ring-2 ring-blue-100 shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900 truncate">
                          {org.churchName}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900 text-white">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-blue-950 font-medium block truncate">
                        {org.clubName}
                      </span>
                      <div className="mt-3 text-[11px] text-slate-500 space-y-0.5">
                        <div>District: <strong className="text-slate-700">{org.districtName}</strong></div>
                        <div>Charter: <strong className="font-mono text-slate-700">{org.charterNumber}</strong></div>
                        <div>Director: <strong className="text-slate-700">{org.directorName}</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Church & Club Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Church & Club Official Profile</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Saved values appear on official membership ID passes, receipts, and camporee manifests.
              </p>
            </div>
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Settings Saved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Church Name *</label>
              <input
                type="text"
                required
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Conference / Mission Level</label>
              <input
                type="text"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">District Name & Number</label>
              <input
                type="text"
                value={districtName}
                onChange={(e) => setDistrictName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Charter ID / Number</label>
              <input
                type="text"
                value={charterNumber}
                onChange={(e) => setCharterNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Meeting Schedule</label>
              <input
                type="text"
                value={meetingSchedule}
                onChange={(e) => setMeetingSchedule(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Club Director Name</label>
              <input
                type="text"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Church Sponsoring Pastor</label>
              <input
                type="text"
                value={pastorName}
                onChange={(e) => setPastorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Venue Street Address</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Church Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Policy & Fee Configuration */}
      {activeTab === 'policy' && (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registration & Membership Dues Policy</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure club dues, required documentation, and approval rules for new applicants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Annual Club Registration Fee
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Covers official Pathfinder or Adventurer class book, scarf, slide, insurance fees to the conference, and semester honor badges.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-base font-bold text-slate-900">$</span>
                <input
                  type="number"
                  min="0"
                  max="250"
                  value={annualDuesAmount}
                  onChange={(e) => setAnnualDuesAmount(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 font-mono text-base font-bold border border-slate-300 rounded-lg bg-white"
                />
                <span className="text-slate-500">per youth / year</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                Compliance & Safety Mandates
              </h3>

              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireMedicalRelease}
                    onChange={(e) => setRequireMedicalRelease(e.target.checked)}
                    className="mt-0.5 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <strong className="block text-slate-800">Mandatory Medical Release Form</strong>
                    <span className="text-slate-500 block text-[11px]">
                      Requires doctor contact and emergency waiver signed before approval for campouts.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireBaptismVerification}
                    onChange={(e) => setRequireBaptismVerification(e.target.checked)}
                    className="mt-0.5 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <strong className="block text-slate-800">Track SDA Baptism Verification</strong>
                    <span className="text-slate-500 block text-[11px]">
                      Records whether youth is baptized or studying for baptism classes with church pastor.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => {
                updateOrganization(currentOrgId, {
                  annualDuesAmount: Number(annualDuesAmount),
                  requireMedicalRelease,
                  requireBaptismVerification,
                });
                alert('Policy settings updated successfully!');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Policies
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: District Coordinator Rollup Report */}
      {activeTab === 'district' && (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
                District Level Management Report
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {currentOrg.districtName} · Aggregate Status
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Coordinating Officer: <strong>Elder Samuel Vance</strong>
            </span>
          </div>

          {/* District KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">Churches in District</span>
              <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">{districtStats.churchCount}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">Total Youth Enrolled</span>
              <span className="text-2xl font-bold font-mono text-blue-900 mt-1 block">{districtStats.totalYouth}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">Approved Active</span>
              <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">{districtStats.approvedCount}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">Pending Reviews</span>
              <span className="text-2xl font-bold font-mono text-amber-700 mt-1 block">{districtStats.pendingCount}</span>
            </div>
          </div>

          {/* Comparative Table of Churches */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Local Church & Club</th>
                  <th className="py-2.5 px-4">Charter</th>
                  <th className="py-2.5 px-4">Director</th>
                  <th className="py-2.5 px-4">Registered Youth</th>
                  <th className="py-2.5 px-4">Pending Review</th>
                  <th className="py-2.5 px-4 text-right">Switch View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {districtStats.churches.map(({ org, youthCount, pendingCount, director }) => (
                  <tr key={org.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{org.churchName}</div>
                      <span className="text-slate-500 font-normal text-[11px]">{org.clubName}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{org.charterNumber}</td>
                    <td className="py-3 px-4 text-slate-800">{director}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{youthCount} Youth</td>
                    <td className="py-3 px-4">
                      {pendingCount > 0 ? (
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {pendingCount} Pending
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">All Reviewed</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setCurrentOrgId(org.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-900 hover:bg-blue-50 rounded border border-slate-200 transition-colors"
                      >
                        Inspect Club →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Staff & Leadership Directory */}
      {activeTab === 'staff' && (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Authorized Leaders & Counselors</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff members authorized to approve applications, take attendance, and conduct unit activities.
              </p>
            </div>
            <button
              onClick={() => alert('Use the Login / Registration modal in the top bar to add new leaders!')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-900 text-white rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Leader</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Leader Name</th>
                  <th className="py-2.5 px-4">Role & Tier</th>
                  <th className="py-2.5 px-4">Assigned Church / District</th>
                  <th className="py-2.5 px-4">Email & Phone</th>
                  <th className="py-2.5 px-4">Certification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffUsers.map((user) => {
                  const org = organizations.find(o => o.id === user.orgId);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {user.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-900">{user.role}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {user.role.includes('Mission') ? 'Cascade Conference' : org?.churchName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{user.email}</div>
                        <span className="font-mono text-[11px] text-slate-500">{user.phone || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        {user.investedMasterGuide ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Invested Master Guide
                          </span>
                        ) : (
                          <span className="text-slate-400">Counselor in Training</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Data Management & Demo Reset Section */}
      <div className="p-5 bg-slate-100 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Organization Data & Backups
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Export all multi-church records as JSON.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportDatabaseJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-800 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Database JSON</span>
          </button>
        </div>
      </div>

      {/* Add Church Modal */}
      {showAddChurchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 bg-blue-950 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Onboard New Church & Club</h3>
              <button 
                onClick={() => setShowAddChurchModal(false)}
                className="text-blue-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewChurch} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Church Name *</label>
                <input
                  type="text"
                  required
                  value={newChurchName}
                  onChange={(e) => setNewChurchName(e.target.value)}
                  placeholder="e.g. Damascus Seventh-day Adventist Church"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Club Name</label>
                <input
                  type="text"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  placeholder="e.g. Damascus Trailblazers Pathfinder Club"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">District</label>
                <select
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                >
                  <option value="District 4 (Cascade Metro)">District 4 (Cascade Metro)</option>
                  <option value="District 2 (Valley East)">District 2 (Valley East)</option>
                  <option value="District 1 (Coastal)">District 1 (Coastal)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Director Name</label>
                  <input
                    type="text"
                    value={newDirector}
                    onChange={(e) => setNewDirector(e.target.value)}
                    placeholder="Director Name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pastor Name</label>
                  <input
                    type="text"
                    value={newPastor}
                    onChange={(e) => setNewPastor(e.target.value)}
                    placeholder="Pastor Name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddChurchModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Create & Activate Church
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Club Modal */}
      {showAddClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Register New Club</h3>
                  <p className="text-[11px] text-blue-200">{currentOrg.churchName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddClubModal(false)}
                disabled={clubSaving}
                className="text-blue-200 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="p-6 space-y-4 text-xs">
              {clubSaveError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
                  {clubSaveError}
                </p>
              )}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Club Name *</label>
                <input
                  type="text"
                  required
                  value={newClubEntityName}
                  onChange={(e) => setNewClubEntityName(e.target.value)}
                  placeholder="e.g. Grace Wolverines Pathfinder Club"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Club Type *</label>
                  <select
                    value={newClubType}
                    onChange={(e) => setNewClubType(e.target.value as ClubType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-medium"
                  >
                    <option value="Pathfinder">Pathfinder</option>
                    <option value="Adventurer">Adventurer</option>
                    <option value="Master Guide">Master Guide</option>
                    <option value="Ambassador">Ambassador</option>
                    <option value="Eager Beaver">Eager Beaver</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Annual Dues ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={newClubAnnualDues}
                    onChange={(e) => setNewClubAnnualDues(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Club Director Name *</label>
                  <input
                    type="text"
                    required
                    value={newClubDirector}
                    onChange={(e) => setNewClubDirector(e.target.value)}
                    placeholder="e.g. Isaac Chen, MG"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Director Email</label>
                  <input
                    type="email"
                    value={newClubDirectorEmail}
                    onChange={(e) => setNewClubDirectorEmail(e.target.value)}
                    placeholder="director@church.org"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Charter Number</label>
                  <input
                    type="text"
                    value={newClubCharter}
                    onChange={(e) => setNewClubCharter(e.target.value)}
                    placeholder="Auto-generated if left blank"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meeting Schedule</label>
                  <input
                    type="text"
                    value={newClubMeetingSchedule}
                    onChange={(e) => setNewClubMeetingSchedule(e.target.value)}
                    placeholder="Defaults to church schedule"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Club Motto</label>
                <input
                  type="text"
                  value={newClubMotto}
                  onChange={(e) => setNewClubMotto(e.target.value)}
                  placeholder="e.g. The Love of Christ Compels Us"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClubModal(false)}
                  disabled={clubSaving}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  disabled={clubSaving}
                >
                  {clubSaving ? 'Saving Club…' : 'Register Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Division Modal */}
      {showAddDivisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Register New Division</h3>
                  <p className="text-[11px] text-blue-200">{currentClub?.name ?? currentOrg.clubName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDivisionModal(false)}
                className="text-blue-200 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDivision} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Division Name *</label>
                <input
                  type="text"
                  required
                  value={newDivisionName}
                  onChange={(e) => setNewDivisionName(e.target.value)}
                  placeholder="e.g. Teen Division, Junior Division"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age Range</label>
                  <input
                    type="text"
                    value={newDivisionAgeRange}
                    onChange={(e) => setNewDivisionAgeRange(e.target.value)}
                    placeholder="e.g. Ages 13–15"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Division Leader</label>
                  <input
                    type="text"
                    value={newDivisionLeaderName}
                    onChange={(e) => setNewDivisionLeaderName(e.target.value)}
                    placeholder="Leader name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leader Phone</label>
                <input
                  type="tel"
                  value={newDivisionLeaderPhone}
                  onChange={(e) => setNewDivisionLeaderPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDivisionModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Register Division
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {showAddUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Register New Club Unit</h3>
                  <p className="text-[11px] text-blue-200">{currentClub?.name ?? currentOrg.clubName}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddUnitModal(false)}
                className="text-blue-200 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUnit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit Patrol Name *</label>
                <input
                  type="text"
                  required
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="e.g. Peregrine Falcons, Busy Bees, Silver Wolves"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-medium"
                />
              </div>

              {divisions.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Division (optional)</label>
                  <select
                    value={newUnitDivisionId}
                    onChange={(e) => setNewUnitDivisionId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-medium"
                  >
                    <option value="">No division</option>
                    {divisions.map(div => (
                      <option key={div.id} value={div.id}>{div.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Club Branch *</label>
                  <select
                    value={newUnitBranch}
                    onChange={(e) => setNewUnitBranch(e.target.value as ClubBranch)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-medium"
                  >
                    <option value="Pathfinders">Pathfinders (Ages 10–15)</option>
                    <option value="Adventurers">Adventurers (Ages 4–9)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender Division</label>
                  <select
                    value={newGenderDivision}
                    onChange={(e) => setNewGenderDivision(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-medium"
                  >
                    <option value="Boys">Boys Unit</option>
                    <option value="Girls">Girls Unit</option>
                    <option value="Co-ed">Co-ed Unit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Counselor Name *</label>
                  <input
                    type="text"
                    required
                    value={newCounselorName}
                    onChange={(e) => setNewCounselorName(e.target.value)}
                    placeholder="e.g. Elder Samuel Vance, MG"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Counselor Phone</label>
                  <input
                    type="tel"
                    value={newCounselorPhone}
                    onChange={(e) => setNewCounselorPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age / Class Group</label>
                  <input
                    type="text"
                    value={newAgeRange}
                    onChange={(e) => setNewAgeRange(e.target.value)}
                    placeholder="e.g. Ages 10–12 / 5th–6th"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Motto</label>
                  <input
                    type="text"
                    value={newMotto}
                    onChange={(e) => setNewMotto(e.target.value)}
                    placeholder="e.g. Soaring for Christ"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 text-[11px] leading-relaxed">
                <strong>Unit Assignment:</strong> Once registered, youth can be assigned to this unit during membership review, registration, or real-time attendance rosters.
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Register Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editingUnit && canEditHierarchy && (
        <EditUnitModal key={editingUnit.id} unit={editingUnit}
          onClose={() => setEditingUnit(null)}
          onSaved={() => { setEditingUnit(null); setUnitSaveMessage('Unit details saved.'); }} />
      )}
      {editingClub && canEditHierarchy && (
        <EditClubModal key={editingClub.id} club={editingClub}
          onClose={() => setEditingClub(null)}
          onSaved={() => { setEditingClub(null); setClubSaveMessage('Club details saved.'); }} />
      )}
    </div>
  );
};
