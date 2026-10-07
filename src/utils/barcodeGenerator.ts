// Generates consistent visual barcode bars for ISBN strings

export interface BarcodeBar {
  x: number;
  width: number;
  isGuard?: boolean;
}

export function generateBarcodeBars(isbn: string, totalWidth = 260): BarcodeBar[] {
  // Strip hyphens and spaces
  const clean = isbn.replace(/[^0-9X]/gi, '') || '9780000000000';
  
  // Seed a pseudo-random hash generator based on the clean ISBN
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  
  const bars: BarcodeBar[] = [];
  let currentX = 12;

  // Left guard bars: [bar, space, bar]
  bars.push({ x: currentX, width: 2, isGuard: true });
  currentX += 4;
  bars.push({ x: currentX, width: 2, isGuard: true });
  currentX += 5;

  // Data bars generated deterministically from ISBN characters
  for (let i = 0; i < clean.length; i++) {
    const digit = parseInt(clean[i], 10) || ((clean.charCodeAt(i) % 9) + 1);
    const pattern = [(digit % 3) + 1, ((digit + 1) % 2) + 1, ((digit + 2) % 3) + 1];

    for (let p = 0; p < pattern.length; p++) {
      const barWidth = pattern[p];
      bars.push({ x: currentX, width: barWidth });
      // Variable spacing
      const spacing = ((digit + p + (Math.abs(hash) % 3)) % 3) + 2;
      currentX += barWidth + spacing;
    }

    // Center guard in the middle of standard 13-digit EAN
    if (i === 6) {
      currentX += 3;
      bars.push({ x: currentX, width: 2, isGuard: true });
      currentX += 4;
      bars.push({ x: currentX, width: 2, isGuard: true });
      currentX += 5;
    }
  }

  // Right guard bars
  currentX += 3;
  bars.push({ x: currentX, width: 2, isGuard: true });
  currentX += 4;
  bars.push({ x: currentX, width: 2, isGuard: true });

  return bars;
}
