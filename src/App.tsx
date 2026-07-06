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
  Send,
  Lock,
  Unlock,
  Shield,
  Smartphone,
  Laptop,
  Mail,
  Key,
  ShieldAlert,
  Calendar,
  Sun,
  Moon
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
import ClientPortal from './components/ClientPortal';
import CalendarModule from './components/CalendarModule';
import VaultModule from './components/VaultModule';
import UpArrowLogo from './components/UpArrowLogo';

const DEMO_USERS = [
  {
    fullName: "Marcus Aurelius",
    email: "marcus@neunet.io",
    role: "Super Admin",
    department: "Executive",
    phone: "+1 555-1011",
    allowedModules: ['dashboard', 'crm', 'erp', 'pms', 'hrms', 'inventory', 'ai', 'admin', 'calendar', 'vault']
  },
  {
    fullName: "Lucius Seneca",
    email: "seneca@neunet.io",
    role: "Sales Manager",
    department: "Sales",
    phone: "+1 555-1013",
    allowedModules: ['dashboard', 'crm', 'ai', 'calendar', 'vault']
  },
  {
    fullName: "Winston Smith",
    email: "winston@neunet.io",
    role: "Accounts Manager",
    department: "Finance",
    phone: "+1 555-1014",
    allowedModules: ['dashboard', 'erp', 'inventory', 'ai', 'calendar', 'vault']
  },
  {
    fullName: "Hypatia of Alexandria",
    email: "hypatia@neunet.io",
    role: "HR Manager",
    department: "Engineering",
    phone: "+1 555-1012",
    allowedModules: ['dashboard', 'hrms', 'pms', 'ai', 'calendar', 'vault']
  },
  {
    fullName: "Kore Lovelace",
    email: "kore@neunet.io",
    role: "Developer",
    department: "Engineering",
    phone: "+1 555-1015",
    allowedModules: ['pms', 'hrms', 'calendar', 'vault']
  },
  {
    fullName: "Sarah Connor",
    email: "client@acme.com",
    role: "Client",
    department: "Acme Financial Group",
    phone: "+1 (555) 019-2834",
    allowedModules: ['client-portal']
  }
];

export default function App() {
  const [dbState, setDbState] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Light Theme Enforced Only
  const theme = 'light';

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('nbos_theme', 'light');
  }, []);
  
  // Authentication & Session State
  const [userSession, setUserSession] = useState<{
    isLoggedIn: boolean;
    role: string;
    fullName: string;
    email: string;
    department: string;
    phone: string;
    allowedModules: string[];
  } | null>(null);

  // Authenticator form input states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [authStep, setAuthStep] = useState<'credentials' | 'tfa'>('credentials');
  const [selectedDemoUser, setSelectedDemoUser] = useState<any>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

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

  // Post new login log to database state
  const postLoginLog = async (user: string, role: string, status: string, isTfa: boolean) => {
    try {
      await fetch('/api/state/login-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          role,
          ipAddress: '198.51.100.' + Math.floor(10 + Math.random() * 90),
          device: 'Chrome 126 on macOS (Silicon, AI Core)',
          status,
          tfaEnabled: isTfa
        })
      });
    } catch (err) {
      console.error('Failed to register login security logs', err);
    }
  };

  // Perform Simulated Sign-In validation
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setLoginError('Account is currently locked due to multiple failed access attempts. Please reset password.');
      return;
    }

    setLoginError('');
    const matched = DEMO_USERS.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
    
    if (!matched || loginPassword !== 'password123') {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      if (nextFail >= 3) {
        setIsLocked(true);
        postLoginLog(matched?.fullName || loginEmail, matched?.role || 'Guest', 'Locked', false);
        setLoginError('Security Alert: Account has been locked due to 3 failed attempts.');
      } else {
        setLoginError(`Incorrect email or password. Attempt ${nextFail}/3.`);
      }
      return;
    }

    // Set stage to Two-Factor Verification Code Verification
    setSelectedDemoUser(matched);
    setAuthStep('tfa');
    setOtpCode('');
  };

  // Quick Switcher direct pre-login simulator
  const handleQuickLogin = (demoUser: any) => {
    if (isLocked) {
      setLoginError('Security limit active. Unlock account first.');
      return;
    }
    setLoginEmail(demoUser.email);
    setLoginPassword('password123');
    setSelectedDemoUser(demoUser);
    setAuthStep('tfa');
    setOtpCode('');
    setLoginError('');
  };

  // Verify Simulated Two-Factor OTP Passcode
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() !== '123456') {
      setLoginError('Invalid 2-Factor Authentication Code. Enter 123456 to pass.');
      return;
    }

    if (!selectedDemoUser) return;

    // Successful authenticating and session establishing
    const activeSession = {
      isLoggedIn: true,
      role: selectedDemoUser.role,
      fullName: selectedDemoUser.fullName,
      email: selectedDemoUser.email,
      department: selectedDemoUser.department,
      phone: selectedDemoUser.phone,
      allowedModules: selectedDemoUser.allowedModules
    };

    setUserSession(activeSession);
    localStorage.setItem('nbos_session', JSON.stringify(activeSession));
    
    // Redirect role-specific first view
    if (selectedDemoUser.role === 'Client') {
      setActiveModule('client-portal');
    } else if (selectedDemoUser.role === 'Developer') {
      setActiveModule('pms');
    } else {
      setActiveModule('dashboard');
    }

    await postLoginLog(selectedDemoUser.fullName, selectedDemoUser.role, 'Success', true);
    await fetchState(); // Reload audit logs
  };

  const handleLogout = async () => {
    if (userSession) {
      await postLoginLog(userSession.fullName, userSession.role, 'Terminated', false);
    }
    setUserSession(null);
    localStorage.removeItem('nbos_session');
    setLoginEmail('');
    setLoginPassword('');
    setAuthStep('credentials');
    setActiveModule('dashboard');
    await fetchState();
  };

  // Handle forgot password request
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(`Simulated recovery key successfully dispatched to: ${forgotEmail}. Active locks cleared!`);
    setIsLocked(false);
    setFailedAttempts(0);
    setLoginError('');
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
    // Retrieve active sessions if already active
    const saved = localStorage.getItem('nbos_session');
    if (saved) {
      try {
        setUserSession(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
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

  if (!userSession || !userSession.isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 relative overflow-hidden text-slate-800 font-sans text-xs">
        {/* Background glow graphics */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-5xl bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
          {/* Left panel: Info & brand (Featuring the Up Arrow logo and custom colorful graphics) */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#04153F] via-[#0052FF]/20 to-[#00D8F6]/15 z-0" />
            
            {/* Elegant overlapping colorful graphic shapes representing the UP arrow logo motif */}
            <div className="absolute top-[10%] right-[-10%] w-36 h-36 bg-[#00D8F6] opacity-20 blur-xl rounded-full animate-pulse-soft pointer-events-none" />
            <div className="absolute bottom-[20%] left-[-15%] w-48 h-48 bg-[#0B66FF] opacity-15 blur-2xl rounded-full animate-float pointer-events-none" />
            
            {/* Intersecting vector graphic cards illustrating the platform's multi-tenant structure */}
            <div className="absolute bottom-16 right-4 opacity-10 pointer-events-none select-none">
              <svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="40" width="30" height="28" fill="#00D8F6" />
                <rect x="40" y="68" width="30" height="28" fill="#00D8F6" />
                <rect x="40" y="40" width="30" height="28" fill="#04153F" />
                <rect x="40" y="15" width="60" height="58" fill="#0B66FF" />
              </svg>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
                <UpArrowLogo size="60px" showText={true} />
              </div>

              <div className="space-y-4 pt-4">
                <h2 className="text-xl font-bold tracking-tight text-white font-sans leading-snug">
                  Enterprise-Grade Operations & Cockpit
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The ultimate unified platform built on the <strong className="text-white">UP arrow</strong> design system, orchestrating CRM, real-time ledgers, staff operations, and secure key storage.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-lg border border-white/5">
                  <Shield className="h-4.5 w-4.5 text-[#00D8F6] shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-[11px] text-slate-200 leading-normal">
                    <strong>Secure OTP Access</strong>: Multi-tenant database entries are guarded by advanced 2-Factor passcode tokens.
                  </p>
                </div>
                <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-lg border border-white/5">
                  <Cpu className="h-4.5 w-4.5 text-[#0B66FF] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-200 leading-normal">
                    <strong>Grounded Intelligence</strong>: Operations automatically synthesize telemetry logs using Gemini client servers.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-mono text-slate-300">
              <span>SYSTEM VERSION v1.0</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#00D8F6]" /> UTC ENFORCED</span>
            </div>
          </div>

          {/* Right panel: Login forms */}
          <div className="lg:col-span-7 p-8 flex flex-col justify-between">
            <div className="max-w-md w-full mx-auto space-y-6">
              {authStep === 'credentials' ? (
                <>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Secure Employee Access</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Please sign in with your corporate credentials.</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    {loginError && (
                      <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="font-semibold text-[11px]">{loginError}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="winston@neunet.io"
                          className="w-full bg-slate-50 border border-slate-200 pl-10 pr-3 py-2.5 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 transition-all placeholder-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                        <button 
                          type="button" 
                          onClick={() => { setShowForgotModal(true); setForgotSuccess(''); setForgotEmail(loginEmail); }}
                          className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-50 border border-slate-200 pl-10 pr-3 py-2.5 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 transition-all placeholder-slate-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Unlock className="h-4 w-4" />
                      Authenticate Account
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block">
                      STEP 2: 2-FACTOR OTP SECURE GATE
                    </span>
                    <h3 className="text-base font-bold text-slate-800">Two-Factor Authentication</h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      A unique security passcode has been dispatched to <strong>{selectedDemoUser?.phone}</strong>. Enter the passcode to authorize this terminal session.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {loginError && (
                      <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs font-semibold">
                        {loginError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">One-Time Passcode (OTP)</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 123456"
                          className="w-full bg-slate-50 border border-slate-200 pl-10 pr-3 py-2.5 rounded-lg text-xs font-mono tracking-widest text-center focus:outline-hidden focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block italic mt-1">
                        * Simulated passcode: <strong className="text-indigo-600 font-bold">123456</strong>. Enter to authorize instantly.
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setAuthStep('credentials'); setLoginError(''); }}
                        className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-lg border border-slate-200 transition-all cursor-pointer text-center text-xs"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-xs"
                      >
                        <Shield className="h-4 w-4" />
                        Confirm OTP Access
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Quick switch demo logins panel */}
              <div className="pt-6 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Demo Account Quick Access (Switch Roles)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_USERS.map((user) => (
                    <button
                      key={user.email}
                      type="button"
                      onClick={() => handleQuickLogin(user)}
                      className="p-2.5 text-left border border-slate-100 hover:border-indigo-100 bg-slate-50/50 hover:bg-indigo-50/20 rounded-xl transition-all flex flex-col justify-between group cursor-pointer"
                    >
                      <div>
                        <strong className="text-slate-800 text-[11px] leading-tight block group-hover:text-indigo-600 truncate">{user.fullName}</strong>
                        <span className="text-[9px] text-slate-400 block truncate">{user.role}</span>
                      </div>
                      <span className="text-[8px] font-mono uppercase bg-indigo-50 text-indigo-700 px-1.5 py-0.25 rounded font-bold mt-1.5 self-start">
                        {user.department}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 mt-6 pt-4 border-t border-slate-50 leading-relaxed">
              NeuNet Tech solutions platform is compliant with ISO-27001 data isolation & active tenant protection acts.
            </div>
          </div>
        </div>

        {/* Forgot password modal */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-slate-800">
            <div className="bg-white rounded-xl border border-slate-150 p-6 shadow-xl max-w-sm w-full space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="font-bold text-sm text-slate-800">Password Retrieval & Lock Clear</h4>
                <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
              </div>
              
              {forgotSuccess ? (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold leading-relaxed">
                  {forgotSuccess}
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Enter your email to reset failed login attempts and receive recovery details. (Demo passwords are all <strong className="text-slate-700">password123</strong>)
                  </p>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-500 block">Email address</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs"
                      placeholder="winston@neunet.io"
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">
                    Recover Password
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex text-slate-800 antialiased font-sans text-xs transition-colors duration-300">
      
      {/* 1. COLLAPSIBLE LEFT SIDEBAR */}
      <aside 
        className={`bg-slate-900 text-slate-300 flex flex-col border-r border-slate-850 shrink-0 transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-56' : 'w-16'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-3 border-b border-slate-800 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <div className="bg-slate-900/50 p-1 rounded-lg shrink-0">
              <UpArrowLogo size={sidebarOpen ? "32px" : "32px"} showText={sidebarOpen} isDarkBg={true} />
            </div>
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
          {/* Main Cockpit always visible for authorized roles */}
          {userSession.allowedModules.includes('dashboard') && (
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
          )}

          {/* Client-specific Exclusive Portal Workspace link */}
          {userSession.allowedModules.includes('client-portal') && (
            <button
              onClick={() => setActiveModule('client-portal')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeModule === 'client-portal' 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Shield className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>Client Workspace</span>}
            </button>
          )}

          {/* CRM Module (Toggled via SaaS Admin) */}
          {modules.crm && userSession.allowedModules.includes('crm') && (
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
          {modules.erp && userSession.allowedModules.includes('erp') && (
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
          {modules.pms && userSession.allowedModules.includes('pms') && (
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
          {modules.hrms && userSession.allowedModules.includes('hrms') && (
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

          {/* Shared Calendar */}
          {userSession.allowedModules.includes('calendar') && (
            <button
              onClick={() => setActiveModule('calendar')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeModule === 'calendar' 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Calendar className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>Shared Calendar</span>}
            </button>
          )}

          {/* Secure Vault */}
          {userSession.allowedModules.includes('vault') && (
            <button
              onClick={() => setActiveModule('vault')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeModule === 'vault' 
                  ? 'bg-indigo-600 text-white font-bold' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Lock className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span>Secure Vault</span>}
            </button>
          )}

          {/* Inventory Module */}
          {modules.inventory && userSession.allowedModules.includes('inventory') && (
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
          {modules.ai && userSession.allowedModules.includes('ai') && (
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
          {userSession.allowedModules.includes('admin') && (
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
          )}
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
        <header className="h-16 border-b border-slate-150 bg-white px-6 flex items-center justify-between shrink-0 shadow-3xs transition-all duration-300">
          
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
            <div className="hidden md:flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150 font-mono text-[10px] shadow-3xs">
              <Clock className="h-3.5 w-3.5 text-[#0052FF]" />
              <span>UTC: {new Date().toISOString().substring(11, 16)}</span>
            </div>

            {/* Notification system center */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-[#0052FF] rounded-lg border border-slate-150 relative cursor-pointer transition-colors"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#00D8F6] rounded-full border border-white animate-pulse" />
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

            {/* Profile Chip Indicator & Session Logout button */}
            {userSession && (
              <div className="flex items-center gap-2 border-l border-slate-150 pl-3 shrink-0">
                <div className="hidden sm:flex flex-col text-right leading-none">
                  <span className="font-bold text-slate-800 text-[11px] truncate max-w-[120px]">{userSession.fullName}</span>
                  <span className="text-[9px] text-indigo-600 font-semibold font-mono tracking-wide mt-0.5 uppercase">{userSession.role}</span>
                </div>
                <div className="h-8 w-8 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full flex items-center justify-center font-bold text-xs select-none shadow-3xs">
                  {userSession.fullName.charAt(0)}
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout current session"
                  className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg border border-slate-150 transition-colors cursor-pointer animate-fade-in"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
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
                <PMSModule state={dbState} user={userSession} onRefresh={fetchState} brandColor={organization.brandColors.primary} />
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
              {activeModule === 'client-portal' && (
                <ClientPortal state={dbState} user={userSession} onRefresh={fetchState} brandColor={organization.brandColors.primary} />
              )}
              {activeModule === 'calendar' && (
                <CalendarModule state={dbState} onRefresh={fetchState} brandColor={organization.brandColors.primary} />
              )}
              {activeModule === 'vault' && (
                <VaultModule state={dbState} user={userSession} onRefresh={fetchState} brandColor={organization.brandColors.primary} />
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

              {/* Preset Grounded Action Options */}
              <div className="py-2 border-t border-slate-800 space-y-1.5 bg-slate-900 shrink-0">
                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 block font-bold">
                  Quick Database Audit Options:
                </span>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setAiInput("Which projects are currently at risk of delays?")}
                    className="text-[8.5px] font-medium bg-slate-800 hover:bg-indigo-950 hover:text-indigo-300 text-slate-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer transition-all"
                  >
                    ⚠️ Delay Risks
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiInput("What are our highest value high priority leads?")}
                    className="text-[8.5px] font-medium bg-slate-800 hover:bg-indigo-950 hover:text-indigo-300 text-slate-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer transition-all"
                  >
                    🔥 High Value Leads
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiInput("Are there any low stock or out of stock products?")}
                    className="text-[8.5px] font-medium bg-slate-800 hover:bg-indigo-950 hover:text-indigo-300 text-slate-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer transition-all"
                  >
                    📦 Low Stocks
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiInput("Summarize total liquid cash and financial ledger health")}
                    className="text-[8.5px] font-medium bg-slate-800 hover:bg-indigo-950 hover:text-indigo-300 text-slate-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer transition-all"
                  >
                    💰 Ledger Health
                  </button>
                </div>
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
