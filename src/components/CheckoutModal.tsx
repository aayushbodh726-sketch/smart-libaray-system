import React, { useState } from 'react';
import { Book } from '../types';
import { X, BookMarked, User, Calendar, CheckCircle2 } from 'lucide-react';

interface CheckoutModalProps {
  book: Book | null;
  onClose: () => void;
  onConfirmBorrow: (bookId: number, patronName: string, patronId: string, days: number) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  book,
  onClose,
  onConfirmBorrow,
}) => {
  if (!book) return null;

  const [patronName, setPatronName] = useState('');
  const [patronId, setPatronId] = useState('');
  const [loanDays, setLoanDays] = useState(14);

  const samplePatrons = [
    { name: 'Dr. Julian Vance', id: 'FAC-1049' },
    { name: 'Maya Thorne', id: 'STU-4820' },
    { name: 'Alexander Wright', id: 'STU-9311' },
    { name: 'Chloe Dubois', id: 'STU-2054' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = patronName.trim() || 'Walk-in Scholar';
    const finalId = patronId.trim() || 'PATRON-' + Math.floor(1000 + Math.random() * 9000);
    onConfirmBorrow(book.id, finalName, finalId, loanDays);
  };

  const calculateDueDateDisplay = () => {
    const d = new Date();
    d.setDate(d.getDate() + loanDays);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#151911]/75 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-[#FAF5E8] border border-[#23281F]/20 rounded-xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#23281F]/15 mb-4">
          <div className="flex items-center gap-2 text-[#1F3A2E]">
            <BookMarked className="w-5 h-5 text-[#B8923F]" />
            <h3 className="font-serif-display font-bold text-xl">Issue Campus Loan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#23281F]/40 hover:text-[#23281F] rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Book Summary */}
        <div className="bg-[#EFE7D3]/60 p-3 rounded-lg border border-[#23281F]/10 mb-4">
          <div className="text-[11px] font-mono-code text-[#8C4A3B]">
            CALL NO. {book.call}
          </div>
          <div className="font-serif-display font-bold text-base text-[#1F3A2E] leading-snug mt-0.5">
            {book.title}
          </div>
          <div className="text-xs text-[#23281F]/70">
            by {book.author} · {book.genre}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono-code text-[#1F3A2E] font-semibold mb-1">
              Patron / Student Full Name
            </label>
            <input
              type="text"
              required
              value={patronName}
              onChange={(e) => setPatronName(e.target.value)}
              placeholder="e.g. Maya Thorne (BIO-301)"
              className="w-full px-3 py-2 bg-white border border-[#23281F]/20 rounded text-sm focus:outline-none focus:border-[#B8923F]"
            />

            {/* Quick sample patron chips */}
            <div className="mt-1.5 flex flex-wrap gap-1 text-[11px]">
              <span className="text-[#23281F]/50 font-mono-code">Quick fill:</span>
              {samplePatrons.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPatronName(p.name);
                    setPatronId(p.id);
                  }}
                  className="px-1.5 py-0.5 bg-[#E4D9BE]/60 hover:bg-[#E4D9BE] text-[#1F3A2E] rounded text-[10px] font-mono-code"
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono-code text-[#1F3A2E] font-semibold mb-1">
              Student / Library Card ID
            </label>
            <input
              type="text"
              value={patronId}
              onChange={(e) => setPatronId(e.target.value)}
              placeholder="e.g. STU-4820"
              className="w-full px-3 py-2 bg-white border border-[#23281F]/20 rounded text-sm font-mono-code focus:outline-none focus:border-[#B8923F]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-code text-[#1F3A2E] font-semibold mb-1">
              Loan Period Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { days: 7, label: '7 Days', desc: 'Short reserve' },
                { days: 14, label: '14 Days', desc: 'Standard' },
                { days: 28, label: '28 Days', desc: 'Extended' },
              ].map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setLoanDays(opt.days)}
                  className={`p-2 rounded text-left border transition-all ${
                    loanDays === opt.days
                      ? 'bg-[#1F3A2E] text-[#FAF5E8] border-[#1F3A2E]'
                      : 'bg-white text-[#23281F] border-[#23281F]/20 hover:border-[#B8923F]'
                  }`}
                >
                  <div className="font-bold text-xs">{opt.label}</div>
                  <div className={`text-[10px] ${loanDays === opt.days ? 'text-[#B8923F]' : 'text-[#23281F]/50'}`}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Due date notice */}
          <div className="bg-[#EFE7D3]/40 p-2.5 rounded border border-[#23281F]/10 flex items-center justify-between text-xs font-mono-code">
            <span className="text-[#23281F]/70">Calculated Due Date:</span>
            <span className="font-bold text-[#754C24]">{calculateDueDateDisplay()}</span>
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-3 bg-transparent border border-[#23281F]/20 hover:bg-[#23281F]/5 text-[#23281F] text-xs font-semibold rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 px-4 bg-[#1F3A2E] hover:bg-[#152922] text-[#FAF5E8] text-xs font-semibold rounded shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#B8923F]" />
              <span>Confirm & Issue Loan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
