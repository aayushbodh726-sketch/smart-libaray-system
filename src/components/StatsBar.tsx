import React from 'react';
import { BookMarked, CheckCircle2, AlertCircle, ArrowUpRight, Clock, Hourglass } from 'lucide-react';
import { Book, AvailabilityFilter } from '../types';
import { isOverdue, isDueSoon } from '../utils/libraryUtils';

interface StatsBarProps {
  books: Book[];
  onSelectFilter: (filter: AvailabilityFilter) => void;
  currentFilter?: AvailabilityFilter;
}

export const StatsBar: React.FC<StatsBarProps> = ({ books, onSelectFilter, currentFilter = 'all' }) => {
  const total = books.length;
  const avail = books.filter((b) => !b.out).length;
  const out = books.filter((b) => b.out).length;
  const overdueList = books.filter(isOverdue);
  const overdue = overdueList.length;
  const dueSoonList = books.filter((b) => isDueSoon(b, 3));
  const dueSoon = dueSoonList.length;
  const circulationRate = total > 0 ? Math.round((out / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 -mt-6 mb-8 relative z-20">
      {/* Total */}
      <button
        onClick={() => onSelectFilter('all')}
        className={`text-left border rounded-xl p-3.5 shadow-md hover:shadow-lg transition-all group ${
          currentFilter === 'all'
            ? 'bg-[#FBF6E9] border-[#B8923F] ring-2 ring-[#B8923F]/30'
            : 'bg-[#FBF6E9] border-[#23281F]/15 hover:border-[#B8923F]'
        }`}
      >
        <div className="flex items-center justify-between text-[#23281F]/60 text-xs font-mono-code mb-1">
          <span>CATALOG</span>
          <BookMarked className="w-3.5 h-3.5 text-[#23281F]/40 group-hover:text-[#B8923F] transition-colors" />
        </div>
        <div className="font-serif-display text-2xl font-bold text-[#1F3A2E]">
          {total}
        </div>
        <div className="text-[11px] text-[#23281F]/70 mt-0.5">titles on record</div>
      </button>

      {/* Available */}
      <button
        onClick={() => onSelectFilter('avail')}
        className={`text-left border rounded-xl p-3.5 shadow-md hover:shadow-lg transition-all group ${
          currentFilter === 'avail'
            ? 'bg-[#FBF6E9] border-[#4C7A5D] ring-2 ring-[#4C7A5D]/30'
            : 'bg-[#FBF6E9] border-[#23281F]/15 hover:border-[#4C7A5D]'
        }`}
      >
        <div className="flex items-center justify-between text-[#4C7A5D] text-xs font-mono-code mb-1">
          <span>AVAILABLE</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4C7A5D]" />
        </div>
        <div className="font-serif-display text-2xl font-bold text-[#4C7A5D]">
          {avail}
        </div>
        <div className="text-[11px] text-[#23281F]/70 mt-0.5">ready to borrow</div>
      </button>

      {/* Checked Out */}
      <button
        onClick={() => onSelectFilter('out')}
        className={`text-left border rounded-xl p-3.5 shadow-md hover:shadow-lg transition-all group ${
          currentFilter === 'out'
            ? 'bg-[#FBF6E9] border-[#B8923F] ring-2 ring-[#B8923F]/30'
            : 'bg-[#FBF6E9] border-[#23281F]/15 hover:border-[#B8923F]'
        }`}
      >
        <div className="flex items-center justify-between text-[#B8923F] text-xs font-mono-code mb-1">
          <span>CIRCULATING</span>
          <Clock className="w-3.5 h-3.5 text-[#B8923F]" />
        </div>
        <div className="font-serif-display text-2xl font-bold text-[#754C24]">
          {out}
        </div>
        <div className="text-[11px] text-[#23281F]/70 mt-0.5">with patrons</div>
      </button>

      {/* Due Soon (Next 3 Days) Indicator */}
      <button
        onClick={() => onSelectFilter('due_soon')}
        className={`text-left border rounded-xl p-3.5 shadow-md hover:shadow-lg transition-all group ${
          currentFilter === 'due_soon'
            ? 'bg-[#FFF8E7] border-[#D4AF37] ring-2 ring-[#D4AF37]/40'
            : dueSoon > 0
            ? 'bg-[#FFF9EA] border-[#D4AF37]/50 hover:border-[#D4AF37]'
            : 'bg-[#FBF6E9] border-[#23281F]/15 hover:border-[#D4AF37]'
        }`}
      >
        <div className="flex items-center justify-between text-[#B8923F] text-xs font-mono-code mb-1">
          <span className="font-bold">DUE SOON</span>
          <Hourglass className={`w-3.5 h-3.5 ${dueSoon > 0 ? 'text-[#B8923F] animate-pulse' : 'text-[#B8923F]/50'}`} />
        </div>
        <div className="font-serif-display text-2xl font-bold text-[#946A15]">
          {dueSoon}
        </div>
        <div className="text-[11px] text-[#7A5A1B] mt-0.5">
          {dueSoon > 0 ? 'within 3 days ⏳' : 'none due soon'}
        </div>
      </button>

      {/* Overdue */}
      <button
        onClick={() => onSelectFilter('overdue')}
        className={`text-left border rounded-xl p-3.5 shadow-md hover:shadow-lg transition-all group ${
          currentFilter === 'overdue'
            ? 'bg-[#FAF1EE] border-[#8C4A3B] ring-2 ring-[#8C4A3B]/40'
            : overdue > 0
            ? 'border-[#8C4A3B]/40 bg-[#FAF1EE] hover:border-[#8C4A3B]'
            : 'bg-[#FBF6E9] border-[#23281F]/15 hover:border-[#8C4A3B]'
        }`}
      >
        <div className="flex items-center justify-between text-[#8C4A3B] text-xs font-mono-code mb-1">
          <span>OVERDUE</span>
          <AlertCircle className={`w-3.5 h-3.5 ${overdue > 0 ? 'text-[#8C4A3B] animate-bounce' : 'text-[#8C4A3B]/40'}`} />
        </div>
        <div className="font-serif-display text-2xl font-bold text-[#8C4A3B]">
          {overdue}
        </div>
        <div className="text-[11px] text-[#23281F]/70 mt-0.5">
          {overdue > 0 ? 'fines accruing' : 'zero overdue'}
        </div>
      </button>

      {/* Circulation Velocity Rate */}
      <div className="col-span-2 sm:col-span-3 lg:col-span-1 bg-[#1F3A2E] text-[#EFE7D3] border border-[#B8923F]/30 rounded-xl p-3.5 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#B8923F] text-xs font-mono-code">
          <span>CIRCULATION</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#B8923F]" />
        </div>
        <div className="font-serif-display text-2xl font-bold text-[#FAF5E8]">
          {circulationRate}%
        </div>
        <div className="w-full bg-[#152922] h-1.5 rounded-full overflow-hidden mt-1">
          <div
            className="bg-[#B8923F] h-full transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, circulationRate)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
