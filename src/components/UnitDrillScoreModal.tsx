import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { ClubEvent, ClubUnit, UnitDrillEvaluation } from '../types/club';
import { calculateDrillScore, DRILL_COMMANDS, DrillCommandScores, MAX_COMMAND_SCORE } from '../utils/scoreUtils';

export const UnitDrillScoreModal: React.FC<{ event: ClubEvent; unit: ClubUnit; existing?: UnitDrillEvaluation; onClose: () => void; onSaved: () => void }> = ({ event, unit, existing, onClose, onSaved }) => {
  const { recordUnitDrillScore } = useClub();
  const [evaluatorName, setEvaluatorName] = useState(existing?.evaluatorName ?? '');
  const [commandScores, setCommandScores] = useState<DrillCommandScores>(
    Object.fromEntries(DRILL_COMMANDS.map(cmd => [cmd.key, existing?.[cmd.key] ?? 0])) as DrillCommandScores
  );
  const [demeritUnitCaptain, setDemeritUnitCaptain] = useState(existing?.demeritUnitCaptain ?? 0);
  const [demeritMembers, setDemeritMembers] = useState(existing?.demeritMembers ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  let preview: ReturnType<typeof calculateDrillScore> | undefined;
  try { preview = calculateDrillScore(commandScores, demeritUnitCaptain, demeritMembers); } catch { /* invalid inputs are checked before saving */ }

  const save = async (submit: React.FormEvent) => {
    submit.preventDefault();
    if (saving) return;
    if (!evaluatorName.trim()) { setError("Enter the evaluator's name."); return; }
    try { calculateDrillScore(commandScores, demeritUnitCaptain, demeritMembers); } catch (err) { setError((err as Error).message); return; }
    setSaving(true); setError('');
    try {
      await recordUnitDrillScore(event.id, unit.id, evaluatorName, commandScores, demeritUnitCaptain, demeritMembers, existing?.id);
      onSaved();
    } catch (err) {
      setError((err as { code?: string })?.code === 'permission-denied'
        ? 'The drill score could not be saved. Check your scoring permissions.'
        : 'The drill score could not be saved. Check your connection and try again.');
    } finally { setSaving(false); }
  };
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden';
  return (
    <dialog ref={dialog} aria-labelledby="unit-drill-title" onCancel={submit => { submit.preventDefault(); if (!saving) onClose(); }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/70 open:flex open:flex-col">
      <div className="flex shrink-0 items-center justify-between bg-blue-950 px-6 py-4 text-white">
        <div><h2 id="unit-drill-title" className="font-bold">Marching & Drill — {unit.name}</h2><p className="mt-1 text-xs text-blue-200">{event.title} · {existing ? 'Edit evaluator submission' : 'New evaluator submission'}</p></div>
        <button type="button" aria-label="Close drill scoring" disabled={saving} onClick={onClose} className="rounded p-1 hover:bg-blue-900"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={save} className="overflow-y-auto p-6 space-y-4" aria-busy={saving}>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <fieldset disabled={saving} className="space-y-4 disabled:opacity-70">
          <label className="block text-xs font-semibold text-slate-700">Name of Evaluator *
            <input className={inputClass} type="text" required value={evaluatorName} onChange={e => setEvaluatorName(e.target.value)} />
          </label>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-700">Commands (0–{MAX_COMMAND_SCORE} each, evaluator's judgment)</span>
            {DRILL_COMMANDS.map(cmd => (
              <label key={cmd.key} className="flex items-center justify-between gap-3 text-sm text-slate-800">
                <span className="flex-1">{cmd.label}</span>
                <input type="number" min={0} max={MAX_COMMAND_SCORE} step={1} required
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm text-right focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  value={Number.isFinite(commandScores[cmd.key]) ? commandScores[cmd.key] : ''}
                  onChange={e => setCommandScores(previous => ({ ...previous, [cmd.key]: e.target.valueAsNumber }))} />
              </label>
            ))}
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-3">
            <span className="block text-xs font-semibold text-rose-700">Demerits (points deducted, no limit)</span>
            <label className="flex items-center justify-between gap-3 text-sm text-slate-800">
              <span className="flex-1">Wrong Command (Unit Captain)</span>
              <input type="number" min={0} step={1} className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm text-right focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                value={demeritUnitCaptain} onChange={e => setDemeritUnitCaptain(e.target.valueAsNumber)} />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm text-slate-800">
              <span className="flex-1">Wrong Execution (Members)</span>
              <input type="number" min={0} step={1} className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm text-right focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                value={demeritMembers} onChange={e => setDemeritMembers(e.target.valueAsNumber)} />
            </label>
          </div>

          <p aria-live="polite" className="text-lg font-bold text-blue-950">Total: {preview ? `${preview.totalScore}/${preview.maxScore}` : 'Enter valid scores'}</p>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white">{saving ? 'Saving…' : 'Save Drill Score'}</button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
};
