import React, { useState } from 'react';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import { useClub } from '../context/ClubContext';
import {
  Member, MemberDetails, MEMBER_DETAIL_FIELDS,
  PATHFINDER_CLASSES, ADVENTURER_CLASSES, HONOR_CATEGORIES, HonorCategory,
} from '../types/club';

interface MemberDetailPageProps {
  memberId: string;
  onBack: () => void;
}

const MemberDetailForm: React.FC<{ member: Member; onBack: () => void }> = ({ member, onBack }) => {
  const { updateMemberDetails, allUnits, allClubs, getMemberHonors, addMemberHonor, deleteMemberHonor } = useClub();
  const [unitId, setUnitId] = useState(member.unitId ?? '');
  const honors = getMemberHonors(member.id);
  const [newHonorCategory, setNewHonorCategory] = useState<HonorCategory>(HONOR_CATEGORIES[0]);
  const [newHonorName, setNewHonorName] = useState('');
  const [newHonorStatus, setNewHonorStatus] = useState<'In Progress' | 'Completed'>('In Progress');
  const [newHonorDate, setNewHonorDate] = useState('');
  const [newHonorInstructor, setNewHonorInstructor] = useState('');
  const [honorBusy, setHonorBusy] = useState('');
  const [honorError, setHonorError] = useState('');

  const addHonor = async () => {
    if (!newHonorName.trim() || honorBusy) return;
    setHonorBusy('add'); setHonorError('');
    try {
      await addMemberHonor(member.id, {
        category: newHonorCategory,
        honorName: newHonorName.trim(),
        status: newHonorStatus,
        dateEarned: newHonorStatus === 'Completed' ? (newHonorDate || undefined) : undefined,
        instructorName: newHonorInstructor.trim() || undefined,
      });
      setNewHonorName('');
      setNewHonorDate('');
      setNewHonorInstructor('');
    } catch { setHonorError('The honor could not be saved. Check your connection and permissions, then try again.'); }
    finally { setHonorBusy(''); }
  };
  const removeHonor = async (honorId: string) => {
    if (honorBusy) return;
    setHonorBusy(honorId); setHonorError('');
    try { await deleteMemberHonor(honorId); }
    catch { setHonorError('The honor could not be removed. Check your connection and permissions, then try again.'); }
    finally { setHonorBusy(''); }
  };
  const availableUnits = allUnits.filter(unit => unit.orgId === member.orgId && (unit.branch === member.branch || member.branch === 'Staff'));
  const [details, setDetails] = useState<MemberDetails>(() => ({
    ...Object.fromEntries(MEMBER_DETAIL_FIELDS.map(key => [key, member[key] ?? ''])),
    swimmingAbility: member.swimmingAbility,
  }) as MemberDetails);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900';
  const field = (key: keyof MemberDetails, label: string, type = 'text', required = false) => (
    <label className="block text-xs font-semibold text-slate-700" key={key}>
      {label}{required ? ' *' : ''}
      <input type={type} required={required} value={details[key] ?? ''} className={inputClass}
        onChange={event => { setSaved(false); setDetails(previous => ({ ...previous, [key]: event.target.value })); }} />
    </label>
  );

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    if (!details.firstName.trim() || !details.lastName.trim()) {
      setError('First and last names are required.');
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updateMemberDetails(member.id, details, unitId !== (member.unitId ?? '') ? unitId : undefined);
      setSaved(true);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(code === 'invalid-unit' ? 'That unit is no longer available. Choose another unit and try again.' : code === 'permission-denied'
        ? 'Access was denied. Check that you are signed in with permission to edit this member.'
        : 'Changes could not be saved. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{member.firstName} {member.lastName}</h1>
          <p className="text-xs text-slate-500">{member.registrationNumber} · {member.branch}</p>
        </div>
      </div>

      <form onSubmit={save} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {saved && !error && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Changes saved.</p>}
        <fieldset disabled={saving} className="space-y-5 disabled:opacity-70">
          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-bold text-slate-900">Member information</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field('firstName', 'First name', 'text', true)}
              {field('lastName', 'Last name', 'text', true)}
              {field('dateOfBirth', 'Date of birth', 'date')}
              <label className="block text-xs font-semibold text-slate-700">Gender
                <select className={inputClass} value={details.gender} onChange={e => setDetails(p => ({ ...p, gender: e.target.value as Member['gender'] }))}>
                  {['Male', 'Female', 'Other'].map(value => <option key={value}>{value}</option>)}
                </select>
              </label>
              {member.branch === 'Staff' ? field('className', 'Class / Role') : (
                <label className="block text-xs font-semibold text-slate-700">Class
                  <select className={inputClass} value={details.className} onChange={e => setDetails(p => ({ ...p, className: e.target.value }))}>
                    {(member.branch === 'Pathfinders' ? PATHFINDER_CLASSES : ADVENTURER_CLASSES).map(value => <option key={value}>{value}</option>)}
                  </select>
                </label>
              )}
              <div>
                <label htmlFor="edit-member-unit" className="block text-xs font-semibold text-slate-700">Unit</label>
                <select id="edit-member-unit" className={inputClass} value={unitId} onChange={e => setUnitId(e.target.value)}>
                  <option value="">Unassigned</option>
                  {unitId && !availableUnits.some(unit => unit.id === unitId) && (
                    <option value={unitId}>{member.unitName || 'Previous unit'} (unavailable)</option>
                  )}
                  {availableUnits.map(unit => (
                    <option key={unit.id} value={unit.id}>{unit.name}{unit.clubId ? ` · ${allClubs.find(club => club.id === unit.clubId)?.name || unit.branch}` : ''}</option>
                  ))}
                </select>
              </div>
              <label className="block text-xs font-semibold text-slate-700">Uniform size
                <select className={inputClass} value={details.uniformSize} onChange={e => setDetails(p => ({ ...p, uniformSize: e.target.value as Member['uniformSize'] }))}>
                  {['Youth S', 'Youth M', 'Youth L', 'Adult S', 'Adult M', 'Adult L', 'Adult XL'].map(value => <option key={value}>{value}</option>)}
                </select>
              </label>
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-bold text-slate-900">Parent / guardian and emergency contacts</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field('parentName', 'Parent / guardian name')}
              {field('parentPhone', 'Parent / guardian phone', 'tel')}
              {field('parentEmail', 'Parent / guardian email', 'email')}
              {field('homeAddress', 'Home address')}
              {field('emergencyContact', 'Emergency contact name')}
              {field('emergencyPhone', 'Emergency contact phone', 'tel')}
              {field('emergencyRelation', 'Emergency contact relationship')}
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-bold text-slate-900">Health and activity information</legend>
            {(['medicalConditions', 'allergies', 'dietaryRestrictions'] as const).map((key, index) => (
              <div key={key}>
                <label htmlFor={`edit-member-${key}`} className="block text-xs font-semibold text-slate-700">
                  {['Medical conditions / medications', 'Allergies', 'Dietary restrictions'][index]}
                </label>
                <textarea id={`edit-member-${key}`} className={inputClass} rows={2} value={details[key] ?? ''} onChange={e => setDetails(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <label className="block text-xs font-semibold text-slate-700">Swimming ability
              <select className={inputClass} value={details.swimmingAbility ?? ''} onChange={e => setDetails(p => ({ ...p, swimmingAbility: (e.target.value || undefined) as Member['swimmingAbility'] }))}>
                <option value="">Not recorded</option>
                {['Non-Swimmer', 'Beginner', 'Intermediate', 'Advanced'].map(value => <option key={value}>{value}</option>)}
              </select>
            </label>
          </fieldset>
          {member.branch !== 'Staff' && (
            <fieldset className="space-y-3">
              <legend className="mb-3 text-sm font-bold text-slate-900">Advancement — Honors</legend>

              {honors.length > 0 && (
                <div className="space-y-1.5">
                  {honors.map(honor => (
                    <div key={honor.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-900">{honor.honorName}</span>
                        <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${honor.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                          {honor.status}
                        </span>
                        <div className="text-slate-500">
                          {honor.category}{honor.dateEarned ? ` · Earned ${honor.dateEarned}` : ''}{honor.instructorName ? ` · ${honor.instructorName}` : ''}
                        </div>
                      </div>
                      <button type="button" disabled={!!honorBusy} onClick={() => removeHonor(honor.id)} className="shrink-0 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50" aria-label={`Remove ${honor.honorName}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {honorError && <p role="alert" className="text-sm text-red-700">{honorError}</p>}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:items-end">
                <label className="block text-xs font-semibold text-slate-700 sm:col-span-1">Category
                  <select className={inputClass} value={newHonorCategory} onChange={e => setNewHonorCategory(e.target.value as HonorCategory)}>
                    {HONOR_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-slate-700 sm:col-span-1">Honor name
                  <input type="text" value={newHonorName} onChange={e => setNewHonorName(e.target.value)} placeholder="e.g. Camping Skills I" className={inputClass} />
                </label>
                <label className="block text-xs font-semibold text-slate-700">Status
                  <select className={inputClass} value={newHonorStatus} onChange={e => setNewHonorStatus(e.target.value as 'In Progress' | 'Completed')}>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </label>
                <label className="block text-xs font-semibold text-slate-700">Date earned
                  <input type="date" value={newHonorDate} onChange={e => setNewHonorDate(e.target.value)} className={inputClass} disabled={newHonorStatus !== 'Completed'} />
                </label>
                <div className="flex items-end gap-2">
                  <label className="block flex-1 text-xs font-semibold text-slate-700">Instructor
                    <input type="text" value={newHonorInstructor} onChange={e => setNewHonorInstructor(e.target.value)} className={inputClass} />
                  </label>
                  <button type="button" disabled={!!honorBusy} onClick={addHonor} className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-100 disabled:opacity-50">
                    <Plus className="h-3.5 w-3.5" /> {honorBusy === 'add' ? 'Saving…' : 'Add'}
                  </button>
                </div>
              </div>
            </fieldset>
          )}
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onBack} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">Back</button>
            <button type="submit" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export const MemberDetailPage: React.FC<MemberDetailPageProps> = ({ memberId, onBack }) => {
  const { members, canManageScoring } = useClub();
  const member = members.find(m => m.id === memberId);

  if (!member || !canManageScoring) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
        <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {canManageScoring ? 'This member could not be found in the selected church — they may have been removed.' : 'You do not have permission to edit member details for this church.'}
        </p>
      </div>
    );
  }

  return <MemberDetailForm key={member.id} member={member} onBack={onBack} />;
};
