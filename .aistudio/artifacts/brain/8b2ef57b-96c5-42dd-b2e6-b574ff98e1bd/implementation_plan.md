# Pathfinder & Adventurer Club Membership & Attendance Portal

A comprehensive digital portal for Seventh-day Adventist church Pathfinder and Adventurer clubs, enabling parents and youth to register online, church directors and church board members to review and approve applications, and club leaders to manage live event attendance with instant roster check-ins and QR code scanning.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your answers during Phase 1, the portal will be configured with the following confirmed capabilities:
> - **Club Scope**: Combined Adventurer Club (Little Lamb, Eager Beaver, Busy Bee, Sunbeam, Builder, Helping Hand) and Pathfinder Club (Friend, Companion, Explorer, Ranger, Voyager, Guide, TLT/Staff).
> - **Registration Workflow**: Public registration flow with parent/guardian consent, medical emergency details, uniform sizing, and church leadership review queue (Pending, Approved, Needs Clarification, Archived).
> - **Real-Time Attendance**: Live event roster with fast search, unit filtering, real-time toggle (Present, Late, Excused, Absent), and camera-based / pass-based QR code check-in scanner.

- **Confirmed Decision 1**: Dual Adventurer & Pathfinder club support with specialized age divisions, classes, and badge progressions.
- **Confirmed Decision 2**: Church admin approval pipeline where leadership can inspect submitted applications, assign units/counselors, set fee status, and update registration status.
- **Confirmed Decision 3**: Real-time event attendance tracking featuring a live search roster, instant check-in buttons, and an interactive QR code scanner plus printable/viewable digital Pathfinder Membership ID cards.
- **Data Persistence**: Robust client-side reactive store with browser `localStorage` persistence, pre-seeded with realistic church club members and events, plus JSON export/backup and restore capabilities.

---

## 1. Overview & Core Concept

- **What It Does**:
  - **Public Registration Form**: Allows parents to register their children for either the Adventurer Club (ages 4–9) or Pathfinder Club (ages 10–15) or Staff/Counselors. Captures youth info, baptismal status, medical/allergy info, emergency contacts, uniform sizing, and digital parental consent.
  - **Church Leadership Portal**: A secure dashboard for Club Directors, Pastors, and Club Secretaries to inspect pending registrations, approve or request revisions, assign members to Units (e.g., Eagles, Trailblazers, Sunbeams), and track membership dues.
  - **Live Event Attendance Manager**: An active event workspace for club meetings, campouts, investiture rehearsals, and community service. Leaders mark attendance in real time with quick-toggle statuses (Present, Late, Excused, Absent), track live attendance ratios, and scan digital QR codes on member ID passes.
  - **Digital Member Pass & QR Card**: Each registered and approved member receives a digital Pathfinder/Adventurer ID card with an official emblem motif, member class badge, emergency contact, and a unique check-in QR code.
- **Target Audience / Persona**:
  - *Parents & Guardians*: Easy, mobile-friendly registration without paper forms.
  - *Club Directors & Church Leadership*: High-altitude oversight of enrollment status, health alerts, and club demographics.
  - *Unit Counselors & Club Scribes*: Rapid, clutter-free attendance recording during busy Sabbath afternoon or Sunday morning meetings.
- **Key Value**: Replaces scattered paper forms and clipboards with an organized, real-time digital system that ensures youth safety, transparent registration tracking, and fast attendance reporting for church business meetings and conference reports.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Club Registration Flow**:
   - Applicant selects club branch (Adventurer Club or Pathfinder Club) and class level.
   - 4-step progressive form: Basic Information $\rightarrow$ Guardian & Emergency Contacts $\rightarrow$ Medical & Dietary Information $\rightarrow$ Uniform & Consent.
   - Instant registration confirmation with a tracking code to check status anytime.

2. **Church Leadership Review & Approval Flow**:
   - Directors switch to the "Church Admin" view with a dedicated review inbox.
   - Filter applicants by status (`Pending Review`, `Approved`, `Needs Info`, `Rejected`) or club branch.
   - Review panel displays applicant details, medical flags, and consent timestamps.
   - One-click actions: `Approve Membership`, `Request Clarification`, `Assign Unit`, `Update Payment Status`.

3. **Live Event Attendance & Check-In Flow**:
   - Leaders open an active event (e.g., "Regular Club Meeting - Drill & Honors", "Fall Camporee").
   - Real-time attendance meter displays total checked in, attendance rate percentage, and late arrivals.
   - Dual check-in modes:
     - **Quick Roster**: Search by name or filter by unit; click `Present`, `Late`, or `Excused` with instant visual confirmation.
     - **QR Scanner**: Point device camera or input check-in code; automatically validates membership, marks attendance timestamp, and displays member badge and photo avatar.

4. **Member Directory & Digital Pass**:
   - Directory with member profiles, emergency contact lookup, class progress, and unit rosters.
   - Modal to view, print, or download the Pathfinder Digital ID Pass with scannable QR code.

### Visual Identity & Theme

- **Aesthetic Direction**: Disciplined, welcoming, and purposeful civic/scouting aesthetic inspired by Seventh-day Adventist Pathfinder traditions (deep navy, forest green, warm gold accents) combined with modern clean SaaS dashboard clarity.
- **Color Palette**:
  - Neutral Canvas: Crisp white (`#FFFFFF`) / Slate 50 (`#F8FAFC`) with dark slate text (`#0F172A`).
  - Structural Surfaces: Pure white cards with clean hairline borders (`border-slate-200`) and quiet hover elevations.
  - Club Primaries:
    - Pathfinder Navy: `#1E3A8A` (Tailwind `blue-900`)
    - Pathfinder Gold / Emblem Yellow: `#D97706` / `#B45309` (Tailwind `amber-600`)
    - Adventurer Forest / Emerald Accent: `#047857` (Tailwind `emerald-700`)
  - Semantic Status:
    - Approved / Present: Emerald (`#059669`)
    - Pending / Late: Amber (`#D97706`)
    - Needs Clarification / Excused: Blue (`#2563EB`)
    - Inactive / Absent: Rose / Slate (`#E11D48` / `#64748B`)
- **Typography & Hierarchy**:
  - Display / Headings: `Plus Jakarta Sans` for clean, confident, modern authority.
  - Body Text: `Plus Jakarta Sans` / `DM Sans` for legibility at small sizes.
  - Numeric & Time Data: Tabular monospace figures (`font-mono tabular-nums`) for timestamps, attendance counters, and phone numbers.
- **Zero-Pill Discipline**: Metadata (age, club branch, class, submission date) rendered as quiet unboxed text separated by typographic middots (`·`). Interactive segmented controls used strictly for functional status filters and view switchers.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unified Portal with Public and Leadership Views**:
  - *Chosen Approach*: Single cohesive web app with a role/view switcher (`Public Registration`, `Church Admin Review`, `Live Attendance Tracker`, `Member Directory & ID Passes`).
  - *Why*: Allows instant testing and live demonstration for church directors and parents alike without requiring complex multi-tenant setup or friction during trial.
  - *Alternatives Considered*: Hard separation requiring email password login on every view. Passed over to ensure immediate preview and testability while still supporting simulated leader authentication.

- **Decision 2: Dual QR Check-In (Scanner + Member Card Generator)**:
  - *Chosen Approach*: Built-in QR generator for every registered member and an interactive simulated / camera QR code reader that immediately matches member IDs and logs attendance.
  - *Why*: Real-time church check-ins need to be rapid when 40–80 pathfinders arrive simultaneously on Sabbath afternoon or Sunday mornings.
  - *Alternatives Considered*: Manual roster only. Passed over because the user explicitly requested live QR scanning.

- **Decision 3: Realistic Adventurer & Pathfinder Class Hierarchy**:
  - *Chosen Approach*: Support official classes:
    - *Adventurers*: Little Lamb (age 4), Eager Beaver (age 5), Busy Bee (age 6), Sunbeam (age 7), Builder (age 8), Helping Hand (age 9).
    - *Pathfinders*: Friend (age 10), Companion (age 11), Explorer (age 12), Ranger (age 13), Voyager (age 14), Guide (age 15), TLT/Staff.
  - *Why*: Directly reflects real SDA club structure and makes unit division and honors tracking immediately authentic.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Pathfinder & Adventurer Portal                  │
│                                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │ Top Navigation Header   │  │ View Switcher & Club Selector       │  │
│  │ - Club Wordmark         │  │ [Register | Admin Review | Live     │  │
│  │ - Active Club Branch    │  │  Attendance | Directory | ID Cards] │  │
│  └───────────┬─────────────┘  └──────────────────┬──────────────────┘  │
│              │                                   │                     │
│              ▼                                   ▼                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ View Controller                                                  │  │
│  │ ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐ │  │
│  │ │ Public         │ │ Church Review  │ │ Live Attendance        │ │  │
│  │ │ Registration   │ │ Dashboard      │ │ & QR Scanner           │ │  │
│  │ │ (Multi-step)   │ │ (Status filter,│ │ (Real-time roster,     │ │  │
│  │ │                │ │  approval modal│ │  event selector,       │ │  │
│  │ │                │ │  unit assign)  │ │  attendance metrics)   │ │  │
│  └────────────────┘ └────────────────┘ └────────────────────────┘ │  │
│  │ ┌──────────────────────────────────────────────────────────────┐ │  │
│  │ │ Member Directory & Digital Pathfinder Pass Generator         │ │  │
│  │ └──────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Local State Management & Persistent LocalStorage Engine          │  │
│  │ - members: Member[] (Adventurers, Pathfinders, Staff)            │  │
│  │ - events: ClubEvent[] (Meeting, Camporee, Community Outreach)    │  │
│  │ - attendanceRecords: AttendanceRecord[] (EventId, MemberId,      │  │
│  │   status, timestamp, checkedInBy)                                │  │
│  │ - units: ClubUnit[] (Eagles, Trailblazers, Bees, Builders)       │  │
│  │ - Export / Import / Reset Database                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Models

```typescript
export type ClubBranch = 'Adventurers' | 'Pathfinders' | 'Staff';

export type AdventurerClass = 
  | 'Little Lamb' | 'Eager Beaver' | 'Busy Bee' 
  | 'Sunbeam' | 'Builder' | 'Helping Hand';

export type PathfinderClass = 
  | 'Friend' | 'Companion' | 'Explorer' 
  | 'Ranger' | 'Voyager' | 'Guide' | 'TLT / Master Guide';

export type RegistrationStatus = 
  | 'Pending Review' 
  | 'Approved' 
  | 'Needs Clarification' 
  | 'Archived';

export interface Member {
  id: string;
  registrationNumber: string;
  branch: ClubBranch;
  className: string;
  unitId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalConditions?: string;
  allergies?: string;
  uniformSize: string;
  registrationStatus: RegistrationStatus;
  statusNotes?: string;
  duesPaid: boolean;
  registrationDate: string;
  avatarSeed: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  branch: 'Both' | 'Adventurers' | 'Pathfinders';
  date: string;
  time: string;
  location: string;
  type: 'Regular Meeting' | 'Campout' | 'Investiture' | 'Outreach' | 'Executive';
  isActive: boolean;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Excused' | 'Absent';

export interface AttendanceRecord {
  id: string;
  eventId: string;
  memberId: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkInMethod: 'Manual' | 'QR Code' | 'Kiosk';
  notes?: string;
}
```

### Component Implementation Plan

1. **Header & Context Bar**: Clean top bar with club branding, active church name ("Grace Seventh-day Adventist Church - Maranatha Pathfinder & Adventurer Club"), active view switcher, and quick export/reset tools.
2. **Registration Component (`RegisterMember.tsx`)**:
   - Progressive 4-step form with clear visual step indicators.
   - Dynamic class suggestions based on age and club branch.
   - Medical and emergency contact validations.
   - Digital signature confirmation with instant tracking modal.
3. **Church Admin Dashboard (`ChurchAdminDashboard.tsx`)**:
   - Key stats ribbon: Total Registered, Pending Review, Approved, Attendance Rate.
   - Filterable data grid: Search by name, filter by status, filter by club branch or class.
   - Application Review Modal: View comprehensive details, approve with one click, assign unit, toggle fee payment.
4. **Live Attendance Workspace (`LiveAttendance.tsx`)**:
   - Event selector and creation modal (date, time, location, event type).
   - Live roster table with instant 1-click status pills (`Present`, `Late`, `Excused`, `Absent`).
   - Real-time attendance summary counters and search bar.
   - QR Code Check-in Scanner view with camera support and manual QR code lookup.
5. **Member Directory & Digital Pass Viewer (`MemberPassModal.tsx`)**:
   - High-fidelity visual Pathfinder/Adventurer Membership Card with official club emblem, class insignia, photo avatar, emergency info, and high-contrast scannable QR code.
   - Print-friendly layout.
