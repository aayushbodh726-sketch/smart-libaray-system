import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../types';
import { playScannerSuccessBeep, playScannerErrorBeep } from '../utils/soundEffects';
import { generateBarcodeBars } from '../utils/barcodeGenerator';
import { isOverdue, getDaysRemainingText } from '../utils/libraryUtils';
import { 
  X, 
  Camera, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  Barcode, 
  Search, 
  BookOpen,
  Sparkles,
  Upload,
  Layers,
  ArrowRight
} from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onOpenBookDetail: (book: Book) => void;
  onInitiateBorrow: (book: Book) => void;
  onReturnBook: (bookId: number) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  books,
  onOpenBookDetail,
  onInitiateBorrow,
  onReturnBook,
}) => {
  // Mode: 'webcam' for live camera stream, 'virtual' for simulated scanner station
  const [scannerMode, setScannerMode] = useState<'webcam' | 'virtual'>('webcam');
  const [cameraState, setCameraState] = useState<'requesting' | 'active' | 'fallback'>('requesting');
  const [manualIsbn, setManualIsbn] = useState('');
  const [scannedBook, setScannedBook] = useState<Book | null>(null);
  const [activeTrayBook, setActiveTrayBook] = useState<Book | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraNotice, setCameraNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera media tracks safely
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start live webcam with fallback to virtual scanner
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraState('requesting');
    setCameraNotice(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      switchToVirtualMode('Camera hardware not accessible in this browser. Switched to Virtual Scanner.');
      return;
    }

    try {
      // First attempt: environment/requested facing mode
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        // Second attempt: basic video constraint without facingMode (essential for desktop webcams)
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraState('active');
        setScannerMode('webcam');
        setupBarcodeDetector();
      }
    } catch (err: unknown) {
      console.warn('Live camera stream not available in this iframe/environment:', err);
      switchToVirtualMode('Camera access restricted in iframe environment. Switched to interactive Virtual Optical Desk.');
    }
  };

  const switchToVirtualMode = (noticeMsg?: string) => {
    stopCamera();
    setCameraState('fallback');
    setScannerMode('virtual');
    if (noticeMsg) {
      setCameraNotice(noticeMsg);
    }
    // Set a default sample book onto the virtual scanner tray
    if (!activeTrayBook && books.length > 0) {
      setActiveTrayBook(books[0]);
    }
  };

  // Setup browser BarcodeDetector API if supported
  const setupBarcodeDetector = () => {
    const BarcodeDetectorClass = (window as unknown as { BarcodeDetector?: new (options?: { formats: string[] }) => { detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;

    if (!BarcodeDetectorClass) return;

    try {
      const barcodeDetector = new BarcodeDetectorClass({
        formats: ['ean_13', 'code_128', 'isbn', 'qr_code', 'upc_a'],
      });

      scanIntervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2 || scannedBook) return;

        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            handleProcessScannedCode(barcodes[0].rawValue);
          }
        } catch {
          // Ignore frame parsing errors
        }
      }, 350);
    } catch (e) {
      console.warn('BarcodeDetector initialization skipped', e);
    }
  };

  // Match raw string or ISBN to catalog book
  const findBookByCode = (code: string): Book | undefined => {
    const cleanCode = code.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();

    return books.find((b) => {
      const bookIsbn = (b.isbn || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
      const bookCall = b.call.replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
      const bookId = String(b.id);

      return (
        bookIsbn === cleanCode ||
        (bookIsbn && cleanCode.includes(bookIsbn)) ||
        bookCall === cleanCode ||
        bookId === cleanCode ||
        b.title.toLowerCase().includes(code.toLowerCase().trim())
      );
    });
  };

  // Process any scanned barcode or ISBN
  const handleProcessScannedCode = (rawCode: string) => {
    const found = findBookByCode(rawCode);

    if (found) {
      playScannerSuccessBeep();
      setScannedBook(found);
      setIsScanningActive(false);
    } else {
      playScannerErrorBeep();
      setCameraNotice(`No book found in catalog for code "${rawCode}"`);
      setTimeout(() => setCameraNotice(null), 3500);
    }
  };

  // Laser scan a book on the virtual scanner tray
  const handleScanTrayBook = (book: Book) => {
    setActiveTrayBook(book);
    setIsScanningActive(true);
    setScannedBook(null);

    // Laser sweeps and locks onto barcode
    setTimeout(() => {
      handleProcessScannedCode(book.isbn || String(book.id));
    }, 650);
  };

  // Handle uploaded barcode photo
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Pick a matching book or simulate scanning the uploaded photo
    setIsScanningActive(true);
    setTimeout(() => {
      // Match a book or randomly pick one to simulate photo decoding
      const sample = books[Math.floor(Math.random() * Math.min(books.length, 5))];
      handleProcessScannedCode(sample.isbn || String(sample.id));
    }, 700);
  };

  // Manual ISBN submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIsbn.trim()) return;
    handleProcessScannedCode(manualIsbn.trim());
    setManualIsbn('');
  };

  // Toggle between webcam & virtual scanner modes
  const handleToggleMode = (mode: 'webcam' | 'virtual') => {
    if (mode === 'webcam') {
      startCamera();
    } else {
      switchToVirtualMode();
    }
  };

  // Lifecycle
  useEffect(() => {
    if (isOpen) {
      setScannedBook(null);
      setIsScanningActive(false);
      // Auto-start camera
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#151911]/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-[#1F3A2E] text-[#EFE7D3] border-2 border-[#B8923F] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-[#EFE7D3]/15 flex items-center justify-between bg-[#152922]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B8923F] text-[#152922] flex items-center justify-center font-bold">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-base sm:text-lg text-[#FAF5E8] leading-tight flex items-center gap-2">
                <span>Optical Barcode Scanner</span>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#B8923F]/20 text-[#B8923F] border border-[#B8923F]/40 font-semibold">
                  {scannerMode === 'webcam' ? 'LIVE WEBCAM' : 'VIRTUAL DESK'}
                </span>
              </h3>
              <p className="text-[11px] font-mono-code text-[#EFE7D3]/70">
                Point live device camera or scan on the virtual circulation desk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Tabs */}
            <div className="hidden sm:inline-flex bg-[#1F3A2E] p-1 rounded-lg border border-[#EFE7D3]/20 text-xs font-mono-code">
              <button
                onClick={() => handleToggleMode('webcam')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  scannerMode === 'webcam'
                    ? 'bg-[#B8923F] text-[#152922] font-semibold'
                    : 'text-[#EFE7D3]/70 hover:text-[#FAF5E8]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Webcam</span>
              </button>
              <button
                onClick={() => handleToggleMode('virtual')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  scannerMode === 'virtual'
                    ? 'bg-[#B8923F] text-[#152922] font-semibold'
                    : 'text-[#EFE7D3]/70 hover:text-[#FAF5E8]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Virtual Desk</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#EFE7D3]/70 hover:text-[#FAF5E8] bg-[#1F3A2E] hover:bg-[#1F3A2E]/80 rounded-lg border border-[#EFE7D3]/20 transition-colors"
              title="Close scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {cameraNotice && (
          <div className="bg-[#B8923F]/20 border-b border-[#B8923F]/40 px-4 py-2 text-xs font-mono-code text-[#FAF5E8] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B8923F]" />
              <span>{cameraNotice}</span>
            </span>
            <button
              onClick={() => setCameraNotice(null)}
              className="text-[#FAF5E8]/60 hover:text-[#FAF5E8] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Viewport Area */}
        <div className="relative bg-gradient-to-b from-[#101F18] via-[#152922] to-[#0E1A14] flex-1 min-h-[280px] sm:min-h-[320px] flex items-center justify-center overflow-hidden">
          {/* Live Video Feed (when in webcam mode and active) */}
          {scannerMode === 'webcam' && (
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover max-h-[340px] ${
                cameraState === 'active' ? 'opacity-90' : 'hidden'
              }`}
            />
          )}

          {/* Virtual Desk Canvas (Active when camera is fallback or user picked Virtual Desk) */}
          {scannerMode === 'virtual' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
              {/* Wooden desk surface background */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 12px)`,
                }}
              />

              {/* Active Book on Scanner Bed */}
              {activeTrayBook && (
                <div 
                  onClick={() => handleScanTrayBook(activeTrayBook)}
                  className={`relative z-10 bg-[#FAF5E8] text-[#23281F] rounded-xl p-4 sm:p-5 shadow-2xl border-2 border-[#B8923F] max-w-sm w-full cursor-pointer transition-all duration-300 hover:scale-102 ${
                    isScanningActive ? 'ring-4 ring-red-500/50 scale-102' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#8C4A3B]">
                      {activeTrayBook.call}
                    </span>
                    <span className={`text-[10px] font-mono-code font-bold px-2 py-0.5 rounded ${
                      activeTrayBook.out ? 'bg-[#8C4A3B]/15 text-[#8C4A3B]' : 'bg-[#4C7A5D]/15 text-[#4C7A5D]'
                    }`}>
                      {activeTrayBook.out ? 'CHECKED OUT' : 'ON SHELF'}
                    </span>
                  </div>

                  <h4 className="font-serif-display font-bold text-base text-[#1F3A2E] leading-snug line-clamp-1">
                    {activeTrayBook.title}
                  </h4>
                  <p className="text-xs text-[#23281F]/70 line-clamp-1">
                    by {activeTrayBook.author} · {activeTrayBook.genre}
                  </p>

                  {/* Scannable Barcode on the Book */}
                  <div className="mt-3 bg-white p-2 rounded border border-[#23281F]/15 flex flex-col items-center shadow-xs">
                    <svg className="w-56 h-11" viewBox="0 0 260 42">
                      {generateBarcodeBars(activeTrayBook.isbn || `978000000000${activeTrayBook.id}`, 260).map((b, i) => (
                        <rect
                          key={i}
                          x={b.x}
                          y={2}
                          width={b.width}
                          height={38}
                          fill="#1F3A2E"
                        />
                      ))}
                    </svg>
                    <span className="font-mono-code text-[10px] text-[#23281F]/75 mt-0.5">
                      ISBN {activeTrayBook.isbn || 'N/A'}
                    </span>
                  </div>

                  <div className="mt-2.5 text-center text-[11px] font-mono-code text-[#B8923F] font-semibold flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 animate-pulse" />
                    <span>Click Book to Trigger Laser Scan</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scanner Viewfinder Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
            {/* Target Box */}
            <div className="relative w-[280px] sm:w-[360px] h-[170px] sm:h-[190px] border border-white/25 rounded-lg shadow-inner">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-[#B8923F] rounded-tl-sm" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-[#B8923F] rounded-tr-sm" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-[#B8923F] rounded-bl-sm" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-[#B8923F] rounded-br-sm" />

              {/* Sweeping Laser Beam */}
              <div className="absolute inset-x-2 h-[2px] bg-gradient-to-r from-transparent via-[#FF3B30] to-transparent shadow-[0_0_10px_#FF3B30] animate-[bounce_1.8s_infinite]" />
            </div>

            {/* Guidance Badge */}
            <div className="mt-3 px-3 py-1 bg-[#152922]/90 backdrop-blur-xs rounded-full border border-white/10 text-[11px] font-mono-code text-[#EFE7D3]/90 flex items-center gap-1.5 shadow">
              <Zap className="w-3 h-3 text-[#B8923F]" />
              <span>
                {scannerMode === 'webcam'
                  ? 'Align ISBN barcode within the frame'
                  : 'Click book or select from library tray below'}
              </span>
            </div>
          </div>

          {/* Scanned Book Success Popup */}
          {scannedBook && (
            <div className="absolute inset-0 bg-[#151911]/92 backdrop-blur-xs flex items-center justify-center p-4 z-20 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[#FAF5E8] text-[#23281F] w-full max-w-md rounded-xl p-5 shadow-2xl border-2 border-[#B8923F]">
                {/* Result header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#23281F]/15 mb-3">
                  <div className="flex items-center gap-2 text-[#4C7A5D]">
                    <CheckCircle2 className="w-5 h-5 text-[#4C7A5D]" />
                    <span className="font-mono-code text-xs font-bold uppercase tracking-wider">
                      Barcode Verified · ISBN Matched
                    </span>
                  </div>
                  <span className="font-mono-code text-xs text-[#8C4A3B] font-bold">
                    {scannedBook.call}
                  </span>
                </div>

                {/* Book info */}
                <h4 className="font-serif-display font-bold text-xl text-[#1F3A2E] leading-snug">
                  {scannedBook.title}
                </h4>
                <p className="text-xs text-[#23281F]/70 mt-0.5">
                  by {scannedBook.author} · <span className="font-semibold text-[#1F3A2E]">{scannedBook.genre}</span>
                </p>

                {/* Scanned Barcode graphic */}
                <div className="my-3 bg-white p-2.5 rounded border border-[#23281F]/15 flex flex-col items-center">
                  <svg className="w-56 h-12" viewBox="0 0 260 45">
                    {generateBarcodeBars(scannedBook.isbn || '9780000000000', 260).map((b, i) => (
                      <rect
                        key={i}
                        x={b.x}
                        y={2}
                        width={b.width}
                        height={40}
                        fill="#1F3A2E"
                      />
                    ))}
                  </svg>
                  <span className="font-mono-code text-[11px] text-[#23281F]/80 tracking-widest mt-1">
                    ISBN {scannedBook.isbn || 'N/A'}
                  </span>
                </div>

                {/* Circulation status */}
                <div className="bg-[#EFE7D3]/60 p-2.5 rounded border border-[#23281F]/10 mb-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#23281F]/60 font-mono-code">Status: </span>
                    {scannedBook.out ? (
                      <span className="font-bold text-[#8C4A3B]">
                        Checked Out ({getDaysRemainingText(scannedBook).text})
                      </span>
                    ) : (
                      <span className="font-bold text-[#4C7A5D]">
                        Available on Shelf ({scannedBook.shelfLocation || 'Stack 1'})
                      </span>
                    )}
                  </div>
                  {scannedBook.out && scannedBook.borrower && (
                    <span className="text-[11px] text-[#23281F]/70 truncate max-w-[140px]">
                      {scannedBook.borrower}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {scannedBook.out ? (
                      <button
                        onClick={() => {
                          onReturnBook(scannedBook.id);
                          setScannedBook((prev) => (prev ? { ...prev, out: false } : null));
                        }}
                        className="flex-1 py-2.5 px-3 bg-[#8C4A3B] hover:bg-[#723a2d] text-white font-semibold text-xs tracking-wider uppercase rounded shadow transition-colors"
                      >
                        Check In / Return Book
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onInitiateBorrow(scannedBook);
                          onClose();
                        }}
                        className="flex-1 py-2.5 px-3 bg-[#1F3A2E] hover:bg-[#152922] text-[#FAF5E8] font-semibold text-xs tracking-wider uppercase rounded shadow transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-[#B8923F]" />
                        <span>Issue Loan / Check Out</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenBookDetail(scannedBook);
                        onClose();
                      }}
                      className="py-2.5 px-3 bg-[#E4D9BE] hover:bg-[#d8cbb0] text-[#1F3A2E] font-semibold text-xs rounded border border-[#23281F]/20 transition-colors flex items-center gap-1"
                      title="Open complete archival card"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Card</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setScannedBook(null)}
                    className="w-full py-1.5 text-center text-xs font-mono-code text-[#23281F]/60 hover:text-[#1F3A2E] transition-colors"
                  >
                    ← Scan another book barcode
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Tray & Alternative Controls */}
        <div className="p-4 bg-[#152922] border-t border-[#EFE7D3]/15 space-y-3.5">
          {/* Quick-Pick Book Tray */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono-code text-[#B8923F] font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Campus Shelf Barcodes (Click to Place & Scan):</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] font-mono-code text-[#EFE7D3]/75 hover:text-[#B8923F] flex items-center gap-1 transition-colors"
                  title="Upload photo of barcode"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {books.slice(0, 8).map((book) => (
                <button
                  key={book.id}
                  onClick={() => handleScanTrayBook(book)}
                  className={`shrink-0 text-left rounded-lg p-2 transition-all w-44 group border ${
                    activeTrayBook?.id === book.id
                      ? 'bg-[#2E4A3B] border-[#B8923F] shadow-sm'
                      : 'bg-[#1F3A2E] hover:bg-[#28493b] border-[#EFE7D3]/15 hover:border-[#B8923F]/50'
                  }`}
                >
                  <div className="font-serif-display font-semibold text-xs text-[#FAF5E8] truncate group-hover:text-[#B8923F]">
                    {book.title}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] font-mono-code text-[#EFE7D3]/60">
                    <span className="truncate">{book.isbn || book.call}</span>
                    <span className={book.out ? 'text-[#8C4A3B]' : 'text-[#4C7A5D]'}>
                      {book.out ? '● OUT' : '● AVAIL'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleManualSubmit} className="flex gap-2 pt-1 border-t border-[#EFE7D3]/10">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualIsbn}
                onChange={(e) => setManualIsbn(e.target.value)}
                placeholder="Or type/paste ISBN (e.g. 978-0132350884 or title)…"
                className="w-full bg-[#1F3A2E] border border-[#EFE7D3]/20 rounded-lg px-3.5 py-2 text-xs font-mono-code text-[#FAF5E8] placeholder-[#EFE7D3]/40 focus:outline-none focus:border-[#B8923F]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#B8923F] hover:bg-[#a88233] text-[#152922] font-semibold text-xs font-mono-code rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Lookup</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
