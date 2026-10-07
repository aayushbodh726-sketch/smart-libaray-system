import React from 'react';
import { Book } from '../types';
import { GENRE_COLORS } from '../data/initialBooks';
import { isOverdue, getDaysRemainingText } from '../utils/libraryUtils';
import { BookOpen, User, Calendar, MapPin, ArrowRight } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {books.map((book) => {
        const overdueState = isOverdue(book);
        const remaining = getDaysRemainingText(book);
        const genreColor = GENRE_COLORS[book.genre] || '#2E4A62';

        return (
          <div
            key={book.id}
            onClick={() => onSelectBook(book)}
            className="bg-[#FBF6E9] border border-[#23281F]/15 hover:border-[#B8923F] rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Top Meta row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span
                  className="text-xs font-mono-code font-semibold px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: genreColor }}
                >
                  {book.genre}
                </span>

                <span className="font-mono-code text-xs text-[#8C4A3B] bg-[#8C4A3B]/10 px-2 py-0.5 rounded border border-[#8C4A3B]/20">
                  {book.call}
                </span>
              </div>

              {/* Title & Author */}
              <h3 className="font-serif-display font-bold text-lg text-[#1F3A2E] group-hover:text-[#B8923F] transition-colors line-clamp-2 leading-snug">
                {book.title}
              </h3>
              <p className="text-xs text-[#23281F]/70 mt-1 line-clamp-1">
                by <span className="font-medium text-[#23281F]">{book.author}</span> {book.year ? `(${book.year})` : ''}
              </p>

              {/* Description snippet */}
              {book.description && (
                <p className="text-xs text-[#23281F]/65 mt-2.5 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>
              )}

              {/* Metadata rows */}
              <div className="mt-4 pt-3 border-t border-[#23281F]/10 space-y-1.5 text-xs text-[#23281F]/75">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#23281F]/40" />
                  <span className="font-mono-code text-[11px]">{book.shelfLocation || 'Main Stack'}</span>
                </div>

                {book.out && book.borrower && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <User className="w-3.5 h-3.5 text-[#23281F]/40" />
                    <span className="truncate">Patron: {book.borrower}</span>
                  </div>
                )}

                {book.out && (
                  <div className="flex items-center gap-1.5 font-mono-code text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#23281F]/40" />
                    <span className={overdueState ? 'text-[#8C4A3B] font-bold' : 'text-[#754C24]'}>
                      Due: {book.due} ({remaining.text})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-[#23281F]/10 flex items-center justify-between">
              {book.out ? (
                <span
                  className={`text-xs font-mono-code font-bold px-2 py-0.5 rounded ${
                    overdueState
                      ? 'bg-[#8C4A3B]/15 text-[#8C4A3B] border border-[#8C4A3B]/30'
                      : 'bg-[#B8923F]/20 text-[#754C24]'
                  }`}
                >
                  {overdueState ? '● OVERDUE' : '● CHECKED OUT'}
                </span>
              ) : (
                <span className="text-xs font-mono-code font-bold px-2 py-0.5 rounded bg-[#4C7A5D]/15 text-[#4C7A5D]">
                  ● ON SHELF
                </span>
              )}

              <button
                onClick={(e) => onQuickToggle(book, e)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  book.out
                    ? 'bg-[#8C4A3B] hover:bg-[#723a2d] text-white'
                    : 'bg-[#1F3A2E] hover:bg-[#152922] text-[#EFE7D3]'
                }`}
              >
                <span>{book.out ? 'Return' : 'Borrow'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
