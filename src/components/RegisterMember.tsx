import React, { useState } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  ShieldCheck, 
  Heart, 
  Printer, 
  UserCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import heroBanner from '../assets/images/pathfinder_hero_banner_1792569497907.jpg';
import { useClub } from '../context/ClubContext';
import { ClubBranch, Member } from '../types/club';

interface RegisterMemberProps {
  onGoToAdminQueue: () => void;
  onGoToDirectory: () => void;
}

export const RegisterMember: React.FC<RegisterMemberProps> = ({ 
  onGoToAdminQueue,
  onGoToDirectory 
}) => {
  const { registerMember, currentUser, units, updateMemberStatus, assignUnit, toggleDuesPaid } = useClub();
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedMember, setSubmittedMember] = useState<Member | null>(null);

  // Registration Mode: Parent Self-Registration vs Director/Secretary Direct Entry
  const [registrationMode, setRegistrationMode] = useState<'parent' | 'staff'>('parent');
  const [staffAutoApprove, setStaffAutoApprove] = useState(true);
  const [staffDuesCollected, setStaffDuesCollected] = useState(false);
  const [staffSelectedUnitId, setStaffSelectedUnitId] = useState('');

  // Form State
  const [branch, setBranch] = useState<ClubBranch>('Pathfinders');
  const [className, setClassName] = useState<string>('Friend');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [churchAffiliation, setChurchAffiliation] = useState('Grace SDA Member');

  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Mother');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('Vegetarian');
  const [swimmingAbility, setSwimmingAbility] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Non-Swimmer'>('Intermediate');

  const [uniformSize, setUniformSize] = useState<Member['uniformSize']>('Youth L');
  const [parentConsentSigned, setParentConsentSigned] = useState(false);
  const [photoReleaseConsent, setPhotoReleaseConsent] = useState(true);
  const [digitalSignature, setDigitalSignature] = useState('');

  // Auto update recommended class when branch changes
  const handleBranchChange = (newBranch: ClubBranch) => {
    setBranch(newBranch);
    if (newBranch === 'Adventurers') {
      setClassName('Busy Bee');
      setUniformSize('Youth S');
    } else if (newBranch === 'Pathfinders') {
      setClassName('Friend');
      setUniformSize('Youth L');
    } else {
      setClassName('TLT / Master Guide');
      setUniformSize('Adult L');
    }
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!firstName.trim() || !lastName.trim() || !dateOfBirth) {
        alert('Please fill in the youth member’s first name, last name, and date of birth.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!parentName.trim() || !parentPhone.trim()) {
        alert('Please provide parent/guardian contact details.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!emergencyContact.trim() || !emergencyPhone.trim()) {
        alert('Please provide an emergency contact name and phone.');
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (!parentConsentSigned) {
        alert('Please accept the parental consent and participation agreement.');
        return false;
      }
      if (!digitalSignature.trim()) {
        alert('Please provide your digital signature name.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    const isStaffEntry = registrationMode === 'staff';
    const status = isStaffEntry && staffAutoApprove ? 'Approved' : 'Pending Review';
    const notes = isStaffEntry
      ? `Enrolled directly by ${currentUser ? currentUser.name : 'Director'} (${currentUser ? currentUser.role : 'Staff'}). Auto-approved for active club participation.`
      : `Registered online by ${digitalSignature} (${churchAffiliation}). Awaiting church board & director review.`;

    const unit = units.find(u => u.id === staffSelectedUnitId);

    const newMember = registerMember({
      branch,
      className,
      unitId: isStaffEntry && unit ? unit.id : undefined,
      unitName: isStaffEntry && unit ? unit.name : undefined,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      gender,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim(),
      homeAddress: homeAddress.trim(),
      emergencyContact: emergencyContact.trim(),
      emergencyPhone: emergencyPhone.trim(),
      emergencyRelation,
      medicalConditions: medicalConditions.trim() || 'None reported',
      allergies: allergies.trim() || 'None',
      dietaryRestrictions,
      swimmingAbility,
      uniformSize,
      parentConsentSigned,
      photoReleaseConsent,
      statusNotes: notes,
    });

    if (isStaffEntry && staffAutoApprove) {
      updateMemberStatus(newMember.id, 'Approved', notes);
      newMember.registrationStatus = 'Approved';
    }
    if (isStaffEntry && staffDuesCollected) {
      toggleDuesPaid(newMember.id);
      newMember.duesPaid = true;
    }

    setSubmittedMember(newMember);

    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1E3A8A', '#F59E0B', '#10B981', '#3B82F6'],
      });
    } catch {
      // ignore
    }
  };

  const resetForm = () => {
    setSubmittedMember(null);
    setCurrentStep(1);
    setFirstName('');
    setLastName('');
    setDateOfBirth('');
    setParentName('');
    setParentPhone('');
    setParentEmail('');
    setHomeAddress('');
    setEmergencyContact('');
    setEmergencyPhone('');
    setMedicalConditions('');
    setAllergies('');
    setParentConsentSigned(false);
    setDigitalSignature('');
  };

  // If already submitted, display receipt
  if (submittedMember) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Success Banner */}
          <div className="bg-blue-950 text-white p-6 text-center">
            <div className="w-14 h-14 bg-amber-400 text-blue-950 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Registration Submitted Successfully!</h2>
            <p className="text-sm text-blue-200 mt-1">
              Grace Seventh-day Adventist Church · Club Year 2026–2027
            </p>
          </div>

          <div className="p-6 space-y-6">
            {submittedMember.registrationStatus === 'Approved' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900">Current Status: Approved & Active</p>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Direct enrollment by church leadership completed. This youth is now officially enrolled, assigned to their unit, and eligible for live meeting and campout attendance!
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-sm flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Current Status: Pending Church Leadership Review</p>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Your application has been received and queued in the church review dashboard. Club directors will review medical details, assign your youth to their unit, and contact you regarding uniform fitting and opening induction.
                  </p>
                </div>
              </div>
            )}

            {/* Applicant Summary Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Registration Number</span>
                  <span className="text-lg font-mono font-bold text-blue-900">{submittedMember.registrationNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block">Club Branch</span>
                  <span className="text-sm font-semibold text-slate-800">{submittedMember.branch} · {submittedMember.className}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Youth Name</span>
                  <span className="font-semibold text-slate-900">{submittedMember.firstName} {submittedMember.lastName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Birth</span>
                  <span className="font-semibold text-slate-900">{submittedMember.dateOfBirth} ({submittedMember.gender})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Parent / Guardian</span>
                  <span className="font-semibold text-slate-900">{submittedMember.parentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Phone</span>
                  <span className="font-mono font-semibold text-slate-900">{submittedMember.parentPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Uniform Sizing</span>
                  <span className="font-semibold text-slate-900">{submittedMember.uniformSize}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Emergency Contact</span>
                  <span className="font-semibold text-slate-900">{submittedMember.emergencyContact} ({submittedMember.emergencyPhone})</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Confirmation Slip
              </button>
              <button
                onClick={onGoToAdminQueue}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                View in Church Review Queue
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Register Another Youth
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Visual Header Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 border border-slate-200 shadow-sm bg-blue-950 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="p-6 md:p-8 md:col-span-2 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-semibold w-max mb-3 border border-amber-400/30">
              <Compass className="w-3.5 h-3.5" />
              <span>Official 2026–2027 Club Year Enrollment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pathfinder & Adventurer Membership Registration
            </h1>
            <p className="text-sm text-blue-200 mt-2 leading-relaxed">
              Register youth for character building, outdoor adventure, craft honors, and Christ-centered leadership training at Grace Seventh-day Adventist Church.
            </p>
          </div>
          <div className="hidden md:block relative h-full min-h-[180px]">
            <img 
              src={heroBanner}
              alt="Pathfinders in uniform outdoors"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* Registration Mode Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Enrollment Pathway</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {registrationMode === 'parent' 
                ? 'Parent / youth self-service application (queues for church review and leadership sign-off).'
                : 'Direct in-person desk enrollment by club director or secretary (enables immediate approval and unit assignment).'}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setRegistrationMode('parent')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                registrationMode === 'parent'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Parent Self-Registration
            </button>
            <button
              type="button"
              onClick={() => setRegistrationMode('staff')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                registrationMode === 'staff'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Director / Secretary Direct Entry
            </button>
          </div>
        </div>

        {registrationMode === 'staff' && (
          <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-blue-50/50 p-3 rounded-lg border border-blue-200">
            <div>
              <label className="block font-semibold text-blue-950 mb-1">Assign Unit Right Away</label>
              <select
                value={staffSelectedUnitId}
                onChange={(e) => setStaffSelectedUnitId(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-blue-300 rounded-md bg-white text-slate-900 focus:outline-hidden"
              >
                <option value="">Unassigned (Assign later)</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.counselorName})</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="staffAutoApprove"
                checked={staffAutoApprove}
                onChange={(e) => setStaffAutoApprove(e.target.checked)}
                className="rounded text-blue-900 focus:ring-blue-900"
              />
              <label htmlFor="staffAutoApprove" className="font-semibold text-blue-950 cursor-pointer">
                Auto-Approve Immediately
              </label>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="staffDuesCollected"
                checked={staffDuesCollected}
                onChange={(e) => setStaffDuesCollected(e.target.checked)}
                className="rounded text-blue-900 focus:ring-blue-900"
              />
              <label htmlFor="staffDuesCollected" className="font-semibold text-blue-950 cursor-pointer">
                Collected Dues ($35) at Desk
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Progressive Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 w-full -z-0" />
          {[
            { step: 1, label: '1. Youth Details' },
            { step: 2, label: '2. Guardian & Church' },
            { step: 3, label: '3. Medical & Health' },
            { step: 4, label: '4. Uniform & Consent' },
          ].map((item) => (
            <div 
              key={item.step}
              className={`relative z-10 flex flex-col items-center cursor-pointer`}
              onClick={() => {
                if (item.step < currentStep) setCurrentStep(item.step);
              }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep === item.step 
                  ? 'bg-blue-900 text-white ring-4 ring-blue-100 shadow-sm' 
                  : currentStep > item.step 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white text-slate-500 border-2 border-slate-300'
              }`}>
                {currentStep > item.step ? '✓' : item.step}
              </div>
              <span className={`text-[11px] font-medium mt-1.5 whitespace-nowrap hidden sm:block ${
                currentStep === item.step ? 'text-blue-900 font-bold' : 'text-slate-500'
              }`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        {/* STEP 1: Branch & Youth Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 1: Select Club Branch & Youth Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adventurers are typically ages 4–9; Pathfinders are ages 10–15.
              </p>
            </div>

            {/* Branch Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div 
                onClick={() => handleBranchChange('Adventurers')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  branch === 'Adventurers' 
                    ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">Adventurer Club</span>
                  <span className="text-[11px] font-semibold text-emerald-700">Ages 4–9</span>
                </div>
                <p className="text-xs text-slate-500">
                  Little Lamb, Busy Bee, Sunbeam, Builder, Helping Hand
                </p>
              </div>

              <div 
                onClick={() => handleBranchChange('Pathfinders')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  branch === 'Pathfinders' 
                    ? 'border-blue-900 bg-blue-50/40 text-blue-950' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">Pathfinder Club</span>
                  <span className="text-[11px] font-semibold text-blue-800">Ages 10–15</span>
                </div>
                <p className="text-xs text-slate-500">
                  Friend, Companion, Explorer, Ranger, Voyager, Guide
                </p>
              </div>

              <div 
                onClick={() => handleBranchChange('Staff')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  branch === 'Staff' 
                    ? 'border-amber-600 bg-amber-50/40 text-amber-950' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">Staff & Counselors</span>
                  <span className="text-[11px] font-semibold text-amber-800">Ages 16+</span>
                </div>
                <p className="text-xs text-slate-500">
                  Teen Leadership (TLT), Unit Counselors, Master Guides
                </p>
              </div>
            </div>

            {/* Class Level Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class Level
              </label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              >
                {branch === 'Adventurers' && (
                  <>
                    <option value="Little Lamb">Little Lamb (Age 4 / Pre-K)</option>
                    <option value="Eager Beaver">Eager Beaver (Age 5 / Kindergarten)</option>
                    <option value="Busy Bee">Busy Bee (Age 6 / 1st Grade)</option>
                    <option value="Sunbeam">Sunbeam (Age 7 / 2nd Grade)</option>
                    <option value="Builder">Builder (Age 8 / 3rd Grade)</option>
                    <option value="Helping Hand">Helping Hand (Age 9 / 4th Grade)</option>
                  </>
                )}
                {branch === 'Pathfinders' && (
                  <>
                    <option value="Friend">Friend (Age 10 / 5th Grade)</option>
                    <option value="Companion">Companion (Age 11 / 6th Grade)</option>
                    <option value="Explorer">Explorer (Age 12 / 7th Grade)</option>
                    <option value="Ranger">Ranger (Age 13 / 8th Grade)</option>
                    <option value="Voyager">Voyager (Age 14 / 9th Grade)</option>
                    <option value="Guide">Guide (Age 15 / 10th Grade)</option>
                  </>
                )}
                {branch === 'Staff' && (
                  <>
                    <option value="TLT / Master Guide">Teen Leadership Trainee (TLT)</option>
                    <option value="Master Guide">Master Guide / Counselor</option>
                    <option value="Club Officer">Club Director / Secretary / Instructor</option>
                  </>
                )}
              </select>
            </div>

            {/* Youth Names & DOB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Youth First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Josiah"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Youth Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Vance"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <div className="flex gap-4 pt-2">
                  {(['Male', 'Female', 'Other'] as const).map((g) => (
                    <label key={g} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        className="text-blue-900 focus:ring-blue-900"
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Guardian & Church Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 2: Parent / Guardian & Church Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                We will send club notices, camporee alerts, and registration updates here.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent / Guardian Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. Samuel & Rachel Vance"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="(555) 234-8901"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent Email Address
                </label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="samuel.vance@example.org"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Church Affiliation
                </label>
                <select
                  value={churchAffiliation}
                  onChange={(e) => setChurchAffiliation(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                >
                  <option value="Grace SDA Member">Grace Seventh-day Adventist Church (Member)</option>
                  <option value="Other SDA Church">Other Seventh-day Adventist Church</option>
                  <option value="Friend of Church / Community">Community Guest / Friend of Church</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Home Street Address
              </label>
              <input
                type="text"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                placeholder="742 Evergreen Terrace, Springfield, OR 97477"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Medical & Health Profile */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 3: Medical, Allergy & Health Profile</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kept strictly confidential with club directors and nurse for outdoor campouts and honors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. Rachel Vance"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship *
                </label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="e.g. Mother, Uncle, Grandparent"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="(555) 234-8902"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Known Allergies (Food, Meds, Insects)
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Peanuts, Bee stings, Penicillin (or 'None')"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medical Conditions / Medications
                </label>
                <input
                  type="text"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Mild asthma (uses albuterol inhaler), none"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dietary Preferences
                </label>
                <select
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                >
                  <option value="Vegetarian">Vegetarian (Standard SDA)</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Dairy-Free">Dairy-Free</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                  <option value="None">None / General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Swimming Proficiency (For Honors & Campouts)
                </label>
                <select
                  value={swimmingAbility}
                  onChange={(e) => setSwimmingAbility(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                >
                  <option value="Non-Swimmer">Non-Swimmer (Life jacket required)</option>
                  <option value="Beginner">Beginner (Shallow water only)</option>
                  <option value="Intermediate">Intermediate (Can swim across pool)</option>
                  <option value="Advanced">Advanced (Strong swimmer)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Uniform & Consent */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 4: Uniform Sizing & Parental Consent</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Uniform shirts, scarves, and badges are ordered through the club secretary.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Uniform Field Shirt / Polo Sizing
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {(['Youth S', 'Youth M', 'Youth L', 'Adult S', 'Adult M', 'Adult L', 'Adult XL'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setUniformSize(size)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                      uniformSize === size
                        ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-900" />
                Pathfinder & Adventurer Club Pledge & Law Agreement
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                By the grace of God, I will be pure, kind, and true. I will keep the Pathfinder Law, I will be a servant of God and a friend to all mankind. I agree to participate respectfully in all club honors, drill, camping, and community activities.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={parentConsentSigned}
                    onChange={(e) => setParentConsentSigned(e.target.checked)}
                    className="mt-0.5 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <span>
                    <strong>Parental Authorization & Medical Release:</strong> I give full permission for my child to participate in all official club activities, camping trips, and honors. In case of emergency when I cannot be reached, I authorize club leadership to obtain necessary medical care.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={photoReleaseConsent}
                    onChange={(e) => setPhotoReleaseConsent(e.target.checked)}
                    className="mt-0.5 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <span>
                    <strong>Photo & Media Consent:</strong> I permit photos/videos of club activities to be included in club newsletters, slide presentations, and church bulletin boards.
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parent / Guardian Digital Signature (Full Name) *
              </label>
              <input
                type="text"
                required
                value={digitalSignature}
                onChange={(e) => setDigitalSignature(e.target.value)}
                placeholder="Type your full legal name as digital signature"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden font-medium"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Timestamp: {new Date().toLocaleDateString()} · Official electronic signature on record.
              </span>
            </div>
          </div>
        )}

        {/* Form Stepper Navigation */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
            >
              Continue to Step {currentStep + 1}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Submit Membership Application
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
