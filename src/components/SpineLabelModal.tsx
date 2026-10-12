import React from 'react';
import { Book } from '../types';
import { generateBarcodeBars } from '../utils/barcodeGenerator';
import { X, Printer, Tag, Check, Sparkles } from 'lucide-react';

interface SpineLabelModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SpineLabelModal: React.FC<SpineLabelModalProps> = ({ book, isOpen, onClose }) => {
  if (!isOpen || !book) return null;

  const handlePrint = () => {
    window.print();
  };

  // Parse call number into stacked lines for physical spine sticker
  // e.g. "QA76.6 .I5858" -> ["QA", "76.6", ".I5858", "2026"]
  const parseCallLines = (call: string, year?: number) => {
    const parts = call.trim().split(/[\s]+/);
    const lines: string[] = [];
    parts.forEach((p) => {
      // If starts with letters followed by numbers, split them
      const match = p.match(/^([A-Z]+)(\d.*)$/);
      if (match) {
        lines.push(match[1]);
        lines.push(match[2]);
      } else {
        lines.push(p);
      }
    });
    if (year) {
      lines.push(String(year));
    }
    return lines;
  };

  const callLines = parseCallLines(book.call, book.year);
  const barcodeBars = generateBarcodeBars(book.isbn || `STJUDE-${book.id}`, 260);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#151911]/80 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-[#FAF5E8] border-2 border-[#23281F]/20 rounded-xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#23281F]/15 mb-5">
          <div className="flex items-center gap-2 text-[#1F3A2E]">
            <Tag className="w-5 h-5 text-[#B8923F]" />
            <div>
              <h3 className="font-serif-display font-bold text-lg text-[#1F3A2E] leading-tight">
                Physical Spine Label & Barcode Tag
              </h3>
              <p className="font-mono-code text-[11px] text-[#23281F]/60">
                Print adhesive stickers for book physical binding & card catalog
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#23281F]/50 hover:text-[#23281F] rounded-full hover:bg-[#23281F]/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Labels Sheet Preview */}
        <div className="bg-[#EFE7D3] p-4 rounded-xl border border-[#23281F]/15 mb-5 shadow-inner">
          <div className="text-[10px] font-mono-code uppercase tracking-wider text-[#23281F]/60 mb-2 flex items-center justify-between">
            <span>PRINT PREVIEW · 2-UP ARCHIVAL ADHESIVE SHEET</span>
            <span className="text-[#4C7A5D] font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> Ready to Print
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Spine Call Number Label */}
            <div className="bg-white p-3 rounded shadow border border-[#23281F]/20 flex flex-col items-center justify-between min-h-[190px]">
              <div className="text-[8px] font-mono-code text-center text-[#23281F]/50 uppercase tracking-widest border-b border-[#23281F]/10 pb-1 w-full">
                ST. JUDE LIBRARY · STACKS
              </div>

              <div className="my-auto py-2 flex flex-col items-center justify-center font-mono-code font-bold text-center text-[#152922] text-sm leading-snug space-y-0.5">
                {callLines.map((line, idx) => (
                  <div key={idx} className="tracking-wider">
                    {line}
                  </div>
                ))}
                <div className="text-[9px] text-[#754C24] font-normal pt-1">
                  {book.shelfLocation ? book.shelfLocation.split('·')[0].trim() : 'STACK 1A'}
                </div>
              </div>

              <div className="text-[7.5px] font-mono-code text-center text-[#23281F]/40 border-t border-[#23281F]/10 pt-1 w-full">
                SPINE LABEL · 1.5" × 1.0"
              </div>
            </div>

            {/* 2. Barcode & Circulation Tag */}
            <div className="bg-white p-3 rounded shadow border border-[#23281F]/20 flex flex-col items-center justify-between min-h-[190px]">
              <div className="text-[8px] font-mono-code text-center text-[#23281F]/50 uppercase tracking-widest border-b border-[#23281F]/10 pb-1 w-full">
                PROPERTY OF ARCHIVES
              </div>

              <div className="my-auto py-1 flex flex-col items-center justify-center w-full">
                <p className="font-serif font-bold text-[11px] text-[#1F3A2E] text-center line-clamp-1 w-full mb-0.5">
                  {book.title}
                </p>
                <p className="font-serif italic text-[9px] text-[#23281F]/70 text-center truncate w-full mb-2">
                  {book.author}
                </p>

                {/* Barcode SVG */}
                <div className="w-full flex justify-center py-1">
                  <svg
                    viewBox="0 0 260 40"
                    className="w-full max-w-[180px] h-9"
                    preserveAspectRatio="none"
                  >
                    {barcodeBars.map((bar, i) => (
                      <rect
                        key={i}
                        x={bar.x}
                        y={0}
                        width={bar.width}
                        height={40}
                        fill="#151911"
                      />
                    ))}
                  </svg>
                </div>
                <div className="font-mono-code text-[8.5px] text-[#23281F] tracking-widest text-center mt-0.5">
                  *{book.isbn ? book.isbn.replace(/[^0-9X]/gi, '') : `STJ-${book.id}`}*
                </div>
              </div>

              <div className="text-[7.5px] font-mono-code text-center text-[#23281F]/40 border-t border-[#23281F]/10 pt-1 w-full">
                BARCODE LABEL · 2.0" × 1.0"
              </div>
            </div>
          </div>
        </div>

        {/* Metadata summary */}
        <div className="bg-white/70 p-3 rounded-lg border border-[#23281F]/10 mb-5 text-xs font-mono-code space-y-1">
          <div className="flex justify-between text-[#23281F]/75">
            <span>Call Number:</span>
            <span className="font-bold text-[#1F3A2E]">{book.call}</span>
          </div>
          <div className="flex justify-between text-[#23281F]/75">
            <span>Target Shelf:</span>
            <span className="font-bold text-[#754C24]">{book.shelfLocation || 'Stack 1A · Shelf 1'}</span>
          </div>
          <div className="flex justify-between text-[#23281F]/75">
            <span>Condition / Intake:</span>
            <span className="font-semibold text-[#4C7A5D]">
              {book.condition || 'Mint / New Arrival'} · {book.acquiredDate || 'Logged Today'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-transparent border border-[#23281F]/20 hover:bg-[#23281F]/5 text-[#23281F] text-xs font-mono-code rounded transition-colors"
          >
            Close Window
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-[#1F3A2E] hover:bg-[#152922] text-[#FAF5E8] font-mono-code font-bold text-xs rounded shadow transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <Printer className="w-4 h-4 text-[#B8923F]" />
            <span>Print Adhesive Labels Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
