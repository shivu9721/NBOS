import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  BookOpen, 
  FolderGit, 
  Briefcase, 
  Package, 
  Sparkles, 
  Settings, 
  Menu, 
  X, 
  Search, 
  Bell, 
  Clock, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database,
  RefreshCw,
  Cpu,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import Custom Modules
import FounderDashboard from './components/FounderDashboard';
import CRMModule from './components/CRMModule';
import ERPModule from './components/ERPModule';
import PMSModule from './components/PMSModule';
import HRMSModule from './components/HRMSModule';
import InventoryModule from './components/InventoryModule';
import AIPlatform from './components/AIPlatform';
import SaaSAdmin from './components/SaaSAdmin';

export default function App() {
  const [dbState, setDbState] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Navigation State
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  // Floating grounded AI Assistant panel state
  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ sender: 'user' | 'agent'; text: string }[]>([
    { sender: 'agent', text: 'I am your unified co-pilot. I have deep-grounding access to your databases. Ask me anything about accounts, stock shortages, or critical project risks.' }
  ]);

  // Global search input
  const [globalSearch, setGlobalSearch] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Notification status
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Sync state from server
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      setDbState(data);
    } catch (err: any) {
      setErrorMsg('Failed to connect to full-stack NeuNet corporate server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset entire mock database to corporate pristine states
  const handleEmergencyReset = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/state/reset', { method: 'POST' });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Send Floating AI query
  const handleFloatingAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const userMsg = aiInput;
    setAiInput('');
    setAiMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      if (data.success) {
        setAiMessages(prev => [...prev, { sender: 'agent', text: data.text }]);
      } else {
        setAiMessages(prev => [...prev, { sender: 'agent', text: `Connection Error: ${data.error || 'Check server variables.'}` }]);
      }
    } catch (err: any) {
      setAiMessages(prev => [...prev, { sender: 'agent', text: `Network Error: ${err.message}` }]);
    } finally {
      setAiLoading(false);
      fetchState(); // Refresh AI Logs
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Cpu className="h-10 w-10 text-indigo-600 animate-spin" />
        <h2 className="text-sm font-mono text-slate-600 mt-4">Initializing NeuNet Business OS (NBOS) Services...</h2>
        <p className="text-xs text-slate-400 mt-1">Acquiring sandbox isolation and mounting Vite dev endpoints.</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto space-y-4">
        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
          <Database className="h-12 w-12 mx-auto" />
          <h2 className="text-base font-bold mt-3 font-sans">Full-Stack Connectivity Lost</h2>
          <p className="text-xs mt-1 text-slate-500">{errorMsg}</p>
        </div>
        <button 
          onClick={fetchState}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { organization, leads, accounts, projects, employees, products, aiLogs } = dbState;
  const modules = organization.moduleStatus;

  // Global search calculations
  const globalMatches: { type: string; title: string; subtitle: string; target: string }[] = [];
  if (globalSearch.trim().length > 1) {
    // Search Leads
    leads.forEach((l: any) => {
      if (l.companyName.toLowerCase().includes(globalSearch.toLowerCase()) || l.contactName.toLowerCase().includes(globalSearch.toLowerCase())) {
        globalMatches.push({ type: 'CRM Lead', title: l.companyName, subtitle: `Contact: ${l.contactName}`, target: 'crm' });
      }
    });
    // Search Accounts
    accounts.forEach((a: any) => {
      if (a.name.toLowerCase().includes(globalSearch.toLowerCase()) || a.code.includes(globalSearch)) {
        globalMatches.push({ type: 'ERP Account', title: `${a.code} - ${a.name}`, subtitle: `Balance: $${a.balance.toLocaleString()}`, target: 'erp' });
      }
    });
    // Search Projects
    projects.forEach((p: any) => {
      if (p.name.toLowerCase().includes(globalSearch.toLowerCase()) || p.client.toLowerCase().includes(globalSearch.toLowerCase())) {
        globalMatches.push({ type: 'PMS Project', title: p.name, subtitle: `Client: ${p.client} | ${p.progress}%`, target: 'pms' });
      }
    });
    // Search Employees
    employees.forEach((e: any) => {
      if (e.fullName.toLowerCase().includes(globalSearch.toLowerCase()) || e.department.toLowerCase().includes(globalSearch.toLowerCase())) {
        globalMatches.push({ type: 'HRMS Staff', title: e.fullName, subtitle: `${e.designation} (${e.department})`, target: 'hrms' });
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex text-slate-800 antialiased font-sans text-xs">
      
      {/* 1. COLLAPSIBLE LEFT SIDEBAR */}
      <aside 
        className={`bg-slate-900 text-slate-300 flex flex-col border-r border-slate-850 shrink-0 transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-56' : 'w-16'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 shrink-0">
              <Building className="h-5 w-5" />
            </div>
            {sidebarOpen && (
              <div className="text-left leading-tight">
                <span className="font-bold text-white text-xs block tracking-tight truncate max-w-[120px]">
                  {organization.name}
                </span>
                <span className="text-[9px] uppercase font-mono text-indigo-400 tracking-wider">
                  Business OS
                </span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Routes */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {/* Main Cockpit always visible */}
          <button
            onClick={() => setActiveModule('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeModule === 'dashboard' 
                ? 'bg-indigo-600 text-white font-bold' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Building className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Executive Cockpit</span>}
          </button>

          {/* CRM Module (Toggled via SaaS Admin) */}
          {modules.crm && (
            <button
              onClick={() => setActiveModule('crm')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeModule === 'crm' 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Users className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>Enterprise CRM</span>}
            </button>
          )}

          {/* ERP Module */}
          {modules.erp && (
            <button
              onClick={() => setActiveModule('erp')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeModule === 'erp' 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>Ledger & ERP</span>}
            </button>
          )}

          {/* PMS Module */}
          {modules.pms && (
            <button
              onClick={() => setActiveModule('pms')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeModule === 'pms' 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <FolderGit className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>Project PMS</span>}
            </button>
          )}

          {/* HRMS Module */}
          {modules.hrms && (
            <button
              onClick={() => setActiveModule('hrms')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeModule === 'hrms' 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Briefcase className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>Staff HRMS</span>}
            </button>
          )}

          {/* Inventory Module */}
          {modules.inventory && (
            <button
              onClick={() => setActiveModule('inventory')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeModule === 'inventory' 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Package className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>Inventory SCM</span>}
            </button>
          )}

          {/* AI Orchestration platform */}
          {modules.ai && (
            <button
              onClick={() => setActiveModule('ai')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeModule === 'ai' 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>Cognitive Gateway</span>}
            </button>
          )}

          {/* Admin Control */}
          <button
            onClick={() => setActiveModule('admin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeModule === 'admin' 
                ? 'bg-indigo-600 text-white font-bold' 
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>SaaS Admin Settings</span>}
          </button>
        </nav>

        {/* Emergency Hard Reset button in Footer */}
        <div className="p-2 border-t border-slate-800 space-y-1">
          {sidebarOpen && (
            <button
              onClick={handleEmergencyReset}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-900 text-rose-300 rounded font-semibold text-[10px] cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              Emergency Reset DB
            </button>
          )}
          {!sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="w-full p-2.5 flex justify-center text-slate-500 hover:text-white rounded hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* 2. MAIN COCKPIT SECTION */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-100 bg-white px-6 flex items-center justify-between shrink-0 shadow-2xs">
          
          {/* Left search bar */}
          <div className="flex items-center gap-4 flex-1 max-w-sm relative">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="text-slate-500 hover:text-slate-900 p-1 hover:bg-slate-50 rounded"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Global Database Search (CRM, ERP, PMS...)"
                value={globalSearch}
                onChange={(e) => { setGlobalSearch(e.target.value); setShowSearchResults(true); }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full bg-slate-50 pl-8 pr-3 py-2 rounded-lg text-xs border border-slate-200 focus:outline-hidden focus:border-indigo-500 transition-colors"
              />

              {/* Global search auto-matches dropdown */}
              {showSearchResults && globalSearch.trim().length > 1 && (
                <div className="absolute top-11 left-0 right-0 bg-white border border-slate-150 rounded-lg shadow-lg max-h-60 overflow-y-auto p-1.5 z-50 text-xs">
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1 border-b border-slate-50">
                    <span>Matches Found</span>
                    <button onClick={() => setShowSearchResults(false)} className="text-slate-500 hover:text-slate-800">Close</button>
                  </div>
                  {globalMatches.length === 0 ? (
                    <p className="text-slate-400 italic p-3 text-center">No exact database matches</p>
                  ) : (
                    globalMatches.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveModule(m.target);
                          setGlobalSearch('');
                          setShowSearchResults(false);
                        }}
                        className="w-full text-left p-2 hover:bg-indigo-50/50 rounded flex justify-between items-center transition-colors cursor-pointer"
                      >
                        <div>
                          <strong className="text-slate-800">{m.title}</strong>
                          <span className="text-[10px] text-slate-400 block">{m.subtitle}</span>
                        </div>
                        <span className="text-[9px] uppercase font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                          {m.type}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right cockpit dials */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            {/* UTC Timestamp indicator */}
            <div className="hidden md:flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150 font-mono text-[10px]">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>UTC: {new Date().toISOString().substring(11, 16)}</span>
            </div>

            {/* Notification system center */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-150 relative cursor-pointer"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-indigo-500 rounded-full border border-white" />
              </button>

              {/* Notification drop-down */}
              {showNotifDropdown && (
                <div className="absolute top-10 right-0 w-64 bg-white border border-slate-150 rounded-lg shadow-lg p-2.5 z-50">
                  <div className="font-bold text-slate-700 border-b border-slate-50 pb-1.5 mb-2 flex justify-between">
                    <span>Notification Feed</span>
                    <span className="text-[9px] uppercase font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">All Sync</span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto text-[10.5px]">
                    <div className="p-1.5 bg-indigo-50/50 rounded border border-indigo-50">
                      <strong>AI Platform Status:</strong> Gateway operational metrics are synchronizing successfully.
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded">
                      <strong>Acme Migration:</strong> Kore Lovelace marked task "MSA draft MSA" as completed.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Slide-out Grounded AI Assistant Drawer Trigger */}
            <button
              onClick={() => setAiDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-all shadow-sm shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask AI Co-Pilot
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {activeModule === 'dashboard' && (
                <FounderDashboard state={dbState} onRefresh={fetchState} brandColor={organization.brandColors.primary} />
              )}
              {activeModule === 'crm' && (
                <CRMModule state={dbState} onRefresh={fetchState} brandColor={organization.brandColors.primary} />
              )}
              {activeModule === 'erp' && (
                <ERPModule state={dbState} onRefresh={fetchState} brandColor={organization.brandColors.primary} />
              )}
              {activeModule === 'pms' && (
                <PMSModule state={dbState} onRefresh={fetchState} brandColor={organization.brandColors.primary} />
              )}
              {activeModule === 'hrms' && (
                <HRMSModule state={dbState} onRefresh={fetchState} brandColor={organization.brandColors.primary} />
              )}
              {activeModule === 'inventory' && (
                <InventoryModule state={dbState} onRefresh={fetchState} brandColor={organization.brandColors.primary} />
              )}
              {activeModule === 'ai' && (
                <AIPlatform state={dbState} onRefresh={fetchState} brandColor={organization.brandColors.primary} />
              )}
              {activeModule === 'admin' && (
                <SaaSAdmin state={dbState} onRefresh={fetchState} brandColor={organization.brandColors.primary} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 3. CO-PILOT GROUNDED DRAWER (Slide out from Right) */}
      <AnimatePresence>
        {aiDrawerOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/25 backdrop-blur-2xs z-40" 
              onClick={() => setAiDrawerOpen(false)}
            />

            {/* Slide-out Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 right-0 w-80 bg-slate-900 text-white z-50 border-l border-indigo-950 shadow-2xl p-5 flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                  <h3 className="font-bold text-sm tracking-tight text-white">Grounded AI Co-Pilot</h3>
                </div>
                <button 
                  onClick={() => setAiDrawerOpen(false)}
                  className="text-slate-400 hover:text-white p-1 hover:bg-slate-850 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Message Streams */}
              <div className="flex-1 overflow-y-auto space-y-3.5 text-xs pr-1 pb-4">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3.5 rounded-xl leading-relaxed max-w-[90%] ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-750'
                    }`}>
                      {msg.sender === 'agent' && (
                        <span className="block font-mono text-[9px] uppercase tracking-wider text-indigo-400 font-bold mb-1">
                          CO-PILOT AI ENGINE
                        </span>
                      )}
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-slate-800 rounded-xl rounded-bl-none text-slate-400 max-w-[80%] flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                      <span className="font-mono text-[10px]">Retrieving data snapshots...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleFloatingAISubmit} className="border-t border-slate-800 pt-3 mt-auto">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Query accounts, low stocks, leads..."
                    className="flex-1 text-xs bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiInput.trim()}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
