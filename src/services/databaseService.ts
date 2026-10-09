import { Book, LoanRecord, WaitlistEntry, ReadingGoal, PatronUser, AuditLogEntry } from '../types';
import { INITIAL_BOOKS } from '../data/initialBooks';

const STORAGE_KEY_BOOKS = 'stackline_library_books_v2';
const STORAGE_KEY_LOANS = 'stackline_library_loans_v2';
const STORAGE_KEY_GOALS = 'stackline_library_goals_v2';
const STORAGE_KEY_AUDIT = 'stackline_library_audit_v2';

export interface DatabaseSnapshot {
  version: string;
  timestamp: string;
  tables: {
    books: Book[];
    loans: LoanRecord[];
    waitlists: WaitlistEntry[];
    patrons: PatronUser[];
    reading_goals: ReadingGoal[];
    audit_logs: AuditLogEntry[];
  };
  metrics: {
    totalRecords: number;
    totalUniqueUsers: number;
    totalCirculationCount: number;
    activeLoansCount: number;
    overdueCount: number;
    waitlistCount: number;
    estimatedStorageBytes: number;
  };
}

// Generate initial patrons from current books and sample users
function extractInitialPatrons(books: Book[]): PatronUser[] {
  const patronMap = new Map<string, PatronUser>();

  // Add default campus users
  const defaultPatrons: PatronUser[] = [
    { id: 'STU-8821', name: 'Elena Rostova', role: 'Student', booksBorrowedTotal: 14, activeLoansCount: 1, firstActiveDate: '2026-08-15', lastActiveDate: '2026-10-06' },
    { id: 'STU-6540', name: 'Marcus Chen', role: 'Student', booksBorrowedTotal: 9, activeLoansCount: 1, firstActiveDate: '2026-09-01', lastActiveDate: '2026-09-20' },
    { id: 'FAC-1904', name: 'Dr. Aris Thorne', role: 'Faculty', booksBorrowedTotal: 27, activeLoansCount: 1, firstActiveDate: '2026-01-10', lastActiveDate: '2026-10-05' },
    { id: 'STU-4109', name: 'Marcus Vance', role: 'Student', booksBorrowedTotal: 19, activeLoansCount: 0, firstActiveDate: '2026-02-14', lastActiveDate: '2026-10-04' },
    { id: 'STU-5520', name: 'Clara Oswald', role: 'Student', booksBorrowedTotal: 6, activeLoansCount: 0, firstActiveDate: '2026-09-12', lastActiveDate: '2026-10-06' },
    { id: 'STU-9201', name: 'Samantha Reed', role: 'Student', booksBorrowedTotal: 11, activeLoansCount: 0, firstActiveDate: '2026-04-20', lastActiveDate: '2026-10-07' },
    { id: 'FAC-9012', name: 'Julian Chen', role: 'Researcher', booksBorrowedTotal: 32, activeLoansCount: 0, firstActiveDate: '2026-01-15', lastActiveDate: '2026-10-01' },
    { id: 'LIB-0001', name: 'Archivist Sarah Jenkins', role: 'Librarian', booksBorrowedTotal: 4, activeLoansCount: 0, firstActiveDate: '2025-09-01', lastActiveDate: '2026-10-08' }
  ];

  defaultPatrons.forEach(p => patronMap.set(p.id, p));

  // Sync with active borrowers in books
  books.forEach(b => {
    if (b.out && b.borrowerId) {
      const existing = patronMap.get(b.borrowerId);
      if (existing) {
        existing.activeLoansCount += 1;
      } else {
        patronMap.set(b.borrowerId, {
          id: b.borrowerId,
          name: b.borrower || 'Campus Scholar',
          role: b.borrowerId.startsWith('FAC') ? 'Faculty' : 'Student',
          booksBorrowedTotal: 1,
          activeLoansCount: 1,
          firstActiveDate: b.borrowedDate || '2026-10-01',
          lastActiveDate: new Date().toISOString().split('T')[0]
        });
      }
    }
  });

  return Array.from(patronMap.values());
}

export class DatabaseService {
  /**
   * Retrieves complete snapshot of the system's database
   */
  static getSnapshot(books: Book[], loans: LoanRecord[]): DatabaseSnapshot {
    // Extract waitlists
    const waitlists: WaitlistEntry[] = [];
    books.forEach(b => {
      if (b.waitlist && b.waitlist.length > 0) {
        b.waitlist.forEach(w => waitlists.push(w));
      }
    });

    // Extract patrons
    const patrons = extractInitialPatrons(books);

    // Reading goals
    const savedGoals = localStorage.getItem(STORAGE_KEY_GOALS);
    const readingGoals: ReadingGoal[] = savedGoals ? JSON.parse(savedGoals) : [
      { monthKey: '2026-10', targetCount: 12, monthName: 'October 2026' },
      { monthKey: '2026-09', targetCount: 10, monthName: 'September 2026' }
    ];

    // Audit logs
    const savedAudit = localStorage.getItem(STORAGE_KEY_AUDIT);
    const auditLogs: AuditLogEntry[] = savedAudit ? JSON.parse(savedAudit) : [
      { id: 'aud-1', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), action: 'BOOK_ADDED', details: 'Initial catalog collections seeded successfully.' },
      { id: 'aud-2', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), action: 'LOAN_ISSUED', details: 'Loan issued for Clean Code to Elena Rostova (STU-8821).' },
      { id: 'aud-3', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), action: 'WAITLIST_ADDED', details: 'Added Marcus Vance to waitlist for Clean Code.' }
    ];

    const activeLoans = books.filter(b => b.out);
    const overdueCount = books.filter(b => {
      if (!b.out || !b.dueDateIso) return false;
      return new Date(b.dueDateIso).getTime() < new Date().setHours(0,0,0,0);
    }).length;

    const totalCirculation = books.reduce((acc, b) => acc + (b.timesBorrowed || 0), 0);

    const snapshotString = JSON.stringify({ books, loans, waitlists, patrons, readingGoals, auditLogs });
    const estimatedStorageBytes = new Blob([snapshotString]).size;

    return {
      version: '2.4.0',
      timestamp: new Date().toISOString(),
      tables: {
        books,
        loans,
        waitlists,
        patrons,
        reading_goals: readingGoals,
        audit_logs: auditLogs
      },
      metrics: {
        totalRecords: books.length + loans.length + waitlists.length + patrons.length + readingGoals.length + auditLogs.length,
        totalUniqueUsers: patrons.length,
        totalCirculationCount: totalCirculation,
        activeLoansCount: activeLoans.length,
        overdueCount: overdueCount,
        waitlistCount: waitlists.length,
        estimatedStorageBytes
      }
    };
  }

  /**
   * Log an audit event
   */
  static logAudit(action: AuditLogEntry['action'], details: string, entityId?: string | number) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      const logs: AuditLogEntry[] = saved ? JSON.parse(saved) : [];
      logs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action,
        details,
        entityId
      });
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(logs.slice(0, 100))); // Keep last 100 logs
    } catch (e) {
      console.error('Failed to write audit log', e);
    }
  }

  /**
   * Export database as SQL DDL/DML dump
   */
  static exportSql(snapshot: DatabaseSnapshot): string {
    let sql = `-- Stackline Campus Library Database Dump\n`;
    sql += `-- Export Date: ${snapshot.timestamp}\n`;
    sql += `-- Schema Version: ${snapshot.version}\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS books (\n  id INTEGER PRIMARY KEY,\n  title TEXT NOT NULL,\n  author TEXT NOT NULL,\n  genre TEXT NOT NULL,\n  call_number TEXT NOT NULL,\n  isbn TEXT,\n  pages INTEGER,\n  shelf_location TEXT,\n  is_out BOOLEAN,\n  borrower TEXT,\n  borrower_id TEXT,\n  due_date TEXT,\n  times_borrowed INTEGER\n);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS patrons (\n  id TEXT PRIMARY KEY,\n  name TEXT NOT NULL,\n  role TEXT NOT NULL,\n  books_borrowed_total INTEGER,\n  active_loans_count INTEGER,\n  first_active_date TEXT\n);\n\n`;

    sql += `CREATE TABLE IF NOT EXISTS waitlists (\n  id TEXT PRIMARY KEY,\n  book_id INTEGER,\n  patron_name TEXT,\n  patron_id TEXT,\n  date_added TEXT,\n  status TEXT\n);\n\n`;

    // Books data
    snapshot.tables.books.forEach(b => {
      const title = b.title.replace(/'/g, "''");
      const author = b.author.replace(/'/g, "''");
      sql += `INSERT INTO books (id, title, author, genre, call_number, isbn, pages, shelf_location, is_out, borrower, borrower_id, due_date, times_borrowed) VALUES (${b.id}, '${title}', '${author}', '${b.genre}', '${b.call}', '${b.isbn || ''}', ${b.pages || 0}, '${b.shelfLocation || ''}', ${b.out ? 1 : 0}, '${(b.borrower || '').replace(/'/g, "''")}', '${b.borrowerId || ''}', '${b.due || ''}', ${b.timesBorrowed || 0});\n`;
    });

    sql += `\n`;

    // Patrons data
    snapshot.tables.patrons.forEach(p => {
      sql += `INSERT INTO patrons (id, name, role, books_borrowed_total, active_loans_count, first_active_date) VALUES ('${p.id}', '${p.name.replace(/'/g, "''")}', '${p.role}', ${p.booksBorrowedTotal}, ${p.activeLoansCount}, '${p.firstActiveDate}');\n`;
    });

    return sql;
  }
}
