/**
 * NeuNet Business OS (NBOS) - Core Type Definitions
 * Shared across frontend components and backend simulation states.
 */

export interface OrganizationSettings {
  id: string;
  name: string;
  legalName: string;
  registrationNumber: string;
  vatNumber: string;
  industry: string;
  companySize: string;
  website: string;
  brandColors: {
    primary: string; // Tailwind color class or hex
    secondary: string;
  };
  subscriptionPlan: 'Trial' | 'Growth' | 'Enterprise';
  moduleStatus: {
    dashboard: boolean;
    crm: boolean;
    erp: boolean;
    pms: boolean;
    hrms: boolean;
    inventory: boolean;
    ai: boolean;
    admin: boolean;
  };
}

// ================= CRM MODULE TYPES =================
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  jobTitle: string;
  email: string;
  phone: string;
  country: string;
  industry: string;
  status: LeadStatus;
  priority: 'Low' | 'Medium' | 'High';
  estimatedBudget: number;
  assignedSalesperson: string;
  leadScore: number; // 0 - 100
  notes: string[];
  createdAt: string;
}

export interface SalesOpportunity {
  id: string;
  leadId: string;
  title: string;
  value: number;
  probability: number; // percentage
  stage: LeadStatus;
  expectedCloseDate: string;
  riskScore: 'Low' | 'Medium' | 'High';
}

// ================= ERP & FINANCE MODULE TYPES =================
export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';

export interface ChartOfAccount {
  code: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  isActive: boolean;
}

export interface JournalLine {
  accountCode: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  memo: string;
  lines: JournalLine[];
  status: 'Draft' | 'Posted';
  createdBy: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  dueDate: string;
  subtotal: number;
  taxRate: number; // e.g. 0.15 for 15%
  discount: number;
  total: number;
  status: 'Draft' | 'Unpaid' | 'Paid' | 'Overdue';
  items: { description: string; quantity: number; unitPrice: number; gstAmount?: number }[];
  documentType?: 'Invoice' | 'Quotation' | 'Proposal' | 'Bill';
  gstType?: 'CGST+SGST' | 'IGST';
  cgst?: number;
  sgst?: number;
  igst?: number;
}

// ================= PMS (PROJECT MANAGEMENT) TYPES =================
export interface Project {
  id: string;
  name: string;
  client: string;
  manager: string;
  progress: number; // 0 - 100
  budget: number;
  spent: number;
  status: 'Planning' | 'Active' | 'Delayed' | 'Completed';
  startDate: string;
  endDate: string;
  tasksCount: number;
  completedTasksCount: number;
}

export interface SubTask {
  id: string;
  title: string;
  isDone: boolean;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'InProgress' | 'Done';
  subtasks: SubTask[];
}

export interface Sprint {
  id: string;
  name: string;
  status: 'Future' | 'Active' | 'Completed';
  goal: string;
  startDate: string;
  endDate: string;
}

export interface ProjectRisk {
  id: string;
  category: string; // 'Scope' | 'Budget' | 'Resource' | 'Technical'
  probability: number; // 1-5 scale
  impact: number; // 1-5 scale
  mitigationPlan: string;
}

// ================= HRMS MODULE TYPES =================
export interface Employee {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  status: 'Active' | 'Onboarding' | 'OnLeave' | 'Terminated';
  salary: number;
  leaveBalance: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: 'Present' | 'Late' | 'Absent' | 'HalfDay';
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Casual' | 'Sick' | 'Earned' | 'Maternity' | 'Unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// ================= INVENTORY & SUPPLY CHAIN TYPES =================
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stockLevel: number;
  reorderLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  binLocation: string;
  warehouse: string;
  status: 'InStock' | 'LowStock' | 'OutOfStock';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  date: string;
  totalAmount: number;
  status: 'PendingApproval' | 'Approved' | 'Shipped' | 'Received';
  items: { productName: string; quantity: number; unitPrice: number }[];
}

// ================= AI GATEWAY & PLATFORM TYPES =================
export interface PromptTemplate {
  id: string;
  name: string;
  category: 'CRM' | 'Finance' | 'HR' | 'Projects' | 'General';
  template: string;
  variables: string[];
}

export interface AIUsageLog {
  id: string;
  timestamp: string;
  module: string;
  promptName: string;
  model: string;
  tokensUsed: number;
  latencyMs: number;
  costEstimate: number; // USD
}

// ================= IT SERVICES & CUSTOMER DOCUMENTS =================
export interface ITService {
  id: string;
  name: string;
  price: number;
  gstRate: number; // percentage, e.g. 18
  description: string;
}

// ================= SHARED CALENDAR TYPES =================
export interface CalendarEvent {
  id: string;
  title: string;
  type: 'meeting' | 'client-visit' | 'leave' | 'follow-up' | 'other';
  date: string; // YYYY-MM-DD
  time: string;
  description: string;
  attendees: string[];
}

// ================= FILE SHARING & SECURITY MODULE =================
export interface SharedFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  size: string;
  createdAt: string;
  createdBy: string;
  permission: 'everyone' | 'approved-only';
  approvedRoles: string[]; // e.g. ['Super Admin', 'Accounts Manager', 'HR Manager', 'Developer']
}
