import React, { useState } from 'react';
import { Book } from '../types';
import { GENRE_COLORS } from '../data/initialBooks';
import { isOverdue, isDueSoon } from '../utils/libraryUtils';
import { BookCover3D } from './BookCover3D';
import { Info, BookOpen, Sparkles, CheckCircle2, Clock, AlertCircle, Hourglass, ArrowUpRight, Compass } from 'lucide-react';

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
function formatSpineCallNumber(call: string, year?: number): { classPart: string; cutterPart: string; yearPart?: string } {
  if (!call) return { classPart: 'GEN', cutterPart: '001', yearPart: year ? String(year) : undefined };
  const parts = call.split(' ');
  const classPart = parts[0] || 'QA76';
  const cutterPart = parts.slice(1).join(' ') || '.01';
  return { classPart, cutterPart, yearPart: year ? String(year) : undefined };
}

// Texture styles for spines based on genre
function getSpineTexture(genre: string): string {
  switch (genre) {
    case 'Computer Science':
    case 'Physics':
    case 'Mathematics':
      // Fine buckram cloth weave
      return `
        repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 3px),
        repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)
      `;
    case 'History':
    case 'Philosophy':
    case 'Psychology':
      // Rich pebbled morocco leather
      return `
        radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06) 0%, transparent 60%),
        repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 2px, transparent 2px, transparent 4px)
      `;
    case 'Literature':
    case 'Fiction':
      // Antiquarian gilt cloth
      return `
        repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 2px),
        radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.07) 0%, transparent 80%)
      `;
    default:
      // Standard academic library linen
      return `
        repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px)
      `;
  }
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  books,
  onSelectBook,
  filteredCount,
}) => {
  const [hoveredBook, setHoveredBook] = useState<Book | null>(null);

  // Group books into realistic shelf tiers (9-10 volumes per shelf board)
  const booksPerShelf = 10;
  const shelves: Book[][] = [];
  for (let i = 0; i < books.length; i += booksPerShelf) {
    shelves.push(books.slice(i, i + booksPerShelf));
  }

  // Realistic dimensions based on page volume extent and book title length
  const getBookSpineMetrics = (book: Book, index: number) => {
    const pages = book.pages || 320;
    // Width (thickness): from 40px to 68px
    const width = Math.min(68, Math.max(40, Math.floor(pages / 28) + 36));
    // Height: from 215px to 265px with natural academic collection variety
    const height = Math.min(265, Math.max(215, 215 + ((book.id * 17 + index * 11) % 45)));
    // Natural tilt: slight 0, -1.2, or 1.2 deg tilt for physical realism
    const tiltPattern = [0, 0, -1.1, 0, 1.1, 0, 0, -1.3, 0, 0.9];
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
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8C872] border border-[#B8923F] shadow-xs"></span>
            <span>Due Soon (&le;3d)</span>
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
      <div className="min-h-24 bg-[#FBF6E9] border-2 border-[#B8923F]/60 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-md transition-all">
        {hoveredBook ? (
          <div className="flex items-center gap-4 w-full animate-in fade-in duration-150">
            {/* 3D Mini Book Cover Preview */}
            <div className="shrink-0 hidden sm:block">
              <BookCover3D book={hoveredBook} size="sm" />
            </div>

            {/* Mobile Spine Color Chip fallback */}
            <div
              className="w-4 h-14 rounded-sm shadow-md border border-black/30 shrink-0 sm:hidden"
              style={{
                backgroundColor: GENRE_COLORS[hoveredBook.genre] || '#2E4A62',
                backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.2) 50%, rgba(0,0,0,0.4) 100%)',
              }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-serif-display font-bold text-base sm:text-lg text-[#1F3A2E] truncate">
                  {hoveredBook.title}
                </span>
                <span className="font-mono-code text-xs text-[#8C4A3B] px-2 py-0.5 bg-[#8C4A3B]/10 rounded border border-[#8C4A3B]/20 font-bold shrink-0">
                  {hoveredBook.call}
                </span>
                {hoveredBook.waitlist && hoveredBook.waitlist.length > 0 && (
                  <span className="font-mono-code text-[11px] text-[#754C24] px-2 py-0.5 bg-[#B8923F]/15 rounded border border-[#B8923F]/30 font-bold shrink-0">
                    {hoveredBook.waitlist.length} on waitlist
                  </span>
                )}
              </div>
              <div className="text-xs text-[#23281F]/70 truncate mt-1">
                by <span className="font-semibold text-[#1F3A2E]">{hoveredBook.author}</span> · {hoveredBook.genre} · {hoveredBook.pages ? `${hoveredBook.pages} pages · ` : ''}{hoveredBook.shelfLocation || 'Main Stack'}
              </div>
              {hoveredBook.description && (
                <p className="text-[11px] text-[#23281F]/60 line-clamp-1 mt-1 hidden md:block">
                  {hoveredBook.description}
                </p>
              )}
            </div>

            <div className="shrink-0 text-right flex flex-col items-end gap-1.5">
              {hoveredBook.out ? (
                isOverdue(hoveredBook) ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono-code text-white font-bold bg-[#8C4A3B] px-2.5 py-1 rounded shadow-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>OVERDUE ({hoveredBook.due})</span>
                  </span>
                ) : isDueSoon(hoveredBook, 3) ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono-code text-[#7A5A1B] font-bold bg-[#FFF2D1] border border-[#D4AF37] px-2.5 py-1 rounded shadow-xs">
                    <Hourglass className="w-3.5 h-3.5 text-[#B8923F] animate-spin" />
                    <span>DUE SOON ({hoveredBook.due})</span>
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

              <button
                onClick={() => onSelectBook(hoveredBook)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#1F3A2E] hover:text-[#B8923F] transition-colors mt-0.5"
              >
                <span>Pull volume from shelf</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono-code text-[#23281F]/70 py-2">
            <Info className="w-4 h-4 text-[#B8923F] shrink-0" />
            <span>
              Hover over any volume to inspect gold spine calligraphy, classification tag, and physical volume · Click any book to pull it from the shelf
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
            <div className="bg-[#24150D] border-4 border-[#170D08] rounded-xl shadow-2xl overflow-hidden p-3 sm:p-5 pt-10">
              {/* Backboard with rich dark mahogany panelling */}
              <div
                className="relative min-h-[280px] sm:min-h-[295px] flex items-end justify-center sm:justify-start overflow-x-auto px-4 pb-0 scrollbar-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(0,0,0,0.65) 0%, transparent 8%, transparent 92%, rgba(0,0,0,0.65) 100%),
                    repeating-linear-gradient(90deg, #2E1A11 0px, #2E1A11 76px, #1C0F0A 80px)
                  `,
                }}
              >
                {/* Book Spines Row */}
                <div className="flex items-end gap-1.5 sm:gap-2.5 min-w-max pb-0 z-10 mx-auto sm:mx-0">
                  {shelfBooks.map((book, idx) => {
                    const { width, height, tilt } = getBookSpineMetrics(book, idx);
                    const spineColor = GENRE_COLORS[book.genre] || '#2E4A62';
                    const overdueState = isOverdue(book);
                    const dueSoonState = isDueSoon(book, 3);
                    const authorSurname = getAuthorSurname(book.author);
                    const { classPart, cutterPart } = formatSpineCallNumber(book.call, book.year);
                    const isHovered = hoveredBook?.id === book.id;
                    const isThickBook = width >= 54;

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
                            ? `translateY(-26px) scale(1.025)`
                            : `rotate(${tilt}deg)`,
                          transformOrigin: 'bottom center',
                        }}
                        className={`relative rounded-t-sm cursor-pointer transition-all duration-200 group/spine flex flex-col justify-between overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.5)] hover:shadow-[0_24px_34px_rgba(0,0,0,0.7)] ${
                          book.out ? 'opacity-95' : 'opacity-100'
                        }`}
                      >
                        {/* 1. Top Headband (Woven textile binding peeking at head of book) */}
                        <div
                          className="absolute top-0 left-1 right-1 h-1 z-30 pointer-events-none rounded-t-xs opacity-90"
                          style={{
                            background:
                              'repeating-linear-gradient(90deg, #E8C872 0px, #E8C872 3px, #1F3A2E 3px, #1F3A2E 6px)',
                          }}
                        />

                        {/* 2. Top Gilded / Cream Paper Signature Edge (visible when lifted) */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-b from-[#F5EED9] to-[#DFD3BA] z-25 pointer-events-none transition-opacity duration-200 border-b border-black/40 ${
                            isHovered ? 'opacity-95' : 'opacity-0'
                          }`}
                        />

                        {/* 3. 3D Cylindrical Spine Shading & Highlights */}
                        <div
                          className="absolute inset-0 pointer-events-none z-20"
                          style={{
                            background: `
                              linear-gradient(90deg, 
                                rgba(0,0,0,0.55) 0%, 
                                rgba(255,255,255,0.2) 14%, 
                                rgba(255,255,255,0.03) 40%, 
                                rgba(0,0,0,0.1) 82%, 
                                rgba(0,0,0,0.65) 100%)
                            `,
                          }}
                        />

                        {/* 4. Left & Right Hinge / Joint Grooves */}
                        <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-black/40 z-20 pointer-events-none" />
                        <div className="absolute right-[3px] top-0 bottom-0 w-[1px] bg-black/40 z-20 pointer-events-none" />

                        {/* 5. Base Cloth / Leather Texture */}
                        <div
                          className="absolute inset-0 z-0"
                          style={{
                            backgroundColor: spineColor,
                            backgroundImage: `
                              radial-gradient(circle at 50% 20%, rgba(255,255,255,0.1) 0%, transparent 60%),
                              ${getSpineTexture(book.genre)}
                            `,
                          }}
                        />

                        {/* 6. Top Compartment: Headcap, Raised Gold Fillet & Author */}
                        <div className="relative z-10 w-full pt-2 px-1">
                          {/* Upper Raised Spine Rib */}
                          <div className="w-full flex flex-col gap-0.5 px-0.5 mt-0.5">
                            <div className="h-[2px] bg-[#E8C872] shadow-[0_1px_1px_rgba(0,0,0,0.7)] rounded-xs" />
                            <div className="h-[1px] bg-black/50" />
                          </div>

                          {/* Decorative Archival Fleuron (❖) */}
                          <div className="text-center text-[7.5px] text-[#E8C872] leading-none pt-1 select-none opacity-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                            ❖
                          </div>

                          {/* Author Surname in Embossed Gold Small Caps */}
                          <div className="mt-1 text-center overflow-hidden px-0.5">
                            <span
                              className="font-mono-code font-bold text-[8.5px] sm:text-[9.5px] tracking-wider text-[#FAF5E8] truncate block select-none"
                              style={{
                                textShadow: '0 1px 2px rgba(0,0,0,0.95), 0 0 1px rgba(232,200,114,0.4)',
                              }}
                            >
                              {authorSurname}
                            </span>
                          </div>

                          {/* Secondary Raised Spine Rib */}
                          <div className="w-full flex flex-col gap-0.5 px-0.5 mt-1.5">
                            <div className="h-[2px] bg-[#E8C872] shadow-[0_1px_1px_rgba(0,0,0,0.7)] rounded-xs" />
                            <div className="h-[1px] bg-black/50" />
                          </div>
                        </div>

                        {/* 7. Center Compartment: Stamped Title Typography */}
                        <div className="relative z-10 flex-1 flex items-center justify-center py-2 px-1 overflow-hidden">
                          {isThickBook ? (
                            /* Thick book: Horizontal Stacked Small-Caps Title */
                            <div className="flex flex-col items-center justify-center text-center px-0.5 max-w-full">
                              <span
                                className="font-serif-display font-bold text-[10.5px] sm:text-[11.5px] text-[#FAF5E8] leading-tight line-clamp-4 select-none uppercase tracking-wider"
                                style={{
                                  textShadow: '0 1px 2px rgba(0,0,0,0.95), 0 0 2px rgba(232,200,114,0.3)',
                                  letterSpacing: '0.06em',
                                }}
                              >
                                {book.title}
                              </span>
                            </div>
                          ) : (
                            /* Standard/Slim book: Vertical Top-to-Bottom Title (Western standard orientation) */
                            <div
                              className="flex items-center justify-center h-full max-h-full select-none"
                              style={{
                                maxHeight: `${height - 110}px`,
                              }}
                            >
                              <span
                                className="font-serif-display font-bold text-[11px] sm:text-[12px] text-[#FAF5E8] tracking-wider whitespace-nowrap overflow-hidden select-none text-center"
                                style={{
                                  writingMode: 'vertical-rl',
                                  textOrientation: 'mixed',
                                  textShadow: '0 1px 2px rgba(0,0,0,0.95), 0 0 1px rgba(232,200,114,0.4)',
                                  letterSpacing: '0.05em',
                                }}
                              >
                                {book.title}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 8. Lower Compartment: Raised Spine Ribs & Archival Call Number Label */}
                        <div className="relative z-10 w-full px-1 mb-1.5">
                          {/* Lower Raised Rib */}
                          <div className="w-full flex flex-col gap-0.5 px-0.5 mb-1.5">
                            <div className="h-[2px] bg-[#E8C872] shadow-[0_1px_1px_rgba(0,0,0,0.7)] rounded-xs" />
                            <div className="h-[1px] bg-black/50" />
                          </div>

                          {/* Authentic Library Call Number Paper Sticker */}
                          <div
                            className="mx-0.5 bg-[#FAF5E8] text-[#1C1008] border border-black/35 rounded-xs p-1 shadow-sm text-center"
                            style={{
                              backgroundImage:
                                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, rgba(240,230,210,0.9) 100%)',
                            }}
                          >
                            <div className="font-mono-code font-bold text-[8px] leading-tight tracking-tighter truncate text-[#8C4A3B]">
                              {classPart}
                            </div>
                            <div className="font-mono-code font-bold text-[7.5px] leading-tight tracking-tighter truncate text-[#1C1008]/85">
                              {cutterPart}
                            </div>
                          </div>
                        </div>

                        {/* 9. Silk Ribbon Bookmark (drapes down spine when checked out) */}
                        {book.out && (
                          <div
                            className="absolute top-0 right-1.5 w-3 h-9 z-30 transition-transform pointer-events-none drop-shadow-md"
                            title={
                              overdueState
                                ? 'Overdue Volume!'
                                : dueSoonState
                                ? `Due Soon: ${book.due}`
                                : 'Volume on Active Loan'
                            }
                          >
                            <div
                              className={`w-full h-full ${
                                overdueState
                                  ? 'bg-[#8C4A3B]'
                                  : dueSoonState
                                  ? 'bg-[#E8C872] ring-1 ring-[#D4AF37]'
                                  : 'bg-[#B8923F]'
                              }`}
                              style={{
                                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
                                backgroundImage:
                                  'linear-gradient(90deg, rgba(0,0,0,0.25) 0%, rgba(255,255,255,0.3) 50%, rgba(0,0,0,0.25) 100%)',
                              }}
                            />
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
