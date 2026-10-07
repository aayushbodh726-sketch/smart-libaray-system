import React from 'react';
import { Book } from '../types';
import { GENRE_COLORS } from '../data/initialBooks';
import { isOverdue } from '../utils/libraryUtils';
import { BarChart3, TrendingUp, BookCheck, Bookmark } from 'lucide-react';

interface AnalyticsViewProps {
  books: Book[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ books }) => {
  const total = books.length;
  const out = books.filter((b) => b.out).length;
  const available = total - out;
  const overdue = books.filter(isOverdue).length;

  // Genre breakdown
  const genreCounts: Record<string, { total: number; out: number }> = {};
  books.forEach((b) => {
    if (!genreCounts[b.genre]) {
      genreCounts[b.genre] = { total: 0, out: 0 };
    }
    genreCounts[b.genre].total += 1;
    if (b.out) {
      genreCounts[b.genre].out += 1;
    }
  });

  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1].total - a[1].total);

  // Top borrowed books
  const topBorrowed = [...books].sort((a, b) => b.timesBorrowed - a.timesBorrowed).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-[#FBF6E9] border border-[#23281F]/15 rounded-xl p-6 shadow-sm">
        <h2 className="font-serif-display font-bold text-2xl text-[#1F3A2E] mb-1">
          Library Circulation & Collection Intelligence
        </h2>
        <p className="text-xs text-[#23281F]/65 font-mono-code mb-6">
          Real-time metrics covering subject density, loan velocities, and inventory health
        </p>

        {/* Top 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#EFE7D3]/60 rounded-xl p-4 border border-[#23281F]/10">
            <div className="flex items-center justify-between text-xs font-mono-code text-[#23281F]/60 mb-1">
              <span>ACTIVE CIRCULATION</span>
              <TrendingUp className="w-4 h-4 text-[#B8923F]" />
            </div>
            <div className="font-serif-display text-3xl font-bold text-[#1F3A2E]">
              {total > 0 ? ((out / total) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-[#23281F]/70 mt-1">
              {out} of {total} books currently checked out
            </div>
          </div>

          <div className="bg-[#EFE7D3]/60 rounded-xl p-4 border border-[#23281F]/10">
            <div className="flex items-center justify-between text-xs font-mono-code text-[#23281F]/60 mb-1">
              <span>RETURN COMPLIANCE</span>
              <BookCheck className="w-4 h-4 text-[#4C7A5D]" />
            </div>
            <div className="font-serif-display text-3xl font-bold text-[#4C7A5D]">
              {out > 0 ? (((out - overdue) / out) * 100).toFixed(1) : 100}%
            </div>
            <div className="text-xs text-[#23281F]/70 mt-1">
              {overdue === 0 ? 'Zero overdue loans' : `${overdue} books pending return`}
            </div>
          </div>

          <div className="bg-[#EFE7D3]/60 rounded-xl p-4 border border-[#23281F]/10">
            <div className="flex items-center justify-between text-xs font-mono-code text-[#23281F]/60 mb-1">
              <span>TOTAL LOAN EVENTS</span>
              <Bookmark className="w-4 h-4 text-[#8C4A3B]" />
            </div>
            <div className="font-serif-display text-3xl font-bold text-[#754C24]">
              {books.reduce((acc, b) => acc + b.timesBorrowed, 0)}
            </div>
            <div className="text-xs text-[#23281F]/70 mt-1">
              All-time historical loans recorded
            </div>
          </div>
        </div>

        {/* Breakdown by Subjects & Popular Books */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-[#23281F]/10">
          {/* Subjects breakdown */}
          <div>
            <h3 className="font-serif-display font-bold text-lg text-[#1F3A2E] mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#B8923F]" />
              <span>Subject Classification Breakdown</span>
            </h3>

            <div className="space-y-3">
              {sortedGenres.map(([genre, stats]) => {
                const pct = Math.round((stats.total / total) * 100);
                const color = GENRE_COLORS[genre] || '#2E4A62';

                return (
                  <div key={genre} className="bg-[#EFE7D3]/40 p-2.5 rounded-lg border border-[#23281F]/10">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-[#1F3A2E] flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        {genre}
                      </span>
                      <span className="font-mono-code text-[#23281F]/70">
                        {stats.total} titles ({stats.out} borrowed) · {pct}%
                      </span>
                    </div>

                    <div className="w-full bg-[#E4D9BE] h-2 rounded-full overflow-hidden flex">
                      {/* Portion checked out */}
                      <div
                        className="h-full opacity-60"
                        style={{
                          width: `${(stats.out / total) * 100}%`,
                          backgroundColor: color,
                        }}
                        title={`${stats.out} checked out`}
                      />
                      {/* Portion available */}
                      <div
                        className="h-full"
                        style={{
                          width: `${((stats.total - stats.out) / total) * 100}%`,
                          backgroundColor: color,
                        }}
                        title={`${stats.total - stats.out} available`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Circulation champions */}
          <div>
            <h3 className="font-serif-display font-bold text-lg text-[#1F3A2E] mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4C7A5D]" />
              <span>Most Circulated Titles</span>
            </h3>

            <div className="space-y-3">
              {topBorrowed.map((book, rank) => (
                <div
                  key={book.id}
                  className="bg-[#EFE7D3]/40 p-3 rounded-lg border border-[#23281F]/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#1F3A2E] text-[#B8923F] font-mono-code text-xs font-bold flex items-center justify-center shrink-0">
                      {rank + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-serif-display font-bold text-sm text-[#1F3A2E] truncate">
                        {book.title}
                      </div>
                      <div className="text-xs text-[#23281F]/60 truncate">
                        {book.author} · {book.genre}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono-code font-bold text-sm text-[#754C24]">
                      {book.timesBorrowed}
                    </span>
                    <div className="text-[10px] font-mono-code text-[#23281F]/50">
                      loans
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
