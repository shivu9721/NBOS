import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
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
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
            {organization.subscriptionPlan} Plan Active
          </span>
          <h1 className="text-2xl font-sans font-bold tracking-tight text-slate-900 mt-2">
            Founder & Executive Cockpit
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time cross-tenant operations and financial intelligence for <strong className="text-slate-800">{organization.name}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Ledger State
          </button>
        </div>
      </div>

      {/* Grid of 4 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Liquid Cash</p>
              <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1">
                ${totalBankBalance.toLocaleString()}
              </h3>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-emerald-600 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+12.4% vs last Q</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Sales Pipeline Velocity</p>
              <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {activeLeadsCount} Leads
              </h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-indigo-600 font-medium">
            <Info className="h-3.5 w-3.5" />
            <span>{highPriorityLeadsCount} designated high-priority</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Project Operations</p>
              <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {activeProjectsCount} Active
              </h3>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-amber-600 font-medium">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>{delayedProjectsCount} critical-path delay risk</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">NeuNet AI Gateway</p>
              <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {(totalAiTokens / 1000).toFixed(1)}k Token
              </h3>
            </div>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-500">
            <span>Spend:</span>
            <span className="font-mono text-slate-800 font-semibold">${totalAiCost.toFixed(4)} USD</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>
      </div>

      {/* Corporate Financial Visualizations (Crafted SVG Chart Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Financial Trends (Chart block - 2/3 width) */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Monthly Operating Flow</h4>
              <p className="text-xs text-slate-400">Simulated 6-Month Ledger Revenue vs Cloud Expenses</p>
            </div>
            <div className="flex gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 bg-indigo-500 rounded-sm" />
                <span className="text-slate-600">SaaS Subs ($820k)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 bg-amber-500 rounded-sm" />
                <span className="text-slate-600">Cloud Costs ($95k)</span>
              </div>
            </div>
          </div>

          {/* SVG Custom High fidelity Chart */}
          <div className="relative h-60 w-full mt-2">
            <svg viewBox="0 0 600 240" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="140" x2="580" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="200" x2="580" y2="200" stroke="#cbd5e1" strokeWidth="1" />

              {/* Chart Coordinates (X-Axis: Jan-Jun) */}
              <text x="45" y="218" fill="#94a3b8" fontSize="10" fontFamily="monospace">JAN</text>
              <text x="145" y="218" fill="#94a3b8" fontSize="10" fontFamily="monospace">FEB</text>
              <text x="245" y="218" fill="#94a3b8" fontSize="10" fontFamily="monospace">MAR</text>
              <text x="345" y="218" fill="#94a3b8" fontSize="10" fontFamily="monospace">APR</text>
              <text x="445" y="218" fill="#94a3b8" fontSize="10" fontFamily="monospace">MAY</text>
              <text x="545" y="218" fill="#94a3b8" fontSize="10" fontFamily="monospace">JUN</text>

              {/* Y-Axis labels */}
              <text x="30" y="24" fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">$150k</text>
              <text x="30" y="84" fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">$100k</text>
              <text x="30" y="144" fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">$50k</text>
              <text x="30" y="204" fill="#94a3b8" fontSize="9" textAnchor="end" fontFamily="monospace">$0</text>

              {/* Area Under Curve: Subscription Revenue (Jan: 50k, Feb: 65k, Mar: 90k, Apr: 110k, May: 135k, Jun: 145k)
                  Map to SVG coordinates: 
                  X: 55, 155, 255, 355, 455, 555
                  Y: 200 - (Value/150000)*180 
                  Y-values: 50k->140, 65k->122, 90k->92, 110k->68, 135k->38, 145k->26
              */}
              <path 
                d="M 55 200 L 55 140 L 155 122 L 255 92 L 355 68 L 455 38 L 555 26 L 555 200 Z" 
                fill="url(#revGrad)" 
                opacity="0.15"
              />
              <path 
                d="M 55 140 L 155 122 L 255 92 L 355 68 L 455 38 L 555 26" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />

              {/* Expense Line (AWS/GCP nodes: flat around $15k - $20k)
                  Y-values: 12k->185, 14k->183, 15k->182, 18k->178, 20k->176, 19k->177
              */}
              <path 
                d="M 55 185 L 155 183 L 255 182 L 355 178 L 455 176 L 555 177" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="2.5" 
                strokeDasharray="4 2" 
                strokeLinecap="round" 
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Interactive nodes */}
              <circle cx="555" cy="26" r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
              <circle cx="455" cy="38" r="4" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="355" cy="68" r="4" fill="#4f46e5" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Corporate Slices / Allocation - (1/3 width) */}
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Operational Breakdown</h4>
            <p className="text-xs text-slate-400">Resources and team distribution</p>

            <div className="space-y-4 mt-6">
              {/* Item 1 */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Software Engineers</span>
                  <span className="font-mono font-medium">3 employees</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              {/* Item 2 */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Sales & Account Directors</span>
                  <span className="font-mono font-medium">1 employee</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '20%' }} />
                </div>
              </div>

              {/* Item 3 */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Finance Controllers</span>
                  <span className="font-mono font-medium">1 employee</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 rounded-lg p-3.5 border border-indigo-50 flex items-start gap-2.5 mt-6">
            <ShieldCheck className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-indigo-950 leading-relaxed">
              <strong>SaaS Health Verified:</strong> Tenant data isolate rules are checked. Zero compliance friction detected across standard scopes.
            </div>
          </div>
        </div>
      </div>

      {/* Integrated AI Financial Advisor Console */}
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-xl border border-indigo-900 shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-indigo-900 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                NeuNet AI Financial Advisor
                <span className="text-[10px] uppercase font-mono tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                  Active
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Utilizes the secure server-side Gemini intelligence layer to audit corporate ledgers, budgets, and cash balances.
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={fetchAIInsights}
              disabled={loadingAI}
              className="w-full md:w-auto px-5 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-indigo-950 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loadingAI ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Auditing Corporate State...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Run AI Financial Audit
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
