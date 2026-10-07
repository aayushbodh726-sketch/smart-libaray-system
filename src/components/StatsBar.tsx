import React from 'react';
import { BookMarked, CheckCircle2, AlertCircle, ArrowUpRight, Clock } from 'lucide-react';
import { Book } from '../types';
import { isOverdue } from '../utils/libraryUtils';

interface StatsBarProps {
  books: Book[];
  onSelectFilter: (filter: 'all' | 'avail' | 'out' | 'overdue') => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ books, onSelectFilter }) => {
  const total = books.length;
  const avail = books.filter((b) => !b.out).length;
  const out = books.filter((b) => b.out).length;
  const overdueList = books.filter(isOverdue);
  const overdue = overdueList.length;
  const circulationRate = total > 0 ? Math.round((out / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 -mt-6 mb-8 relative z-20">
      {/* Total */}
      <button
        onClick={() => onSelectFilter('all')}
        className="text-left bg-[#FBF6E9] border border-[#23281F]/15 rounded-xl p-3.5 shadow-md hover:shadow-lg hover:border-[#B8923F] transition-all group"
      >
        <div className="flex items-center justify-between text-[#23281F]/60 text-xs font-mono-code mb-1">
          <span>CATALOG</span>
          <BookMarked className="w-3.5 h-3.5 text-[#23281F]/40 group-hover:text-[#B8923F] transition-colors" />
        </div>
        <div className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1F3A2E]">
          {total}
        </div>
        <div className="text-xs text-[#23281F]/70 mt-0.5">titles on record</div>
      </button>

      {/* Available */}
      <button
        onClick={() => onSelectFilter('avail')}
        className="text-left bg-[#FBF6E9] border border-[#23281F]/15 rounded-xl p-3.5 shadow-md hover:shadow-lg hover:border-[#4C7A5D] transition-all group"
      >
        <div className="flex items-center justify-between text-[#4C7A5D] text-xs font-mono-code mb-1">
          <span>AVAILABLE</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4C7A5D]" />
        </div>
        <div className="font-serif-display text-2xl sm:text-3xl font-bold text-[#4C7A5D]">
          {avail}
        </div>
        <div className="text-xs text-[#23281F]/70 mt-0.5">ready to borrow</div>
      </button>

      {/* Checked Out */}
      <button
        onClick={() => onSelectFilter('out')}
        className="text-left bg-[#FBF6E9] border border-[#23281F]/15 rounded-xl p-3.5 shadow-md hover:shadow-lg hover:border-[#B8923F] transition-all group"
      >
        <div className="flex items-center justify-between text-[#B8923F] text-xs font-mono-code mb-1">
          <span>CIRCULATING</span>
          <Clock className="w-3.5 h-3.5 text-[#B8923F]" />
        </div>
        <div className="font-serif-display text-2xl sm:text-3xl font-bold text-[#754C24]">
          {out}
        </div>
        <div className="text-xs text-[#23281F]/70 mt-0.5">with patrons</div>
      </button>

      {/* Overdue */}
      <button
        onClick={() => onSelectFilter('overdue')}
        className={`text-left bg-[#FBF6E9] border rounded-xl p-3.5 shadow-md hover:shadow-lg transition-all group ${
          overdue > 0
            ? 'border-[#8C4A3B]/40 bg-[#FAF1EE]'
            : 'border-[#23281F]/15'
        }`}
      >
        <div className="flex items-center justify-between text-[#8C4A3B] text-xs font-mono-code mb-1">
          <span>OVERDUE</span>
          <AlertCircle className={`w-3.5 h-3.5 ${overdue > 0 ? 'text-[#8C4A3B] animate-bounce' : 'text-[#8C4A3B]/40'}`} />
        </div>
        <div className="font-serif-display text-2xl sm:text-3xl font-bold text-[#8C4A3B]">
          {overdue}
        </div>
        <div className="text-xs text-[#23281F]/70 mt-0.5">
          {overdue > 0 ? 'action required' : 'zero overdue'}
        </div>
      </button>

      {/* Circulation Rate */}
      <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-[#1F3A2E] text-[#EFE7D3] border border-[#B8923F]/30 rounded-xl p-3.5 shadow-md flex flex-col justify-between">
        <div className="flex items-center justify-between text-[#B8923F] text-xs font-mono-code">
          <span>CIRCULATION</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#B8923F]" />
        </div>
        <div className="font-serif-display text-2xl sm:text-3xl font-bold text-[#FAF5E8]">
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
