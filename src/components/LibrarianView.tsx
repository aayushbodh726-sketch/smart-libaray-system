import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { GENRE_COLORS } from '../data/initialBooks';
import { generateCallNumber } from '../utils/libraryUtils';
import { generateBarcodeBars } from '../utils/barcodeGenerator';
import { BookCover3D } from './BookCover3D';
import { SpineLabelModal } from './SpineLabelModal';
import {
  BookPlus, Sparkles, Package, Library, CheckCircle2,
  Tag, MapPin, Printer, Edit, Trash2, ArrowRight,
  BookOpen, Plus, Clock, Search, Layers, Box, Check, RefreshCw
} from 'lucide-react';

interface LibrarianViewProps {
  books: Book[];
  onAddBook: (bookData: Partial<Book>) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (bookId: number) => void;
  onSelectBook: (book: Book) => void;
  onToggleNewArrival: (bookId: number) => void;
  genres: string[];
}

// Pre-packaged recent shipments for 1-click intake
const PRESET_SHIPMENTS: {
  id: string;
  name: string;
  supplier: string;
  batchCode: string;
  date: string;
  books: Omit<Book, 'id' | 'out' | 'timesBorrowed'>[];
}[] = [
  {
    id: 'ship-1',
    name: 'Fall 2026 Computing & AI Influx',
    supplier: 'MIT & Academic Press Direct',
    batchCode: 'SHIP-CS-2026-09',
    date: 'Oct 12, 2026',
    books: [
      {
        title: 'Chip War: The Fight for the World\'s Most Critical Technology',
        author: 'Chris Miller',
        genre: 'Computer Science',
        call: 'HD9696.S42 M55',
        isbn: '978-1982172008',
        year: 2022,
        pages: 464,
        shelfLocation: 'Stack 3A · Shelf 1',
        description: 'An economic and geopolitical thriller exploring how semiconductors became the rare new oil of the modern world.',
        isNewArrival: true,
        acquiredDate: '2026-10-12',
        condition: 'Mint / Brand New',
        supplier: 'MIT & Academic Press Direct',
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        genre: 'Computer Science',
        call: 'QA76.9.D3 K54',
        isbn: '978-1449373320',
        year: 2017,
        pages: 616,
        shelfLocation: 'Stack 3A · Shelf 2',
        description: 'The definitive architectural guide to distributed data systems, replication, partitioning, transactions, and stream processing.',
        isNewArrival: true,
        acquiredDate: '2026-10-12',
        condition: 'Mint / Brand New',
        supplier: 'MIT & Academic Press Direct',
      },
      {
        title: 'The Master Algorithm',
        author: 'Pedro Domingos',
        genre: 'Computer Science',
        call: 'Q325.5 .D66',
        isbn: '978-0465065707',
        year: 2015,
        pages: 352,
        shelfLocation: 'Stack 3B · Shelf 4',
        description: 'How the quest for the ultimate learning machine will remake our world, uniting the five tribes of machine learning.',
        isNewArrival: true,
        acquiredDate: '2026-10-12',
        condition: 'Mint / Brand New',
        supplier: 'MIT & Academic Press Direct',
      },
    ],
  },
  {
    id: 'ship-2',
    name: 'Contemporary Literary Acquisitions',
    supplier: 'Penguin Random House Institutional',
    batchCode: 'SHIP-LIT-2026-10',
    date: 'Oct 10, 2026',
    books: [
      {
        title: 'Tomorrow, and Tomorrow, and Tomorrow',
        author: 'Gabrielle Zevin',
        genre: 'Literature',
        call: 'PS3626.E95 T66',
        isbn: '978-0593321201',
        year: 2022,
        pages: 416,
        shelfLocation: 'Stack 1B · Shelf 3',
        description: 'A dazzling multi-decade novel about identity, creativity, friendship, and video games in late-twentieth century Cambridge and California.',
        isNewArrival: true,
        acquiredDate: '2026-10-10',
        condition: 'Mint / Brand New',
        supplier: 'Penguin Random House Institutional',
      },
      {
        title: 'Klara and the Sun',
        author: 'Kazuo Ishiguro',
        genre: 'Literature',
        call: 'PR6059.S5 K53',
        isbn: '978-0593318171',
        year: 2021,
        pages: 320,
        shelfLocation: 'Stack 1B · Shelf 4',
        description: 'Nobel laureate Ishiguro explores love, artificial intelligence, and what it truly means to be human through the eyes of an Artificial Friend.',
        isNewArrival: true,
        acquiredDate: '2026-10-10',
        condition: 'Mint / Brand New',
        supplier: 'Penguin Random House Institutional',
      },
      {
        title: 'Piranesi',
        author: 'Susanna Clarke',
        genre: 'Fiction',
        call: 'PR6103.L37 P57',
        isbn: '978-1635575637',
        year: 2020,
        pages: 272,
        shelfLocation: 'Stack 1A · Shelf 2',
        description: 'An intoxicating labyrinth of endless halls lined with thousands of statues and bounded by an ocean that washes through the lower chambers.',
        isNewArrival: true,
        acquiredDate: '2026-10-10',
        condition: 'Mint / Brand New',
        supplier: 'Penguin Random House Institutional',
      },
    ],
  },
  {
    id: 'ship-3',
    name: 'Scientific Horizons & Natural World',
    supplier: 'Oxford University Press Intake',
    batchCode: 'SHIP-SCI-2026-08',
    date: 'Oct 08, 2026',
    books: [
      {
        title: 'The Order of Time',
        author: 'Carlo Rovelli',
        genre: 'Physics',
        call: 'QC173.59.S65 R68',
        isbn: '978-0735216105',
        year: 2018,
        pages: 256,
        shelfLocation: 'Stack 2A · Shelf 2',
        description: 'A poetic philosophical meditation on modern theoretical physics, quantum gravity, entropy, and the dissolution of time as a universal constant.',
        isNewArrival: true,
        acquiredDate: '2026-10-08',
        condition: 'Mint / Brand New',
        supplier: 'Oxford University Press Intake',
      },
      {
        title: 'An Immense World: Animal Senses & Realms',
        author: 'Ed Yong',
        genre: 'Biology',
        call: 'QP431 .Y66',
        isbn: '978-0593133231',
        year: 2022,
        pages: 464,
        shelfLocation: 'Stack 2C · Shelf 1',
        description: 'Pulitzer Prize winner Ed Yong illuminates the breathtaking sensory bubbles (Umwelten) through which non-human creatures experience existence.',
        isNewArrival: true,
        acquiredDate: '2026-10-08',
        condition: 'Mint / Brand New',
        supplier: 'Oxford University Press Intake',
      },
    ],
  },
];

export const LibrarianView: React.FC<LibrarianViewProps> = ({
  books,
  onAddBook,
  onEditBook,
  onDeleteBook,
  onSelectBook,
  onToggleNewArrival,
  genres,
}) => {
  const [activeTab, setActiveTab] = useState<'intake' | 'shipments' | 'recent'>('intake');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedLabelBook, setSelectedLabelBook] = useState<Book | null>(null);

  // Form State for Single Book Ingestion
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState(genres[0] || 'Computer Science');
  const [customGenre, setCustomGenre] = useState('');
  const [call, setCall] = useState('');
  const [shelfLocation, setShelfLocation] = useState('Stack 1A · Shelf 1');
  const [year, setYear] = useState('2024');
  const [pages, setPages] = useState('320');
  const [isbn, setIsbn] = useState('');
  const [condition, setCondition] = useState<'Mint / Brand New' | 'Near Mint' | 'Good' | 'Archival / Rare'>('Mint / Brand New');
  const [supplier, setSupplier] = useState('University Bookstore Intake');
  const [description, setDescription] = useState('');
  const [isNewArrival, setIsNewArrival] = useState(true);

  // Auto-generate Call Number
  const handleAutoCall = () => {
    const effectiveGenre = genre === '__custom__' ? (customGenre || 'General') : genre;
    const generated = generateCallNumber(effectiveGenre, author || 'Smith', title || 'Book');
    setCall(generated);
  };

  // Auto-generate ISBN
  const handleAutoIsbn = () => {
    const randomSuffix = Math.floor(100000000 + Math.random() * 900000000);
    setIsbn(`978-0${randomSuffix.toString().slice(0, 3)}-${randomSuffix.toString().slice(3, 8)}-${Math.floor(Math.random() * 9)}`);
  };

  // Submit Single Ingestion
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const effectiveGenre = genre === '__custom__' ? (customGenre.trim() || 'General') : genre;
    const effectiveCall = call.trim() || generateCallNumber(effectiveGenre, author, title);

    onAddBook({
      title: title.trim(),
      author: author.trim(),
      genre: effectiveGenre,
      call: effectiveCall,
      shelfLocation: shelfLocation.trim(),
      year: year ? parseInt(year, 10) : undefined,
      pages: pages ? parseInt(pages, 10) : undefined,
      isbn: isbn.trim() || undefined,
      condition,
      supplier: supplier.trim(),
      description: description.trim() || undefined,
      isNewArrival,
      acquiredDate: new Date().toISOString().split('T')[0],
      out: false,
      timesBorrowed: 0,
    });

    // Reset fields
    setTitle('');
    setAuthor('');
    setCall('');
    setDescription('');
    setIsbn('');
  };

  // Filter books that are recent arrivals
  const recentArrivals = useMemo(() => {
    return books.filter((b) => b.isNewArrival || b.acquiredDate);
  }, [books]);

  // Unique shelves for stats
  const uniqueShelves = useMemo(() => {
    return Array.from(new Set(books.map((b) => b.shelfLocation || 'Stack 1A')));
  }, [books]);

  // Temporary mock book for live preview in the intake form
  const previewBook: Book = useMemo(() => {
    const effectiveGenre = genre === '__custom__' ? (customGenre || 'General') : genre;
    return {
      id: 99999,
      title: title.trim() || 'Title of Newly Arrived Book',
      author: author.trim() || 'Author Name',
      genre: effectiveGenre,
      call: call.trim() || 'QA76.6 .N49',
      shelfLocation: shelfLocation || 'Stack 1A · Shelf 1',
      year: year ? parseInt(year, 10) : 2024,
      pages: pages ? parseInt(pages, 10) : 320,
      isbn: isbn || '978-0123456789',
      description: description || 'Volume description summary will appear on the archival catalog record.',
      out: false,
      timesBorrowed: 0,
      isNewArrival: isNewArrival,
      condition: condition,
      supplier: supplier,
      acquiredDate: new Date().toISOString().split('T')[0],
    };
  }, [title, author, genre, customGenre, call, shelfLocation, year, pages, isbn, description, isNewArrival, condition, supplier]);

  // Barcode bars for preview
  const previewBarcodeBars = useMemo(() => {
    return generateBarcodeBars(previewBook.isbn || '978-0000000000', 220);
  }, [previewBook.isbn]);

  return (
    <div className="space-y-6">
      {/* Librarian Station Header Banner */}
      <div className="bg-[#1F3A2E] text-[#FAF5E8] rounded-xl p-5 sm:p-6 border-2 border-[#B8923F]/40 shadow-xl relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#FAF5E8 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B8923F] animate-pulse" />
              <span className="font-mono-code text-xs text-[#E8C872] uppercase tracking-widest font-bold">
                Librarian Desk · Archival Intake & Ingestion
              </span>
            </div>
            <h2 className="font-serif-display font-bold text-2xl sm:text-3xl text-[#FAF5E8] leading-tight">
              Catalog Newly Arrived Books
            </h2>
            <p className="text-xs sm:text-sm text-[#D9D3BE] max-w-2xl mt-1 leading-relaxed">
              Register fresh shipments into campus stacks, classify Dewey / Library of Congress call numbers,
              print physical spine stickers and barcodes, and index new titles for patron discovery.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <div className="bg-[#152922] border border-[#B8923F]/30 px-3 py-2 rounded-lg text-center min-w-[90px]">
              <div className="text-[10px] font-mono-code text-[#E8C872] uppercase">New In Stacks</div>
              <div className="font-serif-display text-xl font-bold text-[#FAF5E8]">
                {recentArrivals.length}
              </div>
            </div>
            <div className="bg-[#152922] border border-[#B8923F]/30 px-3 py-2 rounded-lg text-center min-w-[90px]">
              <div className="text-[10px] font-mono-code text-[#D9D3BE] uppercase">Total Catalog</div>
              <div className="font-serif-display text-xl font-bold text-[#FAF5E8]">
                {books.length}
              </div>
            </div>
            <div className="bg-[#152922] border border-[#B8923F]/30 px-3 py-2 rounded-lg text-center min-w-[90px]">
              <div className="text-[10px] font-mono-code text-[#D9D3BE] uppercase">Stack Aisle Sections</div>
              <div className="font-serif-display text-xl font-bold text-[#FAF5E8]">
                {uniqueShelves.length}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="mt-5 pt-4 border-t border-[#FAF5E8]/15 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('intake')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono-code font-bold transition-all ${
              activeTab === 'intake'
                ? 'bg-[#B8923F] text-[#152922] shadow'
                : 'bg-[#152922]/80 text-[#FAF5E8]/80 hover:text-[#FAF5E8] hover:bg-[#152922]'
            }`}
          >
            <BookPlus className="w-3.5 h-3.5" />
            <span>Catalog New Book (Form)</span>
          </button>

          <button
            onClick={() => setActiveTab('shipments')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono-code font-bold transition-all ${
              activeTab === 'shipments'
                ? 'bg-[#B8923F] text-[#152922] shadow'
                : 'bg-[#152922]/80 text-[#FAF5E8]/80 hover:text-[#FAF5E8] hover:bg-[#152922]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Pre-Packaged Shipments (Rapid Influx)</span>
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono-code font-bold transition-all ${
              activeTab === 'recent'
                ? 'bg-[#B8923F] text-[#152922] shadow'
                : 'bg-[#152922]/80 text-[#FAF5E8]/80 hover:text-[#FAF5E8] hover:bg-[#152922]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recent Arrivals Registry ({recentArrivals.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Live Cataloging Workstation */}
      {activeTab === 'intake' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Comprehensive Intake Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#FBF6E9] border border-[#23281F]/20 rounded-xl p-5 sm:p-6 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-[#23281F]/15 mb-4">
              <div className="flex items-center gap-2 text-[#1F3A2E]">
                <BookPlus className="w-5 h-5 text-[#B8923F]" />
                <h3 className="font-serif-display font-bold text-lg">
                  Archival Intake Form · Catalog into Campus Stacks
                </h3>
              </div>
              <span className="font-mono-code text-[11px] text-[#23281F]/50">
                Fields marked * are required
              </span>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Book Title */}
              <div>
                <label className="block font-mono-code text-[#1F3A2E] font-bold mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Man's Search for Meaning"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#23281F]/25 rounded-lg text-sm text-[#1F3A2E] font-medium focus:outline-none focus:border-[#B8923F] focus:ring-1 focus:ring-[#B8923F]"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block font-mono-code text-[#1F3A2E] font-bold mb-1">
                  Author(s) *
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Viktor E. Frankl"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#23281F]/25 rounded-lg text-sm text-[#1F3A2E] font-medium focus:outline-none focus:border-[#B8923F] focus:ring-1 focus:ring-[#B8923F]"
                />
              </div>

              {/* Subject Genre & Call Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-mono-code text-[#1F3A2E] font-bold mb-1">
                    Subject Classification *
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#23281F]/25 rounded-lg text-xs text-[#1F3A2E] focus:outline-none focus:border-[#B8923F]"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                    <option value="__custom__">+ Enter Custom Genre...</option>
                  </select>
                  {genre === '__custom__' && (
                    <input
                      type="text"
                      placeholder="Enter new subject name..."
                      value={customGenre}
                      onChange={(e) => setCustomGenre(e.target.value)}
                      className="mt-1.5 w-full px-3 py-1.5 bg-white border border-[#B8923F] rounded text-xs"
                    />
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-mono-code text-[#1F3A2E] font-bold">
                      Call Number (LC / Dewey) *
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoCall}
                      className="text-[10px] text-[#754C24] hover:text-[#1F3A2E] hover:underline flex items-center gap-1 font-mono-code font-bold"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-[#B8923F]" /> Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={call}
                    onChange={(e) => setCall(e.target.value)}
                    placeholder="BF109.F7 A3"
                    className="w-full px-3 py-2 bg-white border border-[#23281F]/25 rounded-lg text-xs font-mono-code text-[#8C4A3B] font-bold focus:outline-none focus:border-[#B8923F]"
                  />
                </div>
              </div>

              {/* Shelf Location, Year, Pages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono-code text-[#1F3A2E] font-bold mb-1">
                    Shelf Location
                  </label>
                  <input
                    type="text"
                    value={shelfLocation}
                    onChange={(e) => setShelfLocation(e.target.value)}
                    placeholder="Stack 5A · Shelf 1"
                    className="w-full px-3 py-2 bg-white border border-[#23281F]/25 rounded text-xs font-mono-code focus:outline-none focus:border-[#B8923F]"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-[#1F3A2E] font-bold mb-1">
                    Publication Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="1946"
                    className="w-full px-3 py-2 bg-white border border-[#23281F]/25 rounded text-xs focus:outline-none focus:border-[#B8923F]"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-[#1F3A2E] font-bold mb-1">
                    Volume Extent (Pages)
                  </label>
                  <input
                    type="number"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    placeholder="165"
                    className="w-full px-3 py-2 bg-white border border-[#23281F]/25 rounded text-xs focus:outline-none focus:border-[#B8923F]"
                  />
                </div>
              </div>

              {/* ISBN, Condition, Influx Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-mono-code text-[#1F3A2E] font-bold">
                      Standard ISBN
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoIsbn}
                      className="text-[10px] text-[#754C24] hover:underline"
                    >
                      Gen ISBN
                    </button>
                  </div>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-0807014295"
                    className="w-full px-3 py-2 bg-white border border-[#23281F]/25 rounded text-xs font-mono-code focus:outline-none focus:border-[#B8923F]"
                  />
                </div>

                <div>
                  <label className="block font-mono-code text-[#1F3A2E] font-bold mb-1">
                    Physical Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#23281F]/25 rounded text-xs focus:outline-none focus:border-[#B8923F]"
                  >
                    <option value="Mint / Brand New">Mint / Brand New</option>
                    <option value="Near Mint">Near Mint</option>
                    <option value="Good">Good</option>
                    <option value="Archival / Rare">Archival / Rare</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono-code text-[#1F3A2E] font-bold mb-1">
                    Supplier / Batch
                  </label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Fall 2026 Campus Inflow"
                    className="w-full px-3 py-2 bg-white border border-[#23281F]/25 rounded text-xs focus:outline-none focus:border-[#B8923F]"
                  />
                </div>
              </div>

              {/* Archival Abstract / Description */}
              <div>
                <label className="block font-mono-code text-[#1F3A2E] font-bold mb-1">
                  Archival Abstract / Summary
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Chronicles life in Nazi concentration camps and introduces logotherapy—finding purpose through suffering and responsibility."
                  className="w-full px-3.5 py-2 bg-white border border-[#23281F]/25 rounded-lg text-xs leading-relaxed focus:outline-none focus:border-[#B8923F]"
                />
              </div>

              {/* Checkbox: Mark as New Arrival */}
              <div className="bg-[#FAF4E6] p-3 rounded-lg border border-[#B8923F]/30 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="w-4 h-4 text-[#1F3A2E] rounded border-[#23281F]/30 focus:ring-[#B8923F]"
                  />
                  <div>
                    <div className="font-mono-code font-bold text-xs text-[#1F3A2E] flex items-center gap-1.5">
                      <span>Mark as "Recently Arrived" Volume</span>
                      <span className="bg-[#E8C872] text-[#152922] text-[9px] px-1.5 py-0.2 rounded font-black">
                        ✦ NEW
                      </span>
                    </div>
                    <div className="text-[11px] text-[#23281F]/60">
                      Displays golden ribbon badge on the shelf and in the catalog index.
                    </div>
                  </div>
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-5 bg-[#1F3A2E] hover:bg-[#152922] text-[#FAF5E8] font-mono-code font-bold text-xs tracking-wider uppercase rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <Plus className="w-4 h-4 text-[#B8923F]" />
                  <span>Catalog Book & Place in Stacks</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Archival Index Card & 3D Hardcover Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#FAF5E8] border-2 border-[#23281F]/20 rounded-xl p-5 shadow-xl sticky top-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#23281F]/15 mb-3">
                <span className="font-mono-code text-xs font-bold text-[#1F3A2E] uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B8923F]" />
                  <span>Live Archival Card Preview</span>
                </span>
                <span className="text-[10px] font-mono-code text-[#4C7A5D] bg-[#4C7A5D]/10 px-2 py-0.5 rounded font-bold">
                  ● Live Preview
                </span>
              </div>

              {/* 3D Book & Header Info */}
              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start pb-4 border-b border-[#23281F]/15">
                <div className="shrink-0">
                  <BookCover3D book={previewBook} size="sm" interactive={false} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="font-mono-code font-bold text-[11px] text-[#8C4A3B] px-1.5 py-0.5 bg-[#8C4A3B]/10 rounded border border-[#8C4A3B]/20">
                      {previewBook.call}
                    </span>
                    <span className="text-[11px] font-mono-code text-[#23281F]/60">
                      Pub. {previewBook.year || 2024}
                    </span>
                    {previewBook.isNewArrival && (
                      <span className="font-mono-code text-[10px] font-black text-[#152922] bg-[#E8C872] px-1.5 py-0.5 rounded border border-[#B8923F]">
                        ✦ NEW ARRIVAL
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif-display font-bold text-lg text-[#1F3A2E] leading-snug line-clamp-2">
                    {previewBook.title}
                  </h4>
                  <p className="font-serif italic text-xs text-[#23281F]/80 mt-0.5">
                    by {previewBook.author}
                  </p>
                  <p className="text-[11px] font-mono-code text-[#754C24] mt-1">
                    Classification: <span className="font-bold text-[#1F3A2E]">{previewBook.genre}</span>
                  </p>
                </div>
              </div>

              {/* Exact Archival Card Details (Matching user's screenshot) */}
              <div className="py-3 space-y-1.5 text-xs font-mono-code border-b border-[#23281F]/15">
                <div className="flex justify-between text-[#23281F]/70">
                  <span>Subject Classification:</span>
                  <span className="font-bold text-[#1F3A2E]">{previewBook.genre}</span>
                </div>
                <div className="flex justify-between text-[#23281F]/70">
                  <span>Shelf Location:</span>
                  <span className="text-[#1F3A2E] font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#8C4A3B]" />
                    {previewBook.shelfLocation}
                  </span>
                </div>
                <div className="flex justify-between text-[#23281F]/70">
                  <span>Standard ISBN:</span>
                  <span className="text-[#1F3A2E]">{previewBook.isbn}</span>
                </div>
                <div className="flex justify-between text-[#23281F]/70">
                  <span>Volume Extent:</span>
                  <span className="text-[#1F3A2E]">{previewBook.pages} pages</span>
                </div>
                <div className="flex justify-between text-[#23281F]/70">
                  <span>Physical Binding:</span>
                  <span className="text-[#4C7A5D] font-bold">{previewBook.condition}</span>
                </div>
              </div>

              {/* Barcode Section (Matching user's screenshot) */}
              <div className="py-3 flex flex-col items-center justify-center bg-white/60 rounded my-2 border border-[#23281F]/10">
                <svg viewBox="0 0 220 32" className="w-48 h-8" preserveAspectRatio="none">
                  {previewBarcodeBars.map((bar, i) => (
                    <rect key={i} x={bar.x} y={0} width={bar.width} height={32} fill="#151911" />
                  ))}
                </svg>
                <div className="font-mono-code text-[10px] text-[#23281F]/80 tracking-widest mt-1">
                  ISBN {previewBook.isbn || 'N/A'} · CALL {previewBook.call}
                </div>
              </div>

              {/* Label Print Action */}
              <button
                type="button"
                onClick={() => setSelectedLabelBook(previewBook)}
                className="w-full py-2 px-3 bg-[#E4D9BE] hover:bg-[#d8cbb0] text-[#1F3A2E] border border-[#23281F]/20 rounded font-mono-code text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-[#B8923F]" />
                <span>Preview & Print Spine / Barcode Sticker</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Pre-Packaged Shipments (Rapid Influx) */}
      {activeTab === 'shipments' && (
        <div className="space-y-6">
          <div className="bg-[#FAF5E8] border border-[#23281F]/20 rounded-xl p-5 shadow-sm">
            <h3 className="font-serif-display font-bold text-xl text-[#1F3A2E] mb-1">
              Curated Recent Influx Shipments
            </h3>
            <p className="text-xs text-[#23281F]/70 font-mono-code">
              Librarians frequently receive publisher shipments. Click to intake individual titles or catalog an entire incoming batch directly into the stacks.
            </p>
          </div>

          <div className="space-y-6">
            {PRESET_SHIPMENTS.map((shipment) => (
              <div
                key={shipment.id}
                className="bg-[#FBF6E9] border-2 border-[#23281F]/15 rounded-xl p-5 shadow-md overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#23281F]/15 mb-4 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#B8923F]" />
                      <h4 className="font-serif-display font-bold text-lg text-[#1F3A2E]">
                        {shipment.name}
                      </h4>
                      <span className="font-mono-code text-[10px] bg-[#1F3A2E] text-[#FAF5E8] px-2 py-0.5 rounded font-bold">
                        {shipment.batchCode}
                      </span>
                    </div>
                    <p className="text-xs text-[#23281F]/70 font-mono-code mt-0.5">
                      Supplier: <span className="font-semibold">{shipment.supplier}</span> · Arrived: {shipment.date}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      shipment.books.forEach((b) => onAddBook(b));
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1F3A2E] hover:bg-[#152922] text-[#FAF5E8] font-mono-code text-xs font-bold rounded-lg shadow transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#B8923F]" />
                    <span>Catalog All {shipment.books.length} Books in Batch</span>
                  </button>
                </div>

                {/* Shipment Books Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shipment.books.map((b, idx) => {
                    const isAlreadyInCatalog = books.some(
                      (existing) => existing.title.toLowerCase() === b.title.toLowerCase()
                    );
                    return (
                      <div
                        key={idx}
                        className="bg-white p-3.5 rounded-lg border border-[#23281F]/15 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono-code text-[10px] font-bold text-[#8C4A3B] bg-[#8C4A3B]/10 px-1.5 py-0.5 rounded border border-[#8C4A3B]/20">
                              {b.call}
                            </span>
                            <span className="font-mono-code text-[9px] bg-[#E8C872] text-[#152922] px-1.5 py-0.5 rounded font-black">
                              ✦ NEW
                            </span>
                          </div>
                          <h5 className="font-serif-display font-bold text-sm text-[#1F3A2E] line-clamp-2 mt-1">
                            {b.title}
                          </h5>
                          <p className="font-serif italic text-xs text-[#23281F]/70 truncate mt-0.5">
                            by {b.author}
                          </p>
                          <p className="text-[11px] text-[#23281F]/60 line-clamp-2 mt-1.5 leading-relaxed">
                            {b.description}
                          </p>
                          <div className="mt-2 text-[10px] font-mono-code text-[#754C24] flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>Target: {b.shelfLocation}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#23281F]/10 flex items-center justify-between">
                          <span className="text-[10px] font-mono-code text-[#23281F]/50">
                            {b.pages}p · {b.year}
                          </span>
                          {isAlreadyInCatalog ? (
                            <span className="text-[11px] font-mono-code text-[#4C7A5D] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Cataloged
                            </span>
                          ) : (
                            <button
                              onClick={() => onAddBook(b)}
                              className="px-2.5 py-1 bg-[#1F3A2E] hover:bg-[#152922] text-[#FAF5E8] text-[11px] font-mono-code font-bold rounded flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3 text-[#B8923F]" />
                              <span>Intake Book</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Recent Arrivals Registry */}
      {activeTab === 'recent' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-[#23281F]/15">
            <div>
              <h3 className="font-serif-display font-bold text-xl text-[#1F3A2E]">
                Recently Arrived Catalog Volumes ({recentArrivals.length})
              </h3>
              <p className="font-mono-code text-xs text-[#23281F]/70">
                Books newly ingested into campus stacks. Review index cards, print physical spine stickers, or mark as shelved.
              </p>
            </div>

            {/* Search filter for new arrivals */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#23281F]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter recent titles..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#23281F]/20 rounded-lg text-xs font-mono-code focus:outline-none focus:border-[#B8923F]"
              />
            </div>
          </div>

          {recentArrivals.length === 0 ? (
            <div className="bg-[#FAF5E8] border-2 border-dashed border-[#23281F]/20 rounded-xl p-12 text-center">
              <Box className="w-10 h-10 text-[#B8923F] mx-auto mb-2 opacity-60" />
              <p className="font-serif-display text-lg font-bold text-[#1F3A2E]">
                No recently arrived titles currently marked
              </p>
              <p className="text-xs font-mono-code text-[#23281F]/60 mt-1">
                Use the "Catalog New Book" form or intake a curated publisher shipment above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentArrivals
                .filter(
                  (b) =>
                    !searchFilter ||
                    b.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    b.author.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    b.call.toLowerCase().includes(searchFilter.toLowerCase())
                )
                .map((book) => (
                  <div
                    key={book.id}
                    onClick={() => onSelectBook(book)}
                    className="bg-[#FAF5E8] border border-[#23281F]/20 hover:border-[#B8923F] rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Bar with Badges */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="font-mono-code font-bold text-xs text-[#8C4A3B] px-1.5 py-0.5 bg-[#8C4A3B]/10 rounded border border-[#8C4A3B]/20">
                          {book.call}
                        </span>
                        <div className="flex items-center gap-1">
                          {book.isNewArrival && (
                            <span className="font-mono-code text-[9.5px] font-black text-[#152922] bg-[#E8C872] px-1.5 py-0.5 rounded border border-[#B8923F]">
                              ✦ NEW
                            </span>
                          )}
                          <span className="font-mono-code text-[10px] text-[#4C7A5D] bg-[#4C7A5D]/10 px-1.5 py-0.5 rounded font-semibold">
                            {book.condition || 'Mint'}
                          </span>
                        </div>
                      </div>

                      {/* Book Preview & Info */}
                      <div className="flex gap-3 items-center my-2">
                        <div className="shrink-0">
                          <BookCover3D book={book} size="sm" interactive={false} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif-display font-bold text-base text-[#1F3A2E] group-hover:text-[#B8923F] transition-colors line-clamp-2 leading-tight">
                            {book.title}
                          </h4>
                          <p className="font-serif italic text-xs text-[#23281F]/70 truncate mt-0.5">
                            by {book.author}
                          </p>
                          <div className="text-[11px] font-mono-code text-[#754C24] flex items-center gap-1 mt-1.5">
                            <MapPin className="w-3 h-3 text-[#8C4A3B] shrink-0" />
                            <span className="truncate">{book.shelfLocation || 'Main Stacks'}</span>
                          </div>
                          {book.acquiredDate && (
                            <div className="text-[10px] font-mono-code text-[#23281F]/50 mt-1">
                              Acquired: {book.acquiredDate}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3 pt-2.5 border-t border-[#23281F]/10 flex items-center justify-between gap-1 text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLabelBook(book);
                        }}
                        className="p-1.5 text-[#1F3A2E] hover:text-[#B8923F] hover:bg-[#23281F]/5 rounded flex items-center gap-1 font-mono-code text-[11px]"
                        title="Print Physical Spine Sticker & Barcode"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#B8923F]" />
                        <span>Labels</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleNewArrival(book.id);
                        }}
                        className="p-1.5 text-[#754C24] hover:underline font-mono-code text-[11px]"
                        title={book.isNewArrival ? 'Mark as Processed / Remove New Tag' : 'Mark as New Arrival'}
                      >
                        {book.isNewArrival ? 'Mark Shelved' : 'Tag as New'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBook(book);
                        }}
                        className="px-2.5 py-1 bg-[#1F3A2E] text-[#FAF5E8] rounded font-mono-code text-[11px] font-bold group-hover:bg-[#152922] transition-colors"
                      >
                        Inspect Card
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Printable Physical Spine & Barcode Sticker Modal */}
      <SpineLabelModal
        book={selectedLabelBook}
        isOpen={Boolean(selectedLabelBook)}
        onClose={() => setSelectedLabelBook(null)}
      />
    </div>
  );
};
