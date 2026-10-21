import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { Member, MemberDetails, MEMBER_DETAIL_FIELDS } from '../types/club';

interface EditMemberModalProps {
  member: Member;
  onClose: () => void;
  onSaved: () => void;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({ member, onClose, onSaved }) => {
  const { updateMemberDetails } = useClub();
  const dialog = useRef<HTMLDialogElement>(null);
  const [details, setDetails] = useState<MemberDetails>(() => ({
    ...Object.fromEntries(MEMBER_DETAIL_FIELDS.map(key => [key, member[key] ?? ''])),
    swimmingAbility: member.swimmingAbility,
  }) as MemberDetails);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900';
  const field = (key: keyof MemberDetails, label: string, type = 'text', required = false) => (
    <label className="block text-xs font-semibold text-slate-700" key={key}>
      {label}{required ? ' *' : ''}
      <input type={type} required={required} value={details[key] ?? ''} className={inputClass}
        onChange={event => setDetails(previous => ({ ...previous, [key]: event.target.value }))} />
    </label>
  );

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    if (!details.firstName.trim() || !details.lastName.trim()) {
      setError('First and last names are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateMemberDetails(member.id, details);
      onSaved();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(code === 'permission-denied'
        ? 'Access was denied. Check that you are signed in with permission to edit this member.'
        : 'Changes could not be saved. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog ref={dialog} aria-labelledby="edit-member-title"
      onCancel={event => { event.preventDefault(); if (!saving) onClose(); }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/70 open:flex open:flex-col">
      <div className="flex shrink-0 items-center justify-between bg-blue-950 px-6 py-4 text-white">
        <div>
          <h2 id="edit-member-title" className="text-base font-bold">Edit Member Details</h2>
          <p className="mt-1 text-xs text-blue-200">{member.registrationNumber} · {member.branch}</p>
        </div>
        <button type="button" aria-label="Close member editor" disabled={saving} onClick={onClose} className="rounded p-1 hover:bg-blue-900 disabled:opacity-50">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={save} className="overflow-y-auto p-6 space-y-5" aria-busy={saving}>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <fieldset disabled={saving} className="space-y-5 disabled:opacity-70">
          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-bold text-slate-900">Member information</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field('firstName', 'First name', 'text', true)}
              {field('lastName', 'Last name', 'text', true)}
              {field('dateOfBirth', 'Date of birth', 'date')}
              <label className="block text-xs font-semibold text-slate-700">Gender
                <select className={inputClass} value={details.gender} onChange={e => setDetails(p => ({ ...p, gender: e.target.value as Member['gender'] }))}>
                  {['Male', 'Female', 'Other'].map(value => <option key={value}>{value}</option>)}
                </select>
              </label>
              {field('className', 'Class')}
              <label className="block text-xs font-semibold text-slate-700">Uniform size
                <select className={inputClass} value={details.uniformSize} onChange={e => setDetails(p => ({ ...p, uniformSize: e.target.value as Member['uniformSize'] }))}>
                  {['Youth S', 'Youth M', 'Youth L', 'Adult S', 'Adult M', 'Adult L', 'Adult XL'].map(value => <option key={value}>{value}</option>)}
                </select>
              </label>
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-bold text-slate-900">Parent / guardian and emergency contacts</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field('parentName', 'Parent / guardian name')}
              {field('parentPhone', 'Parent / guardian phone', 'tel')}
              {field('parentEmail', 'Parent / guardian email', 'email')}
              {field('homeAddress', 'Home address')}
              {field('emergencyContact', 'Emergency contact name')}
              {field('emergencyPhone', 'Emergency contact phone', 'tel')}
              {field('emergencyRelation', 'Emergency contact relationship')}
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-bold text-slate-900">Health and activity information</legend>
            {(['medicalConditions', 'allergies', 'dietaryRestrictions'] as const).map((key, index) => (
              <div key={key}>
                <label htmlFor={`edit-member-${key}`} className="block text-xs font-semibold text-slate-700">
                  {['Medical conditions / medications', 'Allergies', 'Dietary restrictions'][index]}
                </label>
                <textarea id={`edit-member-${key}`} className={inputClass} rows={2} value={details[key] ?? ''} onChange={e => setDetails(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
            <label className="block text-xs font-semibold text-slate-700">Swimming ability
              <select className={inputClass} value={details.swimmingAbility ?? ''} onChange={e => setDetails(p => ({ ...p, swimmingAbility: (e.target.value || undefined) as Member['swimmingAbility'] }))}>
                <option value="">Not recorded</option>
                {['Non-Swimmer', 'Beginner', 'Intermediate', 'Advanced'].map(value => <option key={value}>{value}</option>)}
              </select>
            </label>
          </fieldset>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
};
