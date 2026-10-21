import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Member, 
  ClubEvent, 
  ClubUnit, 
  AttendanceRecord, 
  RegistrationStatus, 
  AttendanceStatus,
  ChurchOrganization,
  AuthUser,
  UserRole,
  UserGeoSettings,
  GeoLocationState
} from '../types/club';
import { 
  INITIAL_MEMBERS, 
  INITIAL_EVENTS, 
  INITIAL_UNITS, 
  INITIAL_ATTENDANCE, 
  INITIAL_ORGANIZATIONS, 
  INITIAL_STAFF_USERS 
} from '../data/seedData';
import { 
  calculateDistanceMiles, 
  calculateDistanceMeters, 
  findNearestChurch, 
  filterChurchesByGeofence 
} from '../utils/geoUtils';

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

  // Leadership & Auth
  currentUser: AuthUser | null;
  staffUsers: AuthUser[];
  loginUser: (user: AuthUser) => void;
  logoutUser: () => void;
  registerLeader: (leaderData: Omit<AuthUser, 'id'>) => AuthUser;

  // Members & Roster
  members: Member[]; // all members in current church
  allOrganizationMembers: Member[]; // all members across conference/district
  units: ClubUnit[]; // units in current church
  allUnits: ClubUnit[];
  addUnit: (unitData: Omit<ClubUnit, 'id'>) => ClubUnit;
  updateUnit: (unitId: string, updates: Partial<ClubUnit>) => void;
  deleteUnit: (unitId: string) => void;
  registerMember: (data: Partial<Member> & { firstName: string; lastName: string; branch: Member['branch'] }) => Member;
  updateMemberStatus: (memberId: string, status: RegistrationStatus, notes?: string) => void;
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

  // Utilities & Rollups
  resetToDefaults: () => void;
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

const STORAGE_KEY = 'pathfinder_club_multi_org_v2';

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<ChurchOrganization[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_organizations`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ORGANIZATIONS;
  });

  const [currentOrgId, setCurrentOrgId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_org_id`);
    return saved || 'org-grace';
  });

  const [staffUsers, setStaffUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_staff_users`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_STAFF_USERS;
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Default logged in as Club Director Isaac Chen
    return INITIAL_STAFF_USERS[0];
  });

  const [allMembers, setAllMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_members`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_MEMBERS;
  });

  const [allEvents, setAllEvents] = useState<ClubEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_events`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_EVENTS;
  });

  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ATTENDANCE;
  });

  const [allUnits, setAllUnits] = useState<ClubUnit[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_units`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_UNITS;
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_units`, JSON.stringify(allUnits));
  }, [allUnits]);

  // Persistence
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_organizations`, JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_current_org_id`, currentOrgId);
  }, [currentOrgId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_staff_users`, JSON.stringify(staffUsers));
  }, [staffUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_current_user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_members`, JSON.stringify(allMembers));
  }, [allMembers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_events`, JSON.stringify(allEvents));
  }, [allEvents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(allAttendance));
  }, [allAttendance]);

  // Geofencing State
  const [geoSettings, setGeoSettings] = useState<UserGeoSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_geo_settings`);
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
    localStorage.setItem(`${STORAGE_KEY}_geo_settings`, JSON.stringify(geoSettings));
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

  // Distance to current church
  const distanceToCurrentChurch = (effectiveLat !== null && effectiveLng !== null)
    ? calculateDistanceMiles(effectiveLat, effectiveLng, currentOrg.latitude, currentOrg.longitude)
    : null;

  // Check if within current church event geofence radius
  const isWithinCurrentChurchGeofence = (effectiveLat !== null && effectiveLng !== null)
    ? calculateDistanceMeters(effectiveLat, effectiveLng, currentOrg.latitude, currentOrg.longitude) <= (currentOrg.geofenceRadiusMeters || 800)
    : true;

  // Filtered churches based on geofence settings
  const geofencedChurches = filterChurchesByGeofence(
    effectiveLat,
    effectiveLng,
    organizations,
    geoSettings.enabled ? geoSettings.maxDistanceMiles : 0
  );

  // Scoped members, events, units for current church
  const members = allMembers.filter(m => m.orgId === currentOrgId);
  const events = allEvents.filter(e => e.orgId === currentOrgId);
  const units = allUnits.filter(u => u.orgId === currentOrgId);

  const [activeEventId, setActiveEventId] = useState<string>(() => {
    const currentChurchEvents = INITIAL_EVENTS.filter(e => e.orgId === currentOrgId);
    const active = currentChurchEvents.find(e => e.isActive);
    return active ? active.id : (currentChurchEvents[0]?.id || 'evt-001');
  });

  // Whenever current church changes, ensure active event points to an event in that church
  useEffect(() => {
    const churchEvents = allEvents.filter(e => e.orgId === currentOrgId);
    if (churchEvents.length > 0 && !churchEvents.some(e => e.id === activeEventId)) {
      setActiveEventId(churchEvents[0].id);
    }
  }, [currentOrgId, allEvents]);

  const activeEvent = events.find(e => e.id === activeEventId);

  const loginUser = (user: AuthUser) => {
    setCurrentUser(user);
    // If user belongs to a specific church, switch to it
    if (user.orgId && user.role !== 'Mission Youth Director' && user.role !== 'District Coordinator') {
      setCurrentOrgId(user.orgId);
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const registerLeader = (leaderData: Omit<AuthUser, 'id'>): AuthUser => {
    const newLeader: AuthUser = {
      ...leaderData,
      id: `usr-${Date.now()}`,
    };
    setStaffUsers(prev => [newLeader, ...prev]);
    setCurrentUser(newLeader);
    return newLeader;
  };

  const updateOrganization = (orgId: string, updates: Partial<ChurchOrganization>) => {
    setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, ...updates } : o));
  };

  const addOrganization = (newOrg: Omit<ChurchOrganization, 'id'>): ChurchOrganization => {
    const created: ChurchOrganization = {
      ...newOrg,
      id: `org-${Date.now()}`,
    };
    setOrganizations(prev => [...prev, created]);
    setCurrentOrgId(created.id);
    return created;
  };

  const registerMember = (data: Partial<Member> & { firstName: string; lastName: string; branch: Member['branch'] }): Member => {
    const branchPrefix = data.branch === 'Pathfinders' ? 'PF' : (data.branch === 'Adventurers' ? 'ADV' : 'STF');
    const churchCode = currentOrg.churchName.split(' ')[0].substring(0, 3).toUpperCase();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const regNumber = `${branchPrefix}-${churchCode}-${randomSuffix}`;
    const newId = `mem-${Date.now()}`;

    const newMember: Member = {
      id: newId,
      orgId: currentOrgId,
      registrationNumber: regNumber,
      branch: data.branch,
      className: data.className || (data.branch === 'Pathfinders' ? 'Friend' : 'Busy Bee'),
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

    setAllMembers(prev => [newMember, ...prev]);
    return newMember;
  };

  const updateMemberStatus = (memberId: string, status: RegistrationStatus, notes?: string) => {
    setAllMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          registrationStatus: status,
          statusNotes: notes !== undefined ? notes : m.statusNotes,
        };
      }
      return m;
    }));
  };

  const assignUnit = (memberId: string, unitId: string) => {
    const unit = allUnits.find(u => u.id === unitId);
    setAllMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          unitId: unit ? unit.id : undefined,
          unitName: unit ? unit.name : undefined,
        };
      }
      return m;
    }));
  };

  const addUnit = (unitData: Omit<ClubUnit, 'id'>): ClubUnit => {
    const newUnit: ClubUnit = {
      ...unitData,
      id: `unit-${Date.now()}`,
    };
    setAllUnits(prev => [...prev, newUnit]);
    return newUnit;
  };

  const updateUnit = (unitId: string, updates: Partial<ClubUnit>) => {
    setAllUnits(prev => prev.map(u => u.id === unitId ? { ...u, ...updates } : u));
    // Also update any members that have this unitName
    if (updates.name) {
      setAllMembers(prev => prev.map(m => m.unitId === unitId ? { ...m, unitName: updates.name } : m));
    }
  };

  const deleteUnit = (unitId: string) => {
    setAllUnits(prev => prev.filter(u => u.id !== unitId));
    // Clear unit assignment on members
    setAllMembers(prev => prev.map(m => m.unitId === unitId ? { ...m, unitId: undefined, unitName: undefined } : m));
  };

  const toggleDuesPaid = (memberId: string) => {
    setAllMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return { ...m, duesPaid: !m.duesPaid };
      }
      return m;
    }));
  };

  const deleteMember = (memberId: string) => {
    setAllMembers(prev => prev.filter(m => m.id !== memberId));
    setAllAttendance(prev => prev.filter(a => a.memberId !== memberId));
  };

  const recordAttendance = (
    eventId: string, 
    memberId: string, 
    status: AttendanceStatus, 
    checkInMethod: 'Manual' | 'QR Code' | 'Fast Roster' = 'Manual',
    notes?: string
  ) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAllAttendance(prev => {
      const existingIndex = prev.findIndex(a => a.eventId === eventId && a.memberId === memberId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status,
          checkInTime: (status === 'Present' || status === 'Late') ? (updated[existingIndex].checkInTime || nowTime) : undefined,
          checkInMethod,
          notes: notes !== undefined ? notes : updated[existingIndex].notes,
        };
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          orgId: currentOrgId,
          eventId,
          memberId,
          status,
          checkInTime: (status === 'Present' || status === 'Late') ? nowTime : undefined,
          checkInMethod,
          notes,
        };
        return [...prev, newRecord];
      }
    });
  };

  const markBatchAttendance = (eventId: string, memberIds: string[], status: AttendanceStatus) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAllAttendance(prev => {
      const map = new Map(prev.map(a => [`${a.eventId}_${a.memberId}`, a]));
      memberIds.forEach(mId => {
        const key = `${eventId}_${mId}`;
        const existing = map.get(key);
        if (existing) {
          map.set(key, {
            ...existing,
            status,
            checkInTime: (status === 'Present' || status === 'Late') ? (existing.checkInTime || nowTime) : undefined,
            checkInMethod: 'Fast Roster',
          });
        } else {
          map.set(key, {
            id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            orgId: currentOrgId,
            eventId,
            memberId: mId,
            status,
            checkInTime: (status === 'Present' || status === 'Late') ? nowTime : undefined,
            checkInMethod: 'Fast Roster',
          });
        }
      });
      return Array.from(map.values());
    });
  };

  const addEvent = (eventData: Omit<ClubEvent, 'id' | 'isActive' | 'orgId'>): ClubEvent => {
    const newEvent: ClubEvent = {
      ...eventData,
      orgId: currentOrgId,
      id: `evt-${Date.now()}`,
      isActive: true,
    };
    setAllEvents(prev => [newEvent, ...prev.map(e => e.orgId === currentOrgId ? { ...e, isActive: false } : e)]);
    setActiveEventId(newEvent.id);
    return newEvent;
  };

  const resetToDefaults = () => {
    setOrganizations(INITIAL_ORGANIZATIONS);
    setCurrentOrgId('org-grace');
    setStaffUsers(INITIAL_STAFF_USERS);
    setCurrentUser(INITIAL_STAFF_USERS[0]);
    setAllMembers(INITIAL_MEMBERS);
    setAllEvents(INITIAL_EVENTS);
    setAllAttendance(INITIAL_ATTENDANCE);
    setActiveEventId('evt-001');
    localStorage.clear();
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
      if (Array.isArray(data.organizations)) setOrganizations(data.organizations);
      if (Array.isArray(data.staffUsers)) setStaffUsers(data.staffUsers);
      if (Array.isArray(data.members)) setAllMembers(data.members);
      if (Array.isArray(data.events)) setAllEvents(data.events);
      if (Array.isArray(data.attendance)) setAllAttendance(data.attendance);
      return true;
    } catch (e) {
      console.error('Failed to import database:', e);
      return false;
    }
  };

  const getMemberAttendanceForEvent = (eventId: string, memberId: string): AttendanceRecord | undefined => {
    return allAttendance.find(a => a.eventId === eventId && a.memberId === memberId);
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
        loginUser,
        logoutUser,
        registerLeader,
        members,
        allOrganizationMembers: allMembers,
        units,
        allUnits,
        addUnit,
        updateUnit,
        deleteUnit,
        registerMember,
        updateMemberStatus,
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
        resetToDefaults,
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
