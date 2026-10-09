import React, { useState, useMemo } from 'react';
import { Book, LoanRecord, WaitlistEntry, ReadingGoal, PatronUser, AuditLogEntry } from '../types';
import { DatabaseService, DatabaseSnapshot } from '../services/databaseService';
import {
  X, Database, Terminal, Users, BookOpen, Clock, HardDrive, Download,
  Upload, RefreshCw, Search, Code, CheckCircle2, AlertTriangle, ShieldCheck,
  FileCode, Play, ListFilter, Trash2
} from 'lucide-react';

interface ProgrammerDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  loans: LoanRecord[];
  onUpdateBooks: (books: Book[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warn') => void;
}

type ActiveTab = 'overview' | 'tables' | 'query' | 'raw_json' | 'logs';

export const ProgrammerDatabaseModal: React.FC<ProgrammerDatabaseModalProps> = ({
  isOpen,
  onClose,
  books,
  loans,
  onUpdateBooks,
  onShowToast
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedTable, setSelectedTable] = useState<'books' | 'patrons' | 'waitlists' | 'reading_goals' | 'audit_logs'>('books');
  const [tableSearch, setTableSearch] = useState('');
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM books WHERE out = 1;");
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Compute snapshot
  const snapshot: DatabaseSnapshot = useMemo(() => {
    return DatabaseService.getSnapshot(books, loans);
  }, [books, loans]);

  // Handle SQL / Filter execution
  const executeQuery = (queryToRun?: string) => {
    const q = (queryToRun || sqlQuery).trim();
    setQueryError(null);

    try {
      if (q.toLowerCase().includes('from books')) {
        let res = [...snapshot.tables.books];
        if (q.toLowerCase().includes('out = 1') || q.toLowerCase().includes('out = true')) {
          res = res.filter(b => b.out);
        } else if (q.toLowerCase().includes('out = 0') || q.toLowerCase().includes('out = false')) {
          res = res.filter(b => !b.out);
        } else if (q.toLowerCase().includes('waitlist')) {
          res = res.filter(b => b.waitlist && b.waitlist.length > 0);
        }
        setQueryResult(res);
      } else if (q.toLowerCase().includes('from patrons') || q.toLowerCase().includes('from users')) {
        setQueryResult(snapshot.tables.patrons);
      } else if (q.toLowerCase().includes('from waitlist')) {
        setQueryResult(snapshot.tables.waitlists);
      } else if (q.toLowerCase().includes('from audit') || q.toLowerCase().includes('from logs')) {
        setQueryResult(snapshot.tables.audit_logs);
      } else if (q.toLowerCase().includes('from goals')) {
        setQueryResult(snapshot.tables.reading_goals);
      } else {
        setQueryResult(snapshot.tables.books);
      }
      onShowToast('Query executed successfully', 'success');
    } catch (err: any) {
      setQueryError(err.message || 'Syntax error in SQL query');
    }
  };

  // Export JSON Dump
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `stackline_db_dump_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
    onShowToast('Database JSON dump exported', 'success');
  };

  // Export SQL Script
  const handleExportSql = () => {
    const sqlContent = DatabaseService.exportSql(snapshot);
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(sqlContent);
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `stackline_schema_${new Date().toISOString().split('T')[0]}.sql`);
    dlAnchorElem.click();
    onShowToast('SQL DDL/DML script exported', 'success');
  };

  // Import JSON Dump
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tables && Array.isArray(parsed.tables.books)) {
          onUpdateBooks(parsed.tables.books);
          onShowToast(`Database restored: ${parsed.tables.books.length} books imported`, 'success');
          DatabaseService.logAudit('DB_RESTORED', `Imported database snapshot from file ${file.name}`);
        } else {
          onShowToast('Invalid database schema in JSON file', 'warn');
        }
      } catch (err) {
        onShowToast('Failed to parse database JSON file', 'warn');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-[#161B14] border-2 border-[#B8923F] rounded-2xl shadow-2xl flex flex-col text-[#EFE7D3] overflow-hidden">
        
        {/* HEADER BAR */}
        <div className="bg-[#1F271D] px-6 py-4 border-b border-[#B8923F]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#B8923F]/20 border border-[#B8923F] flex items-center justify-center text-[#B8923F]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono-code font-bold text-base text-[#FAF5E8]">
                  Stackline Developer & Database Console
                </h3>
                <span className="px-2 py-0.5 bg-[#4C7A5D]/20 text-[#4C7A5D] border border-[#4C7A5D]/40 text-[10px] font-mono-code rounded font-bold">
                  v{snapshot.version} LIVE
                </span>
              </div>
              <p className="text-xs font-mono-code text-[#EFE7D3]/60">
                Direct relational data inspection, usage analytics, query runner & persistence manager
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-[#2A3626] hover:bg-[#344430] border border-[#B8923F]/40 text-xs font-mono-code text-[#FAF5E8] rounded flex items-center gap-1.5 transition-colors"
              title="Download full JSON database dump"
            >
              <Download className="w-3.5 h-3.5 text-[#B8923F]" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>
            <button
              onClick={handleExportSql}
              className="px-3 py-1.5 bg-[#2A3626] hover:bg-[#344430] border border-[#B8923F]/40 text-xs font-mono-code text-[#FAF5E8] rounded flex items-center gap-1.5 transition-colors"
              title="Download SQL DDL/DML script"
            >
              <FileCode className="w-3.5 h-3.5 text-[#B8923F]" />
              <span className="hidden sm:inline">Export SQL</span>
            </button>
            <label className="px-3 py-1.5 bg-[#B8923F] hover:bg-[#a58133] text-[#152922] text-xs font-mono-code font-bold rounded flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restore DB</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
            <button
              onClick={onClose}
              className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-[#121610] px-6 py-2.5 border-b border-white/10 flex flex-wrap gap-2 text-xs font-mono-code">
          {[
            { id: 'overview', label: 'Telemetry & Usage', icon: HardDrive },
            { id: 'tables', label: 'Tables & Collections', icon: Database },
            { id: 'query', label: 'SQL Query Console', icon: Terminal },
            { id: 'logs', label: 'Audit Logs', icon: ShieldCheck },
            { id: 'raw_json', label: 'Raw JSON Schema', icon: Code },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#B8923F] text-[#152922] font-bold shadow'
                    : 'text-[#EFE7D3]/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-6 font-mono-code">
          
          {/* TAB 1: OVERVIEW & USAGE METRICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#1D241A] border border-[#B8923F]/30 p-4 rounded-xl">
                  <div className="text-[11px] text-[#B8923F] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>UNIQUE PATRONS</span>
                  </div>
                  <div className="text-2xl font-bold text-[#FAF5E8] mt-1">
                    {snapshot.metrics.totalUniqueUsers}
                  </div>
                  <div className="text-[10px] text-[#EFE7D3]/50 mt-1">
                    Registered campus readers
                  </div>
                </div>

                <div className="bg-[#1D241A] border border-[#B8923F]/30 p-4 rounded-xl">
                  <div className="text-[11px] text-[#4C7A5D] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>CATALOG VOLUMES</span>
                  </div>
                  <div className="text-2xl font-bold text-[#FAF5E8] mt-1">
                    {snapshot.tables.books.length}
                  </div>
                  <div className="text-[10px] text-[#EFE7D3]/50 mt-1">
                    {snapshot.tables.books.filter(b => !b.out).length} on shelf · {snapshot.metrics.activeLoansCount} out
                  </div>
                </div>

                <div className="bg-[#1D241A] border border-[#B8923F]/30 p-4 rounded-xl">
                  <div className="text-[11px] text-[#E8C872] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>CIRCULATION TRANSACTIONS</span>
                  </div>
                  <div className="text-2xl font-bold text-[#FAF5E8] mt-1">
                    {snapshot.metrics.totalCirculationCount}
                  </div>
                  <div className="text-[10px] text-[#EFE7D3]/50 mt-1">
                    Historical loans fulfilled
                  </div>
                </div>

                <div className="bg-[#1D241A] border border-[#B8923F]/30 p-4 rounded-xl">
                  <div className="text-[11px] text-[#8C4A3B] flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>STORAGE UTILIZATION</span>
                  </div>
                  <div className="text-2xl font-bold text-[#FAF5E8] mt-1">
                    {(snapshot.metrics.estimatedStorageBytes / 1024).toFixed(1)} KB
                  </div>
                  <div className="text-[10px] text-[#EFE7D3]/50 mt-1">
                    {snapshot.metrics.totalRecords} total records indexed
                  </div>
                </div>
              </div>

              {/* Patrons Directory ("How many people used it") */}
              <div className="bg-[#1D241A] border border-white/10 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-bold text-sm text-[#FAF5E8] flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#B8923F]" />
                      <span>Patron Directory & Reader Usage History</span>
                    </h4>
                    <p className="text-xs text-[#EFE7D3]/60">
                      Breakdown of active scholars, researchers, and checkouts per patron
                    </p>
                  </div>
                  <span className="text-xs text-[#B8923F]">
                    {snapshot.tables.patrons.length} Registered Accounts
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[#EFE7D3]/60 pb-2">
                        <th className="py-2">PATRON ID</th>
                        <th className="py-2">NAME</th>
                        <th className="py-2">ROLE</th>
                        <th className="py-2">LIFETIME LOANS</th>
                        <th className="py-2">ACTIVE LOANS</th>
                        <th className="py-2">LAST ACTIVE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {snapshot.tables.patrons.map(patron => (
                        <tr key={patron.id} className="hover:bg-white/5">
                          <td className="py-2.5 font-bold text-[#E8C872]">{patron.id}</td>
                          <td className="py-2.5 text-[#FAF5E8]">{patron.name}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px]">
                              {patron.role}
                            </span>
                          </td>
                          <td className="py-2.5 font-bold text-[#4C7A5D]">{patron.booksBorrowedTotal}</td>
                          <td className="py-2.5 font-bold text-[#B8923F]">{patron.activeLoansCount}</td>
                          <td className="py-2.5 text-[#EFE7D3]/60">{patron.lastActiveDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TABLES & COLLECTIONS */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(['books', 'patrons', 'waitlists', 'reading_goals', 'audit_logs'] as const).map(tbl => (
                    <button
                      key={tbl}
                      onClick={() => setSelectedTable(tbl)}
                      className={`px-3 py-1.5 rounded text-xs uppercase font-bold transition-colors ${
                        selectedTable === tbl
                          ? 'bg-[#B8923F] text-[#152922]'
                          : 'bg-[#1D241A] text-[#EFE7D3]/70 hover:text-white'
                      }`}
                    >
                      {tbl} ({snapshot.tables[tbl]?.length || 0})
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/40" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={e => setTableSearch(e.target.value)}
                    placeholder={`Filter ${selectedTable}...`}
                    className="pl-8 pr-3 py-1.5 bg-[#121610] border border-white/20 rounded text-xs focus:outline-none focus:border-[#B8923F] w-56"
                  />
                </div>
              </div>

              {/* Table Data View */}
              <div className="bg-[#121610] border border-white/10 rounded-xl overflow-x-auto max-h-[55vh]">
                {selectedTable === 'books' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1D241A] sticky top-0 border-b border-white/10 text-[#EFE7D3]/60">
                      <tr>
                        <th className="p-2.5">ID</th>
                        <th className="p-2.5">TITLE</th>
                        <th className="p-2.5">AUTHOR</th>
                        <th className="p-2.5">CALL NO</th>
                        <th className="p-2.5">GENRE</th>
                        <th className="p-2.5">STATUS</th>
                        <th className="p-2.5">BORROWER</th>
                        <th className="p-2.5">DUE DATE</th>
                        <th className="p-2.5">WAITLIST</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {snapshot.tables.books
                        .filter(b => !tableSearch || b.title.toLowerCase().includes(tableSearch.toLowerCase()) || b.author.toLowerCase().includes(tableSearch.toLowerCase()))
                        .map(b => (
                          <tr key={b.id} className="hover:bg-white/5">
                            <td className="p-2.5 text-[#B8923F] font-bold">{b.id}</td>
                            <td className="p-2.5 font-bold text-[#FAF5E8]">{b.title}</td>
                            <td className="p-2.5 text-[#EFE7D3]/80">{b.author}</td>
                            <td className="p-2.5 text-[#8C4A3B]">{b.call}</td>
                            <td className="p-2.5">{b.genre}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                b.out ? 'bg-[#8C4A3B]/20 text-[#8C4A3B]' : 'bg-[#4C7A5D]/20 text-[#4C7A5D]'
                              }`}>
                                {b.out ? 'CHECKED_OUT' : 'AVAILABLE'}
                              </span>
                            </td>
                            <td className="p-2.5 text-[#EFE7D3]/70">{b.borrower || '—'}</td>
                            <td className="p-2.5 text-[#E8C872]">{b.due || '—'}</td>
                            <td className="p-2.5">
                              {b.waitlist && b.waitlist.length > 0 ? (
                                <span className="px-2 py-0.5 rounded bg-[#B8923F]/20 text-[#B8923F] text-[10px] font-bold">
                                  {b.waitlist.length} in queue
                                </span>
                              ) : (
                                <span className="text-white/30">0</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}

                {selectedTable === 'waitlists' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1D241A] sticky top-0 border-b border-white/10 text-[#EFE7D3]/60">
                      <tr>
                        <th className="p-2.5">ID</th>
                        <th className="p-2.5">BOOK ID</th>
                        <th className="p-2.5">PATRON</th>
                        <th className="p-2.5">PATRON ID</th>
                        <th className="p-2.5">EMAIL</th>
                        <th className="p-2.5">DATE ADDED</th>
                        <th className="p-2.5">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {snapshot.tables.waitlists.map(w => (
                        <tr key={w.id} className="hover:bg-white/5">
                          <td className="p-2.5 text-[#B8923F] font-bold">{w.id}</td>
                          <td className="p-2.5 font-bold">Book #{w.bookId}</td>
                          <td className="p-2.5 text-[#FAF5E8]">{w.patronName}</td>
                          <td className="p-2.5 text-[#E8C872]">{w.patronId}</td>
                          <td className="p-2.5 text-[#EFE7D3]/70">{w.patronEmail || '—'}</td>
                          <td className="p-2.5">{w.dateAdded}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-amber-900/30 text-amber-300 text-[10px] font-bold">
                              {w.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedTable === 'patrons' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1D241A] sticky top-0 border-b border-white/10 text-[#EFE7D3]/60">
                      <tr>
                        <th className="p-2.5">PATRON ID</th>
                        <th className="p-2.5">NAME</th>
                        <th className="p-2.5">ROLE</th>
                        <th className="p-2.5">TOTAL BORROWED</th>
                        <th className="p-2.5">ACTIVE LOANS</th>
                        <th className="p-2.5">FIRST ACTIVE</th>
                        <th className="p-2.5">LAST ACTIVE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {snapshot.tables.patrons.map(p => (
                        <tr key={p.id} className="hover:bg-white/5">
                          <td className="p-2.5 text-[#B8923F] font-bold">{p.id}</td>
                          <td className="p-2.5 font-bold text-[#FAF5E8]">{p.name}</td>
                          <td className="p-2.5">{p.role}</td>
                          <td className="p-2.5 text-[#4C7A5D] font-bold">{p.booksBorrowedTotal}</td>
                          <td className="p-2.5 text-[#B8923F] font-bold">{p.activeLoansCount}</td>
                          <td className="p-2.5 text-[#EFE7D3]/60">{p.firstActiveDate}</td>
                          <td className="p-2.5 text-[#EFE7D3]/60">{p.lastActiveDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {selectedTable === 'audit_logs' && (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1D241A] sticky top-0 border-b border-white/10 text-[#EFE7D3]/60">
                      <tr>
                        <th className="p-2.5">TIMESTAMP</th>
                        <th className="p-2.5">ACTION</th>
                        <th className="p-2.5">DETAILS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {snapshot.tables.audit_logs.map(log => (
                        <tr key={log.id} className="hover:bg-white/5">
                          <td className="p-2.5 text-[#EFE7D3]/60 text-[11px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-[#B8923F]/20 text-[#B8923F] text-[10px] font-bold">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-2.5 text-[#FAF5E8]">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SQL QUERY CONSOLE */}
          {activeTab === 'query' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#B8923F] font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>SQL / Relational Query Console</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSqlQuery("SELECT * FROM books WHERE out = 1;");
                        executeQuery("SELECT * FROM books WHERE out = 1;");
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[11px] text-[#E8C872]"
                    >
                      Checked Out Books
                    </button>
                    <button
                      onClick={() => {
                        setSqlQuery("SELECT * FROM patrons;");
                        executeQuery("SELECT * FROM patrons;");
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[11px] text-[#E8C872]"
                    >
                      All Patrons
                    </button>
                    <button
                      onClick={() => {
                        setSqlQuery("SELECT * FROM waitlists;");
                        executeQuery("SELECT * FROM waitlists;");
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[11px] text-[#E8C872]"
                    >
                      Waitlists Queue
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <textarea
                    value={sqlQuery}
                    onChange={e => setSqlQuery(e.target.value)}
                    rows={3}
                    className="flex-1 bg-[#121610] border border-white/20 rounded-lg p-3 font-mono-code text-xs text-[#FAF5E8] focus:outline-none focus:border-[#B8923F]"
                  />
                  <button
                    onClick={() => executeQuery()}
                    className="px-4 bg-[#B8923F] hover:bg-[#a58133] text-[#152922] font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>

              {queryError && (
                <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-xs text-red-300">
                  {queryError}
                </div>
              )}

              {queryResult && (
                <div className="bg-[#121610] border border-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2 text-xs text-[#B8923F]">
                    <span>QUERY RESULTS: {queryResult.length} Rows Returned</span>
                    <button onClick={() => setQueryResult(null)} className="hover:underline">Clear</button>
                  </div>
                  <pre className="max-h-60 overflow-y-auto text-[11px] text-[#FAF5E8] bg-black/40 p-3 rounded">
                    {JSON.stringify(queryResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-[#FAF5E8]">Database Audit Trail & Event Ledger</h4>
                <span className="text-xs text-[#EFE7D3]/60">{snapshot.tables.audit_logs.length} Events Logged</span>
              </div>
              <div className="space-y-2">
                {snapshot.tables.audit_logs.map(log => (
                  <div key={log.id} className="p-3 bg-[#1D241A] border border-white/10 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-[#B8923F]/20 text-[#B8923F] font-bold rounded text-[10px]">
                        {log.action}
                      </span>
                      <span className="text-[#FAF5E8]">{log.details}</span>
                    </div>
                    <span className="text-[11px] text-[#EFE7D3]/50">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: RAW JSON SCHEMA */}
          {activeTab === 'raw_json' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#B8923F] font-bold">FULL DATABASE JSON TREE</span>
                <span className="text-[#EFE7D3]/60">Snapshot size: {snapshot.metrics.estimatedStorageBytes} bytes</span>
              </div>
              <pre className="p-4 bg-[#121610] border border-white/10 rounded-xl text-xs text-[#FAF5E8] overflow-x-auto max-h-[58vh]">
                {JSON.stringify(snapshot, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-[#121610] px-6 py-3 border-t border-white/10 flex justify-between items-center text-xs font-mono-code text-[#EFE7D3]/60">
          <div>
            Data Engine: <span className="text-[#4C7A5D] font-bold">Stackline Persistent Store</span> · LocalStorage & IndexedDB synced
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1F271D] hover:bg-white/10 text-white rounded font-bold transition-colors"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
