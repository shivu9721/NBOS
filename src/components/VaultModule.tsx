import React, { useState } from 'react';
import { 
  Folder, 
  File, 
  Shield, 
  Lock, 
  Unlock, 
  Download, 
  Plus, 
  Search, 
  Trash, 
  Eye, 
  UserCheck, 
  Users, 
  UploadCloud, 
  Info,
  ChevronRight,
  FolderPlus,
  FileSpreadsheet,
  FileText,
  LockKeyhole,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { motion } from 'motion/react';
import { SharedFile } from '../types';

interface VaultModuleProps {
  state: any;
  user: any;
  onRefresh: () => void;
  brandColor: string;
}

export default function VaultModule({ state, user, onRefresh, brandColor }: VaultModuleProps) {
  const { files } = state;
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  
  // Create File State
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState('1.5 MB');
  const [newFilePermission, setNewFilePermission] = useState<'everyone' | 'approved-only'>('everyone');
  const [newFileApprovedRoles, setNewFileApprovedRoles] = useState<string[]>([]);
  
  // Create Folder State
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderPermission, setNewFolderPermission] = useState<'everyone' | 'approved-only'>('everyone');
  const [newFolderApprovedRoles, setNewFolderApprovedRoles] = useState<string[]>([]);

  const [dragOver, setDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Available roles for file configuration
  const ALL_ROLES = ['Super Admin', 'Sales Manager', 'Accounts Manager', 'HR Manager', 'Developer'];

  // Current directory files
  const currentFiles = (files || []).filter((f: SharedFile) => f.parentId === currentFolderId);

  // Searching flat across all files
  const searchedFiles = searchQuery.trim() !== ''
    ? (files || []).filter((f: SharedFile) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : currentFiles;

  // Find parent folder for navigation trail
  const currentFolder = currentFolderId 
    ? (files || []).find((f: SharedFile) => f.id === currentFolderId && f.type === 'folder')
    : null;

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const payload: SharedFile = {
      id: "fil_" + Math.random().toString(36).substring(2, 9),
      name: newFolderName,
      type: 'folder',
      parentId: currentFolderId,
      size: '-',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: user.fullName,
      permission: newFolderPermission,
      approvedRoles: newFolderPermission === 'approved-only' ? newFolderApprovedRoles : []
    };

    try {
      const res = await fetch('/api/state/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAddFolderModal(false);
        setNewFolderName('');
        setNewFolderPermission('everyone');
        setNewFolderApprovedRoles([]);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const payload: SharedFile = {
      id: "fil_" + Math.random().toString(36).substring(2, 9),
      name: newFileName,
      type: 'file',
      parentId: currentFolderId,
      size: newFileSize || '1.2 MB',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: user.fullName,
      permission: newFilePermission,
      approvedRoles: newFilePermission === 'approved-only' ? newFileApprovedRoles : []
    };

    try {
      const res = await fetch('/api/state/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAddFileModal(false);
        setNewFileName('');
        setNewFileSize('1.5 MB');
        setNewFilePermission('everyone');
        setNewFileApprovedRoles([]);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and drop handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    // Pick the first dropped file
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      
      const payload: SharedFile = {
        id: "fil_" + Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: 'file',
        parentId: currentFolderId,
        size: sizeMB,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: user.fullName,
        permission: 'everyone',
        approvedRoles: []
      };

      try {
        const res = await fetch('/api/state/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3000);
          onRefresh();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Helper to check role authorization
  const isAuthorized = (file: SharedFile) => {
    if (file.permission === 'everyone') return true;
    return file.approvedRoles.includes(user.role) || user.role === 'Super Admin';
  };

  // Toggle role in state
  const toggleRoleSelection = (role: string, type: 'file' | 'folder') => {
    if (type === 'file') {
      setNewFileApprovedRoles(prev => 
        prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
      );
    } else {
      setNewFolderApprovedRoles(prev => 
        prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
      );
    }
  };

  // Get file type icon
  const getFileIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.endsWith('.pdf')) {
      return <FileText className="h-5 w-5 text-rose-500" />;
    }
    if (lower.endsWith('.xlsx') || lower.endsWith('.csv') || lower.endsWith('.xls')) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    }
    return <File className="h-5 w-5 text-indigo-500" />;
  };

  // Stats calculation
  const totalItemsCount = files?.length || 0;
  const filesCount = files?.filter((f: any) => f.type === 'file').length || 0;
  const foldersCount = files?.filter((f: any) => f.type === 'folder').length || 0;

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900 flex items-center gap-2">
            <LockKeyhole className="h-6 w-6 text-indigo-600 animate-pulse" />
            Corporate Shared Secure Vault
          </h2>
          <p className="text-xs text-slate-500">
            Highly secure role-restricted documentation repository. Share files safely between teams and partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add buttons */}
          <button
            onClick={() => setShowAddFolderModal(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-slate-200"
          >
            <FolderPlus className="h-4 w-4 text-slate-500" />
            New Folder
          </button>

          <button
            onClick={() => setShowAddFileModal(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Upload File
          </button>
        </div>
      </div>

      {/* Designed Color Graphics (Vault Dashboard Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between shadow-3xs relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 font-semibold">Repository State</span>
            <h4 className="text-xl font-bold font-mono text-slate-800">{foldersCount} Folders • {filesCount} Files</h4>
            <p className="text-[10px] text-slate-400">Ground isolation rules enforced</p>
          </div>
          <div className="p-3 bg-white/80 rounded-xl text-indigo-600 border border-indigo-100 shrink-0">
            <Folder className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between shadow-3xs relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-600 font-semibold">Active Encryption</span>
            <h4 className="text-xl font-bold text-slate-800 flex items-center gap-1.5 font-mono">
              AES-256 <span className="text-[9px] bg-emerald-500/20 text-emerald-700 font-sans font-bold uppercase px-1.5 py-0.5 rounded-sm">FIPS</span>
            </h4>
            <p className="text-[10px] text-slate-400">Zero-knowledge tenant isolation</p>
          </div>
          <div className="p-3 bg-white/80 rounded-xl text-emerald-600 border border-emerald-100 shrink-0">
            <Shield className="h-6 w-6" />
          </div>
        </div>

        {/* Dynamic Graphic Circle representing Memory Quota */}
        <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between shadow-3xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Vault Memory Allocation</span>
            <h4 className="text-lg font-bold font-mono text-slate-800">11.8 MB / 100 MB</h4>
            <p className="text-[10px] text-slate-400">Safe compliance cloud reserve</p>
          </div>
          <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
            {/* SVG circle graphic */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
              <circle cx="28" cy="28" r="24" stroke="#6366f1" strokeWidth="4" fill="transparent" 
                strokeDasharray="150" strokeDashoffset="132" strokeLinecap="round" />
            </svg>
            <span className="text-[9px] font-mono font-bold text-indigo-600">12%</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb Trail navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
        <button 
          onClick={() => setCurrentFolderId(null)}
          className={`hover:text-indigo-600 cursor-pointer ${currentFolderId === null ? 'text-indigo-600 font-bold' : ''}`}
        >
          Root Vault Workspace
        </button>
        {currentFolder && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-slate-800 font-bold flex items-center gap-1.5">
              <Folder className="h-3.5 w-3.5 text-indigo-500" />
              {currentFolder.name}
            </span>
          </>
        )}
      </div>

      {/* Main Files Table area */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-2xs overflow-hidden">
        {/* Search and control bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents and templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-white pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>Files marked as "Approved Only" are only accessible to permitted role groups.</span>
          </div>
        </div>

        {/* Drag and Drop File Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`m-4 p-5 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            dragOver ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/40'
          }`}
        >
          {uploadSuccess ? (
            <div className="flex flex-col items-center gap-1 animate-pulse">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <p className="text-xs font-bold text-emerald-700">Document Uploaded Successfully!</p>
              <p className="text-[10px] text-slate-400">Stored and indexed in the secure ledger database</p>
            </div>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-slate-400" />
              <div className="text-xs text-slate-600">
                <span className="font-bold text-indigo-600">Drag & Drop files here</span> or click to upload simulated items
              </div>
              <p className="text-[10px] text-slate-400">Supports PDF, XLSX, Word, images up to 50MB</p>
            </>
          )}
        </div>

        {/* Directory Listings */}
        {searchedFiles.length === 0 ? (
          <div className="text-center py-16 text-slate-400 italic text-xs">
            {searchQuery ? 'No matching items found.' : 'This secure folder is empty.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 font-mono uppercase text-[9px] tracking-wider text-slate-400 bg-slate-50/20">
                  <th className="p-4 pl-6">Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Date Added</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Isolation / Access</th>
                  <th className="p-4 text-right pr-6">Vault Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {searchedFiles.map((file: SharedFile) => {
                  const authorized = isAuthorized(file);
                  
                  return (
                    <tr key={file.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="p-4 pl-6 font-semibold text-slate-800">
                        {file.type === 'folder' ? (
                          <button
                            onClick={() => authorized && setCurrentFolderId(file.id)}
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-left cursor-pointer transition-colors"
                          >
                            <Folder className="h-5 w-5 text-indigo-500 fill-indigo-100 group-hover:scale-105 transition-transform shrink-0" />
                            {file.name}
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.name)}
                            <span className={authorized ? 'text-slate-800' : 'text-slate-400 line-through'}>
                              {file.name}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-mono text-[10px] text-slate-400 uppercase">
                        {file.type}
                      </td>
                      <td className="p-4 font-mono text-slate-500">{file.size}</td>
                      <td className="p-4 font-mono text-[10px] text-slate-400">{file.createdAt}</td>
                      <td className="p-4 font-mono text-[10px] text-slate-500">{file.createdBy}</td>
                      <td className="p-4">
                        {file.permission === 'everyone' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-semibold">
                            <Unlock className="h-3 w-3" /> Shared Public
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 font-semibold self-start">
                              <Lock className="h-3 w-3" /> Approved Only
                            </span>
                            {file.approvedRoles && file.approvedRoles.length > 0 && (
                              <span className="text-[9px] text-slate-400 truncate max-w-[150px]" title={file.approvedRoles.join(', ')}>
                                Roles: {file.approvedRoles.join(', ')}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right pr-6">
                        {authorized ? (
                          <div className="flex items-center justify-end gap-2">
                            {file.type === 'file' && (
                              <button
                                title="Download Document"
                                onClick={() => alert(`Starting download secure token sequence for: ${file.name}`)}
                                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1 rounded">Permitted</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 font-semibold flex items-center gap-1 justify-end w-fit ml-auto">
                            <LockKeyhole className="h-3 w-3" /> Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Folder Modal */}
      {showAddFolderModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs text-slate-700">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <FolderPlus className="h-4 w-4 text-indigo-600" />
                Create Operational Folder
              </h3>
              <button onClick={() => setShowAddFolderModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="p-4 space-y-4">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Folder Name *</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded focus:outline-hidden text-xs"
                  placeholder="e.g. Acme Audit Invoices"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Access Level Settings</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setNewFolderPermission('everyone')}
                    className={`p-2 border rounded-lg text-center font-bold transition-all ${
                      newFolderPermission === 'everyone'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    Everyone
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFolderPermission('approved-only')}
                    className={`p-2 border rounded-lg text-center font-bold transition-all ${
                      newFolderPermission === 'approved-only'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    Permitted Roles Only
                  </button>
                </div>
              </div>

              {newFolderPermission === 'approved-only' && (
                <div className="space-y-2 animate-fade-in">
                  <label className="block text-slate-500 font-semibold">Select Permitted Corporate Roles</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_ROLES.map(role => {
                      const selected = newFolderApprovedRoles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRoleSelection(role, 'folder')}
                          className={`px-2.5 py-1 rounded text-[10px] font-semibold border transition-all ${
                            selected
                              ? 'bg-indigo-600 text-white border-indigo-700'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setShowAddFolderModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add File Modal */}
      {showAddFileModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-xs text-slate-700">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-600" />
                Upload Secure Document
              </h3>
              <button onClick={() => setShowAddFileModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFile} className="p-4 space-y-4">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Document Title *</label>
                <input
                  type="text"
                  required
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded focus:outline-hidden text-xs"
                  placeholder="e.g. Master-Service-Agreement-v4.pdf"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-semibold">Simulated Size</label>
                  <input
                    type="text"
                    required
                    value={newFileSize}
                    onChange={(e) => setNewFileSize(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded text-xs"
                    placeholder="e.g. 2.4 MB"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Access Security Level</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setNewFilePermission('everyone')}
                    className={`p-2 border rounded-lg text-center font-bold transition-all ${
                      newFilePermission === 'everyone'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    Everyone
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFilePermission('approved-only')}
                    className={`p-2 border rounded-lg text-center font-bold transition-all ${
                      newFilePermission === 'approved-only'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    Permitted Roles Only
                  </button>
                </div>
              </div>

              {newFilePermission === 'approved-only' && (
                <div className="space-y-2 animate-fade-in">
                  <label className="block text-slate-500 font-semibold">Select Permitted Corporate Roles</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_ROLES.map(role => {
                      const selected = newFileApprovedRoles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRoleSelection(role, 'file')}
                          className={`px-2.5 py-1 rounded text-[10px] font-semibold border transition-all ${
                            selected
                              ? 'bg-indigo-600 text-white border-indigo-700'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setShowAddFileModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold cursor-pointer"
                >
                  Add Secure File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
