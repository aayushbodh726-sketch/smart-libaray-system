# Stackline — Smart Campus Library System

> An interactive campus library management and visual bookshelf catalog system featuring real-time checkout circulation, overdue monitoring, optical barcode scanning, architectural building floor plans, and thermal receipt printing.

---

## Overview

**Stackline** brings the authentic tactile charm of academic archival library stacks into modern web software. It combines Dewey / Library of Congress call number cataloging, dynamic 3D visual book spines, full circulation desk ledger operations, an architectural campus floor plan, optical ISBN barcode detection, and print-ready checkout due slips.

---

## Key Features

### 1. Interactive Visual Bookshelf (Open Stacks)
- **Realistic 3D Book Spines**: Volumes feature authentic academic color-coding by subject (Navy Blue for Computer Science, Deep Crimson for Literature, Forest Green for Mathematics, etc.).
- **Gold Foil Stamping**: Embossed foil lines and title spine lettering rotated along the volume binding.
- **Physical Volume Variety**: Spine heights and widths dynamically calculate based on the volume's page extent.
- **Live Status Badges**: Indicator lights display real-time availability on the oak shelf boards (Green for Available, Red for Checked Out).
- **Tactile Physics**: Books pull out from the shelf on hover and open the library catalog card on click.

### 2. Archival Library Card Catalog
- **Authentic Vintage Card Design**: Styled with linen paper backgrounds, lined ruled margins, punched rod holes, and ink stamps.
- **Call Number & Classification**: Library of Congress (LC) call numbers, publication year, volume extent, and Dewey classification.
- **Full Catalog Management**: Add new books with auto-generated call numbers or edit existing catalog records.
- **CSV Data Export**: One-click download of the complete library collection formatted for spreadsheet applications.

### 3. Circulation Ledger & Lending Desk
- **Active Loans Table**: Real-time tracking of borrowers, student/faculty card IDs, checkout dates, and due dates.
- **Overdue Monitoring**: Visual overdue alerts and automatic assessment of late fines ($0.25/day).
- **Loan Durations**: Customizable borrowing periods (7-day Reserve, 14-day Standard, 28-day Faculty Extension).
- **One-Click Renewal**: Extend active loans by 14 days with automatic ledger updates.
- **Instant Check-In**: Return volumes back to the stacks with immediate shelf replenishment.

### 4. Interactive Campus Library Floor Map
- **Multi-Level Architectural Blueprints**:
  - **Level 1 (Ground Floor)**: Computing & Algorithms (Stack 3A), Literature & Classical Drama (Stack 1A), Modern Fiction (Stack 1B), Central Atrium, Circulation Desk, and Reading Commons.
  - **Level 2 (Mezzanine & Research Level)**: Mathematics (Stack 2A), Physics & Astrophysics (Stack 2B), Biology (Stack 2C), Economics (Stack 4A), History (Stack 4C), Psychology (Stack 5A), and Philosophy (Stack 5B).
- **Subject-Based Wayfinding**: Filter by any academic subject to immediately illuminate corresponding stacks with pulsing beacons and walking routes from the entrance.
- **Shelf Inventory Drawer**: Click any stack aisle to inspect all volumes shelved on that row.
- **"Locate on Map" Integration**: Jump directly from any book's archival card to its exact physical coordinates on the building blueprint.

### 5. Optical ISBN Barcode Scanner & Virtual Desk
- **Live Device Webcam**: Scan physical barcodes with back or front camera via `getUserMedia` and browser `BarcodeDetector` API.
- **Virtual Optical Circulation Desk**: Fallback mode for environments where live camera streams are restricted; provides an interactive animated laser bay with instant book lock-on.
- **Photo Upload / Snapshot**: Capture or upload photos of book barcodes using native mobile camera capture.
- **Sound Synthesis**: Realistic high-pitch optical scanner verification beep and error buzzers generated via the Web Audio API.
- **Instant Matching**: Automatically resolves ISBN, call numbers, or book IDs to issue loans or check in materials.

### 6. Printable Thermal Circulation Due Slips
- **Thermal Receipt Slip**: Stamped checkout receipt featuring the library header, transaction code, book title, patron information, and bold **DATE DUE FOR RETURN**.
- **Scannable Transaction Barcode**: Encodes receipt identifiers in Code-128 format.
- **Dedicated Print Layout**: Clean `@media print` styling removes page overlays and buttons for clean paper printing via `window.print()`.

### 7. Collection Analytics
- **Classification Distribution**: Visual percentage breakdowns of volumes by subject classification.
- **Circulation Velocity**: Track total loans issued across all catalog volumes.
- **Most-Borrowed Rankings**: Identify high-demand course reserves and faculty picks.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>/</kbd> | Focus global library search input |
| <kbd>B</kbd> | Open Optical Barcode Scanner modal |
| <kbd>Esc</kbd> | Dismiss active modal or inspector card |

---

## Standalone Single-File Distribution

Stackline is also provided as a **100% self-contained single-file HTML distribution**:

- **Location**: `/stackline-library.html` (or `public/standalone.html`)
- **Zero Dependencies**: Requires no Node.js, Vite, npm, or build tools. Simply double-click to open in any web browser (Chrome, Edge, Safari, Firefox).
- **Includes**: Embedded fonts, styles, React runtime, visual bookshelf, checkout modals, floor map, optical scanner simulation, and `localStorage` persistence.

---

## Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Typography**: 
  - *Fraunces* (Academic serif for titles and book bindings)
  - *IBM Plex Mono* (Archival call numbers, barcodes, and timestamps)
  - *Inter* (Clean user interface body copy)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio**: Web Audio API (real-time synthesized frequency sweeps)
- **Data Persistence**: Browser `localStorage` with initial seed datasets

---

## Project Structure

```text
├── stackline-library.html       # Standalone single-file HTML distribution
├── index.html                   # HTML entry point for Vite SPA
├── package.json                 # Project dependencies and npm scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite server and build configuration
├── public/
│   └── standalone.html          # Static standalone preview
└── src/
    ├── App.tsx                  # Main application state and view router
    ├── main.tsx                 # React DOM mount entry
    ├── index.css                # Global Tailwind CSS and typography
    ├── types.ts                 # TypeScript interfaces (Book, LoanRecord, ViewMode)
    ├── components/
    │   ├── Header.tsx           # Navigation, search, subject filters, view switcher
    │   ├── BookshelfView.tsx    # 3D visual bookshelf with wood boards and book spines
    │   ├── CatalogGridView.tsx  # Archival cards grid view
    │   ├── LoansTable.tsx       # Circulation desk ledger and overdue monitor
    │   ├── LibraryMap.tsx       # Multi-level architectural blueprint floor plan
    │   ├── BarcodeScannerModal.tsx # Optical ISBN camera scanner & virtual desk
    │   ├── BookDetailModal.tsx  # Detailed archival card with wayfinding button
    │   ├── CheckoutModal.tsx    # Patron loan issuance form
    │   ├── LoanReceiptModal.tsx # Printable thermal due slip receipt
    │   ├── AddBookModal.tsx     # Catalog new volume modal
    │   ├── AnalyticsView.tsx    # Subject distribution and circulation stats
    │   └── StatsBar.tsx         # Top circulation metrics counter
    ├── data/
    │   └── initialBooks.ts      # Seed catalog books and subject color palettes
    └── utils/
        ├── barcodeGenerator.ts  # Algorithm for rendering scannable SVG barcode bars
        ├── libraryUtils.ts      # Call number generation, overdue math, CSV exporter
        └── soundEffects.ts      # Web Audio API scanner beep synthesizer
```

---

## Getting Started

### Prerequisites
- Node.js (version 18 or newer)
- npm (version 9 or newer)

### Installation
```bash
# Clone the repository
git clone https://github.com/aayushbodh726-sketch/smart-libaray-system.git
cd smart-libaray-system

# Install dependencies
npm install
```

### Running Locally
```bash
# Start the local development server (runs on port 3000)
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### Production Build
```bash
# Type-check and compile optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## License

This project is licensed under the MIT License.
