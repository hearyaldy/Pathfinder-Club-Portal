import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  onSnapshot,
  query,
  where,
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
  EventDetails,
  ClubUnit,
  UnitDetails,
  ClubEntity,
  ClubDetails,
  Division,
  AttendanceRecord,
  MemberEvaluation,
  UnitDrillEvaluation,
  MemberHonor,
  ScopeStatBlock,
  ScopeReport,
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
import {
  calculateMemberScore,
  UniformTicks,
  calculateDrillScore,
  DrillCommandScores,
} from '../utils/scoreUtils';

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

  // Honors (advancement record)
  memberHonors: MemberHonor[];
  getMemberHonors: (memberId: string) => MemberHonor[];
  addMemberHonor: (memberId: string, data: Omit<MemberHonor, 'id' | 'orgId' | 'memberId'>) => Promise<MemberHonor>;
  updateMemberHonor: (honorId: string, updates: Partial<Omit<MemberHonor, 'id' | 'orgId' | 'memberId'>>) => Promise<void>;
  deleteMemberHonor: (honorId: string) => Promise<void>;

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
  addEvent: (eventData: EventDetails, activate?: boolean) => Promise<ClubEvent>;
  updateEvent: (eventId: string, details: EventDetails) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  setActiveEventId: (eventId: string) => void;

  // Unit Scoring / Member Evaluations (Attendance + uniform checklist, per member)
  evaluations: MemberEvaluation[];
  evaluationsLoading: boolean;
  evaluationsError: string;
  canManageScoring: boolean;
  recordEvaluation: (
    eventId: string,
    memberId: string,
    ticks: UniformTicks,
    notes?: string
  ) => Promise<void>;
  getMemberEvaluationForEvent: (eventId: string, memberId: string) => MemberEvaluation | undefined;
  getUnitLeaderboard: () => Array<{
    unitId: string;
    unitName: string;
    branch: ClubBranch;
    evaluationCount: number;
    averagePercentage: number;
  }>;

  // Marching & Drill scoring (per unit — each evaluator submits their own sheet; averaged per event)
  drillEvaluations: UnitDrillEvaluation[];
  drillEvaluationsLoading: boolean;
  drillEvaluationsError: string;
  recordUnitDrillScore: (
    eventId: string,
    unitId: string,
    evaluatorName: string,
    commandScores: DrillCommandScores,
    demeritUnitCaptain: number,
    demeritMembers: number,
    evaluationId?: string
  ) => Promise<void>;
  getUnitDrillEvaluationsForEvent: (eventId: string, unitId: string) => UnitDrillEvaluation[];
  getUnitDrillAverageForEvent: (eventId: string, unitId: string) => { averageScore: number; maxScore: number; evaluatorCount: number } | undefined;
  getUnitDrillLeaderboard: () => Array<{
    unitId: string;
    unitName: string;
    branch: ClubBranch;
    evaluationCount: number;
    averagePercentage: number;
  }>;

  // Club / Division / Unit statistics report
  getScopeReport: (
    scope: { clubId?: string; divisionId?: string; unitId?: string },
    dateFrom?: string,
    dateTo?: string
  ) => ScopeReport | undefined;

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
const drillEvaluationsCol = collection(db, 'unitDrillScores');
const memberHonorsCol = collection(db, 'memberHonors');
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
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [evaluationsError, setEvaluationsError] = useState('');
  const [allDrillEvaluations, setAllDrillEvaluations] = useState<UnitDrillEvaluation[]>([]);
  const [allMemberHonors, setAllMemberHonors] = useState<MemberHonor[]>([]);
  const [drillEvaluationsLoading, setDrillEvaluationsLoading] = useState(false);
  const [drillEvaluationsError, setDrillEvaluationsError] = useState('');
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
    const unsubUsers = subscribeCollection<AuthUser>(usersCol, setStaffUsers);

    return () => {
      unsubOrgs();
      unsubClubs();
      unsubDivisions();
      unsubUnits();
      unsubMembers();
      unsubEvents();
      unsubAttendance();
      unsubUsers();
    };
  }, []);

  const canManageScoring = !!currentUser && currentUser.role !== 'Parent / Member' && (
    currentUser.orgId === currentOrgId || ['Super Admin', 'Mission Youth Director', 'District Coordinator'].includes(currentUser.role)
  );
  useEffect(() => {
    setAllEvaluations([]);
    setEvaluationsError('');
    setEvaluationsLoading(canManageScoring);
    if (!canManageScoring) return;
    return onSnapshot(query(evaluationsCol, where('orgId', '==', currentOrgId)), snapshot => {
      setAllEvaluations(snapshot.docs.map(document => ({ ...document.data(), id: document.id } as MemberEvaluation)));
      setEvaluationsLoading(false);
    }, error => {
      console.error('Failed to load scores:', error);
      setAllEvaluations([]);
      setEvaluationsLoading(false);
      setEvaluationsError('Scores could not be loaded. Check your connection and scoring permissions, then reload the page.');
    });
  }, [canManageScoring, currentOrgId, currentUser?.id, currentUser?.role]);

  useEffect(() => {
    setAllDrillEvaluations([]);
    setDrillEvaluationsError('');
    setDrillEvaluationsLoading(canManageScoring);
    if (!canManageScoring) return;
    return onSnapshot(query(drillEvaluationsCol, where('orgId', '==', currentOrgId)), snapshot => {
      setAllDrillEvaluations(snapshot.docs.map(document => ({ ...document.data(), id: document.id } as UnitDrillEvaluation)));
      setDrillEvaluationsLoading(false);
    }, error => {
      console.error('Failed to load drill scores:', error);
      setAllDrillEvaluations([]);
      setDrillEvaluationsLoading(false);
      setDrillEvaluationsError('Drill scores could not be loaded. Check your connection and scoring permissions, then reload the page.');
    });
  }, [canManageScoring, currentOrgId, currentUser?.id, currentUser?.role]);

  useEffect(() => {
    setAllMemberHonors([]);
    if (!canManageScoring) return;
    return onSnapshot(query(memberHonorsCol, where('orgId', '==', currentOrgId)), snapshot => {
      setAllMemberHonors(snapshot.docs.map(document => ({ ...document.data(), id: document.id } as MemberHonor)));
    }, error => {
      console.error('Failed to load member honors:', error);
      setAllMemberHonors([]);
    });
  }, [canManageScoring, currentOrgId, currentUser?.id, currentUser?.role]);

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
  const events = allEvents.filter(e => e.orgId === currentOrgId && !e.deletedAt);
  const units = allUnits.filter(u => u.orgId === currentOrgId && (!currentClubId || u.clubId === currentClubId));

  const [activeEventId, setActiveEventId] = useState<string>('');

  // Whenever current church (or the event list) changes, ensure active event points to an event in that church
  useEffect(() => {
    const churchEvents = allEvents.filter(e => e.orgId === currentOrgId && !e.deletedAt);
    if (!churchEvents.some(e => e.id === activeEventId)) {
      setActiveEventId(churchEvents.find(e => e.isActive)?.id ?? churchEvents[0]?.id ?? '');
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

  const getMemberHonors = (memberId: string): MemberHonor[] => {
    return allMemberHonors.filter(h => h.memberId === memberId);
  };

  const addMemberHonor = async (memberId: string, data: Omit<MemberHonor, 'id' | 'orgId' | 'memberId'>): Promise<MemberHonor> => {
    if (!canManageScoring || !members.some(member => member.id === memberId)) throw new Error('You do not have permission to edit this member.');
    const ref = doc(memberHonorsCol);
    const newHonor: MemberHonor = { ...data, id: ref.id, orgId: currentOrgId, memberId };
    await setDoc(ref, newHonor);
    return newHonor;
  };

  const updateMemberHonor = async (honorId: string, updates: Partial<Omit<MemberHonor, 'id' | 'orgId' | 'memberId'>>): Promise<void> => {
    if (!canManageScoring || !allMemberHonors.some(honor => honor.id === honorId && honor.orgId === currentOrgId)) throw new Error('You do not have permission to edit this honor.');
    await updateDoc(doc(db, 'memberHonors', honorId), updates);
  };

  const deleteMemberHonor = async (honorId: string): Promise<void> => {
    if (!canManageScoring || !allMemberHonors.some(honor => honor.id === honorId && honor.orgId === currentOrgId)) throw new Error('You do not have permission to delete this honor.');
    await deleteDoc(doc(db, 'memberHonors', honorId));
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

  const assertCanManageEvents = () => {
    const managesMultipleChurches = currentUser && ['Super Admin', 'Mission Youth Director', 'District Coordinator'].includes(currentUser.role);
    if (!currentUser || currentUser.role === 'Parent / Member' || (!managesMultipleChurches && currentUser.orgId !== currentOrgId)) {
      throw Object.assign(new Error('You do not have permission to manage these events.'), { code: 'permission-denied' });
    }
  };

  const eventDetailsForSave = (details: EventDetails): EventDetails => {
    assertCanManageEvents();
    if (!details.title.trim() || !details.time.trim() || !details.location.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(details.date) ||
        !['Both', 'Pathfinders', 'Adventurers'].includes(details.branch) ||
        !['Regular Meeting', 'Campout', 'Investiture', 'Outreach', 'Executive'].includes(details.type)) {
      throw Object.assign(new Error('Complete the event details.'), { code: 'invalid-event' });
    }
    return { title: details.title.trim(), branch: details.branch, date: details.date, time: details.time.trim(), location: details.location.trim(), type: details.type };
  };

  const addEvent = async (eventData: EventDetails, activate = true): Promise<ClubEvent> => {
    const details = eventDetailsForSave(eventData);
    const ref = doc(eventsCol);
    const newEvent: ClubEvent = { ...details, orgId: currentOrgId, id: ref.id, isActive: activate };
    const batch = writeBatch(db);
    batch.set(ref, newEvent);
    if (activate) {
      events.forEach(e => { batch.update(doc(db, 'events', e.id), { isActive: false }); });
    }
    await batch.commit();
    if (activate) setActiveEventId(newEvent.id);
    return newEvent;
  };

  const updateEvent = async (eventId: string, details: EventDetails): Promise<void> => {
    const updates = eventDetailsForSave(details);
    if (!events.some(event => event.id === eventId)) throw new Error('Event is no longer available.');
    await updateDoc(doc(db, 'events', eventId), updates);
  };

  const deleteEvent = async (eventId: string): Promise<void> => {
    const event = events.find(event => event.id === eventId);
    if (!event) throw new Error('Event is no longer available.');
    assertCanManageEvents();
    await updateDoc(doc(db, 'events', eventId), { deletedAt: new Date().toISOString(), isActive: false });
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

  const recordEvaluation = async (
    eventId: string,
    memberId: string,
    ticks: UniformTicks,
    notes?: string
  ): Promise<void> => {
    if (!canManageScoring) throw Object.assign(new Error('You do not have permission to score members.'), { code: 'permission-denied' });
    const event = events.find(e => e.id === eventId);
    const member = members.find(m => m.id === memberId && m.registrationStatus === 'Approved');
    if (!event || !member || (event.branch !== 'Both' && member.branch !== event.branch && member.branch !== 'Staff')) {
      throw new Error('Choose an approved member eligible for this event.');
    }
    const attendanceRecord = allAttendance.find(a => a.eventId === eventId && a.memberId === memberId);
    const calculated = calculateMemberScore(event.type, attendanceRecord?.status, ticks);

    const recordId = `${eventId}_${memberId}`;
    const record: MemberEvaluation = {
      id: recordId,
      orgId: currentOrgId,
      eventId,
      memberId,
      unitId: member?.unitId,
      ...calculated,
      ...ticks,
      notes: notes?.trim() ?? '',
      evaluatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'evaluations', recordId), record);
  };

  // Attendance points and event maximums follow the current roster and event type.
  // Saved uniform ticks and the unit captured at evaluation time remain unchanged.
  const currentEvaluation = (evaluation: MemberEvaluation): MemberEvaluation => {
    const event = allEvents.find(event => event.id === evaluation.eventId);
    if (!event) return evaluation;
    const attendance = allAttendance.find(record => record.eventId === evaluation.eventId && record.memberId === evaluation.memberId);
    try { return { ...evaluation, ...calculateMemberScore(event.type, attendance?.status, evaluation) }; }
    catch { return evaluation; } // Legacy records can still be opened and corrected in the scoring form.
  };

  const getMemberEvaluationForEvent = (eventId: string, memberId: string): MemberEvaluation | undefined => {
    const evaluation = allEvaluations.find(e => e.orgId === currentOrgId && e.eventId === eventId && e.memberId === memberId);
    return evaluation ? currentEvaluation(evaluation) : undefined;
  };

  const buildUnitLeaderboard = (
    evaluations: Array<{ unitId?: string; orgId: string; totalScore: number; maxScore: number }>
  ) => {
    const orgUnits = allUnits.filter(u => u.orgId === currentOrgId);
    return orgUnits
      .map(unit => {
        const unitEvaluations = evaluations.filter(e => e.unitId === unit.id && e.orgId === currentOrgId)
          .filter(e => e.maxScore > 0 && Number.isFinite(e.totalScore) && e.totalScore >= 0 && e.totalScore <= e.maxScore);
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

  const getUnitLeaderboard = () => buildUnitLeaderboard(allEvaluations.map(currentEvaluation));

  // Each evaluator submits their own full sheet — a unit scored by 3 judges at
  // one event gets 3 separate docs here, averaged together wherever displayed.
  const recordUnitDrillScore = async (
    eventId: string,
    unitId: string,
    evaluatorName: string,
    commandScores: DrillCommandScores,
    demeritUnitCaptain: number,
    demeritMembers: number,
    evaluationId?: string
  ): Promise<void> => {
    if (!canManageScoring) throw Object.assign(new Error('You do not have permission to score units.'), { code: 'permission-denied' });
    const event = events.find(e => e.id === eventId);
    const unit = allUnits.find(u => u.id === unitId && u.orgId === currentOrgId);
    if (!event || !unit) throw new Error('Choose a valid event and unit for this church.');
    if (!evaluatorName.trim()) throw new Error('Enter the evaluator\'s name.');
    const calculated = calculateDrillScore(commandScores, demeritUnitCaptain, demeritMembers);

    const ref = evaluationId ? doc(db, 'unitDrillScores', evaluationId) : doc(drillEvaluationsCol);
    const record: UnitDrillEvaluation = {
      id: ref.id,
      orgId: currentOrgId,
      eventId,
      unitId,
      evaluatorName: evaluatorName.trim(),
      ...commandScores,
      demeritUnitCaptain,
      demeritMembers,
      ...calculated,
      evaluatedAt: new Date().toISOString(),
    };
    await setDoc(ref, record);
  };

  const getUnitDrillEvaluationsForEvent = (eventId: string, unitId: string): UnitDrillEvaluation[] => {
    return allDrillEvaluations.filter(e => e.orgId === currentOrgId && e.eventId === eventId && e.unitId === unitId);
  };

  const getUnitDrillAverageForEvent = (eventId: string, unitId: string) => {
    const submissions = getUnitDrillEvaluationsForEvent(eventId, unitId);
    if (submissions.length === 0) return undefined;
    return {
      averageScore: submissions.reduce((sum, e) => sum + e.totalScore, 0) / submissions.length,
      maxScore: submissions[0].maxScore,
      evaluatorCount: submissions.length,
    };
  };

  // Collapse multiple evaluators at one event into a single averaged entry per
  // (unit, event) first, so a heavily-judged event doesn't out-weigh a unit
  // that was simply scored once at several different events.
  const averageByEvent = (
    evaluations: Array<{ unitId?: string; eventId: string; orgId: string; totalScore: number; maxScore: number }>
  ) => {
    const groups = new Map<string, { unitId?: string; orgId: string; totalScore: number; maxScore: number }[]>();
    evaluations.forEach(e => {
      const key = `${e.unitId}_${e.eventId}`;
      groups.set(key, [...(groups.get(key) ?? []), e]);
    });
    return Array.from(groups.values()).map(group => ({
      unitId: group[0].unitId,
      orgId: group[0].orgId,
      maxScore: group[0].maxScore,
      totalScore: group.reduce((sum, e) => sum + e.totalScore, 0) / group.length,
    }));
  };

  const getUnitDrillLeaderboard = () => buildUnitLeaderboard(averageByEvent(allDrillEvaluations));

  // Shared by getScopeReport for both the rolled-up totals and the per-unit breakdown rows.
  const computeScopeStats = (memberIds: Set<string>, unitIds: Set<string>, eventIds: string[]): ScopeStatBlock => {
    const scopedMembers = allMembers.filter(m => memberIds.has(m.id));

    let present = 0, late = 0, excused = 0, absent = 0, eligibleAttendanceCount = 0;
    eventIds.forEach(eventId => {
      const event = allEvents.find(e => e.id === eventId);
      if (!event) return;
      let eligible = scopedMembers.filter(m => m.registrationStatus === 'Approved');
      if (event.branch !== 'Both') {
        eligible = eligible.filter(m => m.branch === event.branch || m.branch === 'Staff');
      }
      eligible.forEach(m => {
        eligibleAttendanceCount++;
        const rec = allAttendance.find(a => a.eventId === eventId && a.memberId === m.id);
        if (!rec || rec.status === 'Absent') absent++;
        else if (rec.status === 'Present') present++;
        else if (rec.status === 'Late') late++;
        else if (rec.status === 'Excused') excused++;
      });
    });
    const attendanceRate = eligibleAttendanceCount > 0 ? Math.round(((present + late) / eligibleAttendanceCount) * 100) : 0;

    const round1 = (n: number) => Math.round(n * 10) / 10;

    const memberEvaluations = allEvaluations
      .filter(e => memberIds.has(e.memberId) && eventIds.includes(e.eventId))
      .map(currentEvaluation)
      .filter(e => e.maxScore > 0);
    const memberEvaluationAverageScore = memberEvaluations.length > 0
      ? round1(memberEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / memberEvaluations.length)
      : 0;
    const memberEvaluationAverageMaxScore = memberEvaluations.length > 0
      ? round1(memberEvaluations.reduce((sum, e) => sum + e.maxScore, 0) / memberEvaluations.length)
      : 0;
    const memberEvaluationAveragePercentage = memberEvaluations.length > 0
      ? Math.round((memberEvaluations.reduce((sum, e) => sum + e.totalScore / e.maxScore, 0) / memberEvaluations.length) * 100)
      : 0;

    const drillEvaluations = averageByEvent(
      allDrillEvaluations.filter(e => e.unitId && unitIds.has(e.unitId) && eventIds.includes(e.eventId))
    );
    const drillAverageScore = drillEvaluations.length > 0
      ? round1(drillEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / drillEvaluations.length)
      : 0;
    const drillAverageMaxScore = drillEvaluations.length > 0
      ? round1(drillEvaluations.reduce((sum, e) => sum + e.maxScore, 0) / drillEvaluations.length)
      : 0;
    const drillAveragePercentage = drillEvaluations.length > 0
      ? Math.round((drillEvaluations.reduce((sum, e) => sum + e.totalScore / e.maxScore, 0) / drillEvaluations.length) * 100)
      : 0;

    return {
      memberCount: scopedMembers.length,
      approvedCount: scopedMembers.filter(m => m.registrationStatus === 'Approved').length,
      pendingCount: scopedMembers.filter(m => m.registrationStatus === 'Pending Review').length,
      needsClarificationCount: scopedMembers.filter(m => m.registrationStatus === 'Needs Clarification').length,
      archivedCount: scopedMembers.filter(m => m.registrationStatus === 'Archived').length,
      duesPaidCount: scopedMembers.filter(m => m.duesPaid).length,
      eligibleAttendanceCount,
      presentCount: present,
      lateCount: late,
      excusedCount: excused,
      absentCount: absent,
      attendanceRate,
      memberEvaluationCount: memberEvaluations.length,
      memberEvaluationAverageScore,
      memberEvaluationAverageMaxScore,
      memberEvaluationAveragePercentage,
      drillEvaluationCount: drillEvaluations.length,
      drillAverageScore,
      drillAverageMaxScore,
      drillAveragePercentage,
    };
  };

  const getScopeReport = (
    scope: { clubId?: string; divisionId?: string; unitId?: string },
    dateFrom?: string,
    dateTo?: string
  ): ScopeReport | undefined => {
    if (!scope.clubId && !scope.divisionId && !scope.unitId) return undefined;
    if (scope.clubId && !clubs.some(club => club.id === scope.clubId)) return undefined;
    if (scope.divisionId && !allDivisions.some(division => division.id === scope.divisionId && division.orgId === currentOrgId && (!scope.clubId || division.clubId === scope.clubId))) return undefined;
    const scopedUnits = allUnits.filter(unit => unit.orgId === currentOrgId
      && (!scope.clubId || unit.clubId === scope.clubId)
      && (!scope.divisionId || unit.divisionId === scope.divisionId)
      && (!scope.unitId || unit.id === scope.unitId));
    if (scope.unitId && scopedUnits.length === 0) return undefined;

    const unitIdSet = new Set(scopedUnits.map(u => u.id));
    const scopedMemberIds = new Set(members.filter(member =>
      scope.unitId ? member.unitId === scope.unitId
      : scope.divisionId ? member.divisionId === scope.divisionId || unitIdSet.has(member.unitId ?? '')
      : member.clubId === scope.clubId || unitIdSet.has(member.unitId ?? '')
    ).map(member => member.id));
    const eventIds = allEvents
      .filter(e => e.orgId === currentOrgId)
      .filter(e => (!dateFrom || e.date >= dateFrom) && (!dateTo || e.date <= dateTo))
      .map(e => e.id);

    const overall = computeScopeStats(scopedMemberIds, unitIdSet, eventIds);
    const unitBreakdown = scopedUnits.map(unit => {
      const unitMemberIds = new Set(allMembers.filter(m => m.unitId === unit.id).map(m => m.id));
      return {
        unitId: unit.id,
        unitName: unit.name,
        branch: unit.branch,
        ...computeScopeStats(unitMemberIds, new Set([unit.id]), eventIds),
      };
    });

    return { ...overall, unitBreakdown };
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
        memberHonors: allMemberHonors,
        getMemberHonors,
        addMemberHonor,
        updateMemberHonor,
        deleteMemberHonor,
        events,
        activeEventId,
        activeEvent,
        attendance: allAttendance,
        recordAttendance,
        markBatchAttendance,
        addEvent,
        updateEvent,
        deleteEvent,
        setActiveEventId,
        evaluations: allEvaluations,
        evaluationsLoading,
        evaluationsError,
        canManageScoring,
        recordEvaluation,
        getMemberEvaluationForEvent,
        getUnitLeaderboard,
        drillEvaluations: allDrillEvaluations,
        drillEvaluationsLoading,
        drillEvaluationsError,
        recordUnitDrillScore,
        getUnitDrillEvaluationsForEvent,
        getUnitDrillAverageForEvent,
        getUnitDrillLeaderboard,
        getScopeReport,
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
