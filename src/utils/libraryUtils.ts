import { Book } from '../types';

export function isOverdue(book: Book): boolean {
  if (!book.out) return false;
  if (!book.dueDateIso) return false;
  
  const due = new Date(book.dueDateIso);
  const now = new Date();
  // Strip hours for fair date comparison
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return now.getTime() > due.getTime();
}

/**
 * Checks if a borrowed book is due within the specified threshold (default: next 3 days)
 */
export function isDueSoon(book: Book, daysThreshold = 3): boolean {
  if (!book.out || !book.dueDateIso) return false;
  if (isOverdue(book)) return false; // Overdue has its own higher-priority category

  const due = new Date(book.dueDateIso);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Between 0 (due today) and daysThreshold (e.g. 3 days)
  return diffDays >= 0 && diffDays <= daysThreshold;
}

export function getDaysRemainingText(book: Book): { text: string; isLate: boolean; days: number } {
  if (!book.out || !book.dueDateIso) {
    return { text: 'Available', isLate: false, days: 0 };
  }

  const due = new Date(book.dueDateIso);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`, isLate: true, days: diffDays };
  } else if (diffDays === 0) {
    return { text: 'Due today', isLate: false, days: 0 };
  } else {
    return { text: `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`, isLate: false, days: diffDays };
  }
}

export function generateCallNumber(genre: string, author: string, title: string): string {
  const genrePrefixes: Record<string, string> = {
    "Computer Science": "QA76",
    "Fiction": "PR60",
    "Physics": "QC23",
    "History": "CB113",
    "Mathematics": "QA184",
    "Psychology": "BF441",
    "Biology": "QH375",
    "Economics": "HB74",
    "Philosophy": "B580",
    "Literature": "PN45",
    "Astronomy": "QB981",
    "Art & Architecture": "NA2500"
  };

  const prefix = genrePrefixes[genre] || "Z674";
  const authorInit = author ? author.trim()[0].toUpperCase() : 'X';
  const numSuffix = Math.floor(100 + Math.random() * 899);
  const titleLetter = title ? title.trim()[0].toUpperCase() : 'A';

  return `${prefix}.${numSuffix} .${authorInit}${titleLetter}`;
}

export function exportCatalogToCsv(books: Book[]): void {
  const headers = ["ID", "Title", "Author", "Genre", "Call Number", "ISBN", "Year", "Location", "Status", "Borrower", "Due Date", "Times Borrowed"];
  const rows = books.map(b => [
    b.id,
    `"${(b.title || '').replace(/"/g, '""')}"`,
    `"${(b.author || '').replace(/"/g, '""')}"`,
    `"${(b.genre || '').replace(/"/g, '""')}"`,
    `"${(b.call || '').replace(/"/g, '""')}"`,
    `"${(b.isbn || '').replace(/"/g, '""')}"`,
    b.year || '',
    `"${(b.shelfLocation || '').replace(/"/g, '""')}"`,
    b.out ? 'Checked Out' : 'Available',
    `"${(b.borrower || '').replace(/"/g, '""')}"`,
    b.due || '',
    b.timesBorrowed
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `stackline_catalog_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
