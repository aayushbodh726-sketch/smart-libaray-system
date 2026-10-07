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
  due?: string; // e.g. "Oct 20, 2026" or ISO
  dueDateIso?: string;
  timesBorrowed: number;
}

export type ViewMode = 'shelf' | 'grid' | 'circulation' | 'analytics' | 'map';

export type AvailabilityFilter = 'all' | 'avail' | 'out' | 'overdue';

export type SortOption = 'title' | 'author' | 'call' | 'popularity' | 'status';
