import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  QrCode, 
  ShieldAlert, 
  FileSpreadsheet, 
  CheckCircle, 
  Printer, 
  ExternalLink, 
  UserCheck,
  Pencil
} from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { ClubBranch, Member } from '../types/club';
import { EditMemberModal } from './EditMemberModal';

interface MemberDirectoryProps {
  onSelectMemberPass: (member: Member) => void;
  onGoToRegister: () => void;
}

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({ 
  onSelectMemberPass,
  onGoToRegister 
}) => {
  const { members, units, currentUser, currentOrgId } = useClub();
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  React.useEffect(() => { setEditingMember(null); setSaveMessage(''); }, [currentOrgId, currentUser?.id]);
  const canEdit = (member: Member) => !!currentUser && currentUser.role !== 'Parent / Member' && (
    currentUser.orgId === member.orgId || ['Super Admin', 'Mission Youth Director', 'District Coordinator'].includes(currentUser.role)
  );
  const [selectedBranch, setSelectedBranch] = useState<'All' | ClubBranch>('All');
  const [selectedUnit, setSelectedUnit] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMedicalRoster, setShowMedicalRoster] = useState(false);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (selectedBranch !== 'All' && m.branch !== selectedBranch) return false;
      if (selectedUnit !== 'All' && m.unitId !== selectedUnit) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${m.firstName} ${m.lastName}`.toLowerCase().includes(q);
        const matchesReg = m.registrationNumber.toLowerCase().includes(q);
        const matchesClass = m.className.toLowerCase().includes(q);
        const matchesParent = m.parentName.toLowerCase().includes(q);
        if (!matchesName && !matchesReg && !matchesClass && !matchesParent) return false;
      }
      return true;
    });
  }, [members, selectedBranch, selectedUnit, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Club Member Directory & Digital ID Passes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access member contact rosters, unit counselors, emergency forms, and digital check-in passes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMedicalRoster(!showMedicalRoster)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>{showMedicalRoster ? 'Show Standard Directory' : 'Camporee Safety & Medical Sheet'}</span>
          </button>
          <button
            onClick={onGoToRegister}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition-colors"
          >
            <span>+ Enroll Member</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      {saveMessage && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{saveMessage}</p>}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Branch Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['All', 'Pathfinders', 'Adventurers', 'Staff'] as const).map(b => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  selectedBranch === b 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Unit Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Unit:</span>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-blue-900 focus:outline-hidden"
            >
              <option value="All">All Club Units</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, pass ID, class, parent name..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Camporee Medical Sheet View */}
      {showMedicalRoster ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Official Camporee Emergency Health & Medical Sheet
              </h2>
              <p className="text-xs text-slate-500">
                Printable confidential manifest for club nurse, directors, and campout first aid officer.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-900 text-white rounded-lg"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Medical Manifest
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="py-2.5 px-3">Youth Name</th>
                  <th className="py-2.5 px-3">Class & Unit</th>
                  <th className="py-2.5 px-3">Emergency Contact</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Known Allergies</th>
                  <th className="py-2.5 px-3">Medical / Meds</th>
                  <th className="py-2.5 px-3">Swim Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {m.firstName} {m.lastName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {m.className} ({m.unitName || 'Unassigned'})
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">
                      {m.emergencyContact} ({m.emergencyRelation})
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-900">
                      {m.emergencyPhone}
                    </td>
                    <td className="py-2.5 px-3">
                      {m.allergies && m.allergies !== 'None' ? (
                        <span className="font-bold text-rose-700">{m.allergies}</span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {m.medicalConditions && m.medicalConditions !== 'None reported' ? m.medicalConditions : 'None'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {m.swimmingAbility || 'Beginner'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Member Card Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              <p className="font-semibold text-sm">No members found matching your search.</p>
              <p className="text-xs text-slate-400 mt-1">Try switching filters or enrolling a new member.</p>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div 
                key={member.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-xs ${
                        member.branch === 'Pathfinders' 
                          ? 'bg-blue-100 text-blue-900' 
                          : member.branch === 'Adventurers'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">
                          {member.firstName} {member.lastName}
                        </h3>
                        <span className="font-mono text-xs text-slate-500">
                          {member.registrationNumber}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      member.registrationStatus === 'Approved'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : member.registrationStatus === 'Pending Review'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {member.registrationStatus}
                    </span>
                  </div>

                  {/* Attributes */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Class & Branch:</span>
                      <strong className="text-slate-800">{member.className} · {member.branch}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Unit:</span>
                      <span className="text-slate-800 font-medium">{member.unitName || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Parent:</span>
                      <span className="text-slate-800 truncate max-w-[160px]">{member.parentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Emergency Phone:</span>
                      <span className="font-mono text-slate-800">{member.emergencyPhone}</span>
                    </div>
                    {member.allergies && member.allergies !== 'None' && (
                      <div className="flex items-center gap-1 text-rose-700 pt-1 text-[11px]">
                        <ShieldAlert className="w-3 h-3 shrink-0" />
                        <span className="truncate">Allergy: {member.allergies}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Uniform: {member.uniformSize}
                  </span>
                  {canEdit(member) && (
                    <button onClick={() => { setSaveMessage(''); setEditingMember(member); }}
                      aria-label={`Edit details for ${member.firstName} ${member.lastName}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                      <Pencil className="h-3.5 w-3.5" /> Edit Details
                    </button>
                  )}
                  <button
                    onClick={() => onSelectMemberPass(member)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Pass & QR</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {editingMember && canEdit(editingMember) && (
        <EditMemberModal key={editingMember.id} member={editingMember}
          onClose={() => setEditingMember(null)}
          onSaved={() => { setEditingMember(null); setSaveMessage('Member details saved.'); }} />
      )}
    </div>
  );
};
