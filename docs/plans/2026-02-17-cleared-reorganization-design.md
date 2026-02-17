# Cleared Article Reorganization Design

## Context

The "Cleared" article investigates Assam's mass eviction campaign displacing 20,000+ families since 2021. A near-final script (`Assam Investigation.md`) replaces all placeholder text. The second article "The Eighteen Acres" is being deprecated, with relevant content merged into Cleared.

## Decisions

- **Script is the single source of truth** for flow, text, and order
- **All current article text is placeholder** — replaced with script copy
- **XNotificationStack** (tweet cards from 18 Acres) used for CM rhetoric section
- **Styled blockquotes** for personal testimonies (Naysa, Barik, Zain)
- **Visual components repositioned** to match script order
- **"Continue to Part II" link removed** (18 Acres deprecated)
- **Long prose sections** get photos, a contempt timeline, and pull quotes to break them up

## Final Article Structure

### 1. Hero ScrollySection (5 steps)

| Step | Text Box | Background |
|------|----------|------------|
| 0 | Title "Cleared" + subtitle + byline | Image 1 |
| 1 | "September 23, 2021" — Dhalpur shooting | Image 2 |
| 2 | "A Campaign of Displacement" — full script paragraph including BJP/NRC/CAA/Amit Shah | Image 3 |
| 3 | "That's 165,000 people — or twice Wembley Stadium." | Stadium full |
| 4 | "One eviction every three minutes..." + Bengali-speaking Muslims | Stadium empty |

### 2. Prose — Maiful Naysa Introduction

Short prose section with styled blockquote. Her first appearance: eviction notice, one-month deadline, bulldozers at 5am.

### 3. EvictionScrolly Data Visualization (12 steps)

Keep existing component. Update step text to match script exactly:
- Steps 0-1: Overview (100K+ displaced, 33 operations, bubbles)
- Steps 2-5: Four categories (Environmental, Development, Administrative, Religious)
- Steps 6-11: Acceleration timeline (2021 vs 2025 frequency and scale)

Text updates: "USD 4.75 billion" not "Rs 48,000 crore". Add Goalpara July 2025 detail.

### 4. Prose — Background

Large prose content section (~8 paragraphs):
- Assam geography, Brahmaputra flooding
- Miya Muslims, colonial settlement on char lands
- "Miya" as slur, BJP policies since 2016
- NRC process, 1.9M excluded, detention centres
- Partition context, Patta land titles
- Documented Patta-holders evicted without due process

### 5. Prose — Zain-ul-Abadin Testimony

Uriamghat settlement story. Government settled his family in 1970s border belt to strengthen territorial claims. Now demolishing the same settlement. Styled blockquote for his quote.

### 6. NoticeMosaic ScrollySection (4 steps)

Keep existing component. Positioned after Background/Zain per script: "Photos of the eviction notices with text highlighted."

### 7. Prose — Abdul Barik Testimony

Asadubi Revenue Village, July 12, 2025. 1,080 families displaced. Styled blockquotes:
- "Our village is 70-75 years old..."
- "Nearly 60 bulldozers came early morning around 6am..."

### 8. Prose — "Bulldozer justice"

Major prose section with visual support:

**Content:**
- JCB as political symbol (Amnesty verified 33 instances)
- "Bulldozer justice" term, BJP celebration
- India-Israel parallels (26,000+ Palestinian homes since 1967)

**Visuals:**
- Field photo of JCB at demolition site (full-width)
- Pull quote: large styled text break

### 9. Prose — CM Rhetoric + XNotificationStack

**Content:**
- Sarma's Islamophobic rhetoric, "Bangladeshi encroachers" framing
- AI-generated rifle video (Feb 2026)
- 180+ scholars' joint statement

**Visuals:**
- XNotificationStack component (migrated from 18 Acres) with curated CM tweets
- Screenshot/embed of the AI rifle video tweet

### 10. Prose — Supreme Court Directives

**Content:**
- November 2024 landmark ruling (15-day notice, videographed, written reasons)
- "The executive cannot become the Judge"
- September 2024 + July 2025 contempt notices
- Jahangirpuri defiance (bulldozers kept moving after court order)
- Gujarat demolitions (Chandola Lake, 2025)

**Visuals:**
- Pull quote: Supreme Court's own words
- Small styled timeline showing contempt escalation

### 11. Prose — The Violence (expanded)

Content section with 7 events (up from 4), 10 total deaths:
1. September 21, 2016 — Kaziranga (2 killed)
2. March 11, 2019 — Hojai (1 killed, pregnant woman)
3. September 23, 2021 — Dhalpur, Darrang (2 killed)
4. April 1, 2022 — Purana Bazar, Hojai (1 killed)
5. July 17-18, 2023 — Burha Chapori (1 killed)
6. September 12, 2024 — Kachutali, Sonapur (2 killed)
7. July 17, 2025 — Paikan Reserve Forest (1 killed)

Abdul Barik continued: road dug to block aid, hospital-to-jail pipeline. Styled blockquote.

### 12. MapScrolly (7 steps)

Keep existing component. Update step text:
- Step 0: "Since 2021, 33 documented eviction operations"
- Step 1: "We travelled to 20 demolished villages"
- Steps 2-5: Four villages (Charuabakhra, Doloni Pathar, Kandapara Bosti, Ashudubi)
- Step 6: "Each dot represents families..."

### 13. DemolitionGallery

Keep. Moved to after map per script order.

### 14. Prose — Maiful Naysa Continued

Second appearance with before/after structure:
- "We had a solid house, a shop, and four rooms. Everything was settled. Now we have nothing."
- Past: Sturdy walls, family shop, wildlife barricade
- Present: Plastic tent, no income, nightly terror of elephants

### 15. SatelliteComparison

Keep. Moved to after Maiful Naysa per script order.

### 16. Prose — Where the Land Goes (expanded)

- Dhubri eviction (July 8, 2025, 1,400 families)
- Adani Power thermal plant (USD 5.6B, 3,200 MW)
- Iron ore discovery (18.29M tonnes)
- Advantage Assam 2.0 summit, corporate allocations (Adani, Patanjali, Reliance, Vedanta)
- Karbi Anglong tribal transfers (11,000 acres, 20-25K families)
- Gorukhuti land → mineral exploration zones
- **Wire/Crosscurrent investigation**: RBS Realtors, 18 acres government land, ceiling-surplus land, tribal belt violations, Vasistha Realtors, CM's son (15.9% shareholder). Sarma denies wrongdoing.

### 17. Prose — The Displaced (expanded)

- "Where do 20,000 families go?"
- Field observations: makeshift shelters, tarpaulin, bamboo, roadsides
- Zain-ul-Abadin continued: "go back to Bangladesh" taunt, economic isolation
- Barik continued: High Court stay defied (July 10 order ignored), RSS/Hindu state
- Systemic marginalization analysis

### 18. Visual Placeholder — Migration Map

Script placeholder: "MAP [VISUAL: EVICTION AREAS AND MIGRATORY FLOWS]" — keep as placeholder for future.

### 19. HeadlineStack — Media Coverage

Keep. Update intro: "From the first deadly eviction in 2021 to the Supreme Court's intervention in 2025..."

### 20. Prose — The Pattern + Global Parallels (expanded)

- Amnesty Feb 2024 report
- June 2025 UN experts call
- UN rights experts flag systematic bias (most recent)
- **Global parallels**: Israel (55,000 structures since 1967), Paraguay (3,000 evicted since Sep 2024), Guatemala (civil war era tactics)
- UN Special Rapporteur: "uncanny similarity" India-Israel
- Closing: bulldozer as global tool of displacement

### 21. Prose — The Chief Minister's Words (closing)

Brief: "My job is to make the Miya people suffer" (January 27 quote).
Additional research credit: Mir Wafa Raseeq.

### 22. Footer

- Remove "Continue to Part II" section
- Add "Additional research: Mir Wafa Raseeq" to credits
- Keep share buttons, sources, branding

## Components Summary

### Keep (reposition as needed)
- `ScrollySection` — Hero, EvictionScrolly, NoticeMosaic, MapScrolly
- `HeroVisualization` — same images
- `EvictionScrolly` — update step text
- `NoticeMosaic` — same notices
- `MapScrolly` — update step text
- `DemolitionGallery` — move after map
- `SatelliteComparison` — move after Maiful Naysa
- `HeadlineStack` — keep position

### Migrate from 18 Acres
- `XNotificationStack` — for CM rhetoric section (same tweet data)

### Remove
- "Continue to Part II" link section
- Inline CM video (replaced by tweet stack)
- Visual placeholder div

### New elements needed
- Multiple prose content sections (Background, Bulldozer justice, Supreme Court, etc.)
- Styled blockquotes for testimonies
- Pull quotes for visual breaks
- Small contempt timeline (styled HTML, reuse 18 Acres timeline pattern)
- Full-width photo slots for JCB imagery
