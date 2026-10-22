import React, { useState } from 'react';
import { ArrowLeft, Trash2, Plus, Save, UserRound, Users, HeartPulse, Award, Compass, CheckCircle2, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useClub } from '../context/ClubContext';
import {
  Member, MemberDetails, MEMBER_DETAIL_FIELDS,
  PATHFINDER_CLASSES, ADVENTURER_CLASSES, HONOR_CATEGORIES, HonorCategory,
} from '../types/club';

interface MemberDetailPageProps {
  memberId: string;
  onBack: () => void;
}

const DetailSection: React.FC<{ id: string; icon: typeof UserRound; title: string; description: string; className?: string; children: React.ReactNode }> = ({ id, icon: Icon, title, description, className = '', children }) => (
  <section id={id} aria-labelledby={`${id}-title`} className={`min-w-0 scroll-mt-36 rounded-2xl border border-slate-200 bg-white shadow-xs ${className}`}>
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900"><Icon className="h-4 w-4" /></div>
      <div><h2 id={`${id}-title`} className="text-sm font-bold text-slate-900">{title}</h2><p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p></div>
    </div>
    <div className="p-5 sm:p-6">{children}</div>
  </section>
);

const MemberDetailForm: React.FC<{ member: Member; onBack: () => void }> = ({ member, onBack }) => {
  const { updateMemberDetails, allUnits, allClubs, getMemberHonors, addMemberHonor, deleteMemberHonor, currentOrg } = useClub();
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

  const inputClass = 'mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900/10';
  function changeDetail<K extends keyof MemberDetails>(key: K, value: MemberDetails[K]) {
    setSaved(false);
    setDetails(previous => ({ ...previous, [key]: value }));
  }
  const dirty = MEMBER_DETAIL_FIELDS.some(key => (details[key] ?? '') !== (member[key] ?? '')) || unitId !== (member.unitId ?? '');
  const completedHonors = honors.filter(honor => honor.status === 'Completed').length;
  const placementUnit = availableUnits.find(unit => unit.id === unitId);
  const placementClub = allClubs.find(club => club.id === (placementUnit?.clubId ?? member.clubId));
  const classOptions = member.branch === 'Pathfinders' ? PATHFINDER_CLASSES : ADVENTURER_CLASSES;
  const field = (key: keyof MemberDetails, label: string, type = 'text', required = false) => (
    <label className="block text-xs font-semibold text-slate-700" key={key}>
      {label}{required ? ' *' : ''}
      <input type={type} required={required} value={details[key] ?? ''} className={inputClass}
        onChange={event => changeDetail(key, event.target.value)} />
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
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-900"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Member Details</h1>
          <p className="mt-1 text-xs text-slate-500">Manage membership, family contacts, and advancement in one place.</p>
        </div>
        <button type="submit" form="member-details-form" disabled={saving || !!honorBusy} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-800 disabled:opacity-50 sm:self-auto"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save Changes'}</button>
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-950 text-xl font-extrabold text-amber-400">{member.firstName[0]}{member.lastName[0]}</div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5"><h2 className="break-words text-xl font-extrabold text-slate-900">{member.firstName} {member.lastName}</h2><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${member.registrationStatus === 'Approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{member.registrationStatus}</span></div>
            <p className="mt-1 font-mono text-xs text-slate-500">{member.registrationNumber}</p>
            <p className="mt-1 break-words text-xs text-slate-500">{currentOrg.churchName}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs sm:grid-cols-3 lg:min-w-80 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Branch</span><strong className="mt-1 block text-slate-800">{member.branch}</strong></div>
          <div><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Membership dues</span><strong className={`mt-1 block ${member.duesPaid ? 'text-emerald-700' : 'text-amber-700'}`}>{member.duesPaid ? 'Paid' : 'Outstanding'}</strong></div>
          <div><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered</span><strong className="mt-1 block text-slate-800">{member.registrationDate || 'Not recorded'}</strong></div>
        </div>
      </div>

      <form id="member-details-form" onSubmit={save} className="space-y-6">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {saved && !error && <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4" />Changes saved.</p>}
        <fieldset disabled={saving} className="grid min-w-0 grid-cols-1 items-start gap-6 disabled:opacity-70 xl:grid-cols-12">
          <DetailSection id="member-personal" icon={UserRound} title="Personal information" description="The member's basic details and identity." className="xl:col-span-8 xl:col-start-1 xl:row-start-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {field('firstName', 'First name', 'text', true)}
              {field('lastName', 'Last name', 'text', true)}
              {field('dateOfBirth', 'Date of birth', 'date')}
              <label className="block text-xs font-semibold text-slate-700">Gender<select className={inputClass} value={details.gender} onChange={e => changeDetail('gender', e.target.value as Member['gender'])}>{['Male', 'Female', 'Other'].map(value => <option key={value}>{value}</option>)}</select></label>
            </div>
          </DetailSection>

          <div className="min-w-0 space-y-5 xl:col-span-4 xl:col-start-9 xl:row-start-1 xl:row-span-3">
            <DetailSection id="member-placement" icon={Compass} title="Club & placement" description="Class, unit assignment, and uniform.">
              <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-blue-800">Club</span><p className="mt-1 break-words text-sm font-bold text-blue-950">{placementClub?.name || member.clubName || 'No club assigned'}</p></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1">
                {member.branch === 'Staff' ? field('className', 'Class / Role') : (
                  <label className="block text-xs font-semibold text-slate-700">Class<select className={inputClass} value={details.className} onChange={e => changeDetail('className', e.target.value)}>
                    {!(classOptions as readonly string[]).includes(details.className) && <option value={details.className}>{details.className || 'Not recorded'}</option>}
                    {classOptions.map(value => <option key={value}>{value}</option>)}
                  </select></label>
                )}
                <div><label htmlFor="edit-member-unit" className="block text-xs font-semibold text-slate-700">Unit</label><select id="edit-member-unit" className={inputClass} value={unitId} onChange={e => { setSaved(false); setUnitId(e.target.value); }}>
                  <option value="">Unassigned</option>
                  {unitId && !availableUnits.some(unit => unit.id === unitId) && <option value={unitId}>{member.unitName || 'Previous unit'} (unavailable)</option>}
                  {availableUnits.map(unit => <option key={unit.id} value={unit.id}>{unit.name}{unit.clubId ? ` · ${allClubs.find(club => club.id === unit.clubId)?.name || unit.branch}` : ''}</option>)}
                </select></div>
                <label className="block text-xs font-semibold text-slate-700">Uniform size<select className={inputClass} value={details.uniformSize} onChange={e => changeDetail('uniformSize', e.target.value as Member['uniformSize'])}>{['Youth S', 'Youth M', 'Youth L', 'Adult S', 'Adult M', 'Adult L', 'Adult XL'].map(value => <option key={value}>{value}</option>)}</select></label>
              </div>
            </DetailSection>
            <nav aria-label="Member detail sections" className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs xl:block">
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">On this page</p>
              {[['member-personal', 'Personal information'], ['member-placement', 'Club & placement'], ['member-contacts', 'Family & contacts'], ['member-health', 'Health & activities'], ...(member.branch !== 'Staff' ? [['member-honors', 'Advancement & honors']] : [])].map(([id, label]) => <a key={id} href={`#${id}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-900">{label}<ArrowUpRight className="h-3.5 w-3.5 text-slate-400" /></a>)}
            </nav>
          </div>

          <DetailSection id="member-contacts" icon={Users} title="Family & emergency contacts" description="Keep the right people within reach." className="xl:col-span-8 xl:col-start-1 xl:row-start-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="min-w-0 space-y-4"><h3 className="text-xs font-bold text-slate-900">Parent / guardian</h3>{field('parentName', 'Parent / guardian name')}{field('parentPhone', 'Parent / guardian phone', 'tel')}{field('parentEmail', 'Parent / guardian email', 'email')}{field('homeAddress', 'Home address')}</div>
              <div className="min-w-0 space-y-4 border-t border-slate-100 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0"><h3 className="text-xs font-bold text-slate-900">Emergency contact</h3>{field('emergencyContact', 'Emergency contact name')}{field('emergencyPhone', 'Emergency contact phone', 'tel')}{field('emergencyRelation', 'Emergency contact relationship')}<p className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />Use a contact who can be reached during club activities.</p></div>
            </div>
          </DetailSection>

          <DetailSection id="member-health" icon={HeartPulse} title="Health & activity information" description="Details to support safe participation." className="xl:col-span-8 xl:col-start-1 xl:row-start-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(['medicalConditions', 'allergies', 'dietaryRestrictions'] as const).map((key, index) => <div key={key} className={index === 0 ? 'sm:col-span-2' : ''}><label htmlFor={`edit-member-${key}`} className="block text-xs font-semibold text-slate-700">{['Medical conditions / medications', 'Allergies', 'Dietary restrictions'][index]}</label><textarea id={`edit-member-${key}`} className={inputClass} rows={2} value={details[key] ?? ''} onChange={e => changeDetail(key, e.target.value)} /></div>)}
              <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">Swimming ability<select className={inputClass} value={details.swimmingAbility ?? ''} onChange={e => changeDetail('swimmingAbility', (e.target.value || undefined) as Member['swimmingAbility'])}><option value="">Not recorded</option>{['Non-Swimmer', 'Beginner', 'Intermediate', 'Advanced'].map(value => <option key={value}>{value}</option>)}</select></label>
            </div>
          </DetailSection>

          {member.branch !== 'Staff' && <DetailSection id="member-honors" icon={Award} title="Advancement & honors" description="Recognize progress and keep achievements organized." className="xl:col-span-12 xl:row-start-4">
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
              <fieldset disabled={!!honorBusy} className="min-w-0 space-y-4 rounded-xl bg-slate-50/70 p-4 disabled:opacity-70 sm:p-5">
                <legend className="sr-only">Add an honor</legend>
                <div><h3 className="text-sm font-bold text-slate-900">Add an honor</h3><p className="mt-1 text-xs text-slate-500">New honors are saved immediately.</p></div>
                {honorError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{honorError}</p>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">Honor name<input type="text" value={newHonorName} onChange={e => setNewHonorName(e.target.value)} placeholder="e.g. Camping Skills I" className={inputClass} /></label>
                  <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">Category<select className={inputClass} value={newHonorCategory} onChange={e => setNewHonorCategory(e.target.value as HonorCategory)}>{HONOR_CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label>
                  <label className="block text-xs font-semibold text-slate-700">Status<select className={inputClass} value={newHonorStatus} onChange={e => setNewHonorStatus(e.target.value as 'In Progress' | 'Completed')}><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select></label>
                  <label className="block text-xs font-semibold text-slate-700">Date earned<input type="date" value={newHonorDate} onChange={e => setNewHonorDate(e.target.value)} className={inputClass} disabled={newHonorStatus !== 'Completed'} /></label>
                  <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">Instructor<input type="text" value={newHonorInstructor} onChange={e => setNewHonorInstructor(e.target.value)} className={inputClass} /></label>
                </div>
                <div className="flex justify-end"><button type="button" disabled={!!honorBusy || !newHonorName.trim()} onClick={addHonor} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"><Plus className="h-4 w-4" />{honorBusy === 'add' ? 'Saving…' : 'Add Honor'}</button></div>
              </fieldset>
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-slate-900">Honor record</h3><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-800">{completedHonors} completed · {honors.length - completedHonors} in progress</span></div>
                {honors.length === 0 ? <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center"><Award className="mb-3 h-8 w-8 text-slate-300" /><p className="text-sm font-semibold text-slate-700">No honors recorded yet</p><p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">Add an honor to start building this member's advancement record.</p></div> : <div className="space-y-3">{honors.map(honor => <div key={honor.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="break-words text-sm font-bold text-slate-900">{honor.honorName}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${honor.status === 'Completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{honor.status}</span></div><p className="mt-1 text-xs text-slate-500">{honor.category}</p>{(honor.dateEarned || honor.instructorName) && <p className="mt-2 break-words text-xs text-slate-500">{honor.dateEarned ? `Earned ${honor.dateEarned}` : ''}{honor.dateEarned && honor.instructorName ? ' · ' : ''}{honor.instructorName}</p>}</div><button type="button" disabled={!!honorBusy} onClick={() => removeHonor(honor.id)} className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50" aria-label={`Remove ${honor.honorName}`}><Trash2 className="h-4 w-4" /></button></div>)}</div>}
              </div>
            </div>
          </DetailSection>}
        </fieldset>
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:px-6">
          <p aria-live="polite" className="flex items-center gap-2 text-xs text-slate-500"><span className={`h-1.5 w-1.5 rounded-full ${dirty ? 'bg-amber-500' : 'bg-emerald-500'}`} />{saving ? 'Saving member details…' : dirty ? 'You have unsaved changes' : 'Member details are up to date'}</p>
          <div className="flex items-center justify-end gap-2"><button type="button" onClick={onBack} className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Back</button><button type="submit" disabled={saving || !!honorBusy} className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save Member Details'}</button></div>
        </div>
      </form>
    </div>
  );

};

export const MemberDetailPage: React.FC<MemberDetailPageProps> = ({ memberId, onBack }) => {
  const { members, canManageScoring } = useClub();
  const member = members.find(m => m.id === memberId);

  if (!member || !canManageScoring) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
