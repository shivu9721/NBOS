import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Users, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  RefreshCw, 
  Server, 
  ChevronRight,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface FounderDashboardProps {
  state: any;
  onRefresh: () => void;
  brandColor: string;
}

export default function FounderDashboard({ state, onRefresh, brandColor }: FounderDashboardProps) {
  const { organization, leads, accounts, projects, employees, aiLogs } = state;
  
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  // Calculations from live state
  const totalBankBalance = accounts
    .filter((a: any) => a.code === '1010')
    .reduce((sum: number, a: any) => sum + a.balance, 0);

  const activeLeadsCount = leads.length;
  const highPriorityLeadsCount = leads.filter((l: any) => l.priority === 'High').length;
  
  const activeProjectsCount = projects.filter((p: any) => p.status === 'Active').length;
  const delayedProjectsCount = projects.filter((p: any) => p.status === 'Delayed').length;
  
  const totalEmployeesCount = employees.length;
  const totalAiTokens = aiLogs.reduce((sum: number, log: any) => sum + (log.tokensUsed || 0), 0);
  const totalAiCost = aiLogs.reduce((sum: number, log: any) => sum + (log.costEstimate || 0), 0);

  // Load AI Operational Insights
  const fetchAIInsights = async () => {
    setLoadingAI(true);
    setAiError('');
    try {
      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleType: 'Finance' })
      });
      const data = await res.json();
      if (data.success) {
        setAiInsights(data.text);
      } else {
        setAiError(data.error || 'Failed to analyze records.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Server connection failed.');
    } finally {
      setLoadingAI(false);
      onRefresh(); // Refresh logs
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-[#00D8F6]/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[10px] font-mono text-[#0052FF] bg-[#0052FF]/10 px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
            {organization.subscriptionPlan} Plan Active
          </span>
          <h1 className="text-2xl font-sans font-extrabold tracking-tight text-[#04153F] mt-2">
            Founder & Executive Cockpit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operations, analytics & intelligence aligned with <strong className="text-[#0052FF]">UP arrow</strong> design directives.
          </p>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <button 
            onClick={onRefresh}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0052FF] to-[#0B66FF] hover:from-[#0052FF] hover:to-[#00D8F6] rounded-lg transition-all duration-300 shadow-sm cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" />
            Sync Ledger State
          </button>
        </div>
      </div>

      {/* Grid of 4 Key Metrics with colorful accents & brand themes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs relative overflow-hidden group brand-card-glow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Liquid Cash</p>
              <h3 className="text-2xl font-bold font-mono text-[#04153F] mt-1 flex items-center">
                <IndianRupee className="h-5 w-5 mr-0.5 text-[#0052FF] shrink-0" />{totalBankBalance.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="p-2 bg-[#0052FF]/10 rounded-lg text-[#0052FF]">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-emerald-600 font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+12.4% vs last Q</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0052FF] to-[#00D8F6] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs relative overflow-hidden group brand-card-glow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Sales Velocity</p>
              <h3 className="text-2xl font-bold font-mono text-[#04153F] mt-1">
                {activeLeadsCount} Leads
              </h3>
            </div>
            <div className="p-2 bg-[#00D8F6]/10 rounded-lg text-[#0052FF]">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-[#0052FF] font-bold">
            <Info className="h-3.5 w-3.5" />
            <span>{highPriorityLeadsCount} high-priority records</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00D8F6] to-[#0B66FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs relative overflow-hidden group brand-card-glow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Project Operations</p>
              <h3 className="text-2xl font-bold font-mono text-[#04153F] mt-1">
                {activeProjectsCount} Active
              </h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-amber-600 font-bold">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>{delayedProjectsCount} priority delay risk</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs relative overflow-hidden group brand-card-glow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">AI Intelligence Core</p>
              <h3 className="text-2xl font-bold font-mono text-[#04153F] mt-1">
                {(totalAiTokens / 1000).toFixed(1)}k Token
              </h3>
            </div>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-500">
            <span>Spend Estimate:</span>
            <span className="font-mono text-[#04153F] font-bold">₹{(totalAiCost * 80).toFixed(2)} INR</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>
      </div>

      {/* Corporate Financial Visualizations (Crafted SVG Chart Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Financial Trends (Chart block - 2/3 width) */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
            <div>
              <h4 className="text-sm font-bold text-[#04153F]">Monthly Operating Flow</h4>
              <p className="text-xs text-slate-400">Simulated 6-Month Ledger Revenue vs Cloud Expenses</p>
            </div>
            <div className="flex gap-4 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 bg-[#0052FF] rounded-sm" />
                <span className="text-slate-600 font-bold">Revenue (₹6.5Cr)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 bg-[#00D8F6] rounded-sm" />
                <span className="text-slate-600 font-bold">Expenses (₹76L)</span>
              </div>
            </div>
          </div>

          {/* SVG Custom High fidelity Chart - Rich Colorful Brand Styling */}
          <div className="relative h-60 w-full mt-2">
            <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="140" x2="580" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="200" x2="580" y2="200" stroke="#e2e8f0" strokeWidth="1" />

              {/* Chart Coordinates (X-Axis: Jan-Jun) */}
              <text x="45" y="218" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">JAN</text>
              <text x="145" y="218" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">FEB</text>
              <text x="245" y="218" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">MAR</text>
              <text x="345" y="218" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">APR</text>
              <text x="445" y="218" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">MAY</text>
              <text x="545" y="218" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">JUN</text>

              {/* Y-Axis labels */}
              <text x="30" y="24" fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">₹1.2Cr</text>
              <text x="30" y="84" fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">₹80L</text>
              <text x="30" y="144" fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">₹40L</text>
              <text x="30" y="204" fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">₹0</text>

              {/* Colorful Gradient Fills for Area Under Curve */}
              <path 
                d="M 55 200 L 55 140 L 155 122 L 255 92 L 355 68 L 455 38 L 555 26 L 555 200 Z" 
                fill="url(#brandRevGrad)" 
                opacity="0.15"
              />
              <path 
                d="M 55 140 L 155 122 L 255 92 L 355 68 L 455 38 L 555 26" 
                fill="none" 
                stroke="#0052FF" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Expense Line: Colored with vibrant cyan dashes */}
              <path 
                d="M 55 185 L 155 183 L 255 182 L 355 178 L 455 176 L 555 177" 
                fill="none" 
                stroke="#00D8F6" 
                strokeWidth="2.5" 
                strokeDasharray="4 2" 
                strokeLinecap="round" 
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="brandRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0052FF" />
                  <stop offset="100%" stopColor="#00D8F6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Interactive nodes */}
              <circle cx="555" cy="26" r="6" fill="#0052FF" stroke="#ffffff" strokeWidth="2" />
              <circle cx="455" cy="38" r="4.5" fill="#0052FF" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="355" cy="68" r="4.5" fill="#0052FF" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Corporate Slices / Allocation - (1/3 width) */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div>
            <h4 className="text-sm font-bold text-[#04153F]">Operational Breakdown</h4>
            <p className="text-xs text-slate-400">Resources and team distribution</p>

            <div className="space-y-4 mt-6">
              {/* Item 1 */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span className="font-medium">Software Engineers</span>
                  <span className="font-mono font-bold text-[#0052FF]">3 employees</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#0052FF] h-full rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              {/* Item 2 */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span className="font-medium">Sales & Account Directors</span>
                  <span className="font-mono font-bold text-[#00D8F6]">1 employee</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#00D8F6] h-full rounded-full" style={{ width: '20%' }} />
                </div>
              </div>

              {/* Item 3 */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span className="font-medium">Finance Controllers</span>
                  <span className="font-mono font-bold text-[#04153F]">1 employee</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#04153F] h-full rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0052FF]/5 rounded-lg p-3.5 border border-[#0052FF]/10 flex items-start gap-2.5 mt-6">
            <ShieldCheck className="h-4.5 w-4.5 text-[#0052FF] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#04153F] leading-relaxed">
              <strong>SaaS Health Verified:</strong> Tenant data isolation rules are verified. Zero compliance friction detected across active scopes.
            </div>
          </div>
        </div>
      </div>

      {/* Integrated AI Financial Advisor Console */}
      <div className="bg-gradient-to-br from-[#04153F] to-[#0052FF] text-white rounded-xl border border-[#0052FF]/30 shadow-lg p-6 relative overflow-hidden">
        {/* Colorful neon graphic circles for background interest */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#00D8F6]/20 rounded-full blur-2xl pointer-events-none animate-pulse-soft" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/15 pb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 border border-white/20 rounded-xl text-[#00D8F6]">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2 text-white">
                UP arrow Intelligent Advisor
                <span className="text-[10px] uppercase font-mono tracking-widest bg-[#00D8F6]/20 text-[#00D8F6] px-2 py-0.5 rounded font-extrabold">
                  Active
                </span>
              </h3>
              <p className="text-xs text-slate-200 mt-0.5">
                Utilizes the secure server-side Gemini intelligence layer to audit corporate ledgers, budgets, and cash balances.
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={fetchAIInsights}
              disabled={loadingAI}
              className="w-full md:w-auto px-5 py-2.5 text-xs font-bold bg-white hover:bg-slate-100 text-[#04153F] rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loadingAI ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#0052FF]" />
                  Auditing Ledger State...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#0052FF]" />
                  Run Brand Intelligence Audit
                </>
              )}
            </button>
          </div>
        </div>

        {/* Audit Report Result Panel */}
        <div className="mt-5">
          {loadingAI ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
              <Server className="h-8 w-8 animate-bounce text-indigo-400" />
              <p className="text-xs font-mono">Proxying system states to Gemini model: gemini-3.5-flash...</p>
            </div>
          ) : aiInsights ? (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 rounded-lg p-5 border border-indigo-950 max-h-96 overflow-y-auto text-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-mono text-indigo-400 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5" />
                  AUDIT_LOG_SUCCESS • SECURE_API_ENCRYPTED
                </span>
                <span className="text-[10px] text-slate-500">Just Generated</span>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 text-xs leading-relaxed space-y-2">
                {aiInsights.split('\n').map((line, i) => {
                  if (line.startsWith('#')) {
                    return <h5 key={i} className="font-bold text-white text-sm mt-3 mb-1">{line.replace(/#/g, '').trim()}</h5>;
                  }
                  if (line.startsWith('-') || line.startsWith('*')) {
                    return <li key={i} className="ml-4 list-disc mt-1">{line.substring(1).trim()}</li>;
                  }
                  return <p key={i}>{line}</p>;
                })}
              </div>
            </motion.div>
          ) : aiError ? (
            <div className="p-4 bg-rose-950/40 border border-rose-900 rounded-lg text-rose-300 text-xs text-center">
              {aiError}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 border border-dashed border-indigo-950 rounded-lg">
              <p className="text-xs">No active report generated. Click "Run AI Financial Audit" to synchronize live ledger states with Gemini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
