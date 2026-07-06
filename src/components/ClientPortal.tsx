import React, { useState } from 'react';
import { 
  FolderGit, 
  BookOpen, 
  Clock, 
  Sparkles, 
  CreditCard, 
  Send, 
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Check,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

interface ClientPortalProps {
  state: any;
  user: any;
  onRefresh: () => void;
  brandColor: string;
}

export default function ClientPortal({ state, user, onRefresh, brandColor }: ClientPortalProps) {
  const { invoices, projects, leads } = state;
  const clientCompany = user.department; // Acme Financial Group
  
  // States
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  // Chatbot states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: 'assistant', text: `Welcome back to the secure workspace, ${user.fullName}. I am your Client AI Assistant. I have real-time grounding on your active project ("Acme Core Migration") and current account ledger statements. How can I assist you today?` }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Filter client data
  const clientInvoices = invoices.filter((i: any) => i.customerName === clientCompany);
  const clientProjects = projects.filter((p: any) => p.client === clientCompany);

  // Pay invoice function (Full-stack Integration!)
  const handlePay = async (invoiceId: string) => {
    setPaymentLoading(invoiceId);
    try {
      const res = await fetch('/api/state/invoices/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoiceId })
      });
      if (res.ok) {
        onRefresh(); // Refresh ledger state instantly
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentLoading(null);
    }
  };

  // Submit support ticket / service request
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) return;

    setSubmittingTicket(true);
    setTicketSuccess('');

    try {
      // Find Acme lead in dbState
      const acmeLead = leads.find((l: any) => l.companyName === clientCompany);
      if (acmeLead) {
        const updatedNotes = [...acmeLead.notes, `Client Request: [${ticketSubject}] - ${ticketDesc}`];
        // Mutate Lead back-end
        await fetch('/api/state/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...acmeLead, notes: updatedNotes })
        });
      }

      setTicketSuccess('Ticket submitted successfully! Our strategic team has been notified, and the action has been appended to our CRM Lead checklist.');
      setTicketSubject('');
      setTicketDesc('');
      onRefresh(); // Refresh to update notes
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Client Chat AI integration with tailored grounding
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatLoading(true);

    try {
      // Tailor the query with explicit context block about this specific client
      const clientGroundingContext = `
        IMPORTANT: The user chatting with you is representing "${clientCompany}".
        Their name is "${user.fullName}" and their email is "${user.email}".
        
        Active Projects for them: ${JSON.stringify(clientProjects.map((p: any) => ({ name: p.name, progress: `${p.progress}%`, status: p.status, end: p.endDate })))}
        Billed Invoices for them: ${JSON.stringify(clientInvoices.map((i: any) => ({ number: i.invoiceNumber, total: i.total, status: i.status })))}
        
        Please act as the helpful Client Portal Concierge. Answer questions about their projects, timelines, or billing. Be extremely polite, professional, and do not disclose details about other clients.
      `;

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `${clientGroundingContext}\n\nClient inquiry: ${userText}` 
        })
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(prev => [...prev, { sender: 'assistant', text: data.text }]);
      } else {
        setChatMessages(prev => [...prev, { sender: 'assistant', text: 'Our client API proxy is temporarily busy. Please try again soon.' }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'assistant', text: 'Unable to connect to NeuNet AI services.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-xl p-6 shadow-md border border-indigo-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded uppercase tracking-wider font-semibold border border-indigo-500/10">
            Secure Client Portal
          </span>
          <h1 className="text-2xl font-bold font-sans tracking-tight mt-2">
            Welcome to the Acme Workspace
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Oversee active software migration deliverables, settle invoices securely via operating ledger pathways, and interface with our grounded platform AI team.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-800/40 p-3 rounded-lg shrink-0">
          <ShieldCheck className="h-5 w-5 text-indigo-400" />
          <div className="text-left leading-tight text-[11px]">
            <span className="font-bold block text-white">Acme Financial Group</span>
            <span className="text-[10px] font-mono text-indigo-300">Authorized Tenant • ID: org_acme_01</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Projects and Invoices (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Deliverables section */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
              <FolderGit className="h-4.5 w-4.5 text-indigo-600" />
              Active Project Deliverables
            </h3>

            {clientProjects.length === 0 ? (
              <p className="text-slate-400 italic text-center py-6">No active project records logged.</p>
            ) : (
              <div className="space-y-6">
                {clientProjects.map((proj: any) => (
                  <div key={proj.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                      <div>
                        <strong className="text-slate-800 text-sm block">{proj.name}</strong>
                        <span className="text-[10px] text-slate-400 font-medium">Assigned Lead Manager: <strong className="text-slate-600">{proj.manager}</strong></span>
                      </div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        proj.status === 'Completed' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}>
                        {proj.status}
                      </span>
                    </div>

                    {/* Progress Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-600 font-mono">
                        <span>Milestone Progress Index</span>
                        <span>{proj.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${proj.progress}%` }} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 text-[10.5px] font-medium text-slate-500 border-t border-slate-100/60 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Started: <strong className="text-slate-700">{proj.startDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-slate-400" />
                        <span>Estimated Delivery: <strong className="text-indigo-600">{proj.endDate}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settle Invoices section */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
              <BookOpen className="h-4.5 w-4.5 text-indigo-600" />
              Corporate Billing Ledger & Invoices
            </h3>

            {clientInvoices.length === 0 ? (
              <p className="text-slate-400 italic text-center py-6">No outstanding billing statements registered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 font-mono text-[10px] uppercase text-slate-400">
                      <th className="pb-3">Invoice ID</th>
                      <th className="pb-3">Issued Date</th>
                      <th className="pb-3 text-right">Invoice Total</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right">Operating Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {clientInvoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-bold text-slate-800">{inv.invoiceNumber}</td>
                        <td className="py-3 text-slate-500 font-mono text-[10px]">{inv.date}</td>
                        <td className="py-3 text-right font-mono font-semibold text-slate-800">
                          ${inv.total.toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {inv.status !== 'Paid' ? (
                            <button
                              onClick={() => handlePay(inv.id)}
                              disabled={paymentLoading === inv.id}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] transition-all inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <CreditCard className="h-3 w-3" />
                              {paymentLoading === inv.id ? 'Processing...' : 'Settle Now'}
                            </button>
                          ) : (
                            <span className="text-slate-400 inline-flex items-center gap-1 text-[10px] font-semibold">
                              <Check className="h-3 w-3 text-emerald-500" /> Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Support Ticket Request form */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
              <HelpCircle className="h-4.5 w-4.5 text-indigo-600" />
              File Corporate Deliverable Request
            </h3>

            {ticketSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-lg text-emerald-800 text-xs font-semibold mb-4 leading-relaxed">
                {ticketSuccess}
              </div>
            )}

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject / Objective</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden focus:border-indigo-500"
                  placeholder="Requesting extra staging instances or API key integrations..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Detailed Description / Requirements</label>
                <textarea
                  required
                  rows={3}
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-hidden focus:border-indigo-500"
                  placeholder="Please list integration scopes, required endpoints, or timelines..."
                />
              </div>

              <button
                type="submit"
                disabled={submittingTicket}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {submittingTicket ? 'Appending to CRM...' : 'Dispatch Request'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Grounded AI Portal Concierge (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white rounded-xl border border-indigo-950 p-5 shadow-lg flex flex-col h-[520px]">
            
            {/* AI Header */}
            <div className="flex items-center gap-2 border-b border-indigo-900/60 pb-3 mb-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-xs tracking-tight">AI Workspace Concierge</h4>
                <p className="text-[9px] text-indigo-300 font-mono">MODEL: gemini-3.5-flash</p>
              </div>
            </div>

            {/* Chat Messages flow */}
            <div className="flex-1 overflow-y-auto space-y-3.5 text-[11px] pr-1 pb-4 scrollbar-thin">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-xl leading-relaxed max-w-[90%] ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-750'
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="p-2.5 bg-slate-800 rounded-xl rounded-bl-none text-slate-400 max-w-[80%] flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                    <span className="font-mono text-[9px]">Grounded data checking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleChatSubmit} className="border-t border-indigo-900/60 pt-3 mt-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Check invoice balances, project milestones..."
                  className="flex-1 text-[11px] bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
