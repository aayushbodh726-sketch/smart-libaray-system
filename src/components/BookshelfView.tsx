import React, { useState } from 'react';
import { Book } from '../types';
import { GENRE_COLORS } from '../data/initialBooks';
import { isOverdue } from '../utils/libraryUtils';
import { Info, BookOpen, Bookmark, Sparkles, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface BookshelfViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  filteredCount: number;
}

// Extract primary author surname for book spine display
function getAuthorSurname(author: string): string {
  if (!author) return '';
  const firstAuthor = author.split(',')[0].trim();
  const parts = firstAuthor.split(' ');
  return parts[parts.length - 1].toUpperCase();
}

// Split call number into 2-3 lines for realistic library spine sticker
function formatSpineCallNumber(call: string): { classPart: string; cutterPart: string } {
  if (!call) return { classPart: 'GEN', cutterPart: '001' };
  const parts = call.split(' ');
  const classPart = parts[0] || 'QA76';
  const cutterPart = parts.slice(1).join(' ') || '.01';
  return { classPart, cutterPart };
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  books,
  onSelectBook,
  filteredCount,
}) => {
  const [hoveredBook, setHoveredBook] = useState<Book | null>(null);

  // Group books into realistic shelf tiers (e.g., 9-11 volumes per shelf board)
  const booksPerShelf = 10;
  const shelves: Book[][] = [];
  for (let i = 0; i < books.length; i += booksPerShelf) {
    shelves.push(books.slice(i, i + booksPerShelf));
  }

  // Realistic dimensions based on page volume extent and book title length
  const getBookSpineMetrics = (book: Book, index: number) => {
    const pages = book.pages || 320;
    // Width (thickness): from slim 42px to heavy volume 66px
    const width = Math.min(68, Math.max(42, Math.floor(pages / 28) + 36));
    // Height: from 205px to 255px with natural academic collection variety
    const height = Math.min(255, Math.max(205, 205 + ((book.id * 13 + index * 9) % 45)));
    // Natural tilt: slight 0, -1.5, or 1.5 deg tilt for realism
    const tiltPattern = [0, 0, -1.2, 0, 1.2, 0, 0, -1.5, 0, 1.0];
    const tilt = tiltPattern[index % tiltPattern.length];

    return { width, height, tilt };
  };

  return (
    <div className="space-y-10">
      {/* Shelf Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#23281F]/15 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono-code text-xs uppercase tracking-wider text-[#1F3A2E] font-bold">
            St. Jude Open Stacks · Shelving Gallery
          </span>
          <span className="bg-[#1F3A2E] text-[#FAF5E8] text-xs font-mono-code px-2.5 py-0.5 rounded-full font-semibold shadow-xs">
            {filteredCount} {filteredCount === 1 ? 'Volume' : 'Volumes'} Shelved
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-code text-[#23281F]/75">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4C7A5D] shadow-xs"></span>
            <span>Available on Shelf</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8923F] shadow-xs"></span>
            <span>Active Loan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8C4A3B] shadow-xs animate-pulse"></span>
            <span>Overdue Alert</span>
          </div>
        </div>
      </div>

      {/* Floating Active Book Inspection Card Banner */}
      <div className="min-h-16 bg-[#FBF6E9] border-2 border-[#B8923F]/60 rounded-xl p-3.5 flex items-center justify-between shadow-md transition-all">
        {hoveredBook ? (
          <div className="flex items-center gap-4 w-full animate-in fade-in duration-150">
            {/* Spine Color Chip */}
            <div
              className="w-4 h-12 rounded-sm shadow-md border border-black/20 shrink-0"
              style={{
                backgroundColor: GENRE_COLORS[hoveredBook.genre] || '#2E4A62',
                backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.2) 50%, rgba(0,0,0,0.4) 100%)',
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-serif-display font-bold text-base text-[#1F3A2E] truncate">
                  {hoveredBook.title}
                </span>
                <span className="font-mono-code text-xs text-[#8C4A3B] px-2 py-0.5 bg-[#8C4A3B]/10 rounded border border-[#8C4A3B]/20 font-bold shrink-0">
                  {hoveredBook.call}
                </span>
              </div>
              <div className="text-xs text-[#23281F]/70 truncate mt-0.5">
                by <span className="font-semibold text-[#1F3A2E]">{hoveredBook.author}</span> · {hoveredBook.genre} · {hoveredBook.pages ? `${hoveredBook.pages} pages · ` : ''}{hoveredBook.shelfLocation || 'Main Stack'}
              </div>
            </div>
            <div className="shrink-0 text-right">
              {hoveredBook.out ? (
                isOverdue(hoveredBook) ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono-code text-white font-bold bg-[#8C4A3B] px-2.5 py-1 rounded shadow-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>OVERDUE ({hoveredBook.due})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-mono-code text-[#152922] font-bold bg-[#B8923F] px-2.5 py-1 rounded shadow-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>LOAN DUE {hoveredBook.due}</span>
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-mono-code text-white font-bold bg-[#4C7A5D] px-2.5 py-1 rounded shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ON SHELF · AVAILABLE</span>
                </span>
              )}
              <div className="text-[10px] font-mono-code text-[#23281F]/50 mt-1">
                Click spine to pull out volume
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono-code text-[#23281F]/70">
            <Info className="w-4 h-4 text-[#B8923F] shrink-0" />
            <span>
              Hover over any volume to inspect spine calligraphy & classification · Click any book to pull it from the shelf
            </span>
          </div>
        )}
      </div>

      {/* Shelves Rendering */}
      {shelves.length === 0 ? (
        <div className="bg-[#FBF6E9] border-2 border-dashed border-[#23281F]/20 rounded-xl p-12 text-center my-8">
          <BookOpen className="w-10 h-10 text-[#B8923F] mx-auto mb-3" />
          <p className="font-serif-display text-xl text-[#1F3A2E] font-semibold mb-2">
            No matching books found in these stacks
          </p>
          <p className="text-sm text-[#23281F]/60 font-mono-code">
            Adjust your subject filter or clear the search query to browse available volumes.
          </p>
        </div>
      ) : (
        shelves.map((shelfBooks, shelfIndex) => (
          <div key={shelfIndex} className="relative select-none">
            {/* Shelf Aisle Header Plaque */}
            <div className="flex justify-between items-center mb-1.5 px-2">
              <span className="font-mono-code text-xs tracking-wider text-[#1F3A2E] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8923F]" />
                <span>SHELF TIER {shelfIndex + 1} · AISLE {String.fromCharCode(65 + shelfIndex)}</span>
              </span>
              <span className="text-[11px] font-mono-code text-[#23281F]/60">
                {shelfBooks.length} volumes on shelf
              </span>
            </div>

            {/* Bookshelf Wooden Cabinet */}
            <div className="bg-[#2E1C12] border-4 border-[#1C1008] rounded-xl shadow-2xl overflow-hidden p-3 sm:p-5 pt-8">
              {/* Backboard with wood panelling gradient */}
              <div
                className="relative min-h-[270px] sm:min-h-[285px] flex items-end justify-center sm:justify-start overflow-x-auto px-4 pb-0 scrollbar-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 8%, transparent 92%, rgba(0,0,0,0.5) 100%),
                    repeating-linear-gradient(90deg, #3A2317 0px, #3A2317 78px, #2A180F 80px)
                  `,
                }}
              >
                {/* Book Spines Row */}
                <div className="flex items-end gap-1.5 sm:gap-2.5 min-w-max pb-0 z-10 mx-auto sm:mx-0">
                  {shelfBooks.map((book, idx) => {
                    const { width, height, tilt } = getBookSpineMetrics(book, idx);
                    const spineColor = GENRE_COLORS[book.genre] || '#2E4A62';
                    const overdueState = isOverdue(book);
                    const authorSurname = getAuthorSurname(book.author);
                    const { classPart, cutterPart } = formatSpineCallNumber(book.call);
                    const isHovered = hoveredBook?.id === book.id;

                    return (
                      <div
                        key={book.id}
                        onClick={() => onSelectBook(book)}
                        onMouseEnter={() => setHoveredBook(book)}
                        onMouseLeave={() => setHoveredBook(null)}
                        style={{
                          width: `${width}px`,
                          height: `${height}px`,
                          transform: isHovered
                            ? `translateY(-22px) scale(1.02)`
                            : `rotate(${tilt}deg)`,
                          transformOrigin: 'bottom center',
                        }}
                        className={`relative rounded-t-sm cursor-pointer transition-all duration-200 group/spine flex flex-col justify-between overflow-hidden shadow-[0_6px_12px_rgba(0,0,0,0.45)] hover:shadow-[0_20px_28px_rgba(0,0,0,0.6)] ${
                          book.out ? 'opacity-90' : 'opacity-100'
                        }`}
                      >
                        {/* 3D Curved Cylindrical Spine Shading Overlay */}
                        <div
                          className="absolute inset-0 pointer-events-none z-20"
                          style={{
                            background:
                              'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.18) 14%, rgba(255,255,255,0.02) 42%, rgba(0,0,0,0.12) 80%, rgba(0,0,0,0.6) 100%)',
                          }}
                        />

                        {/* Base Leather / Cloth Color */}
                        <div
                          className="absolute inset-0 z-0"
                          style={{
                            backgroundColor: spineColor,
                            backgroundImage: `
                              radial-gradient(circle at 50% 30%, rgba(255,255,255,0.08) 0%, transparent 70%),
                              repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 2px, transparent 2px, transparent 4px)
                            `,
                          }}
                        />

                        {/* Top Spine Headcap & Upper Gold Foil Ridge */}
                        <div className="relative z-10 w-full pt-2 px-1">
                          {/* Headcap ridge */}
                          <div className="w-full h-1 bg-black/40 rounded-t-sm mb-1.5" />

                          {/* Raised Gold Spine Bands (Ribs) */}
                          <div className="w-full flex flex-col gap-0.5 px-0.5">
                            <div className="h-[2px] bg-[#E8C872] shadow-[0_1px_1px_rgba(0,0,0,0.6)] rounded-xs" />
                            <div className="h-[1px] bg-[#B8923F]/80 rounded-xs" />
                          </div>

                          {/* Author Surname in Small Caps */}
                          <div className="mt-2 text-center overflow-hidden px-0.5">
                            <span className="font-mono-code font-bold text-[8px] sm:text-[9px] tracking-wider text-[#E8C872] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate block">
                              {authorSurname}
                            </span>
                          </div>
                        </div>

                        {/* Spine Middle Title (Full Height Vertical Typography) */}
                        <div className="relative z-10 flex-1 flex items-center justify-center py-2 px-0.5 overflow-hidden">
                          <span
                            className="font-serif-display font-bold text-[11px] sm:text-[12px] text-[#FAF5E8] tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] whitespace-nowrap overflow-hidden select-none text-center"
                            style={{
                              writingMode: 'vertical-rl',
                              transform: 'rotate(180deg)',
                              maxHeight: `${height - 95}px`,
                              letterSpacing: '0.04em',
                            }}
                          >
                            {book.title}
                          </span>
                        </div>

                        {/* Lower Raised Rib Bands */}
                        <div className="relative z-10 w-full px-1.5 my-1">
                          <div className="h-[2px] bg-[#E8C872] shadow-[0_1px_1px_rgba(0,0,0,0.6)] rounded-xs" />
                        </div>

                        {/* Authentic Academic Library Call Number Paper Sticker */}
                        <div className="relative z-10 mx-1 mb-2 bg-[#FAF4E6] text-[#1C1008] border border-black/30 rounded-xs px-1 py-1 shadow-sm text-center">
                          <div className="font-mono-code font-bold text-[8px] leading-tight tracking-tighter truncate text-[#8C4A3B]">
                            {classPart}
                          </div>
                          <div className="font-mono-code font-bold text-[7.5px] leading-tight tracking-tighter truncate text-[#1C1008]/85">
                            {cutterPart}
                          </div>
                        </div>

                        {/* Status Hanging Ribbon / Bookmark Bookmark (if Checked Out) */}
                        {book.out && (
                          <div
                            className={`absolute top-0 right-1.5 w-2.5 h-6 rounded-b-xs shadow-md z-30 transition-transform ${
                              overdueState
                                ? 'bg-[#8C4A3B] animate-bounce'
                                : 'bg-[#B8923F]'
                            }`}
                            title={overdueState ? 'Overdue Volume!' : 'Volume on Active Loan'}
                          >
                            <div className="w-full h-1 bg-black/20" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Realistic Solid Oak Shelf Board */}
              <div className="relative mt-0 z-20">
                {/* Upper shelf surface with perspective highlight */}
                <div className="h-5 bg-gradient-to-r from-[#3D2517] via-[#5C3822] to-[#3D2517] border-t-2 border-[#7A4B2F] shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />

                {/* Front Heavy Beveled Wood Beam */}
                <div className="h-6 bg-gradient-to-b from-[#4A2D1B] to-[#1C1008] border-b-2 border-black flex items-center justify-between px-6 shadow-xl">
                  {/* Left Screw/Bolt Accent */}
                  <div className="w-2 h-2 rounded-full bg-[#1C1008] border border-[#B8923F]/40 shadow-inner" />

                  {/* Brass Plaque with Shelf Designation */}
                  <div className="bg-gradient-to-r from-[#94742E] via-[#D4AF37] to-[#94742E] text-[#152922] font-mono-code text-[9px] font-bold px-4 py-0.5 rounded-xs tracking-widest uppercase shadow-md border border-[#FAF5E8]/40 flex items-center gap-1.5">
                    <Sparkles className="w-2.5 h-2.5 text-[#152922]" />
                    <span>ST. JUDE ARCHIVES · AISLE {String.fromCharCode(65 + shelfIndex)}</span>
                  </div>

                  {/* Right Screw/Bolt Accent */}
                  <div className="w-2 h-2 rounded-full bg-[#1C1008] border border-[#B8923F]/40 shadow-inner" />
                </div>

                {/* Deep Under-Shelf Cast Shadow */}
                <div className="h-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
