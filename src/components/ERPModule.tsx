import React, { useState } from 'react';
import { 
  DollarSign, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  ShieldAlert,
  Percent, 
  Layers,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { ChartOfAccount, JournalEntry, Invoice } from '../types';

interface ERPModuleProps {
  state: any;
  onRefresh: () => void;
  brandColor: string;
}

export default function ERPModule({ state, onRefresh, brandColor }: ERPModuleProps) {
  const { accounts, journals, invoices } = state;
  const [activeSubTab, setActiveTab] = useState<'ledger' | 'accounts' | 'invoices'>('ledger');

  // Journal Entry Form State
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [memo, setMemo] = useState('');
  const [line1Account, setLine1Account] = useState('5020'); // Cloud Server
  const [line1Debit, setLine1Debit] = useState<number>(0);
  const [line1Credit, setLine1Credit] = useState<number>(0);

  const [line2Account, setLine2Account] = useState('2010'); // Accounts Payable
  const [line2Debit, setLine2Debit] = useState<number>(0);
  const [line2Credit, setLine2Credit] = useState<number>(0);

  const [journalError, setJournalError] = useState('');
  const [journalSuccess, setJournalSuccess] = useState('');

  // Invoice Form State
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [customer, setCustomer] = useState('');
  const [invSubtotal, setInvSubtotal] = useState(15000);
  const [invItem, setInvItem] = useState('Enterprise Cloud Deployment');

  // AI Auditor state
  const [aiAuditText, setAiAuditText] = useState('');
  const [auditing, setAuditing] = useState(false);

  // Totals
  const totalAssets = accounts.filter((a: any) => a.type === 'Asset').reduce((sum: number, a: any) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter((a: any) => a.type === 'Liability').reduce((sum: number, a: any) => sum + a.balance, 0);
  const totalRevenue = invoices.filter((i: any) => i.status === 'Paid').reduce((sum: number, i: any) => sum + i.total, 0);
  const totalOutstanding = invoices.filter((i: any) => i.status === 'Unpaid').reduce((sum: number, i: any) => sum + i.total, 0);

  // Submit Journal Entry
  const handlePostJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setJournalError('');
    setJournalSuccess('');

    const payload = {
      memo: memo || 'Manual Ledger adjustment',
      createdBy: 'Winston Smith',
      lines: [
        { accountCode: line1Account, debit: Number(line1Debit), credit: Number(line1Credit) },
        { accountCode: line2Account, debit: Number(line2Debit), credit: Number(line2Credit) }
      ]
    };

    try {
      const res = await fetch('/api/state/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setJournalSuccess('Journal entry verified and posted. Balances adjusted.');
        setMemo('');
        setLine1Debit(0);
        setLine1Credit(0);
        setLine2Debit(0);
        setLine2Credit(0);
        setTimeout(() => setShowJournalForm(false), 2000);
        onRefresh();
      } else {
        setJournalError(data.error || 'Failed to post.');
      }
    } catch (err: any) {
      setJournalError('Server connection failed: ' + err.message);
    }
  };

  // Submit Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    const payload = {
      customerName: customer,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: Number(invSubtotal),
      taxRate: 0.15,
      discount: 0,
      total: Number(invSubtotal) * 1.15,
      status: 'Unpaid',
      items: [{ description: invItem, quantity: 1, unitPrice: Number(invSubtotal) }]
    };

    try {
      const res = await fetch('/api/state/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowInvoiceForm(false);
        setCustomer('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger invoice payment
  const handlePayInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch('/api/state/invoices/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: invoiceId })
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger AI Financial Audit via Gemini
  const handleAiAudit = async () => {
    setAuditing(true);
    setAiAuditText('');
    try {
      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleType: 'Finance' })
      });
      const data = await res.json();
      if (data.success) {
        setAiAuditText(data.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuditing(false);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Finance & Accounting (ERP)</h2>
          <p className="text-xs text-slate-500">Expose charts of accounts, double-entry journal auditing, and automated VAT reporting.</p>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${activeSubTab === 'ledger' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            General Ledger
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${activeSubTab === 'accounts' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Chart of Accounts
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${activeSubTab === 'invoices' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Accounts Receivable
          </button>
        </div>
      </div>

      {/* Mini Finance KPI blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Capital Assets</span>
            <h4 className="text-lg font-bold font-mono text-slate-800 mt-0.5">${totalAssets.toLocaleString()}</h4>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
            <Layers className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Accounts Liabilities</span>
            <h4 className="text-lg font-bold font-mono text-slate-800 mt-0.5">${totalLiabilities.toLocaleString()}</h4>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-500">Collected Income</span>
            <h4 className="text-lg font-bold font-mono text-emerald-600 mt-0.5">${totalRevenue.toLocaleString()}</h4>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
            <CheckCircle className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-500">Outstanding Invoices</span>
            <h4 className="text-lg font-bold font-mono text-rose-600 mt-0.5">${totalOutstanding.toLocaleString()}</h4>
          </div>
          <div className="p-2 bg-rose-50 text-rose-600 rounded">
            <DollarSign className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* Tab Workspaces */}
      {activeSubTab === 'ledger' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent posted journals */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Double-Entry Audit Log</h3>
                <p className="text-[11px] text-slate-400">Recent posted general journal adjustment items</p>
              </div>
              <button
                onClick={() => setShowJournalForm(true)}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Audit Journal
              </button>
            </div>

            {/* List Posted Journals */}
            <div className="space-y-3.5">
              {journals.map((j: JournalEntry) => {
                const totalDebit = j.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
                return (
                  <div key={j.id} className="border border-slate-100 rounded-lg p-3.5 bg-slate-50/40 text-xs">
                    <div className="flex justify-between items-start border-b border-slate-200/60 pb-2 mb-2">
                      <div>
                        <strong className="text-slate-800">{j.entryNumber}</strong>
                        <span className="text-[10px] text-slate-400 font-mono ml-2">{j.date}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-sm">
                        Balanced & Posted ($ {totalDebit.toLocaleString()})
                      </span>
                    </div>
                    <p className="text-slate-500 italic mb-2">Memo: "{j.memo}"</p>
                    <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                      {j.lines.map((line, idx) => {
                        const accName = accounts.find((a: any) => a.code === line.accountCode)?.name || 'Account';
                        return (
                          <div key={idx} className="col-span-3 flex justify-between bg-white px-2 py-1 rounded border border-slate-100">
                            <span className="text-slate-600">{line.accountCode} • {accName}</span>
                            <span className="font-semibold text-slate-800">
                              {line.debit > 0 ? `DR: $${line.debit.toLocaleString()}` : `CR: $${line.credit.toLocaleString()}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 text-right">Created by: {j.createdBy}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive AI Audit / CFO Assistant */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                <h4 className="font-bold text-sm">AI Corporate Auditor</h4>
              </div>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Audits double-entry postings, checks liabilities against operating balances, and surfaces cost-saving avenues using Gemini.
              </p>
              <button
                onClick={handleAiAudit}
                disabled={auditing}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {auditing ? 'Auditing Ledgers...' : 'Run Forensic Audit'}
              </button>

              {aiAuditText && (
                <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10.5px] leading-relaxed text-slate-300 font-mono max-h-48 overflow-y-auto whitespace-pre-line">
                  {aiAuditText}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chart of Accounts Grid */}
      {activeSubTab === 'accounts' && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-800">Standard Chart of Accounts (COA)</h3>
            <p className="text-xs text-slate-400">Ledger accounting rules configuration values</p>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 font-mono uppercase text-[10px] tracking-wider text-slate-400 bg-slate-50/30">
                <th className="p-4">Account Code</th>
                <th className="p-4">Account Name</th>
                <th className="p-4">Category Type</th>
                <th className="p-4">Active Status</th>
                <th className="p-4 text-right">Active Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {accounts.map((a: ChartOfAccount) => (
                <tr key={a.code} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono font-semibold text-indigo-600">{a.code}</td>
                  <td className="p-4 font-medium text-slate-800">{a.name}</td>
                  <td className="p-4">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      a.type === 'Asset' ? 'bg-indigo-50 text-indigo-700' :
                      a.type === 'Liability' ? 'bg-amber-50 text-amber-700' :
                      a.type === 'Equity' ? 'bg-purple-50 text-purple-700' :
                      a.type === 'Income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {a.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs" />
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-slate-800">${a.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Accounts Receivable & Invoice Ledger */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Invoices List</h3>
              <p className="text-xs text-slate-400">Track pending customer payments and invoice completions</p>
            </div>
            <button
              onClick={() => setShowInvoiceForm(true)}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              New Invoice
            </button>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 font-mono uppercase text-[10px] tracking-wider text-slate-400 bg-slate-50/30">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-center">Tax Rate</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv: Invoice) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-700">{inv.invoiceNumber}</td>
                  <td className="p-4 font-semibold text-slate-800">{inv.customerName}</td>
                  <td className="p-4 text-slate-500">{inv.dueDate}</td>
                  <td className="p-4 text-center font-mono text-[10px] text-slate-400">{inv.taxRate * 100}%</td>
                  <td className="p-4 font-mono font-bold text-slate-800">${inv.total.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      inv.status === 'Paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {inv.status === 'Unpaid' && (
                      <button
                        onClick={() => handlePayInvoice(inv.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold transition-all cursor-pointer text-[10px]"
                      >
                        Record Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Double entry Verification Wizard Modal */}
      {showJournalForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                Audit Double-Entry Journal Entry
              </h3>
              <button onClick={() => setShowJournalForm(false)} className="text-slate-400 hover:text-slate-700">
                X
              </button>
            </div>

            <form onSubmit={handlePostJournal} className="p-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Narrative Memo *</label>
                <input
                  type="text"
                  required
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded focus:outline-hidden"
                  placeholder="e.g. AWS monthly cloud server expenses"
                />
              </div>

              {/* Line 1 (Debit) */}
              <div className="bg-slate-50 p-2.5 rounded-lg space-y-2 border border-slate-100">
                <div className="font-bold text-[10px] uppercase text-indigo-600">Line Item 1 (Debit Side)</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-slate-400 text-[10px]">Select Account Code</label>
                    <select
                      value={line1Account}
                      onChange={(e) => setLine1Account(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px]"
                    >
                      {accounts.map((a: any) => (
                        <option key={a.code} value={a.code}>{a.code} - {a.name} ({a.type})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">Debit Amount ($)</label>
                    <input
                      type="number"
                      value={line1Debit}
                      onChange={(e) => { setLine1Debit(Number(e.target.value)); setLine1Credit(0); }}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Line 2 (Credit) */}
              <div className="bg-slate-50 p-2.5 rounded-lg space-y-2 border border-slate-100">
                <div className="font-bold text-[10px] uppercase text-amber-600">Line Item 2 (Credit Side)</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-slate-400 text-[10px]">Select Account Code</label>
                    <select
                      value={line2Account}
                      onChange={(e) => setLine2Account(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-[11px]"
                    >
                      {accounts.map((a: any) => (
                        <option key={a.code} value={a.code}>{a.code} - {a.name} ({a.type})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px]">Credit Amount ($)</label>
                    <input
                      type="number"
                      value={line2Credit}
                      onChange={(e) => { setLine2Credit(Number(e.target.value)); setLine2Debit(0); }}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {journalError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 font-mono text-[11px] leading-relaxed">
                  <span className="font-bold">Balancing Error:</span> {journalError}
                </div>
              )}

              {journalSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 font-bold">
                  {journalSuccess}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowJournalForm(false)}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer"
                >
                  Post Journal Line
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Creation Modal */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">Generate Accounts Receivable Invoice</h3>
              <button onClick={() => setShowInvoiceForm(false)} className="text-slate-400 hover:text-slate-700">
                X
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Customer / Corporate Client *</label>
                <input
                  type="text"
                  required
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded"
                  placeholder="e.g. Acme Financial Group"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Billed Item Description</label>
                <input
                  type="text"
                  value={invItem}
                  onChange={(e) => setInvItem(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Subtotal Billed Amount ($)</label>
                <input
                  type="number"
                  value={invSubtotal}
                  onChange={(e) => setInvSubtotal(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded font-mono"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>SaaS VAT Standard (15%):</span>
                  <span>${(invSubtotal * 0.15).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Grand Total Billed:</span>
                  <span>${(invSubtotal * 1.15).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceForm(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
