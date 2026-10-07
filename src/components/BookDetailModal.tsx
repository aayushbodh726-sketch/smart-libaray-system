import React from 'react';
import { Book } from '../types';
import { isOverdue, getDaysRemainingText } from '../utils/libraryUtils';
import { generateBarcodeBars } from '../utils/barcodeGenerator';
import { X, Calendar, User, MapPin, Hash, BookMarked, RefreshCw, CheckCheck, Printer, Edit2, AlertCircle, Barcode, Compass } from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onInitiateBorrow: (book: Book) => void;
  onReturnBook: (bookId: number) => void;
  onRenewLoan: (bookId: number) => void;
  onEditBook: (book: Book) => void;
  onLocateOnMap?: (location: string) => void;
  onOpenReceipt?: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onInitiateBorrow,
  onReturnBook,
  onRenewLoan,
  onEditBook,
  onLocateOnMap,
  onOpenReceipt,
}) => {
  if (!book) return null;

  const overdue = isOverdue(book);
  const remaining = getDaysRemainingText(book);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#151911]/75 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Library Index Card Container */}
      <div 
        className="relative z-10 w-full max-w-lg bg-[#FAF5E8] border border-[#23281F]/25 rounded shadow-2xl p-6 sm:p-8 overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(140, 74, 59, 0.25) 1px, transparent 1px),
            repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, rgba(35, 40, 31, 0.08) 27px, rgba(35, 40, 31, 0.08) 28px)
          `,
          backgroundPosition: '55px 0, 0 110px',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#23281F]/50 hover:text-[#23281F] rounded-full hover:bg-[#23281F]/10 transition-colors"
          title="Close card"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Library Call Number & Card Index Header */}
        <div className="flex items-center justify-between pr-8 mb-2">
          <div className="font-mono-code text-xs tracking-wider text-[#8C4A3B] font-bold">
            CALL NO. {book.call}
          </div>
          <button
            onClick={() => onEditBook(book)}
            className="inline-flex items-center gap-1 text-[11px] font-mono-code text-[#1F3A2E] hover:text-[#B8923F] transition-colors"
            title="Edit book details"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit record</span>
          </button>
        </div>

        {/* Book Title & Author */}
        <h2 className="font-serif-display font-bold text-2xl sm:text-3xl text-[#1F3A2E] leading-tight mb-1">
          {book.title}
        </h2>
        <div className="text-sm text-[#23281F]/70 mb-4 font-serif-display italic">
          by {book.author} {book.year ? `· Published ${book.year}` : ''}
        </div>

        {/* Main Details Grid */}
        <div className="bg-[#FAF5E8]/90 border border-[#23281F]/15 rounded p-3.5 mb-5 space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-[#23281F]/10">
            <span className="text-[#23281F]/70 font-mono-code">Subject Classification:</span>
            <span className="font-bold text-[#1F3A2E]">{book.genre}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-[#23281F]/10">
            <span className="text-[#23281F]/70 font-mono-code">Shelf Location:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono-code text-[#23281F] flex items-center gap-1 font-semibold">
                <MapPin className="w-3 h-3 text-[#8C4A3B]" />
                {book.shelfLocation || 'Main Stack'}
              </span>
              {onLocateOnMap && (
                <button
                  type="button"
                  onClick={() => onLocateOnMap(book.shelfLocation || 'Stack 1A')}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#B8923F]/20 hover:bg-[#B8923F]/30 text-[#754C24] font-mono-code text-[10px] font-bold transition-colors border border-[#B8923F]/40"
                  title="Locate exact aisle on Library Floor Map"
                >
                  <Compass className="w-2.5 h-2.5 text-[#754C24]" />
                  <span>View on Map</span>
                </button>
              )}
            </div>
          </div>

          {book.isbn && (
            <div className="flex justify-between items-center py-1 border-b border-[#23281F]/10">
              <span className="text-[#23281F]/70 font-mono-code">Standard ISBN:</span>
              <span className="font-mono-code text-[#23281F]">{book.isbn}</span>
            </div>
          )}

          {book.pages && (
            <div className="flex justify-between items-center py-1 border-b border-[#23281F]/10">
              <span className="text-[#23281F]/70 font-mono-code">Volume Extent:</span>
              <span className="font-mono-code text-[#23281F]">{book.pages} pages</span>
            </div>
          )}

          <div className="flex justify-between items-center py-1">
            <span className="text-[#23281F]/70 font-mono-code">Circulation Frequency:</span>
            <span className="font-mono-code text-[#754C24] font-semibold">{book.timesBorrowed} historical checkouts</span>
          </div>
        </div>

        {/* Synopsis / Description */}
        {book.description && (
          <div className="mb-5">
            <div className="text-[11px] font-mono-code text-[#23281F]/50 uppercase tracking-widest mb-1">
              Archival Abstract
            </div>
            <p className="text-xs text-[#23281F]/80 leading-relaxed bg-white/40 p-2.5 rounded border border-[#23281F]/10 italic font-serif">
              "{book.description}"
            </p>
          </div>
        )}

        {/* Circulation Status Card Pocket / Rubber Stamp */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-white/60 rounded border border-[#23281F]/15">
          <div>
            <div className="text-[11px] font-mono-code text-[#23281F]/60">STATUS</div>
            <div className="font-bold text-sm mt-0.5">
              {book.out ? (
                <span className="text-[#8C4A3B] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#8C4A3B]" />
                  CHECKED OUT ({remaining.text})
                </span>
              ) : (
                <span className="text-[#4C7A5D] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#4C7A5D]" />
                  AVAILABLE FOR BORROWING
                </span>
              )}
            </div>
            {book.out && book.borrower && (
              <div className="text-xs text-[#23281F]/70 mt-1">
                Holder: <span className="font-semibold text-[#1F3A2E]">{book.borrower}</span>
              </div>
            )}
          </div>

          {/* Authentic Ink Stamp */}
          {book.out && (
            <div className="relative">
              <div
                className={`border-2 font-mono-code text-xs px-3 py-1 font-bold tracking-wider uppercase rounded-xs rotate-[-3deg] shadow-xs ${
                  overdue
                    ? 'border-[#8C4A3B] text-[#8C4A3B] bg-[#8C4A3B]/10 animate-pulse'
                    : 'border-[#754C24] text-[#754C24] bg-[#754C24]/10'
                }`}
              >
                {overdue ? '★ OVERDUE NOTICE ★' : `LOAN DUE: ${book.due}`}
              </div>
            </div>
          )}
        </div>

        {/* Scannable ISBN Barcode Strip */}
        <div className="mb-5 bg-white p-2.5 rounded border border-[#23281F]/15 flex flex-col items-center shadow-xs">
          <div className="w-full flex items-center justify-between text-[10px] font-mono-code text-[#23281F]/50 px-1 mb-1">
            <span className="flex items-center gap-1">
              <Barcode className="w-3 h-3 text-[#B8923F]" />
              <span>OFFICIAL STACKLINE ARCHIVAL BARCODE</span>
            </span>
            <span>SCANNABLE</span>
          </div>
          <svg className="w-64 sm:w-72 h-11" viewBox="0 0 260 42">
            {generateBarcodeBars(book.isbn || `978000000000${book.id}`, 260).map((b, i) => (
              <rect
                key={i}
                x={b.x}
                y={2}
                width={b.width}
                height={38}
                fill="#152922"
              />
            ))}
          </svg>
          <div className="font-mono-code text-[11px] text-[#23281F]/80 tracking-widest mt-0.5">
            ISBN {book.isbn || 'N/A'} · CALL {book.call}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {book.out ? (
            <>
              <button
                onClick={() => onReturnBook(book.id)}
                className="flex-1 py-2.5 px-4 bg-[#8C4A3B] hover:bg-[#723a2d] text-white font-semibold text-xs tracking-wide uppercase rounded shadow transition-all flex items-center justify-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Check In / Mark Returned</span>
              </button>

              <button
                onClick={() => onRenewLoan(book.id)}
                className="py-2.5 px-3 bg-[#E4D9BE] hover:bg-[#d8cbb0] text-[#1F3A2E] font-semibold text-xs tracking-wide uppercase rounded border border-[#23281F]/20 transition-all flex items-center justify-center gap-1.5"
                title="Extend due date by 14 days"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Renew (+14d)</span>
              </button>

              {onOpenReceipt && (
                <button
                  onClick={() => onOpenReceipt(book)}
                  className="py-2.5 px-3 bg-[#FAF5E8] hover:bg-[#EFE7D3] text-[#1F3A2E] font-semibold text-xs tracking-wide uppercase rounded border border-[#23281F]/25 transition-all flex items-center justify-center gap-1.5"
                  title="View and print official circulation due receipt"
                >
                  <Printer className="w-3.5 h-3.5 text-[#B8923F]" />
                  <span>Due Slip</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => onInitiateBorrow(book)}
              className="w-full py-2.5 px-4 bg-[#1F3A2E] hover:bg-[#152922] text-[#FAF5E8] font-semibold text-xs tracking-wide uppercase rounded shadow transition-all flex items-center justify-center gap-2"
            >
              <BookMarked className="w-4 h-4 text-[#B8923F]" />
              <span>Borrow This Book (Open Loan)</span>
            </button>
          )}
        </div>

        {/* Vintage card punch hole at bottom center */}
        <div className="w-4 h-4 rounded-full bg-[#151911]/80 mx-auto mt-6 shadow-inner" />
      </div>
    </div>
  );
};
