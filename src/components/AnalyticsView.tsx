import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { GENRE_COLORS } from '../data/initialBooks';
import { isOverdue } from '../utils/libraryUtils';
import { BarChart3, TrendingUp, BookCheck, Bookmark, Target, Award, Sparkles, Plus, Minus, CheckCircle } from 'lucide-react';

interface AnalyticsViewProps {
  books: Book[];
}

const STORAGE_KEY_GOAL = 'stackline_reading_goal_monthly';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ books }) => {
  const total = books.length;
  const out = books.filter((b) => b.out).length;
  const available = total - out;
  const overdue = books.filter(isOverdue).length;

  // Monthly Reading Goal State (with persistence)
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // e.g. "2026-10"

  const [monthlyTarget, setMonthlyTarget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GOAL);
      if (saved) return parseInt(saved, 10);
    } catch (e) {}
    return 10; // Default: 10 books target
  });

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempTarget, setTempTarget] = useState<number>(monthlyTarget);

  // Count books read/borrowed this month
  const currentMonthBorrowCount = books.filter(b => {
    // If book was borrowed this month or has active loans in month
    if (b.borrowedDate && b.borrowedDate.startsWith(currentMonthPrefix)) return true;
    return b.out;
  }).length;

  const progressPercent = Math.min(100, Math.round((currentMonthBorrowCount / Math.max(1, monthlyTarget)) * 100));
  const isGoalReached = currentMonthBorrowCount >= monthlyTarget;
  const booksRemaining = Math.max(0, monthlyTarget - currentMonthBorrowCount);

  const handleSaveGoal = () => {
    const valid = Math.max(1, Math.min(100, tempTarget));
    setMonthlyTarget(valid);
    localStorage.setItem(STORAGE_KEY_GOAL, valid.toString());
    setIsEditingGoal(false);
  };

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
      {/* SECTION 1: MONTHLY READING GOAL TRACKER */}
      <div className="bg-[#FAF5E8] border-2 border-[#B8923F] rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#B8923F]/15 to-transparent pointer-events-none rounded-bl-full" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#23281F]/15 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1F3A2E] text-[#B8923F] flex items-center justify-center shadow-md">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-display font-bold text-xl text-[#1F3A2E]">
                  Monthly Campus Reading Goal
                </h3>
                <span className="px-2 py-0.5 bg-[#B8923F]/20 text-[#1F3A2E] text-[11px] font-mono-code font-bold rounded-full">
                  {currentMonthName}
                </span>
              </div>
              <p className="text-xs font-mono-code text-[#23281F]/70 mt-0.5">
                Set and track your collective target for books borrowed & circulated this month
              </p>
            </div>
          </div>

          <div>
            {!isEditingGoal ? (
              <button
                onClick={() => {
                  setTempTarget(monthlyTarget);
                  setIsEditingGoal(true);
                }}
                className="px-3.5 py-1.5 bg-[#1F3A2E] hover:bg-[#152922] text-[#FAF5E8] text-xs font-mono-code font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>Edit Target</span>
                <span className="text-[#B8923F]">({monthlyTarget} books)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-[#EFE7D3] p-1.5 rounded-lg border border-[#23281F]/20">
                <button
                  onClick={() => setTempTarget(prev => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded bg-white hover:bg-[#FAF5E8] text-[#1F3A2E] flex items-center justify-center shadow-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tempTarget}
                  onChange={e => setTempTarget(parseInt(e.target.value, 10) || 1)}
                  className="w-12 text-center font-mono-code font-bold text-sm bg-white border border-[#23281F]/20 rounded py-0.5"
                />
                <button
                  onClick={() => setTempTarget(prev => prev + 1)}
                  className="w-7 h-7 rounded bg-white hover:bg-[#FAF5E8] text-[#1F3A2E] flex items-center justify-center shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleSaveGoal}
                  className="px-2.5 py-1 bg-[#4C7A5D] hover:bg-[#3d634b] text-white text-xs font-mono-code font-bold rounded shadow-xs"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Gauge & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3">
            <div className="flex justify-between items-baseline text-xs font-mono-code">
              <span className="text-[#23281F]/70">
                Circulation Progress: <b className="text-[#1F3A2E] text-base">{currentMonthBorrowCount}</b> of <b>{monthlyTarget}</b> books
              </span>
              <span className="font-bold text-sm text-[#8C4A3B]">
                {progressPercent}% Complete
              </span>
            </div>

            {/* Thick Progress Track */}
            <div className="w-full bg-[#E5DCBF] h-4 rounded-full overflow-hidden p-0.5 border border-[#23281F]/15 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isGoalReached
                    ? 'bg-gradient-to-r from-[#4C7A5D] to-[#6AA37F]'
                    : 'bg-gradient-to-r from-[#B8923F] via-[#D4AF37] to-[#8C4A3B]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-mono-code text-[#23281F]/65 pt-1">
              <span>
                {isGoalReached ? (
                  <span className="text-[#4C7A5D] font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>Monthly Target Achieved! Outstanding Academic Velocity 🏆</span>
                  </span>
                ) : (
                  <span>
                    📖 <b className="text-[#1F3A2E]">{booksRemaining} more</b> books to reach your {currentMonthName} target
                  </span>
                )}
              </span>
              <span className="text-[11px] text-[#23281F]/50">
                Pace: {(currentMonthBorrowCount / Math.max(1, new Date().getDate())).toFixed(2)} books/day
              </span>
            </div>
          </div>

          {/* Goal Achievement Badge Card */}
          <div className="bg-white/70 border border-[#23281F]/15 rounded-xl p-4 text-center flex flex-col items-center justify-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-xs ${
              isGoalReached ? 'bg-[#4C7A5D] text-white' : 'bg-[#B8923F]/20 text-[#B8923F]'
            }`}>
              {isGoalReached ? <Award className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div className="font-serif-display font-bold text-sm text-[#1F3A2E]">
              {isGoalReached ? 'Excellence Honor Roll' : 'Active Scholarly Goal'}
            </div>
            <p className="text-[11px] text-[#23281F]/60 font-mono-code mt-0.5">
              {isGoalReached
                ? 'Target satisfied ahead of month close.'
                : `${monthlyTarget} titles target for ${currentMonthName}`}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: CIRCULATION INTELLIGENCE */}
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
              {books.reduce((acc, b) => acc + (b.timesBorrowed || 0), 0)}
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
                      <div
                        className="h-full opacity-60"
                        style={{
                          width: `${(stats.out / total) * 100}%`,
                          backgroundColor: color,
                        }}
                        title={`${stats.out} checked out`}
                      />
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
