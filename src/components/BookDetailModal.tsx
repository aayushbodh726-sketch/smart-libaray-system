import React, { useState } from 'react';
import { Book, WaitlistEntry } from '../types';
import { isOverdue, isDueSoon, getDaysRemainingText } from '../utils/libraryUtils';
import { generateBarcodeBars } from '../utils/barcodeGenerator';
import { BookCover3D } from './BookCover3D';
import {
  X, Calendar, User, MapPin, Hash, BookMarked, RefreshCw, CheckCheck,
  Printer, Edit2, AlertCircle, Barcode, Compass, Users, UserPlus, Clock,
  Trash2, Mail, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onInitiateBorrow: (book: Book) => void;
  onReturnBook: (bookId: number) => void;
  onRenewLoan: (bookId: number) => void;
  onEditBook: (book: Book) => void;
  onLocateOnMap?: (location: string) => void;
  onOpenReceipt?: (book: Book) => void;
  onAddWaitlist?: (bookId: number, patronName: string, patronId: string, email?: string, notes?: string) => void;
  onRemoveWaitlist?: (bookId: number, waitlistId: string) => void;
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
  onAddWaitlist,
  onRemoveWaitlist,
}) => {
  if (!book) return null;

  const overdue = isOverdue(book);
  const dueSoon = isDueSoon(book, 3);
  const remaining = getDaysRemainingText(book);

  // Waitlist form state
  const [isAddingWaitlist, setIsAddingWaitlist] = useState(false);
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistId, setWaitlistId] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistNotes, setWaitlistNotes] = useState('');

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistName.trim() || !waitlistId.trim()) return;

    onAddWaitlist?.(
      book.id,
      waitlistName.trim(),
      waitlistId.trim(),
      waitlistEmail.trim() || undefined,
      waitlistNotes.trim() || undefined
    );

    setWaitlistName('');
    setWaitlistId('');
    setWaitlistEmail('');
    setWaitlistNotes('');
    setIsAddingWaitlist(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#151911]/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#FBF6E9] border-2 border-[#23281F]/20 rounded-xl shadow-2xl p-6 sm:p-7 text-[#23281F]">
        {/* Top Close & Edit Buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <button
            onClick={() => onEditBook(book)}
            className="p-1.5 text-[#23281F]/60 hover:text-[#1F3A2E] rounded hover:bg-[#EFE7D3] transition-colors"
            title="Edit volume record"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-[#23281F]/60 hover:text-[#1F3A2E] rounded hover:bg-[#EFE7D3] transition-colors"
            title="Close card"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vintage Index Card Header & 3D Hardcover Volume Display */}
        <div className="border-b-2 border-[#23281F]/20 pb-5 mb-4 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          <div className="shrink-0">
            <BookCover3D book={book} size="md" interactive={true} />
          </div>

          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono-code font-bold text-xs text-[#8C4A3B] px-2 py-0.5 bg-[#8C4A3B]/10 rounded border border-[#8C4A3B]/20">
                {book.call}
              </span>
              {book.year && (
                <span className="text-xs font-mono-code text-[#23281F]/60">
                  Pub. {book.year}
                </span>
              )}
              {dueSoon && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono-code font-bold text-[#8C4A3B] bg-[#E8C872]/30 px-2 py-0.5 rounded border border-[#B8923F]">
                  <Clock className="w-3 h-3 text-[#B8923F]" />
                  <span>DUE SOON (Within 3 Days)</span>
                </span>
              )}
            </div>

            <h2 className="font-serif-display font-bold text-2xl text-[#1F3A2E] leading-tight">
              {book.title}
            </h2>
            <p className="font-serif italic text-sm text-[#23281F]/80 mt-1">
              by {book.author}
            </p>
            {book.genre && (
              <p className="text-xs font-mono-code text-[#754C24] mt-2">
                Classification: <span className="font-bold text-[#1F3A2E]">{book.genre}</span>
              </p>
            )}
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="bg-[#FAF5E8]/90 border border-[#23281F]/15 rounded p-3.5 mb-4 space-y-2 text-xs">
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
          <div className="mb-4">
            <div className="text-[11px] font-mono-code text-[#23281F]/50 uppercase tracking-widest mb-1">
              Archival Abstract
            </div>
            <p className="text-xs text-[#23281F]/80 leading-relaxed bg-white/40 p-2.5 rounded border border-[#23281F]/10 italic font-serif">
              "{book.description}"
            </p>
          </div>
        )}

        {/* Circulation Status Card */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-white/60 rounded border border-[#23281F]/15">
          <div>
            <div className="text-[11px] font-mono-code text-[#23281F]/60">STATUS</div>
            <div className="font-bold text-sm mt-0.5">
              {book.out ? (
                <span className="text-[#8C4A3B] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8C4A3B]" />
                  CHECKED OUT ({remaining.text})
                </span>
              ) : (
                <span className="text-[#4C7A5D] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4C7A5D]" />
                  AVAILABLE FOR BORROWING
                </span>
              )}
            </div>
            {book.out && book.borrower && (
              <div className="text-xs text-[#23281F]/70 mt-1">
                Holder: <span className="font-semibold text-[#1F3A2E]">{book.borrower}</span>
                {book.borrowerId && (
                  <span className="font-mono-code text-[11px] ml-1 text-[#23281F]/50">
                    ({book.borrowerId})
                  </span>
                )}
              </div>
            )}
          </div>

          {book.out && (
            <div className="text-right">
              <div className="text-[10px] font-mono-code text-[#23281F]/50">RETURN DUE</div>
              <div className={`font-serif-display font-bold text-base ${overdue ? 'text-[#8C4A3B]' : dueSoon ? 'text-[#B8923F]' : 'text-[#1F3A2E]'}`}>
                {book.due || 'In 14 days'}
              </div>
            </div>
          )}
        </div>

        {/* WAITLIST QUEUE SECTION (when checked out) */}
        {book.out && (
          <div className="mb-4 p-3.5 bg-[#FAF4E6] border border-[#B8923F]/40 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold text-[#1F3A2E]">
                <Users className="w-4 h-4 text-[#B8923F]" />
                <span>PATRON WAITLIST QUEUE</span>
                <span className="px-1.5 py-0.2 bg-[#B8923F]/20 text-[#8C4A3B] rounded-full text-[10px]">
                  {book.waitlist?.length || 0} waiting
                </span>
              </div>

              {!isAddingWaitlist && (
                <button
                  type="button"
                  onClick={() => setIsAddingWaitlist(true)}
                  className="px-2 py-1 bg-[#1F3A2E] hover:bg-[#152922] text-[#FAF5E8] text-[11px] font-mono-code font-bold rounded flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3 h-3 text-[#B8923F]" />
                  <span>Join Waitlist</span>
                </button>
              )}
            </div>

            {/* Waitlist inline registration form */}
            {isAddingWaitlist && (
              <form onSubmit={handleWaitlistSubmit} className="mb-3 p-3 bg-white rounded border border-[#B8923F]/40 space-y-2 text-xs font-mono-code">
                <div className="font-bold text-[#1F3A2E] text-[11px] flex justify-between items-center">
                  <span>Queue Patron for "{book.title}"</span>
                  <button type="button" onClick={() => setIsAddingWaitlist(false)} className="text-gray-400 hover:text-black">✕</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#23281F]/70 block mb-0.5">Patron Name *</label>
                    <input
                      type="text"
                      required
                      value={waitlistName}
                      onChange={e => setWaitlistName(e.target.value)}
                      placeholder="e.g. Julian Chen"
                      className="w-full p-1.5 bg-[#FAF5E8] border border-[#23281F]/20 rounded text-xs focus:outline-none focus:border-[#B8923F]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#23281F]/70 block mb-0.5">Patron ID / Card *</label>
                    <input
                      type="text"
                      required
                      value={waitlistId}
                      onChange={e => setWaitlistId(e.target.value)}
                      placeholder="e.g. STU-9920"
                      className="w-full p-1.5 bg-[#FAF5E8] border border-[#23281F]/20 rounded text-xs focus:outline-none focus:border-[#B8923F]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-[#23281F]/70 block mb-0.5">Notification Email (Optional)</label>
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={e => setWaitlistEmail(e.target.value)}
                    placeholder="patron@campus.edu"
                    className="w-full p-1.5 bg-[#FAF5E8] border border-[#23281F]/20 rounded text-xs focus:outline-none focus:border-[#B8923F]"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-[#1F3A2E] hover:bg-[#152922] text-[#FAF5E8] text-xs font-bold rounded flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B8923F]" />
                    <span>Confirm Waitlist Queue Position</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingWaitlist(false)}
                    className="px-3 py-1.5 border border-[#23281F]/20 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Current queue list */}
            {book.waitlist && book.waitlist.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {book.waitlist.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="p-2 bg-white rounded border border-[#23281F]/10 flex items-center justify-between text-xs font-mono-code"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#1F3A2E] text-[#B8923F] font-bold text-[10px] flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-[#1F3A2E]">{entry.patronName}</div>
                        <div className="text-[10px] text-[#23281F]/60">
                          {entry.patronId} {entry.patronEmail ? `· ${entry.patronEmail}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                        Waiting
                      </span>
                      {onRemoveWaitlist && (
                        <button
                          type="button"
                          onClick={() => onRemoveWaitlist(book.id, entry.id)}
                          className="p-1 text-red-500 hover:text-red-800 rounded"
                          title="Remove from waitlist"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono-code text-[#23281F]/60 italic">
                No patrons currently in queue for this volume. Next available check-out will be open to all scholars.
              </p>
            )}
          </div>
        )}

        {/* ISBN Barcode graphic */}
        <div className="flex flex-col items-center justify-center p-3 bg-white/70 border border-[#23281F]/15 rounded mb-5">
          <svg className="w-56 h-10" viewBox="0 0 260 42">
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
      </div>
    </div>
  );
};
