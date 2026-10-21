import React, { useState } from 'react';
import { UserCog, ShieldAlert, Trash2, Save } from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { AuthUser, UserRole } from '../types/club';

const ALL_ROLES: UserRole[] = [
  'Super Admin',
  'Mission Youth Director',
  'District Coordinator',
  'Church Pastor',
  'Club Director',
  'Club Secretary',
  'Unit Counselor',
  'Parent / Member',
];

export const SuperAdminPage: React.FC = () => {
  const { staffUsers, organizations, currentUser, updateStaffUser, deleteStaffUser } = useClub();
  const [editedRows, setEditedRows] = useState<Record<string, Partial<AuthUser>>>({});

  const superAdminCount = staffUsers.filter(u => u.role === 'Super Admin').length;

  const getValue = (user: AuthUser, field: 'role' | 'orgId'): string =>
    (editedRows[user.id]?.[field] as string | undefined) ?? user[field];

  const setPendingChange = (userId: string, field: 'role' | 'orgId', value: string) => {
    setEditedRows(prev => ({ ...prev, [userId]: { ...prev[userId], [field]: value } }));
  };

  const hasPendingChange = (userId: string) => !!editedRows[userId];

  const handleSave = (user: AuthUser) => {
    const changes = editedRows[user.id];
    if (!changes) return;
    updateStaffUser(user.id, changes);
    setEditedRows(prev => {
      const next = { ...prev };
      delete next[user.id];
      return next;
    });
  };

  const handleDelete = (user: AuthUser) => {
    if (user.id === currentUser?.id && superAdminCount <= 1) {
      alert("You're the only Super Admin — removing your own access would lock everyone out. Promote another account first.");
      return;
    }
    if (window.confirm(`Remove ${user.name}'s profile? They will lose all app access immediately. (Their Firebase Auth login itself isn't deleted — only the app profile.)`)) {
      deleteStaffUser(user.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center">
          <UserCog className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Users</h1>
          <p className="text-xs text-slate-500 mt-1">
            Platform-wide leader accounts, across every church and district — Super Admin only.
          </p>
        </div>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          Changing a role or church here takes effect immediately for that leader. Removing a user deletes their app profile (so they lose all access) but does not delete their underlying Firebase Auth login — do that from the Firebase Console if needed.
        </span>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">Leader</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Assigned Church</th>
                <th className="py-2.5 px-4">Contact</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {user.name}
                    {user.id === currentUser?.id && (
                      <span className="ml-1.5 text-[10px] font-semibold text-blue-700">(you)</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={getValue(user, 'role')}
                      onChange={(e) => setPendingChange(user.id, 'role', e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded-md text-xs font-semibold text-blue-900 bg-white focus:outline-hidden"
                    >
                      {ALL_ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={getValue(user, 'orgId')}
                      onChange={(e) => setPendingChange(user.id, 'orgId', e.target.value)}
                      className="px-2 py-1 border border-slate-300 rounded-md text-xs text-slate-800 bg-white focus:outline-hidden"
                    >
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.churchName}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{user.email}</div>
                    <span className="font-mono text-[11px] text-slate-500">{user.phone || 'N/A'}</span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {hasPendingChange(user.id) && (
                      <button
                        onClick={() => handleSave(user)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 mr-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md text-[11px]"
                      >
                        <Save className="w-3 h-3" />
                        Save
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {staffUsers.length === 0 && (
          <div className="text-center py-10 text-xs text-slate-400">No leader accounts found.</div>
        )}
      </div>
    </div>
  );
};
