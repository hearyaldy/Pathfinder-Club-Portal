import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  X, 
  ShieldAlert, 
  DollarSign, 
  UserCheck, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { formatMemberDues } from '../utils/currency';
import { Member, RegistrationStatus, ClubBranch } from '../types/club';

export const ChurchAdminDashboard: React.FC = () => {
  const { 
    members, currentOrg, clubs, allUnits,
    units, 
    updateMemberStatus, 
    assignUnit, 
    toggleDuesPaid, 
    deleteMember 
  } = useClub();

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All' | RegistrationStatus>('All');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<'All' | ClubBranch>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = members.length;
    const pending = members.filter(m => m.registrationStatus === 'Pending Review').length;
    const approved = members.filter(m => m.registrationStatus === 'Approved').length;
    const needsClarification = members.filter(m => m.registrationStatus === 'Needs Clarification').length;
    const duesPaidCount = members.filter(m => m.duesPaid).length;
    const medicalAlertCount = members.filter(m => 
      (m.allergies && m.allergies !== 'None') || 
      (m.medicalConditions && m.medicalConditions !== 'None' && m.medicalConditions !== 'None reported')
    ).length;

    return { total, pending, approved, needsClarification, duesPaidCount, medicalAlertCount };
  }, [members]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // Status filter
      if (selectedStatusFilter !== 'All' && m.registrationStatus !== selectedStatusFilter) {
        return false;
      }
      // Branch filter
      if (selectedBranchFilter !== 'All' && m.branch !== selectedBranchFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = `${m.firstName} ${m.lastName}`.toLowerCase().includes(query);
        const matchesReg = m.registrationNumber.toLowerCase().includes(query);
        const matchesParent = m.parentName.toLowerCase().includes(query);
        const matchesClass = m.className.toLowerCase().includes(query);
        if (!matchesName && !matchesReg && !matchesParent && !matchesClass) {
          return false;
        }
      }
      return true;
    });
  }, [members, selectedStatusFilter, selectedBranchFilter, searchQuery]);

  const openReviewModal = (member: Member) => {
    setSelectedMember(member);
    setReviewNote(member.statusNotes || '');
  };

  const closeReviewModal = () => {
    setSelectedMember(null);
    setReviewNote('');
  };

  const handleUpdateStatus = (memberId: string, status: RegistrationStatus) => {
    updateMemberStatus(memberId, status, reviewNote);
    if (selectedMember && selectedMember.id === memberId) {
      setSelectedMember(prev => prev ? { ...prev, registrationStatus: status, statusNotes: reviewNote } : null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Church Leadership Review & Registration Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maranatha Pathfinder & Adventurer Club · Official Church Board & Directorate Review
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Total In System: <strong className="font-mono text-slate-900">{members.length}</strong>
          </span>
        </div>
      </div>

      {/* KPI Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
            Total Enrolled
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {metrics.total}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Adventurer & PF</span>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs transition-colors ${
          metrics.pending > 0 
            ? 'bg-amber-50/60 border-amber-300' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-900 block uppercase tracking-wider">
              Pending Review
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-950 mt-1 block">
            {metrics.pending}
          </span>
          <span className="text-[11px] text-amber-800 mt-0.5 block">Awaiting board sign-off</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Approved Active
            </span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
            {metrics.approved}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Eligible for events</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Needs Info
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-blue-800 mt-1 block">
            {metrics.needsClarification}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Follow-up requested</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Club Dues Paid
            </span>
            <DollarSign className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {metrics.duesPaidCount}/{metrics.total}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {metrics.total > 0 ? `${Math.round((metrics.duesPaidCount / metrics.total) * 100)}% Paid` : '0%'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Health Alerts
            </span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-rose-700 mt-1 block">
            {metrics.medicalAlertCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Asthma / Allergies</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs (Interactive Segmented Buttons) */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg shrink-0 no-scrollbar">
            {(['All', 'Pending Review', 'Approved', 'Needs Clarification', 'Archived'] as const).map((st) => {
              const count = st === 'All' 
                ? members.length 
                : members.filter(m => m.registrationStatus === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    selectedStatusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{st === 'All' ? 'All Applications' : st}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedStatusFilter === st 
                      ? 'bg-slate-100 text-slate-900' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Branch filter pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-slate-500 font-medium mr-1">Branch:</span>
            {(['All', 'Adventurers', 'Pathfinders', 'Staff'] as const).map((br) => (
              <button
                key={br}
                onClick={() => setSelectedBranchFilter(br)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedBranchFilter === br
                    ? 'bg-blue-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {br}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by youth name, parent contact, registration number, or class..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Roster / Application Review Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Youth Member</th>
                <th className="py-3 px-4">Branch & Class</th>
                <th className="py-3 px-4">Unit Assignment</th>
                <th className="py-3 px-4">Parent & Contact</th>
                <th className="py-3 px-4">Health / Flags</th>
                <th className="py-3 px-4">Dues</th>
                <th className="py-3 px-4">Registration Status</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-sm">No applications match your filter.</p>
                    <p className="text-xs text-slate-400 mt-1">Try switching status tabs or clearing your search query.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const hasHealthAlert = (member.allergies && member.allergies !== 'None') ||
                    (member.medicalConditions && member.medicalConditions !== 'None' && member.medicalConditions !== 'None reported');

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            member.branch === 'Pathfinders' 
                              ? 'bg-blue-100 text-blue-900' 
                              : member.branch === 'Adventurers'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {member.firstName[0]}{member.lastName[0]}
                          </div>
                          <div>
                            <button
                              onClick={() => openReviewModal(member)}
                              className="font-bold text-slate-900 hover:text-blue-900 text-left block"
                            >
                              {member.firstName} {member.lastName}
                            </button>
                            <span className="font-mono text-[11px] text-slate-500">
                              {member.registrationNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Branch & Class */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{member.className}</span>
                        <span className="text-[11px] text-slate-500">{member.branch}</span>
                      </td>

                      {/* Unit Assignment */}
                      <td className="py-3 px-4">
                        <select
                          value={member.unitId || ''}
                          onChange={(e) => assignUnit(member.id, e.target.value)}
                          className="px-2 py-1 text-xs border border-slate-300 rounded-md bg-white text-slate-800 focus:ring-1 focus:ring-blue-900 focus:outline-hidden"
                        >
                          <option value="">Unassigned</option>
                          {units.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Parent Contact */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 block truncate max-w-[140px]">
                          {member.parentName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 block">
                          {member.parentPhone}
                        </span>
                      </td>

                      {/* Health Flags */}
                      <td className="py-3 px-4">
                        {hasHealthAlert ? (
                          <div className="flex items-center gap-1.5 text-rose-700" title={`${member.allergies} | ${member.medicalConditions}`}>
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[11px] font-medium truncate max-w-[120px]">
                              {member.allergies !== 'None' ? member.allergies : member.medicalConditions}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Clear</span>
                        )}
                      </td>

                      {/* Dues */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleDuesPaid(member.id)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                            member.duesPaid
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {member.duesPaid ? `${formatMemberDues(member, currentOrg, clubs, allUnits)} Paid` : 'Unpaid'}
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            member.registrationStatus === 'Approved'
                              ? 'bg-emerald-500'
                              : member.registrationStatus === 'Pending Review'
                              ? 'bg-amber-500'
                              : member.registrationStatus === 'Needs Clarification'
                              ? 'bg-blue-500'
                              : 'bg-slate-400'
                          }`} />
                          <span className={`font-semibold ${
                            member.registrationStatus === 'Approved'
                              ? 'text-emerald-700'
                              : member.registrationStatus === 'Pending Review'
                              ? 'text-amber-800'
                              : member.registrationStatus === 'Needs Clarification'
                              ? 'text-blue-800'
                              : 'text-slate-500'
                          }`}>
                            {member.registrationStatus}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {member.registrationStatus !== 'Approved' && (
                            <button
                              onClick={() => handleUpdateStatus(member.id, 'Approved')}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-xs transition-colors flex items-center gap-1"
                              title="Approve membership application"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}
                          <button
                            onClick={() => openReviewModal(member)}
                            className="p-1.5 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Inspect full file"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Application Review Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-blue-950 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-400 uppercase tracking-wider font-semibold block">
                  Church Board & Directorate Inspection
                </span>
                <h3 className="font-bold text-lg text-white">
                  {selectedMember.firstName} {selectedMember.lastName}
                </h3>
                <span className="font-mono text-xs text-blue-200">
                  {selectedMember.registrationNumber} · Registered {selectedMember.registrationDate}
                </span>
              </div>
              <button
                onClick={closeReviewModal}
                className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Status Decision Strip */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-600 block">Current Status:</span>
                  <span className={`text-sm font-bold ${
                    selectedMember.registrationStatus === 'Approved'
                      ? 'text-emerald-700'
                      : selectedMember.registrationStatus === 'Pending Review'
                      ? 'text-amber-800'
                      : 'text-blue-800'
                  }`}>
                    {selectedMember.registrationStatus}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedMember.id, 'Approved')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                      selectedMember.registrationStatus === 'Approved'
                        ? 'bg-emerald-700 text-white ring-2 ring-emerald-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Application
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedMember.id, 'Needs Clarification')}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-blue-400 text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    Request Clarification
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedMember.id, 'Archived')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    Archive
                  </button>
                </div>
              </div>

              {/* Grid of Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Youth Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
                    Member Information
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Club Branch:</span>
                      <strong className="text-slate-900">{selectedMember.branch}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Class Level:</span>
                      <strong className="text-slate-900">{selectedMember.className}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Date of Birth:</span>
                      <strong className="text-slate-900">{selectedMember.dateOfBirth} ({selectedMember.gender})</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Uniform Size:</span>
                      <strong className="text-slate-900">{selectedMember.uniformSize}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Swimming Skill:</span>
                      <strong className="text-slate-900">{selectedMember.swimmingAbility || 'Beginner'}</strong>
                    </div>
                  </div>
                </div>

                {/* Parent & Contact */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
                    Parent & Contact Details
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Parent / Guardian:</span>
                      <strong className="text-slate-900">{selectedMember.parentName}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Phone:</span>
                      <strong className="font-mono text-slate-900">{selectedMember.parentPhone}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Email:</span>
                      <span className="text-slate-900">{selectedMember.parentEmail || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Emergency Contact:</span>
                      <strong className="text-slate-900">{selectedMember.emergencyContact} ({selectedMember.emergencyPhone})</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Home Address:</span>
                      <span className="text-slate-800 text-right">{selectedMember.homeAddress || 'Springfield, OR'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health, Medical & Safety */}
              <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-lg space-y-2">
                <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Health & Medical Alerts for Camporee / Honors
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-rose-950">
                  <div>
                    <span className="text-rose-700 block font-medium">Allergies:</span>
                    <strong>{selectedMember.allergies || 'None'}</strong>
                  </div>
                  <div>
                    <span className="text-rose-700 block font-medium">Medical Conditions:</span>
                    <strong>{selectedMember.medicalConditions || 'None reported'}</strong>
                  </div>
                  <div>
                    <span className="text-rose-700 block font-medium">Dietary:</span>
                    <strong>{selectedMember.dietaryRestrictions || 'None'}</strong>
                  </div>
                </div>
              </div>

              {/* Unit Assignment and Club Dues */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assign to Club Unit / Counselor
                  </label>
                  <select
                    value={selectedMember.unitId || ''}
                    onChange={(e) => {
                      assignUnit(selectedMember.id, e.target.value);
                      const unit = units.find(u => u.id === e.target.value);
                      setSelectedMember(prev => prev ? { ...prev, unitId: unit?.id, unitName: unit?.name } : null);
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  >
                    <option value="">Unassigned</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.counselorName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Club Annual Dues ({formatMemberDues(selectedMember, currentOrg, clubs, allUnits)})
                  </label>
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        toggleDuesPaid(selectedMember.id);
                        setSelectedMember(prev => prev ? { ...prev, duesPaid: !prev.duesPaid } : null);
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        selectedMember.duesPaid
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-slate-100 border-slate-300 text-slate-700'
                      }`}
                    >
                      {selectedMember.duesPaid ? `✓ Dues Paid (${formatMemberDues(selectedMember, currentOrg, clubs, allUnits)})` : `Mark as Paid (${formatMemberDues(selectedMember, currentOrg, clubs, allUnits)})`}
                    </button>
                    <span className="text-xs text-slate-500">
                      {selectedMember.duesPaid ? 'Payment on record' : 'Awaiting payment'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Leadership Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Director & Board Notes / Follow-up Tasks
                </label>
                <textarea
                  rows={2}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="e.g. Scarf issued; parent will provide doctor release for campout..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Permanently remove ${selectedMember.firstName} ${selectedMember.lastName} from the club registry?`)) {
                    deleteMember(selectedMember.id);
                    closeReviewModal();
                  }
                }}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Application
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateMemberStatus(selectedMember.id, selectedMember.registrationStatus, reviewNote);
                    closeReviewModal();
                  }}
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-lg shadow-xs"
                >
                  Save Notes & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
