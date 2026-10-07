import React from 'react';
import { Book } from '../types';
import { isOverdue, getDaysRemainingText } from '../utils/libraryUtils';
import { Clock, RefreshCw, CheckCheck, AlertTriangle, UserCheck, Printer } from 'lucide-react';

interface LoansTableProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onRenewLoan: (bookId: number) => void;
  onReturnBook: (bookId: number) => void;
  onPrintReceipt?: (book: Book) => void;
}

export const LoansTable: React.FC<LoansTableProps> = ({
  books,
  onSelectBook,
  onRenewLoan,
  onReturnBook,
  onPrintReceipt,
}) => {
  const activeLoans = books.filter((b) => b.out);
  const overdueLoans = activeLoans.filter(isOverdue);

  return (
    <div className="bg-[#FBF6E9] border border-[#23281F]/15 rounded-xl shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-[#23281F]/15 flex flex-wrap items-center justify-between gap-3 bg-[#E4D9BE]/30">
        <div>
          <h2 className="font-serif-display font-bold text-xl text-[#1F3A2E]">
            Circulation & Loan Ledger
          </h2>
          <p className="text-xs text-[#23281F]/65 mt-0.5">
            Active campus loans, patron due dates, renewal authorizations, and check-in desk
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono-code px-3 py-1.5 rounded-lg bg-[#1F3A2E] text-[#EFE7D3]">
            {activeLoans.length} active {activeLoans.length === 1 ? 'loan' : 'loans'}
          </div>
          {overdueLoans.length > 0 && (
            <div className="text-xs font-mono-code px-3 py-1.5 rounded-lg bg-[#8C4A3B] text-white flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{overdueLoans.length} overdue</span>
            </div>
          )}
        </div>
      </div>

      {activeLoans.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#4C7A5D]/15 text-[#4C7A5D] flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif-display font-bold text-lg text-[#1F3A2E]">All books are currently on the shelves</h3>
          <p className="text-xs text-[#23281F]/60 font-mono-code mt-1">No active loans circulating right now. Borrow a book to open a loan record.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#E4D9BE]/60 text-[#1F3A2E] font-mono-code border-b border-[#23281F]/15">
              <tr>
                <th className="py-3 px-4 font-semibold">Call Number</th>
                <th className="py-3 px-4 font-semibold">Book Title</th>
                <th className="py-3 px-4 font-semibold">Patron / Borrower</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold">Circulation Status</th>
                <th className="py-3 px-4 font-semibold text-right">Circulation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23281F]/10">
              {activeLoans.map((book) => {
                const overdue = isOverdue(book);
                const remaining = getDaysRemainingText(book);
                const fine = overdue && remaining.days < 0 ? (Math.abs(remaining.days) * 0.25).toFixed(2) : null;

                return (
                  <tr
                    key={book.id}
                    className={`hover:bg-[#EFE7D3]/60 transition-colors ${
                      overdue ? 'bg-[#8C4A3B]/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono-code text-[#8C4A3B] whitespace-nowrap">
                      {book.call}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => onSelectBook(book)}
                        className="font-serif-display font-bold text-sm text-[#1F3A2E] hover:text-[#B8923F] text-left block"
                      >
                        {book.title}
                      </button>
                      <div className="text-[11px] text-[#23281F]/60">
                        {book.author} · {book.genre}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-[#23281F]">
                        {book.borrower || 'Anonymous Patron'}
                      </div>
                      <div className="text-[11px] font-mono-code text-[#23281F]/50">
                        ID: {book.borrowerId || 'STU-GENERAL'}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono-code font-semibold text-[#23281F]">
                        {book.due}
                      </div>
                      <div
                        className={`text-[11px] font-mono-code ${
                          overdue ? 'text-[#8C4A3B] font-bold' : 'text-[#4C7A5D]'
                        }`}
                      >
                        {remaining.text}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {overdue ? (
                        <div className="inline-flex flex-col">
                          <span className="inline-flex items-center gap-1 font-mono-code font-bold text-[10px] px-2 py-0.5 rounded bg-[#8C4A3B]/15 text-[#8C4A3B] border border-[#8C4A3B]/30">
                            <AlertTriangle className="w-3 h-3" />
                            OVERDUE
                          </span>
                          {fine && (
                            <span className="text-[10px] font-mono-code text-[#8C4A3B] mt-0.5">
                              Estimated Fine: ${fine}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono-code text-[10px] px-2 py-0.5 rounded bg-[#B8923F]/20 text-[#754C24]">
                          <Clock className="w-3 h-3" />
                          ON LOAN
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onRenewLoan(book.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E4D9BE] hover:bg-[#D8CBB0] text-[#1F3A2E] font-medium transition-colors"
                          title="Renew loan (+14 days from current due date)"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Renew</span>
                        </button>

                        {onPrintReceipt && (
                          <button
                            onClick={() => onPrintReceipt(book)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1F3A2E] hover:bg-[#152922] text-[#FAF5E8] font-medium transition-colors"
                            title="Print loan slip"
                          >
                            <Printer className="w-3 h-3 text-[#B8923F]" />
                            <span>Slip</span>
                          </button>
                        )}

                        <button
                          onClick={() => onReturnBook(book.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#4C7A5D] hover:bg-[#3d634b] text-white font-medium transition-colors"
                          title="Check in and mark returned to stack"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Check In</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
