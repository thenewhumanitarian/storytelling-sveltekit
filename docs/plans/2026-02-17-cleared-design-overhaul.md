# Cleared Article Design Overhaul

## Context

The Cleared article has been reorganized to match the final script. The current design uses an all-dark background (#0a0a0a), inconsistent accent colors (gold, red, burgundy), and long unbroken prose blocks. This overhaul unifies the visual language, improves readability, and adds editorial rhythm.

## Decisions

- **Warm neutral backgrounds** for prose sections (#f5f0eb), dark stays for scrolly sections
- **TNH burgundy #9f3e52** as the single accent color throughout
- **One new scrolly** for the Background section (11 paragraphs → 6 scrolly steps)
- **5 placeholder images**, **4 pull quotes**, **4 sub-headings** across prose sections
- **Gradient transitions** between dark scrolly and light prose sections
- **Blockquotes and links** adapt to their background context (light vs dark)

---

## Color System

### Backgrounds
| Context | Color |
|---------|-------|
| Prose sections | `#f5f0eb` (warm parchment) |
| Scrolly sections | `#0a0a0a` (near black) |
| Footer | `#1a1a1a` (dark charcoal) |

### Text on Light Backgrounds
| Element | Color |
|---------|-------|
| Body text | `#2d2d2d` |
| Headings | `#1a1a1a` |
| Captions / metadata | `#6b6b6b` |

### Text on Dark Backgrounds
| Element | Color |
|---------|-------|
| Body text | `rgba(255,255,255,0.9)` |
| Captions | `rgba(255,255,255,0.5)` |

### Accent — TNH Burgundy `#9f3e52`
Used for: blockquote borders, timeline markers, pull quote borders, links (light bg), footer heading markers, contempt timeline border, section dividers.

Links on dark backgrounds use lighter burgundy `#c9697f` for contrast.

### Typography (unchanged)
- Headings: Playfair Display
- Body: Source Sans 3
- Mono/dates: JetBrains Mono

---

## Transitions

### Dark → Light (exiting scrolly into prose)
4rem gradient band from `#0a0a0a` to `#f5f0eb`. Soft "dawn" effect.

### Light → Dark (entering scrolly from prose)
Mirror: 4rem gradient from `#f5f0eb` to `#0a0a0a`.

### Between Adjacent Prose Sections
Subtle horizontal rule: centered 4rem-wide line, `#9f3e52` at 20% opacity, 3rem vertical padding.

---

## New Background Scrolly (Section 4 replacement)

Converts the 11-paragraph Background section into a 6-step scrolly over placeholder images.

| Step | Text Box | Background Image (placeholder) |
|------|----------|-------------------------------|
| 0 | **"A Contested History"** — Assam at crossroads, ethnically diverse, question of belonging | Satellite/aerial of Assam |
| 1 | **"The Brahmaputra"** — Floods, displacement as way of life | Flood imagery |
| 2 | **"The Miya"** — Bengali-speaking Muslims, char lands, "Miya" as slur | Char land community |
| 3 | **"The Eviction Machine"** — BJP since 2016, "illegal encroachments", Patta land titles | Hands holding documents |
| 4 | **"The Register"** — NRC, 1.9M excluded, detention centres, Goalpara | Queue with documents |
| 5 | **"After Partition"** — Post-1947 arrivals, CAA/NRC sharpest expression in Assam | Historical/archival |

**Post-scrolly prose bridge:** 2 paragraphs (Muslim demographics, Patta-holders evicted) on warm neutral background before Zain testimony.

Uses existing `ScrollySection` + `HeroVisualization` pattern. Gray placeholder images initially.

---

## Prose Section Visual Breaks

### Bulldozer Justice
- Full-width placeholder image before section (JCB at demolition site)
- Pull quote after paragraph 2: *"The brand of choice in a hate campaign against the minority community" — Amnesty International*

### CM Rhetoric
- Pull quote before tweets: *"Point blank shot" — caption on AI-generated video, deleted after outrage*

### The Violence
- Placeholder image at top of section (aftermath photograph)
- Timeline border color: `#9f3e52` (replacing `#dc2626`)

### Where the Land Goes
- Sub-heading after paragraph 2: *"Corporate Allocations"*
- Placeholder image after paragraph 3 (aerial/industrial site)
- Sub-heading after paragraph 4: *"The Eighteen Acres"*
- Pull quote after paragraph 5: *"At least 18 acres of government land... acquired through transactions that appeared to contravene state land regulations" — The Wire / The Crosscurrent*

### The Displaced
- Placeholder image at top (tarpaulin shelters)
- Sub-heading after paragraph 2: *"Go Back to Bangladesh"*
- Placeholder image after paragraph 3 (families at river's edge)

### The Pattern
- Sub-heading after paragraph 3: *"A Global Pattern"*
- Pull quote after paragraph 7: *"Uncanny similarity" between India's methods and Israel's conduct — UN Special Rapporteur*

### Sections with no changes needed
- Maiful Naysa Introduction (short)
- Zain-ul-Abadin Testimony (short)
- Abdul Barik Testimony (short)
- Supreme Court (already has pull quote + timeline)
- The Chief Minister's Words (short, emotional close)

---

## Element Styling

### Placeholder Images
- Full content column width (42rem max)
- Warm gray fill: `#d4d0cb`
- 56% aspect ratio (landscape)
- Rounded corners: 4px
- Centered caption in `#6b6b6b`
- 1rem vertical margin

### Pull Quotes (light background)
- Top/bottom border: 2px solid `rgba(159, 62, 82, 0.3)`
- Text: Playfair Display italic, `clamp(1.25rem, 3vw, 1.75rem)`, color `#1a1a1a`
- Attribution: Source Sans 3 small caps, `#6b6b6b`
- Centered, 2rem vertical padding

### Blockquotes (light background)
- Left border: 4px solid `#9f3e52`
- Text: `#2d2d2d`, italic
- 1.5rem padding-left
- No background fill

### Blockquotes (dark background — inside scrolly)
- Keep current: white text, `rgba(255,255,255,0.2)` left border

### Links (light background)
- Color: `#9f3e52`
- 1px underline, lighter on hover

### Links (dark background)
- Color: `#c9697f` (lighter burgundy for contrast)

### Footer
- Background: `#1a1a1a`
- Heading markers and text: `#9f3e52` (replacing `#d4a574` gold)
- Structure unchanged (3-column grid)

---

## Components Summary

### New
- Background scrolly (6 steps, reuses ScrollySection + HeroVisualization)

### Modified
- All prose `.content-section` backgrounds → `#f5f0eb`
- All text colors on light backgrounds → dark palette
- All accent colors → `#9f3e52`
- Footer background and accents
- Blockquote styling (context-aware: light vs dark)
- Link styling (context-aware)
- Timeline border color
- Gradient transition bands between sections

### Unchanged
- Hero ScrollySection
- EvictionScrolly
- NoticeMosaic
- MapScrolly
- DemolitionGallery
- SatelliteComparison
- HeadlineStack
- XNotificationStack
