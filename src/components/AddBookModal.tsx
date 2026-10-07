import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { generateCallNumber } from '../utils/libraryUtils';
import { X, Plus, Sparkles, BookPlus } from 'lucide-react';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBook: (bookData: Partial<Book>) => void;
  editingBook?: Book | null;
  genres: string[];
}

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  onSaveBook,
  editingBook,
  genres,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(editingBook?.title || '');
  const [author, setAuthor] = useState(editingBook?.author || '');
  const [genre, setGenre] = useState(editingBook?.genre || genres[0] || 'Computer Science');
  const [call, setCall] = useState(editingBook?.call || '');
  const [shelfLocation, setShelfLocation] = useState(editingBook?.shelfLocation || 'Stack 1A · Shelf 2');
  const [year, setYear] = useState(editingBook?.year ? String(editingBook.year) : '2024');
  const [pages, setPages] = useState(editingBook?.pages ? String(editingBook.pages) : '320');
  const [isbn, setIsbn] = useState(editingBook?.isbn || '');
  const [description, setDescription] = useState(editingBook?.description || '');

  // Auto-suggest call number if empty
  const handleAutoCall = () => {
    const generated = generateCallNumber(genre, author || 'Smith', title || 'Book');
    setCall(generated);
  };

  useEffect(() => {
    if (!call && title && author) {
      handleAutoCall();
    }
  }, [genre, author, title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    onSaveBook({
      title: title.trim(),
      author: author.trim(),
      genre,
      call: call.trim() || generateCallNumber(genre, author, title),
      shelfLocation: shelfLocation.trim(),
      year: year ? parseInt(year, 10) : undefined,
      pages: pages ? parseInt(pages, 10) : undefined,
      isbn: isbn.trim() || undefined,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#151911]/75 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-[#FAF5E8] border border-[#23281F]/20 rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#23281F]/15 mb-4">
          <div className="flex items-center gap-2 text-[#1F3A2E]">
            <BookPlus className="w-5 h-5 text-[#B8923F]" />
            <h3 className="font-serif-display font-bold text-xl">
              {editingBook ? 'Edit Catalog Record' : 'Catalog New Book into Stacks'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#23281F]/40 hover:text-[#23281F] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-mono-code text-[#1F3A2E] font-semibold mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gödel, Escher, Bach: An Eternal Golden Braid"
              className="w-full px-3 py-2 bg-white border border-[#23281F]/20 rounded text-sm focus:outline-none focus:border-[#B8923F]"
            />
          </div>

          <div>
            <label className="block font-mono-code text-[#1F3A2E] font-semibold mb-1">
              Author(s) *
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Douglas Hofstadter"
              className="w-full px-3 py-2 bg-white border border-[#23281F]/20 rounded text-sm focus:outline-none focus:border-[#B8923F]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono-code text-[#1F3A2E] font-semibold mb-1">
                Subject Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#23281F]/20 rounded text-xs focus:outline-none focus:border-[#B8923F]"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-mono-code text-[#1F3A2E] font-semibold">
                  Call Number
                </label>
                <button
                  type="button"
                  onClick={handleAutoCall}
                  className="text-[10px] text-[#B8923F] hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-2.5 h-2.5" /> Auto
                </button>
              </div>
              <input
                type="text"
                value={call}
                onChange={(e) => setCall(e.target.value)}
                placeholder="QA76.6 .H64"
                className="w-full px-3 py-2 bg-white border border-[#23281F]/20 rounded text-xs font-mono-code focus:outline-none focus:border-[#B8923F]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-mono-code text-[#1F3A2E] font-semibold mb-1">
                Shelf Location
              </label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="Stack 2B · Shelf 1"
                className="w-full px-3 py-2 bg-white border border-[#23281F]/20 rounded text-xs font-mono-code focus:outline-none focus:border-[#B8923F]"
              />
            </div>

            <div>
              <label className="block font-mono-code text-[#1F3A2E] font-semibold mb-1">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="1979"
                className="w-full px-3 py-2 bg-white border border-[#23281F]/20 rounded text-xs focus:outline-none focus:border-[#B8923F]"
              />
            </div>

            <div>
              <label className="block font-mono-code text-[#1F3A2E] font-semibold mb-1">
                Pages
              </label>
              <input
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="777"
                className="w-full px-3 py-2 bg-white border border-[#23281F]/20 rounded text-xs focus:outline-none focus:border-[#B8923F]"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono-code text-[#1F3A2E] font-semibold mb-1">
              ISBN (Optional)
            </label>
            <input
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="978-0465026562"
              className="w-full px-3 py-2 bg-white border border-[#23281F]/20 rounded text-xs font-mono-code focus:outline-none focus:border-[#B8923F]"
            />
          </div>

          <div>
            <label className="block font-mono-code text-[#1F3A2E] font-semibold mb-1">
              Abstract / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief summary of the book's core arguments and historical significance..."
              className="w-full px-3 py-2 bg-white border border-[#23281F]/20 rounded text-xs focus:outline-none focus:border-[#B8923F]"
            />
          </div>

          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-3 bg-transparent border border-[#23281F]/20 hover:bg-[#23281F]/5 text-[#23281F] text-xs font-semibold rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 px-4 bg-[#1F3A2E] hover:bg-[#152922] text-[#FAF5E8] text-xs font-semibold rounded shadow transition-colors"
            >
              {editingBook ? 'Save Record Updates' : 'Add Book to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
