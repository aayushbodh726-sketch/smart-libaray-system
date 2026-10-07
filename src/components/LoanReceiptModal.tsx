import React from 'react';
import { Book } from '../types';
import { generateBarcodeBars } from '../utils/barcodeGenerator';
import { X, Printer, CheckCircle2, Bookmark, Calendar, User, MapPin } from 'lucide-react';

interface LoanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  patronName?: string;
  patronId?: string;
  loanDurationDays?: number;
}

export const LoanReceiptModal: React.FC<LoanReceiptModalProps> = ({
  isOpen,
  onClose,
  book,
  patronName,
  patronId,
  loanDurationDays,
}) => {
  if (!isOpen || !book) return null;

  const receiptId = `REC-${book.id}-${Math.floor(1000 + Math.random() * 9000)}`;
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#151911]/80 backdrop-blur-xs animate-in fade-in duration-200 print:p-0 print:bg-white">
      {/* Click outside to close (hidden during print) */}
      <div className="fixed inset-0 print:hidden" onClick={onClose} />

      {/* Thermal / Paper Library Receipt Card */}
      <div className="relative z-10 w-full max-w-sm bg-[#FAF5E8] border border-[#23281F]/20 rounded-xl shadow-2xl p-6 sm:p-7 text-[#23281F] font-mono-code overflow-hidden print:border-none print:shadow-none print:max-w-full">
        {/* Close Button (hidden during print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-[#23281F]/40 hover:text-[#23281F] rounded-full print:hidden"
          title="Close receipt"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Receipt Header */}
        <div className="text-center pb-4 border-b-2 border-dashed border-[#23281F]/20">
          <div className="w-10 h-10 rounded-full bg-[#1F3A2E] text-[#B8923F] flex items-center justify-center mx-auto mb-2">
            <Bookmark className="w-5 h-5" />
          </div>
          <h3 className="font-serif-display font-bold text-lg text-[#1F3A2E] leading-tight">
            STACKLINE CAMPUS LIBRARY
          </h3>
          <p className="text-[10px] text-[#23281F]/60 mt-0.5">
            St. Jude Archival Stacks · Circulation Desk
          </p>
          <div className="text-[9px] text-[#23281F]/40 mt-1">
            TXN: {receiptId} · ISSUED: {currentDate}
          </div>
        </div>

        {/* Success confirmation badge */}
        <div className="my-3 py-1.5 px-3 bg-[#4C7A5D]/15 text-[#4C7A5D] rounded text-center text-[11px] font-bold flex items-center justify-center gap-1.5 print:hidden">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>OFFICIAL LOAN TRANSACTION COMPLETE</span>
        </div>

        {/* Book Details */}
        <div className="py-3 border-b-2 border-dashed border-[#23281F]/20 space-y-2 text-xs">
          <div>
            <span className="text-[10px] text-[#23281F]/50 block">TITLE</span>
            <span className="font-serif-display font-bold text-sm text-[#1F3A2E] block leading-snug">
              {book.title}
            </span>
            <span className="text-[11px] text-[#23281F]/70">by {book.author}</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#23281F]/60">Call Number:</span>
            <span className="font-bold text-[#8C4A3B]">{book.call}</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#23281F]/60">Shelf Stack:</span>
            <span>{book.shelfLocation || 'Stack 1A'}</span>
          </div>

          {book.isbn && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#23281F]/60">ISBN:</span>
              <span>{book.isbn}</span>
            </div>
          )}
        </div>

        {/* Patron Info */}
        <div className="py-3 border-b-2 border-dashed border-[#23281F]/20 space-y-1 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[#23281F]/60">Patron Name:</span>
            <span className="font-bold text-[#1F3A2E]">
              {patronName || book.borrower || 'Campus Scholar'}
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-[#23281F]/60">Patron ID:</span>
            <span>{patronId || book.borrowerId || 'STU-GENERAL'}</span>
          </div>
          {loanDurationDays && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#23281F]/60">Loan Period:</span>
              <span>{loanDurationDays} Days Standard</span>
            </div>
          )}
        </div>

        {/* Prominent Due Date Box */}
        <div className="my-4 p-3 bg-white border-2 border-[#8C4A3B] rounded text-center">
          <div className="text-[10px] tracking-widest text-[#8C4A3B] uppercase font-bold">
            DATE DUE FOR RETURN
          </div>
          <div className="font-serif-display font-bold text-xl text-[#8C4A3B] mt-0.5">
            {book.due || 'In 14 Days'}
          </div>
          <div className="text-[9px] text-[#23281F]/60 mt-1">
            Return to Circulation Chutes on or before 11:59 PM
          </div>
        </div>

        {/* Barcode Graphic */}
        <div className="flex flex-col items-center pb-2">
          <svg className="w-48 h-10" viewBox="0 0 260 40">
            {generateBarcodeBars(book.isbn || `978000000000${book.id}`, 260).map((b, i) => (
              <rect
                key={i}
                x={b.x}
                y={2}
                width={b.width}
                height={36}
                fill="#1F3A2E"
              />
            ))}
          </svg>
          <span className="text-[9px] tracking-widest text-[#23281F]/60 mt-1">
            *{receiptId}*
          </span>
        </div>

        {/* Library Notice */}
        <p className="text-[9px] text-center text-[#23281F]/50 leading-tight border-t border-[#23281F]/10 pt-3">
          Overdue materials accrue a late assessment of $0.25 per day. Thank you for using the St. Jude Campus Library.
        </p>

        {/* Actions (hidden when printing) */}
        <div className="mt-5 flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2 px-3 bg-[#1F3A2E] hover:bg-[#152922] text-[#FAF5E8] text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#B8923F]" />
            <span>Print Due Slip</span>
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-transparent border border-[#23281F]/20 hover:bg-[#23281F]/5 text-[#23281F] text-xs font-semibold rounded transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanReceiptModal;
