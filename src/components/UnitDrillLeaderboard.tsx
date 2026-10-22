import React from 'react';
import { useClub } from '../context/ClubContext';

export const UnitDrillLeaderboard: React.FC = () => {
  const { getUnitDrillLeaderboard, drillEvaluationsLoading, drillEvaluationsError, canManageScoring } = useClub();
  if (!canManageScoring) return null;
  const rankings = drillEvaluationsError || drillEvaluationsLoading ? [] : getUnitDrillLeaderboard();
  return (
    <section aria-labelledby="unit-drill-leaderboard-title" className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
      <div><h2 id="unit-drill-leaderboard-title" className="text-lg font-bold text-slate-900">Marching & Drill leaderboard</h2><p className="text-xs text-slate-500">Average percentage across scored Marching & Drill sheets in this church, after demerits.</p></div>
      {drillEvaluationsLoading ? <p role="status" className="text-sm text-slate-500">Loading scores…</p> : drillEvaluationsError ? <p role="alert" className="text-sm text-red-700">{drillEvaluationsError}</p> : rankings.length === 0 ? <p className="text-sm text-slate-500">Save a unit's drill score to start ranking units.</p> : (
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500"><tr><th className="py-2">Rank</th><th className="py-2">Unit</th><th className="py-2">Evaluations</th><th className="py-2 text-right">Average</th></tr></thead>
          <tbody>{rankings.map((unit, index) => <tr key={unit.unitId} className="border-t border-slate-100"><td className="py-3">{index + 1}</td><td className="py-3 font-semibold">{unit.unitName}<span className="block text-xs font-normal text-slate-500">{unit.branch}</span></td><td className="py-3">{unit.evaluationCount}</td><td className="py-3 text-right font-bold text-blue-900">{unit.averagePercentage}%</td></tr>)}</tbody>
        </table></div>
      )}
    </section>
  );
};
