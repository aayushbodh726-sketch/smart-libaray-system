import React from 'react';
import { Book } from '../types';
import { GENRE_COLORS } from '../data/initialBooks';
import { isOverdue, isDueSoon, getDaysRemainingText } from '../utils/libraryUtils';
import { BookCover3D } from './BookCover3D';
import { BookOpen, User, Calendar, MapPin, ArrowRight, Hourglass, Users, Sparkles, BookMarked } from 'lucide-react';

interface CatalogGridViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onQuickToggle: (book: Book, e: React.MouseEvent) => void;
}

export const CatalogGridView: React.FC<CatalogGridViewProps> = ({
  books,
  onSelectBook,
  onQuickToggle,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {books.map((book) => {
        const overdueState = isOverdue(book);
        const dueSoonState = isDueSoon(book, 3);
        const remaining = getDaysRemainingText(book);
        const genreColor = GENRE_COLORS[book.genre] || '#2E4A62';

        return (
          <div
            key={book.id}
            onClick={() => onSelectBook(book)}
            className="bg-[#FBF6E9] border-2 border-[#23281F]/15 hover:border-[#B8923F] rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col sm:flex-row gap-5 justify-between group"
          >
            {/* Left: 3D Hardcover Book Showcase */}
            <div className="shrink-0 flex justify-center sm:justify-start items-center">
              <BookCover3D book={book} size="md" interactive={true} />
            </div>

            {/* Right: Archival Catalog Information */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                {/* Top Meta row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-[#23281F]/70 font-mono-code">
                    <span
                      className="font-semibold text-white px-2 py-0.5 rounded text-[11px]"
                      style={{ backgroundColor: genreColor }}
                    >
                      {book.genre}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{book.year ? `Pub. ${book.year}` : ''}</span>
                    {book.pages && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{book.pages}p</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {book.waitlist && book.waitlist.length > 0 && (
                      <span className="font-mono-code text-[11px] text-[#754C24] bg-[#B8923F]/20 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                        <Users className="w-3 h-3 text-[#B8923F]" />
                        <span>{book.waitlist.length}</span>
                      </span>
                    )}
                    <span className="font-mono-code text-xs text-[#8C4A3B] bg-[#8C4A3B]/10 px-2 py-0.5 rounded border border-[#8C4A3B]/20 font-bold">
                      {book.call}
                    </span>
                  </div>
                </div>

                {/* Title & Author */}
                <h3 className="font-serif-display font-bold text-lg text-[#1F3A2E] group-hover:text-[#B8923F] transition-colors line-clamp-2 leading-snug">
                  {book.title}
                </h3>
                <p className="text-xs text-[#23281F]/75 mt-0.5 line-clamp-1">
                  by <span className="font-semibold text-[#1F3A2E]">{book.author}</span>
                </p>

                {/* Description snippet */}
                {book.description && (
                  <p className="text-xs text-[#23281F]/65 mt-2 line-clamp-2 leading-relaxed">
                    {book.description}
                  </p>
                )}

                {/* Shelf location & patron details */}
                <div className="mt-3 pt-2.5 border-t border-[#23281F]/10 space-y-1.5 text-xs text-[#23281F]/75">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#8C4A3B] shrink-0" />
                    <span className="font-mono-code text-[11px] truncate">
                      {book.shelfLocation || 'Main Stacks'}
                    </span>
                  </div>

                  {book.out && book.borrower && (
                    <div className="flex items-center gap-1.5 text-xs truncate">
                      <User className="w-3.5 h-3.5 text-[#23281F]/40 shrink-0" />
                      <span className="truncate">Patron: {book.borrower}</span>
                    </div>
                  )}

                  {book.out && (
                    <div className="flex items-center gap-1.5 font-mono-code text-xs">
                      <Calendar className="w-3.5 h-3.5 text-[#23281F]/40 shrink-0" />
                      <span
                        className={
                          overdueState
                            ? 'text-[#8C4A3B] font-bold'
                            : dueSoonState
                            ? 'text-[#B8923F] font-bold'
                            : 'text-[#754C24]'
                        }
                      >
                        Due: {book.due} ({remaining.text})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-[#23281F]/10 flex items-center justify-between gap-2">
                {book.out ? (
                  <span
                    className={`text-xs font-mono-code font-bold px-2 py-0.5 rounded ${
                      overdueState
                        ? 'bg-[#8C4A3B]/15 text-[#8C4A3B] border border-[#8C4A3B]/30'
                        : dueSoonState
                        ? 'bg-[#FFF2D1] text-[#7A5A1B] border border-[#D4AF37]'
                        : 'bg-[#B8923F]/20 text-[#754C24]'
                    }`}
                  >
                    {overdueState ? '● OVERDUE' : dueSoonState ? '⏳ DUE SOON' : '● CHECKED OUT'}
                  </span>
                ) : (
                  <span className="text-xs font-mono-code font-bold px-2 py-0.5 rounded bg-[#4C7A5D]/15 text-[#4C7A5D]">
                    ● ON SHELF
                  </span>
                )}

                <button
                  onClick={(e) => onQuickToggle(book, e)}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    book.out
                      ? 'bg-[#8C4A3B] hover:bg-[#723a2d] text-white'
                      : 'bg-[#1F3A2E] hover:bg-[#152922] text-[#EFE7D3]'
                  }`}
                >
                  <span>{book.out ? 'Return' : 'Borrow'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
