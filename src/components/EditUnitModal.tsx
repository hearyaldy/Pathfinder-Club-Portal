import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { ClubUnit, UnitDetails } from '../types/club';

interface EditUnitModalProps {
  unit: ClubUnit;
  onClose: () => void;
  onSaved: () => void;
}

export const EditUnitModal: React.FC<EditUnitModalProps> = ({ unit, onClose, onSaved }) => {
  const { updateUnit, allDivisions } = useClub();
  const dialog = useRef<HTMLDialogElement>(null);
  const [details, setDetails] = useState<UnitDetails>({
    name: unit.name, counselorName: unit.counselorName,
    counselorPhone: unit.counselorPhone ?? '', genderDivision: unit.genderDivision,
    ageRange: unit.ageRange ?? '', motto: unit.motto ?? '', divisionId: unit.divisionId,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const divisions = allDivisions.filter(division => division.orgId === unit.orgId && division.clubId === unit.clubId);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    if (!details.name.trim()) { setError('Unit name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await updateUnit(unit.id, details);
      onSaved();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(code === 'permission-denied'
        ? 'Access was denied. Check that you are signed in with permission to edit this unit.'
        : code === 'invalid-division' ? 'That division is no longer available. Choose another division and try again.'
        : 'The unit could not be saved. Check your connection and try again.');
    } finally { setSaving(false); }
  };
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900';
  const fields = [
    ['name', 'Unit name', 'text'], ['counselorName', 'Counselor name', 'text'],
    ['counselorPhone', 'Counselor phone', 'tel'], ['ageRange', 'Age range', 'text'], ['motto', 'Motto', 'text'],
  ] as const;

  return (
    <dialog ref={dialog} aria-labelledby="edit-unit-title"
      onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/70 open:flex open:flex-col">
      <div className="flex shrink-0 items-center justify-between bg-blue-950 px-6 py-4 text-white">
        <div><h2 id="edit-unit-title" className="text-base font-bold">Edit Unit</h2><p className="mt-1 text-xs text-blue-200">{unit.branch}</p></div>
        <button type="button" aria-label="Close unit editor" disabled={saving} onClick={onClose} className="rounded p-1 hover:bg-blue-900 disabled:opacity-50"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={save} className="overflow-y-auto p-6 space-y-4" aria-busy={saving}>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <fieldset disabled={saving} className="space-y-4 disabled:opacity-70">
          {fields.map(([key, label, type]) => (
            <label key={key} className="block text-xs font-semibold text-slate-700">{label}{key === 'name' ? ' *' : ''}
              <input className={inputClass} type={type} required={key === 'name'} value={details[key] ?? ''} onChange={e => setDetails(previous => ({ ...previous, [key]: e.target.value }))} />
            </label>
          ))}
          <div>
            <label htmlFor="edit-unit-gender" className="block text-xs font-semibold text-slate-700">Gender division</label>
            <select id="edit-unit-gender" className={inputClass} value={details.genderDivision ?? ''} onChange={e => setDetails(previous => ({ ...previous, genderDivision: (e.target.value || undefined) as ClubUnit['genderDivision'] }))}>
              <option value="">Not specified</option>
              {['Boys', 'Girls', 'Co-ed'].map(value => <option key={value}>{value}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="edit-unit-division" className="block text-xs font-semibold text-slate-700">Division</label>
            <select id="edit-unit-division" className={inputClass} value={details.divisionId ?? ''} onChange={e => setDetails(previous => ({ ...previous, divisionId: e.target.value || undefined }))}>
              <option value="">Ungrouped</option>
              {details.divisionId && !divisions.some(division => division.id === details.divisionId) && <option value={details.divisionId}>Previous division (unavailable)</option>}
              {divisions.map(division => <option key={division.id} value={division.id}>{division.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">{saving ? 'Saving…' : 'Save Unit'}</button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
};
