import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Terminal, 
  Cpu, 
  Clock, 
  Database, 
  Activity, 
  Coins, 
  ShieldCheck,
  RefreshCw,
  Sliders,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { PromptTemplate, AIUsageLog } from '../types';

interface AIPlatformProps {
  state: any;
  onRefresh: () => void;
  brandColor: string;
}

export default function AIPlatform({ state, onRefresh, brandColor }: AIPlatformProps) {
  const { aiLogs } = state;
  const [activeTab, setActiveTab] = useState<'assistant' | 'logs' | 'templates'>('assistant');

  // Conversational Chat Bot state
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'agent'; text: string; time: string }[]>([
    { 
      sender: 'agent', 
      text: "Greetings. I am the NeuNet Integrated AI Business Assistant. I am directly grounded in your live corporate databases, meaning I have real-time context about your CRM leads, ERP account balances, PMS projects, and warehouse stocks. Ask me anything about your business records or request tactical drafts.", 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);

  // Prompt Templates list
  const templates: PromptTemplate[] = [
    { id: "prompt_crm_01", name: "Outreach Proposal Draft", category: "CRM", template: "Draft a formal SaaS Business Proposal from {{MyOrg}} to {{LeadContact}} at {{LeadCompany}} with estimated budget ${{LeadBudget}}...", variables: ["MyOrg", "LeadContact", "LeadCompany", "LeadBudget"] },
    { id: "prompt_erp_01", name: "COA Auditor & Explainer", category: "Finance", template: "Review chart of accounts ledger balances: {{AccountsData}} and spot financial anomalies or liabilities...", variables: ["AccountsData"] },
    { id: "prompt_pms_01", name: "Sprint Risk Analyzer", category: "Projects", template: "Review active software tasks: {{TasksList}} and point out critical path blockers or workload conflicts...", variables: ["TasksList"] }
  ];

  // Send Conversational message to proxy server
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { 
      sender: 'user', 
      text: userText, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { 
          sender: 'agent', 
          text: data.text, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
      } else {
        setChatMessages(prev => [...prev, { 
          sender: 'agent', 
          text: `Error: ${data.error || 'Failed to complete query.'}`, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { 
        sender: 'agent', 
        text: `Network Error: ${err.message || 'Server connection failed.'}`, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setChatLoading(false);
      onRefresh(); // Refresh logs to dynamically update usage list!
    }
  };

  // Calculations for analytics
  const totalTokens = aiLogs.reduce((sum: number, log: any) => sum + (log.tokensUsed || 0), 0);
  const avgLatency = aiLogs.length > 0 
    ? Math.round(aiLogs.reduce((sum: number, log: any) => sum + (log.latencyMs || 0), 0) / aiLogs.length) 
    : 0;
  const totalCost = aiLogs.reduce((sum: number, log: any) => sum + (log.costEstimate || 0), 0);

  return (
    <div className="space-y-6">
      {/* Module Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">AI Platform & Gateway</h2>
          <p className="text-xs text-slate-500">Centralized model routing, security policy governance, and direct database grounding logs.</p>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1 font-semibold rounded-md cursor-pointer transition-all ${activeTab === 'assistant' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Business Assistant Chat
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1 font-semibold rounded-md cursor-pointer transition-all ${activeTab === 'logs' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Gateway Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1 font-semibold rounded-md cursor-pointer transition-all ${activeTab === 'templates' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Prompt Management
          </button>
        </div>
      </div>

      {/* Main AI workspaces */}
      {activeTab === 'assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Chat Panel - Grounded in DB */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 lg:col-span-2 shadow-xs flex flex-col h-[520px]">
            <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center bg-slate-50/50 p-2.5 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                <span className="text-[11px] font-mono font-bold text-slate-600">MODEL: gemini-3.5-flash (Grounded in Ledger DB)</span>
              </div>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider font-mono">B2B CO-PILOT</span>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-4">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-xs' 
                      : 'bg-slate-50 text-slate-800 rounded-bl-none border border-slate-150'
                  }`}>
                    {msg.sender === 'agent' && (
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-1.5">
                        <Sparkles className="h-3 w-3" />
                        NeuNet Cognitive Node
                      </div>
                    )}
                    <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                    <span className={`block text-[9px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl rounded-bl-none p-4 text-xs max-w-xs flex items-center gap-2 text-slate-500">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                    <span className="font-mono text-[10px]">Retrieving data models & inferencing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendChat} className="flex gap-2 border-t border-slate-100 pt-4 bg-white mt-auto">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me: 'Do we have low stock?', 'Which projects are delayed?', 'Draft proposal for Acme'..."
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-hidden focus:border-indigo-500 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>

          {/* SCM/Finance stats & Model parameters */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-5 self-start">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-3">Gateway Specifications</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Secure Grounding Sandbox:</span>
                <span className="font-mono font-bold text-emerald-600">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Auth Token Verification:</span>
                <span className="font-mono font-bold text-slate-700">OK (Anonymous)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Primary Core Model:</span>
                <span className="font-mono text-slate-800 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150">gemini-2.5-flash</span>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-3.5 border border-indigo-50 text-[11px] text-indigo-950 leading-relaxed">
              <strong>Grounding Notice:</strong> When you send a message, the backend automatically extracts active ledger structures and pushes them alongside user prompts to optimize accuracy.
            </div>
          </div>
        </div>
      )}

      {/* AI Gateway Audit logs */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Tokens Expended</span>
                <h4 className="text-lg font-bold font-mono text-slate-800 mt-0.5">{totalTokens.toLocaleString()}</h4>
              </div>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
                <Coins className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Average Model Latency</span>
                <h4 className="text-lg font-bold font-mono text-slate-800 mt-0.5">{avgLatency} ms</h4>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded">
                <Clock className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Estimated API Expenditure</span>
                <h4 className="text-lg font-bold font-mono text-slate-800 mt-0.5">${totalCost.toFixed(5)} USD</h4>
              </div>
              <div className="p-2 bg-rose-50 text-rose-600 rounded">
                <Cpu className="h-4.5 w-4.5" />
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-800">API Call Governance Records</h3>
                <p className="text-xs text-slate-400">Real-time model metrics auditing</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-mono uppercase text-[10px] tracking-wider text-slate-400 bg-slate-50/30">
                  <th className="p-4">Timestamp Log</th>
                  <th className="p-4">Business Module</th>
                  <th className="p-4">Cognitive Prompt Name</th>
                  <th className="p-4 text-center">Tokens Used</th>
                  <th className="p-4 text-center">API Latency</th>
                  <th className="p-4 text-right">Cost (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {aiLogs.map((log: AIUsageLog) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-[10px] text-slate-500">{log.timestamp}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-semibold border">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-800">{log.promptName}</td>
                    <td className="p-4 text-center font-mono font-bold text-slate-700">{log.tokensUsed}</td>
                    <td className="p-4 text-center font-mono text-slate-500">{log.latencyMs} ms</td>
                    <td className="p-4 text-right font-mono font-bold text-slate-800">${log.costEstimate.toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prompt Templates Catalogue */}
      {activeTab === 'templates' && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-800">Prompt Management Catalogue</h3>
            <p className="text-xs text-slate-400">Centralized variables injection models for developers</p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {templates.map(t => (
              <div key={t.id} className="p-4 hover:bg-slate-50/50 transition-all space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-sans text-slate-800 tracking-tight">{t.name}</strong>
                    <span className="text-[9px] uppercase font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                      {t.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{t.id}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-lg text-slate-500 font-mono leading-relaxed text-[11px]">
                  {t.template}
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-slate-400 uppercase font-mono tracking-wider font-bold">Injected variables:</span>
                  {t.variables.map(v => (
                    <span key={v} className="bg-slate-100 border text-slate-600 px-1.5 py-0.5 rounded-sm font-mono font-semibold">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
