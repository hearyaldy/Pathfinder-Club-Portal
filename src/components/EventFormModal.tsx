import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { ClubEvent, EventDetails } from '../types/club';

export type EventFormMode = 'create' | 'edit' | 'copy';
interface EventFormModalProps {
  mode: EventFormMode;
  event?: ClubEvent;
  onClose: () => void;
  onSaved: () => void;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({ mode, event, onClose, onSaved }) => {
  const { addEvent, updateEvent } = useClub();
  const dialog = useRef<HTMLDialogElement>(null);
  const [details, setDetails] = useState<EventDetails>({
    title: event ? `${event.title}${mode === 'copy' ? ' (copy)' : ''}` : '',
    branch: event?.branch ?? 'Both', date: event?.date ?? new Intl.DateTimeFormat('en-CA').format(new Date()),
    time: event?.time ?? '2:30 PM - 5:00 PM', location: event?.location ?? 'Church Fellowship Hall & Outdoors',
    type: event?.type ?? 'Regular Meeting',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  const save = async (submit: React.FormEvent) => {
    submit.preventDefault();
    if (saving) return;
    if (!details.title.trim() || !details.date || !details.time.trim() || !details.location.trim()) {
      setError('Enter a title, date, time, and location.'); return;
    }
    setSaving(true); setError('');
    try {
      if (mode === 'edit' && event) await updateEvent(event.id, details);
      else await addEvent(details, mode === 'create');
      onSaved();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(code === 'permission-denied'
        ? 'Access was denied. Check that you are signed in with permission to manage events.'
        : code === 'invalid-event' ? 'Enter valid event details and try again.'
        : 'The event could not be saved. Check your connection and try again.');
    } finally { setSaving(false); }
  };
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900';
  const heading = mode === 'edit' ? 'Edit Event' : mode === 'copy' ? 'Copy Event' : 'Schedule New Event';
  const fields = [['title', 'Event title', 'text'], ['date', 'Date', 'date'], ['time', 'Time', 'text'], ['location', 'Location / venue', 'text']] as const;
  return (
    <dialog ref={dialog} aria-labelledby="event-form-title"
      onCancel={submit => { submit.preventDefault(); if (!saving) onClose(); }}
      className="m-auto w-[calc(100%_-_2rem)] max-w-lg max-h-[90vh] overflow-hidden rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/70 open:flex open:flex-col">
      <div className="flex shrink-0 items-center justify-between bg-blue-950 px-6 py-4 text-white">
        <h2 id="event-form-title" className="text-base font-bold">{heading}</h2>
        <button type="button" aria-label="Close event editor" disabled={saving} onClick={onClose} className="rounded p-1 hover:bg-blue-900 disabled:opacity-50"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={save} className="overflow-y-auto p-6 space-y-4" aria-busy={saving}>
        {mode === 'copy' && <p className="text-xs text-slate-600">Adjust the date and details before saving. Attendance and scores are not copied.</p>}
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <fieldset disabled={saving} className="space-y-4 disabled:opacity-70">
          {fields.map(([key, label, type]) => (
            <label key={key} className="block text-xs font-semibold text-slate-700">{label} *
              <input className={inputClass} type={type} required value={details[key]} onChange={e => setDetails(previous => ({ ...previous, [key]: e.target.value }))} />
            </label>
          ))}
          <div>
            <label htmlFor="event-form-type" className="block text-xs font-semibold text-slate-700">Event type</label>
            <select id="event-form-type" className={inputClass} value={details.type} onChange={e => setDetails(previous => ({ ...previous, type: e.target.value as ClubEvent['type'] }))}>
              {['Regular Meeting', 'Campout', 'Investiture', 'Outreach', 'Executive'].map(value => <option key={value}>{value}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="event-form-branch" className="block text-xs font-semibold text-slate-700">Target branch</label>
            <select id="event-form-branch" className={inputClass} value={details.branch} onChange={e => setDetails(previous => ({ ...previous, branch: e.target.value as ClubEvent['branch'] }))}>
              <option value="Both">Both Clubs</option><option value="Pathfinders">Pathfinders Only</option><option value="Adventurers">Adventurers Only</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">{saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : mode === 'copy' ? 'Save Copy' : 'Create & Open Attendance'}</button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
};
