import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Users, 
  Info, 
  UserCheck, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { CalendarEvent } from '../types';

interface CalendarModuleProps {
  state: any;
  onRefresh: () => void;
  brandColor: string;
}

export default function CalendarModule({ state, onRefresh, brandColor }: CalendarModuleProps) {
  const { calendarEvents, leaveRequests, leads } = state;
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-08');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Add event form state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<'meeting' | 'client-visit' | 'leave' | 'follow-up' | 'other'>('meeting');
  const [newEventDate, setNewEventDate] = useState('2026-07-08');
  const [newEventTime, setNewEventTime] = useState('10:00 AM');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventAttendees, setNewEventAttendees] = useState('');

  // Combine static events, approved leaves, and crm follow-ups/meetings
  const combinedEvents: any[] = [...(calendarEvents || [])];

  // Pull approved leaves
  if (leaveRequests) {
    leaveRequests.forEach((leave: any) => {
      if (leave.status === 'Approved') {
        // Simple day-by-day mapping for leave duration
        let curr = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        while (curr <= end) {
          const dateStr = curr.toISOString().split('T')[0];
          combinedEvents.push({
            id: `leave_${leave.id}_${dateStr}`,
            title: `Approved Leave: ${leave.employeeName}`,
            type: 'leave',
            date: dateStr,
            time: 'All Day',
            description: `Type: ${leave.type} Leave. Reason: ${leave.reason}`,
            attendees: [leave.employeeName]
          });
          curr.setDate(curr.getDate() + 1);
        }
      }
    });
  }

  // Filter events
  const filteredEvents = combinedEvents.filter(e => {
    if (filterType === 'all') return true;
    return e.type === filterType;
  });

  // Calendar logic for July 2026 (Starts on Wednesday, 31 Days)
  const monthName = "July 2026";
  const daysInMonth = 31;
  const startDayOffset = 3; // Wednesday (0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed...)

  const calendarDays: { dayNumber: number | null; dateString: string | null }[] = [];
  
  // Empty slots before starting day
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push({ dayNumber: null, dateString: null });
  }

  // Active days
  for (let i = 1; i <= daysInMonth; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    calendarDays.push({
      dayNumber: i,
      dateString: `2026-07-${dayStr}`
    });
  }

  // Handle Event Creation
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;

    const attendeesArray = newEventAttendees
      ? newEventAttendees.split(',').map(s => s.trim())
      : [];

    const payload: CalendarEvent = {
      id: "cale_" + Math.random().toString(36).substring(2, 9),
      title: newEventTitle,
      type: newEventType,
      date: newEventDate,
      time: newEventTime,
      description: newEventDesc,
      attendees: attendeesArray
    };

    try {
      const res = await fetch('/api/state/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewEventTitle('');
        setNewEventDesc('');
        setNewEventAttendees('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Get active events for selected date
  const eventsOnSelectedDate = filteredEvents.filter(e => e.date === selectedDate);

  const getEventBgColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100';
      case 'client-visit': return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100';
      case 'leave': return 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100';
      case 'follow-up': return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100';
    }
  };

  const getEventDotColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-indigo-600';
      case 'client-visit': return 'bg-emerald-500';
      case 'leave': return 'bg-rose-500';
      case 'follow-up': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-indigo-600" />
            Corporate Shared Calendar
          </h2>
          <p className="text-xs text-slate-500">
            Consolidated calendar tracking meetings, client visits, staff leaves, CRM follow-ups, and milestone dates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg p-1">
            <Filter className="h-3.5 w-3.5 text-slate-400 pl-1" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none text-slate-700 focus:outline-hidden font-semibold cursor-pointer text-xs"
            >
              <option value="all">All Events</option>
              <option value="meeting">Meetings</option>
              <option value="client-visit">Client Visits</option>
              <option value="leave">Staff Leaves</option>
              <option value="follow-up">Follow-ups</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            onClick={() => {
              setNewEventDate(selectedDate || '2026-07-08');
              setShowAddModal(true);
            }}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Schedule Event
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Calendar Month Matrix */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600"></span>
              {monthName}
            </h3>
            <div className="flex items-center gap-1">
              <button disabled className="p-1 text-slate-300 rounded hover:bg-slate-50 cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button disabled className="p-1 text-slate-300 rounded hover:bg-slate-50 cursor-not-allowed">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 text-center font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 gap-1 border-t border-slate-50 pt-2">
            {calendarDays.map((cell, index) => {
              const isSelected = cell.dateString === selectedDate;
              const hasEvents = cell.dateString ? combinedEvents.some(e => e.date === cell.dateString) : false;
              const dayEvents = cell.dateString ? combinedEvents.filter(e => e.date === cell.dateString) : [];

              return (
                <div
                  key={index}
                  onClick={() => cell.dateString && setSelectedDate(cell.dateString)}
                  className={`min-h-[72px] p-1 border border-slate-100 rounded-lg flex flex-col justify-between transition-all relative ${
                    cell.dayNumber ? 'cursor-pointer' : 'bg-slate-50/20 opacity-30 select-none pointer-events-none'
                  } ${
                    isSelected ? 'ring-2 ring-indigo-600 bg-indigo-50/10 border-indigo-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-mono font-bold ${
                      isSelected ? 'text-indigo-600' : 'text-slate-500'
                    }`}>
                      {cell.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1 rounded-sm">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Micro event tags */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev, i) => (
                      <div
                        key={i}
                        title={ev.title}
                        className={`text-[8.5px] leading-tight px-1 py-0.5 rounded-xs truncate border font-medium ${
                          getEventBgColor(ev.type)
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[7.5px] text-slate-400 font-mono pl-1">
                        + {dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Selected Date Event Details */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs flex flex-col justify-between self-start">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Day Operations Inspector</span>
              <h3 className="font-bold font-sans text-sm mt-0.5 text-indigo-400">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}
              </h3>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {eventsOnSelectedDate.length === 0 ? (
                <div className="text-center py-10 text-slate-500 italic text-xs">
                  No corporate events scheduled for this day.
                </div>
              ) : (
                eventsOnSelectedDate.map((ev) => (
                  <div key={ev.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-1.5">
                      <span className={`text-[8px] uppercase font-mono px-1.5 py-0.5 rounded-xs font-bold border ${
                        ev.type === 'meeting' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900' :
                        ev.type === 'client-visit' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900' :
                        ev.type === 'leave' ? 'bg-rose-950/40 text-rose-400 border-rose-900' : 'bg-amber-950/40 text-amber-400 border-amber-900'
                      }`}>
                        {ev.type}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{ev.time}</span>
                      </div>
                    </div>

                    <h4 className="font-bold text-xs text-slate-200 tracking-tight leading-snug">{ev.title}</h4>
                    
                    {ev.description && (
                      <p className="text-[10.5px] text-slate-400 leading-relaxed italic">
                        "{ev.description}"
                      </p>
                    )}

                    {ev.attendees && ev.attendees.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5 items-center">
                        <Users className="h-3 w-3 text-slate-500 shrink-0" />
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mr-1">Attendees:</span>
                        {ev.attendees.map((att: string, idx: number) => (
                          <span key={idx} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-medium border border-slate-700/50">
                            {att}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 bg-slate-900">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <Info className="h-4.5 w-4.5 text-amber-400 shrink-0" />
              <p>Leaves approved in HRMS automatically block dates here in red.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs text-slate-700">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-indigo-600" />
                Schedule Operational Event
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-4 space-y-4">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Event Title / Purpose *</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded focus:outline-hidden text-xs"
                  placeholder="e.g. Acme SLA Sign-off Meeting"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Event Category Type</label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-xs"
                >
                  <option value="meeting">Internal/Client Meeting</option>
                  <option value="client-visit">Client On-site Visit</option>
                  <option value="follow-up">CRM Sales Follow-up</option>
                  <option value="other">Other Operations</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Scheduled Time</label>
                  <input
                    type="text"
                    required
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded text-xs"
                    placeholder="e.g. 11:30 AM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Narrative Description</label>
                <textarea
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-slate-200 rounded text-xs"
                  placeholder="Describe the objective of this event..."
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Attendees (Comma-separated names)</label>
                <input
                  type="text"
                  value={newEventAttendees}
                  onChange={(e) => setNewEventAttendees(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-xs"
                  placeholder="e.g. Marcus Aurelius, Sarah Connor"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer"
                >
                  Confirm Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
