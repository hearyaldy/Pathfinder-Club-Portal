import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  ArrowRight,
  Pencil,
  Copy,
  Trash2
} from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { ClubEvent } from '../types/club';
import { EventFormModal, EventFormMode } from './EventFormModal';

interface ClubCalendarProps {
  onGoToLiveAttendance: () => void;
}

export const ClubCalendar: React.FC<ClubCalendarProps> = ({ onGoToLiveAttendance }) => {
  const { events, activeEventId, setActiveEventId, deleteEvent, getEventAttendanceStats, currentUser, currentOrgId } = useClub();
  const [form, setForm] = useState<{ mode: EventFormMode; event?: ClubEvent } | null>(null);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const canManageEvents = !!currentUser && currentUser.role !== 'Parent / Member' && (
    currentUser.orgId === currentOrgId || ['Super Admin', 'Mission Youth Director', 'District Coordinator'].includes(currentUser.role)
  );
  React.useEffect(() => { setForm(null); setError(''); setMessage(''); }, [currentOrgId, currentUser?.id]);

  const handleDelete = async (event: ClubEvent) => {
    if (deletingId || !window.confirm(`Delete "${event.title}" from the calendar? Recorded attendance and scores will be retained.`)) return;
    setDeletingId(event.id); setError(''); setMessage('');
    try {
      await deleteEvent(event.id);
      setMessage('Event deleted from the calendar.');
    } catch {
      setError('The event could not be deleted. Check your connection and permissions, then try again.');
    } finally { setDeletingId(''); }
  };

  const handleSetActive = (eventId: string) => {
    setActiveEventId(eventId);
    onGoToLiveAttendance();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Club Events & Attendance Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official Pathfinder & Adventurer calendar for meetings, campouts, honors, and community service.
          </p>
        </div>
        {canManageEvents && <button
          onClick={() => { setError(''); setMessage(''); setForm({ mode: 'create' }); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Event</span>
        </button>}
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
      {events.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No events scheduled.</p>}
      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((evt) => {
          const stats = getEventAttendanceStats(evt.id);
          const isActive = evt.id === activeEventId;

          return (
            <div
              key={evt.id}
              className={`rounded-xl border p-6 transition-all bg-white flex flex-col justify-between ${
                isActive
                  ? 'border-blue-900 ring-2 ring-blue-100 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                {/* Top Badge Strip */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {evt.type}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {evt.branch === 'Both' ? 'Pathfinders & Adventurers' : evt.branch}
                    </span>
                  </div>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-blue-950">
                      <CheckCircle2 className="w-3 h-3" />
                      Active Check-in Event
                    </span>
                  ) : null}
                </div>

                {/* Event Title */}
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {evt.title}
                </h3>

                {/* Event Metadata */}
                <div className="space-y-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">{evt.date}</span>
                    <span>·</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{evt.location}</span>
                  </div>
                </div>

                {/* Real-time stats preview */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Attendance Logged:</span>
                    <strong className="text-slate-900 font-mono">
                      {stats.present + stats.late} of {stats.totalEligible} Present
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[11px]">Rate:</span>
                    <strong className="text-emerald-700 font-mono font-bold">
                      {stats.attendanceRate}%
                    </strong>
                  </div>
                </div>
              </div>

              {canManageEvents && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button disabled={!!deletingId} aria-label={`Edit event ${evt.title}`} onClick={() => { setError(''); setMessage(''); setForm({ mode: 'edit', event: evt }); }} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-100 disabled:opacity-50"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                  <button disabled={!!deletingId} aria-label={`Copy event ${evt.title}`} onClick={() => { setError(''); setMessage(''); setForm({ mode: 'copy', event: evt }); }} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"><Copy className="h-3.5 w-3.5" /> Copy</button>
                  <button disabled={!!deletingId} aria-label={`Delete event ${evt.title}`} onClick={() => handleDelete(evt)} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /> {deletingId === evt.id ? 'Deleting…' : 'Delete'}</button>
                </div>
              )}
              {/* Bottom Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {stats.excused > 0 ? `${stats.excused} Excused` : 'Roster ready'}
                </span>

                {canManageEvents && (isActive ? (
                  <button
                    onClick={onGoToLiveAttendance}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition-colors"
                  >
                    <span>Manage Live Roster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSetActive(evt.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:border-blue-900 hover:text-blue-900 text-slate-700 rounded-lg transition-colors"
                  >
                    <span>Set Active & Record Attendance</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {form && canManageEvents && (
        <EventFormModal mode={form.mode} event={form.event} onClose={() => setForm(null)}
          onSaved={() => {
            const mode = form.mode;
            setForm(null);
            setMessage(mode === 'edit' ? 'Event updated.' : mode === 'copy' ? 'Event copied.' : 'Event created.');
            if (mode === 'create') onGoToLiveAttendance();
          }} />
      )}
    </div>
  );
};
