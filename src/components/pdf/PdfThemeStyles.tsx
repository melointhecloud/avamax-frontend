import React from "react";

type PdfColors = {
  background: string;
  backgroundGradientFrom: string;
  backgroundGradientVia: string;
  backgroundGradientTo: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  text: string;
  textMuted: string;
  cardBackground: string;
  cardBorder: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim();
  if (!h.startsWith("#")) return null;

  const raw = h.slice(1);
  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16);
    const g = parseInt(raw[1] + raw[1], 16);
    const b = parseInt(raw[2] + raw[2], 16);
    return { r, g, b };
  }
  if (raw.length === 6) {
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function rgbToRgbaString(rgb: { r: number; g: number; b: number }, alpha: number) {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp(alpha, 0, 1)})`;
}

function toRgba(color: string, alpha: number) {
  const c = (color || "").trim();

  // rgba(r,g,b,a)
  if (/^rgba\(/i.test(c)) {
    // Best-effort: replace last alpha
    const inner = c.replace(/^rgba\(|\)$/gi, "");
    const parts = inner.split(",").map((p) => p.trim());
    if (parts.length >= 3) {
      const [r, g, b] = parts;
      return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
    }
  }

  // rgb(r,g,b)
  if (/^rgb\(/i.test(c)) {
    const inner = c.replace(/^rgb\(|\)$/gi, "");
    const parts = inner.split(",").map((p) => p.trim());
    if (parts.length >= 3) {
      const [r, g, b] = parts;
      return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
    }
  }

  // hex
  const rgb = hexToRgb(c);
  if (rgb) return rgbToRgbaString(rgb, alpha);

  // fallback: can't safely alpha-blend
  return c;
}

export function PdfThemeStyles({ colors }: { colors: PdfColors }) {
  const p05 = toRgba(colors.primary, 0.05);
  const p10 = toRgba(colors.primary, 0.1);
  const p15 = toRgba(colors.primary, 0.15);
  const p20 = toRgba(colors.primary, 0.2);
  const p25 = toRgba(colors.primary, 0.25);
  const p30 = toRgba(colors.primary, 0.3);
  const p40 = toRgba(colors.primary, 0.4);
  const p50 = toRgba(colors.primary, 0.5);
  const p90 = toRgba(colors.primary, 0.9);
  const p95 = toRgba(colors.primary, 0.95);

  const s05 = toRgba(colors.secondary, 0.05);
  const s10 = toRgba(colors.secondary, 0.1);
  const s15 = toRgba(colors.secondary, 0.15);
  const s20 = toRgba(colors.secondary, 0.2);
  const s25 = toRgba(colors.secondary, 0.25);
  const s30 = toRgba(colors.secondary, 0.3);

  const a10 = toRgba(colors.accent, 0.1);
  const a20 = toRgba(colors.accent, 0.2);

  const t50 = toRgba(colors.text, 0.5);
  const t60 = toRgba(colors.text, 0.6);
  const t70 = toRgba(colors.text, 0.7);
  const t80 = toRgba(colors.text, 0.8);
  const tm50 = toRgba(colors.textMuted, 0.5);
  const tm60 = toRgba(colors.textMuted, 0.6);
  const tm70 = toRgba(colors.textMuted, 0.7);
  const tm80 = toRgba(colors.textMuted, 0.8);

  const pl50 = toRgba(colors.primaryLight, 0.5);
  const pl60 = toRgba(colors.primaryLight, 0.6);
  const pl70 = toRgba(colors.primaryLight, 0.7);
  const pl80 = toRgba(colors.primaryLight, 0.8);

  const sl50 = toRgba(colors.secondaryLight, 0.5);
  const sl60 = toRgba(colors.secondaryLight, 0.6);
  const sl70 = toRgba(colors.secondaryLight, 0.7);
  const sl80 = toRgba(colors.secondaryLight, 0.8);

  // NOTE: class selectors with '/' must be escaped as '\/'
  const css = `
.pdf-theme {
  --pdf-bg: ${colors.background};
  --pdf-bg-from: ${colors.backgroundGradientFrom};
  --pdf-bg-via: ${colors.backgroundGradientVia};
  --pdf-bg-to: ${colors.backgroundGradientTo};

  --pdf-primary: ${colors.primary};
  --pdf-primary-light: ${colors.primaryLight};
  --pdf-secondary: ${colors.secondary};
  --pdf-secondary-light: ${colors.secondaryLight};
  --pdf-accent: ${colors.accent};

  --pdf-text: ${colors.text};
  --pdf-text-muted: ${colors.textMuted};
  --pdf-card-bg: ${colors.cardBackground};
  --pdf-card-border: ${colors.cardBorder};

  --pdf-primary-10: ${p10};
  --pdf-primary-15: ${p15};
  --pdf-primary-20: ${p20};
  --pdf-primary-25: ${p25};
  --pdf-primary-30: ${p30};
  --pdf-primary-40: ${p40};
  --pdf-primary-50: ${p50};
  --pdf-primary-90: ${p90};
  --pdf-primary-95: ${p95};

  --pdf-secondary-05: ${s05};
  --pdf-secondary-10: ${s10};
  --pdf-secondary-15: ${s15};
  --pdf-secondary-20: ${s20};
  --pdf-secondary-25: ${s25};
  --pdf-secondary-30: ${s30};

  --pdf-accent-10: ${a10};
  --pdf-accent-20: ${a20};
}

/* -------- Text helpers (colors) -------- */
.pdf-theme .text-white { color: var(--pdf-text) !important; }
.pdf-theme .text-white\/90 { color: var(--pdf-text) !important; }
.pdf-theme .text-white\/80 { color: var(--pdf-text) !important; }
.pdf-theme .text-white\/70 { color: var(--pdf-text) !important; }
.pdf-theme .text-white\/60 { color: var(--pdf-text) !important; }
.pdf-theme .text-white\/50 { color: var(--pdf-text) !important; }
.pdf-theme .text-white\/40 { color: var(--pdf-text-muted) !important; }
.pdf-theme .text-white\/30 { color: var(--pdf-text-muted) !important; }

/* Tailwind text colors with explicit opacity variants */
.pdf-theme .text-blue-100\/80,
.pdf-theme .text-blue-200\/70,
.pdf-theme .text-blue-300\/80,
.pdf-theme .text-blue-300\/70,
.pdf-theme .text-blue-300\/60,
.pdf-theme .text-blue-300\/50,
.pdf-theme .text-blue-400\/60 {
  color: ${sl70} !important;
}

.pdf-theme .text-emerald-100\/80,
.pdf-theme .text-emerald-200\/70,
.pdf-theme .text-emerald-300\/70,
.pdf-theme .text-emerald-300\/60,
.pdf-theme .text-emerald-300\/50,
.pdf-theme .text-emerald-400\/50,
.pdf-theme .text-emerald-400\/60 {
  color: ${pl70} !important;
}

.pdf-theme .text-orange-300\/70,
.pdf-theme .text-orange-300\/60,
.pdf-theme .text-orange-300\/50 {
  color: ${pl70} !important;
}

.pdf-theme .text-slate-400,
.pdf-theme .text-slate-300,
.pdf-theme .text-slate-200,
.pdf-theme .text-slate-100,
.pdf-theme .text-slate-600,
.pdf-theme .text-slate-700 {
  color: var(--pdf-text-muted) !important;
}

/* “primary” highlights (orange/emerald classes) */
.pdf-theme .text-orange-400,
.pdf-theme .text-emerald-400 {
  color: var(--pdf-primary-light) !important;
}

.pdf-theme .text-orange-300,
.pdf-theme .text-emerald-300 {
  color: var(--pdf-primary-light) !important;
  opacity: .85;
}

.pdf-theme .text-orange-500,
.pdf-theme .text-emerald-500 {
  color: var(--pdf-primary) !important;
}

/* “secondary” texts (blue classes) */
.pdf-theme .text-blue-400 { color: var(--pdf-secondary-light) !important; }
.pdf-theme .text-blue-300,
.pdf-theme .text-blue-200,
.pdf-theme .text-blue-100 {
  color: var(--pdf-secondary-light) !important;
  opacity: .85;
}

/* SVG fills used by lucide */
.pdf-theme .fill-orange-400,
.pdf-theme .fill-emerald-400 { fill: var(--pdf-primary-light) !important; }

/* -------- Card backgrounds / borders (common patterns) -------- */
.pdf-theme .bg-blue-500\/10,
.pdf-theme .bg-emerald-500\/10,
.pdf-theme .bg-orange-500\/10 {
  background-color: var(--pdf-card-bg) !important;
}

/* Common “deep” hero placeholders */
.pdf-theme .bg-blue-900\/50,
.pdf-theme .bg-emerald-900\/50 {
  background-color: ${toRgba(colors.background, 0.5)} !important;
}

.pdf-theme .from-blue-900\/50,
.pdf-theme .from-emerald-900\/50 {
  --tw-gradient-from: ${toRgba(colors.background, 0.55)} !important;
  --tw-gradient-to: ${toRgba(colors.background, 0.55)} !important;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.pdf-theme .to-blue-950\/80,
.pdf-theme .to-emerald-950\/80 {
  --tw-gradient-to: ${toRgba(colors.background, 0.9)} !important;
}

.pdf-theme .border-blue-400\/20,
.pdf-theme .border-blue-400\/25,
.pdf-theme .border-blue-400\/30,
.pdf-theme .border-emerald-400\/20,
.pdf-theme .border-emerald-400\/25,
.pdf-theme .border-emerald-400\/30,
.pdf-theme .border-orange-500\/40,
.pdf-theme .border-orange-500\/50 {
  border-color: var(--pdf-card-border) !important;
}

/* Accent “icon chips” */
.pdf-theme .bg-orange-500\/20,
.pdf-theme .bg-emerald-500\/20,
.pdf-theme .bg-blue-500\/20 {
  background-color: var(--pdf-primary-20) !important;
}

/* Additional opacity variants used across templates (Venda + Aluguel + Paisagem) */
.pdf-theme .bg-orange-500\/5,
.pdf-theme .bg-emerald-500\/5,
.pdf-theme .bg-blue-500\/5,
.pdf-theme .bg-teal-500\/5,
.pdf-theme .bg-purple-500\/5,
.pdf-theme .bg-pink-500\/5,
.pdf-theme .bg-indigo-500\/5 {
  background-color: var(--pdf-card-bg) !important;
}

.pdf-theme .bg-orange-500\/15,
.pdf-theme .bg-emerald-500\/15,
.pdf-theme .bg-teal-500\/15,
.pdf-theme .bg-purple-500\/15,
.pdf-theme .bg-pink-500\/15 {
  background-color: var(--pdf-primary-15) !important;
}

.pdf-theme .bg-blue-500\/15,
.pdf-theme .bg-indigo-500\/15 {
  background-color: var(--pdf-secondary-15) !important;
}

.pdf-theme .bg-orange-500\/25,
.pdf-theme .bg-emerald-500\/25,
.pdf-theme .bg-teal-500\/25,
.pdf-theme .bg-purple-500\/25,
.pdf-theme .bg-pink-500\/25 {
  background-color: var(--pdf-primary-25) !important;
}

.pdf-theme .bg-blue-500\/25,
.pdf-theme .bg-indigo-500\/25 {
  background-color: var(--pdf-secondary-25) !important;
}

/* “confidential / recommended” pills etc */
.pdf-theme .bg-orange-500\/30,
.pdf-theme .bg-emerald-500\/30 {
  background-color: var(--pdf-primary-30) !important;
}

.pdf-theme .bg-orange-500\/90,
.pdf-theme .bg-emerald-500\/90 {
  background-color: var(--pdf-primary-90) !important;
}

.pdf-theme .bg-orange-500\/95,
.pdf-theme .bg-emerald-500\/95 {
  background-color: var(--pdf-primary-95) !important;
}

/* Tailwind gradients: override gradient stops for common from/to combos */
.pdf-theme .from-orange-500\/20,
.pdf-theme .from-emerald-500\/20 {
  --tw-gradient-from: var(--pdf-primary-20) !important;
  --tw-gradient-to: var(--pdf-primary-20) !important;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.pdf-theme .from-orange-500\/30,
.pdf-theme .from-emerald-500\/30,
.pdf-theme .from-teal-500\/30,
.pdf-theme .from-purple-500\/30,
.pdf-theme .from-pink-500\/30 {
  --tw-gradient-from: var(--pdf-primary-30) !important;
  --tw-gradient-to: var(--pdf-primary-30) !important;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.pdf-theme .from-blue-500\/30,
.pdf-theme .from-indigo-500\/30 {
  --tw-gradient-from: var(--pdf-secondary-30) !important;
  --tw-gradient-to: var(--pdf-secondary-30) !important;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.pdf-theme .to-orange-600\/15,
.pdf-theme .to-emerald-600\/15 {
  --tw-gradient-to: var(--pdf-primary-15) !important;
}

.pdf-theme .to-orange-600\/20,
.pdf-theme .to-emerald-600\/20,
.pdf-theme .to-teal-600\/20,
.pdf-theme .to-purple-600\/20,
.pdf-theme .to-pink-600\/20 {
  --tw-gradient-to: var(--pdf-primary-20) !important;
}

.pdf-theme .to-blue-600\/20,
.pdf-theme .to-indigo-600\/20 {
  --tw-gradient-to: var(--pdf-secondary-20) !important;
}

/* Borders used heavily in rental templates */
.pdf-theme .border-emerald-400\/10,
.pdf-theme .border-emerald-500\/20,
.pdf-theme .border-emerald-500\/30,
.pdf-theme .border-emerald-500\/40,
.pdf-theme .border-orange-400\/20,
.pdf-theme .border-orange-400\/30,
.pdf-theme .border-orange-500\/30,
.pdf-theme .border-blue-400\/10,
.pdf-theme .border-blue-400\/15,
.pdf-theme .border-indigo-400\/20,
.pdf-theme .border-purple-400\/20,
.pdf-theme .border-pink-400\/20,
.pdf-theme .border-teal-400\/20 {
  border-color: var(--pdf-card-border) !important;
}

/* Text opacity variants not covered in the original mapping */
.pdf-theme .text-emerald-200\/60,
.pdf-theme .text-emerald-400\/40,
.pdf-theme .text-emerald-400\/70,
.pdf-theme .text-emerald-500\/30,
.pdf-theme .text-emerald-500\/70,
.pdf-theme .text-orange-200\/60,
.pdf-theme .text-orange-400\/40,
.pdf-theme .text-orange-400\/70,
.pdf-theme .text-orange-500\/30,
.pdf-theme .text-orange-500\/70,
.pdf-theme .text-teal-200\/60,
.pdf-theme .text-teal-400\/70,
.pdf-theme .text-teal-500\/70,
.pdf-theme .text-purple-200\/60,
.pdf-theme .text-purple-400\/70,
.pdf-theme .text-purple-500\/70,
.pdf-theme .text-pink-200\/60,
.pdf-theme .text-pink-400\/70,
.pdf-theme .text-pink-500\/70 {
  color: ${pl70} !important;
}

.pdf-theme .text-blue-200\/60,
.pdf-theme .text-blue-200\/70,
.pdf-theme .text-blue-100\/70,
.pdf-theme .text-blue-100\/80,
.pdf-theme .text-indigo-200\/70,
.pdf-theme .text-indigo-400\/70 {
  color: ${sl70} !important;
}

.pdf-theme .from-blue-500\/15 {
  --tw-gradient-from: var(--pdf-secondary-15) !important;
  --tw-gradient-to: var(--pdf-secondary-15) !important;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.pdf-theme .to-blue-600\/10 {
  --tw-gradient-to: var(--pdf-secondary-10) !important;
}
`;

  return <style>{css}</style>;
}
