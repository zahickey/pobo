// PoBo design tokens — source of truth for apps/mobile (and referenced by tokens.css for apps/web).
// Rules live in POBO_BRAND_GUIDELINES.md. Always consume via these semantic names, never the raw
// brand-* inks, outside of logo/graphic assets.

export const brand = {
  blue: '#2B50E0',
  blueLifted: '#6B86FF', // dark-theme primary, kept readable on deep ink bg
  pink: '#FF48B0',
  pinkText: '#C21C7C', // darker pink for the rare case pink must carry text (accent-text)
  paper: '#F7F2E7',
  ink: '#1A1A2E',
  nightInk: '#15151F', // dark-theme bg
  overlap: '#7A3FB8', // riso overprint colour (pink + blue), decorative only
} as const;

export type ThemeName = 'light' | 'dark';

export interface SemanticTokens {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  accent: string;
  onAccent: string;
  accentText: string;
  live: string;
  onLive: string;
  overlap: string;
  focusRing: string;
  border: string;
}

export const light: SemanticTokens = {
  bg: brand.paper,
  surface: '#FCFAF2',
  text: brand.ink,
  textMuted: '#5B5B72',
  primary: brand.blue,
  onPrimary: '#FFFFFF',
  accent: brand.pink,
  onAccent: brand.ink,
  accentText: brand.pinkText,
  live: brand.pink,
  onLive: brand.ink,
  overlap: brand.overlap,
  focusRing: brand.blue,
  border: '#E4DFD1',
};

export const dark: SemanticTokens = {
  bg: brand.nightInk,
  surface: '#1F1F2E',
  text: '#F5F2EA',
  textMuted: '#A8A8BE',
  primary: brand.blueLifted,
  onPrimary: brand.nightInk,
  accent: brand.pink,
  onAccent: brand.ink,
  accentText: brand.pink,
  live: brand.pink,
  onLive: brand.ink,
  overlap: brand.overlap,
  focusRing: brand.blueLifted,
  border: '#2E2E42',
};

export const themes: Record<ThemeName, SemanticTokens> = { light, dark };

export const typography = {
  fontDisplay: 'Gloock', // event titles, screen headings — 22px and up only
  fontBody: 'InstrumentSans', // everything read or tapped
  size: {
    headline: 28,
    title: 22, // minimum size for Gloock
    body: 16,
    meta: 14,
    label: 12, // chip labels, set uppercase
  },
} as const;

// 4 · 8 · 12 · 16 · 24 · 32 · 48
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16, // phone gutters
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radius = {
  md: 12, // buttons, date blocks
  lg: 20, // cards
  pill: 999, // chips
} as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  poster: {
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

export const minTouchTarget = 44;
