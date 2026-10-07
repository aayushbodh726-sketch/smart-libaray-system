import React from 'react';
import { Search, Plus, Download, RotateCcw, Library, LayoutGrid, BookOpen, BarChart3, X, Barcode, Camera, Compass } from 'lucide-react';
import { ViewMode, AvailabilityFilter, SortOption } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedGenre: string;
  setSelectedGenre: (g: string) => void;
  availabilityFilter: AvailabilityFilter;
  setAvailabilityFilter: (a: AvailabilityFilter) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
  genres: string[];
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  onOpenAddModal: () => void;
  onOpenScanner: () => void;
  onExportCsv: () => void;
  onResetCatalog: () => void;
  overdueCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  availabilityFilter,
  setAvailabilityFilter,
  sortOption,
  setSortOption,
  genres,
  viewMode,
  setViewMode,
  onOpenAddModal,
  onOpenScanner,
  onExportCsv,
  onResetCatalog,
  overdueCount,
}) => {
  return (
    <header className="bg-[#1F3A2E] text-[#EFE7D3] pt-7 pb-10 px-4 sm:px-8 relative overflow-hidden shadow-xl border-b-4 border-[#B8923F]">
      {/* Background vintage texture pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#EFE7D3 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top bar with system badges and quick actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#EFE7D3]/15">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B8923F] animate-pulse"></span>
            <span className="font-mono-code text-xs tracking-widest uppercase text-[#B8923F] font-semibold">
              Stackline · St. Jude Campus Library System
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B8923F] hover:bg-[#a88233] text-[#152922] font-semibold text-xs tracking-wide uppercase rounded shadow transition-all hover:scale-105"
              title="Open Camera ISBN Barcode Scanner"
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Scan Barcode</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#152922] hover:bg-[#0f1f1a] text-[#EFE7D3] border border-[#EFE7D3]/20 font-semibold text-xs tracking-wide uppercase rounded transition-colors"
              title="Catalog a new book into the stacks"
            >
              <Plus className="w-3.5 h-3.5 text-[#B8923F]" />
              <span>Catalog Book</span>
            </button>

            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#152922] hover:bg-[#0f1f1a] text-[#EFE7D3] border border-[#EFE7D3]/20 text-xs font-mono-code rounded transition-colors"
              title="Export complete catalog as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#B8923F]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onResetCatalog}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#152922]/70 hover:bg-[#152922] text-[#EFE7D3]/70 hover:text-[#EFE7D3] border border-[#EFE7D3]/10 text-xs font-mono-code rounded transition-colors"
              title="Reset catalog back to original library defaults"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Hero title & description */}
        <div className="mt-6 mb-6">
          <h1 className="font-serif-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#FAF5E8] leading-tight">
            Find your next book, <br className="hidden sm:inline" />
            <span className="text-[#B8923F] italic font-normal">not a search headache.</span>
          </h1>
          <p className="mt-3 text-[#D9D3BE] text-sm sm:text-base max-w-2xl leading-relaxed">
            Browse the visual open shelf or search across titles, authors, and call numbers.
            Every spine indicates live campus circulation status before you pull it from the rack.
          </p>
        </div>

        {/* Search & Filters Command Bar */}
        <div className="bg-[#FBF6E9] text-[#23281F] rounded-xl p-2 sm:p-2.5 shadow-2xl flex flex-col md:flex-row gap-2 border border-[#B8923F]/30">
          {/* Search Input */}
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-[#23281F]/40 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, author, call no., or subject… (press '/' to focus)"
              id="library-search-input"
              className="w-full pl-10 pr-9 py-2.5 bg-transparent border-none text-sm text-[#23281F] placeholder-[#23281F]/45 focus:outline-none focus:ring-0"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 text-[#23281F]/40 hover:text-[#23281F]"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-[#23281F]/10 md:pl-2">
            {/* Genre Filter */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-[#E4D9BE]/60 hover:bg-[#E4D9BE] border border-transparent focus:border-[#B8923F] rounded-lg px-3 py-2 text-xs font-medium text-[#23281F] focus:outline-none cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="">All Subjects ({genres.length})</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as AvailabilityFilter)}
              className="bg-[#E4D9BE]/60 hover:bg-[#E4D9BE] border border-transparent focus:border-[#B8923F] rounded-lg px-3 py-2 text-xs font-medium text-[#23281F] focus:outline-none cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="all">All Copies</option>
              <option value="avail">Available on Shelf</option>
              <option value="out">Currently Checked Out</option>
              <option value="overdue">
                Overdue {overdueCount > 0 ? `(${overdueCount} Alert)` : ''}
              </option>
            </select>

            {/* Sort Options */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-[#E4D9BE]/60 hover:bg-[#E4D9BE] border border-transparent focus:border-[#B8923F] rounded-lg px-3 py-2 text-xs font-medium text-[#23281F] focus:outline-none cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="title">Sort: Title (A-Z)</option>
              <option value="author">Sort: Author</option>
              <option value="call">Sort: Call Number</option>
              <option value="popularity">Sort: Most Borrowed</option>
              <option value="status">Sort: Availability</option>
            </select>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="inline-flex bg-[#152922] p-1 rounded-lg border border-[#EFE7D3]/15">
            <button
              onClick={() => setViewMode('shelf')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-code rounded transition-all ${
                viewMode === 'shelf'
                  ? 'bg-[#B8923F] text-[#152922] font-semibold shadow'
                  : 'text-[#EFE7D3]/80 hover:text-[#EFE7D3]'
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>Open Shelf</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-code rounded transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#B8923F] text-[#152922] font-semibold shadow'
                  : 'text-[#EFE7D3]/80 hover:text-[#EFE7D3]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Catalog Cards</span>
            </button>

            <button
              onClick={() => setViewMode('circulation')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-code rounded transition-all relative ${
                viewMode === 'circulation'
                  ? 'bg-[#B8923F] text-[#152922] font-semibold shadow'
                  : 'text-[#EFE7D3]/80 hover:text-[#EFE7D3]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Circulation Ledger</span>
              {overdueCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#8C4A3B] ml-1"></span>
              )}
            </button>

            <button
              onClick={() => setViewMode('analytics')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-code rounded transition-all ${
                viewMode === 'analytics'
                  ? 'bg-[#B8923F] text-[#152922] font-semibold shadow'
                  : 'text-[#EFE7D3]/80 hover:text-[#EFE7D3]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-code rounded transition-all ${
                viewMode === 'map'
                  ? 'bg-[#B8923F] text-[#152922] font-semibold shadow'
                  : 'text-[#EFE7D3]/80 hover:text-[#EFE7D3]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Floor Map</span>
            </button>
          </div>

          <div className="font-mono-code text-xs text-[#EFE7D3]/60">
            Press <kbd className="px-1.5 py-0.5 bg-[#152922] rounded border border-[#EFE7D3]/20 text-[#B8923F]">/</kbd> to search anytime
          </div>
        </div>
      </div>
    </header>
  );
};
