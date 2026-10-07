import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { GENRE_COLORS } from '../data/initialBooks';
import { 
  MapPin, 
  Layers, 
  Navigation, 
  BookOpen, 
  Info, 
  Search, 
  CheckCircle2, 
  Clock, 
  Compass, 
  CornerDownRight, 
  Eye, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LibraryMapProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  targetBookLocation?: string | null;
  onClearTargetBook?: () => void;
}

interface StackZone {
  id: string; // e.g. "Stack 3A"
  floor: 1 | 2;
  name: string;
  wing: string;
  genres: string[];
  callRange: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shelves: number;
}

export const STACK_ZONES: StackZone[] = [
  // FLOOR 1 - Ground Level (Humanities, Computing & Circulation)
  {
    id: 'Stack 3A',
    floor: 1,
    name: 'Computing & Algorithms Stacks',
    wing: 'North Tech Wing',
    genres: ['Computer Science'],
    callRange: 'QA75 - QA76.9',
    x: 60,
    y: 80,
    width: 220,
    height: 100,
    shelves: 4,
  },
  {
    id: 'Stack 1A',
    floor: 1,
    name: 'Literature & Classical Drama',
    wing: 'South Classical Wing',
    genres: ['Literature'],
    callRange: 'PN45 - PR120',
    x: 60,
    y: 310,
    width: 220,
    height: 90,
    shelves: 3,
  },
  {
    id: 'Stack 1B',
    floor: 1,
    name: 'Modern & World Fiction',
    wing: 'South Fiction Wing',
    genres: ['Fiction'],
    callRange: 'PR6000 - PZ10',
    x: 60,
    y: 430,
    width: 220,
    height: 100,
    shelves: 6,
  },

  // FLOOR 2 - Upper Level (Sciences, Economics & Philosophy)
  {
    id: 'Stack 2A',
    floor: 2,
    name: 'Pure Mathematics & Logic',
    wing: 'West Science Gallery',
    genres: ['Mathematics'],
    callRange: 'QA1 - QA184',
    x: 60,
    y: 70,
    width: 200,
    height: 80,
    shelves: 5,
  },
  {
    id: 'Stack 2B',
    floor: 2,
    name: 'Theoretical Physics & Astrophysics',
    wing: 'West Science Gallery',
    genres: ['Physics', 'Astronomy'],
    callRange: 'QB1 - QC99',
    x: 60,
    y: 170,
    width: 200,
    height: 90,
    shelves: 4,
  },
  {
    id: 'Stack 2C',
    floor: 2,
    name: 'Biological Sciences & Genetics',
    wing: 'West Science Gallery',
    genres: ['Biology'],
    callRange: 'QH301 - QR500',
    x: 60,
    y: 280,
    width: 200,
    height: 80,
    shelves: 3,
  },
  {
    id: 'Stack 4A',
    floor: 2,
    name: 'Macroeconomics & Global Markets',
    wing: 'East Social Science Atrium',
    genres: ['Economics'],
    callRange: 'HB1 - HD9999',
    x: 540,
    y: 70,
    width: 200,
    height: 85,
    shelves: 4,
  },
  {
    id: 'Stack 4C',
    floor: 2,
    name: 'World Civilizations & Archaeology',
    wing: 'East Social Science Atrium',
    genres: ['History'],
    callRange: 'CB1 - CC999',
    x: 540,
    y: 180,
    width: 200,
    height: 90,
    shelves: 4,
  },
  {
    id: 'Stack 5A',
    floor: 2,
    name: 'Behavioral Psychology & Cognition',
    wing: 'South Philosophy Sanctuary',
    genres: ['Psychology'],
    callRange: 'BF1 - BJ1500',
    x: 540,
    y: 330,
    width: 200,
    height: 85,
    shelves: 4,
  },
  {
    id: 'Stack 5B',
    floor: 2,
    name: 'Moral Philosophy & Metaphysics',
    wing: 'South Philosophy Sanctuary',
    genres: ['Philosophy'],
    callRange: 'B1 - BD700',
    x: 540,
    y: 440,
    width: 200,
    height: 90,
    shelves: 4,
  },
];

export const LibraryMap: React.FC<LibraryMapProps> = ({
  books,
  onSelectBook,
  targetBookLocation,
  onClearTargetBook,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<1 | 2>(1);
  const [highlightedGenre, setHighlightedGenre] = useState<string | null>(null);
  const [selectedStackId, setSelectedStackId] = useState<string | null>('Stack 3A');
  const [searchBookTerm, setSearchBookTerm] = useState('');

  // Extract stack prefix from string e.g. "Stack 3A · Shelf 2" -> "Stack 3A"
  const extractStackId = (locStr?: string): string => {
    if (!locStr) return 'Stack 1A';
    const match = locStr.match(/Stack\s+[0-9][A-Z]/i);
    return match ? match[0] : locStr.split('·')[0].trim();
  };

  // If a targetBookLocation is passed in, auto-switch to that floor and stack
  React.useEffect(() => {
    if (targetBookLocation) {
      const stackCode = extractStackId(targetBookLocation);
      const zone = STACK_ZONES.find((z) => z.id.toLowerCase() === stackCode.toLowerCase());
      if (zone) {
        setSelectedFloor(zone.floor);
        setSelectedStackId(zone.id);
      }
    }
  }, [targetBookLocation]);

  // When a genre is picked, auto-switch to the floor containing that genre
  const handleSelectGenre = (genre: string | null) => {
    setHighlightedGenre(genre);
    if (!genre) return;

    const matchingZone = STACK_ZONES.find((z) => z.genres.includes(genre));
    if (matchingZone) {
      setSelectedFloor(matchingZone.floor);
      setSelectedStackId(matchingZone.id);
    }
  };

  // Current floor zones
  const floorZones = useMemo(() => {
    return STACK_ZONES.filter((z) => z.floor === selectedFloor);
  }, [selectedFloor]);

  // Selected stack details
  const activeStackZone = useMemo(() => {
    return STACK_ZONES.find((z) => z.id === selectedStackId) || floorZones[0];
  }, [selectedStackId, floorZones]);

  // Books present in active stack
  const stackBooks = useMemo(() => {
    if (!activeStackZone) return [];
    return books.filter((b) => {
      const bookStack = extractStackId(b.shelfLocation);
      return bookStack.toLowerCase() === activeStackZone.id.toLowerCase();
    });
  }, [books, activeStackZone]);

  // All distinct genres available
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    STACK_ZONES.forEach((z) => z.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, []);

  // Quick book search within map
  const matchingBooks = useMemo(() => {
    if (!searchBookTerm.trim()) return [];
    const q = searchBookTerm.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.call.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [books, searchBookTerm]);

  return (
    <div className="space-y-6">
      {/* Top Map Header & Controls */}
      <div className="bg-[#FBF6E9] border border-[#23281F]/15 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#23281F]/15">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1F3A2E] text-[#B8923F] flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-display font-bold text-xl text-[#1F3A2E] leading-tight">
                Interactive Campus Library Floor Plan
              </h2>
              <p className="text-xs text-[#23281F]/65 font-mono-code">
                Visual wayfinding map across Stacks 1A through 5B with live shelf inventory
              </p>
            </div>
          </div>

          {/* Floor Level Selector */}
          <div className="inline-flex bg-[#E4D9BE]/80 p-1 rounded-lg border border-[#23281F]/15 text-xs font-mono-code">
            <button
              onClick={() => setSelectedFloor(1)}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                selectedFloor === 1
                  ? 'bg-[#1F3A2E] text-[#FAF5E8] font-semibold shadow-xs'
                  : 'text-[#23281F]/70 hover:text-[#1F3A2E]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#B8923F]" />
              <span>Floor 1: Main Circulation & Tech</span>
            </button>

            <button
              onClick={() => setSelectedFloor(2)}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                selectedFloor === 2
                  ? 'bg-[#1F3A2E] text-[#FAF5E8] font-semibold shadow-xs'
                  : 'text-[#23281F]/70 hover:text-[#1F3A2E]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#B8923F]" />
              <span>Floor 2: Sciences & Philosophy</span>
            </button>
          </div>
        </div>

        {/* Quick Search & Genre Filter Bar */}
        <div className="pt-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Genre Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
            <span className="text-[11px] font-mono-code text-[#23281F]/50 whitespace-nowrap mr-1">
              Highlight Genre:
            </span>
            <button
              onClick={() => handleSelectGenre(null)}
              className={`px-2.5 py-1 rounded text-xs font-mono-code whitespace-nowrap transition-colors border ${
                highlightedGenre === null
                  ? 'bg-[#1F3A2E] text-[#FAF5E8] border-[#1F3A2E]'
                  : 'bg-white/60 text-[#23281F]/80 border-[#23281F]/15 hover:bg-white'
              }`}
            >
              All Genres
            </button>
            {allGenres.map((genre) => {
              const color = GENRE_COLORS[genre] || '#2E4A62';
              const isSelected = highlightedGenre === genre;
              return (
                <button
                  key={genre}
                  onClick={() => handleSelectGenre(isSelected ? null : genre)}
                  className={`px-2.5 py-1 rounded text-xs font-mono-code whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'text-white font-semibold shadow-xs'
                      : 'bg-white/60 text-[#23281F]/80 border-[#23281F]/15 hover:bg-white'
                  }`}
                  style={{
                    backgroundColor: isSelected ? color : undefined,
                    borderColor: isSelected ? color : undefined,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>{genre}</span>
                </button>
              );
            })}
          </div>

          {/* Book Locator Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-[#23281F]/40 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchBookTerm}
              onChange={(e) => setSearchBookTerm(e.target.value)}
              placeholder="Find book location on map…"
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#23281F]/20 rounded-lg text-xs focus:outline-none focus:border-[#B8923F]"
            />

            {/* Quick search match results dropdown */}
            {matchingBooks.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#23281F]/20 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto">
                {matchingBooks.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      const stackCode = extractStackId(b.shelfLocation);
                      const zone = STACK_ZONES.find(
                        (z) => z.id.toLowerCase() === stackCode.toLowerCase()
                      );
                      if (zone) {
                        setSelectedFloor(zone.floor);
                        setSelectedStackId(zone.id);
                      }
                      setSearchBookTerm('');
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#EFE7D3]/60 border-b border-[#23281F]/10 last:border-b-0"
                  >
                    <div className="font-semibold text-[#1F3A2E] truncate">{b.title}</div>
                    <div className="text-[10px] text-[#23281F]/60 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-[#8C4A3B]" />
                      <span>{b.shelfLocation || 'Main Stack'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Map & Stacks Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Interactive Blueprint Floor Plan */}
        <div className="lg:col-span-8 bg-[#FAF5E8] border border-[#23281F]/20 rounded-xl p-4 shadow-sm overflow-hidden relative">
          {/* Blueprint Header */}
          <div className="flex items-center justify-between text-xs font-mono-code text-[#23281F]/60 pb-3 border-b border-[#23281F]/15 mb-2">
            <span className="font-bold text-[#1F3A2E] uppercase">
              LEVEL {selectedFloor} ARCHITECTURAL BLUEPRINT · {selectedFloor === 1 ? 'GROUND' : 'MEZZANINE'}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#B8923F] animate-pulse" />
                <span>Interactive (Click stack to inspect)</span>
              </span>
            </div>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="w-full overflow-x-auto bg-[#F5EED9]/60 rounded-lg border border-[#23281F]/10 p-2">
            <svg
              viewBox="0 0 800 580"
              className="w-full h-auto min-w-[620px] select-none"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(35, 40, 31, 0.08) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              {/* Outer Building Walls */}
              <rect
                x="20"
                y="20"
                width="760"
                height="540"
                rx="8"
                fill="none"
                stroke="#1F3A2E"
                strokeWidth="4"
              />

              {/* Architectural Wall Dividers */}
              <line
                x1="400"
                y1="20"
                x2="400"
                y2="560"
                stroke="#1F3A2E"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.3"
              />

              {/* Central Rotunda / Atrium on both floors */}
              <circle
                cx="400"
                cy="290"
                r="65"
                fill="#EAE0C8"
                stroke="#B8923F"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
              <text
                x="400"
                y="285"
                textAnchor="middle"
                fontFamily="IBM Plex Mono"
                fontSize="10"
                fontWeight="bold"
                fill="#1F3A2E"
              >
                CENTRAL ATRIUM
              </text>
              <text
                x="400"
                y="300"
                textAnchor="middle"
                fontFamily="IBM Plex Mono"
                fontSize="8"
                fill="#754C24"
              >
                Natural Skylight & Reading Hub
              </text>

              {/* Ground Floor Features (Floor 1) */}
              {selectedFloor === 1 && (
                <>
                  {/* Circulation & Lending Desk */}
                  <rect
                    x="330"
                    y="430"
                    width="140"
                    height="60"
                    rx="4"
                    fill="#1F3A2E"
                    stroke="#B8923F"
                    strokeWidth="2"
                  />
                  <text
                    x="400"
                    y="458"
                    textAnchor="middle"
                    fontFamily="IBM Plex Mono"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#FAF5E8"
                  >
                    CIRCULATION DESK
                  </text>
                  <text
                    x="400"
                    y="474"
                    textAnchor="middle"
                    fontFamily="IBM Plex Mono"
                    fontSize="8"
                    fill="#B8923F"
                  >
                    Librarians · Loans · Check-In
                  </text>

                  {/* Main Entrance at Bottom */}
                  <rect
                    x="360"
                    y="545"
                    width="80"
                    height="18"
                    rx="2"
                    fill="#B8923F"
                  />
                  <text
                    x="400"
                    y="558"
                    textAnchor="middle"
                    fontFamily="IBM Plex Mono"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#152922"
                  >
                    MAIN ENTRANCE
                  </text>

                  {/* Wayfinding line from entrance to active stack */}
                  {activeStackZone && (
                    <path
                      d={`M 400 545 L 400 495 L ${activeStackZone.x + activeStackZone.width / 2} 495 L ${
                        activeStackZone.x + activeStackZone.width / 2
                      } ${activeStackZone.y + activeStackZone.height}`}
                      fill="none"
                      stroke="#8C4A3B"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      className="animate-[dash_1s_linear_infinite]"
                    />
                  )}

                  {/* Digital Lab & Study Area (Right Wing) */}
                  <rect
                    x="500"
                    y="80"
                    width="240"
                    height="170"
                    rx="4"
                    fill="#EFE7D3"
                    stroke="#1F3A2E"
                    strokeWidth="1"
                  />
                  <text
                    x="620"
                    y="110"
                    textAnchor="middle"
                    fontFamily="Fraunces"
                    fontSize="13"
                    fontWeight="bold"
                    fill="#1F3A2E"
                  >
                    Digital Commons & Archives
                  </text>
                  <text
                    x="620"
                    y="130"
                    textAnchor="middle"
                    fontFamily="IBM Plex Mono"
                    fontSize="9"
                    fill="#23281F"
                    opacity="0.6"
                  >
                    Terminals · Microfiche · Scanner Bay
                  </text>

                  {/* Study Pods on Right Bottom */}
                  <rect
                    x="500"
                    y="310"
                    width="240"
                    height="200"
                    rx="4"
                    fill="#EFE7D3"
                    stroke="#1F3A2E"
                    strokeWidth="1"
                  />
                  <text
                    x="620"
                    y="340"
                    textAnchor="middle"
                    fontFamily="Fraunces"
                    fontSize="13"
                    fontWeight="bold"
                    fill="#1F3A2E"
                  >
                    Silent Study Carrels
                  </text>
                  <circle cx="560" cy="400" r="16" fill="#D8CBB0" />
                  <circle cx="680" cy="400" r="16" fill="#D8CBB0" />
                  <circle cx="560" cy="460" r="16" fill="#D8CBB0" />
                  <circle cx="680" cy="460" r="16" fill="#D8CBB0" />
                  <text
                    x="620"
                    y="435"
                    textAnchor="middle"
                    fontFamily="IBM Plex Mono"
                    fontSize="8"
                    fill="#754C24"
                  >
                    Oak Group Tables
                  </text>
                </>
              )}

              {/* Upper Floor Features (Floor 2) */}
              {selectedFloor === 2 && (
                <>
                  {/* Research Fellowship Office */}
                  <rect
                    x="330"
                    y="40"
                    width="140"
                    height="50"
                    rx="4"
                    fill="#EFE7D3"
                    stroke="#1F3A2E"
                    strokeWidth="1"
                  />
                  <text
                    x="400"
                    y="68"
                    textAnchor="middle"
                    fontFamily="IBM Plex Mono"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#1F3A2E"
                  >
                    ARCHIVIST STUDY
                  </text>

                  {/* Grand Staircase from Floor 1 */}
                  <rect
                    x="350"
                    y="470"
                    width="100"
                    height="60"
                    rx="4"
                    fill="#E4D9BE"
                    stroke="#1F3A2E"
                    strokeWidth="1.5"
                  />
                  <text
                    x="400"
                    y="498"
                    textAnchor="middle"
                    fontFamily="IBM Plex Mono"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#1F3A2E"
                  >
                    GRAND STAIRWAY
                  </text>
                  <text
                    x="400"
                    y="514"
                    textAnchor="middle"
                    fontFamily="IBM Plex Mono"
                    fontSize="8"
                    fill="#754C24"
                  >
                    Down to Level 1
                  </text>

                  {/* Wayfinding line from stairs to active stack */}
                  {activeStackZone && (
                    <path
                      d={`M 400 470 L 400 370 L ${activeStackZone.x + activeStackZone.width / 2} 370 L ${
                        activeStackZone.x + activeStackZone.width / 2
                      } ${activeStackZone.y + activeStackZone.height}`}
                      fill="none"
                      stroke="#8C4A3B"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      className="animate-[dash_1s_linear_infinite]"
                    />
                  )}
                </>
              )}

              {/* Render Stack Aisles on the active floor */}
              {floorZones.map((zone) => {
                const isSelected = selectedStackId === zone.id;
                const isGenreMatch =
                  highlightedGenre && zone.genres.includes(highlightedGenre);
                const primaryGenre = zone.genres[0];
                const genreColor = GENRE_COLORS[primaryGenre] || '#2E4A62';

                // Number of books currently on this stack
                const count = books.filter((b) => {
                  const s = extractStackId(b.shelfLocation);
                  return s.toLowerCase() === zone.id.toLowerCase();
                }).length;

                return (
                  <g
                    key={zone.id}
                    onClick={() => setSelectedStackId(zone.id)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing Highlight Aura if selected or genre matches */}
                    {(isSelected || isGenreMatch) && (
                      <rect
                        x={zone.x - 4}
                        y={zone.y - 4}
                        width={zone.width + 8}
                        height={zone.height + 8}
                        rx="8"
                        fill="none"
                        stroke={isGenreMatch ? genreColor : '#B8923F'}
                        strokeWidth="3"
                        className="animate-pulse"
                      />
                    )}

                    {/* Stack Aisle Base Box */}
                    <rect
                      x={zone.x}
                      y={zone.y}
                      width={zone.width}
                      height={zone.height}
                      rx="6"
                      fill={isSelected ? '#F5EED9' : '#FFFFFF'}
                      stroke={isSelected ? '#1F3A2E' : '#23281F'}
                      strokeWidth={isSelected ? '2' : '1'}
                      className="transition-colors group-hover:fill-[#FBF6E9]"
                    />

                    {/* Left Accent Color Strip matching genre */}
                    <rect
                      x={zone.x}
                      y={zone.y}
                      width="10"
                      height={zone.height}
                      rx="2"
                      fill={genreColor}
                    />

                    {/* Shelf Row Dividers (rendering individual shelves visually) */}
                    {Array.from({ length: zone.shelves - 1 }).map((_, i) => (
                      <line
                        key={i}
                        x1={zone.x + 18}
                        y1={zone.y + ((i + 1) * zone.height) / zone.shelves}
                        x2={zone.x + zone.width - 12}
                        y2={zone.y + ((i + 1) * zone.height) / zone.shelves}
                        stroke="#23281F"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        opacity="0.3"
                      />
                    ))}

                    {/* Stack Name & Call Number Label */}
                    <text
                      x={zone.x + 22}
                      y={zone.y + 22}
                      fontFamily="Fraunces"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#1F3A2E"
                    >
                      {zone.id} · {zone.name}
                    </text>

                    <text
                      x={zone.x + 22}
                      y={zone.y + 38}
                      fontFamily="IBM Plex Mono"
                      fontSize="9"
                      fill="#8C4A3B"
                      fontWeight="bold"
                    >
                      LC {zone.callRange}
                    </text>

                    <text
                      x={zone.x + 22}
                      y={zone.y + 54}
                      fontFamily="IBM Plex Mono"
                      fontSize="8"
                      fill="#23281F"
                      opacity="0.7"
                    >
                      {zone.genres.join(', ')} · {zone.shelves} Shelf Tiers
                    </text>

                    {/* Book Count Pill on Stack */}
                    <g
                      transform={`translate(${zone.x + zone.width - 55}, ${
                        zone.y + zone.height - 24
                      })`}
                    >
                      <rect
                        width="46"
                        height="18"
                        rx="4"
                        fill={genreColor}
                      />
                      <text
                        x="23"
                        y="12"
                        textAnchor="middle"
                        fontFamily="IBM Plex Mono"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#FFFFFF"
                      >
                        {count} {count === 1 ? 'bk' : 'bks'}
                      </text>
                    </g>

                    {/* Target Pin Marker if selected */}
                    {isSelected && (
                      <g transform={`translate(${zone.x + zone.width - 24}, ${zone.y + 8})`}>
                        <circle cx="10" cy="10" r="8" fill="#8C4A3B" />
                        <circle cx="10" cy="10" r="3" fill="#FFFFFF" />
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Compass Rose in Corner */}
              <g transform="translate(730, 40)">
                <circle cx="0" cy="0" r="18" fill="#EAE0C8" stroke="#B8923F" strokeWidth="1" />
                <line x1="0" y1="-14" x2="0" y2="14" stroke="#1F3A2E" strokeWidth="1.5" />
                <line x1="-14" y1="0" x2="14" y2="0" stroke="#1F3A2E" strokeWidth="1.5" />
                <polygon points="0,-16 -4,-4 4,-4" fill="#8C4A3B" />
                <text x="0" y="-19" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="8" fontWeight="bold" fill="#8C4A3B">N</text>
              </g>
            </svg>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono-code text-[#23281F]/60">
            <span>St. Jude Academic Library · Department of Stacks & Preservation</span>
            <span>Scale: 1:100 Metric Archival</span>
          </div>
        </div>

        {/* Selected Stack Details & Books Inspector Panel */}
        <div className="lg:col-span-4 space-y-4">
          {activeStackZone ? (
            <div className="bg-[#FBF6E9] border-2 border-[#B8923F] rounded-xl p-5 shadow-md flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#23281F]/15">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-code text-xs font-bold text-[#8C4A3B]">
                        {activeStackZone.id}
                      </span>
                      <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#1F3A2E] text-[#EFE7D3]">
                        Floor {activeStackZone.floor}
                      </span>
                    </div>
                    <h3 className="font-serif-display font-bold text-lg text-[#1F3A2E] leading-snug mt-1">
                      {activeStackZone.name}
                    </h3>
                  </div>
                  <span
                    className="w-3.5 h-3.5 rounded-full mt-1 shrink-0"
                    style={{
                      backgroundColor:
                        GENRE_COLORS[activeStackZone.genres[0]] || '#2E4A62',
                    }}
                  />
                </div>

                {/* Location specs */}
                <div className="py-3 border-b border-[#23281F]/10 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#23281F]/65 font-mono-code">Building Wing:</span>
                    <span className="font-medium text-[#1F3A2E]">{activeStackZone.wing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#23281F]/65 font-mono-code">Classification:</span>
                    <span className="font-mono-code font-bold text-[#8C4A3B]">
                      LC {activeStackZone.callRange}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#23281F]/65 font-mono-code">Primary Subjects:</span>
                    <span className="font-medium text-[#1F3A2E]">
                      {activeStackZone.genres.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Walking Directions */}
                <div className="my-3 bg-[#EFE7D3]/60 p-2.5 rounded border border-[#23281F]/10 text-xs">
                  <div className="font-mono-code text-[10px] text-[#754C24] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <CornerDownRight className="w-3 h-3" />
                    <span>Walking Route from Main Entrance</span>
                  </div>
                  <p className="text-[11px] text-[#23281F]/80 leading-relaxed font-sans">
                    {activeStackZone.floor === 1
                      ? `From Entrance rotunda → proceed directly through Central Atrium → enter ${activeStackZone.wing} on the West side.`
                      : `From Entrance rotunda → take the Grand Staircase up to Level 2 → turn into ${activeStackZone.wing}.`}
                  </p>
                </div>

                {/* Books currently residing on this shelf */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-code text-xs font-semibold text-[#1F3A2E] flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#B8923F]" />
                      <span>Titles in {activeStackZone.id} ({stackBooks.length})</span>
                    </span>
                    <span className="text-[10px] font-mono-code text-[#23281F]/50">
                      Click to open
                    </span>
                  </div>

                  {stackBooks.length === 0 ? (
                    <div className="p-4 bg-white/60 rounded text-center text-xs text-[#23281F]/60 font-mono-code">
                      No books currently cataloged in this stack range.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {stackBooks.map((book) => (
                        <div
                          key={book.id}
                          onClick={() => onSelectBook(book)}
                          className="bg-white/80 hover:bg-white p-2.5 rounded border border-[#23281F]/10 hover:border-[#B8923F] cursor-pointer transition-all flex items-center justify-between gap-2 group"
                        >
                          <div className="min-w-0">
                            <div className="font-serif-display font-bold text-xs text-[#1F3A2E] group-hover:text-[#B8923F] truncate">
                              {book.title}
                            </div>
                            <div className="text-[10px] font-mono-code text-[#23281F]/60 truncate">
                              {book.call} · {book.author}
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {book.out ? (
                              <span className="text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded bg-[#8C4A3B]/15 text-[#8C4A3B]">
                                OUT
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded bg-[#4C7A5D]/15 text-[#4C7A5D]">
                                AVAIL
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Help Tip */}
              <div className="mt-4 pt-3 border-t border-[#23281F]/10 text-[11px] font-mono-code text-[#23281F]/60 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#B8923F]" />
                <span>Tip: Click any genre pill above to trace where subjects live</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#FBF6E9] border border-[#23281F]/15 rounded-xl p-8 text-center text-xs text-[#23281F]/60 font-mono-code">
              Click any stack on the blueprint to view its inventory.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
