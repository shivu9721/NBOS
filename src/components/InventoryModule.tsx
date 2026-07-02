import React, { useState } from 'react';
import { 
  Package, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  Plus, 
  CheckCircle,
  TrendingDown, 
  ShoppingCart, 
  Boxes,
  FileText,
  BadgeAlert,
  Edit2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Product, PurchaseOrder } from '../types';

interface InventoryModuleProps {
  state: any;
  onRefresh: () => void;
  brandColor: string;
}

export default function InventoryModule({ state, onRefresh, brandColor }: InventoryModuleProps) {
  const { products, purchaseOrders } = state;
  const [activeTab, setActiveTab] = useState<'catalog' | 'procurement'>('catalog');

  // Stock editor form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);

  // Purchase Order Form State
  const [showPOForm, setShowPOForm] = useState(false);
  const [poVendor, setPOVendor] = useState('Silicon Valleys Foundry');
  const [poProduct, setPOProduct] = useState('prod_02'); // NVidia H100
  const [poQty, setPOQty] = useState(10);

  // AI SCM predictions state
  const [aiSCMText, setAiSCMText] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Handle manual stock adjustment
  const handleStockAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch('/api/state/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingProduct.id, level: Number(newStockVal) })
      });
      if (res.ok) {
        setEditingProduct(null);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle PO Creation
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p: Product) => p.id === poProduct);
    if (!prod) return;

    const payload = {
      vendorName: poVendor,
      date: new Date().toISOString().split('T')[0],
      totalAmount: Number(poQty) * prod.purchasePrice,
      status: 'PendingApproval',
      items: [
        { productName: prod.name, quantity: Number(poQty), unitPrice: prod.purchasePrice }
      ]
    };

    try {
      const res = await fetch('/api/state/po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowPOForm(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger SCM predictions via Gemini
  const handleAiSCMPredict = async () => {
    setLoadingAI(true);
    setAiSCMText('');
    try {
      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleType: 'Inventory' })
      });
      const data = await res.json();
      if (data.success) {
        setAiSCMText(data.text);
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
      {/* Module Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Inventory & Procurement (SCM)</h2>
          <p className="text-xs text-slate-500">Track physical assets, automate warehouse dispatch lanes, and audit vendor agreements.</p>
        </div>
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1 font-semibold rounded-md cursor-pointer transition-all ${activeTab === 'catalog' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Product Catalog
          </button>
          <button
            onClick={() => setActiveTab('procurement')}
            className={`px-3 py-1 font-semibold rounded-md cursor-pointer transition-all ${activeTab === 'procurement' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Procurement POs
          </button>
        </div>
      </div>

      {/* Main Inventory Catalog workspace */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Catalog list table */}
          <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden lg:col-span-2">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Warehouse Stocks Ledger</h3>
                <p className="text-xs text-slate-400">Current stock availability indices by warehouse</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-mono uppercase text-[10px] tracking-wider text-slate-400 bg-slate-50/30">
                  <th className="p-4">SKU & Item Name</th>
                  <th className="p-4 text-center">Warehouse Bin</th>
                  <th className="p-4 text-center">Stock Level</th>
                  <th className="p-4">Unit Pricing</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((p: Product) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.sku} • {p.category}</div>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-500">
                      {p.warehouse} • <span className="font-semibold text-slate-600">{p.binLocation}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        p.status === 'InStock' ? 'bg-emerald-50 text-emerald-700' :
                        p.status === 'LowStock' ? 'bg-amber-50 text-amber-700 animate-pulse' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {p.stockLevel} units ({p.status})
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-500">Cost: <strong className="font-mono text-slate-700">${p.purchasePrice}</strong></div>
                      <div className="text-slate-500">Sale: <strong className="text-slate-700">${p.sellingPrice}</strong></div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => { setEditingProduct(p); setNewStockVal(p.stockLevel); }}
                        className="p-1.5 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                        title="Adjust Stock Level"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Stock optimizer panel */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-xs self-start">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
              <h4 className="font-bold text-sm">AI SCM Optimizer</h4>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Analyzes warehouse catalogs, flags low stock levels, and generates purchase order suggestions based on custom reorder constraints.
            </p>
            <button
              onClick={handleAiSCMPredict}
              disabled={loadingAI}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loadingAI ? 'Calculating Stock Deficits...' : 'Run Stock Optimization'}
            </button>

            {aiSCMText && (
              <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10.5px] leading-relaxed text-slate-300 font-mono max-h-56 overflow-y-auto whitespace-pre-line">
                {aiSCMText}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Procurement Purchase Orders */}
      {activeTab === 'procurement' && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Purchase Orders (POs) Ledger</h3>
              <p className="text-xs text-slate-400">Track raw materials procurements from external suppliers</p>
            </div>
            <button
              onClick={() => setShowPOForm(true)}
              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Generate Purchase Order
            </button>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 font-mono uppercase text-[10px] tracking-wider text-slate-400 bg-slate-50/30">
                <th className="p-4">PO Number</th>
                <th className="p-4">Vendor Supplier</th>
                <th className="p-4">Billed Material</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4 text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {purchaseOrders.map((po: PurchaseOrder) => (
                <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-700">{po.poNumber}</td>
                  <td className="p-4 font-semibold text-slate-800">{po.vendorName}</td>
                  <td className="p-4 text-slate-500 font-medium">
                    {po.items?.[0]?.productName} x {po.items?.[0]?.quantity}
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-800">${po.totalAmount.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      po.status === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Adjust Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">Correct Stock: {editingProduct.name}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-700">X</button>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">SKU identifier</label>
                <div className="p-2 bg-slate-50 rounded border border-slate-150 font-mono text-slate-600">
                  {editingProduct.sku}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Input New Correct Stock Units *</label>
                <input
                  type="number"
                  required
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded font-mono"
                  placeholder="e.g. 150"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Reorder limit for this SKU is: {editingProduct.reorderLevel} units</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PO Creation Form */}
      {showPOForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">Generate Purchase Order</h3>
              <button onClick={() => setShowPOForm(false)} className="text-slate-400 hover:text-slate-700">X</button>
            </div>

            <form onSubmit={handleCreatePO} className="p-4 space-y-4">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Select Vendor Supplier *</label>
                <select
                  value={poVendor}
                  onChange={(e) => setPOVendor(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-[11px]"
                >
                  <option value="Silicon Valleys Foundry">Silicon Valleys Foundry</option>
                  <option value="LogiTech Logistics Supplies">LogiTech Logistics Supplies</option>
                  <option value="NVIDIA Direct Wholesale">NVIDIA Direct Wholesale</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1 font-semibold">Select Product SKU *</label>
                  <select
                    value={poProduct}
                    onChange={(e) => setPOProduct(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded bg-white text-[11px]"
                  >
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} (${p.purchasePrice}/u)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">PO Qty</label>
                  <input
                    type="number"
                    value={poQty}
                    onChange={(e) => setPOQty(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPOForm(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer"
                >
                  Post PO Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
