import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  Users, 
  Compass, 
  Check, 
  X, 
  ArrowRight 
} from 'lucide-react';
import { useClub } from '../context/ClubContext';
import { ClubEvent } from '../types/club';

interface ClubCalendarProps {
  onGoToLiveAttendance: () => void;
}

export const ClubCalendar: React.FC<ClubCalendarProps> = ({ onGoToLiveAttendance }) => {
  const { events, activeEventId, setActiveEventId, addEvent, getEventAttendanceStats } = useClub();
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form
  const [title, setTitle] = useState('');
  const [branch, setBranch] = useState<ClubEvent['branch']>('Both');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('2:30 PM - 5:00 PM');
  const [location, setLocation] = useState('Church Fellowship Hall & Outdoors');
  const [type, setType] = useState<ClubEvent['type']>('Regular Meeting');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addEvent({
      title: title.trim(),
      branch,
      date,
      time: time.trim(),
      location: location.trim(),
      type,
    });

    setShowAddModal(false);
    setTitle('');
    onGoToLiveAttendance();
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
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Event</span>
        </button>
      </div>

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

              {/* Bottom Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {stats.excused > 0 ? `${stats.excused} Excused` : 'Roster ready'}
                </span>

                {isActive ? (
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
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 bg-blue-950 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Schedule Club Meeting or Event</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-blue-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pathfinder Day Sabbath Service & Induction"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Event Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  >
                    <option value="Regular Meeting">Regular Meeting</option>
                    <option value="Campout">Campout / Camping</option>
                    <option value="Investiture">Investiture Ceremony</option>
                    <option value="Outreach">Community Outreach</option>
                    <option value="Executive">Staff / Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Target Branch
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  >
                    <option value="Both">Both Clubs</option>
                    <option value="Pathfinders">Pathfinders Only</option>
                    <option value="Adventurers">Adventurers Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="2:30 PM - 5:00 PM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Location / Venue *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Church Fellowship Hall or Camp Site"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Create & Open Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
