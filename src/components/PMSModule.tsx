import React, { useState } from 'react';
import { 
  FolderGit, 
  Sparkles, 
  CheckSquare, 
  Calendar, 
  AlertOctagon, 
  TrendingUp, 
  Activity, 
  ChevronRight,
  ListTodo,
  CheckCircle,
  HelpCircle,
  Plus,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  IndianRupee,
  Folder,
  File,
  Lock,
  Unlock,
  Trash2,
  Download,
  Upload,
  UserCheck,
  ChevronLeft,
  AlertTriangle,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { Project, ProjectTask, ProjectRisk, SharedFile } from '../types';

interface PMSModuleProps {
  state: any;
  user: any;
  onRefresh: () => void;
  brandColor: string;
}

export default function PMSModule({ state, user, onRefresh, brandColor }: PMSModuleProps) {
  const { projects, tasks, files } = state;
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj_01');
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'kanban' | 'gantt' | 'risks' | 'files'>('tasks');

  // New task form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Kore Lovelace');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-07-20');

  // New file/folder form state
  const [showFileModal, setShowFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'file' | 'folder'>('file');
  const [newFilePermission, setNewFilePermission] = useState<'everyone' | 'approved-only'>('everyone');
  const [newFileSize, setNewFileSize] = useState('1.5 MB');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Super Admin', 'Accounts Manager']);

  // Current folder level in the File Sharing directory
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // AI Project Advisor state
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Active Project Context
  const activeProject = projects.find((p: Project) => p.id === selectedProjectId) || projects[0];
  const activeTasks = tasks.filter((t: ProjectTask) => t.projectId === selectedProjectId);

  // Simulated risks list for mapping
  const activeRisks: ProjectRisk[] = [
    { id: "risk_01", category: "Resource", probability: 4, impact: 3, mitigationPlan: "Hire contractors if Kore is overloaded on both SCM and Acme projects." },
    { id: "risk_02", category: "Technical", probability: 2, impact: 5, mitigationPlan: "Set up sandboxed staging environments for cloud SAML checks." },
    { id: "risk_03", category: "Budget", probability: 3, impact: 2, mitigationPlan: "Enforce strict scope guidelines before drafting final SLA documents." }
  ];

  // Toggle Subtask / Checkbox
  const handleToggleSubtask = async (task: ProjectTask, subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(sub => 
      sub.id === subtaskId ? { ...sub, isDone: !sub.isDone } : sub
    );
    
    // Check if all subtasks are done
    const allDone = updatedSubtasks.every(s => s.isDone);
    const newStatus = allDone ? 'Done' : 'InProgress';

    const updatedTask: ProjectTask = {
      ...task,
      subtasks: updatedSubtasks,
      status: newStatus as any
    };

    try {
      const res = await fetch('/api/state/tasks/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Change task status (used by Kanban)
  const handleChangeTaskStatus = async (task: ProjectTask, newStatus: 'Todo' | 'InProgress' | 'Done') => {
    const updatedTask: ProjectTask = {
      ...task,
      status: newStatus
    };

    try {
      const res = await fetch('/api/state/tasks/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;

    const payload: ProjectTask = {
      id: "task_" + Math.random().toString(36).substring(2, 9),
      projectId: selectedProjectId,
      title: newTaskTitle,
      assignedTo: newTaskAssignee,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      status: 'Todo',
      subtasks: [
        { id: `sub_${Math.random().toString(36).substring(2, 5)}`, title: 'Initial setup & draft design', isDone: false },
        { id: `sub_${Math.random().toString(36).substring(2, 5)}`, title: 'SLA verification check', isDone: false }
      ]
    };

    try {
      const res = await fetch('/api/state/tasks/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowTaskForm(false);
        setNewTaskTitle('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create File or Folder in current folder context
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName) return;

    const payload: SharedFile = {
      id: "fil_" + Math.random().toString(36).substring(2, 9),
      name: newFileName,
      type: newFileType,
      parentId: currentFolderId,
      size: newFileType === 'folder' ? '-' : newFileSize,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: user?.fullName || 'Super Admin',
      permission: newFilePermission,
      approvedRoles: newFilePermission === 'approved-only' ? selectedRoles : []
    };

    try {
      const res = await fetch('/api/state/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowFileModal(false);
        setNewFileName('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle roles selection for permissions
  const handleToggleRoleSelection = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    } else {
      setSelectedRoles(prev => [...prev, role]);
    }
  };

  // Trigger AI analysis via Gemini
  const handleAiAnalysis = async () => {
    setLoadingAI(true);
    setAiAnalysis('');
    try {
      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleType: 'Projects' })
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

  // Check file view permission
  const checkHasPermission = (file: SharedFile) => {
    if (file.permission === 'everyone') return true;
    if (!user) return true; // fallback
    const userRole = user.role;
    // matches role or is Super Admin
    if (userRole === 'Super Admin' || userRole === 'Super Admin (CEO)') return true;
    return file.approvedRoles.some(r => r.toLowerCase().trim() === userRole.toLowerCase().trim());
  };

  // Get current directory path list for breadcrumbs
  const getBreadcrumbs = () => {
    const list = [];
    let currentId = currentFolderId;
    while (currentId !== null) {
      const folder = files.find((f: SharedFile) => f.id === currentId);
      if (folder) {
        list.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return list;
  };

  const currentLevelFiles = (files || []).filter((f: SharedFile) => f.parentId === currentFolderId);

  // Styled Priority Badge Helper
  const renderPriorityBadge = (priority: 'Low' | 'Medium' | 'High') => {
    switch (priority) {
      case 'High':
        return (
          <span className="text-[10px] tracking-tight font-bold font-mono px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 shadow-3xs">
            High Priority
          </span>
        );
      case 'Medium':
        return (
          <span className="text-[10px] tracking-tight font-bold font-mono px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 shadow-3xs">
            Medium Priority
          </span>
        );
      case 'Low':
        return (
          <span className="text-[10px] tracking-tight font-bold font-mono px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 shadow-3xs">
            Low Priority
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Project Selector Sidebar/Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <FolderGit className="h-6 w-6 text-indigo-600" />
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Project Management (PMS)</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">Active Focus Project:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-bold text-slate-700 focus:outline-hidden"
              >
                {projects.map((p: Project) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.client})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`px-2.5 py-1 font-semibold rounded-md cursor-pointer transition-all ${activeSubTab === 'tasks' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Sprints
          </button>
          <button
            onClick={() => setActiveSubTab('kanban')}
            className={`px-2.5 py-1 font-semibold rounded-md cursor-pointer transition-all ${activeSubTab === 'kanban' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Kanban Board
          </button>
          <button
            onClick={() => setActiveSubTab('files')}
            className={`px-2.5 py-1 font-semibold rounded-md cursor-pointer transition-all ${activeSubTab === 'files' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            File Vault
          </button>
          <button
            onClick={() => setActiveSubTab('gantt')}
            className={`px-2.5 py-1 font-semibold rounded-md cursor-pointer transition-all ${activeSubTab === 'gantt' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Milestones
          </button>
          <button
            onClick={() => setActiveSubTab('risks')}
            className={`px-2.5 py-1 font-semibold rounded-md cursor-pointer transition-all ${activeSubTab === 'risks' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Risks
          </button>
        </div>
      </div>

      {/* Sprints Summary Card (USD converted to INR) */}
      {activeProject && (
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Project Target Client</span>
            <h3 className="font-bold text-slate-800 text-sm mt-0.5">{activeProject.client}</h3>
            <span className="text-[10px] text-slate-500 block">Manager: {activeProject.manager}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Time Scope</span>
            <div className="text-xs text-slate-700 font-medium mt-0.5 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{activeProject.startDate} to {activeProject.endDate}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Overall Deliverable Completion</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${activeProject.progress}%` }} 
                />
              </div>
              <span className="text-xs font-mono font-bold text-slate-800">{activeProject.progress}%</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">SLA Budget allocation</span>
            {/* Scale values: default budget/spent scaled to INR */}
            <span className="text-lg font-bold font-mono text-slate-800 flex items-center justify-end gap-0.5">
              <IndianRupee className="h-4 w-4" />{(activeProject.budget * 80).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block">Spent: ₹{(activeProject.spent * 80).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* 1. Tasks List Subtab */}
      {activeSubTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sprints Active Tasks List */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Sprint Backlog Directory</h3>
                <p className="text-[11px] text-slate-400">Interactive checkable subtasks. Completing checklists toggles progress.</p>
              </div>
              <button
                onClick={() => setShowTaskForm(true)}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Sprint Task
              </button>
            </div>

            {/* List Active Tasks */}
            <div className="space-y-4">
              {activeTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic">
                  No active tasks found in the sprint catalog.
                </div>
              ) : (
                activeTasks.map((task: ProjectTask) => (
                  <div key={task.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 hover:border-slate-200 transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-2 items-center">
                          {renderPriorityBadge(task.priority)}
                          <strong className="text-sm text-slate-800 font-sans tracking-tight">{task.title}</strong>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        task.status === 'Done' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                        task.status === 'InProgress' ? 'bg-blue-50 text-blue-800 border border-blue-100' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {task.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2.5 font-mono border-t border-slate-100/50 pt-2">
                      <span>Owner: <strong className="text-slate-700">{task.assignedTo}</strong></span>
                      <span>Due: <strong className="text-slate-700">{task.dueDate}</strong></span>
                    </div>

                    {/* Subtasks checklists */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Progress Checklist</p>
                        {task.subtasks.map(sub => (
                          <label key={sub.id} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                            <input
                              type="checkbox"
                              checked={sub.isDone}
                              onChange={() => handleToggleSubtask(task, sub.id)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                            />
                            <span className={sub.isDone ? 'line-through text-slate-400 font-mono' : 'font-medium'}>
                              {sub.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Project Advisor Panel */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-xs self-start">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              <h4 className="font-bold text-sm">AI Project Advisor</h4>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Provides intelligent resource predictions, critical path risk analyses, and workload optimization advice directly tailored to projects.
            </p>
            <button
              onClick={handleAiAnalysis}
              disabled={loadingAI}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loadingAI ? 'Analyzing Milestones...' : 'Query Project Advisor'}
            </button>

            {aiAnalysis && (
              <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10.5px] leading-relaxed text-slate-300 font-mono max-h-56 overflow-y-auto whitespace-pre-line">
                {aiAnalysis}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Interactive Kanban Board Subtab */}
      {activeSubTab === 'kanban' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Sprint Kanban Workflow</h3>
              <p className="text-[11px] text-slate-400">Interactive boards to drag or transition deliverables through operational phases.</p>
            </div>
            <button
              onClick={() => setShowTaskForm(true)}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columns: Todo, InProgress, Done */}
            {(['Todo', 'InProgress', 'Done'] as const).map(status => {
              const columnTasks = activeTasks.filter(t => t.status === status);
              return (
                <div key={status} className="bg-slate-50 border border-slate-150 rounded-xl p-4 min-h-[400px] flex flex-col space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-1">
                    <span className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        status === 'Todo' ? 'bg-slate-400' :
                        status === 'InProgress' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} />
                      {status === 'Todo' ? 'To Do' : status === 'InProgress' ? 'In Progress' : 'Completed'}
                    </span>
                    <span className="bg-slate-200 text-slate-700 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                    {columnTasks.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 italic text-[11px] border border-dashed border-slate-200 rounded-lg bg-white/50">
                        No tasks in this stage
                      </div>
                    ) : (
                      columnTasks.map((task: ProjectTask) => {
                        const totalSubtasks = task.subtasks ? task.subtasks.length : 0;
                        const doneSubtasks = task.subtasks ? task.subtasks.filter(s => s.isDone).length : 0;

                        return (
                          <div key={task.id} className="bg-white border border-slate-100 rounded-lg p-3.5 shadow-3xs space-y-3 hover:border-indigo-200 transition-all">
                            <div className="flex justify-between items-start gap-1">
                              {renderPriorityBadge(task.priority)}
                              
                              {/* Workflow Arrows */}
                              <div className="flex items-center gap-1 shrink-0">
                                {status !== 'Todo' && (
                                  <button
                                    onClick={() => handleChangeTaskStatus(task, status === 'Done' ? 'InProgress' : 'Todo')}
                                    title="Move back"
                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                                  >
                                    <ArrowLeft className="h-3 w-3" />
                                  </button>
                                )}
                                {status !== 'Done' && (
                                  <button
                                    onClick={() => handleChangeTaskStatus(task, status === 'Todo' ? 'InProgress' : 'Done')}
                                    title="Move forward"
                                    className="p-1 hover:bg-indigo-50 rounded text-slate-400 hover:text-indigo-600 cursor-pointer"
                                  >
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <h4 className="font-bold text-xs text-slate-800 leading-snug">{task.title}</h4>

                            {totalSubtasks > 0 && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                                  <span>Subtasks checklist:</span>
                                  <span>{doneSubtasks}/{totalSubtasks}</span>
                                </div>
                                <div className="bg-slate-100 h-1.5 rounded-full overflow-hidden w-full">
                                  <div 
                                    className="bg-indigo-600 h-full rounded-full transition-all"
                                    style={{ width: `${(doneSubtasks / totalSubtasks) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
                              <span className="truncate max-w-[80px]" title={task.assignedTo}>👤 {task.assignedTo}</span>
                              <span>📅 {task.dueDate}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. File Sharing Subtab (Access Restrictions & folders) */}
      {activeSubTab === 'files' && (
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Project File Vault & Assets Hub</h3>
              <p className="text-[11px] text-slate-400">Share design files, legal SLAs, and compliance certificates. Manage roles-based permission gates.</p>
            </div>
            
            <button
              onClick={() => {
                setNewFileType('file');
                setShowFileModal(true);
              }}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer shadow-xs transition-all self-start"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload / Create Item
            </button>
          </div>

          {/* Directory Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button 
              onClick={() => setCurrentFolderId(null)} 
              className={`hover:text-indigo-600 font-bold ${currentFolderId === null ? 'text-indigo-600' : ''}`}
            >
              Root Vault
            </button>
            {getBreadcrumbs().map((crumb) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                <button 
                  onClick={() => setCurrentFolderId(crumb.id)} 
                  className={`hover:text-indigo-600 font-bold ${currentFolderId === crumb.id ? 'text-indigo-600' : ''}`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Files grid view */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            
            {/* Go back folder card */}
            {currentFolderId !== null && (
              <div 
                onClick={() => {
                  const currentFolder = files.find((f: SharedFile) => f.id === currentFolderId);
                  setCurrentFolderId(currentFolder ? currentFolder.parentId : null);
                }}
                className="border border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <ChevronLeft className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-600">Go Up Level</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Back to parent directory</span>
                </div>
              </div>
            )}

            {currentLevelFiles.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 italic text-xs">
                No files or folders created in this directory. Click "Upload / Create Item" to seed a resource.
              </div>
            ) : (
              currentLevelFiles.map((file: SharedFile) => {
                const isFolder = file.type === 'folder';
                const hasAccess = checkHasPermission(file);

                return (
                  <div
                    key={file.id}
                    onClick={() => {
                      if (!hasAccess) return;
                      if (isFolder) setCurrentFolderId(file.id);
                    }}
                    className={`border rounded-xl p-4 flex flex-col justify-between h-36 transition-all ${
                      !hasAccess 
                        ? 'bg-slate-50/70 border-slate-200 opacity-65 cursor-not-allowed' 
                        : isFolder 
                        ? 'bg-indigo-50/10 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer' 
                        : 'bg-white border-slate-150 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                          {isFolder ? (
                            <Folder className={`h-5 w-5 ${hasAccess ? 'text-indigo-600' : 'text-slate-400'}`} />
                          ) : (
                            <File className={`h-5 w-5 ${hasAccess ? 'text-slate-600' : 'text-slate-400'}`} />
                          )}
                        </div>
                        
                        {/* Access badge indicator */}
                        <div>
                          {file.permission === 'approved-only' ? (
                            <div className="flex items-center gap-0.5 text-[8px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full font-mono font-bold">
                              <Lock className="h-2 w-2" />
                              Approved Only
                            </div>
                          ) : (
                            <div className="flex items-center gap-0.5 text-[8px] bg-slate-100 text-slate-600 border border-slate-150 px-1.5 py-0.5 rounded-full font-mono font-bold">
                              <Unlock className="h-2 w-2" />
                              Everyone
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </h4>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{file.size}</span>
                          <span>by {file.createdBy}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom controls / restraints */}
                    <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-[9px]">
                      {hasAccess ? (
                        <>
                          <span className="text-slate-400 font-mono">{file.createdAt}</span>
                          {!isFolder && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Downloading dynamic asset: ${file.name}`);
                              }}
                              className="text-indigo-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-rose-600 font-bold uppercase tracking-wide">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Restricted Access
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-[10.5px] leading-relaxed text-slate-500 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500 shrink-0" />
            <p>
              Your active session role is <strong className="text-indigo-600 uppercase font-mono">{user?.role || 'Super Admin'}</strong>. 
              {user?.role === 'Super Admin' || user?.role === 'Super Admin (CEO)'
                ? " As Super Admin, you have master-key access to bypass all compliance vaults." 
                : " Items marked as 'Approved Only' are locked unless your role has been white-listed."}
            </p>
          </div>
        </div>
      )}

      {/* 4. Gantt Timeline Subtab (Bespoke SVG) */}
      {activeSubTab === 'gantt' && (
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-800">Critical Milestone Gantt Timeline</h3>
            <p className="text-xs text-slate-400">Mapped milestones schedules for active focus project</p>
          </div>

          <div className="relative h-60 w-full overflow-x-auto">
            <svg viewBox="0 0 600 200" className="w-full h-full min-w-[500px]">
              {/* Timeline headers */}
              <rect x="0" y="0" width="600" height="30" fill="#f8fafc" />
              <text x="50" y="20" fill="#64748b" fontSize="10" fontWeight="bold" fontFamily="monospace">PROJECT SCOPE</text>
              <text x="200" y="20" fill="#64748b" fontSize="10" fontWeight="bold" fontFamily="monospace">JULY</text>
              <text x="350" y="20" fill="#64748b" fontSize="10" fontWeight="bold" fontFamily="monospace">AUGUST</text>
              <text x="500" y="20" fill="#64748b" fontSize="10" fontWeight="bold" fontFamily="monospace">SEPTEMBER</text>

              {/* Grid delimiters */}
              <line x1="180" y1="0" x2="180" y2="200" stroke="#e2e8f0" />
              <line x1="320" y1="0" x2="320" y2="200" stroke="#e2e8f0" strokeDasharray="2 2" />
              <line x1="460" y1="0" x2="460" y2="200" stroke="#e2e8f0" strokeDasharray="2 2" />

              {/* Gantt Row 1 (Milestone: SLA Sign-off) */}
              <text x="10" y="65" fill="#334155" fontSize="11" fontWeight="bold">SLA Sign-off</text>
              <rect x="190" y="55" width="100" height="15" rx="3" fill="#818cf8" />
              <text x="200" y="66" fill="#ffffff" fontSize="9" fontWeight="bold">Completed</text>

              {/* Gantt Row 2 (Milestone: SAML Database Auth) */}
              <text x="10" y="115" fill="#334155" fontSize="11" fontWeight="bold">SAML Auth db</text>
              <rect x="250" y="105" width="160" height="15" rx="3" fill="#6366f1" />
              <text x="260" y="116" fill="#ffffff" fontSize="9" fontWeight="bold">Active Sprint</text>

              {/* Gantt Row 3 (Milestone: Compliance Auditing) */}
              <text x="10" y="165" fill="#334155" fontSize="11" fontWeight="bold">Compliance Audits</text>
              <rect x="380" y="155" width="180" height="15" rx="3" fill="#cbd5e1" />
              <text x="390" y="166" fill="#475569" fontSize="9" fontWeight="bold">Scheduled</text>
            </svg>
          </div>
        </div>
      )}

      {/* 5. Risk Heat Map Tab */}
      {activeSubTab === 'risks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heat map block */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Milestone Risk Severity Heat Map</h3>
            
            <div className="relative h-60 w-full flex items-center justify-center">
              <svg viewBox="0 0 250 250" className="w-56 h-56 overflow-visible">
                {/* 3x3 Heat matrix grid background */}
                <rect x="30" y="30" width="60" height="60" fill="#fecaca" opacity="0.6" title="Critical Area" />
                <rect x="90" y="30" width="60" height="60" fill="#fecaca" opacity="0.4" />
                <rect x="150" y="30" width="60" height="60" fill="#fee2e2" opacity="0.4" />

                <rect x="30" y="90" width="60" height="60" fill="#fed7aa" opacity="0.5" />
                <rect x="90" y="90" width="60" height="60" fill="#fed7aa" opacity="0.3" />
                <rect x="150" y="90" width="60" height="60" fill="#fef3c7" opacity="0.3" />

                <rect x="30" y="150" width="60" height="60" fill="#d1fae5" opacity="0.5" />
                <rect x="90" y="150" width="60" height="60" fill="#d1fae5" opacity="0.3" />
                <rect x="150" y="150" width="60" height="60" fill="#f1f5f9" opacity="0.4" />

                {/* X and Y axes */}
                <line x1="30" y1="210" x2="210" y2="210" stroke="#475569" strokeWidth="1.5" />
                <line x1="30" y1="30" x2="30" y2="210" stroke="#475569" strokeWidth="1.5" />

                <text x="120" y="230" fill="#475569" fontSize="10" textAnchor="middle" fontWeight="bold">PROBABILITY</text>
                <text x="10" y="120" fill="#475569" fontSize="10" textAnchor="middle" transform="rotate(-90 10 120)" fontWeight="bold">IMPACT</text>

                {/* Active Risk mapped nodes */}
                <circle cx="140" cy="110" r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                <text x="140" y="113" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">R1</text>

                <circle cx="70" cy="50" r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
                <text x="70" y="53" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">R2</text>
              </svg>
            </div>
          </div>

          {/* Active Mitigation List */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Risk Log & Active Mitigations</h3>
            <div className="space-y-3 text-xs">
              {activeRisks.map((risk, index) => (
                <div key={risk.id} className="p-3 border border-slate-100 bg-slate-50/40 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">
                      R{index + 1} - Category: {risk.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Prob: {risk.probability} / Impact: {risk.impact}
                    </span>
                  </div>
                  <p className="text-slate-600 italic">Mitigation Plan: "{risk.mitigationPlan}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Task Creator Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full overflow-hidden text-slate-700">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">Add Sprint Task</h3>
              <button onClick={() => setShowTaskForm(false)} className="text-slate-400 hover:text-slate-700 font-bold">X</button>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 space-y-4">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Sprint Deliverable Name *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded focus:outline-hidden text-xs"
                  placeholder="e.g. Audit API gateway endpoints"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Assigned Resource</label>
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-xs"
                >
                  <option value="Marcus Aurelius">Marcus Aurelius</option>
                  <option value="Hypatia Architect">Hypatia Architect</option>
                  <option value="Kore Lovelace">Kore Lovelace</option>
                  <option value="Winston Smith">Winston Smith</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer shadow-xs transition-all"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload File / Folder Creator Modal */}
      {showFileModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full overflow-hidden text-slate-700">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Upload className="h-4 w-4 text-indigo-600" />
                Upload / Create Asset
              </h3>
              <button onClick={() => setShowFileModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">X</button>
            </div>

            <form onSubmit={handleCreateFile} className="p-4 space-y-4">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Asset Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="fileType" 
                      checked={newFileType === 'file'} 
                      onChange={() => setNewFileType('file')} 
                    />
                    <span>Compliance File</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="fileType" 
                      checked={newFileType === 'folder'} 
                      onChange={() => setNewFileType('folder')} 
                    />
                    <span>New Directory Folder</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">
                  {newFileType === 'folder' ? 'Folder Directory Name *' : 'File Asset Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded focus:outline-hidden text-xs"
                  placeholder={newFileType === 'folder' ? 'e.g. Design Wireframes' : 'e.g. SLA-Proposal-Acme.pdf'}
                />
              </div>

              {newFileType === 'file' && (
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Mock File Size</label>
                  <select
                    value={newFileSize}
                    onChange={(e) => setNewFileSize(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value="1.2 MB">1.2 MB</option>
                    <option value="3.5 MB">3.5 MB</option>
                    <option value="840 KB">840 KB</option>
                    <option value="12.4 MB">12.4 MB</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Privacy Access Level</label>
                <select
                  value={newFilePermission}
                  onChange={(e) => setNewFilePermission(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-xs"
                >
                  <option value="everyone">Access to Everyone (Public Corporate)</option>
                  <option value="approved-only">Approved Team Members Only (Restricted Vault)</option>
                </select>
              </div>

              {newFilePermission === 'approved-only' && (
                <div className="space-y-2 bg-slate-50 p-2.5 rounded border border-slate-150">
                  <span className="block text-[10px] uppercase font-mono font-bold text-slate-500">Whitelist Allowed Corporate Roles:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {['Super Admin', 'Corporate Controller', 'HR Manager', 'Developer', 'Client'].map((role) => (
                      <label key={role} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role)}
                          onChange={() => handleToggleRoleSelection(role)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFileModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer transition-all"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
