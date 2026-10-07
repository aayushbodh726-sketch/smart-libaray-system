import React, { useState, useEffect, useMemo } from 'react';
import { Book, ViewMode, AvailabilityFilter, SortOption } from './types';
import { INITIAL_BOOKS } from './data/initialBooks';
import { isOverdue, exportCatalogToCsv } from './utils/libraryUtils';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { BookshelfView } from './components/BookshelfView';
import { CatalogGridView } from './components/CatalogGridView';
import { LoansTable } from './components/LoansTable';
import { AnalyticsView } from './components/AnalyticsView';
import { BookDetailModal } from './components/BookDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AddBookModal } from './components/AddBookModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { LibraryMap } from './components/LibraryMap';
import { LoanReceiptModal } from './components/LoanReceiptModal';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const STORAGE_KEY = 'stackline_library_books_v2';

export default function App() {
  // Books State with LocalStorage Persistence
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse localStorage books', e);
    }
    return INITIAL_BOOKS;
  });

  // Save to localStorage whenever books changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [books]);

  // UI Navigation & Filters
  const [viewMode, setViewMode] = useState<ViewMode>('shelf');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('title');

  // Modals state
  const [inspectingBook, setInspectingBook] = useState<Book | null>(null);
  const [borrowingBook, setBorrowingBook] = useState<Book | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [targetBookLocation, setTargetBookLocation] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<{
    book: Book;
    patronName: string;
    patronId: string;
    days: number;
  } | null>(null);

  const handleLocateOnMap = (shelfLocation: string) => {
    setTargetBookLocation(shelfLocation);
    setViewMode('map');
    setInspectingBook(null);
  };

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Keyboard shortcut listener for '/' to focus search, 'b' to open scanner & 'Escape' to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('library-search-input') as HTMLInputElement | null;
        if (searchInput) searchInput.focus();
      }
      if ((e.key === 'b' || e.key === 'B') && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsScannerOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setInspectingBook(null);
        setBorrowingBook(null);
        setIsAddModalOpen(false);
        setIsScannerOpen(false);
        setEditingBook(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Genres list derived from all books
  const genres = useMemo(() => {
    return Array.from(new Set(books.map((b) => b.genre))).sort();
  }, [books]);

  // Overdue count
  const overdueCount = useMemo(() => {
    return books.filter(isOverdue).length;
  }, [books]);

  // Filtered & Sorted books
  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const result = books.filter((book) => {
      // Search matching
      const matchesSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.genre.toLowerCase().includes(q) ||
        book.call.toLowerCase().includes(q) ||
        (book.isbn && book.isbn.toLowerCase().includes(q)) ||
        (book.borrower && book.borrower.toLowerCase().includes(q));

      // Genre matching
      const matchesGenre = !selectedGenre || book.genre === selectedGenre;

      // Availability matching
      let matchesAvail = true;
      if (availabilityFilter === 'avail') {
        matchesAvail = !book.out;
      } else if (availabilityFilter === 'out') {
        matchesAvail = book.out;
      } else if (availabilityFilter === 'overdue') {
        matchesAvail = isOverdue(book);
      }

      return matchesSearch && matchesGenre && matchesAvail;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortOption === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortOption === 'author') {
        return a.author.localeCompare(b.author);
      } else if (sortOption === 'call') {
        return a.call.localeCompare(b.call);
      } else if (sortOption === 'popularity') {
        return b.timesBorrowed - a.timesBorrowed;
      } else if (sortOption === 'status') {
        return (a.out === b.out ? 0 : a.out ? 1 : -1);
      }
      return 0;
    });
  }, [books, searchQuery, selectedGenre, availabilityFilter, sortOption]);

  // Book loan operations
  const handleInitiateBorrow = (book: Book) => {
    setBorrowingBook(book);
  };

  const handleConfirmBorrow = (bookId: number, patronName: string, patronId: string, days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const dueDateDisplay = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const dueDateIso = d.toISOString().split('T')[0];
    const borrowDateIso = new Date().toISOString().split('T')[0];

    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            out: true,
            borrower: patronName,
            borrowerId: patronId,
            borrowedDate: borrowDateIso,
            due: dueDateDisplay,
            dueDateIso: dueDateIso,
            timesBorrowed: (b.timesBorrowed || 0) + 1,
          };
        }
        return b;
      })
    );

    // Refresh inspecting book if open
    setInspectingBook((prev) =>
      prev && prev.id === bookId
        ? {
            ...prev,
            out: true,
            borrower: patronName,
            borrowerId: patronId,
            due: dueDateDisplay,
            dueDateIso: dueDateIso,
            timesBorrowed: (prev.timesBorrowed || 0) + 1,
          }
        : prev
    );

    const targetBook = books.find((x) => x.id === bookId);
    setBorrowingBook(null);
    if (targetBook) {
      setReceiptData({
        book: {
          ...targetBook,
          out: true,
          borrower: patronName,
          borrowerId: patronId,
          due: dueDateDisplay,
          dueDateIso: dueDateIso,
        },
        patronName,
        patronId,
        days,
      });
    }
    showToast(`Issued loan for "${targetBook?.title || 'Book'}" to ${patronName}.`, 'success');
  };

  const handleReturnBook = (bookId: number) => {
    const targetBook = books.find((x) => x.id === bookId);
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const { borrower, borrowerId, due, dueDateIso, borrowedDate, ...rest } = b;
          return {
            ...rest,
            out: false,
          };
        }
        return b;
      })
    );

    setInspectingBook((prev) =>
      prev && prev.id === bookId
        ? {
            ...prev,
            out: false,
            borrower: undefined,
            borrowerId: undefined,
            due: undefined,
            dueDateIso: undefined,
          }
        : prev
    );

    showToast(`Checked in "${targetBook?.title}". Returned to shelf.`, 'success');
  };

  const handleRenewLoan = (bookId: number) => {
    const targetBook = books.find((x) => x.id === bookId);
    if (!targetBook || !targetBook.out) return;

    const baseDate = targetBook.dueDateIso ? new Date(targetBook.dueDateIso) : new Date();
    baseDate.setDate(baseDate.getDate() + 14);
    const newDueDateDisplay = baseDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const newDueDateIso = baseDate.toISOString().split('T')[0];

    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            due: newDueDateDisplay,
            dueDateIso: newDueDateIso,
          };
        }
        return b;
      })
    );

    setInspectingBook((prev) =>
      prev && prev.id === bookId
        ? {
            ...prev,
            due: newDueDateDisplay,
            dueDateIso: newDueDateIso,
          }
        : prev
    );

    showToast(`Renewed loan for "${targetBook.title}". New due date: ${newDueDateDisplay}.`, 'info');
  };

  const handleQuickToggle = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    if (book.out) {
      handleReturnBook(book.id);
    } else {
      handleInitiateBorrow(book);
    }
  };

  // Add / Edit Book
  const handleSaveBook = (bookData: Partial<Book>) => {
    if (editingBook) {
      setBooks((prev) =>
        prev.map((b) => (b.id === editingBook.id ? ({ ...b, ...bookData } as Book) : b))
      );
      setEditingBook(null);
      showToast(`Updated record for "${bookData.title}".`, 'info');
    } else {
      const newId = books.length ? Math.max(...books.map((b) => b.id)) + 1 : 1;
      const newBook: Book = {
        id: newId,
        title: bookData.title || 'Untitled Book',
        author: bookData.author || 'Unknown Author',
        genre: bookData.genre || 'General',
        call: bookData.call || 'Z100 .A1',
        shelfLocation: bookData.shelfLocation || 'Stack 1A · Shelf 1',
        year: bookData.year,
        pages: bookData.pages,
        isbn: bookData.isbn,
        description: bookData.description,
        out: false,
        timesBorrowed: 0,
      };
      setBooks((prev) => [newBook, ...prev]);
      showToast(`Successfully cataloged "${newBook.title}".`, 'success');
    }
  };

  // Reset to default dataset
  const handleResetCatalog = () => {
    if (window.confirm('Reset catalog back to initial campus books and circulation state?')) {
      setBooks(INITIAL_BOOKS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKS));
      showToast('Catalog restored to default campus records.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#EFE7D3] text-[#23281F] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl font-mono-code text-xs border ${
              toastMessage.type === 'success'
                ? 'bg-[#1F3A2E] text-[#FAF5E8] border-[#4C7A5D]'
                : toastMessage.type === 'warn'
                ? 'bg-[#8C4A3B] text-white border-[#8C4A3B]'
                : 'bg-[#152922] text-[#FAF5E8] border-[#B8923F]'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#B8923F]" />
            ) : toastMessage.type === 'warn' ? (
              <AlertCircle className="w-4 h-4 text-white" />
            ) : (
              <Info className="w-4 h-4 text-[#B8923F]" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
        availabilityFilter={availabilityFilter}
        setAvailabilityFilter={setAvailabilityFilter}
        sortOption={sortOption}
        setSortOption={setSortOption}
        genres={genres}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenAddModal={() => {
          setEditingBook(null);
          setIsAddModalOpen(true);
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        onExportCsv={() => {
          exportCatalogToCsv(books);
          showToast('Catalog exported to CSV file.', 'info');
        }}
        onResetCatalog={handleResetCatalog}
        overdueCount={overdueCount}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-4 flex-1">
        {/* Circulation Metrics Bar */}
        <StatsBar
          books={books}
          onSelectFilter={(filter) => setAvailabilityFilter(filter)}
        />

        {/* View Switcher Container */}
        {viewMode === 'shelf' && (
          <BookshelfView
            books={filteredBooks}
            onSelectBook={(book) => setInspectingBook(book)}
            filteredCount={filteredBooks.length}
          />
        )}

        {viewMode === 'grid' && (
          <div>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#23281F]/15">
              <span className="font-mono-code text-xs uppercase text-[#1F3A2E] font-semibold">
                Catalog Cards ({filteredBooks.length} titles matching)
              </span>
            </div>
            {filteredBooks.length === 0 ? (
              <div className="bg-[#FBF6E9] border-2 border-dashed border-[#23281F]/20 rounded-xl p-12 text-center my-6">
                <p className="font-serif-display text-xl text-[#1F3A2E] font-semibold mb-2">No catalog records found</p>
                <p className="text-sm text-[#23281F]/60 font-mono-code">Try clearing your search query or reset filters.</p>
              </div>
            ) : (
              <CatalogGridView
                books={filteredBooks}
                onSelectBook={(book) => setInspectingBook(book)}
                onQuickToggle={handleQuickToggle}
              />
            )}
          </div>
        )}

        {viewMode === 'circulation' && (
          <LoansTable
            books={books}
            onSelectBook={(book) => setInspectingBook(book)}
            onRenewLoan={handleRenewLoan}
            onReturnBook={handleReturnBook}
          />
        )}

        {viewMode === 'analytics' && <AnalyticsView books={books} />}

        {viewMode === 'map' && (
          <LibraryMap
            books={books}
            onSelectBook={(book) => setInspectingBook(book)}
            targetBookLocation={targetBookLocation}
            onClearTargetBook={() => setTargetBookLocation(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#23281F]/15 bg-[#E4D9BE]/50 py-8 px-4 text-center">
        <div className="max-w-6xl mx-auto space-y-2">
          <div className="font-serif-display font-semibold text-sm text-[#1F3A2E]">
            Stackline Campus Library System · St. Jude Archival Stacks
          </div>
          <p className="font-mono-code text-[11px] text-[#23281F]/60 max-w-xl mx-auto">
            Interactive circulation desk, multi-tier visual bookshelf, and Dewey / LC call number cataloging.
            Data persists in browser local storage.
          </p>
          <div className="font-mono-code text-[10px] text-[#23281F]/40 pt-2">
            Catalog inventory: {books.length} titles · Active loans: {books.filter((b) => b.out).length}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BookDetailModal
        book={inspectingBook}
        onClose={() => setInspectingBook(null)}
        onInitiateBorrow={handleInitiateBorrow}
        onReturnBook={handleReturnBook}
        onRenewLoan={handleRenewLoan}
        onEditBook={(book) => {
          setInspectingBook(null);
          setEditingBook(book);
          setIsAddModalOpen(true);
        }}
        onLocateOnMap={handleLocateOnMap}
        onOpenReceipt={(book) =>
          setReceiptData({
            book,
            patronName: book.borrower || '',
            patronId: book.borrowerId || '',
            days: 14,
          })
        }
      />

      <CheckoutModal
        book={borrowingBook}
        onClose={() => setBorrowingBook(null)}
        onConfirmBorrow={handleConfirmBorrow}
      />

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBook(null);
        }}
        onSaveBook={handleSaveBook}
        editingBook={editingBook}
        genres={genres}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        books={books}
        onOpenBookDetail={(book) => {
          setIsScannerOpen(false);
          setInspectingBook(book);
        }}
        onInitiateBorrow={(book) => {
          setIsScannerOpen(false);
          setBorrowingBook(book);
        }}
        onReturnBook={(bookId) => {
          handleReturnBook(bookId);
        }}
      />

      <LoanReceiptModal
        isOpen={Boolean(receiptData)}
        onClose={() => setReceiptData(null)}
        book={receiptData?.book || null}
        patronName={receiptData?.patronName}
        patronId={receiptData?.patronId}
        loanDurationDays={receiptData?.days}
      />
    </div>
  );
}
