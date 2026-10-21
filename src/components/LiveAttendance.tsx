import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Search, 
  QrCode, 
  Check, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Users, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ChevronDown, 
  CheckSquare, 
  FileText 
} from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { AttendanceStatus, ClubBranch, Member } from '../types/club';
import { MemberScoreModal } from './MemberScoreModal';
import { UnitLeaderboard } from './UnitLeaderboard';

interface LiveAttendanceProps {
  onOpenQrScanner: () => void;
  onViewMemberPass: (member: Member) => void;
}

export const LiveAttendance: React.FC<LiveAttendanceProps> = ({ 
  onOpenQrScanner,
  onViewMemberPass 
}) => {
  const { 
    events, 
    activeEvent, 
    activeEventId, 
    setActiveEventId, 
    members, 
    units, 
    recordAttendance, 
    markBatchAttendance, 
    getMemberAttendanceForEvent,
    getEventAttendanceStats,
    geoSettings,
    isWithinCurrentChurchGeofence,
    distanceToCurrentChurch,
    currentOrg,
    currentUser,
    canManageScoring,
    evaluationsLoading,
    evaluationsError,
    getMemberEvaluationForEvent,
  } = useClub();

  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('All');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<'All' | ClubBranch>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickNoteMemberId, setQuickNoteMemberId] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [scoringMemberId, setScoringMemberId] = useState<string | null>(null);
  const [scoreMessage, setScoreMessage] = useState('');
  React.useEffect(() => { setScoringMemberId(null); setScoreMessage(''); }, [activeEventId, currentOrg.id, currentUser?.id]);
  const scoringMember = members.find(member => member.id === scoringMemberId);

  // Attendance stats for current active event
  const stats = useMemo(() => {
    if (!activeEvent) {
      return { totalEligible: 0, present: 0, late: 0, excused: 0, absent: 0, attendanceRate: 0 };
    }
    return getEventAttendanceStats(activeEvent.id);
  }, [activeEvent, getEventAttendanceStats, members]);

  // Eligible members for active event
  const eligibleMembers = useMemo(() => {
    // Only approved members attend official club events
    let list = members.filter(m => m.registrationStatus === 'Approved');

    // Filter by event branch if restricted
    if (activeEvent && activeEvent.branch !== 'Both') {
      list = list.filter(m => m.branch === activeEvent.branch || m.branch === 'Staff');
    }

    // Filter by branch selector
    if (selectedBranchFilter !== 'All') {
      list = list.filter(m => m.branch === selectedBranchFilter);
    }

    // Filter by unit
    if (selectedUnitFilter !== 'All') {
      list = list.filter(m => m.unitId === selectedUnitFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => 
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
        m.registrationNumber.toLowerCase().includes(q) ||
        m.className.toLowerCase().includes(q) ||
        (m.unitName && m.unitName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [members, activeEvent, selectedBranchFilter, selectedUnitFilter, searchQuery]);

  const handleStatusClick = (memberId: string, status: AttendanceStatus) => {
    if (!activeEvent) return;
    recordAttendance(activeEvent.id, memberId, status, 'Fast Roster');
  };

  const handleCheckInAllUnit = () => {
    if (!activeEvent || eligibleMembers.length === 0) return;
    const memberIds = eligibleMembers.map(m => m.id);
    markBatchAttendance(activeEvent.id, memberIds, 'Present');
  };

  const handleSaveNote = (memberId: string) => {
    if (!activeEvent) return;
    const currentRec = getMemberAttendanceForEvent(activeEvent.id, memberId);
    recordAttendance(
      activeEvent.id, 
      memberId, 
      currentRec?.status || 'Present', 
      currentRec?.checkInMethod || 'Fast Roster', 
      customNote
    );
    setQuickNoteMemberId(null);
    setCustomNote('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Event Header Banner */}
      <div className="bg-blue-950 text-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-blue-950 uppercase tracking-wider">
                Live Attendance Workspace
              </span>
              <span className="text-xs text-blue-300">· Real-time sync</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {activeEvent?.title || 'No Active Event Selected'}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-blue-200 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                {activeEvent?.date || 'Today'} · {activeEvent?.time || 'Sabbath'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                {activeEvent?.location || 'Church Grounds'}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-400" />
                Branch: {activeEvent?.branch === 'Both' ? 'Pathfinders & Adventurers' : activeEvent?.branch}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Event Dropdown Switcher */}
            <div className="relative">
              <select
                value={activeEventId}
                onChange={(e) => setActiveEventId(e.target.value)}
                className="appearance-none bg-blue-900 border border-blue-700 hover:border-blue-500 text-white text-xs font-semibold py-2.5 pl-3 pr-8 rounded-xl focus:outline-hidden cursor-pointer"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id} className="text-slate-900 bg-white">
                    {evt.title} ({evt.date})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-blue-300 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Launch QR Scanner */}
            <button
              onClick={onOpenQrScanner}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch QR Scanner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Geofence Status Banner */}
      {geoSettings.enforceAttendanceGeofence ? (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
          isWithinCurrentChurchGeofence
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-amber-50 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center gap-2.5">
            <MapPin className={`w-4 h-4 ${isWithinCurrentChurchGeofence ? 'text-emerald-600' : 'text-amber-600'}`} />
            <div>
              <strong className="block font-bold">
                {isWithinCurrentChurchGeofence 
                  ? 'On-Site Geofence Verified' 
                  : 'Remote Location Alert — Outside Event Boundary'}
              </strong>
              <span className="text-[11px] opacity-90">
                {distanceToCurrentChurch !== null
                  ? `${distanceToCurrentChurch} miles from ${currentOrg.churchName} (Boundary: 800m).`
                  : 'Location not detected. Physical on-site attendance active.'}
              </span>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
            isWithinCurrentChurchGeofence ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
          }`}>
            {isWithinCurrentChurchGeofence ? 'Verified On-Site' : 'Remote Override Allowed'}
          </span>
        </div>
      ) : distanceToCurrentChurch !== null && (
        <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-900" />
            <span>
              Your current distance from <strong>{currentOrg.churchName}</strong>: <strong className="font-mono text-slate-900">{distanceToCurrentChurch} miles</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Geofencing tracking active
          </span>
        </div>
      )}

      {/* Real-time Attendance Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Attendance Rate */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
            Attendance Rate
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-blue-900">
              {stats.attendanceRate}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({stats.present + stats.late}/{stats.totalEligible})
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(stats.attendanceRate, 100)}%` }}
            />
          </div>
        </div>

        {/* Present */}
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-900 block uppercase tracking-wider">
              Present On-Time
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-800 mt-1 block">
            {stats.present}
          </span>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">Checked in</span>
        </div>

        {/* Late */}
        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-900 block uppercase tracking-wider">
              Late Arrivals
            </span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-amber-900 mt-1 block">
            {stats.late}
          </span>
          <span className="text-[11px] text-amber-700 mt-0.5 block">After opening flag</span>
        </div>

        {/* Excused */}
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-900 block uppercase tracking-wider">
              Excused Absence
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-2xl font-bold font-mono text-blue-800 mt-1 block">
            {stats.excused}
          </span>
          <span className="text-[11px] text-blue-700 mt-0.5 block">Prior parent notice</span>
        </div>

        {/* Not Checked In */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
              Not Checked In
            </span>
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-bold font-mono text-slate-700 mt-1 block">
            {stats.absent}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting arrival</span>
        </div>

        {/* Total Eligible */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
            Eligible Roster
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {stats.totalEligible}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Approved members</span>
        </div>
      </div>

      {/* Roster Controls & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Unit Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg shrink-0 no-scrollbar">
            <button
              onClick={() => setSelectedUnitFilter('All')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedUnitFilter === 'All'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Units
            </button>
            {units.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUnitFilter(u.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedUnitFilter === u.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>

          {/* Batch Action button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCheckInAllUnit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
              title="Mark all currently filtered members as Present"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Mark Filtered as Present ({eligibleMembers.length})</span>
            </button>
          </div>
        </div>

        {/* Search input & Branch filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search roster by youth name, class, pass code, or unit..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {(['All', 'Pathfinders', 'Adventurers', 'Staff'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBranchFilter(b)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  selectedBranchFilter === b
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster Live Attendance Table */}
      {scoreMessage && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{scoreMessage}</p>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Branch & Class</th>
                <th className="py-3 px-4">Unit / Counselor</th>
                <th className="py-3 px-4">Current Status & Timestamp</th>
                <th className="py-3 px-4 text-center">Real-Time Attendance Buttons</th>
                {canManageScoring && <th className="py-3 px-4">Event score</th>}
                <th className="py-3 px-4 text-right">Pass / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {eligibleMembers.length === 0 ? (
                <tr>
                  <td colSpan={canManageScoring ? 7 : 6} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-sm">No members found in this unit or search view.</p>
                    <p className="text-xs text-slate-400 mt-1">Make sure members are approved in the Church Review queue.</p>
                  </td>
                </tr>
              ) : (
                eligibleMembers.map((member) => {
                  const record = activeEvent ? getMemberAttendanceForEvent(activeEvent.id, member.id) : undefined;
                  const currentStatus: AttendanceStatus = record ? record.status : 'Absent';
                  const evaluation = activeEvent && !evaluationsLoading && !evaluationsError ? getMemberEvaluationForEvent(activeEvent.id, member.id) : undefined;

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
                            <span className="font-bold text-slate-900 block">
                              {member.firstName} {member.lastName}
                            </span>
                            <span className="font-mono text-[11px] text-slate-500">
                              {member.registrationNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{member.className}</span>
                        <span className="text-[11px] text-slate-500">{member.branch}</span>
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-4">
                        <span className="text-slate-800 font-medium block">
                          {member.unitName || 'Unassigned'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {units.find(u => u.id === member.unitId)?.counselorName || ''}
                        </span>
                      </td>

                      {/* Status & Timestamp */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-500 ring-2 ring-emerald-200'
                              : currentStatus === 'Late'
                              ? 'bg-amber-500 ring-2 ring-amber-200'
                              : currentStatus === 'Excused'
                              ? 'bg-blue-500'
                              : 'bg-slate-300'
                          }`} />
                          <span className={`font-bold ${
                            currentStatus === 'Present'
                              ? 'text-emerald-700'
                              : currentStatus === 'Late'
                              ? 'text-amber-800'
                              : currentStatus === 'Excused'
                              ? 'text-blue-800'
                              : 'text-slate-400'
                          }`}>
                            {currentStatus === 'Absent' ? 'Not Checked In' : currentStatus}
                          </span>
                        </div>
                        {record?.checkInTime && (
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            At {record.checkInTime} ({record.checkInMethod})
                          </span>
                        )}
                        {record?.notes && (
                          <span className="text-[10px] text-slate-600 italic block">
                            Note: {record.notes}
                          </span>
                        )}
                      </td>

                      {/* Fast 1-Click Status Toggles */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusClick(member.id, 'Present')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:border-emerald-400'
                            }`}
                            title="Mark Present on time"
                          >
                            Present
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusClick(member.id, 'Late')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
                              currentStatus === 'Late'
                                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50 hover:border-amber-400'
                            }`}
                            title="Mark Late arrival"
                          >
                            Late
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusClick(member.id, 'Excused')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
                              currentStatus === 'Excused'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:border-blue-400'
                            }`}
                            title="Mark Excused absence"
                          >
                            Excused
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusClick(member.id, 'Absent')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
                              currentStatus === 'Absent'
                                ? 'bg-slate-200 text-slate-800 border-slate-300'
                                : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                            }`}
                            title="Clear / Mark Absent"
                          >
                            Absent
                          </button>
                        </div>
                      </td>

                      {/* Pass Modal / Note trigger */}
                      {canManageScoring && <td className="py-3 px-4">
                        <button type="button" disabled={!activeEvent || evaluationsLoading || !!evaluationsError} aria-label={`Score ${member.firstName} ${member.lastName}`}
                          onClick={() => { setScoreMessage(''); setScoringMemberId(member.id); }} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100 disabled:opacity-50">
                          {evaluation ? `${evaluation.totalScore}/${evaluation.maxScore} · Edit` : 'Score'}
                        </button>
                      </td>}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setQuickNoteMemberId(member.id);
                              setCustomNote(record?.notes || '');
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Add attendance remark or late reason"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onViewMemberPass(member)}
                            className="p-1.5 text-blue-900 hover:bg-blue-50 rounded-md transition-colors font-medium text-xs flex items-center gap-1"
                            title="View member digital pass and QR"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Pass</span>
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

      {/* Attendance Remark Note Modal */}
      <UnitLeaderboard />
      {scoringMember && activeEvent && canManageScoring && <MemberScoreModal key={`${activeEvent.id}_${scoringMember.id}`} event={activeEvent} member={scoringMember}
        onClose={() => setScoringMemberId(null)} onSaved={() => { setScoringMemberId(null); setScoreMessage('Scores saved.'); }} />}
      {quickNoteMemberId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 max-w-md w-full">
            <h4 className="font-bold text-sm text-slate-900 mb-1">
              Add Attendance Note
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Record reason for late arrival, uniform discrepancy, or parent notification.
            </p>
            <input
              type="text"
              autoFocus
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Arrived late due to Sabbath School; parent excused"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setQuickNoteMemberId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveNote(quickNoteMemberId)}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-900 text-white rounded-lg shadow-xs"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
