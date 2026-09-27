# PoBo — brand guidelines

**PoBo is your city's poster board.** It's the wall of flyers outside a bar, made live: venues post their trivia, dance, karaoke and comedy nights, and people find what's on near them right now, on a map, and send it to friends.

The look comes from riso printing, the cheap, bright, two-ink process behind a lot of gig posters and zines. Two fluoro inks (pink and blue) on warm paper, printed slightly off-register. It should feel handmade, local and a little bit fun: a flyer, not a spreadsheet.

## Voice

PoBo talks like a friend who always knows what's on.

- **Short and specific.** "Trivia at 8. Four minutes away." Lead with the what, the when and the how far.
- **Warm, not hype.** No "epic", "insane", or countdown pressure. One exclamation mark is plenty, and usually none.
- **Local.** Name the venue and the neighborhood. Say "near you", not "in your area".
- **Plain labels in the UI.** "Live now", "Starts in 20 min", "3 friends going". Uppercase only for chip labels.
- Tagline: **Your city's poster board.** Always with the full stop.

## Logo

The logo has two parts that can live together or apart.

- **Wordmark.** "PoBo" in Gloock, in `brand-blue`, with a `brand-pink` copy printed just behind it, offset down and to the right by 0.027em (4px at 150px). That offset is the misregistration of a riso print. Capital P, lowercase o, capital B, lowercase o, always.
- **Pin mark.** A pink map pin and a blue circle overprinted, with a small flyer in the pin's head. Where the inks overlap they make `overlap`. It means *a poster, pinned to a place*.

Versions (files in `brand/logo/`):

| File | Use |
| --- | --- |
| `pobo-lockup-horizontal.svg` | Default. Headers, website, email. |
| `pobo-lockup-stacked.svg` | Splash, posters, social avatars with room. |
| `pobo-wordmark.svg` | When the pin is already on screen (e.g. map UI). |
| `pobo-pin.svg` | App icon, favicon, map markers, small spaces. |
| `pobo-wordmark-ink.svg` / `-white.svg` | One-colour printing, embossing, dark photos. |
| `pobo-wordmark-on-blue.svg`, `pobo-monogram.svg` | Blue brand fields; "Pb" when there's only room for two letters. |

Rules:

- **Clear space:** keep at least the height of the lowercase "o" empty around the logo.
- **Minimum size:** wordmark 72px wide; pin 20px. Below 72px, drop the wordmark and use the pin.
- **Drop the pink offset** when the wordmark is under 32px tall or sits on a busy image; use the one-colour versions instead.
- **Don't** recolour the wordmark outside these versions, add shadows or outlines, stretch it, set "PoBo" in another font, or put the colour wordmark on pink or on photos.

## Colour

Two inks, one paper, one ink-black. Colour tokens (`brand/tokens/`) are semantic with a light and a dark theme; build UI from the semantic tokens (`bg`, `surface`, `text`, `primary`, `accent`, `live`), and keep the `brand-*` inks for logos and graphics.

- **Blue carries the interface:** primary buttons, links, category chips, selected pins. Text on blue is `on-primary`.
- **Pink means "now" and "fun":** the live chip, highlights, the wordmark's offset. Text on pink is `on-accent` (dark ink), **never white**. Pink is never body text on a light ground; when pink must be text, use `accent-text`.
- **Paper, not white:** pages are `bg` (riso stock), cards are `surface`. Pure white only appears inside blue fields.
- **Overlap** is a printing effect, not a UI colour.
- **Dark theme** swaps the paper for a deep night ink and lifts the blue to `#6B86FF` so it stays readable. Pink works on both.

Contrast (WCAG): `text` on `bg` 15.3:1 · `text-muted` on `bg` 6.5:1 · `primary` on `bg` 5.7:1 · `on-primary` on `primary` 6.3:1 · `on-accent` on `accent` 5.5:1 · dark `primary` on dark `bg` 5.5:1. Pink on stock is 2.8:1, which is why pink never carries text there.

## Typography

- **Gloock** (display serif, one weight) for names of things: the brand, event titles, screen headings. It's the "poster headline".
- **Instrument Sans** (400–700) for everything read or tapped: body, meta, buttons, labels.
- Pairing on cards: event title in Gloock `event-title`, details in Instrument Sans `meta`, category and state in `label` chips.
- Keep Gloock at 22px and up; below that it gets spindly. Never set body copy in it.
- Both are free under the SIL Open Font License. On mobile, load them with `@expo-google-fonts/gloock` and `@expo-google-fonts/instrument-sans`.

## Shape and layout

- Soft rectangles: cards `radius-lg`, buttons and date blocks `radius-md`, chips `radius-pill`.
- Spacing runs 4 · 8 · 12 · 16 · 24 · 32 · 48. Phone gutters are `space-lg`.
- Shadows are short and soft (`shadow-card`), like paper lifted off a wall.
- A flyer can sit at a slight angle (1–2°) in marketing and share cards, never in functional UI.

## Graphics and imagery

- **The riso overprint** is the signature graphic: two flat shapes, one pink and one blue, overlapping into `overlap`. Use circles, pins and rounded rectangles. Two inks, no gradients.
- **Photos** (venue photos, event images) sit in `radius-md` frames. For brand marketing, riso-style duotones in pink and blue fit the look.
- **Map pins** in the app are small versions of the pin mark: blue by default, pink when the event is live.
- **Icons:** simple line icons, about 1.75px stroke, rounded caps, in `text` or `primary`. No emoji in the UI.

## Key patterns

- **Event card:** `surface`, `radius-lg`, `shadow-card`. Left: a date block (day + time). Right: chips (category in `primary`, "Live now" in `live`), title in `event-title`, then venue · distance · time in `meta` / `text-muted`.
- **Live now:** a pink `live` chip with `on-live` text; on the map, the live pin gets a soft pink pulse.
- **Share card:** a flyer on `surface` with `shadow-poster`, the event in Gloock and the horizontal lockup at the bottom, so every shared link advertises PoBo.

## Accessibility

- Text meets 4.5:1 in both themes (see Colour). Pink never carries text on light grounds.
- States never rely on colour alone: "Live now" always has its label, not just a pink dot.
- Keyboard and switch focus: a 2px `focus-ring`, 2px from the control.
- Touch targets at least 44 × 44px.
