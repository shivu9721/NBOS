import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Clock, 
  Smile, 
  Users, 
  Calendar,
  AlertCircle,
  Plus,
  RefreshCw,
  Cpu,
  BadgeAlert,
  Fingerprint
} from 'lucide-react';
import { motion } from 'motion/react';
import { Employee, LeaveRequest } from '../types';

interface HRMSModuleProps {
  state: any;
  onRefresh: () => void;
  brandColor: string;
}

export default function HRMSModule({ state, onRefresh, brandColor }: HRMSModuleProps) {
  const { employees, leaveRequests } = state;
  const [activeTab, setActiveTab] = useState<'employees' | 'leave' | 'attendance'>('employees');

  // Attendance Punch Simulator state
  const [attendanceStatus, setAttendanceStatus] = useState<'Out' | 'In'>('Out');
  const [attendanceMsg, setAttendanceMsg] = useState('Awaiting fingerprint check-in...');
  const [punchLogs, setPunchLogs] = useState<{ time: string; type: 'CheckIn' | 'CheckOut' }[]>([]);

  // Leave Form State
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveEmployee, setLeaveEmployee] = useState('emp_05'); // Kore Lovelace
  const [leaveType, setLeaveType] = useState<'Casual' | 'Sick' | 'Earned'>('Casual');
  const [leaveStart, setLeaveStart] = useState('2026-07-15');
  const [leaveEnd, setLeaveEnd] = useState('2026-07-18');
  const [leaveReason, setLeaveReason] = useState('');

  // AI HR Advisor state
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Trigger check-in / check-out punch
  const handlePunch = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const punchType = attendanceStatus === 'Out' ? 'CheckIn' : 'CheckOut';
    
    setAttendanceStatus(attendanceStatus === 'Out' ? 'In' : 'Out');
    setAttendanceMsg(attendanceStatus === 'Out' 
      ? `Successfully Punched IN at ${timeStr} EST. Timesheet session initiated.`
      : `Successfully Punched OUT at ${timeStr} EST. Timesheet archived.`
    );
    
    setPunchLogs(prev => [{ time: timeStr, type: punchType }, ...prev]);
  };

  // Submit Leave Claim
  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e: Employee) => e.employeeId === leaveEmployee);
    if (!emp) return;

    const payload = {
      employeeId: leaveEmployee,
      employeeName: emp.fullName,
      type: leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason || 'Vacation',
      status: 'Pending'
    };

    try {
      const res = await fetch('/api/state/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowLeaveForm(false);
        setLeaveReason('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger AI HR analysis via Gemini
  const handleAiAdvice = async () => {
    setLoadingAI(true);
    setAiAnalysis('');
    try {
      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleType: 'HR' })
      });
      const data = await res.json();
      if (data.success) {
        setAiAnalysis(data.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Human Resources (HRMS)</h2>
          <p className="text-xs text-slate-500">Track corporate directory, submit vacation schedules, and simulate secure timesheet checks.</p>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3 py-1 font-semibold rounded-md cursor-pointer transition-all ${activeTab === 'employees' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
          >
            Staff Directory
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1 font-semibold rounded-md cursor-pointer transition-all ${activeTab === 'attendance' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
          >
            Attendance Scanner
          </button>
          <button
            onClick={() => setActiveTab('leave')}
            className={`px-3 py-1 font-semibold rounded-md cursor-pointer transition-all ${activeTab === 'leave' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'}`}
          >
            Leave Requests
          </button>
        </div>
      </div>

      {/* Main HRMS Workspace */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Registry */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden lg:col-span-2">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-sm text-slate-800">Corporate Staff Directory</h3>
              <p className="text-xs text-slate-400">Total authorized accounts in organization</p>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-mono uppercase text-[10px] tracking-wider text-slate-400 bg-slate-50/30">
                  <th className="p-4">Employee ID & Name</th>
                  <th className="p-4">Department & Role</th>
                  <th className="p-4 text-center">Leave Balance</th>
                  <th className="p-4">Salary Allocation</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.map((e: Employee) => (
                  <tr key={e.employeeId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{e.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{e.employeeId} • {e.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-700">{e.designation}</div>
                      <div className="text-[10px] text-slate-400">{e.department}</div>
                    </td>
                    <td className="p-4 text-center font-mono font-semibold text-slate-700">{e.leaveBalance} Days</td>
                    <td className="p-4 font-mono font-bold text-slate-800">${e.salary.toLocaleString()}/yr</td>
                    <td className="p-4 text-right">
                      <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI HR Recruiter Panel */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-xs self-start">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              <h4 className="font-bold text-sm">AI HR Director</h4>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Provides intelligent workforce predictions, highlights staffing gaps, and analyzes leaves trends utilizing server-side Gemini.
            </p>
            <button
              onClick={handleAiAdvice}
              disabled={loadingAI}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loadingAI ? 'Scanning workforce...' : 'Query HR Insights'}
            </button>

            {aiAnalysis && (
              <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10.5px] leading-relaxed text-slate-300 font-mono max-h-52 overflow-y-auto whitespace-pre-line">
                {aiAnalysis}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attendance Biometric Punch Simulator */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badge punch area */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-5">
            <Fingerprint className="h-16 w-16 text-indigo-600 animate-pulse" />
            <div>
              <h3 className="font-bold text-slate-800 text-base">NeuNet Fingerprint Badge Scanner</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">Simulate corporate touchless attendance logs for payroll-ready checks.</p>
            </div>

            <button
              onClick={handlePunch}
              className={`px-8 py-3.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                attendanceStatus === 'Out' 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {attendanceStatus === 'Out' ? 'TAP FINGER TO CHECK-IN' : 'TAP FINGER TO CHECK-OUT'}
            </button>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-mono text-slate-500">
              {attendanceMsg}
            </div>
          </div>

          {/* Punch logs */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-3 mb-4">Live Session Timesheet Logs</h3>
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {punchLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic text-xs">
                  No attendance punches recorded in this session.
                </div>
              ) : (
                punchLogs.map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2.5 border border-slate-100 rounded bg-slate-50/50 font-mono">
                    <span className="font-semibold text-slate-700">Winston Smith</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.type === 'CheckIn' ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {log.type} • {log.time}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leave Management list */}
      {activeTab === 'leave' && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Vacation & Sick Leave Claims</h3>
              <p className="text-xs text-slate-400">Manage leave approvals for salary calculations</p>
            </div>
            <button
              onClick={() => setShowLeaveForm(true)}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Apply Leave
            </button>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 font-mono uppercase text-[10px] tracking-wider text-slate-400 bg-slate-50/30">
                <th className="p-4">Employee ID & Name</th>
                <th className="p-4">Vacation Type</th>
                <th className="p-4">Schedule Dates</th>
                <th className="p-4">Narrative Reason</th>
                <th className="p-4 text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leaveRequests.map((r: LeaveRequest) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{r.employeeName}</td>
                  <td className="p-4">
                    <span className="inline-block px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700">
                      {r.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-[10px]">{r.startDate} to {r.endDate}</td>
                  <td className="p-4 text-slate-500 italic">"{r.reason}"</td>
                  <td className="p-4 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      r.status === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leave Modal form */}
      {showLeaveForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">Submit Vacation Leave Claim</h3>
              <button onClick={() => setShowLeaveForm(false)} className="text-slate-400 hover:text-slate-700">X</button>
            </div>

            <form onSubmit={handleCreateLeave} className="p-4 space-y-4">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Select Employee Account *</label>
                <select
                  value={leaveEmployee}
                  onChange={(e) => setLeaveEmployee(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-[11px]"
                >
                  {employees.map((e: any) => (
                    <option key={e.employeeId} value={e.employeeId}>{e.fullName} ({e.designation})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Leave Type</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-[11px]"
                  >
                    <option value="Casual">Casual</option>
                    <option value="Sick">Sick</option>
                    <option value="Earned">Earned</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1 font-semibold">Leave Reason</label>
                  <input
                    type="text"
                    required
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded text-[11px]"
                    placeholder="Medical checkup / Annual trip"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Start Date</label>
                  <input
                    type="date"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">End Date</label>
                  <input
                    type="date"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveForm(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer"
                >
                  Post Vacancies Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
