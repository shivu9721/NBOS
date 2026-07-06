import React, { useState } from 'react';
import { 
  IndianRupee, 
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
  BookOpen,
  Printer,
  Trash2,
  FileText,
  Briefcase,
  X,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { ChartOfAccount, JournalEntry, Invoice, ITService } from '../types';

interface ERPModuleProps {
  state: any;
  onRefresh: () => void;
  brandColor: string;
}

export default function ERPModule({ state, onRefresh, brandColor }: ERPModuleProps) {
  const { accounts, journals, invoices, itServices } = state;
  const [activeSubTab, setActiveTab] = useState<'ledger' | 'accounts' | 'invoices' | 'services'>('ledger');

  // Selected Invoice for Detailed Printing / Preview
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<Invoice | null>(null);

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

  // IT Service Form State
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [srvName, setSrvName] = useState('');
  const [srvPrice, setSrvPrice] = useState<number>(75000);
  const [srvGstRate, setSrvGstRate] = useState<number>(18);
  const [srvDesc, setSrvDesc] = useState('');

  // Document Creator Form State (Invoices, Quotations, Proposals, Bills)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [docType, setDocType] = useState<'Invoice' | 'Quotation' | 'Proposal' | 'Bill'>('Invoice');
  const [customer, setCustomer] = useState('');
  const [gstType, setGstType] = useState<'CGST+SGST' | 'IGST'>('CGST+SGST');
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  
  // Custom Invoice Items list inside builder
  const [invoiceItems, setInvoiceItems] = useState<{ description: string; quantity: number; unitPrice: number; gstRate: number }[]>([
    { description: 'Cloud Server Migration Service SLA', quantity: 1, unitPrice: 150000, gstRate: 18 }
  ]);
  const [customItemDesc, setCustomItemDesc] = useState('');
  const [customItemQty, setCustomItemQty] = useState<number>(1);
  const [customItemPrice, setCustomItemPrice] = useState<number>(50000);
  const [customItemGstRate, setCustomItemGstRate] = useState<number>(18);

  // AI Auditor state
  const [aiAuditText, setAiAuditText] = useState('');
  const [auditing, setAuditing] = useState(false);

  // Fallback for services if undefined
  const safeServices: ITService[] = itServices || [
    { id: "its_01", name: "Cloud Server Migration", price: 150000, gstRate: 18, description: "Secure high-performance multi-tenant AWS/GCP cloud environments migration." },
    { id: "its_02", name: "Cyber Security Audit", price: 85000, gstRate: 18, description: "Penetration testing, encryption hardening and regulatory IT auditing." }
  ];

  // Totals calculations in INR
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

  // Create Custom IT Service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName) return;

    const payload: ITService = {
      id: "its_" + Math.random().toString(36).substring(2, 9),
      name: srvName,
      price: Number(srvPrice),
      gstRate: Number(srvGstRate),
      description: srvDesc
    };

    try {
      const res = await fetch('/api/state/it-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowServiceForm(false);
        setSrvName('');
        setSrvDesc('');
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Item to Invoice Builder List
  const handleAddItemToInvoice = () => {
    if (!customItemDesc) return;
    setInvoiceItems(prev => [
      ...prev,
      {
        description: customItemDesc,
        quantity: Number(customItemQty),
        unitPrice: Number(customItemPrice),
        gstRate: Number(customItemGstRate)
      }
    ]);
    setCustomItemDesc('');
    setCustomItemQty(1);
    setCustomItemPrice(50000);
    setCustomItemGstRate(18);
  };

  // Remove item from Invoice Builder list
  const handleRemoveItemFromInvoice = (index: number) => {
    setInvoiceItems(prev => prev.filter((_, i) => i !== index));
  };

  // Quick select IT Service to pre-fill custom item form
  const handleSelectServiceForInvoiceItem = (serviceId: string) => {
    const srv = safeServices.find(s => s.id === serviceId);
    if (srv) {
      setCustomItemDesc(srv.name);
      setCustomItemPrice(srv.price);
      setCustomItemGstRate(srv.gstRate);
    }
  };

  // Submit dynamic Document / Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || invoiceItems.length === 0) return;

    // Calculate subtotal
    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    // Calculate total GST amount
    const totalGst = invoiceItems.reduce((sum, item) => {
      const itemSubtotal = item.unitPrice * item.quantity;
      const itemGst = itemSubtotal * (item.gstRate / 100);
      return sum + itemGst;
    }, 0);

    const discountedSubtotal = Math.max(0, subtotal - Number(invoiceDiscount));
    const finalTotal = discountedSubtotal + totalGst;

    // Split GST based on tax type
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (gstType === 'CGST+SGST') {
      cgst = totalGst / 2;
      sgst = totalGst / 2;
    } else {
      igst = totalGst;
    }

    // Map items to database invoice lines
    const mappedItems = invoiceItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      gstAmount: (item.unitPrice * item.quantity) * (item.gstRate / 100)
    }));

    const payload = {
      customerName: customer,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: discountedSubtotal,
      taxRate: totalGst / (discountedSubtotal || 1), // effective rate
      discount: Number(invoiceDiscount),
      total: finalTotal,
      status: 'Unpaid',
      items: mappedItems,
      documentType: docType,
      gstType,
      cgst,
      sgst,
      igst
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
        setInvoiceItems([]);
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
        // Close preview if open
        setSelectedInvoiceForPreview(null);
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

  // Trigger browser print
  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Module Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            Finance & Accounting (ERP)
          </h2>
          <p className="text-xs text-slate-500">Expose charts of accounts, automatic GST calculators, invoices and services.</p>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${activeSubTab === 'ledger' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Ledger & Audit
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${activeSubTab === 'accounts' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Accounts (₹)
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${activeSubTab === 'services' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            IT Services (₹)
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer ${activeSubTab === 'invoices' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Sales Documents
          </button>
        </div>
      </div>

      {/* Mini Finance KPI blocks in INR */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Operating Assets</span>
          <h4 className="text-lg font-bold font-mono text-slate-800 mt-1 flex items-center gap-0.5">
            <IndianRupee className="h-4 w-4 shrink-0 text-slate-500" />{totalAssets.toLocaleString('en-IN')}
          </h4>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Vetted Liabilities</span>
          <h4 className="text-lg font-bold font-mono text-slate-800 mt-1 flex items-center gap-0.5">
            <IndianRupee className="h-4 w-4 shrink-0 text-slate-500" />{totalLiabilities.toLocaleString('en-IN')}
          </h4>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Cleared Revenue</span>
          <h4 className="text-lg font-bold font-mono text-emerald-700 mt-1 flex items-center gap-0.5">
            <IndianRupee className="h-4 w-4 shrink-0 text-emerald-500" />{totalRevenue.toLocaleString('en-IN')}
          </h4>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Outstanding Receivables</span>
          <h4 className="text-lg font-bold font-mono text-indigo-700 mt-1 flex items-center gap-0.5">
            <IndianRupee className="h-4 w-4 shrink-0 text-indigo-500" />{totalOutstanding.toLocaleString('en-IN')}
          </h4>
        </div>
      </div>

      {/* 1. General Ledger & Audits Tab */}
      {activeSubTab === 'ledger' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Double-entry Journal Ledger List */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Corporate Double-Entry Ledger Book</h3>
                <p className="text-[11px] text-slate-400">Every journal contains matched debits and credits to ensure integrity.</p>
              </div>
              <button
                onClick={() => setShowJournalForm(true)}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Journal Entry
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {journals.map((journal: JournalEntry) => (
                <div key={journal.id} className="border border-slate-100 rounded-lg p-3 bg-slate-50/20 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 mb-2 font-mono">
                    <span className="font-bold text-slate-700">{journal.memo}</span>
                    <span className="text-slate-400 text-[10px]">{journal.date}</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    {journal.lines.map((line, idx) => {
                      const acc = accounts.find((a: any) => a.code === line.accountCode);
                      return (
                        <div key={idx} className="grid grid-cols-4 gap-2 py-0.5 font-mono">
                          <span className="text-slate-500 font-bold">[{line.accountCode}]</span>
                          <span className="text-slate-700 truncate font-sans">{acc ? acc.name : 'Unknown Account'}</span>
                          <span className="text-right font-semibold text-emerald-700">
                            {line.debit > 0 ? `₹${line.debit.toLocaleString('en-IN')}` : '-'}
                          </span>
                          <span className="text-right font-semibold text-indigo-700">
                            {line.credit > 0 ? `₹${line.credit.toLocaleString('en-IN')}` : '-'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Auditing Assistant */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-xs self-start">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Sparkles className="h-4.5 w-4.5 text-amber-400" />
              <h4 className="font-bold text-sm">AI Financial Auditor</h4>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Verify legal compliance, check double-entry balance sheets, and identify operational bottlenecks using Gemini intelligence.
            </p>
            
            <button
              onClick={handleAiAudit}
              disabled={auditing}
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer transition-all"
            >
              {auditing ? 'Running Ledger Audit...' : 'Audit Corporate Balance Sheet'}
            </button>

            {aiAuditText && (
              <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10.5px] leading-relaxed text-amber-100 font-mono max-h-64 overflow-y-auto whitespace-pre-line">
                {aiAuditText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Chart of Accounts Tab */}
      {activeSubTab === 'accounts' && (
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-800">Chart of Corporate Accounts</h3>
            <p className="text-xs text-slate-400">Current balances in Indian Rupees (INR) across essential balance sheet accounts.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px] tracking-wider bg-slate-50">
                  <th className="py-2.5 px-3">Account Code</th>
                  <th className="py-2.5 px-3">Account Name</th>
                  <th className="py-2.5 px-3">Class Type</th>
                  <th className="py-2.5 px-3">Currency</th>
                  <th className="py-2.5 px-3 text-right">Ledger Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc: ChartOfAccount) => (
                  <tr key={acc.code} className="border-b border-slate-100 hover:bg-slate-50/50 font-mono">
                    <td className="py-3 px-3 font-bold text-slate-500">[{acc.code}]</td>
                    <td className="py-3 px-3 font-sans text-slate-800 font-semibold">{acc.name}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        acc.type === 'Asset' ? 'bg-emerald-50 text-emerald-700' :
                        acc.type === 'Liability' ? 'bg-rose-50 text-rose-700' :
                        acc.type === 'Equity' ? 'bg-amber-50 text-amber-700' :
                        acc.type === 'Income' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-400">INR (₹)</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800">
                      ₹{acc.balance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. IT Services Catalogue Tab */}
      {activeSubTab === 'services' && (
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">IT Services Catalog & Pricing SLA</h3>
              <p className="text-[11px] text-slate-400">Manage definitions, standardized price matrices, and default GST rates for rapid proposal/invoice creation.</p>
            </div>
            <button
              onClick={() => setShowServiceForm(true)}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeServices.map((service) => (
              <div key={service.id} className="border border-slate-150 rounded-xl p-4 space-y-2.5 bg-slate-50/20 hover:border-slate-300 transition-all">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-indigo-600 shrink-0" />
                      {service.name}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-indigo-700 block">
                      ₹{service.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-mono font-bold">
                      GST: {service.gstRate}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed italic">
                  "{service.description || 'No description provided'}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Accounts Receivable & Sales Documents (Invoices, Quotations, Proposals, Bills) */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Accounts Receivable / Sales & Purchase Documents</h3>
              <p className="text-[11px] text-slate-400">Generate, review, and print Tax Invoices, Quotations, Proposals, and Bills with automated Indian GST.</p>
            </div>
            
            <button
              onClick={() => setShowInvoiceForm(true)}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Generate Document
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px] tracking-wider bg-slate-50">
                  <th className="py-2.5 px-3">Doc ID</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Client / Customer</th>
                  <th className="py-2.5 px-3">Issue Date</th>
                  <th className="py-2.5 px-3 text-right">Taxable Subtotal</th>
                  <th className="py-2.5 px-3 text-right">GST Total</th>
                  <th className="py-2.5 px-3 text-right">Grand Total (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: Invoice) => {
                  const itemsCount = inv.items ? inv.items.length : 0;
                  // Estimate total GST if not defined
                  const effectiveGst = inv.igst || ((inv.cgst || 0) + (inv.sgst || 0)) || (inv.total - inv.subtotal);

                  return (
                    <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-500">{inv.invoiceNumber}</td>
                      <td className="py-3 px-3 font-bold text-indigo-700 uppercase text-[9px] font-mono">
                        {inv.documentType || 'Invoice'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{inv.customerName}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{inv.date}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">₹{effectiveGst.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">₹{inv.total.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                          inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          inv.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedInvoiceForPreview(inv)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="h-3 w-3" />
                          View / Print
                        </button>
                        {inv.status === 'Unpaid' && (
                          <button
                            onClick={() => handlePayInvoice(inv.id)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Document Detailed Preview & Printing Template Modal */}
      {selectedInvoiceForPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-800 my-8">
            
            {/* Modal Controls Bar (Non-printable) */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                <Printer className="h-4.5 w-4.5 text-indigo-400" />
                Preview {selectedInvoiceForPreview.documentType || 'Invoice'} : {selectedInvoiceForPreview.invoiceNumber}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerPrint}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Printer className="h-4 w-4" />
                  Print / Save PDF
                </button>
                <button 
                  onClick={() => setSelectedInvoiceForPreview(null)} 
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Print Container area */}
            <div id="invoice-print-area" className="p-8 space-y-6 bg-white font-sans text-slate-900 print:p-0">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h1 className="text-xl font-bold font-sans tracking-tight text-slate-900">
                    {state.organization?.legalName || "NeuNet Technologies Private Limited"}
                  </h1>
                  <p className="text-[10.5px] text-slate-500 mt-1">
                    Corporate Office: Bengaluru Tech Park, Outer Ring Road, Karnataka, 560103<br />
                    GSTIN: 29AAFCN4201M1ZC | Email: billing@neunet.io
                  </p>
                </div>
                
                <div className="text-right">
                  <h2 className="text-2xl font-black text-indigo-600 font-sans tracking-tight uppercase">
                    {selectedInvoiceForPreview.documentType || 'INVOICE'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    Ref: <strong>{selectedInvoiceForPreview.invoiceNumber}</strong><br />
                    Date: {selectedInvoiceForPreview.date}<br />
                    Due Date: {selectedInvoiceForPreview.dueDate}
                  </p>
                </div>
              </div>

              {/* Bill To Info */}
              <div className="grid grid-cols-2 gap-6 border-b border-slate-100 pb-4 text-[11px]">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mb-1">CLIENT BILLING INFO</h4>
                  <p className="font-bold text-slate-800 text-xs">{selectedInvoiceForPreview.customerName}</p>
                  <p className="text-slate-500 mt-1">
                    Corporate Partnership Client<br />
                    Filing Status: Active Commercial Taxpayer
                  </p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mb-1">PAYMENT COMPLIANCE</h4>
                  <p className="font-bold text-slate-700 font-mono">INR Bank Wire Account</p>
                  <p className="text-slate-500 mt-1">
                    Status: <strong className={selectedInvoiceForPreview.status === 'Paid' ? 'text-emerald-600' : 'text-rose-600'}>
                      {selectedInvoiceForPreview.status.toUpperCase()}
                    </strong><br />
                    IFSC: NNSB0004921 | A/C: 1093129481230
                  </p>
                </div>
              </div>

              {/* Items Line Table */}
              <div className="space-y-4">
                <table className="w-full text-left border-collapse text-[10.5px]">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-400 font-mono text-[9.5px] uppercase tracking-wider font-bold">
                      <th className="py-2">Deliverable Description</th>
                      <th className="py-2 text-center w-12">Qty</th>
                      <th className="py-2 text-right w-24">Unit Rate (₹)</th>
                      <th className="py-2 text-right w-28">Line Subtotal (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedInvoiceForPreview.items || []).map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100 font-mono">
                        <td className="py-3 font-sans font-semibold text-slate-800">{item.description}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="py-3 text-right font-bold">₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Automated GST summary and final totals */}
              <div className="flex justify-between items-start pt-4 border-t border-slate-200">
                <div className="max-w-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px]">
                  <h4 className="font-bold text-slate-700 text-[9.5px] uppercase font-mono tracking-wider">GST COMPLIANCE SUMMARY</h4>
                  <p className="text-slate-500">
                    Classification: {selectedInvoiceForPreview.gstType || 'CGST+SGST (Local)'}<br />
                    CGST Total (9%): ₹{(selectedInvoiceForPreview.cgst || 0).toLocaleString('en-IN')}<br />
                    SGST Total (9%): ₹{(selectedInvoiceForPreview.sgst || 0).toLocaleString('en-IN')}<br />
                    IGST Total (18%): ₹{(selectedInvoiceForPreview.igst || 0).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="w-64 space-y-2 text-right text-[11px] font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>Taxable Subtotal:</span>
                    <span>₹{selectedInvoiceForPreview.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedInvoiceForPreview.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Deducted Discount:</span>
                      <span>-₹{selectedInvoiceForPreview.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>GST (CGST+SGST/IGST):</span>
                    <span>
                      ₹{((selectedInvoiceForPreview.cgst || 0) + (selectedInvoiceForPreview.sgst || 0) + (selectedInvoiceForPreview.igst || 0) || (selectedInvoiceForPreview.total - selectedInvoiceForPreview.subtotal)).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-sans font-black border-t border-slate-200 pt-2 text-slate-900">
                    <span>Grand Total:</span>
                    <span className="font-mono text-indigo-700">₹{selectedInvoiceForPreview.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Legal Terms & Vow */}
              <div className="pt-8 border-t border-slate-100 text-[9px] text-slate-400 space-y-2">
                <h5 className="font-bold text-slate-500 uppercase tracking-widest text-[8px]">Terms & Legal Conditions</h5>
                <p className="leading-relaxed">
                  This document serves as an official commercial {selectedInvoiceForPreview.documentType || 'Invoice'} issued by NeuNet Technologies Private Limited.
                  GST has been automated at source. Payment terms are Net-30 from date of issue.
                  Any late remittances are subject to standard commercial penal rates of 1.5% per month.
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-slate-100 font-sans text-slate-500">
                  <span>Audited by: <strong>Winston Smith (Corporate Controller)</strong></span>
                  <span className="border-t border-slate-300 w-32 text-center pt-1 block text-[8px] uppercase tracking-wider font-bold">Authorized Signatory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Journal Entry Creator Modal */}
      {showJournalForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs text-slate-700">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">Post Manual Journal Entry</h3>
              <button onClick={() => setShowJournalForm(false)} className="text-slate-400 hover:text-slate-700 font-bold">X</button>
            </div>

            <form onSubmit={handlePostJournal} className="p-4 space-y-4">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Narrative Memo *</label>
                <input
                  type="text"
                  required
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-xs"
                  placeholder="e.g. Server cluster hosting adjustments"
                />
              </div>

              {/* Line 1: Debit */}
              <div className="space-y-2 p-2.5 bg-slate-50 rounded border border-slate-150">
                <span className="block text-[10px] uppercase font-mono font-bold text-slate-500">Line 1: DEBIT ACC</span>
                <div className="grid grid-cols-2 gap-2">
                  <select value={line1Account} onChange={(e) => setLine1Account(e.target.value)} className="p-1.5 border rounded bg-white text-[11px]">
                    {accounts.map((a: any) => (
                      <option key={a.code} value={a.code}>[{a.code}] {a.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={line1Debit}
                    onChange={(e) => setLine1Debit(Number(e.target.value))}
                    className="p-1.5 border rounded text-xs text-right font-mono"
                    placeholder="Debit (₹)"
                  />
                </div>
              </div>

              {/* Line 2: Credit */}
              <div className="space-y-2 p-2.5 bg-slate-50 rounded border border-slate-150">
                <span className="block text-[10px] uppercase font-mono font-bold text-slate-500">Line 2: CREDIT ACC</span>
                <div className="grid grid-cols-2 gap-2">
                  <select value={line2Account} onChange={(e) => setLine2Account(e.target.value)} className="p-1.5 border rounded bg-white text-[11px]">
                    {accounts.map((a: any) => (
                      <option key={a.code} value={a.code}>[{a.code}] {a.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={line2Credit}
                    onChange={(e) => setLine2Credit(Number(e.target.value))}
                    className="p-1.5 border rounded text-xs text-right font-mono"
                    placeholder="Credit (₹)"
                  />
                </div>
              </div>

              {journalError && <p className="text-rose-600 font-bold font-mono text-[10px]">{journalError}</p>}
              {journalSuccess && <p className="text-emerald-600 font-bold font-mono text-[10px]">{journalSuccess}</p>}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowJournalForm(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer"
                >
                  Verify & Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Service Modal */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs text-slate-700">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-indigo-600" />
                Add IT Service Catalog SLA
              </h3>
              <button onClick={() => setShowServiceForm(false)} className="text-slate-400 hover:text-slate-700 font-bold font-mono">X</button>
            </div>

            <form onSubmit={handleCreateService} className="p-4 space-y-4">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Service Name *</label>
                <input
                  type="text"
                  required
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded focus:outline-hidden text-xs"
                  placeholder="e.g. AWS Cloud Cluster Audit"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Standard Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">GST Rate (%)</label>
                  <select
                    value={srvGstRate}
                    onChange={(e) => setSrvGstRate(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value="18">18% (Standard IT Services)</option>
                    <option value="12">12% (Telecom/Cables)</option>
                    <option value="28">28% (Luxury/Specialised Server)</option>
                    <option value="5">5% (Utility Infrastructure)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">SLA Specifications Description</label>
                <textarea
                  value={srvDesc}
                  onChange={(e) => setSrvDesc(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-slate-200 rounded text-xs"
                  placeholder="Describe what resources, hours and outcomes are covered by this standardized price SLA..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowServiceForm(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer shadow-xs transition-all"
                >
                  Confirm Service Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Generator (Invoice, Quotation, Proposal, Bill) Creator Modal */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs text-slate-700 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden my-8">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <FileCheck className="h-4.5 w-4.5 text-indigo-600" />
                SLA Document Creator
              </h3>
              <button onClick={() => setShowInvoiceForm(false)} className="text-slate-400 hover:text-slate-700 font-bold">X</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold font-mono text-[10px]">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value="Invoice">Official Tax Invoice</option>
                    <option value="Quotation">Project Quotation</option>
                    <option value="Proposal">Service SLA Proposal</option>
                    <option value="Bill">Vendor Account Bill</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold font-mono text-[10px]">GST Classification</label>
                  <select
                    value={gstType}
                    onChange={(e) => setGstType(e.target.value as any)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-xs"
                  >
                    <option value="CGST+SGST">Local state: CGST (9%) + SGST (9%)</option>
                    <option value="IGST">Interstate: IGST (18%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Client / Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded focus:outline-hidden text-xs"
                  placeholder="e.g. Acme Financial Group"
                />
              </div>

              {/* Items in active builder */}
              <div className="space-y-2 border-t border-slate-150 pt-3">
                <span className="block text-[10px] uppercase font-mono font-bold text-slate-500">Document Items Checklist</span>
                
                <div className="space-y-1.5 max-h-32 overflow-y-auto bg-slate-50 p-2 rounded border border-slate-150">
                  {invoiceItems.length === 0 ? (
                    <p className="text-center italic text-slate-400 py-4">No items added to this draft yet.</p>
                  ) : (
                    invoiceItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-[10.5px] py-1 border-b border-slate-200/60 font-mono">
                        <span className="font-sans font-semibold text-slate-700 truncate max-w-[180px]">{item.description}</span>
                        <span className="text-slate-500">{item.quantity} x ₹{item.unitPrice.toLocaleString('en-IN')} ({item.gstRate}% GST)</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromInvoice(index)}
                          className="text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add item inputs */}
              <div className="p-3 bg-indigo-50/20 border border-indigo-100 rounded-lg space-y-2.5">
                <span className="block text-[9.5px] uppercase font-mono font-bold text-indigo-700">Quick-add Item or IT Service SLA</span>
                
                {/* Prefill from IT service drop down */}
                <div className="grid grid-cols-2 gap-2">
                  <select
                    onChange={(e) => handleSelectServiceForInvoiceItem(e.target.value)}
                    defaultValue=""
                    className="p-1.5 border rounded bg-white text-[11px]"
                  >
                    <option value="" disabled>Select IT Service SLA to Auto-Fill</option>
                    {safeServices.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (₹{s.price.toLocaleString('en-IN')})</option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    value={customItemDesc}
                    onChange={(e) => setCustomItemDesc(e.target.value)}
                    className="p-1.5 border rounded text-xs"
                    placeholder="Or enter custom item description..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(Number(e.target.value))}
                    className="p-1.5 border rounded text-xs font-mono"
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    value={customItemPrice}
                    onChange={(e) => setCustomItemPrice(Number(e.target.value))}
                    className="p-1.5 border rounded text-xs font-mono"
                    placeholder="Rate (₹)"
                  />
                  <select
                    value={customItemGstRate}
                    onChange={(e) => setCustomItemGstRate(Number(e.target.value))}
                    className="p-1.5 border rounded bg-white text-[11px]"
                  >
                    <option value="18">18% GST</option>
                    <option value="12">12% GST</option>
                    <option value="28">28% GST</option>
                    <option value="5">5% GST</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddItemToInvoice}
                  className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10.5px] font-bold"
                >
                  Append Line Item to Document
                </button>
              </div>

              {/* Discount */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold font-mono text-[10px]">Applied Discount (₹)</label>
                  <input
                    type="number"
                    value={invoiceDiscount}
                    onChange={(e) => setInvoiceDiscount(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded text-xs font-mono text-right"
                  />
                </div>
                
                {/* Instant dynamic GST/total visualizer */}
                <div className="bg-slate-50 p-2 rounded border border-slate-150 text-[10.5px] font-mono space-y-1">
                  <span className="block text-[8px] uppercase font-bold text-slate-400">Total Projection</span>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{invoiceItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-indigo-700 font-bold border-t border-slate-200 pt-0.5 mt-0.5">
                    <span>Grand Est:</span>
                    <span>
                      ₹{(
                        Math.max(0, invoiceItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) - invoiceDiscount) * 1.18
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInvoiceForm(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer shadow-xs transition-all"
                >
                  Generate {docType}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
