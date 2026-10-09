import React from 'react';
import { Book } from '../types';
import { GENRE_COLORS } from '../data/initialBooks';
import { isOverdue, isDueSoon } from '../utils/libraryUtils';

interface BookCover3DProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BookCover3D: React.FC<BookCover3DProps> = ({
  book,
  size = 'md',
  interactive = false,
  className = '',
  onClick,
}) => {
  const baseColor = GENRE_COLORS[book.genre] || '#2E4A62';
  const overdue = isOverdue(book);
  const dueSoon = isDueSoon(book, 3);

  // Dimensions mapped to size
  const sizeMap = {
    sm: {
      width: 110,
      height: 160,
      spineWidth: 16,
      pageEdgeWidth: 14,
      titleSize: 'text-[11px]',
      authorSize: 'text-[9px]',
      ornamentSize: 'text-[8px]',
      padding: 'p-2.5',
    },
    md: {
      width: 140,
      height: 205,
      spineWidth: 20,
      pageEdgeWidth: 18,
      titleSize: 'text-[13px]',
      authorSize: 'text-[10px]',
      ornamentSize: 'text-[10px]',
      padding: 'p-3.5',
    },
    lg: {
      width: 200,
      height: 290,
      spineWidth: 26,
      pageEdgeWidth: 24,
      titleSize: 'text-[16px]',
      authorSize: 'text-[12px]',
      ornamentSize: 'text-[12px]',
      padding: 'p-5',
    },
  };

  const dim = sizeMap[size];

  // Derive primary author display
  const primaryAuthor = book.author.split(',')[0].trim();

  return (
    <div
      onClick={onClick}
      className={`relative select-none perspective-[1000px] shrink-0 ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      style={{
        width: `${dim.width + dim.pageEdgeWidth}px`,
        height: `${dim.height}px`,
      }}
    >
      {/* 3D Book Container with subtle perspective angle */}
      <div
        className={`relative w-full h-full transition-transform duration-300 ease-out origin-left ${
          interactive ? 'group-hover:-rotate-y-6 group-hover:scale-105' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Under-book soft cast shadow */}
        <div
          className="absolute -bottom-3 left-4 right-1 h-5 bg-black/45 blur-md rounded-full pointer-events-none transform -skew-x-12"
          aria-hidden="true"
        />

        {/* 3D Paper Page Block Edge (Right Side) */}
        <div
          className="absolute right-0 top-1 bottom-1 rounded-r-xs overflow-hidden shadow-inner border-y border-black/30 pointer-events-none"
          style={{
            width: `${dim.pageEdgeWidth}px`,
            background: `
              linear-gradient(90deg, #D5C7A9 0%, #F5EED9 35%, #FAF5E8 65%, #DFD3BA 100%),
              repeating-linear-gradient(180deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)
            `,
            transform: `translateX(-2px) translateZ(-4px)`,
          }}
        >
          {/* Subtle horizontal paper layer lines */}
          <div className="w-full h-full opacity-60 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.08)_2px,rgba(0,0,0,0.08)_3px)]" />
        </div>

        {/* 3D Bottom Page Edge (Visible at bottom perspective) */}
        <div
          className="absolute bottom-0 left-4 right-4 h-2 rounded-b-xs pointer-events-none opacity-80"
          style={{
            background: 'linear-gradient(180deg, #D5C7A9 0%, #BEB092 100%)',
            transform: 'translateY(1px) translateZ(-2px)',
          }}
        />

        {/* Book Hardcover Front Face */}
        <div
          className={`relative rounded-sm overflow-hidden flex flex-col justify-between ${dim.padding} shadow-[0_8px_20px_rgba(0,0,0,0.4)] border border-black/30`}
          style={{
            width: `${dim.width}px`,
            height: `${dim.height}px`,
            backgroundColor: baseColor,
            backgroundImage: `
              radial-gradient(circle at 75% 25%, rgba(255,255,255,0.12) 0%, transparent 60%),
              radial-gradient(circle at 25% 75%, rgba(0,0,0,0.2) 0%, transparent 60%),
              repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px),
              repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)
            `,
          }}
        >
          {/* Spine Hinge / Joint Groove on Left Edge */}
          <div
            className="absolute left-0 top-0 bottom-0 pointer-events-none z-20"
            style={{
              width: `${dim.spineWidth}px`,
              background: `
                linear-gradient(90deg, 
                  rgba(0,0,0,0.45) 0%, 
                  rgba(255,255,255,0.2) 25%, 
                  rgba(0,0,0,0.3) 70%, 
                  rgba(0,0,0,0.5) 90%, 
                  rgba(255,255,255,0.15) 100%)
              `,
              borderRight: '1px solid rgba(0,0,0,0.4)',
            }}
          />

          {/* Book Spine Crease Line */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-20"
            style={{
              left: `${dim.spineWidth + 2}px`,
              width: '2px',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(255,255,255,0.15) 50%, rgba(0,0,0,0.5) 100%)',
            }}
          />

          {/* Decorative Gilded Border Frame */}
          <div
            className="absolute pointer-events-none rounded-xs border border-[#E8C872]/85 shadow-[inset_0_0_8px_rgba(0,0,0,0.4)]"
            style={{
              left: `${dim.spineWidth + 6}px`,
              right: '6px',
              top: '6px',
              bottom: '6px',
            }}
          >
            {/* Inner secondary gold hairline frame */}
            <div className="absolute inset-1 border border-[#E8C872]/50 pointer-events-none" />

            {/* Corner Fleurons (Gold leaf corners) */}
            <span className="absolute top-0.5 left-0.5 text-[8px] text-[#E8C872] leading-none select-none">❖</span>
            <span className="absolute top-0.5 right-0.5 text-[8px] text-[#E8C872] leading-none select-none">❖</span>
            <span className="absolute bottom-0.5 left-0.5 text-[8px] text-[#E8C872] leading-none select-none">❖</span>
            <span className="absolute bottom-0.5 right-0.5 text-[8px] text-[#E8C872] leading-none select-none">❖</span>
          </div>

          {/* Book Header: Genre Tag & Call Class */}
          <div
            className="relative z-10 flex items-center justify-between gap-1 overflow-hidden"
            style={{ paddingLeft: `${dim.spineWidth + 4}px` }}
          >
            <span className="font-mono-code text-[8px] uppercase tracking-wider text-[#FAF5E8]/80 font-bold truncate">
              {book.genre}
            </span>
            <span className="font-mono-code text-[7.5px] text-[#E8C872] font-semibold tracking-tighter shrink-0">
              {book.call.split(' ')[0]}
            </span>
          </div>

          {/* Book Center: Gilded Stamped Title & Author */}
          <div
            className="relative z-10 flex flex-col justify-center items-center text-center my-auto px-1 py-2"
            style={{ paddingLeft: `${dim.spineWidth + 4}px` }}
          >
            {/* Top Ornamental Emblem */}
            <div className={`text-[#E8C872] select-none mb-1 opacity-90 ${dim.ornamentSize}`}>
              ✦ ❖ ✦
            </div>

            {/* Title */}
            <h4
              className={`font-serif-display font-bold text-[#FAF5E8] leading-tight select-none line-clamp-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] tracking-wide ${dim.titleSize}`}
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.85), 0 0 1px rgba(232,200,114,0.4)',
              }}
            >
              {book.title}
            </h4>

            {/* Subtle Divider Rule */}
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#E8C872] to-transparent my-1.5 opacity-80" />

            {/* Author */}
            <p
              className={`font-serif italic text-[#FAF5E8]/90 truncate w-full select-none ${dim.authorSize}`}
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.85)',
              }}
            >
              {primaryAuthor}
            </p>
          </div>

          {/* Book Bottom: Archival Seal & Year */}
          <div
            className="relative z-10 flex items-center justify-between text-[7.5px] font-mono-code text-[#FAF5E8]/70 pt-1"
            style={{ paddingLeft: `${dim.spineWidth + 4}px` }}
          >
            <span className="text-[#E8C872] tracking-widest font-bold">ST. JUDE</span>
            {book.year && <span>{book.year}</span>}
          </div>

          {/* Hanging Silk Ribbon Bookmark (if checked out or due soon) */}
          {book.out && (
            <div
              className="absolute -bottom-5 pointer-events-none z-30 transition-transform"
              style={{
                left: `${dim.spineWidth + 24}px`,
                width: size === 'lg' ? '18px' : '14px',
                height: size === 'lg' ? '32px' : '26px',
              }}
              title={overdue ? 'Overdue' : dueSoon ? 'Due Soon' : 'Checked Out'}
            >
              <div
                className={`w-full h-full shadow-lg border-t-2 border-black/30 ${
                  overdue
                    ? 'bg-[#8C4A3B]'
                    : dueSoon
                    ? 'bg-[#E8C872]'
                    : 'bg-[#B8923F]'
                }`}
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)',
                  backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.3) 50%, rgba(0,0,0,0.2) 100%)',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
