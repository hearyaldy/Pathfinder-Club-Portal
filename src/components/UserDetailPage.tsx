import React, { useState } from 'react';
import { ArrowLeft, Save, UserRound, Building2, ShieldCheck, Award, CheckCircle2, Mail } from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { AuthUser, USER_ROLES, UserRole } from '../types/club';

const ProfileSection: React.FC<{ title: string; description: string; icon: typeof UserRound; children: React.ReactNode }> = ({ title, description, icon: Icon, children }) => (
  <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-xs">
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900"><Icon className="h-4 w-4" /></div>
      <div><h2 className="text-sm font-bold text-slate-900">{title}</h2><p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p></div>
    </div>
    <div className="space-y-4 p-5 sm:p-6">{children}</div>
  </section>
);

const UserDetailForm: React.FC<{ user: AuthUser; onBack: () => void }> = ({ user, onBack }) => {
  const { currentUser, organizations, staffUsers, updateStaffUser } = useClub();
  const admin = currentUser?.role === 'Super Admin';
  const ownProfile = currentUser?.id === user.id;
  const [details, setDetails] = useState({ name: user.name, phone: user.phone ?? '', role: user.role, orgId: user.orgId, investedMasterGuide: !!user.investedMasterGuide });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const keys = ['name', 'phone', ...(admin ? ['role', 'orgId', 'investedMasterGuide'] as const : [])] as const;
  const changes = Object.fromEntries(keys.filter(key => details[key] !== (key === 'phone' ? user.phone ?? '' : key === 'investedMasterGuide' ? !!user.investedMasterGuide : user[key])).map(key => [key, details[key]])) as Partial<AuthUser>;
  const dirty = Object.keys(changes).length > 0;
  const organization = organizations.find(org => org.id === user.orgId);
  const lastAdmin = user.role === 'Super Admin' && staffUsers.filter(account => account.role === 'Super Admin').length <= 1;
  const inputClass = 'mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900/10';
  function change<K extends keyof typeof details>(key: K, value: typeof details[K]) {
    setSaved(false); setDetails(previous => ({ ...previous, [key]: value }));
  }
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || !dirty) return;
    setSaving(true); setSaved(false); setError('');
    try {
      await updateStaffUser(user.id, changes);
      setDetails(previous => ({ ...previous, name: previous.name.trim(), phone: previous.phone.trim() }));
      setSaved(true);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(code === 'permission-denied' ? 'Access was denied. Check that you are signed in with permission to edit this profile.' : code === 'invalid-user' || code === 'last-admin' ? (err as Error).message : 'The profile could not be saved. Check your connection and try again.');
    } finally { setSaving(false); }
  };
  const saveButton = (label: string) => <button type="submit" form="user-details-form" disabled={saving || !dirty} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving…' : label}</button>;

  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
      <div><button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-900"><ArrowLeft className="h-3.5 w-3.5" />Back</button><h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{ownProfile ? 'My Profile' : 'User Details'}</h1><p className="mt-1 text-xs text-slate-500">{ownProfile ? 'Keep your contact details and account information up to date.' : 'Manage this user’s contact details and organization access.'}</p></div>
      <div className="self-start sm:self-auto">{saveButton('Save Changes')}</div>
    </div>
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-950 text-xl font-extrabold text-amber-400">{user.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || <UserRound />}</div><div className="min-w-0"><h2 className="break-words text-xl font-extrabold text-slate-900">{user.name}</h2><p className="mt-1 break-all text-xs text-slate-500">{user.email}</p><p className="mt-1 break-words text-xs text-slate-500">{organization?.churchName ?? 'No church assigned'}</p></div></div>
      <div className="flex flex-wrap gap-2"><span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-900">{user.role}</span>{user.investedMasterGuide && <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"><Award className="h-3.5 w-3.5" />Master Guide</span>}</div>
    </div>
    <form id="user-details-form" onSubmit={save} className="space-y-6" aria-busy={saving}>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="h-4 w-4" />Profile saved.</p>}
      <fieldset disabled={saving} className="grid min-w-0 grid-cols-1 items-start gap-6 disabled:opacity-70 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <ProfileSection title="Personal & contact information" description="How your name and contact details appear to club leaders." icon={UserRound}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="block text-xs font-semibold text-slate-700">Display name *<input required pattern={'.*\\S.*'} value={details.name} onChange={event => change('name', event.target.value)} autoComplete="name" className={inputClass} /></label><label className="block text-xs font-semibold text-slate-700">Phone number<input type="tel" value={details.phone} onChange={event => change('phone', event.target.value)} autoComplete="tel" className={inputClass} /></label></div>
          </ProfileSection>
          <ProfileSection title="Sign-in & account" description="The email address connected to this login." icon={ShieldCheck}>
            <label className="block text-xs font-semibold text-slate-700">Sign-in email<input type="email" readOnly value={user.email} className={`${inputClass} text-slate-500`} /></label>
            <p className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500"><Mail className="mt-0.5 h-4 w-4 shrink-0" />Your sign-in email is managed separately from profile details.</p>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account ID</p><p className="mt-1 break-all font-mono text-xs text-slate-500">{user.id}</p></div>
          </ProfileSection>
        </div>
        <ProfileSection title="Organization & access" description="Church assignment, role, and leadership status." icon={Building2}>
          {admin ? <>
            <label className="block text-xs font-semibold text-slate-700">Assigned church<select className={inputClass} value={details.orgId} onChange={event => change('orgId', event.target.value)}><option value="" disabled>Choose a church</option>{details.orgId && !organizations.some(org => org.id === details.orgId) && <option value={details.orgId}>Previous church (unavailable)</option>}{organizations.map(org => <option key={org.id} value={org.id}>{org.churchName}</option>)}</select></label>
            <label className="block text-xs font-semibold text-slate-700">Role<select className={inputClass} disabled={lastAdmin} value={details.role} onChange={event => change('role', event.target.value as UserRole)}>{USER_ROLES.map(role => <option key={role}>{role}</option>)}</select></label>
            {lastAdmin && <p className="text-xs leading-relaxed text-amber-700">Promote another Super Admin before changing this account’s role.</p>}
            <label className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-xs font-semibold text-slate-700"><input type="checkbox" checked={details.investedMasterGuide} onChange={event => change('investedMasterGuide', event.target.checked)} className="mt-0.5 accent-blue-900" />Invested Master Guide</label>
          </> : <>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned church</p><p className="mt-1 break-words text-sm font-semibold text-slate-800">{organization?.churchName ?? 'No church assigned'}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Role</p><p className="mt-1 text-sm font-semibold text-slate-800">{user.role}</p></div>
            <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Master Guide status</p><p className="mt-1 text-sm font-semibold text-slate-800">{user.investedMasterGuide ? 'Invested Master Guide' : 'Not recorded'}</p></div>
            <p className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">Contact a Super Admin to update your role, church assignment, or Master Guide status.</p>
          </>}
          {organization && <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500"><p className="break-words"><strong className="text-slate-700">District:</strong> {organization.districtName}</p><p className="break-words"><strong className="text-slate-700">Mission:</strong> {organization.missionName}</p></div>}
        </ProfileSection>
      </fieldset>
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:px-6"><p aria-live="polite" className="text-xs text-slate-500">{saving ? 'Saving profile…' : dirty ? 'You have unsaved changes' : 'Profile details are up to date'}</p><div className="flex justify-end gap-2"><button type="button" onClick={onBack} className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Back</button>{saveButton('Save Profile')}</div></div>
    </form>
  </div>;
};

export const UserDetailPage: React.FC<{ userId: string; onBack: () => void }> = ({ userId, onBack }) => {
  const { currentUser, staffUsers, staffUsersLoading, staffUsersError } = useClub();
  const permitted = !!currentUser && (currentUser.id === userId || currentUser.role === 'Super Admin');
  const user = permitted ? (currentUser?.id === userId ? currentUser : staffUsers.find(account => account.id === userId)) : undefined;
  if (!user) return <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8"><button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500"><ArrowLeft className="h-4 w-4" />Back</button><p role={staffUsersError && permitted ? 'alert' : 'status'} className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">{!permitted ? 'You do not have permission to view this user profile.' : staffUsersLoading ? 'Loading user profile…' : staffUsersError || 'This user is no longer available.'}</p></div>;
  return <UserDetailForm key={user.id} user={user} onBack={onBack} />;
};
