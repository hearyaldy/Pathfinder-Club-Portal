import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  onSnapshot,
  writeBatch,
  CollectionReference,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import {
  Member,
  MemberDetails,
  MEMBER_DETAIL_FIELDS,
  ClubEvent,
  ClubUnit,
  UnitDetails,
  ClubEntity,
  ClubDetails,
  Division,
  AttendanceRecord,
  MemberEvaluation,
  ClubBranch,
  RegistrationStatus,
  AttendanceStatus,
  ChurchOrganization,
  AuthUser,
  UserGeoSettings,
  GeoLocationState
} from '../types/club';
import {
  calculateDistanceMiles,
  calculateDistanceMeters,
  filterChurchesByGeofence
} from '../utils/geoUtils';
import { getMaxScoreForEvent, SCORE_CATEGORY_MAX } from '../utils/scoreUtils';

interface ClubContextType {
  // Geofencing & Location Scope
  geoSettings: UserGeoSettings;
  geoLocationState: GeoLocationState;
  updateGeoSettings: (updates: Partial<UserGeoSettings>) => void;
  requestUserLocation: () => void;
  setSimulatedLocation: (loc: { name: string; latitude: number; longitude: number } | null) => void;
  distanceToCurrentChurch: number | null;
  isWithinCurrentChurchGeofence: boolean;
  geofencedChurches: Array<ChurchOrganization & { distanceMiles?: number }>;

  // Hierarchy & Church Scope
  organizations: ChurchOrganization[];
  currentOrgId: string;
  currentOrg: ChurchOrganization;
  setCurrentOrgId: (id: string) => void;
  updateOrganization: (orgId: string, updates: Partial<ChurchOrganization>) => void;
  addOrganization: (newOrg: Omit<ChurchOrganization, 'id'>) => ChurchOrganization;

  // Leadership (read-only here — sign-in/sign-up/sign-out go through Firebase Auth directly, see AuthModal)
  currentUser: AuthUser | null;
  staffUsers: AuthUser[];
  updateStaffUser: (uid: string, updates: Partial<AuthUser>) => void;
  deleteStaffUser: (uid: string) => void;

  // Clubs (a church may register more than one — Pathfinder, Adventurer, Master Guide, etc.)
  clubs: ClubEntity[]; // clubs under the current church
  allClubs: ClubEntity[];
  currentClubId: string;
  currentClub?: ClubEntity;
  setCurrentClubId: (id: string) => void;
  addClub: (clubData: Omit<ClubEntity, 'id'>) => Promise<ClubEntity>;
  updateClub: (clubId: string, updates: ClubDetails) => Promise<void>;
  deleteClub: (clubId: string) => void;

  // Divisions (optional grouping of Units within a Club)
  divisions: Division[]; // divisions under the current club
  allDivisions: Division[];
  addDivision: (divisionData: Omit<Division, 'id'>) => Division;
  updateDivision: (divisionId: string, updates: Partial<Division>) => void;
  deleteDivision: (divisionId: string) => void;

  // Members & Roster
  members: Member[]; // all members in current church
  allOrganizationMembers: Member[]; // all members across conference/district
  units: ClubUnit[]; // units in current church + current club
  allUnits: ClubUnit[];
  addUnit: (unitData: Omit<ClubUnit, 'id'>) => ClubUnit;
  updateUnit: (unitId: string, updates: UnitDetails) => Promise<void>;
  deleteUnit: (unitId: string) => void;
  registerMember: (data: Partial<Member> & { firstName: string; lastName: string; branch: Member['branch'] }) => Member;
  updateMemberStatus: (memberId: string, status: RegistrationStatus, notes?: string) => void;
  updateMemberDetails: (memberId: string, details: MemberDetails, unitId?: string) => Promise<void>;
  assignUnit: (memberId: string, unitId: string) => void;
  toggleDuesPaid: (memberId: string) => void;
  deleteMember: (memberId: string) => void;

  // Events & Attendance
  events: ClubEvent[];
  activeEventId: string;
  activeEvent?: ClubEvent;
  attendance: AttendanceRecord[];
  recordAttendance: (
    eventId: string,
    memberId: string,
    status: AttendanceStatus,
    checkInMethod?: 'Manual' | 'QR Code' | 'Fast Roster',
    notes?: string
  ) => void;
  markBatchAttendance: (eventId: string, memberIds: string[], status: AttendanceStatus) => void;
  addEvent: (eventData: Omit<ClubEvent, 'id' | 'isActive' | 'orgId'>) => ClubEvent;
  setActiveEventId: (eventId: string) => void;

  // Unit Scoring / Member Evaluations
  evaluations: MemberEvaluation[];
  recordEvaluation: (
    eventId: string,
    memberId: string,
    scores: { marchingDrillScore: number; uniformScore: number; disciplineScore: number; investitureBonusScore?: number },
    notes?: string
  ) => void;
  getMemberEvaluationForEvent: (eventId: string, memberId: string) => MemberEvaluation | undefined;
  getUnitLeaderboard: () => Array<{
    unitId: string;
    unitName: string;
    branch: ClubBranch;
    evaluationCount: number;
    averagePercentage: number;
  }>;

  // Utilities & Rollups
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => boolean;
  getMemberAttendanceForEvent: (eventId: string, memberId: string) => AttendanceRecord | undefined;
  getEventAttendanceStats: (eventId: string) => {
    totalEligible: number;
    present: number;
    late: number;
    excused: number;
    absent: number;
    attendanceRate: number;
  };
  getDistrictRollupStats: (districtId: string) => {
    churchCount: number;
    totalYouth: number;
    approvedCount: number;
    pendingCount: number;
    churches: Array<{
      org: ChurchOrganization;
      youthCount: number;
      pendingCount: number;
      director: string;
    }>;
  };
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

const orgsCol = collection(db, 'organizations');
const clubsCol = collection(db, 'clubs');
const divisionsCol = collection(db, 'divisions');
const unitsCol = collection(db, 'units');
const membersCol = collection(db, 'members');
const eventsCol = collection(db, 'events');
const attendanceCol = collection(db, 'attendance');
const evaluationsCol = collection(db, 'evaluations');
const usersCol = collection(db, 'users');

// Subscribes to a whole Firestore collection and mirrors it into local state in real time.
function subscribeCollection<T>(
  colRef: CollectionReference,
  setter: React.Dispatch<React.SetStateAction<T[]>>
): () => void {
  return onSnapshot(
    colRef,
    (snap) => setter(snap.docs.map((d) => ({ ...(d.data() as object), id: d.id } as T))),
    (err) => console.error(`Firestore subscription failed for ${colRef.path}:`, err)
  );
}

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<ChurchOrganization[]>([]);
  const [orgsLoaded, setOrgsLoaded] = useState(false);
  const [staffUsers, setStaffUsers] = useState<AuthUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allEvents, setAllEvents] = useState<ClubEvent[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [allEvaluations, setAllEvaluations] = useState<MemberEvaluation[]>([]);
  const [allUnits, setAllUnits] = useState<ClubUnit[]>([]);
  const [allClubs, setAllClubs] = useState<ClubEntity[]>([]);
  const [allDivisions, setAllDivisions] = useState<Division[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string>('org-grace');
  const [currentClubId, setCurrentClubId] = useState<string>('');

  // Live Firestore sync — replaces the old localStorage read/write pairs.
  useEffect(() => {
    const unsubOrgs = onSnapshot(
      orgsCol,
      (snap) => {
        setOrganizations(snap.docs.map((d) => ({ ...(d.data() as object), id: d.id } as ChurchOrganization)));
        setOrgsLoaded(true);
      },
      (err) => console.error('Firestore subscription failed for organizations:', err)
    );
    const unsubClubs = subscribeCollection<ClubEntity>(clubsCol, setAllClubs);
    const unsubDivisions = subscribeCollection<Division>(divisionsCol, setAllDivisions);
    const unsubUnits = subscribeCollection<ClubUnit>(unitsCol, setAllUnits);
    const unsubMembers = subscribeCollection<Member>(membersCol, setAllMembers);
    const unsubEvents = subscribeCollection<ClubEvent>(eventsCol, setAllEvents);
    const unsubAttendance = subscribeCollection<AttendanceRecord>(attendanceCol, setAllAttendance);
    const unsubEvaluations = subscribeCollection<MemberEvaluation>(evaluationsCol, setAllEvaluations);
    const unsubUsers = subscribeCollection<AuthUser>(usersCol, setStaffUsers);

    return () => {
      unsubOrgs();
      unsubClubs();
      unsubDivisions();
      unsubUnits();
      unsubMembers();
      unsubEvents();
      unsubAttendance();
      unsubEvaluations();
      unsubUsers();
    };
  }, []);

  // Live auth session: follow Firebase Auth, then the signed-in leader's profile doc.
  useEffect(() => {
    let unsubUserDoc: (() => void) | undefined;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubUserDoc?.();
      unsubUserDoc = undefined;
      if (!user) {
        setCurrentUser(null);
        return;
      }
      unsubUserDoc = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => setCurrentUser(snap.exists() ? ({ ...(snap.data() as object), id: user.uid } as AuthUser) : null),
        (err) => console.error('Failed to load leader profile:', err)
      );
    });
    return () => {
      unsubAuth();
      unsubUserDoc?.();
    };
  }, []);

  // If the signed-in leader belongs to one specific church, switch straight to it.
  useEffect(() => {
    if (currentUser?.orgId && currentUser.role !== 'Super Admin' && currentUser.role !== 'Mission Youth Director' && currentUser.role !== 'District Coordinator') {
      setCurrentOrgId(currentUser.orgId);
    }
  }, [currentUser]);

  // Geofencing State (per-device preference, not shared club data — stays in localStorage)
  const [geoSettings, setGeoSettings] = useState<UserGeoSettings>(() => {
    const saved = localStorage.getItem('pathfinder_club_geo_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      enabled: true,
      autoDetectLocation: false,
      maxDistanceMiles: 0, // 0 = unlimited
      enforceAttendanceGeofence: false,
      simulatedLocation: null,
    };
  });

  const [geoLocationState, setGeoLocationState] = useState<GeoLocationState>({
    userLat: null,
    userLng: null,
    accuracy: null,
    status: 'idle',
  });

  useEffect(() => {
    localStorage.setItem('pathfinder_club_geo_settings', JSON.stringify(geoSettings));
  }, [geoSettings]);

  // Request actual GPS coordinates from browser
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoLocationState(prev => ({
        ...prev,
        status: 'denied',
        errorMsg: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setGeoLocationState(prev => ({ ...prev, status: 'requesting', errorMsg: undefined }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGeoLocationState({
          userLat: latitude,
          userLng: longitude,
          accuracy,
          status: 'granted',
        });
      },
      (error) => {
        let msg = 'Location request was declined.';
        if (error.code === error.TIMEOUT) msg = 'Location request timed out.';
        if (error.code === error.POSITION_UNAVAILABLE) msg = 'Position unavailable.';
        setGeoLocationState(prev => ({
          ...prev,
          status: 'denied',
          errorMsg: msg,
        }));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const updateGeoSettings = (updates: Partial<UserGeoSettings>) => {
    setGeoSettings(prev => ({ ...prev, ...updates }));
  };

  const setSimulatedLocation = (loc: { name: string; latitude: number; longitude: number } | null) => {
    if (loc) {
      updateGeoSettings({ simulatedLocation: loc });
      setGeoLocationState({
        userLat: loc.latitude,
        userLng: loc.longitude,
        accuracy: 10,
        status: 'simulated',
      });
    } else {
      updateGeoSettings({ simulatedLocation: null });
      setGeoLocationState({
        userLat: null,
        userLng: null,
        accuracy: null,
        status: 'idle',
      });
    }
  };

  // Effective coordinates: either simulated location or detected GPS
  const effectiveLat = geoSettings.simulatedLocation?.latitude ?? geoLocationState.userLat;
  const effectiveLng = geoSettings.simulatedLocation?.longitude ?? geoLocationState.userLng;

  // Derived current org
  const currentOrg = organizations.find(o => o.id === currentOrgId) || organizations[0];

  // Distance to current church (guarded: organizations may still be loading)
  const distanceToCurrentChurch = (effectiveLat !== null && effectiveLng !== null && currentOrg)
    ? calculateDistanceMiles(effectiveLat, effectiveLng, currentOrg.latitude, currentOrg.longitude)
    : null;

  // Check if within current church event geofence radius
  const isWithinCurrentChurchGeofence = (effectiveLat !== null && effectiveLng !== null && currentOrg)
    ? calculateDistanceMeters(effectiveLat, effectiveLng, currentOrg.latitude, currentOrg.longitude) <= (currentOrg.geofenceRadiusMeters || 800)
    : true;

  // Filtered churches based on geofence settings
  const geofencedChurches = filterChurchesByGeofence(
    effectiveLat,
    effectiveLng,
    organizations,
    geoSettings.enabled ? geoSettings.maxDistanceMiles : 0
  );

  // Clubs under the current church
  const clubs = allClubs.filter(c => c.orgId === currentOrgId);
  const currentClub = clubs.find(c => c.id === currentClubId);

  // Whenever current church (or its club list) changes, ensure the active club still belongs to it
  useEffect(() => {
    const churchClubs = allClubs.filter(c => c.orgId === currentOrgId);
    if (!churchClubs.some(c => c.id === currentClubId)) {
      setCurrentClubId(churchClubs[0]?.id || '');
    }
  }, [currentOrgId, allClubs]);

  // Divisions under the current club (an optional grouping of units within it)
  const divisions = allDivisions.filter(d => d.clubId === currentClubId);

  // Scoped members, events, units for current church (units further scoped to the active club, if any)
  const members = allMembers.filter(m => m.orgId === currentOrgId);
  const events = allEvents.filter(e => e.orgId === currentOrgId);
  const units = allUnits.filter(u => u.orgId === currentOrgId && (!currentClubId || u.clubId === currentClubId));

  const [activeEventId, setActiveEventId] = useState<string>('');

  // Whenever current church (or the event list) changes, ensure active event points to an event in that church
  useEffect(() => {
    const churchEvents = allEvents.filter(e => e.orgId === currentOrgId);
    if (churchEvents.length > 0 && !churchEvents.some(e => e.id === activeEventId)) {
      setActiveEventId(churchEvents[0].id);
    }
  }, [currentOrgId, allEvents]);

  const activeEvent = events.find(e => e.id === activeEventId);

  const updateOrganization = (orgId: string, updates: Partial<ChurchOrganization>) => {
    updateDoc(doc(db, 'organizations', orgId), updates);
  };

  const addOrganization = (newOrg: Omit<ChurchOrganization, 'id'>): ChurchOrganization => {
    const ref = doc(orgsCol);
    const created: ChurchOrganization = { ...newOrg, id: ref.id };
    setDoc(ref, created);
    setCurrentOrgId(created.id);
    return created;
  };

  const addClub = async (clubData: Omit<ClubEntity, 'id'>): Promise<ClubEntity> => {
    const ref = doc(clubsCol);
    const newClub: ClubEntity = { ...clubData, id: ref.id };
    await setDoc(ref, newClub);
    return newClub;
  };

  const updateClub = async (clubId: string, details: ClubDetails): Promise<void> => {
    const club = allClubs.find(c => c.id === clubId && c.orgId === currentOrgId);
    const managesMultipleChurches = currentUser && ['Super Admin', 'Mission Youth Director', 'District Coordinator'].includes(currentUser.role);
    if (!club || !currentUser || currentUser.role === 'Parent / Member' || (!managesMultipleChurches && currentUser.orgId !== club.orgId)) {
      throw new Error('You do not have permission to edit this club.');
    }
    if (!details.name.trim() || !details.directorName.trim() || !Number.isFinite(details.annualDues) || details.annualDues < 0) {
      throw Object.assign(new Error('Enter a club name, director, and valid annual dues.'), { code: 'invalid-club' });
    }
    const batch = writeBatch(db);
    batch.update(doc(db, 'clubs', clubId), {
      name: details.name.trim(),
      directorName: details.directorName.trim(),
      directorEmail: details.directorEmail?.trim() ?? '',
      directorPhone: details.directorPhone?.trim() ?? '',
      charterNumber: details.charterNumber.trim(),
      meetingSchedule: details.meetingSchedule.trim(),
      annualDues: details.annualDues,
      motto: details.motto?.trim() ?? '',
    });
    if (details.name.trim() !== club.name) {
      allMembers.filter(member => member.clubId === clubId && member.orgId === club.orgId).forEach(member => {
        batch.update(doc(db, 'members', member.id), { clubName: details.name.trim() });
      });
    }
    await batch.commit();
  };

  const deleteClub = (clubId: string) => {
    deleteDoc(doc(db, 'clubs', clubId));
    // Clear club assignment on units and members that pointed at it
    const batch = writeBatch(db);
    allUnits.filter(u => u.clubId === clubId).forEach(u => {
      batch.update(doc(db, 'units', u.id), { clubId: deleteField() });
    });
    allMembers.filter(m => m.clubId === clubId).forEach(m => {
      batch.update(doc(db, 'members', m.id), { clubId: deleteField(), clubName: deleteField() });
    });
    batch.commit();
  };

  const addDivision = (divisionData: Omit<Division, 'id'>): Division => {
    const ref = doc(divisionsCol);
    const newDivision: Division = { ...divisionData, id: ref.id };
    setDoc(ref, newDivision);
    return newDivision;
  };

  const updateDivision = (divisionId: string, updates: Partial<Division>) => {
    updateDoc(doc(db, 'divisions', divisionId), updates);
  };

  const deleteDivision = (divisionId: string) => {
    deleteDoc(doc(db, 'divisions', divisionId));
    // Clear division assignment on units and members that pointed at it
    const batch = writeBatch(db);
    allUnits.filter(u => u.divisionId === divisionId).forEach(u => {
      batch.update(doc(db, 'units', u.id), { divisionId: deleteField() });
    });
    allMembers.filter(m => m.divisionId === divisionId).forEach(m => {
      batch.update(doc(db, 'members', m.id), { divisionId: deleteField(), divisionName: deleteField() });
    });
    batch.commit();
  };

  const registerMember = (data: Partial<Member> & { firstName: string; lastName: string; branch: Member['branch'] }): Member => {
    const branchPrefix = data.branch === 'Pathfinders' ? 'PF' : (data.branch === 'Adventurers' ? 'ADV' : 'STF');
    const churchCode = currentOrg.churchName.split(' ')[0].substring(0, 3).toUpperCase();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const regNumber = `${branchPrefix}-${churchCode}-${randomSuffix}`;
    const ref = doc(membersCol);

    // A member's club (and division, if any) is inherited from its unit, or else the active club in Settings.
    const assignedUnit = data.unitId ? allUnits.find(u => u.id === data.unitId) : undefined;
    const resolvedClubId = data.clubId || assignedUnit?.clubId || currentClubId || undefined;
    const resolvedClubName = data.clubName || clubs.find(c => c.id === resolvedClubId)?.name;
    const resolvedDivisionId = assignedUnit?.divisionId || undefined;
    const resolvedDivisionName = resolvedDivisionId ? allDivisions.find(d => d.id === resolvedDivisionId)?.name : undefined;

    const newMember: Member = {
      id: ref.id,
      orgId: currentOrgId,
      registrationNumber: regNumber,
      branch: data.branch,
      className: data.className || (data.branch === 'Pathfinders' ? 'Friend' : 'Busy Bee'),
      clubId: resolvedClubId,
      clubName: resolvedClubName,
      divisionId: resolvedDivisionId,
      divisionName: resolvedDivisionName,
      unitId: data.unitId || undefined,
      unitName: data.unitName || undefined,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth || '2015-01-01',
      gender: data.gender || 'Male',
      parentName: data.parentName || 'Parent / Guardian',
      parentPhone: data.parentPhone || '(555) 000-0000',
      parentEmail: data.parentEmail || '',
      homeAddress: data.homeAddress || '',
      emergencyContact: data.emergencyContact || data.parentName || 'Emergency Contact',
      emergencyPhone: data.emergencyPhone || data.parentPhone || '(555) 000-0000',
      emergencyRelation: data.emergencyRelation || 'Parent',
      medicalConditions: data.medicalConditions || 'None reported',
      allergies: data.allergies || 'None',
      dietaryRestrictions: data.dietaryRestrictions || 'None',
      swimmingAbility: data.swimmingAbility || 'Beginner',
      uniformSize: data.uniformSize || 'Youth M',
      registrationStatus: 'Pending Review',
      statusNotes: data.statusNotes || `Registered online at ${currentOrg.churchName}. Awaiting leadership review.`,
      duesPaid: false,
      registrationDate: new Date().toISOString().split('T')[0],
      parentConsentSigned: data.parentConsentSigned ?? true,
      photoReleaseConsent: data.photoReleaseConsent ?? true,
    };

    setDoc(ref, newMember);
    return newMember;
  };

  const updateMemberDetails = async (memberId: string, details: MemberDetails, unitId?: string): Promise<void> => {
    const member = members.find(m => m.id === memberId);
    const managesMultipleChurches = currentUser && ['Super Admin', 'Mission Youth Director', 'District Coordinator'].includes(currentUser.role);
    if (!member || !currentUser || currentUser.role === 'Parent / Member' || (!managesMultipleChurches && currentUser.orgId !== member.orgId)) {
      throw new Error('You do not have permission to edit this member.');
    }
    if (!details.firstName.trim() || !details.lastName.trim()) {
      throw new Error('First and last names are required.');
    }
    const updates = Object.fromEntries(MEMBER_DETAIL_FIELDS
      .map(key => [key, details[key] === undefined ? deleteField() : details[key].trim()]));
    if (unitId !== undefined) {
      const unit = allUnits.find(u => u.id === unitId && u.orgId === member.orgId && (u.branch === member.branch || member.branch === 'Staff'));
      if (unitId && !unit) {
        throw Object.assign(new Error('Choose an available unit in this church and branch.'), { code: 'invalid-unit' });
      }
      const club = allClubs.find(c => c.id === unit?.clubId && c.orgId === member.orgId);
      const division = allDivisions.find(d => d.id === unit?.divisionId && d.clubId === unit?.clubId);
      Object.assign(updates, {
        unitId: unit?.id ?? deleteField(),
        unitName: unit?.name ?? deleteField(),
        divisionId: division?.id ?? deleteField(),
        divisionName: division?.name ?? deleteField(),
        ...(unit ? { clubId: unit.clubId ?? deleteField(), clubName: club?.name ?? deleteField() } : {}),
      });
    }
    await updateDoc(doc(db, 'members', memberId), updates);
  };

  const updateMemberStatus = (memberId: string, status: RegistrationStatus, notes?: string) => {
    updateDoc(doc(db, 'members', memberId), {
      registrationStatus: status,
      ...(notes !== undefined ? { statusNotes: notes } : {}),
    });
  };

  const assignUnit = (memberId: string, unitId: string) => {
    const unit = allUnits.find(u => u.id === unitId);
    const unitClub = unit?.clubId ? allClubs.find(c => c.id === unit.clubId) : undefined;
    const unitDivision = unit?.divisionId ? allDivisions.find(d => d.id === unit.divisionId) : undefined;
    updateDoc(doc(db, 'members', memberId), {
      unitId: unit ? unit.id : deleteField(),
      unitName: unit ? unit.name : deleteField(),
      clubId: unit ? (unit.clubId ?? deleteField()) : deleteField(),
      clubName: unit ? (unitClub?.name ?? deleteField()) : deleteField(),
      divisionId: unit ? (unit.divisionId ?? deleteField()) : deleteField(),
      divisionName: unit ? (unitDivision?.name ?? deleteField()) : deleteField(),
    });
  };

  const addUnit = (unitData: Omit<ClubUnit, 'id'>): ClubUnit => {
    const ref = doc(unitsCol);
    const newUnit: ClubUnit = { ...unitData, clubId: unitData.clubId || currentClubId || undefined, id: ref.id };
    setDoc(ref, newUnit);
    return newUnit;
  };

  const updateUnit = async (unitId: string, details: UnitDetails): Promise<void> => {
    const unit = allUnits.find(u => u.id === unitId && u.orgId === currentOrgId);
    const managesMultipleChurches = currentUser && ['Super Admin', 'Mission Youth Director', 'District Coordinator'].includes(currentUser.role);
    if (!unit || !currentUser || currentUser.role === 'Parent / Member' || (!managesMultipleChurches && currentUser.orgId !== unit.orgId)) {
      throw new Error('You do not have permission to edit this unit.');
    }
    if (!details.name.trim()) throw new Error('Unit name is required.');
    const division = allDivisions.find(d => d.id === details.divisionId && d.orgId === unit.orgId && d.clubId === unit.clubId);
    if (details.divisionId && !division) {
      throw Object.assign(new Error('Choose a division in this club.'), { code: 'invalid-division' });
    }
    const batch = writeBatch(db);
    batch.update(doc(db, 'units', unitId), {
      name: details.name.trim(),
      counselorName: details.counselorName.trim(),
      counselorPhone: details.counselorPhone?.trim() ?? '',
      genderDivision: details.genderDivision ?? deleteField(),
      ageRange: details.ageRange?.trim() ?? '',
      motto: details.motto?.trim() ?? '',
      divisionId: division?.id ?? deleteField(),
    });
    allMembers.filter(m => m.unitId === unitId && m.orgId === unit.orgId).forEach(m => {
      batch.update(doc(db, 'members', m.id), {
        unitName: details.name.trim(),
        divisionId: division?.id ?? deleteField(),
        divisionName: division?.name ?? deleteField(),
      });
    });
    await batch.commit();
  };

  const deleteUnit = (unitId: string) => {
    deleteDoc(doc(db, 'units', unitId));
    // Clear unit assignment on members
    const batch = writeBatch(db);
    allMembers.filter(m => m.unitId === unitId).forEach(m => {
      batch.update(doc(db, 'members', m.id), { unitId: deleteField(), unitName: deleteField() });
    });
    batch.commit();
  };

  const toggleDuesPaid = (memberId: string) => {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;
    updateDoc(doc(db, 'members', memberId), { duesPaid: !member.duesPaid });
  };

  const deleteMember = (memberId: string) => {
    deleteDoc(doc(db, 'members', memberId));
    const batch = writeBatch(db);
    allAttendance.filter(a => a.memberId === memberId).forEach(a => {
      batch.delete(doc(db, 'attendance', a.id));
    });
    batch.commit();
  };

  // Super Admin only (enforced by Firestore rules, not just the UI): manage any leader's profile/role.
  const updateStaffUser = (uid: string, updates: Partial<AuthUser>) => {
    updateDoc(doc(db, 'users', uid), updates);
  };

  const deleteStaffUser = (uid: string) => {
    // Removes the app profile (so the account loses all access), not the underlying
    // Firebase Auth login itself — deleting that requires the Admin SDK (see scripts/).
    deleteDoc(doc(db, 'users', uid));
  };

  const recordAttendance = (
    eventId: string,
    memberId: string,
    status: AttendanceStatus,
    checkInMethod: 'Manual' | 'QR Code' | 'Fast Roster' = 'Manual',
    notes?: string
  ) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // Deterministic id (one record per event+member) — avoids a find-or-create
    // race between devices checking the same member in at the same time.
    const recordId = `${eventId}_${memberId}`;
    const existing = allAttendance.find(a => a.eventId === eventId && a.memberId === memberId);
    const record: AttendanceRecord = {
      id: recordId,
      orgId: currentOrgId,
      eventId,
      memberId,
      status,
      checkInTime: (status === 'Present' || status === 'Late') ? (existing?.checkInTime || nowTime) : undefined,
      checkInMethod,
      notes: notes !== undefined ? notes : existing?.notes,
    };
    setDoc(doc(db, 'attendance', recordId), record);
  };

  const markBatchAttendance = (eventId: string, memberIds: string[], status: AttendanceStatus) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const batch = writeBatch(db);
    memberIds.forEach(mId => {
      const recordId = `${eventId}_${mId}`;
      const existing = allAttendance.find(a => a.eventId === eventId && a.memberId === mId);
      const record: AttendanceRecord = {
        id: recordId,
        orgId: currentOrgId,
        eventId,
        memberId: mId,
        status,
        checkInTime: (status === 'Present' || status === 'Late') ? (existing?.checkInTime || nowTime) : undefined,
        checkInMethod: 'Fast Roster',
      };
      batch.set(doc(db, 'attendance', recordId), record);
    });
    batch.commit();
  };

  const addEvent = (eventData: Omit<ClubEvent, 'id' | 'isActive' | 'orgId'>): ClubEvent => {
    const ref = doc(eventsCol);
    const newEvent: ClubEvent = { ...eventData, orgId: currentOrgId, id: ref.id, isActive: true };
    const batch = writeBatch(db);
    batch.set(ref, newEvent);
    allEvents.filter(e => e.orgId === currentOrgId).forEach(e => {
      batch.update(doc(db, 'events', e.id), { isActive: false });
    });
    batch.commit();
    setActiveEventId(newEvent.id);
    return newEvent;
  };

  const exportDatabaseJson = () => {
    const data = {
      organizations,
      staffUsers,
      members: allMembers,
      events: allEvents,
      attendance: allAttendance,
      units: allUnits,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pathfinder_mission_district_database_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      const batch = writeBatch(db);
      let writeCount = 0;
      const applyCollection = (items: unknown, colName: string) => {
        if (!Array.isArray(items)) return;
        items.forEach((item) => {
          const record = item as { id?: string };
          if (!record.id) return;
          batch.set(doc(db, colName, record.id), record);
          writeCount++;
        });
      };
      applyCollection(data.organizations, 'organizations');
      applyCollection(data.staffUsers, 'users');
      applyCollection(data.members, 'members');
      applyCollection(data.events, 'events');
      applyCollection(data.attendance, 'attendance');
      if (writeCount > 0) batch.commit();
      return true;
    } catch (e) {
      console.error('Failed to import database:', e);
      return false;
    }
  };

  const getMemberAttendanceForEvent = (eventId: string, memberId: string): AttendanceRecord | undefined => {
    return allAttendance.find(a => a.eventId === eventId && a.memberId === memberId);
  };

  const recordEvaluation = (
    eventId: string,
    memberId: string,
    scores: { marchingDrillScore: number; uniformScore: number; disciplineScore: number; investitureBonusScore?: number },
    notes?: string
  ) => {
    const event = allEvents.find(e => e.id === eventId);
    const member = allMembers.find(m => m.id === memberId);
    const attendanceRecord = allAttendance.find(a => a.eventId === eventId && a.memberId === memberId);
    const attendanceScore = (attendanceRecord?.status === 'Present' || attendanceRecord?.status === 'Late')
      ? SCORE_CATEGORY_MAX.ATTENDANCE
      : 0;
    const maxScore = getMaxScoreForEvent(event?.type ?? 'Regular Meeting');
    const investitureBonusScore = event?.type === 'Investiture' ? (scores.investitureBonusScore ?? 0) : undefined;
    const totalScore = Math.min(
      maxScore,
      attendanceScore + scores.marchingDrillScore + scores.uniformScore + scores.disciplineScore + (investitureBonusScore ?? 0)
    );

    const recordId = `${eventId}_${memberId}`;
    const record: MemberEvaluation = {
      id: recordId,
      orgId: currentOrgId,
      eventId,
      memberId,
      unitId: member?.unitId,
      attendanceScore,
      marchingDrillScore: scores.marchingDrillScore,
      uniformScore: scores.uniformScore,
      disciplineScore: scores.disciplineScore,
      investitureBonusScore,
      totalScore,
      maxScore,
      notes,
      evaluatedAt: new Date().toISOString(),
    };
    setDoc(doc(db, 'evaluations', recordId), record);
  };

  const getMemberEvaluationForEvent = (eventId: string, memberId: string): MemberEvaluation | undefined => {
    return allEvaluations.find(e => e.eventId === eventId && e.memberId === memberId);
  };

  const getUnitLeaderboard = () => {
    const orgUnits = allUnits.filter(u => u.orgId === currentOrgId);
    return orgUnits
      .map(unit => {
        const unitEvaluations = allEvaluations.filter(e => e.unitId === unit.id && e.orgId === currentOrgId);
        const averagePercentage = unitEvaluations.length > 0
          ? Math.round(
              (unitEvaluations.reduce((sum, e) => sum + e.totalScore / e.maxScore, 0) / unitEvaluations.length) * 100
            )
          : 0;
        return {
          unitId: unit.id,
          unitName: unit.name,
          branch: unit.branch,
          evaluationCount: unitEvaluations.length,
          averagePercentage,
        };
      })
      .filter(u => u.evaluationCount > 0)
      .sort((a, b) => b.averagePercentage - a.averagePercentage);
  };

  const getEventAttendanceStats = (eventId: string) => {
    const event = allEvents.find(e => e.id === eventId);
    let eligible = allMembers.filter(m => m.orgId === (event ? event.orgId : currentOrgId) && m.registrationStatus === 'Approved');
    if (event && event.branch !== 'Both') {
      eligible = eligible.filter(m => m.branch === event.branch || m.branch === 'Staff');
    }

    const records = allAttendance.filter(a => a.eventId === eventId);
    let present = 0;
    let late = 0;
    let excused = 0;
    let absent = 0;

    eligible.forEach(m => {
      const rec = records.find(r => r.memberId === m.id);
      if (!rec || rec.status === 'Absent') {
        absent++;
      } else if (rec.status === 'Present') {
        present++;
      } else if (rec.status === 'Late') {
        late++;
      } else if (rec.status === 'Excused') {
        excused++;
      }
    });

    const totalEligible = eligible.length;
    const checkedInCount = present + late;
    const attendanceRate = totalEligible > 0 ? Math.round((checkedInCount / totalEligible) * 100) : 0;

    return { totalEligible, present, late, excused, absent, attendanceRate };
  };

  const getDistrictRollupStats = (districtId: string) => {
    const districtOrgs = organizations.filter(o => o.districtId === districtId);
    const orgIds = districtOrgs.map(o => o.id);
    const districtYouth = allMembers.filter(m => orgIds.includes(m.orgId));
    const approvedCount = districtYouth.filter(m => m.registrationStatus === 'Approved').length;
    const pendingCount = districtYouth.filter(m => m.registrationStatus === 'Pending Review').length;

    const breakdown = districtOrgs.map(org => {
      const orgYouth = allMembers.filter(m => m.orgId === org.id);
      return {
        org,
        youthCount: orgYouth.length,
        pendingCount: orgYouth.filter(m => m.registrationStatus === 'Pending Review').length,
        director: org.directorName,
      };
    });

    return {
      churchCount: districtOrgs.length,
      totalYouth: districtYouth.length,
      approvedCount,
      pendingCount,
      churches: breakdown,
    };
  };

  if (!orgsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
        Connecting to Firebase…
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 text-sm text-center p-6">
        No church organizations found in Firestore.<br />
        Run the seed script (<code>npm run seed:firebase</code>) to populate initial data.
      </div>
    );
  }

  return (
    <ClubContext.Provider
      value={{
        geoSettings,
        geoLocationState,
        updateGeoSettings,
        requestUserLocation,
        setSimulatedLocation,
        distanceToCurrentChurch,
        isWithinCurrentChurchGeofence,
        geofencedChurches,
        organizations,
        currentOrgId,
        currentOrg,
        setCurrentOrgId,
        updateOrganization,
        addOrganization,
        currentUser,
        staffUsers,
        updateStaffUser,
        deleteStaffUser,
        clubs,
        allClubs,
        currentClubId,
        currentClub,
        setCurrentClubId,
        addClub,
        updateClub,
        deleteClub,
        divisions,
        allDivisions,
        addDivision,
        updateDivision,
        deleteDivision,
        members,
        allOrganizationMembers: allMembers,
        units,
        allUnits,
        addUnit,
        updateUnit,
        deleteUnit,
        registerMember,
        updateMemberStatus,
        updateMemberDetails,
        assignUnit,
        toggleDuesPaid,
        deleteMember,
        events,
        activeEventId,
        activeEvent,
        attendance: allAttendance,
        recordAttendance,
        markBatchAttendance,
        addEvent,
        setActiveEventId,
        evaluations: allEvaluations,
        recordEvaluation,
        getMemberEvaluationForEvent,
        getUnitLeaderboard,
        exportDatabaseJson,
        importDatabaseJson,
        getMemberAttendanceForEvent,
        getEventAttendanceStats,
        getDistrictRollupStats,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};
