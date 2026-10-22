import React, { useState } from 'react';
import { Printer, FileBarChart } from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { UnitBreakdownRow } from '../types/club';

const StatCard: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 print:border-slate-300">
    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">{label}</span>
    <strong className="text-2xl font-mono font-bold text-slate-900 block mt-1">{value}</strong>
    {sub && <span className="text-[11px] text-slate-500 block mt-0.5">{sub}</span>}
  </div>
);

const BreakdownTable: React.FC<{ rows: UnitBreakdownRow[] }> = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
          <th className="py-2 px-3">Unit</th>
          <th className="py-2 px-3">Members</th>
          <th className="py-2 px-3">Approved</th>
          <th className="py-2 px-3">Attendance</th>
          <th className="py-2 px-3">Member Eval.</th>
          <th className="py-2 px-3">Drill</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map(row => (
          <tr key={row.unitId}>
            <td className="py-2 px-3 font-semibold text-slate-900">{row.unitName}<span className="block text-[10px] text-slate-500">{row.branch}</span></td>
            <td className="py-2 px-3">{row.memberCount}</td>
            <td className="py-2 px-3">{row.approvedCount}</td>
            <td className="py-2 px-3">{row.attendanceRate}%</td>
            <td className="py-2 px-3">{row.memberEvaluationCount > 0 ? `${row.memberEvaluationAverageScore}/${row.memberEvaluationAverageMaxScore} (${row.memberEvaluationAveragePercentage}%)` : '—'}</td>
            <td className="py-2 px-3">{row.drillEvaluationCount > 0 ? `${row.drillAverageScore}/${row.drillAverageMaxScore} (${row.drillAveragePercentage}%)` : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ReportPage: React.FC = () => {
  const { currentOrg, clubs, allDivisions, allUnits, getScopeReport } = useClub();

  const [clubId, setClubId] = useState(clubs[0]?.id ?? '');
  const [divisionId, setDivisionId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  React.useEffect(() => {
    if (!clubs.some(club => club.id === clubId)) {
      setClubId(clubs[0]?.id ?? '');
      setDivisionId('');
      setUnitId('');
    }
  }, [clubs, clubId]);

  const divisionsForClub = allDivisions.filter(d => d.clubId === clubId);
  const unitsForScope = allUnits.filter(u => u.clubId === clubId && (!divisionId || u.divisionId === divisionId));

  const selectedClub = clubs.find(c => c.id === clubId);
  const selectedDivision = divisionsForClub.find(d => d.id === divisionId);
  const selectedUnit = unitsForScope.find(u => u.id === unitId);

  const scopeLabel = selectedUnit ? `${selectedUnit.name} (Unit)` : selectedDivision ? `${selectedDivision.name} (Division)` : selectedClub ? `${selectedClub.name} (Club)` : 'No club selected';

  const report = clubId
    ? getScopeReport({ clubId, divisionId: divisionId || undefined, unitId: unitId || undefined }, dateFrom || undefined, dateTo || undefined)
    : undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 print:max-w-full print:px-0">
      {/* Controls — hidden when printing */}
      <div className="print:hidden space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center">
            <FileBarChart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reports</h1>
            <p className="text-xs text-slate-500 mt-1">Membership, attendance, and scoring results for any club, division, or unit.</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Club</label>
            <select
              value={clubId}
              onChange={(e) => { setClubId(e.target.value); setDivisionId(''); setUnitId(''); }}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
            >
              {clubs.map(club => (
                <option key={club.id} value={club.id}>{club.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Division</label>
            <select
              value={divisionId}
              onChange={(e) => { setDivisionId(e.target.value); setUnitId(''); }}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
            >
              <option value="">All Divisions</option>
              {divisionsForClub.map(div => (
                <option key={div.id} value={div.id}>{div.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Unit</label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
            >
              <option value="">All Units</option>
              {unitsForScope.map(unit => (
                <option key={unit.id} value={unit.id}>{unit.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden" />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden" />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => window.print()}
            disabled={!report}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Report body — this is what prints */}
      {!clubs.length ? (
        <p className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">No clubs registered for this church yet.</p>
      ) : !report ? (
        <p className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">No units found for this scope yet — register a unit first.</p>
      ) : (
        <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
          <div className="pb-4 border-b border-slate-200 space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">{currentOrg.churchName}</h2>
            <p className="text-sm font-semibold text-blue-900">{scopeLabel}</p>
            <p className="text-xs text-slate-500">
              {dateFrom || dateTo ? `${dateFrom || 'Start'} to ${dateTo || 'Present'}` : 'All-time'} · Generated {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Members" value={String(report.memberCount)} sub={`${report.approvedCount} approved · ${report.pendingCount} pending`} />
            <StatCard label="Dues Paid" value={String(report.duesPaidCount)} sub={`of ${report.memberCount} members`} />
            <StatCard label="Attendance Rate" value={`${report.attendanceRate}%`} sub={`${report.presentCount + report.lateCount} of ${report.eligibleAttendanceCount} checked in`} />
            <StatCard label="Needs Clarification" value={String(report.needsClarificationCount)} sub={`${report.archivedCount} archived`} />
            <StatCard
              label="Member Evaluation Avg."
              value={report.memberEvaluationCount > 0 ? `${report.memberEvaluationAverageScore}/${report.memberEvaluationAverageMaxScore}` : '—'}
              sub={report.memberEvaluationCount > 0 ? `${report.memberEvaluationAveragePercentage}% · ${report.memberEvaluationCount} score(s) recorded` : 'No scores recorded'}
            />
            <StatCard
              label="Marching & Drill Avg."
              value={report.drillEvaluationCount > 0 ? `${report.drillAverageScore}/${report.drillAverageMaxScore}` : '—'}
              sub={report.drillEvaluationCount > 0 ? `${report.drillAveragePercentage}% · ${report.drillEvaluationCount} evaluation(s)` : 'No evaluations recorded'}
            />
          </div>

          {report.unitBreakdown.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Unit Breakdown</h3>
              <BreakdownTable rows={report.unitBreakdown} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
