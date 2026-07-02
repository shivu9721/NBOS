import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  Plus, 
  Filter, 
  Search, 
  Trash2, 
  ArrowRight, 
  UserCheck, 
  Award, 
  Percent, 
  FileText,
  Mail,
  X,
  TrendingUp,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { Lead, LeadStatus } from '../types';

interface CRMModuleProps {
  state: any;
  onRefresh: () => void;
  brandColor: string;
}

export default function CRMModule({ state, onRefresh, brandColor }: CRMModuleProps) {
  const { leads } = state;
  const [activeTab, setActiveTab] = useState<'kanban' | 'leads'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Lead Creation Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadJob, setNewLeadJob] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadBudget, setNewLeadBudget] = useState(100000);
  const [newLeadPriority, setNewLeadPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newLeadStatus, setNewLeadStatus] = useState<LeadStatus>('New');
  const [newLeadIndustry, setNewLeadIndustry] = useState('Enterprise Software');
  const [newLeadNote, setNewLeadNote] = useState('');

  // AI Assistant Proposal State
  const [selectedLeadForAI, setSelectedLeadForAI] = useState<Lead | null>(null);
  const [aiProposalText, setAiProposalText] = useState('');
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiInsights, setAiInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Filtered Leads
  const filteredLeads = leads.filter((lead: Lead) => {
    const matchesSearch = 
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const stats = {
    total: leads.length,
    proposal: leads.filter((l: Lead) => l.status === 'Proposal').length,
    negotiation: leads.filter((l: Lead) => l.status === 'Negotiation').length,
    won: leads.filter((l: Lead) => l.status === 'Won').length,
    lost: leads.filter((l: Lead) => l.status === 'Lost').length,
    totalBudget: leads.reduce((sum: number, l: Lead) => sum + (l.estimatedBudget || 0), 0)
  };

  // Mutate Lead (Change Status)
  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    const leadToUpdate = leads.find((l: Lead) => l.id === leadId);
    if (!leadToUpdate) return;
    
    try {
      const res = await fetch('/api/state/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leadToUpdate, status: newStatus })
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Create New Lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadCompany || !newLeadName || !newLeadEmail) return;

    const payload = {
      companyName: newLeadCompany,
      contactName: newLeadName,
      jobTitle: newLeadJob,
      email: newLeadEmail,
      phone: newLeadPhone,
      country: 'United States',
      industry: newLeadIndustry,
      status: newLeadStatus,
      priority: newLeadPriority,
      estimatedBudget: Number(newLeadBudget),
      assignedSalesperson: 'Lucius Seneca',
      leadScore: Math.floor(40 + Math.random() * 55), // Random initial score
      notes: newLeadNote ? [newLeadNote] : ['Lead registered via Manual CRM Intake.']
    };

    try {
      const res = await fetch('/api/state/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowCreateModal(false);
        // Reset inputs
        setNewLeadName('');
        setNewLeadCompany('');
        setNewLeadJob('');
        setNewLeadEmail('');
        setNewLeadPhone('');
        setNewLeadNote('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate AI proposal outreach using Gemini
  const handleGenerateProposal = async (lead: Lead) => {
    setSelectedLeadForAI(lead);
    setGeneratingProposal(true);
    setAiProposalText('');
    setAiError('');
    try {
      const res = await fetch('/api/gemini/draft-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id })
      });
      const data = await res.json();
      if (data.success) {
        setAiProposalText(data.text);
      } else {
        setAiError(data.error || 'Failed to generate proposal.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Server connection failed.');
    } finally {
      setGeneratingProposal(false);
      onRefresh(); // Refresh logs to update usage counts
    }
  };

  // Generate general pipeline advice
  const handleGetPipelineInsights = async () => {
    setLoadingInsights(true);
    setAiInsights('');
    try {
      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleType: 'CRM' })
      });
      const data = await res.json();
      if (data.success) {
        setAiInsights(data.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
      onRefresh();
    }
  };

  // Kanban Columns
  const columns: { label: string; status: LeadStatus; color: string }[] = [
    { label: 'New Intake', status: 'New', color: 'bg-slate-100 border-slate-200 text-slate-800' },
    { label: 'Contacted', status: 'Contacted', color: 'bg-blue-50 border-blue-100 text-blue-800' },
    { label: 'Qualified', status: 'Qualified', color: 'bg-purple-50 border-purple-100 text-purple-800' },
    { label: 'Proposal Out', status: 'Proposal', color: 'bg-amber-50 border-amber-100 text-amber-800' },
    { label: 'Won Deal', status: 'Won', color: 'bg-emerald-50 border-emerald-100 text-emerald-800' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Enterprise CRM Engine</h2>
          <p className="text-xs text-slate-500">Manage customer acquisition pipelines and automate outreach templates.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'kanban' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Sales Kanban
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'leads' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Leads Database
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Lead
          </button>
        </div>
      </div>

      {/* CRM Metric Dials */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-100 rounded-lg p-3.5 text-center">
          <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Pipeline Total</p>
          <p className="text-xl font-bold font-mono text-slate-800 mt-1">${(stats.totalBudget / 1000).toFixed(0)}k</p>
          <span className="text-[9px] text-slate-500">{stats.total} leads total</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-lg p-3.5 text-center">
          <p className="text-[10px] uppercase font-mono tracking-wider text-amber-500">Proposals</p>
          <p className="text-xl font-bold font-mono text-amber-600 mt-1">{stats.proposal}</p>
          <span className="text-[9px] text-slate-500">Awaiting customer sign-off</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-lg p-3.5 text-center">
          <p className="text-[10px] uppercase font-mono tracking-wider text-purple-500">Negotiations</p>
          <p className="text-xl font-bold font-mono text-purple-600 mt-1">{stats.negotiation}</p>
          <span className="text-[9px] text-slate-500">Contract refinement phase</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-lg p-3.5 text-center">
          <p className="text-[10px] uppercase font-mono tracking-wider text-emerald-500">Deals Won</p>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">{stats.won}</p>
          <span className="text-[9px] text-emerald-500 font-medium">Conversion success</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-lg p-3.5 text-center col-span-2 md:col-span-1">
          <p className="text-[10px] uppercase font-mono tracking-wider text-rose-500">Deals Lost</p>
          <p className="text-xl font-bold font-mono text-slate-600 mt-1">{stats.lost}</p>
          <span className="text-[9px] text-slate-500">Archived outputs</span>
        </div>
      </div>

      {/* Main CRM Workspace */}
      {activeTab === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map(col => {
            const colLeads = leads.filter((l: Lead) => l.status === col.status);
            return (
              <div key={col.status} className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex flex-col min-w-[200px] h-[480px]">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-3">
                  <span className="text-xs font-bold text-slate-800 tracking-tight">{col.label}</span>
                  <span className="text-[10px] font-mono font-semibold bg-slate-200/60 text-slate-700 px-1.5 py-0.5 rounded">
                    {colLeads.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colLeads.length === 0 ? (
                    <div className="text-center py-10 text-[10px] text-slate-400 italic">
                      Empty column
                    </div>
                  ) : (
                    colLeads.map((lead: Lead) => (
                      <div 
                        key={lead.id} 
                        className="bg-white border border-slate-100 rounded-lg p-3 shadow-xs hover:shadow-sm hover:border-slate-200 transition-all group"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{lead.companyName}</span>
                          <span className={`text-[8px] font-mono uppercase px-1 rounded ${
                            lead.priority === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {lead.priority}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{lead.contactName}</p>
                        
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-mono font-bold text-slate-700">${(lead.estimatedBudget || 0).toLocaleString()}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleGenerateProposal(lead)}
                              title="AI Proposal Outbound"
                              className="p-1 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded transition-colors cursor-pointer"
                            >
                              <Sparkles className="h-3 w-3" />
                            </button>
                            <select
                              value={lead.status}
                              onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                              className="text-[9px] font-semibold bg-slate-50 border border-slate-200 rounded p-0.5 text-slate-600"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Qualified">Qualified</option>
                              <option value="Proposal">Proposal</option>
                              <option value="Negotiation">Negot.</option>
                              <option value="Won">Won</option>
                              <option value="Lost">Lost</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Leads Database Table */
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads, domains, contact names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs bg-white pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                <Filter className="h-3.5 w-3.5" />
                Filter Stage:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Stages</option>
                <option value="New">New Intake</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal Out</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Deal Won</option>
                <option value="Lost">Deal Lost</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[10px] tracking-wider bg-slate-50/30">
                  <th className="p-4">Company & Industry</th>
                  <th className="p-4">Primary Contact</th>
                  <th className="p-4 text-center">Lead Score</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400 italic">
                      No corporate leads matched standard filters.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead: Lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{lead.companyName}</div>
                        <div className="text-[10px] text-slate-400">{lead.industry}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-700">{lead.contactName}</div>
                        <div className="text-[10px] text-slate-400">{lead.email}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                          lead.leadScore >= 80 ? 'bg-emerald-50 text-emerald-700' :
                          lead.leadScore >= 60 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {lead.leadScore}%
                        </span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-700">
                        ${(lead.estimatedBudget || 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-slate-50 text-slate-700">
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleGenerateProposal(lead)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-semibold inline-flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Sparkles className="h-3 w-3" />
                          Draft Outbound
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dynamic AI Outreach Builder Panel */}
      {(selectedLeadForAI || aiInsights) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
          <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm">AI CRM Assistant Panel</h4>
                <p className="text-[10px] text-slate-400">Secure output review before external sharing</p>
              </div>
            </div>
            <button 
              onClick={() => { setSelectedLeadForAI(null); setAiInsights(''); }}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {selectedLeadForAI && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400">Drafting Proposal for:</span>{' '}
                  <strong className="text-indigo-300">{selectedLeadForAI.companyName}</strong> ({selectedLeadForAI.contactName})
                </div>
                <button
                  onClick={() => handleGenerateProposal(selectedLeadForAI)}
                  disabled={generatingProposal}
                  className="px-2 py-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold disabled:opacity-50 cursor-pointer"
                >
                  Regenerate
                </button>
              </div>

              {generatingProposal ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-indigo-400" />
                  <p className="text-xs font-mono">Running secure prompt builder on gemini-3.5-flash...</p>
                </div>
              ) : aiProposalText ? (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 max-h-60 overflow-y-auto text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-line">
                  {aiProposalText}
                </div>
              ) : aiError ? (
                <p className="text-xs text-rose-400">{aiError}</p>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Ask CRM Director Advisory Button */}
      <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Awaiting lead conversion strategies?
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">Let Gemini analyze current priorities and suggest immediate salesperson targets.</p>
        </div>
        <div>
          <button
            onClick={handleGetPipelineInsights}
            disabled={loadingInsights}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loadingInsights ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Generate Pipeline Insights
          </button>
        </div>
      </div>

      {aiInsights && (
        <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl p-5 mt-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
            <span className="text-xs font-mono text-indigo-400">AI DIRECTORS PIPELINE ADVISORY REPORT</span>
            <button onClick={() => setAiInsights('')} className="text-slate-400 hover:text-white text-xs">Clear</button>
          </div>
          <div className="text-xs leading-relaxed space-y-2 whitespace-pre-wrap">
            {aiInsights}
          </div>
        </div>
      )}

      {/* Manual Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-600" />
                Intake Manual Corporate Lead
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadCompany}
                    onChange={(e) => setNewLeadCompany(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded focus:outline-hidden focus:border-indigo-500"
                    placeholder="Acme Inc"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded focus:outline-hidden focus:border-indigo-500"
                    placeholder="Sarah Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Job Title</label>
                  <input
                    type="text"
                    value={newLeadJob}
                    onChange={(e) => setNewLeadJob(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded"
                    placeholder="Director of Operations"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Industry</label>
                  <input
                    type="text"
                    value={newLeadIndustry}
                    onChange={(e) => setNewLeadIndustry(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Email *</label>
                  <input
                    type="email"
                    required
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded"
                    placeholder="sarah@acme.com"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Phone</label>
                  <input
                    type="text"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded"
                    placeholder="+1 (555) 012-3456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1 font-semibold">Estimated Budget ($)</label>
                  <input
                    type="number"
                    value={newLeadBudget}
                    onChange={(e) => setNewLeadBudget(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Priority</label>
                  <select
                    value={newLeadPriority}
                    onChange={(e) => setNewLeadPriority(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Note / Requirement Summary</label>
                <textarea
                  value={newLeadNote}
                  onChange={(e) => setNewLeadNote(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded h-16 resize-none"
                  placeholder="Needs custom SSO integration and high data privacy compliance reports..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer"
                >
                  Save Corporate Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
