export type ClubBranch = 'Adventurers' | 'Pathfinders' | 'Staff';

export type AdventurerClass =
  | 'Little Lamb'
  | 'Eager Beaver'
  | 'Busy Bee'
  | 'Sunbeam'
  | 'Builder'
  | 'Helping Hand';

export const ADVENTURER_CLASSES: AdventurerClass[] = [
  'Little Lamb', 'Eager Beaver', 'Busy Bee', 'Sunbeam', 'Builder', 'Helping Hand',
];

export type PathfinderClass =
  | 'Friend'
  | 'Companion'
  | 'Explorer'
  | 'Ranger'
  | 'Voyager'
  | 'Guide'
  | 'TLT / Master Guide';

export const PATHFINDER_CLASSES: PathfinderClass[] = [
  'Friend', 'Companion', 'Explorer', 'Ranger', 'Voyager', 'Guide', 'TLT / Master Guide',
];

// The 8 official Pathfinder Honor categories (General Conference Youth Ministries).
export const HONOR_CATEGORIES = [
  'Arts, Crafts and Hobbies',
  'Health and Science',
  'Household Arts',
  'Nature',
  'Outdoor Industries',
  'Recreation',
  'Spiritual Growth, Outreach and Heritage',
  'Vocational',
] as const;
export type HonorCategory = typeof HONOR_CATEGORIES[number];

export interface MemberHonor {
  id: string;
  orgId: string;
  memberId: string;
  category: HonorCategory;
  honorName: string; // e.g. "Camping Skills I" — no built-in master catalog, recorded by name
  status: 'In Progress' | 'Completed';
  dateEarned?: string;
  instructorName?: string;
  notes?: string;
}

export type RegistrationStatus = 
  | 'Pending Review' 
  | 'Approved' 
  | 'Needs Clarification' 
  | 'Archived';

export type AttendanceStatus = 'Present' | 'Late' | 'Excused' | 'Absent';

export type UserRole =
  | 'Super Admin'
  | 'Mission Youth Director'
  | 'District Coordinator'
  | 'Church Pastor' 
  | 'Club Director' 
  | 'Club Secretary' 
  | 'Unit Counselor' 
  | 'Parent / Member';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId: string;
  phone?: string;
  investedMasterGuide?: boolean;
}

export interface DistrictItem {
  id: string;
  name: string; // e.g. "District 4 (Cascade Metro)"
  districtNumber?: string;
  regionOrZone: string; // e.g. "Central Cascade Region"
  missionOrConference: string; // e.g. "Cascade Conference / Mission"
  unionName: string; // e.g. "North Pacific Union Conference"
  coordinatorName: string;
  coordinatorEmail?: string;
  coordinatorPhone?: string;
  description?: string;
}

export type ClubType = 'Pathfinder' | 'Adventurer' | 'Master Guide' | 'Ambassador' | 'Eager Beaver';

export interface ClubEntity {
  id: string;
  orgId: string; // Church it belongs to
  name: string; // e.g. "Grace Wolverines Pathfinder Club"
  clubType: ClubType;
  directorName: string;
  directorEmail?: string;
  directorPhone?: string;
  charterNumber: string;
  meetingSchedule: string;
  annualDues: number;
  motto?: string;
  themeColor?: string;
  description?: string;
  establishedYear?: number;
}

export type ClubDetails = Pick<ClubEntity, 'name' | 'directorName' | 'directorEmail' | 'directorPhone' | 'charterNumber' | 'meetingSchedule' | 'annualDues' | 'motto'>;

export interface ChurchOrganization {
  id: string;
  churchName: string;
  clubName: string; // Primary/legacy display
  clubs?: ClubEntity[]; // Multiple clubs registered under this church
  districtId: string;
  districtName: string;
  regionName?: string;
  missionName: string; // Conference or Mission level
  unionName: string; // Union Conference
  charterNumber: string;
  meetingSchedule: string;
  location: string;
  annualDuesAmount: number;
  directorName: string;
  pastorName: string;
  requireMedicalRelease: boolean;
  requireBaptismVerification: boolean;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters?: number; // event proximity fence, e.g. 800m
  geofenceDistrictRadiusMiles?: number; // church catchment area, e.g. 20 miles
  contactEmail: string;
}

export interface UserGeoSettings {
  enabled: boolean;
  autoDetectLocation: boolean;
  maxDistanceMiles: number; // 0 = unlimited
  enforceAttendanceGeofence: boolean;
  simulatedLocation?: {
    name: string;
    latitude: number;
    longitude: number;
  } | null;
}

export interface GeoLocationState {
  userLat: number | null;
  userLng: number | null;
  accuracy: number | null;
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'simulated';
  errorMsg?: string;
  nearestChurchId?: string;
  distanceToActiveChurchMiles?: number;
  isWithinActiveChurchGeofence?: boolean;
}

export interface Division {
  id: string;
  orgId: string;
  clubId: string; // Club this division belongs to
  divisionNumber?: string; // e.g. "1", "A" — official roster label, separate from the descriptive name
  name: string; // e.g. "Teen Division", "Junior Division"
  ageRange?: string;
  leaderName?: string;
  leaderPhone?: string;
  description?: string;
}

export interface ClubUnit {
  id: string;
  orgId: string;
  clubId?: string; // Linked specific club in church (e.g. Pathfinder vs Adventurer)
  divisionId?: string; // Optional grouping within the club (not every club uses divisions)
  unitNumber?: string; // e.g. "1", "2A" — official roster label, separate from the descriptive name
  name: string;
  branch: ClubBranch;
  counselorName: string;
  counselorPhone?: string;
  genderDivision?: 'Boys' | 'Girls' | 'Co-ed';
  ageRange?: string;
  motto?: string;
}

export type UnitDetails = Pick<ClubUnit, 'name' | 'counselorName' | 'counselorPhone' | 'genderDivision' | 'ageRange' | 'motto' | 'divisionId'>;

export interface Member {
  id: string;
  orgId: string;
  clubId?: string; // Specific club in church
  clubName?: string;
  divisionId?: string; // Division within that club, if the unit belongs to one
  divisionName?: string;
  registrationNumber: string;
  branch: ClubBranch;
  className: AdventurerClass | PathfinderClass | string;
  unitId?: string;
  unitName?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  homeAddress: string;
  emergencyContact: string;
  emergencyPhone: string;
  emergencyRelation: string;
  medicalConditions?: string;
  allergies?: string;
  dietaryRestrictions?: string;
  swimmingAbility?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Non-Swimmer';
  uniformSize: 'Youth S' | 'Youth M' | 'Youth L' | 'Adult S' | 'Adult M' | 'Adult L' | 'Adult XL';
  registrationStatus: RegistrationStatus;
  statusNotes?: string;
  duesPaid: boolean;
  registrationDate: string;
  parentConsentSigned: boolean;
  photoReleaseConsent: boolean;
}

export const MEMBER_DETAIL_FIELDS = [
  'firstName', 'lastName', 'dateOfBirth', 'gender', 'className',
  'parentName', 'parentPhone', 'parentEmail', 'homeAddress',
  'emergencyContact', 'emergencyPhone', 'emergencyRelation',
  'medicalConditions', 'allergies', 'dietaryRestrictions', 'swimmingAbility', 'uniformSize',
] as const;

export type MemberDetails = Pick<Member, typeof MEMBER_DETAIL_FIELDS[number]>;

export interface ClubEvent {
  id: string;
  orgId: string;
  title: string;
  branch: 'Both' | 'Adventurers' | 'Pathfinders';
  date: string;
  time: string;
  location: string;
  type: 'Regular Meeting' | 'Campout' | 'Investiture' | 'Outreach' | 'Executive';
  isActive: boolean;
  deletedAt?: string; // Removed from the calendar; attendance and scores remain available in backups.
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number; // event checkin boundary, e.g. 500m
  enforceGeofence?: boolean;
}

export type EventDetails = Pick<ClubEvent, 'title' | 'branch' | 'date' | 'time' | 'location' | 'type'>;

export interface AttendanceRecord {
  id: string;
  orgId: string;
  eventId: string;
  memberId: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkInMethod: 'Manual' | 'QR Code' | 'Fast Roster';
  notes?: string;
}

export interface MemberEvaluation {
  id: string; // `${eventId}_${memberId}`
  orgId: string;
  eventId: string;
  memberId: string;
  unitId?: string; // denormalized at scoring time, so the leaderboard holds up even if the member later changes units
  attendanceScore: number; // 0-10, auto-derived from the member's attendance record for this event (read-only, not a tick)
  topsPass: boolean;
  pantsPass: boolean;
  beltPass: boolean;
  socksPass: boolean;
  shoesPass: boolean;
  neckerchiefPass: boolean;
  sliderPass: boolean;
  capCordSashPatchesPass: boolean;
  totalScore: number;
  maxScore: number; // 70 normally, 80 for Investiture events
  notes?: string;
  evaluatedAt: string;
}

export interface UnitDrillEvaluation {
  id: string; // `${eventId}_${unitId}`
  orgId: string;
  eventId: string;
  unitId: string;
  evaluatorName: string;
  fallIn: number; // 0-10 each, the evaluator's judgment call
  coverDressRightDress: number;
  recoverReadyFront: number;
  paradeRest: number;
  countOff: number;
  attention: number;
  leftRightFace: number;
  aboutFace: number;
  markTimeMarch: number;
  forwardMarch: number;
  readyHalt: number;
  presentArms: number;
  orderArms: number;
  dismiss: number;
  demeritUnitCaptain: number; // raw points deducted, no upper limit
  demeritMembers: number;
  commandSubtotal: number;
  totalScore: number; // commandSubtotal minus both demerits, floored at 0
  maxScore: number; // 140 (14 commands x 10)
  evaluatedAt: string;
}

export interface ScopeStatBlock {
  memberCount: number;
  approvedCount: number;
  pendingCount: number;
  needsClarificationCount: number;
  archivedCount: number;
  duesPaidCount: number;
  eligibleAttendanceCount: number;
  presentCount: number;
  lateCount: number;
  excusedCount: number;
  absentCount: number;
  attendanceRate: number; // 0-100
  memberEvaluationCount: number;
  memberEvaluationAverageScore: number; // raw points earned, averaged
  memberEvaluationAverageMaxScore: number; // raw full mark, averaged (events in range may mix 70/80 full marks)
  memberEvaluationAveragePercentage: number; // 0-100
  drillEvaluationCount: number;
  drillAverageScore: number; // raw points earned, averaged
  drillAverageMaxScore: number; // raw full mark, averaged (always 140 today)
  drillAveragePercentage: number; // 0-100
}

export interface UnitBreakdownRow extends ScopeStatBlock {
  unitId: string;
  unitName: string;
  branch: ClubBranch;
}

export interface ScopeReport extends ScopeStatBlock {
  unitBreakdown: UnitBreakdownRow[];
}
