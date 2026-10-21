import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { ClubEvent, Member } from '../types/club';
import { calculateScore, EvaluationScores, isInvestitureEvent } from '../utils/scoreUtils';

export const MemberScoreModal: React.FC<{ event: ClubEvent; member: Member; onClose: () => void; onSaved: () => void }> = ({ event, member, onClose, onSaved }) => {
  const { recordEvaluation, getMemberEvaluationForEvent, getMemberAttendanceForEvent } = useClub();
  const existing = getMemberEvaluationForEvent(event.id, member.id);
  const [scores, setScores] = useState<EvaluationScores>({
    marchingDrillScore: existing?.marchingDrillScore ?? 0,
    uniformScore: existing?.uniformScore ?? 0, disciplineScore: existing?.disciplineScore ?? 0,
    investitureBonusScore: existing?.investitureBonusScore ?? 0,
  });
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  const status = getMemberAttendanceForEvent(event.id, member.id)?.status;
  let preview: ReturnType<typeof calculateScore> | undefined;
  try { preview = calculateScore(event.type, status, scores); } catch { /* Invalid inputs are checked before saving. */ }
  const fields: [keyof EvaluationScores, string, number][] = [
    ['marchingDrillScore', 'Marching / drill', 20], ['uniformScore', 'Uniform', 20], ['disciplineScore', 'Discipline', 20],
    ...(isInvestitureEvent(event.type) ? [['investitureBonusScore', 'Investiture bonus', 10] as [keyof EvaluationScores, string, number]] : []),
  ];
  const save = async (submit: React.FormEvent) => {
    submit.preventDefault();
    if (saving) return;
    try { calculateScore(event.type, status, scores); } catch (err) { setError((err as Error).message); return; }
    setSaving(true); setError('');
    try {
      await recordEvaluation(event.id, member.id, scores, notes);
      onSaved();
    } catch (err) {
      setError((err as { code?: string })?.code === 'permission-denied'
        ? 'Scores could not be saved. Check your scoring permissions, or retry if attendance just changed.'
        : 'Scores could not be saved. Check your connection and try again.');
    } finally { setSaving(false); }
  };
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden';
  return (
    <dialog ref={dialog} aria-labelledby="member-score-title" onCancel={submit => { submit.preventDefault(); if (!saving) onClose(); }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/70 open:flex open:flex-col">
      <div className="flex shrink-0 items-center justify-between bg-blue-950 px-6 py-4 text-white">
        <div><h2 id="member-score-title" className="font-bold">Score {member.firstName} {member.lastName}</h2><p className="mt-1 text-xs text-blue-200">{event.title}</p></div>
        <button type="button" aria-label="Close scoring" disabled={saving} onClick={onClose} className="rounded p-1 hover:bg-blue-900"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={save} className="overflow-y-auto p-6 space-y-4" aria-busy={saving}>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {!member.unitId && <p className="text-xs text-slate-500">Assign a unit to include this member in the unit leaderboard.</p>}
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-950">Attendance: <strong>{status === 'Present' || status === 'Late' ? 10 : 0}/10</strong> · {status ?? 'Not checked in'}<span className="mt-1 block text-xs">Updated automatically from check-in status.</span></p>
        <fieldset disabled={saving} className="space-y-4 disabled:opacity-70">
          {fields.map(([key, label, maximum]) => <label key={key} className="block text-xs font-semibold text-slate-700">{label} (0–{maximum})
            <input className={inputClass} type="number" min="0" max={maximum} step="1" required value={Number.isFinite(scores[key]) ? scores[key] : ''}
              onChange={change => setScores(previous => ({ ...previous, [key]: change.target.valueAsNumber }))} />
          </label>)}
          <div><label htmlFor="score-notes" className="block text-xs font-semibold text-slate-700">Evaluation notes</label><textarea id="score-notes" className={inputClass} rows={2} value={notes} onChange={change => setNotes(change.target.value)} /></div>
          <p aria-live="polite" className="text-lg font-bold text-blue-950">Total: {preview ? `${preview.totalScore}/${preview.maxScore}` : 'Enter valid scores'}</p>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white">{saving ? 'Saving…' : 'Save Scores'}</button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
};
