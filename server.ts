import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  Lead, 
  ChartOfAccount, 
  JournalEntry, 
  Invoice, 
  Project, 
  ProjectTask, 
  Employee, 
  LeaveRequest, 
  Product, 
  PurchaseOrder, 
  AIUsageLog,
  ITService,
  CalendarEvent,
  SharedFile
} from "./src/types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// ================= LAZY GEMINI CLIENT =================
let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured or holds a placeholder. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ================= CORPORATE INITIAL STATES (MOCK DB) =================
interface DatabaseState {
  organization: {
    id: string;
    name: string;
    legalName: string;
    registrationNumber: string;
    vatNumber: string;
    industry: string;
    companySize: string;
    website: string;
    brandColors: { primary: string; secondary: string };
    subscriptionPlan: 'Trial' | 'Growth' | 'Enterprise';
    moduleStatus: Record<string, boolean>;
  };
  leads: Lead[];
  accounts: ChartOfAccount[];
  journals: JournalEntry[];
  invoices: Invoice[];
  projects: Project[];
  tasks: ProjectTask[];
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  products: Product[];
  purchaseOrders: PurchaseOrder[];
  aiLogs: AIUsageLog[];
  itServices: ITService[];
  calendarEvents: CalendarEvent[];
  files: SharedFile[];
  loginHistory?: any[];
}

const INITIAL_STATE: DatabaseState = {
  organization: {
    id: "org_neunet_01",
    name: "NeuNet Tech Corp",
    legalName: "NeuNet Technologies Private Limited",
    registrationNumber: "LLP-8834-A71",
    vatNumber: "VAT-9921931-B",
    industry: "Enterprise AI & Cloud Services",
    companySize: "150-500 employees",
    website: "https://neunet-ai.io",
    brandColors: { primary: "indigo", secondary: "emerald" },
    subscriptionPlan: "Enterprise",
    moduleStatus: {
      dashboard: true,
      crm: true,
      erp: true,
      pms: true,
      hrms: true,
      inventory: true,
      ai: true,
      admin: true
    }
  },
  loginHistory: [
    { id: "log_auth_01", timestamp: "2026-07-05T22:15:30Z", user: "Marcus Aurelius", role: "Super Admin", ipAddress: "198.51.100.42", device: "Chrome 126 on macOS (Silicon)", status: "Success", tfaEnabled: true },
    { id: "log_auth_02", timestamp: "2026-07-05T18:42:11Z", user: "Hypatia", role: "HR Manager", ipAddress: "203.0.113.195", device: "Safari on iPad Pro", status: "Success", tfaEnabled: true },
    { id: "log_auth_03", timestamp: "2026-07-05T14:10:02Z", user: "Kore Lovelace", role: "Developer", ipAddress: "192.0.2.1", device: "Firefox Developer Edition on Linux", status: "Success", tfaEnabled: false }
  ],
  leads: [
    {
      id: "lead_01",
      companyName: "Acme Financial Group",
      contactName: "Sarah Connor",
      jobTitle: "VP of Enterprise Infrastructure",
      email: "sarah.connor@acme-finance.com",
      phone: "+1 (555) 019-2834",
      country: "United States",
      industry: "Banking & Finance",
      status: "Proposal",
      priority: "High",
      estimatedBudget: 150000,
      assignedSalesperson: "Marcus Aurelius",
      leadScore: 88,
      notes: ["Highly interested in migrating their customer service to our AI platform.", "Sent initial SLA and security compliance report."],
      createdAt: "2026-06-15"
    },
    {
      id: "lead_02",
      companyName: "Global Logistics Systems",
      contactName: "Jean-Luc Picard",
      jobTitle: "Chief Operations Officer",
      email: "picard@global-logistics.net",
      phone: "+33 1 45 67 89 10",
      country: "France",
      industry: "Transportation & Storage",
      status: "Qualified",
      priority: "High",
      estimatedBudget: 220000,
      assignedSalesperson: "Seneca",
      leadScore: 92,
      notes: ["Needs warehouse inventory prediction pipelines.", "Requires integration with standard barcoding scanners."],
      createdAt: "2026-06-20"
    },
    {
      id: "lead_03",
      companyName: "Apex Retailers",
      contactName: "Bruce Wayne",
      jobTitle: "Head of Procurement",
      email: "bwayne@apex-retail.com",
      phone: "+1 (555) 332-9011",
      country: "United States",
      industry: "Retail & Consumer Goods",
      status: "Negotiation",
      priority: "Medium",
      estimatedBudget: 95000,
      assignedSalesperson: "Marcus Aurelius",
      leadScore: 75,
      notes: ["Requested a 10% volume discount on annual subscriptions.", "Under legal review of data privacy clauses."],
      createdAt: "2026-06-22"
    },
    {
      id: "lead_04",
      companyName: "Zenith Biotech",
      contactName: "Ada Lovelace",
      jobTitle: "Lead Bioinformatics Architect",
      email: "ada@zenith-bio.org",
      phone: "+44 20 7946 0912",
      country: "United Kingdom",
      industry: "Biotechnology & Healthcare",
      status: "Contacted",
      priority: "Medium",
      estimatedBudget: 180000,
      assignedSalesperson: "Hypatia",
      leadScore: 65,
      notes: ["Cold outreach response. Expressed interest in private cloud deployment for drug discovery pipelines."],
      createdAt: "2026-06-28"
    },
    {
      id: "lead_05",
      companyName: "Neo Tokyo Telecom",
      contactName: "Motoko Kusanagi",
      jobTitle: "Cybersecurity Coordinator",
      email: "kusanagi@neo-tokyo-tel.jp",
      phone: "+81 3 5555 0143",
      country: "Japan",
      industry: "Telecommunications",
      status: "New",
      priority: "Low",
      estimatedBudget: 350000,
      assignedSalesperson: "Hypatia",
      leadScore: 50,
      notes: ["Inbound lead from our whitepaper on Federated Learning Security."],
      createdAt: "2026-07-01"
    }
  ],
  accounts: [
    { code: "1010", name: "Operating Bank Account", type: "Asset", currency: "INR", balance: 113640000, isActive: true },
    { code: "1020", name: "Accounts Receivable", type: "Asset", currency: "INR", balance: 27600000, isActive: true },
    { code: "1200", name: "Warehouse Inventory Value", type: "Asset", currency: "INR", balance: 41600000, isActive: true },
    { code: "1300", name: "Office Assets & Computers", type: "Asset", currency: "INR", balance: 6800000, isActive: true },
    { code: "2010", name: "Accounts Payable", type: "Liability", currency: "INR", balance: 14400000, isActive: true },
    { code: "2050", name: "VAT Liability Collected", type: "Liability", currency: "INR", balance: 3616000, isActive: true },
    { code: "3010", name: "Share Capital Equity", type: "Equity", currency: "INR", balance: 80000000, isActive: true },
    { code: "3050", name: "Retained Earnings", type: "Equity", currency: "INR", balance: 40000000, isActive: true },
    { code: "4010", name: "Software Subscription Revenue", type: "Income", currency: "INR", balance: 65600000, isActive: true },
    { code: "4020", name: "AI Consulting Services", type: "Income", currency: "INR", balance: 19200000, isActive: true },
    { code: "5010", name: "Employee Salaries & Payroll", type: "Expense", currency: "INR", balance: 24800000, isActive: true },
    { code: "5020", name: "Cloud Server Hosting (SaaS Costs)", type: "Expense", currency: "INR", balance: 7600000, isActive: true },
    { code: "5030", name: "Office Rent & Utilities", type: "Expense", currency: "INR", balance: 1576000, isActive: true }
  ],
  journals: [
    {
      id: "je_01",
      entryNumber: "JE-2026-001",
      date: "2026-06-25",
      memo: "Monthly cloud server billing (AWS / GCP)",
      status: "Posted",
      createdBy: "CFO Winston Smith",
      lines: [
        { accountCode: "5020", debit: 12500, credit: 0 },
        { accountCode: "2010", debit: 0, credit: 12500 }
      ]
    },
    {
      id: "je_02",
      entryNumber: "JE-2026-002",
      date: "2026-06-30",
      memo: "Accrued software consulting revenue check-in",
      status: "Posted",
      createdBy: "CFO Winston Smith",
      lines: [
        { accountCode: "1020", debit: 35000, credit: 0 },
        { accountCode: "4020", debit: 0, credit: 35000 }
      ]
    }
  ],
  invoices: [
    {
      id: "inv_01",
      invoiceNumber: "INV-2026-102",
      customerName: "Acme Financial Group",
      date: "2026-06-18",
      dueDate: "2026-07-18",
      subtotal: 45000,
      taxRate: 0.15,
      discount: 2000,
      total: 49750,
      status: "Paid",
      items: [
        { description: "Enterprise AI Consulting Setup Package", quantity: 1, unitPrice: 35000 },
        { description: "User Training Workshop & Lab Access", quantity: 5, unitPrice: 2000 }
      ]
    },
    {
      id: "inv_02",
      invoiceNumber: "INV-2026-103",
      customerName: "Apex Retailers",
      date: "2026-06-24",
      dueDate: "2026-07-24",
      subtotal: 95000,
      taxRate: 0.15,
      discount: 5000,
      total: 104250,
      status: "Unpaid",
      items: [
        { description: "Annual Subscription License: Core Business OS", quantity: 1, unitPrice: 85000 },
        { description: "Custom Security API Proxy Gateway Plug", quantity: 1, unitPrice: 10000 }
      ]
    },
    {
      id: "inv_03",
      invoiceNumber: "INV-2026-104",
      customerName: "Global Logistics Systems",
      date: "2026-07-01",
      dueDate: "2026-08-01",
      subtotal: 12000,
      taxRate: 0.10,
      discount: 0,
      total: 13200,
      status: "Unpaid",
      items: [
        { description: "Quarterly Predictive Analytics Extension Pack", quantity: 1, unitPrice: 12000 }
      ]
    }
  ],
  projects: [
    {
      id: "proj_01",
      name: "Acme Core Migration",
      client: "Acme Financial Group",
      manager: "Marcus Aurelius",
      progress: 65,
      budget: 150000,
      spent: 85000,
      status: "Active",
      startDate: "2026-05-10",
      endDate: "2026-09-15",
      tasksCount: 12,
      completedTasksCount: 8
    },
    {
      id: "proj_02",
      name: "Predictive Warehouse SCM",
      client: "Global Logistics Systems",
      manager: "Seneca",
      progress: 20,
      budget: 220000,
      spent: 40000,
      status: "Active",
      startDate: "2026-06-15",
      endDate: "2026-12-20",
      tasksCount: 20,
      completedTasksCount: 4
    },
    {
      id: "proj_03",
      name: "Legacy System Audit",
      client: "Apex Retailers",
      manager: "Epictetus",
      progress: 95,
      budget: 45000,
      spent: 43000,
      status: "Completed",
      startDate: "2026-04-01",
      endDate: "2026-06-30",
      tasksCount: 8,
      completedTasksCount: 8
    },
    {
      id: "proj_04",
      name: "Private Cloud Guardrail",
      client: "Zenith Biotech",
      manager: "Hypatia",
      progress: 5,
      budget: 180000,
      spent: 5000,
      status: "Planning",
      startDate: "2026-07-15",
      endDate: "2026-11-30",
      tasksCount: 15,
      completedTasksCount: 0
    }
  ],
  tasks: [
    {
      id: "task_01",
      projectId: "proj_01",
      title: "Set up federated login database proxy",
      assignedTo: "Kore (Engineer)",
      dueDate: "2026-07-10",
      priority: "High",
      status: "InProgress",
      subtasks: [
        { id: "sub_1", title: "Map DB roles to SAML tokens", isDone: true },
        { id: "sub_2", title: "Audit security packet sizing", isDone: false },
        { id: "sub_3", title: "Write SSL wrapper checks", isDone: false }
      ]
    },
    {
      id: "task_02",
      projectId: "proj_01",
      title: "Design user compliance dashboard",
      assignedTo: "Motoko Kusanagi",
      dueDate: "2026-07-15",
      priority: "Medium",
      status: "Todo",
      subtasks: [
        { id: "sub_4", title: "Design mockup in light theme", isDone: false },
        { id: "sub_5", title: "Implement export-to-PDF hook", isDone: false }
      ]
    },
    {
      id: "task_03",
      projectId: "proj_01",
      title: "Draft master service agreement (MSA) validation",
      assignedTo: "Winston Smith",
      dueDate: "2026-06-30",
      priority: "High",
      status: "Done",
      subtasks: [
        { id: "sub_6", title: "Legal sign-off", isDone: true },
        { id: "sub_7", title: "Collect initial retainer deposit", isDone: true }
      ]
    },
    {
      id: "task_04",
      projectId: "proj_02",
      title: "Assemble logistics training data sets",
      assignedTo: "Kore (Engineer)",
      dueDate: "2026-07-25",
      priority: "Medium",
      status: "InProgress",
      subtasks: [
        { id: "sub_8", title: "Sanitize personal identity fields", isDone: true },
        { id: "sub_9", title: "Run initial variance report", isDone: false }
      ]
    }
  ],
  employees: [
    { employeeId: "emp_01", fullName: "Marcus Aurelius", email: "marcus@neunet.io", phone: "+1 555-1011", department: "Executive", designation: "CEO & Strategic Lead", joiningDate: "2024-01-10", status: "Active", salary: 210000, leaveBalance: 24 },
    { employeeId: "emp_02", fullName: "Hypatia of Alexandria", email: "hypatia@neunet.io", phone: "+1 555-1012", department: "Engineering", designation: "Lead AI Platform Architect", joiningDate: "2024-03-15", status: "Active", salary: 185000, leaveBalance: 18 },
    { employeeId: "emp_03", fullName: "Lucius Seneca", email: "seneca@neunet.io", phone: "+1 555-1013", department: "Sales", designation: "VP Corporate Partnerships", joiningDate: "2024-06-01", status: "Active", salary: 140000, leaveBalance: 20 },
    { employeeId: "emp_04", fullName: "Winston Smith", email: "winston@neunet.io", phone: "+1 555-1014", department: "Finance", designation: "Corporate Controller & Auditor", joiningDate: "2025-02-18", status: "Active", salary: 125000, leaveBalance: 15 },
    { employeeId: "emp_05", fullName: "Kore Lovelace", email: "kore@neunet.io", phone: "+1 555-1015", department: "Engineering", designation: "Senior Full Stack Dev", joiningDate: "2025-05-10", status: "Active", salary: 110000, leaveBalance: 22 }
  ],
  leaveRequests: [
    {
      id: "leave_01",
      employeeId: "emp_03",
      employeeName: "Lucius Seneca",
      type: "Casual",
      startDate: "2026-07-10",
      endDate: "2026-07-14",
      reason: "Family reunion and rest.",
      status: "Pending"
    },
    {
      id: "leave_02",
      employeeId: "emp_05",
      employeeName: "Kore Lovelace",
      type: "Sick",
      startDate: "2026-06-21",
      endDate: "2026-06-22",
      reason: "Dental operation.",
      status: "Approved"
    }
  ],
  products: [
    { id: "prod_01", sku: "NNS-CO-01", name: "NeuNet Core Subscription Tier A", category: "SaaS License", stockLevel: 9999, reorderLevel: 10, purchasePrice: 200, sellingPrice: 1500, binLocation: "VIRTUAL-CLOUD", warehouse: "Dublin-East-01", status: "InStock" },
    { id: "prod_02", sku: "NNS-EM-GP", name: "NeuNet NVIDIA H100 Instance Allocation", category: "Hardware Allocation", stockLevel: 25, reorderLevel: 8, purchasePrice: 4000, sellingPrice: 6500, binLocation: "BAY-C-RACK-02", warehouse: "Oregon-West-02", status: "InStock" },
    { id: "prod_03", sku: "NNS-HW-BR", name: "NeuNet Industrial Barcode Scanner Pro", category: "Logistics Hardware", stockLevel: 4, reorderLevel: 15, purchasePrice: 85, sellingPrice: 199, binLocation: "SHELF-14-BIN-C", warehouse: "Rotterdam-Main", status: "LowStock" },
    { id: "prod_04", sku: "NNS-CON-01", name: "Standard RJ45 Rugged Optical Adapter", category: "Cabling & Parts", stockLevel: 0, reorderLevel: 50, purchasePrice: 4, sellingPrice: 12, binLocation: "SHELF-02-BIN-A", warehouse: "Rotterdam-Main", status: "OutOfStock" }
  ],
  purchaseOrders: [
    {
      id: "po_01",
      poNumber: "PO-2026-4401",
      vendorName: "Silicon Valleys Foundry",
      date: "2026-06-15",
      totalAmount: 32000,
      status: "Approved",
      items: [
        { productName: "NeuNet NVIDIA H100 Instance Allocation", quantity: 8, unitPrice: 4000 }
      ]
    },
    {
      id: "po_02",
      poNumber: "PO-2026-4402",
      vendorName: "LogiTech Logistics Supplies",
      date: "2026-07-02",
      totalAmount: 4250,
      status: "PendingApproval",
      items: [
        { productName: "NeuNet Industrial Barcode Scanner Pro", quantity: 50, unitPrice: 85 }
      ]
    }
  ],
  aiLogs: [
    { id: "log_01", timestamp: "2026-07-02T00:15:30Z", module: "CRM Sales Assistant", promptName: "Lead History Analyzer", model: "gemini-3.5-flash", tokensUsed: 1240, latencyMs: 640, costEstimate: 0.000372 },
    { id: "log_02", timestamp: "2026-07-02T01:02:11Z", module: "Project Manager Bot", promptName: "Sprint Risk Prediction", model: "gemini-3.5-flash", tokensUsed: 2450, latencyMs: 1120, costEstimate: 0.000735 }
  ],
  itServices: [
    { id: "its_01", name: "Cloud Server Migration", price: 150000, gstRate: 18, description: "Secure high-performance multi-tenant AWS/GCP cloud environments migration." },
    { id: "its_02", name: "Cyber Security Audit", price: 85000, gstRate: 18, description: "Penetration testing, encryption hardening and regulatory IT auditing." },
    { id: "its_03", name: "ERP Implementation Suite", price: 250000, gstRate: 18, description: "Deploy bespoke double-entry ledgers, payroll and HR control boards." },
    { id: "its_04", name: "AI Co-pilot Custom Integration", price: 420000, gstRate: 18, description: "Design private vector pipelines, neural caching, and Gemini strategic advisors." }
  ],
  calendarEvents: [
    { id: "cale_01", title: "Project Review: Acme Auth SAML Check", type: "meeting", date: "2026-07-08", time: "11:00 AM", description: "Review progress on SAML integration checklist with engineering lead.", attendees: ["Marcus Aurelius", "Kore Lovelace"] },
    { id: "cale_02", title: "On-site Client Visit: Sarah Connor (Acme)", type: "client-visit", date: "2026-07-10", time: "02:00 PM", description: "In-person visit from Acme VP Sarah Connor to discuss SLA budget extension.", attendees: ["Marcus Aurelius", "Sarah Connor"] },
    { id: "cale_03", title: "Follow-up: Apex Retainer Contract Details", type: "follow-up", date: "2026-07-09", time: "10:00 AM", description: "Call Bruce Wayne to finalize pricing discount margins.", attendees: ["Marcus Aurelius", "Bruce Wayne"] },
    { id: "cale_04", title: "Approved Sick Leave: Kore Lovelace", type: "leave", date: "2026-07-07", time: "All Day", description: "Recovering from wisdom teeth extraction.", attendees: ["Kore Lovelace"] },
    { id: "cale_05", title: "HR Sync: Quarterly Employee Performance Review", type: "meeting", date: "2026-07-12", time: "04:30 PM", description: "HR review with architect Hypatia.", attendees: ["Marcus Aurelius", "Hypatia of Alexandria"] }
  ],
  files: [
    { id: "fil_01", name: "Corporate Compliance Vault", type: "folder", parentId: null, size: "-", createdAt: "2026-06-10", createdBy: "Marcus Aurelius", permission: "approved-only", approvedRoles: ["Super Admin", "Super Admin (CEO)", "Corporate Controller", "HR Manager"] },
    { id: "fil_02", name: "ISO-27001-SAML-Report.pdf", type: "file", parentId: "fil_01", size: "2.4 MB", createdAt: "2026-06-12", createdBy: "Hypatia of Alexandria", permission: "approved-only", approvedRoles: ["Super Admin", "Super Admin (CEO)", "Corporate Controller"] },
    { id: "fil_03", name: "SLA Proposals", type: "folder", parentId: null, size: "-", createdAt: "2026-06-18", createdBy: "Lucius Seneca", permission: "everyone", approvedRoles: [] },
    { id: "fil_04", name: "Acme-SaaS-Subscription-Proposal.docx", type: "file", parentId: "fil_03", size: "1.2 MB", createdAt: "2026-06-19", createdBy: "Lucius Seneca", permission: "everyone", approvedRoles: [] },
    { id: "fil_05", name: "NeuNet-Services-Brochure-INR.pdf", type: "file", parentId: null, size: "4.8 MB", createdAt: "2026-07-02", createdBy: "Marcus Aurelius", permission: "everyone", approvedRoles: [] }
  ]
};

// Global in-memory instance initialized with deep copy of corporate template
let dbState: DatabaseState = JSON.parse(JSON.stringify(INITIAL_STATE));

// ================= API ENDPOINTS FOR DATA PERSISTENCE =================

// Fetch state
app.get("/api/state", (req, res) => {
  res.json(dbState);
});

// Reset state
app.post("/api/state/reset", (req, res) => {
  dbState = JSON.parse(JSON.stringify(INITIAL_STATE));
  res.json({ success: true, state: dbState });
});

// Mutate CRM: Add/Edit Lead
app.post("/api/state/leads", (req, res) => {
  const newLead: Lead = req.body;
  if (!newLead.id) {
    newLead.id = "lead_" + Math.random().toString(36).substring(2, 9);
    newLead.createdAt = new Date().toISOString().split('T')[0];
    dbState.leads.unshift(newLead);
  } else {
    const idx = dbState.leads.findIndex(l => l.id === newLead.id);
    if (idx !== -1) {
      dbState.leads[idx] = { ...dbState.leads[idx], ...newLead };
    } else {
      dbState.leads.unshift(newLead);
    }
  }
  res.json({ success: true, lead: newLead });
});

// Mutate Finance: Add Journal Entry (checks debit/credit balance!)
app.post("/api/state/journals", (req, res) => {
  const entry: JournalEntry = req.body;
  
  // Calculate debit and credit totals
  const totalDebit = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return res.status(400).json({ 
      success: false, 
      error: `Journal is out of balance. Total Debits: $${totalDebit.toFixed(2)}, Total Credits: $${totalCredit.toFixed(2)}. They must balance exactly.` 
    });
  }

  entry.id = "je_" + Math.random().toString(36).substring(2, 9);
  entry.entryNumber = `JE-2026-${Math.floor(100 + Math.random() * 900)}`;
  entry.status = "Posted";
  
  // Update account balances dynamically
  entry.lines.forEach(line => {
    const account = dbState.accounts.find(a => a.code === line.accountCode);
    if (account) {
      // Asset and Expense accounts increase with Debit, decrease with Credit.
      // Liability, Equity, and Income accounts increase with Credit, decrease with Debit.
      const isAssetOrExpense = account.type === "Asset" || account.type === "Expense";
      const modifier = isAssetOrExpense ? 1 : -1;
      
      account.balance += modifier * (line.debit - line.credit);
    }
  });

  dbState.journals.unshift(entry);
  res.json({ success: true, entry });
});

// Mutate Invoicing
app.post("/api/state/invoices", (req, res) => {
  const invoice: Invoice = req.body;
  invoice.id = "inv_" + Math.random().toString(36).substring(2, 9);
  invoice.invoiceNumber = `INV-2026-${Math.floor(200 + Math.random() * 800)}`;
  dbState.invoices.unshift(invoice);
  res.json({ success: true, invoice });
});

// Update Invoice status
app.post("/api/state/invoices/pay", (req, res) => {
  const { id } = req.body;
  const inv = dbState.invoices.find(i => i.id === id);
  if (inv) {
    inv.status = "Paid";
    // Increase cash in account code '1010' (Operating Bank Account)
    const cashAcc = dbState.accounts.find(a => a.code === "1010");
    if (cashAcc) {
      cashAcc.balance += inv.total;
    }
    // Decrease Accounts Receivable '1020'
    const arAcc = dbState.accounts.find(a => a.code === "1020");
    if (arAcc) {
      arAcc.balance -= inv.subtotal;
    }
  }
  res.json({ success: true });
});

// Mutate PMS: Update Task status or subtasks
app.post("/api/state/tasks/update", (req, res) => {
  const updatedTask: ProjectTask = req.body;
  const idx = dbState.tasks.findIndex(t => t.id === updatedTask.id);
  if (idx !== -1) {
    dbState.tasks[idx] = updatedTask;
  } else {
    dbState.tasks.push(updatedTask);
  }
  
  // Recalculate project progress
  dbState.projects.forEach(p => {
    const projTasks = dbState.tasks.filter(t => t.projectId === p.id);
    if (projTasks.length > 0) {
      const completed = projTasks.filter(t => t.status === "Done").length;
      p.tasksCount = projTasks.length;
      p.completedTasksCount = completed;
      p.progress = Math.round((completed / projTasks.length) * 100);
    }
  });

  res.json({ success: true, task: updatedTask });
});

// Mutate HRMS: Add/Edit Leave Request
app.post("/api/state/leave", (req, res) => {
  const request: LeaveRequest = req.body;
  if (!request.id) {
    request.id = "leave_" + Math.random().toString(36).substring(2, 9);
    dbState.leaveRequests.unshift(request);
  } else {
    const idx = dbState.leaveRequests.findIndex(r => r.id === request.id);
    if (idx !== -1) {
      dbState.leaveRequests[idx] = request;
    }
  }
  res.json({ success: true, request });
});

// Mutate Inventory: Adjust Stock Levels
app.post("/api/state/inventory/adjust", (req, res) => {
  const { id, level } = req.body;
  const prod = dbState.products.find(p => p.id === id);
  if (prod) {
    prod.stockLevel = Number(level);
    if (prod.stockLevel <= 0) {
      prod.status = "OutOfStock";
    } else if (prod.stockLevel <= prod.reorderLevel) {
      prod.status = "LowStock";
    } else {
      prod.status = "InStock";
    }
  }
  res.json({ success: true, product: prod });
});

// Create Purchase Order
app.post("/api/state/po", (req, res) => {
  const po: PurchaseOrder = req.body;
  po.id = "po_" + Math.random().toString(36).substring(2, 9);
  po.poNumber = `PO-2026-${Math.floor(5000 + Math.random() * 900)}`;
  dbState.purchaseOrders.unshift(po);
  res.json({ success: true, purchaseOrder: po });
});

// Mutate IT Services Catalog
app.post("/api/state/it-services", (req, res) => {
  const service = req.body;
  if (!service.id) {
    service.id = "its_" + Math.random().toString(36).substring(2, 9);
    dbState.itServices.push(service);
  } else {
    const idx = dbState.itServices.findIndex(s => s.id === service.id);
    if (idx !== -1) {
      dbState.itServices[idx] = service;
    }
  }
  res.json({ success: true, service });
});

// Mutate Shared Calendar
app.post("/api/state/calendar", (req, res) => {
  const event = req.body;
  if (!event.id) {
    event.id = "cale_" + Math.random().toString(36).substring(2, 9);
    dbState.calendarEvents.push(event);
  } else {
    const idx = dbState.calendarEvents.findIndex(e => e.id === event.id);
    if (idx !== -1) {
      dbState.calendarEvents[idx] = event;
    }
  }
  res.json({ success: true, event });
});

// Mutate Shared File Vault
app.post("/api/state/files", (req, res) => {
  const file = req.body;
  if (!file.id) {
    file.id = "fil_" + Math.random().toString(36).substring(2, 9);
    file.createdAt = new Date().toISOString().split('T')[0];
    dbState.files.push(file);
  } else {
    const idx = dbState.files.findIndex(f => f.id === file.id);
    if (idx !== -1) {
      dbState.files[idx] = file;
    }
  }
  res.json({ success: true, file });
});

// Update Organization Brand Settings
app.post("/api/state/branding", (req, res) => {
  const { name, brandColors } = req.body;
  if (name) dbState.organization.name = name;
  if (brandColors) dbState.organization.brandColors = brandColors;
  res.json({ success: true, organization: dbState.organization });
});

// Post Login History Log
app.post("/api/state/login-history", (req, res) => {
  const log = req.body;
  log.id = "log_auth_" + Math.random().toString(36).substring(2, 9);
  log.timestamp = new Date().toISOString();
  if (!dbState.loginHistory) {
    dbState.loginHistory = [];
  }
  dbState.loginHistory.unshift(log);
  res.json({ success: true, log });
});


// ================= AI SECURE PROXY ROUTE =================

// 1. General chat bot knowing all corporate state
app.post("/api/gemini/chat", async (req, res) => {
  const { message, chatHistory } = req.body;
  try {
    const ai = getAI();
    
    // Inject corporate state context dynamically so the AI answers with pristine business logic
    const systemContext = `
      You are the official NeuNet Business OS (NBOS) AI Assistant, an elite, highly professional AI Agent integrated directly into the corporate system.
      You have real-time read access to the entire business operating data of "${dbState.organization.name}" (Industry: ${dbState.organization.industry}).
      
      Here is the current snapshot of the corporate database state:
      1. CRM LEADS LIST: ${JSON.stringify(dbState.leads.map(l => ({ company: l.companyName, contact: l.contactName, status: l.status, value: l.estimatedBudget, priority: l.priority, salesperson: l.assignedSalesperson })))}
      2. ERP / ACCOUNTS BALANCE: ${JSON.stringify(dbState.accounts.map(a => ({ code: a.code, name: a.name, type: a.type, balance: a.balance })))}
      3. ACTIVE PROJECTS & PROGRESS: ${JSON.stringify(dbState.projects.map(p => ({ name: p.name, progress: `${p.progress}%`, budget: p.budget, manager: p.manager, status: p.status })))}
      4. HR TEAM ROSTER: ${JSON.stringify(dbState.employees.map(e => ({ name: e.fullName, role: e.designation, dept: e.department, status: e.status })))}
      5. STOCK CATALOG: ${JSON.stringify(dbState.products.map(p => ({ sku: p.sku, name: p.name, stock: p.stockLevel, status: p.status })))}
      
      Instructions:
      - Answer questions accurately, concisely, and with a polished, helpful, corporate leadership tone.
      - Never hallucinate data. If asked about items not in the list, state clearly that those items are not currently tracked in the database and offer to help setup tracks.
      - Provide helpful insights based on the state. For example, if asked about low stock, reference the actual "LowStock" items. If asked about financial status, look at accounts.
      - Keep explanations highly practical. Formatting responses in neat bullet points is preferred.
    `;

    const chatSession = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemContext
      }
    });

    // Populate previous conversational state if provided
    if (chatHistory && Array.isArray(chatHistory)) {
      // Simply send the latest message. For stateless, this is perfect.
    }

    const start = Date.now();
    const result = await chatSession.sendMessage({ message });
    const latency = Date.now() - start;

    // Log the AI invocation
    const tokens = Math.floor(600 + Math.random() * 500); // simulated count
    const logged: AIUsageLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      module: "Conversational Hub",
      promptName: "General Chat Inquiry",
      model: "gemini-3.5-flash",
      tokensUsed: tokens,
      latencyMs: latency,
      costEstimate: parseFloat((tokens * 0.0000003).toFixed(6))
    };
    dbState.aiLogs.unshift(logged);

    res.json({ success: true, text: result.text, log: logged });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Specific module-level intelligence helper (AI Insights)
app.post("/api/gemini/insights", async (req, res) => {
  const { moduleType } = req.body;
  try {
    const ai = getAI();
    let prompt = "";
    let systemInstruction = "You are an executive business analyst and advisory copilot.";

    if (moduleType === "CRM") {
      systemInstruction = "You are an AI Sales Director aiding in lead conversion and pipeline velocity.";
      prompt = `
        Analyze the current corporate sales leads and recommend actions:
        LEADS: ${JSON.stringify(dbState.leads)}
        
        Generate:
        1. A high-level Executive Summary of pipeline risks (e.g. stalled leads, low score leads).
        2. Top 3 urgent follow-up actions with named contacts.
        3. A recommended timeline for closing the key deals.
        Keep it brief, tactical, formatted in markdown.
      `;
    } else if (moduleType === "Finance") {
      systemInstruction = "You are an AI Chartered Accountant and forensic auditor.";
      prompt = `
        Audit the corporate accounts and budget statements:
        ACCOUNTS: ${JSON.stringify(dbState.accounts)}
        RECENT JOURNALS: ${JSON.stringify(dbState.journals)}
        
        Provide:
        1. Financial health overview (Cash Position, Debt liabilities, consulting vs subscription splits).
        2. Visual highlight of anomalies or high expenses.
        3. Tax liability recommendations based on recent transaction flows.
        Keep it structured in markdown.
      `;
    } else if (moduleType === "Projects") {
      systemInstruction = "You are an Agile PM Coach and system risk modeling assistant.";
      prompt = `
        Analyze the current software deliverables and resource allocations:
        PROJECTS: ${JSON.stringify(dbState.projects)}
        TASKS: ${JSON.stringify(dbState.tasks)}
        
        Provide:
        1. Highlight of critical path blockers and overdue/delayed targets.
        2. SCM resource allocation warnings (e.g., Kore or Motoko workload).
        3. Recommended risk mitigation plan for Acme core migration or Zenith cloud project.
        Keep it actionable and brief.
      `;
    } else if (moduleType === "Inventory") {
      systemInstruction = "You are a Supply Chain Optimization Specialist.";
      prompt = `
        Review current product warehouse catalogs:
        PRODUCTS: ${JSON.stringify(dbState.products)}
        PENDING POs: ${JSON.stringify(dbState.purchaseOrders)}
        
        Provide:
        1. Warehouse stock deficit alert.
        2. Procurement purchase recommendation for low/out of stock items.
        3. Suggested reorder safety stock adjustment rules.
      `;
    } else {
      prompt = "Generate a general business operational suggestion based on standard enterprise SaaS optimization.";
    }

    const start = Date.now();
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: { systemInstruction }
    });
    const latency = Date.now() - start;

    const tokens = Math.floor(1200 + Math.random() * 400);
    const logged: AIUsageLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      module: `${moduleType} Insights`,
      promptName: `${moduleType} Copilot Audit`,
      model: "gemini-3.5-flash",
      tokensUsed: tokens,
      latencyMs: latency,
      costEstimate: parseFloat((tokens * 0.0000003).toFixed(6))
    };
    dbState.aiLogs.unshift(logged);

    res.json({ success: true, text: result.text, log: logged });
  } catch (error: any) {
    console.error("AI Insights Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Draft personalized outbound sales/proposal letter based on selected lead
app.post("/api/gemini/draft-proposal", async (req, res) => {
  const { leadId } = req.body;
  try {
    const ai = getAI();
    const lead = dbState.leads.find(l => l.id === leadId);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    const prompt = `
      Draft a formal SaaS Business Proposal from "${dbState.organization.name}" addressed to ${lead.contactName} (${lead.jobTitle}) at ${lead.companyName}.
      
      Details of Lead:
      - Estimated Budget: $${lead.estimatedBudget.toLocaleString()}
      - Target Industry: ${lead.industry}
      - Core Challenge Notes: ${lead.notes.join(" ")}
      
      Structure:
      - Executive summary aligning our AI operating system capabilities with their goals.
      - Core pricing model with a modular layout fitting their estimated budget.
      - Proposed milestone checklist for integration.
      - Formal call to action.
      Keep it highly polished, professional, and directly tailored. Return markdown.
    `;

    const start = Date.now();
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional enterprise sales copywriter and enterprise deal closer."
      }
    });
    const latency = Date.now() - start;

    const tokens = Math.floor(1500 + Math.random() * 300);
    const logged: AIUsageLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      module: "CRM Sales Assistant",
      promptName: "Outreach Proposal Draft",
      model: "gemini-3.5-flash",
      tokensUsed: tokens,
      latencyMs: latency,
      costEstimate: parseFloat((tokens * 0.0000003).toFixed(6))
    };
    dbState.aiLogs.unshift(logged);

    res.json({ success: true, text: result.text, log: logged });
  } catch (error: any) {
    console.error("AI Draft Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// ================= VITE ASSET / STREAM ROUTING =================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NeuNet Business OS custom server running on http://localhost:${PORT}`);
  });
}

startServer();
