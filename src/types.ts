export interface LoanRecord {
  id: string;
  bookId: number;
  bookTitle: string;
  patronName: string;
  patronId: string;
  borrowedDate: string; // ISO date string
  dueDate: string; // ISO date string
  returnedDate?: string; // ISO date string
  status: 'active' | 'returned' | 'overdue';
}

export interface WaitlistEntry {
  id: string;
  bookId: number;
  bookTitle?: string;
  patronName: string;
  patronId: string;
  patronEmail?: string;
  dateAdded: string; // ISO string
  notes?: string;
  status: 'waiting' | 'notified' | 'fulfilled';
}

export interface ReadingGoal {
  monthKey: string; // e.g. "2026-10"
  targetCount: number;
  monthName: string;
}

export interface PatronUser {
  id: string; // e.g. "STU-8821"
  name: string;
  role: 'Student' | 'Faculty' | 'Researcher' | 'Librarian';
  booksBorrowedTotal: number;
  activeLoansCount: number;
  firstActiveDate: string;
  lastActiveDate: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'LOAN_ISSUED' | 'BOOK_RETURNED' | 'WAITLIST_ADDED' | 'WAITLIST_REMOVED' | 'BOOK_ADDED' | 'BOOK_EDITED' | 'GOAL_UPDATED' | 'DB_RESTORED';
  details: string;
  entityId?: string | number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  call: string;
  isbn?: string;
  year?: number;
  pages?: number;
  description?: string;
  shelfLocation?: string;
  out: boolean;
  borrower?: string;
  borrowerId?: string;
  borrowedDate?: string;
  due?: string; // e.g. "Oct 12, 2026"
  dueDateIso?: string; // e.g. "2026-10-12"
  timesBorrowed: number;
  waitlist?: WaitlistEntry[];
}

export type ViewMode = 'shelf' | 'grid' | 'circulation' | 'analytics' | 'map' | 'database';

export type AvailabilityFilter = 'all' | 'avail' | 'out' | 'overdue' | 'due_soon';

export type SortOption = 'title' | 'author' | 'call' | 'popularity' | 'status';
