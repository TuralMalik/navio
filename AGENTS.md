<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Navio design rules

Read this before writing or changing ANY frontend UI.

These rules exist because AI-assisted code regresses to the statistical median
of its training data ("AI slop"), and that median is a purple-gradient landing
page with three identical icon-top cards. Navio's distinctiveness has to come
from REAL DATA presented with discipline, not from decoration. We are a credit
tool: the product is a number the user is anxious about. Ornament around that
number reads as sales, and sales reads as untrustworthy.

Adapted from the Mənzil.ai ruleset (same authors, same house style). Where the
two differ, the difference is deliberate and noted.

## Hard bans (never introduce)

- Purple/indigo-to-cyan hero gradients, colored glows, colored box-shadows,
  rainbow accent bars, glassmorphism panels. No gradient buttons: our primary
  button is a flat brand blue.
- Emoji as icons, bullets, status markers, or nav items. Interface icons come
  from `lucide-react`, sized to the text line-height, never larger. Score tiers
  use color and text, never 🟢🟡🔴.
- ALL-CAPS tracked micro-labels. Use sentence-case semibold labels.
- Em dashes in anything a user or reviewer reads: UI copy, page metadata, email
  subjects, error and warning strings, docs, commit messages. Use commas,
  periods, colons, parentheses, or a hyphen. Rewrite the sentence rather than
  swapping the character: an em dash usually joins two clauses, so the fix is
  normally a period or a colon, not a comma dropped in place.
  (Russian code comments are the one exception, since the em dash is ordinary
  punctuation there and those lines never reach a user.)
- Decorative infinite-loop animations. Motion is feedback, not entertainment.
  A looping keyframe that runs forever with nothing to communicate is banned.
- Card-inside-card nesting deeper than one level; identical icon-top 3/6-card
  grids; numbered 1-2-3 "how it works" rows with tinted icon squares.
- Fake urgency, invented numbers, countdowns, fake social proof. We tell people
  their odds of getting a loan. Every number on screen must be one we computed
  or one the user typed.
- Do NOT overcorrect into the second-order slop kit either: dark mode + glow +
  Space Grotesk + serif-italic accents + noise texture is just as recognizable.

## Type

- One family: **Plus Jakarta Sans**, via `next/font/google`, subsets
  `["latin", "latin-ext"]`. The subsets are load-bearing, not boilerplate.
  Azerbaijani needs ə Ə ğ Ğ ı İ ş Ş, and Google's `latin` subset covers only ı,
  so `subsets: ["latin"]` renders the rest in a fallback font, mid-word.
- Changing the typeface requires checking **what Google actually serves**, not
  the TTF in the `google/fonts` repo. Google re-subsets on their side and drops
  glyphs, and `unicode-range` lies about it: Onest's served `latin-ext` declares
  U+0100-02BA but contains no ə, so the browser downloads the file, finds no
  glyph and silently falls back. Fetch the `css2` URL, download each `.woff2` it
  lists, and assert the codepoints are present with non-empty outlines. Already
  ruled out this way: Onest and Karla (no ə Ə), Manrope and Open Sans (no Ə).
- Display headings (text-3xl and up): `tracking-tight` and `leading-[1.05..1.15]`.
  Body keeps default tracking.
- Max ~6 sizes on marketing pages. Product pages rarely exceed text-2xl.
- EVERY number that can change (scores, manats, percentages, months, counts)
  gets `tabular-nums`. A score that shifts its own digits while counting looks
  broken.
- Money and percentages render through the helpers in `src/lib/utils.ts`
  (`formatCurrency`, `formatNumber`, `formatPercent`). Never hand-roll
  `toFixed(2) + " AZN"` at a call site. Those helpers deliberately avoid `Intl`
  so server and client produce byte-identical strings; using `toLocaleString`
  in a component reintroduces hydration error #418 on the calculators.

## Color

- Primary is Navio blue `--color-brand-600` (#2447F0). Committed, do not
  re-propose a rebrand. Use it for primary actions and active states ONLY,
  never for decoration, never as a tinted icon-square background.
- Semantic scale, and it is the user's mental model, so do not remix it:
  emerald = strong/approved, amber = borderline, rose = weak/declined,
  gray = unknown or not applicable.
- Color enters the page through DATA (the score, tier chips, factor rows,
  comparison bars), not through decorated containers.
- Missing values render the Azerbaijani "yoxdur", never a bare hyphen or "N/A".

## Surfaces

- Radii: `rounded-2xl` for page-level cards, `rounded-xl` for inner panels,
  `rounded-lg` and below for controls. Do not flatten this scale.
- Borders beat shadows. `border border-gray-200` is the default card treatment.
- Shadows are soft and unnoticed: low opacity, high blur, negative spread.
  Only floating content (dropdowns, dialogs) may go one step stronger. If the
  shadow is the first thing you notice, it is wrong.

## Motion

- Only `transform`, `opacity` and `scale` animate. 150-250ms. `ease-out` for
  anything entering, never `ease-in`.
- Buttons press to `scale: 0.97`. This is a global rule in `globals.css` using
  the standalone `scale` property, NOT `transform`, so positioned buttons do not
  jump. Do not duplicate it per component.
- Elements appear from `scale(0.97)` and small offsets, never from 0.
- Respect `prefers-reduced-motion`. The global rules already do; anything new
  must too.

## States

Every interactive element ships all of: default, hover, focus-visible, active,
disabled, plus loading wherever an async action exists (spinner inside the
button, label stays put so the button does not resize). Inputs need a focus
ring, an error state with a specific message, and the typed value must survive
the error.

## Data presentation

- One number leads. Ranges and bands support it, they never lead.
- Never show a cost in isolation. Anchor it against a number the user already
  accepts (their income, the other loan option, what they typed).
- Progress never renders 0%. Count genuinely completed work as the first step.
- Labels must agree with their status icon. A failing factor cannot keep a
  positive assertion label.
- Locked/anonymous state shows the real headline number and honestly describes
  what registering adds. Never blur a fake number, and never imply the hidden
  content is bigger than it is.

## Voice (Azerbaijani first)

Second-person verb forms, natural phrasing, no machine-translated English
idiom. Rewrite whole sentences rather than swapping words: word-level
find/replace produces hybrids like "Bir sessions = bir ziyarət". The admin
panel is the one English-language surface.

## Never expose the scoring engine

Thresholds, weights, caps and tier cutoffs live in `src/lib/server/` and must
never reach the client bundle. UI receives ready-made labels, tones and copy
from the server presenter. If a component needs to know what "good" means, the
server tells it; the component does not compute it.

## The signature elements (protect and extend these)

The score itself, the tier chip, the factor list with per-factor direction, and
the honest locked-preview. When a page feels generic, the fix is more real data
presented tighter, not more decoration.
