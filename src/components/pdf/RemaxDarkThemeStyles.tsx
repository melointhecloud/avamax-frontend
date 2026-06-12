export function RemaxDarkThemeStyles() {
  return (
    <style>{`
      /* === AvaMax Dark Mode — CSS Override Layer === */
      /* Wrapping class: .remax-dark */

      /* Page backgrounds */
      .remax-dark .bg-white {
        background-color: #003DA5 !important;
      }
      .remax-dark .bg-gray-50 {
        background-color: rgba(255,255,255,0.06) !important;
      }
      .remax-dark .bg-gray-100 {
        background-color: rgba(255,255,255,0.04) !important;
      }
      .remax-dark .bg-blue-50 {
        background-color: rgba(255,255,255,0.06) !important;
      }
      .remax-dark .bg-red-50 {
        background-color: rgba(255,255,255,0.06) !important;
      }
      .remax-dark .bg-slate-50 {
        background-color: rgba(255,255,255,0.06) !important;
      }
      .remax-dark .bg-slate-100 {
        background-color: rgba(255,255,255,0.04) !important;
      }

      /* Text colors */
      .remax-dark .text-gray-900 {
        color: #FFFFFF !important;
      }
      .remax-dark .text-gray-800 {
        color: rgba(255,255,255,0.95) !important;
      }
      .remax-dark .text-gray-700 {
        color: rgba(255,255,255,0.85) !important;
      }
      .remax-dark .text-gray-600 {
        color: rgba(255,255,255,0.7) !important;
      }
      .remax-dark .text-gray-500 {
        color: rgba(255,255,255,0.6) !important;
      }
      .remax-dark .text-gray-400 {
        color: rgba(255,255,255,0.5) !important;
      }
      .remax-dark .text-slate-600 {
        color: rgba(255,255,255,0.7) !important;
      }
      .remax-dark .text-slate-700 {
        color: rgba(255,255,255,0.85) !important;
      }
      .remax-dark .text-slate-800 {
        color: rgba(255,255,255,0.95) !important;
      }
      .remax-dark .text-slate-900 {
        color: #FFFFFF !important;
      }

      /* Borders */
      .remax-dark .border-gray-100 {
        border-color: rgba(255,255,255,0.1) !important;
      }
      .remax-dark .border-gray-200 {
        border-color: rgba(255,255,255,0.15) !important;
      }
      .remax-dark .border-gray-300 {
        border-color: rgba(255,255,255,0.2) !important;
      }
      .remax-dark .border-slate-200 {
        border-color: rgba(255,255,255,0.15) !important;
      }
      .remax-dark .border-blue-100 {
        border-color: rgba(255,255,255,0.15) !important;
      }
      .remax-dark .border-red-100 {
        border-color: rgba(255,255,255,0.15) !important;
      }

      /* Dividers */
      .remax-dark .divide-gray-200 > * + * {
        border-color: rgba(255,255,255,0.12) !important;
      }
      .remax-dark .divide-gray-100 > * + * {
        border-color: rgba(255,255,255,0.1) !important;
      }

      /* Accent backgrounds (blue/red tints) */
      .remax-dark [class*="bg-blue-"][class*="00"] {
        background-color: rgba(91,155,213,0.15) !important;
      }
      .remax-dark [class*="bg-red-"][class*="00"] {
        background-color: rgba(204,0,0,0.15) !important;
      }

      /* Shadows — softer in dark mode */
      .remax-dark [class*="shadow"] {
        --tw-shadow-color: rgba(0,0,0,0.3) !important;
      }

      /* Ring colors */
      .remax-dark .ring-gray-200 {
        --tw-ring-color: rgba(255,255,255,0.15) !important;
      }

      /* Specific overrides for marketing pages pillar accent backgrounds */
      .remax-dark .bg-green-50 {
        background-color: rgba(34,197,94,0.1) !important;
      }
      .remax-dark .bg-purple-50 {
        background-color: rgba(168,85,247,0.1) !important;
      }
      .remax-dark .bg-orange-50 {
        background-color: rgba(249,115,22,0.1) !important;
      }
      .remax-dark .bg-pink-50 {
        background-color: rgba(236,72,153,0.1) !important;
      }
      .remax-dark .bg-teal-50 {
        background-color: rgba(20,184,166,0.1) !important;
      }
      .remax-dark .bg-indigo-50 {
        background-color: rgba(99,102,241,0.1) !important;
      }
      .remax-dark .bg-amber-50 {
        background-color: rgba(245,158,11,0.1) !important;
      }
      .remax-dark .bg-cyan-50 {
        background-color: rgba(6,182,212,0.1) !important;
      }
      .remax-dark .bg-emerald-50 {
        background-color: rgba(16,185,129,0.1) !important;
      }

      /* Border accents for pillar cards */
      .remax-dark .border-green-200 { border-color: rgba(34,197,94,0.3) !important; }
      .remax-dark .border-purple-200 { border-color: rgba(168,85,247,0.3) !important; }
      .remax-dark .border-orange-200 { border-color: rgba(249,115,22,0.3) !important; }
      .remax-dark .border-pink-200 { border-color: rgba(236,72,153,0.3) !important; }
      .remax-dark .border-teal-200 { border-color: rgba(20,184,166,0.3) !important; }
      .remax-dark .border-indigo-200 { border-color: rgba(99,102,241,0.3) !important; }
      .remax-dark .border-amber-200 { border-color: rgba(245,158,11,0.3) !important; }
      .remax-dark .border-cyan-200 { border-color: rgba(6,182,212,0.3) !important; }
      .remax-dark .border-emerald-200 { border-color: rgba(16,185,129,0.3) !important; }

      /* Keep inline style backgrounds (covers, photos) intact */
      .remax-dark img {
        opacity: 1 !important;
      }

      /* Footer text on dark */
      .remax-dark .text-white {
        color: #FFFFFF !important;
      }

      /* Print background support */
      @media print {
        .remax-dark .bg-white {
          background-color: #003DA5 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `}</style>
  );
}
