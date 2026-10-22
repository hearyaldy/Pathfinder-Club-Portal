import React, { useState } from 'react';
import { UserCog, ShieldAlert, Trash2, Pencil, Search, Users, ShieldCheck, Building2 } from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { AuthUser, USER_ROLES } from '../types/club';

export const SuperAdminPage: React.FC<{ onViewUser: (user: AuthUser) => void }> = ({ onViewUser }) => {
  const { staffUsers, staffUsersLoading, staffUsersError, organizations, currentUser, deleteStaffUser } = useClub();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [deleting, setDeleting] = useState('');
  const [error, setError] = useState('');
  const superAdminCount = staffUsers.filter(user => user.role === 'Super Admin').length;
  const visibleUsers = staffUsers.filter(user => (roleFilter === 'All' || user.role === roleFilter) && [user.name, user.email, user.phone, organizations.find(org => org.id === user.orgId)?.churchName].some(value => value?.toLowerCase().includes(search.trim().toLowerCase())));
  const handleDelete = async (user: AuthUser) => {
    if (deleting) return;
    if (!window.confirm(`Remove ${user.name}’s app profile? They will lose app access. Their sign-in account will remain.`)) return;
    setDeleting(user.id); setError('');
    try { await deleteStaffUser(user.id); }
    catch (err) { setError((err as { code?: string })?.code === 'last-admin' ? (err as Error).message : 'This user could not be removed. Check your connection and permissions, then try again.'); }
    finally { setDeleting(''); }
  };

  if (currentUser?.role !== 'Super Admin') return <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500">Only a Super Admin can manage user accounts.</div>;
  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <div className="flex items-center gap-3 border-b border-slate-200 pb-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-amber-400"><UserCog className="h-5 w-5" /></div><div><h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Manage Users</h1><p className="mt-1 text-xs text-slate-500">Find an account and open its profile to edit contact details, church assignment, and access.</p></div></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{[{ label: 'User accounts', value: staffUsers.length, icon: Users }, { label: 'Super Admins', value: superAdminCount, icon: ShieldCheck }, { label: 'Churches with users', value: new Set(staffUsers.map(user => user.orgId).filter(Boolean)).size, icon: Building2 }].map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><Icon className="h-5 w-5 text-blue-900" /><div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{staffUsersLoading ? '—' : value}</p></div></div>)}</div>
    <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />Role and church changes apply when saved. Removing a profile revokes app access; the sign-in account remains. Keep at least one Super Admin.</p>
    {(error || staffUsersError) && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error || staffUsersError}</p>}
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="block min-w-0 flex-1 text-xs font-semibold text-slate-700">Search users<div className="relative mt-1.5"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name, email, phone, or church" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-900/10" /></div></label><label className="block text-xs font-semibold text-slate-700">Filter by role<select value={roleFilter} onChange={event => setRoleFilter(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="All">All roles</option>{USER_ROLES.map(role => <option key={role}>{role}</option>)}</select></label></div>
      {staffUsersLoading ? <p role="status" className="py-10 text-center text-sm text-slate-500">Loading user accounts…</p> : <>
        <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">{['User', 'Role', 'Assigned church', 'Contact', 'Actions'].map(label => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visibleUsers.map(user => <tr key={user.id} className="hover:bg-slate-50/60"><td className="px-4 py-4"><button type="button" onClick={() => onViewUser(user)} className="text-left font-bold text-blue-900 hover:underline">{user.name}</button>{user.id === currentUser.id && <span className="ml-1.5 text-[10px] font-semibold text-slate-400">You</span>}{user.investedMasterGuide && <p className="mt-1 text-[10px] font-semibold text-amber-700">Invested Master Guide</p>}</td><td className="px-4 py-4 font-semibold text-slate-700">{user.role}</td><td className="px-4 py-4 text-slate-600">{organizations.find(org => org.id === user.orgId)?.churchName ?? 'No church assigned'}</td><td className="px-4 py-4 text-slate-600"><p>{user.email}</p><p className="mt-1">{user.phone || 'No phone recorded'}</p></td><td className="whitespace-nowrap px-4 py-4"><button type="button" onClick={() => onViewUser(user)} aria-label={`Edit profile for ${user.name}`} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 font-semibold text-blue-900 hover:bg-blue-100"><Pencil className="h-3.5 w-3.5" />Edit details</button><button type="button" onClick={() => handleDelete(user)} disabled={!!deleting || (user.role === 'Super Admin' && superAdminCount <= 1)} aria-label={`Remove user ${user.name}`} title={user.role === 'Super Admin' && superAdminCount <= 1 ? 'Keep at least one Super Admin' : 'Remove app profile'} className="ml-2 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>
        {!staffUsersError && visibleUsers.length === 0 && <p className="py-10 text-center text-sm text-slate-500">{staffUsers.length ? 'No users match your search.' : 'No user accounts found.'}</p>}
      </>}
    </div>
  </div>;
};
