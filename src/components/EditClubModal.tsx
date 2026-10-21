import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { ClubDetails, ClubEntity } from '../types/club';

interface EditClubModalProps {
  club: ClubEntity;
  onClose: () => void;
  onSaved: () => void;
}

export const EditClubModal: React.FC<EditClubModalProps> = ({ club, onClose, onSaved }) => {
  const { updateClub } = useClub();
  const dialog = useRef<HTMLDialogElement>(null);
  const [details, setDetails] = useState<ClubDetails>({
    name: club.name, directorName: club.directorName,
    directorEmail: club.directorEmail ?? '', directorPhone: club.directorPhone ?? '',
    charterNumber: club.charterNumber, meetingSchedule: club.meetingSchedule,
    annualDues: club.annualDues, motto: club.motto ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    if (!details.name.trim() || !details.directorName.trim() || !Number.isFinite(details.annualDues) || details.annualDues < 0) {
      setError('Enter a club name, director, and valid annual dues.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateClub(club.id, details);
      onSaved();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(code === 'permission-denied'
        ? 'Access was denied. Check that you are signed in with permission to edit this club.'
        : code === 'invalid-club' ? 'Enter a club name, director, and valid annual dues.'
        : 'The club could not be saved. Check your connection and try again.');
    } finally { setSaving(false); }
  };
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900';
  const fields = [
    ['name', 'Club name', 'text'], ['directorName', 'Director name', 'text'],
    ['directorEmail', 'Director email', 'email'], ['directorPhone', 'Director phone', 'tel'],
    ['charterNumber', 'Charter number', 'text'], ['meetingSchedule', 'Meeting schedule', 'text'], ['motto', 'Motto', 'text'],
  ] as const;

  return (
    <dialog ref={dialog} aria-labelledby="edit-club-title"
      onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/70 open:flex open:flex-col">
      <div className="flex shrink-0 items-center justify-between bg-blue-950 px-6 py-4 text-white">
        <div><h2 id="edit-club-title" className="text-base font-bold">Edit Club</h2><p className="mt-1 text-xs text-blue-200">{club.clubType}</p></div>
        <button type="button" aria-label="Close club editor" disabled={saving} onClick={onClose} className="rounded p-1 hover:bg-blue-900 disabled:opacity-50"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={save} className="overflow-y-auto p-6 space-y-4" aria-busy={saving}>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <fieldset disabled={saving} className="space-y-4 disabled:opacity-70">
          {fields.map(([key, label, type]) => (
            <label key={key} className="block text-xs font-semibold text-slate-700">{label}{key === 'name' || key === 'directorName' ? ' *' : ''}
              <input className={inputClass} type={type} required={key === 'name' || key === 'directorName'} value={details[key] ?? ''} onChange={e => setDetails(previous => ({ ...previous, [key]: e.target.value }))} />
            </label>
          ))}
          <label className="block text-xs font-semibold text-slate-700">Annual dues ($) *
            <input className={inputClass} type="number" min="0" step="0.01" required value={Number.isFinite(details.annualDues) ? details.annualDues : ''} onChange={e => setDetails(previous => ({ ...previous, annualDues: e.target.valueAsNumber }))} />
          </label>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">{saving ? 'Saving…' : 'Save Club'}</button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
};
