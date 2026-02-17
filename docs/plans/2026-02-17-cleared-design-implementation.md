# Cleared Design Overhaul Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Overhaul the Cleared article's visual design — warm neutral prose backgrounds, unified TNH burgundy accent, new Background scrolly, placeholder images and pull quotes for editorial rhythm.

**Architecture:** Single-file CSS and template restructure of `+page.svelte`. The Background section converts from prose to a scrolly using the existing `ScrollySection` + `HeroVisualization` pattern. All other changes are CSS color updates, gradient transition wrappers, and editorial HTML additions (images, pull quotes, sub-headings).

**Tech Stack:** SvelteKit 2.x, Svelte 5 (runes), Tailwind CSS 3.4

**Primary file:** `src/routes/cleared/+page.svelte`
**Design doc:** `docs/plans/2026-02-17-cleared-design-overhaul.md`

---

## Task 1: CSS Color System Overhaul

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (style block, lines 878-1360)

This task changes the entire color palette from dark-on-dark to warm neutral prose with unified burgundy accents.

**Step 1: Update prose section backgrounds and text**

Change `.content-section` background from `#0a0a0a` to `#f5f0eb`:

```css
.content-section {
    position: relative;
    background: #f5f0eb;
    padding: 5rem 1.5rem;
}
```

Change `.content-heading` color from `#ffffff` to `#1a1a1a`:

```css
.content-heading {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 600;
    line-height: 1.2;
    color: #1a1a1a;
    margin: 0 0 2rem 0;
}
```

Change `.prose-content` color from `rgba(255, 255, 255, 0.85)` to `#2d2d2d`:

```css
.prose-content {
    font-family: 'Source Sans 3', system-ui, sans-serif;
    font-size: 1.125rem;
    line-height: 1.85;
    color: #2d2d2d;
}
```

Change `.prose-content strong` color from `#ffffff` to `#1a1a1a`:

```css
.prose-content strong {
    font-weight: 600;
    color: #1a1a1a;
}
```

**Step 2: Update blockquote styling for light backgrounds**

Change `.prose-content blockquote` border and text colors:

```css
.prose-content blockquote {
    border-left: 4px solid #9f3e52;
    padding-left: 1.5rem;
    margin: 2rem 0;
    font-style: italic;
    color: #4a4a4a;
}
```

**Step 3: Update link styling**

Add new link styles for light backgrounds. Add after `.prose-content blockquote`:

```css
.prose-content a {
    color: #9f3e52;
    text-decoration: underline;
    text-decoration-color: rgba(159, 62, 82, 0.3);
    text-underline-offset: 2px;
    transition: text-decoration-color 0.2s ease;
}

.prose-content a:hover {
    text-decoration-color: #9f3e52;
}
```

**Step 4: Update timeline event border**

Change `.event` border-left from `#dc2626` to `#9f3e52`:

```css
.event {
    padding-left: 1.5rem;
    border-left: 4px solid #9f3e52;
    margin-bottom: 1.5rem;
}
```

Change `.event-date` color from `#ffffff` to `#1a1a1a`:

```css
.event-date {
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 0.25rem 0;
}
```

**Step 5: Update pull quote styling for light backgrounds**

Change `.pull-quote` borders from white to burgundy:

```css
.pull-quote {
    margin: 3rem 0;
    padding: 2rem 0;
    border-top: 2px solid rgba(159, 62, 82, 0.3);
    border-bottom: 2px solid rgba(159, 62, 82, 0.3);
    text-align: center;
}

.pull-quote p {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.25rem, 3vw, 1.75rem);
    font-weight: 500;
    font-style: italic;
    line-height: 1.4;
    color: #1a1a1a;
    margin: 0 0 0.75rem 0;
}

.pull-quote-source {
    font-family: 'Source Sans 3', system-ui, sans-serif;
    font-size: 0.875rem;
    color: #6b6b6b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
```

**Step 6: Update contempt timeline for light background**

```css
.contempt-timeline {
    margin: 2rem 0;
    padding-left: 1.5rem;
    border-left: 2px solid rgba(159, 62, 82, 0.3);
}

.contempt-date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: #6b6b6b;
    white-space: nowrap;
    min-width: 5rem;
}

.contempt-desc {
    font-family: 'Source Sans 3', system-ui, sans-serif;
    font-size: 0.95rem;
    color: #2d2d2d;
    line-height: 1.5;
}
```

**Step 7: Update visual placeholder for light background**

```css
.visual-placeholder {
    margin: 3rem 0;
    padding: 2rem;
    background: #d4d0cb;
    border: 2px dashed rgba(0, 0, 0, 0.15);
    border-radius: 0.5rem;
    text-align: center;
}

.visual-placeholder p {
    font-style: italic;
    color: #6b6b6b;
    margin: 0;
}

.visual-placeholder span {
    font-size: 0.875rem;
    display: block;
    margin-top: 0.5rem;
}
```

**Step 8: Update before-after list and additional research for light background**

```css
.before-after-list li {
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    color: #2d2d2d;
    font-size: 1.125rem;
    line-height: 1.85;
}

.before-after-list li strong {
    color: #1a1a1a;
}

.additional-research {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    color: #6b6b6b;
    font-size: 0.95rem;
}
```

**Step 9: Update footer colors**

Change `.article-footer` background from `#0a0a0a` to `#1a1a1a`:

```css
.article-footer {
    position: relative;
    z-index: 10;
    background: #1a1a1a;
    padding: 0 1.5rem 3rem;
}
```

Change `.footer-heading` color from `#d4a574` to `#9f3e52`:

```css
.footer-heading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #9f3e52;
    margin: 0;
}

.heading-marker {
    width: 1rem;
    height: 1px;
    background: #9f3e52;
}
```

**Step 10: Add section divider CSS and placeholder image CSS**

Add these new CSS rules at the end of the style block (before `</style>`):

```css
/* Section divider between adjacent prose sections */
.section-divider {
    width: 4rem;
    height: 1px;
    background: rgba(159, 62, 82, 0.2);
    margin: 0 auto;
}

/* Placeholder image blocks */
.placeholder-image {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #d4d0cb;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 2rem 0;
}

.placeholder-image span {
    font-family: 'Source Sans 3', system-ui, sans-serif;
    font-size: 0.875rem;
    color: #6b6b6b;
    text-align: center;
    padding: 1rem;
}

/* Sub-headings within prose sections */
.prose-subheading {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    font-weight: 600;
    line-height: 1.3;
    color: #1a1a1a;
    margin: 3rem 0 1.5rem 0;
}

/* Gradient transitions between dark and light sections */
.transition-dark-to-light {
    height: 4rem;
    background: linear-gradient(to bottom, #0a0a0a, #f5f0eb);
}

.transition-light-to-dark {
    height: 4rem;
    background: linear-gradient(to bottom, #f5f0eb, #0a0a0a);
}
```

**Step 11: Verify**

Run `yarn dev` and scroll through. Check:
- [ ] Prose sections have warm parchment background
- [ ] Text is dark on light background
- [ ] Blockquotes have burgundy left border
- [ ] Timeline events have burgundy border
- [ ] Footer has burgundy accents (not gold)
- [ ] Links are burgundy with underline

**Step 12: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Overhaul color system: warm neutral backgrounds, TNH burgundy accents"
```

---

## Task 2: Gradient Transitions Between Sections

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (template, lines 286-876)

Add gradient transition divs between every dark scrolly section and its adjacent light prose section. The CSS was already added in Task 1.

**Step 1: Add transitions around all scrolly/prose boundaries**

Insert transition divs at these locations in the template (work top to bottom):

After Hero ScrollySection (line 299), before Maiful Naysa:
```svelte
<div class="transition-dark-to-light"></div>
```

After Maiful Naysa section (line 314), before Eviction ScrollySection:
```svelte
<div class="transition-light-to-dark"></div>
```

After Eviction ScrollySection (line 325), before Background section:
```svelte
<div class="transition-dark-to-light"></div>
```

After Zain testimony (line 397), before NoticeMosaic:
```svelte
<div class="transition-light-to-dark"></div>
```

After NoticeMosaic (line 409), before Abdul Barik:
```svelte
<div class="transition-dark-to-light"></div>
```

After Violence section (line 588), before Map Scrolly:
```svelte
<div class="transition-light-to-dark"></div>
```

After DemolitionGallery (line 607), before Maiful Naysa Continued:
```svelte
<div class="transition-dark-to-light"></div>
```

After SatelliteComparison (line 633), before Where the Land Goes:
Note: SatelliteComparison may have its own dark background. Add transition if needed:
```svelte
<div class="transition-dark-to-light"></div>
```

After The Pattern/CM Words section (line 786), before Footer:
```svelte
<div class="transition-light-to-dark"></div>
```

**Step 2: Verify**

Run `yarn dev`. Check that transitions between dark scrolly and light prose sections are smooth gradients, not hard cuts.

**Step 3: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Add gradient transitions between dark scrolly and light prose sections"
```

---

## Task 3: Convert Background Section to Scrolly

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (script + template)

Replace the 11-paragraph Background prose section (lines 327-378) with a 6-step scrolly over placeholder images, followed by a 2-paragraph prose bridge.

**Step 1: Add Background scrolly step data**

In the script block, after the `evictionSteps` array (after line 101), add:

```javascript
// Background scrolly steps (6 steps covering Assam history and context)
const backgroundSteps = [
    {
        title: 'A Contested History',
        text: 'Behind these numbers is a state with a long, contested history of deciding who belongs. Assam sits at a volatile crossroads, bordered by Bangladesh to the west, Bhutan to the north, and surrounded by six other Indian states. It is one of India\'s most ethnically diverse regions. For decades, the question of who truly belongs here has defined its politics. That anxiety has been systematically exploited. Under the BJP, which came to power in Assam in 2016, it became policy.'
    },
    {
        title: 'The Brahmaputra',
        text: 'Assam lies along the Brahmaputra, one of the world\'s largest rivers. Every monsoon season, it floods, swallowing villages and forcing families to rebuild from scratch. Displacement here is not new. It is a way of life.'
    },
    {
        title: 'The Miya',
        text: 'Many of those now facing eviction are Miya Muslims, Bengali-speaking Muslims whose ancestors migrated from the Bengal region to Assam during the colonial period and settled on low-lying river islands called chars. These were marginal, flood-prone strips of land that nobody else wanted. Over generations, they cleared the land, farmed it, and built communities on it. The word "Miya" was once a term of respect. Today, it is used as a slur to mark Bengali-speaking Muslims as outsiders.'
    },
    {
        title: 'The Eviction Machine',
        text: 'Since 2016, these communities have faced government-led eviction drives targeting what officials call "illegal encroachments". It is a label with consequences. In Myanmar, the same logic was applied to Rohingya Muslims for decades. The Assam government frames these evictions as action against "illegal immigrants" from Bangladesh. But many of those being displaced are Bengali-speaking Muslims whose families arrived after 1947, when Partition divided Bengal along religious lines. Some came with official permission. Others were given land by the Indian state itself. Many had been living in Assam for 50 to 70 years.'
    },
    {
        title: 'The Register',
        text: 'The National Register of Citizens (NRC), concluded in 2019, was designed to identify who qualified as an Indian citizen in Assam. Residents had to prove they or their families arrived before March 24, 1971. The final list excluded more than 1.9 million people, roughly 6% of Assam\'s population. Many were poor. Most were Muslim. Several detention centres were established, including India\'s largest in Goalpara, designed to house up to 3,500 people. In some cases, children were separated from their parents.'
    },
    {
        title: 'After Partition',
        text: 'More than one third of Assam\'s 31 million people are Muslim. That demographic reality has made Assam a focal point of a broader national shift. The BJP-led government has faced repeated accusations of targeting India\'s 200 million Muslims, from the Citizenship Amendment Act to the National Register of Citizens. In Assam, these national policies have found their sharpest expression.'
    }
];

// Background scrolly images (gray placeholders for now)
const backgroundImages = [
    '', // Step 0: Satellite/aerial of Assam (placeholder)
    '', // Step 1: Brahmaputra floods (placeholder)
    '', // Step 2: Char land community (placeholder)
    '', // Step 3: Hands holding documents (placeholder)
    '', // Step 4: Queue with documents (placeholder)
    ''  // Step 5: Historical/archival (placeholder)
];
```

**Step 2: Add Background scrolly state**

After `let notificationsTriggered = $state(false);` (line 255), add:

```javascript
let backgroundStep = $state(0);
let backgroundScrollProgress = $state(0);

// Background scrolly image control
let currentBackgroundImage = $derived(backgroundImages[backgroundStep] ?? '');

// Fade effects for background scrolly
let backgroundFadeProgress = $derived(() => {
    if (backgroundStep !== 5) return 0;
    const fadeStart = 0.85;
    if (backgroundScrollProgress < fadeStart) return 0;
    return Math.min(1, (backgroundScrollProgress - fadeStart) / (1 - fadeStart));
});
```

**Step 3: Replace Background template section**

Replace the entire Background section (lines 327-378, from `<!-- Background Section -->` to the closing `</section>`) with:

```svelte
<!-- Background Scrolly -->
<div class="transition-light-to-dark"></div>
<ScrollySection
    bind:activeStep={backgroundStep}
    steps={backgroundSteps}
    backgroundColor="#0a0a0a"
    showTextBoxes={true}
    textBoxVariant="light"
    onScrollProgress={(p) => (backgroundScrollProgress = p)}
>
    {#snippet children({ activeStep })}
        <HeroVisualization
            currentImage={currentBackgroundImage}
            fadeProgress={backgroundFadeProgress()}
        />
    {/snippet}
</ScrollySection>
<div class="transition-dark-to-light"></div>

<!-- Background prose bridge (remaining paragraphs) -->
<section class="content-section">
    <div class="content-container">
        <div class="prose-content">
            <p>
                What makes these evictions particularly troubling is that many families held Patta &ndash; official land titles issued by the Assam government &ndash; along with ration cards and voter IDs, documents that under Indian law establish legal residence and citizenship.
            </p>

            <p>
                Some Pattas dated back decades, proof that the state itself had recognised their right to the land. Yet documented cases show Patta-holders being evicted without warning, without due process, their legal papers rendered meaningless overnight.
            </p>
        </div>
    </div>
</section>
```

Note: Remove the `<div class="transition-dark-to-light"></div>` that Task 2 added before the old Background section, since the new scrolly already includes its own transitions.

**Step 4: Handle placeholder images gracefully**

The `HeroVisualization` component needs to handle empty string image paths. Check `src/lib/components/cleared/HeroVisualization.svelte` — if `currentImage` is empty, the component should show a gray placeholder instead of a broken image. If it doesn't handle this already, add a fallback:

In `HeroVisualization.svelte`, wrap the `<img>` in a conditional:

```svelte
{#if currentImage}
    <img src={currentImage} ... />
{:else}
    <div class="placeholder-bg"></div>
{/if}
```

With CSS:
```css
.placeholder-bg {
    position: absolute;
    inset: 0;
    background: #1a1a1a;
}
```

**Step 5: Verify**

Run `yarn dev`. Scroll through the Background section:
- [ ] 6 scrolly steps with text boxes
- [ ] Dark background (gray/dark placeholder until real images added)
- [ ] Smooth fade transitions in/out
- [ ] 2-paragraph prose bridge after scrolly on warm background
- [ ] Zain testimony follows the prose bridge

**Step 6: Commit**

```bash
git add src/routes/cleared/+page.svelte src/lib/components/cleared/HeroVisualization.svelte
git commit -m "Convert Background section to 6-step scrolly with prose bridge"
```

---

## Task 4: Bulldozer Justice + CM Rhetoric Visual Breaks

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (template)

**Step 1: Add placeholder image before Bulldozer Justice heading**

In the Bulldozer Justice section (after `<div class="content-container">` at line 432, before the `<h2>` heading), add:

```svelte
<div class="placeholder-image">
    <span>Photo: JCB bulldozer at demolition site</span>
</div>
```

**Step 2: Add pull quote after paragraph 2 of Bulldozer Justice**

After the second `</p>` in the Bulldozer Justice prose (the paragraph ending "...marginalized communities."), add:

```svelte
</div>

<div class="pull-quote">
    <p>"The brand of choice in a hate campaign against the minority community."</p>
    <span class="pull-quote-source">Amnesty International, February 2024</span>
</div>

<div class="prose-content">
```

This closes the prose-content div, inserts the pull quote, and reopens prose-content for the remaining paragraph.

**Step 3: Add pull quote before tweets in CM Rhetoric section**

In the CM Rhetoric section, after the third prose paragraph (ending "...safety of minority rights.") and before the tweet container div, add:

```svelte
</div>

<div class="pull-quote">
    <p>"Point blank shot"</p>
    <span class="pull-quote-source">Caption on AI-generated video of CM Sarma, deleted after outrage</span>
</div>
```

**Step 4: Verify**

Run `yarn dev`:
- [ ] Gray placeholder image appears above "Bulldozer justice" heading
- [ ] Amnesty pull quote appears between paragraphs 2 and 3
- [ ] "Point blank shot" pull quote appears before tweet stack

**Step 5: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Add placeholder image and pull quotes to Bulldozer Justice and CM Rhetoric"
```

---

## Task 5: Violence + Where the Land Goes Visual Breaks

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (template)

**Step 1: Add placeholder image at top of Violence section**

In the Violence section, after `<div class="content-container">` and before `<h2 class="content-heading">The Violence</h2>`, add:

```svelte
<div class="placeholder-image">
    <span>Photo: Aftermath of eviction drive</span>
</div>
```

**Step 2: Add sub-heading "Corporate Allocations" in Where the Land Goes**

After the third paragraph of Where the Land Goes (the one about "Advantage Assam 2.0 investment summit..."), add:

```svelte
<h3 class="prose-subheading">Corporate Allocations</h3>
```

**Step 3: Add placeholder image after fourth paragraph of Where the Land Goes**

After the fourth paragraph (about Karbi Anglong tribal organisations), add:

```svelte
<div class="placeholder-image">
    <span>Photo: Industrial development site or Advantage Assam summit</span>
</div>
```

**Step 4: Add sub-heading "The Eighteen Acres" before fifth paragraph**

Before the fifth paragraph (starting "Questions about where cleared land..."), add:

```svelte
<h3 class="prose-subheading">The Eighteen Acres</h3>
```

**Step 5: Add pull quote after fifth paragraph**

After the fifth paragraph (ending "...reserved for public or institutional use."), add:

```svelte
<div class="pull-quote">
    <p>"At least 18 acres of government land acquired through transactions that appeared to contravene state land regulations."</p>
    <span class="pull-quote-source">The Wire / The Crosscurrent, 2021</span>
</div>
```

Note: This pull quote needs to sit outside the `.prose-content` div, then the final paragraph continues in a new `.prose-content` div. Or, more simply, just place it inline within the prose-content div — the CSS will handle it since `.pull-quote` has its own styling.

**Step 6: Verify**

Run `yarn dev`:
- [ ] Gray placeholder at top of Violence section
- [ ] "Corporate Allocations" sub-heading appears mid-section
- [ ] Gray placeholder image appears after corporate paragraph
- [ ] "The Eighteen Acres" sub-heading appears
- [ ] Pull quote from The Wire appears

**Step 7: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Add visual breaks to Violence and Where the Land Goes sections"
```

---

## Task 6: The Displaced + The Pattern Visual Breaks

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (template)

**Step 1: Add placeholder image at top of The Displaced section**

After `<div class="content-container">` and before `<h2 class="content-heading">The Displaced</h2>`, add:

```svelte
<div class="placeholder-image">
    <span>Photo: Tarpaulin shelters along roadside</span>
</div>
```

**Step 2: Add sub-heading "Go Back to Bangladesh" before third paragraph**

Before the paragraph starting "Despite Zain-ul-Abaadin possessing...", add:

```svelte
<h3 class="prose-subheading">"Go Back to Bangladesh"</h3>
```

**Step 3: Add placeholder image after the Zain paragraph (fourth paragraph)**

After the paragraph starting "Zain describes a terrifying atmosphere..." (before the Barik paragraph about High Court), add:

```svelte
<div class="placeholder-image">
    <span>Photo: Displaced families at the edge of the river</span>
</div>
```

**Step 4: Add sub-heading "A Global Pattern" in The Pattern section**

After the fourth paragraph of The Pattern (ending "...Bengali Muslims in Assam."), before the paragraph starting "The bulldozer has emerged...", add:

```svelte
<h3 class="prose-subheading">A Global Pattern</h3>
```

**Step 5: Add pull quote after the UN Special Rapporteur paragraph**

After the paragraph about Balakrishnan Rajagopal (ending "...punish entire communities."), add:

```svelte
<div class="pull-quote">
    <p>"Uncanny similarity" between India's methods and Israel's conduct in Palestine.</p>
    <span class="pull-quote-source">UN Special Rapporteur Balakrishnan Rajagopal</span>
</div>
```

**Step 6: Verify**

Run `yarn dev`:
- [ ] Gray placeholder at top of The Displaced
- [ ] "Go Back to Bangladesh" sub-heading
- [ ] Second gray placeholder mid-section
- [ ] "A Global Pattern" sub-heading in The Pattern
- [ ] UN Special Rapporteur pull quote

**Step 7: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Add visual breaks to The Displaced and The Pattern sections"
```

---

## Task 7: Final Verification and Cleanup

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (if needed)

**Step 1: Full scroll-through verification**

Run `yarn dev` and scroll through the entire article. Verify every section:

- [ ] **Hero scrolly**: Dark background, 5 steps, white text — unchanged
- [ ] **Transition**: Smooth gradient dark → light
- [ ] **Maiful Naysa intro**: Warm parchment background, dark text, burgundy blockquote border
- [ ] **Transition**: Smooth gradient light → dark
- [ ] **Eviction scrolly**: Dark background — unchanged
- [ ] **Transition**: Smooth gradient dark → light (or dark → dark into Background scrolly)
- [ ] **Background scrolly**: 6 steps with text boxes, dark background, placeholder visuals
- [ ] **Transition**: Smooth gradient dark → light
- [ ] **Background prose bridge**: 2 paragraphs on warm background
- [ ] **Zain testimony**: Warm background, burgundy blockquote border
- [ ] **Transition**: Smooth gradient light → dark
- [ ] **Notice mosaic**: Dark background — unchanged
- [ ] **Transition**: Smooth gradient dark → light
- [ ] **Abdul Barik**: Warm background, burgundy blockquotes
- [ ] **Bulldozer Justice**: Placeholder image, burgundy pull quote, dark text
- [ ] **CM Rhetoric**: Pull quote, tweet stack on warm background
- [ ] **Supreme Court**: Pull quote with burgundy borders, contempt timeline with burgundy left border
- [ ] **Violence**: Placeholder image, burgundy timeline markers, dark text
- [ ] **Transition**: Smooth gradient light → dark
- [ ] **Map scrolly**: Dark background — unchanged
- [ ] **DemolitionGallery**: Unchanged
- [ ] **Transition**: Smooth gradient dark → light
- [ ] **Maiful Naysa continued**: Warm background
- [ ] **SatelliteComparison**: Check transition
- [ ] **Where the Land Goes**: Sub-headings, placeholder image, pull quote
- [ ] **The Displaced**: Placeholder images, sub-heading, blockquotes
- [ ] **HeadlineStack**: Check if it needs color updates (it's a standalone component)
- [ ] **The Pattern**: Sub-heading, pull quote
- [ ] **CM closing**: Blockquote on warm background
- [ ] **Transition**: Smooth gradient light → dark
- [ ] **Footer**: Burgundy accent headings (not gold), dark charcoal background
- [ ] **No horizontal overflow at any point**

**Step 2: Fix any issues found**

Address any visual issues discovered during the scroll-through. Common things to check:
- HeadlineStack component may need its own background color set to `#f5f0eb` if it inherits from the article container
- SatelliteComparison may need transition divs adjusted
- Links on dark backgrounds inside scrolly text boxes should use `#c9697f` — check if ScrollyTextBox handles this already or if we need a scoped override

**Step 3: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Final verification and cleanup for design overhaul"
```
