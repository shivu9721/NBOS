import React, { useState } from 'react';
import { 
  Settings, 
  Sliders, 
  Globe, 
  Paintbrush, 
  CheckCircle, 
  Cpu, 
  Database,
  Building,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { motion } from 'motion/react';

interface SaaSAdminProps {
  state: any;
  onRefresh: () => void;
  brandColor: string;
}

export default function SaaSAdmin({ state, onRefresh, brandColor }: SaaSAdminProps) {
  const { organization } = state;
  
  // Custom brand states
  const [orgName, setOrgName] = useState(organization.name);
  const [primaryColor, setPrimaryColor] = useState(organization.brandColors.primary);
  const [secondaryColor, setSecondaryColor] = useState(organization.brandColors.secondary);
  const [domain, setDomain] = useState('neunet-ai.io');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Module statuses local toggles
  const [modules, setModules] = useState<Record<string, boolean>>(organization.moduleStatus);

  // Handle module toggle click
  const handleToggleModule = async (key: string) => {
    const updatedModules = { ...modules, [key]: !modules[key] };
    setModules(updatedModules);
    
    // Save to state
    try {
      // Modify database directly on server
      const res = await fetch('/api/state/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...state.organization, 
          moduleStatus: updatedModules 
        })
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit customization changes
  const handleSubmitBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/state/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName,
          brandColors: { primary: primaryColor, secondary: secondaryColor }
        })
      });
      if (res.ok) {
        setSuccessMsg('Branding profiles successfully updated.');
        setTimeout(() => setSuccessMsg(''), 3000);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">SaaS Administration & White-Label Panel</h2>
        <p className="text-xs text-slate-500">Configure licensing modules, tenant isolate parameters, and branding parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Controller Panel (2/3 width) */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Licensing Module Activation</h3>
            <p className="text-xs text-slate-400">Toggle active modules. Deactivated modules are instantly hidden from sidebar routes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
            {Object.keys(modules).map(key => {
              if (key === 'dashboard' || key === 'admin') return null; // Always active
              const active = modules[key];
              return (
                <div 
                  key={key} 
                  className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${
                    active 
                      ? 'bg-slate-50/50 border-slate-200' 
                      : 'bg-slate-100/30 border-slate-150 opacity-60'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase font-mono">{key} Module</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {key === 'crm' && 'Lead Pipeline & Outbounds'}
                      {key === 'erp' && 'Accounting ledgers & COA'}
                      {key === 'pms' && 'Gantt tasks & checklists'}
                      {key === 'hrms' && 'Vacations & Attendance Badge'}
                      {key === 'inventory' && 'Stock adjustments & Purchase Orders'}
                      {key === 'ai' && 'Grounded Assistant & Logs'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleModule(key)}
                    className="p-1 hover:bg-slate-100 rounded transition-colors text-indigo-600 cursor-pointer"
                  >
                    {active ? (
                      <ToggleRight className="h-9 w-9 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="h-9 w-9 text-slate-300" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Corporate white label customizing (1/3 width) */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">White-Label Customization</h3>
            <p className="text-xs text-slate-400">Apply organizational palette parameters</p>
          </div>

          <form onSubmit={handleSubmitBranding} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-semibold">Tenant Branding Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Primary Color</label>
                <select
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-[11px]"
                >
                  <option value="indigo">Indigo Corporate</option>
                  <option value="emerald">Emerald Forest</option>
                  <option value="blue">Deep Ocean Blue</option>
                  <option value="violet">Amethyst Purple</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Secondary Color</label>
                <select
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white text-[11px]"
                >
                  <option value="indigo">Indigo Corporate</option>
                  <option value="emerald">Emerald Forest</option>
                  <option value="blue">Deep Ocean Blue</option>
                  <option value="violet">Amethyst Purple</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 font-semibold">Corporate Domain Mapping</label>
              <div className="relative">
                <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded focus:outline-hidden"
                />
              </div>
            </div>

            {successMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded text-emerald-800 text-[11px] font-semibold text-center">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Applying branding...' : 'Update Branding Profile'}
            </button>
          </form>
        </div>
      </div>

      {/* Corporate Isolate Auditing & Quotas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
            <Building className="h-4.5 w-4.5 text-indigo-600" />
            Tenant Legal Profile Snapshot
          </h3>
          <div className="space-y-3.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Organization LLP Registration Number:</span>
              <strong className="font-mono text-slate-800">{organization.registrationNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span>VAT / GST Registration Reference:</span>
              <strong className="font-mono text-slate-800">{organization.vatNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span>Corporate Website Host:</span>
              <strong className="text-slate-800 underline">{domain}</strong>
            </div>
            <div className="flex justify-between">
              <span>Active subscription quota:</span>
              <strong className="text-indigo-600 font-bold">{organization.subscriptionPlan} Pack (UNLIMITED_NODES)</strong>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
            <HardDrive className="h-4.5 w-4.5 text-indigo-600" />
            Active SaaS Quota & Storage
          </h3>
          <div className="space-y-4">
            {/* Storage slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Enterprise private cloud storage allocation</span>
                <span className="font-mono font-medium">1.2 GB / 50 GB</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '2.4%' }} />
              </div>
            </div>

            {/* API rate limit slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Cognitive prompt requests limit index</span>
                <span className="font-mono font-medium">45 / 5000 API calls / month</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '1%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Logs & Access Audit */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 mt-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-800">Security & Authentication Audit Records</h3>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            Role-Based Compliance: Active
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 font-mono uppercase text-[10px] tracking-wider text-slate-400 bg-slate-50/30">
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Staff / Account Name</th>
                <th className="p-3">Access Role</th>
                <th className="p-3">Secure IP Address</th>
                <th className="p-3">Terminal Browser Agent</th>
                <th className="p-3 text-right">Login Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.loginHistory?.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-mono text-[10px] text-slate-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-bold text-slate-800">{log.user}</td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-500">{log.ipAddress}</td>
                  <td className="p-3 text-slate-500 truncate max-w-[200px]" title={log.device}>
                    {log.device}
                  </td>
                  <td className="p-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      log.status === "Success"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : log.status === "2FA_Pending"
                        ? "bg-amber-50 border-amber-100 text-amber-700"
                        : "bg-rose-50 border-rose-100 text-rose-700"
                    }`}>
                      {log.status === "Success" ? "✓ Authorized" : log.status === "2FA_Pending" ? "OTP Pending" : "✗ Locked / Blocked"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
