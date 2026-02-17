# Cleared Article Reorganization — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize the Cleared article (`src/routes/cleared/+page.svelte`) to match the final script (`Assam Investigation.md`), replacing all placeholder text, repositioning visual components, and merging relevant 18 Acres content.

**Architecture:** Single-file restructure of `+page.svelte`. The article is built from scrolly sections (sticky visual + scrolling text boxes) and prose content sections (dark-themed text blocks). All text comes verbatim from the script. Visual components (ScrollySection, EvictionScrolly, MapScrolly, NoticeMosaic, DemolitionGallery, SatelliteComparison, HeadlineStack) are repositioned to match script order. XNotificationStack is imported from 18 Acres.

**Tech Stack:** SvelteKit 2.x, Svelte 5 (runes), Tailwind CSS 3.4

**Primary file:** `src/routes/cleared/+page.svelte`

**Design doc:** `docs/plans/2026-02-17-cleared-reorganization-design.md`

**Script source:** `Assam Investigation.md` (root directory)

---

## Task 1: Update Hero ScrollySection Text

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (lines 22-64, heroSteps array)

**Step 1: Update heroSteps array**

Replace the existing `heroSteps` array with script-accurate text. Key changes:
- Step 1 text: Use exact script wording for Dhalpur shooting (line 11 of script)
- Step 2 text: Use full script paragraph for "A Campaign of Displacement" including BJP/NRC/CAA/Amit Shah context (lines 13-15 of script)
- Step 4 text: Add "The vast majority of those evicted are Bengali-speaking Muslims."

```javascript
const heroSteps = [
    {
        raw: true,
        text: `<div class="hero-header">
            <h1 class="hero-title">Cleared</h1>
            <p class="hero-desc">How Assam demolished the homes of 20,000 families</p>
            <div class="hero-byline">
                <p class="byline-label">By</p>
                <p class="byline-authors">Ahmer Khan and Tom Vaillant</p>
                <p class="byline-date">January 2026</p>
            </div>
            <div class="scroll-indicator">
                <div class="scroll-indicator-track">
                    <div class="scroll-indicator-dot"></div>
                </div>
            </div>
        </div>`
    },
    {
        title: 'September 23, 2021',
        text: 'In the early morning, police opened fire on a crowd in Dhalpur village, Darrang district. Two people died: Moinul Haque, 28, and Sheikh Farid, 12 years old. As Haque lay dying, a government photographer was filmed stomping on his body. Again. And again. The video went viral and became the image of a campaign that will reshape hundreds of thousands of lives.',
        source: {
            text: 'Al Jazeera',
            url: 'https://www.aljazeera.com/news/2021/9/29/assam'
        }
    },
    {
        title: 'A Campaign of Displacement',
        text: 'This was not an isolated incident. Between May 2021 and 2026, the Assam government conducted at least 33 documented eviction operations. More than 22,000 homes are demolished. The Assam government is led by the same party that governs at the federal level: the BJP. Chief Minister Himanta Biswa Sarma is widely seen as the BJP\'s poster boy for implementing the party\'s Hindu nationalist agenda. The eviction drives follow directly from federal policies like the National Register of Citizens and Citizenship Amendment Act, both passed by Modi\'s government. Federal Home Minister Amit Shah has repeatedly promised to take this model nationwide.'
    },
    {
        text: 'That\'s 165,000 people \u2013 or twice Wembley Stadium.'
    },
    {
        text: 'One eviction every three minutes, 24 hours a day, for an entire year. The vast majority of those evicted are Bengali-speaking Muslims.'
    }
];
```

**Step 2: Verify dev server renders correctly**

Run: `yarn dev` and check https://localhost:5173/cleared
Expected: Hero section shows 5 steps with updated text, images unchanged.

**Step 3: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Update hero section text to match final script"
```

---

## Task 2: Add Maiful Naysa Introduction Prose Section

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (template section, after Hero ScrollySection)

**Step 1: Add prose section after Hero ScrollySection**

Insert a new `<section>` after the hero `</ScrollySection>` closing tag (after line 301) and before the EvictionScrolly section:

```svelte
<!-- Maiful Naysa Introduction -->
<section class="content-section">
    <div class="content-container">
        <div class="prose-content">
            <p>
                Maiful Naysa, 65, says her family received an eviction notice in November and were given a month to respond. Before dawn, just a day after the deadline, bulldozers arrived.
            </p>

            <blockquote>
                "At five in the morning, while we were sleeping, three JCBs came and started demolishing our house."
            </blockquote>
        </div>
    </div>
</section>
```

**Step 2: Verify rendering**

Check that the prose section appears between hero and data viz sections.

**Step 3: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Add Maiful Naysa introduction after hero section"
```

---

## Task 3: Update EvictionScrolly Step Text

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (lines 67-104, evictionSteps array)

**Step 1: Update evictionSteps array**

Replace with script-accurate text. Key changes:
- Step 0: "More than 100,000 people were displaced across Assam between 2021 and 2026..."
- Step 2: Add Goalpara July 2025 detail ("In July 2025, in Goalpara district, over 1,080 families were evicted... One killed, 15 injured.")
- Step 3: Use "USD 4.75 billion" instead of "Rs 48,000 crore"

```javascript
const evictionSteps = [
    {
        text: 'More than 100,000 people were displaced across Assam between 2021 and 2026 in 33 documented eviction drives. Each bubble represents one operation \u2014 the larger the bubble, the more people displaced.'
    },
    {
        text: 'The government cited various legal grounds for these evictions. We\'ve grouped them into <strong>four categories</strong>.'
    },
    {
        text: 'The largest category: <span class="highlight-env">Environmental Protection</span> \u2014 forest clearances, wildlife sanctuaries, elephant corridors. Twelve operations are conducted. These operations affected more than 60,000 people. In July 2025, in Goalpara district, over 1,080 families were evicted from Haseela Beel and Paikan Reserve Forest. One killed, 15 injured.'
    },
    {
        text: '<span class="highlight-dev">Development Projects</span> cleared land for corporate investment, including the USD 4.75 billion allegedly allocated to Adani thermal power plant in Dhubri.'
    },
    {
        text: '<span class="highlight-admin">Administrative Enforcement</span> targeted alleged "encroachers" on government land, including controversial border pushbacks to Bangladesh.'
    },
    {
        text: '<span class="highlight-satra">Religious Land (Satra)</span> evictions cleared land claimed by Hindu monasteries in Barpeta and Nagaon districts.'
    },
    {
        text: 'What is unfolding in Assam is not a series of sporadic clearances but an increasingly institutionalised campaign of dispossession. Here\'s when each operation occurred.'
    },
    {
        text: '<strong>2021:</strong> The campaign began with 4 major operations. The deadliest: <a href="https://indianexpress.com/article/north-east-india/assam/assam-eviction-violence-two-deaths-clashes-7532641/" target="_blank" rel="noopener">Dhalpur</a>, where police shot two people dead.'
    },
    {
        text: '<strong>2025:</strong> The busiest year \u2014 11 documented eviction operations across Assam.'
    },
    {
        text: 'But it\'s not just the frequency. The <strong>scale</strong> of each operation has grown dramatically.'
    },
    {
        text: '<strong>2021:</strong> Around 14,000 people evicted across all operations.'
    },
    {
        text: '<strong>2025:</strong> More than 40,000 people evicted \u2014 nearly <strong>three times</strong> the 2021 total.'
    }
];
```

**Step 2: Verify rendering**

Check bubble chart and timeline steps display updated text.

**Step 3: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Update eviction scrolly text to match final script"
```

---

## Task 4: Add Background + Zain-ul-Abadin Prose Sections

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (template, after EvictionScrolly section and before NoticeMosaic)

**Step 1: Add Background prose section**

Insert after the EvictionScrolly `</ScrollySection>` and before the NoticeMosaic section. Use text from script lines 44-63.

```svelte
<!-- Background Section -->
<section class="content-section">
    <div class="content-container">
        <h2 class="content-heading">Background</h2>

        <div class="prose-content">
            <p>
                Assam lies along the Brahmaputra, one of the world's largest rivers. Every monsoon season, it floods, swallowing villages and forcing families to rebuild from scratch. Displacement here is not new. It is a way of life.
            </p>

            <p>
                Many of those now facing eviction are Miya Muslims, Bengali-speaking Muslims whose ancestors migrated from the Bengal region, parts of which is now Bangladesh, to Assam during the colonial period and settled on low-lying river islands called chars. These were marginal, flood-prone strips of land that nobody else wanted. Their forefathers had little choice. Many settled there 50 to 60 years ago after losing their original homes and farmland to the Brahmaputra's relentless erosion. Over generations, they cleared the land, farmed it, and built communities on it.
            </p>

            <p>
                The word "Miya" was once a term of respect. Today, it is used as a slur to mark Bengali-speaking Muslims as outsiders, regardless of how long they have lived in Assam or whether they hold legal citizenship documents.
            </p>

            <p>
                But since 2016, these communities have faced a different kind of uprooting: government-led eviction drives targeting what officials call "illegal encroachments". It is a label with consequences. In Myanmar, the same logic was applied to Rohingya Muslims for decades, branding an entire community as illegal immigrants on land they had lived on for generations.
            </p>

            <p>
                The Assam government frames these evictions as action against "illegal immigrants" from Bangladesh. But the story is more complicated. Many of those being displaced are Bengali-speaking Muslims whose families arrived after 1947, when Partition divided Bengal along religious lines. Some came with official permission from the government of what is now India. Others were given land by the Indian state itself, often unproductive char lands that the government was eager to have cultivated. By the time the evictions began, many had been living in Assam for 50 to 70 years.
            </p>

            <p>
                More than one third of Assam's 31 million people are Muslim \u2013 one of the highest proportions of any Indian state. That demographic reality has made Assam a focal point of a broader national shift. In recent years, the BJP-led government of Narendra Modi has faced repeated accusations of enacting laws and policies that specifically target India's <a href="https://www.aljazeera.com/news/2024/3/11/india-implements-anti-muslim-2019-citizenship-law-weeks-before-election" target="_blank" rel="noopener">200 million Muslims</a>, from the Citizenship Amendment Act, which critics say deliberately excludes Muslims from a fast-tracked citizenship pathway, to the National Register of Citizens, which left millions stateless. In Assam, these national policies have found their sharpest expression.
            </p>

            <p>
                What makes these evictions particularly troubling is that many families held Patta \u2013 official land titles issued by the Assam government \u2013 along with ration cards and voter IDs, documents that under Indian law establish legal residence and citizenship.
            </p>

            <p>
                Some Pattas dated back decades, proof that the state itself had recognised their right to the land. Yet documented cases show Patta-holders being evicted without warning, without due process, their legal papers rendered meaningless overnight.
            </p>

            <p>
                The National Register of Citizens (NRC), initiated after the right-wing BJP came to power in 2016 and concluded in 2019, was designed to identify who qualified as an Indian citizen in Assam. To be included, residents had to prove that they or their families arrived in Assam before March 24, 1971 \u2013 the eve of Bangladesh's independence from Pakistan. The final list excluded over more than million people, roughly 6% of Assam's population, who failed to meet this requirement. Many were poor. Most were Muslim.
            </p>

            <p>
                The process was not free from error or bias. Legitimate citizens were excluded on the basis of technical errors, spelling mistakes, and documentation challenges. Several detention centres were established, including India's largest dedicated detention centre opened in Goalpara designed to house up to 3,500 people. In some cases, children were separated from their parents. For many of the evicted, there is literally nowhere legal to go.
            </p>
        </div>
    </div>
</section>
```

**Step 2: Add Zain-ul-Abadin testimony**

Immediately after Background, still before NoticeMosaic:

```svelte
<!-- Zain-ul-Abadin Testimony -->
<section class="content-section">
    <div class="content-container">
        <div class="prose-content">
            <p>
                For Zain-ul-Abadin, a 43-year-old resident of Uriamghat in Assam's Golaghat district, the eviction represents more than the loss of a home. He says his family was among those encouraged by the Assam government to settle in the late 1970s in a border belt along Nagaland, then considered a disputed zone. The long-running land dispute has triggered repeated bouts of violent clashes over the decades. Two major confrontations in 1979 and 1985 left more than 100 people dead. In the 1970s, the Assam government settled landless communities in this zone as part of a strategy to strengthen its territorial claims. According to Zain-ul-Abadin, his family was part of that policy. Now, decades later, the same government is demolishing the settlement it once built.
            </p>

            <p>
                The families of those civilians are now being labelled as "foreigners".
            </p>

            <blockquote>
                "My father and grandfather lived here. We came from another part of the state to Uriamghat because the government told us to settle here to protect the land of Assam. This has been going on for 80 or 90 years. We grew up in poverty and built our houses with hard labour."
            </blockquote>
        </div>
    </div>
</section>
```

**Step 3: Verify rendering**

Check that Background and Zain sections appear between data viz and notice mosaic.

**Step 4: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Add Background and Zain-ul-Abadin testimony sections"
```

---

## Task 5: Add Abdul Barik Testimony After NoticeMosaic

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (template, after NoticeMosaic section and before Map section)

**Step 1: Add prose section after NoticeMosaic**

Insert after NoticeMosaic `</ScrollySection>` and before the map section div:

```svelte
<!-- Abdul Barik Testimony -->
<section class="content-section">
    <div class="content-container">
        <div class="prose-content">
            <p>
                In the early hours of July 12, 2025, the Asadubi Revenue Village, a community that had stood for over seven decades, was met with the mechanical roar of bulldozers. Among the 1,080 families displaced was Abdul Barik, a man who insists that his presence there was not an act of "encroachment," but a matter of documented rights.
            </p>

            <blockquote>
                "Our village is 70-75 years old. It was not forest land; it was Pattaland. We showed our documents to the District Officer, but they were rejected. It was written in the papers that this land is 'not indigenous' and reserved for public development."
            </blockquote>

            <blockquote>
                "Nearly 60 bulldozers came early morning around 6am and bulldozed our village, including our houses."
            </blockquote>
        </div>
    </div>
</section>
```

**Step 2: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Add Abdul Barik testimony after notice mosaic"
```

---

## Task 6: Add "Bulldozer Justice" Prose Section

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (template, after Abdul Barik)

**Step 1: Add "Bulldozer justice" section**

Insert after Abdul Barik testimony. Uses pull quotes for visual breaks. Text from script lines 93-99.

```svelte
<!-- Bulldozer Justice Section -->
<section class="content-section">
    <div class="content-container">
        <h2 class="content-heading">"Bulldozer justice"</h2>

        <div class="prose-content">
            <p>
                In India, the yellow JCB bulldozer has taken on a meaning far beyond its function as a machine. Since 2017, the brand name has become almost generic in the country \u2013 used interchangeably with "bulldozer", especially during state-led demolition drives that critics say bypass due process. Amnesty International verified at least <a href="https://www.amnesty.org/en/latest/news/2024/02/india-authorities-must-immediately-stop-unjust-targeted-demolition-of-muslim-properties/" target="_blank" rel="noopener">33 instances</a> of JCB equipment being used in what it described as punitive demolitions of Muslim properties across five states.
            </p>

            <p>
                The practice has acquired its own name: "<a href="https://www.bbc.com/news/articles/c0k8d3ynvzxo" target="_blank" rel="noopener">bulldozer justice</a>", a term used for demolitions that are openly celebrated by BJP leaders and their supporters. Amnesty International had described JCB as the "<a href="https://www.amnesty.org/en/latest/news/2024/02/india-authorities-must-immediately-stop-unjust-targeted-demolition-of-muslim-properties/" target="_blank" rel="noopener">brand of choice in a hate campaign against the minority community</a>". Over time, the yellow excavator itself has become a potent political symbol for the use of demolitions as a show of state power against marginalized communities.
            </p>

            <p>
                <a href="https://www.ohchr.org/en/press-releases/2025/06/india-must-halt-arbitrary-demolitions-targeting-minorities-and-marginalised" target="_blank" rel="noopener">Rights groups</a> and <a href="https://www.codastory.com/authoritarian-tech/india-bulldozers-muslim-neighborhoods/" target="_blank" rel="noopener">legal scholars</a> often draw parallels between India's "bulldozer justice" and Israel's long-standing practice of demolishing Palestinian homes in the occupied territories. Since 1948, Israel has used home demolitions as a central tool of displacement against Palestinians, demolishing more than <a href="https://www.palestineportal.org/learn-teach/key-issues/home-demolitions/" target="_blank" rel="noopener">26,000 homes since 1967</a> alone. The justification is almost always the same: illegal construction, encroachment, or a bureaucratic infraction.
            </p>
        </div>
    </div>
</section>
```

**Step 2: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Add Bulldozer justice prose section"
```

---

## Task 7: Add CM Rhetoric + XNotificationStack + Supreme Court Sections

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (imports + template)

**Step 1: Add XNotificationStack import**

Add to the imports at the top of the `<script>` block:

```javascript
import XNotificationStack from '$lib/components/XNotificationStack.svelte';
```

Add state variable:

```javascript
let notificationsTriggered = $state(false);
```

**Step 2: Add CM Rhetoric section with XNotificationStack**

Insert after "Bulldozer justice" section. Text from script lines 101-105.

```svelte
<!-- CM Rhetoric Section -->
<section class="content-section">
    <div class="content-container">
        <div class="prose-content">
            <p>
                The language driving these evictions in Assam has been sharply polarising. Chief Minister Himanta Biswa Sarma has a long record of Islamophobic rhetoric, frequently framing Bengali-speaking Muslims as "Bangladeshi encroachers" and a demographic threat to justify the state's aggressive displacement policies.
            </p>

            <p>
                This reached a violent peak in February 2026, when the Assam BJP's official X account posted a <a href="https://x.com/MahuaMoitra/status/2020444649857351865" target="_blank" rel="noopener">video</a> of an AI-generated Sarma aiming and firing a rifle at Muslims, captioned "point blank shot". Though deleted after a massive outrage by the public and opposition leaders, who warned it was a direct incitement to violence against minorities.
            </p>

            <p>
                Concerns about the chief minister's language have also been raised by a group of more than 180 scholars, lawyers, and activists issued a joint <a href="https://thewire.in/communalism/himanta-government-policies-hallmarks-ethnic-cleansing-statement" target="_blank" rel="noopener">statement</a> condemning Sarma's relentless "hateful and divisive" remarks, warning that such state-led rhetoric fundamentally threatens constitutional rights and the safety of minority rights.
            </p>
        </div>
    </div>

    <!-- CM Tweets -->
    <div class="content-container" style="margin-top: 2rem;">
        <XNotificationStack
            autoTrigger={false}
            triggerDelay={200}
            externalTrigger={notificationsTriggered}
        />
    </div>
</section>
```

Add an `inview` handler to trigger the notifications when scrolled into view. Import `inview` from `svelte-inview` at the top:

```javascript
import { inview } from 'svelte-inview';
```

Wrap the XNotificationStack container with inview:

```svelte
<div
    class="content-container"
    style="margin-top: 2rem;"
    use:inview={{ rootMargin: '-20% 0px -20% 0px' }}
    oninview_change={(e) => { if (e.detail.inView) notificationsTriggered = true; }}
>
```

**Step 3: Add Supreme Court Directives section**

Insert after CM Rhetoric. Text from script lines 107-117. Includes pull quote and contempt timeline.

```svelte
<!-- Supreme Court Directives -->
<section class="content-section">
    <div class="content-container">
        <h2 class="content-heading">The Courts</h2>

        <div class="prose-content">
            <p>
                In November 2024, India's top court issued landmark directives to curb arbitrary demolitions. The ruling established strict safeguards: 15-day mandatory notice before any demolition, videographed proceedings, written reasons for action, and the right to be heard.
            </p>
        </div>

        <!-- Pull Quote -->
        <div class="pull-quote">
            <p>"The executive cannot become the Judge."</p>
            <span class="pull-quote-source">Supreme Court of India, November 2024</span>
        </div>

        <div class="prose-content">
            <p>
                Assam's BJP government, led by Chief Minister Himanta Biswa Sarma, appeared unmoved.
            </p>

            <p>
                Between late 2024 and mid-2025, the state proceeded with mass evictions in Muslim-majority areas \u2013 demolitions that would lead India's highest court to issue two contempt notices against the Assam government, one in <a href="https://www.deccanchronicle.com/nation/assam-govt-gets-contempt-notice-from-supreme-court-for-bulldozer-action-1827032" target="_blank" rel="noopener">September 2024</a> and another in <a href="https://lawbeat.in/news-updates/supreme-court-issues-notice-on-contempt-plea-against-assams-goalpara-demolitions-1513859" target="_blank" rel="noopener">July 2025</a>.
            </p>

            <p>
                But Assam was not alone in defying judicial authority. In April 2022, the Supreme Court had to issue its <a href="https://www.thehindu.com/news/cities/Delhi/supreme-court-halts-eviction-drive-in-delhis-jahangirpuri/article65337761.ece" target="_blank" rel="noopener">order</a> twice to stop demolitions in Delhi's Jahangirpuri neighbourhood, as <a href="https://www.ndtv.com/india-news/supreme-court-halts-demolition-in-delhis-violence-hit-jahangirpuri-orders-status-quo-hearing-tomorrow-2902922" target="_blank" rel="noopener">bulldozers kept moving</a> for an hour after the first order.
            </p>

            <p>
                In Gujarat, thousands of homes in Muslim-majority settlements around Ahmedabad's Chandola Lake were <a href="https://article-14.com/post/the-hunt-for-bangladeshis-thousands-of-muslims-homeless-2-months-after-vast-gujarat-demolition-688fd625e41f6" target="_blank" rel="noopener">demolished in 2025</a> in a campaign framed as a crackdown on "illegal Bangladeshis", leaving families homeless for months.
            </p>

            <p>
                The bulldozers continued to roll, raising a fundamental question about the limits of judicial authority when state power refuses to yield.
            </p>
        </div>

        <!-- Contempt Timeline -->
        <div class="contempt-timeline">
            <div class="contempt-event">
                <span class="contempt-date">Nov 2024</span>
                <span class="contempt-desc">Supreme Court issues landmark ban on bulldozer justice</span>
            </div>
            <div class="contempt-event">
                <span class="contempt-date">Sep 2024</span>
                <span class="contempt-desc">First contempt notice against Assam government</span>
            </div>
            <div class="contempt-event">
                <span class="contempt-date">Jul 2025</span>
                <span class="contempt-desc">Second contempt notice against Assam government</span>
            </div>
        </div>
    </div>
</section>
```

**Step 4: Add CSS for pull quote and contempt timeline**

Add to the `<style>` block:

```css
/* Pull quotes */
.pull-quote {
    margin: 3rem 0;
    padding: 2rem 0;
    border-top: 2px solid rgba(255, 255, 255, 0.1);
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    text-align: center;
}

.pull-quote p {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 500;
    font-style: italic;
    line-height: 1.4;
    color: #ffffff;
    margin: 0 0 0.75rem 0;
}

.pull-quote-source {
    font-family: 'Source Sans 3', system-ui, sans-serif;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Contempt timeline */
.contempt-timeline {
    margin: 2rem 0;
    padding-left: 1.5rem;
    border-left: 2px solid rgba(255, 255, 255, 0.15);
}

.contempt-event {
    padding: 0.75rem 0 0.75rem 1rem;
    display: flex;
    gap: 1rem;
    align-items: baseline;
}

.contempt-date {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    white-space: nowrap;
    min-width: 5rem;
}

.contempt-desc {
    font-family: 'Source Sans 3', system-ui, sans-serif;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
}
```

**Step 5: Verify rendering**

Check CM rhetoric, tweets, and Supreme Court sections render correctly.

**Step 6: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Add CM rhetoric with tweet stack and Supreme Court sections"
```

---

## Task 8: Expand The Violence + Add Barik Continued

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (existing Violence content section)

**Step 1: Rewrite The Violence section**

Replace the existing Violence content section. Expand from 4 to 7 events (10 deaths total). Add Abdul Barik's continued testimony about road digging and hospital-to-jail. Text from script lines 121-148.

The Violence section moves to after the Supreme Court section (before the map). Remove it from its current position and place it in the new location.

Key additions:
- September 21, 2016 — Kaziranga (2 killed)
- March 11, 2019 — Hojai (Kulsuma Begum, pregnant)
- July 17-18, 2023 — Burha Chapori (Rahima Khatun)
- Barik testimony: road dug, hospital-to-jail

```svelte
<!-- The Violence -->
<section class="content-section">
    <div class="content-container">
        <h2 class="content-heading">The Violence</h2>

        <div class="prose-content">
            <p>At least 10 people have been killed during eviction drives since the BJP came to power in 2016.</p>

            <div class="timeline-events">
                <div class="event">
                    <p class="event-date">September 21, 2016 — <a href="https://www.ndtv.com/guwahati-news/two-dead-as-eviction-drive-near-kaziranga-national-park-turns-violent-1460443" target="_blank" rel="noopener">Near Kaziranga National Park</a>, Nagaon district</p>
                    <p>Two killed during a violent eviction drive.</p>
                </div>
                <div class="event">
                    <p class="event-date">March 11, 2019 — <a href="https://www.aljazeera.com/news/2019/3/25/in-indias-assam-muslim-families-evicted-weeks-before-elections" target="_blank" rel="noopener">Hojai district</a></p>
                    <p>Heavily pregnant Kulsuma Begum succumbed to her injuries.</p>
                </div>
                <div class="event">
                    <p class="event-date">September 23, 2021 — <a href="https://indianexpress.com/article/north-east-india/assam/assam-eviction-violence-two-deaths-clashes-7532641/" target="_blank" rel="noopener">Dhalpur, Darrang</a></p>
                    <p>Moinul Haque (28) and Sheikh Farid (12) killed by police firing. 20 injured.</p>
                </div>
                <div class="event">
                    <p class="event-date">April 1, 2022 — <a href="https://www.youtube.com/watch?v=t2xSk2iULO8" target="_blank" rel="noopener">Purana Bazar, Hojai</a></p>
                    <p>One person died amid eviction for flyover construction.</p>
                </div>
                <div class="event">
                    <p class="event-date">July 17\u201318, 2023 — <a href="https://indianexpress.com/article/north-east-india/assam/woman-shot-dead-6-including-3-guards-injured-clash-assam-wildlife-sanctuary-8844594/" target="_blank" rel="noopener">Burha Chapori Wildlife Sanctuary</a>, Sonitpur</p>
                    <p>Rahima Khatun was shot dead by forest officials during clashes after eviction.</p>
                </div>
                <div class="event">
                    <p class="event-date">September 12, 2024 — <a href="https://www.newindianexpress.com/nation/2024/Sep/12/two-muslims-killed-after-police-opened-fire-at-villagers-during-eviction-drive-in-assams-sonapur" target="_blank" rel="noopener">Kachutali, Sonapur</a></p>
                    <p>Haidar Ali (19) and Jubahir Ali (18) killed, 33 injured during "tribal belt protection" eviction.</p>
                </div>
                <div class="event">
                    <p class="event-date">July 17, 2025 — <a href="https://www.newindianexpress.com/nation/2025/Jul/17/eviction-drive-in-assams-goalpara-turns-violent-one-killed-in-police-firing" target="_blank" rel="noopener">Paikan Reserve Forest, Goalpara</a></p>
                    <p>Shakaur Ali killed and several injured during forest eviction clearance.</p>
                </div>
            </div>

            <p>
                The eviction was not merely a demolition; it was followed by what Barik describes as a calculated attempt to isolate the survivors. After the houses were levelled, the administration took physical steps to ensure no aid reached the displaced families living under tarpaulins.
            </p>

            <blockquote>
                "With a JCB, they dug a massive pit in the middle of the road... This road was used for organisations to help us with food, water, and tarpaulins. They beat us up. They shot us. One of us died... the injured people were brought from the hospital and straight away put in jail."
            </blockquote>
        </div>
    </div>
</section>
```

**Step 2: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Expand Violence section to 7 events with Barik testimony"
```

---

## Task 9: Reorganize Template — Map, Gallery, Naysa, Satellite, Land, Displaced

**Files:**
- Modify: `src/routes/cleared/+page.svelte` (major template restructure)

This is the biggest task. The remaining sections need to be reordered to match the script. The current order in the template is:

**Current:** NoticeMosaic → Map → Gallery → Violence → Satellite → Land → Displaced → Headlines → Pattern → CM Words → Continue → Footer

**Target:** (sections already added above) → Violence → Map → Gallery → Maiful Naysa Continued → Satellite → Land → Displaced → (placeholder map) → Headlines → Pattern → CM Words → Footer

**Step 1: Restructure the template**

After the Violence section (Task 8), the remaining sections should appear in this order:

1. MapScrolly (already exists, just repositioned)
2. DemolitionGallery (already exists, move after map)
3. **NEW:** Maiful Naysa Continued prose section
4. SatelliteComparison (already exists, move after Naysa)
5. Where the Land Goes (expand existing)
6. The Displaced (expand existing)
7. Visual placeholder for migration map
8. HeadlineStack (keep)
9. The Pattern + Global Parallels (expand)
10. CM's Final Words (update)
11. Footer (update, remove "Continue to Part II")

For the **Maiful Naysa Continued** section:

```svelte
<!-- Maiful Naysa Continued -->
<section class="content-section">
    <div class="content-container">
        <div class="prose-content">
            <p>
                Maiful Naysa, 65, says her family received an eviction notice in November and were given a month to respond. Before dawn, just a day after the deadline, evictions began.
            </p>

            <blockquote>
                "We had a solid house, a shop, and four rooms. Everything was settled. Now we have nothing."
            </blockquote>

            <p>
                For Naysa and her family, the demolition was not just the removal of a structure, but the erasure of a lifetime of labour. Despite holding land titles and tax receipts, they watched from behind a police cordon as their "dream house" was reduced to rubble in seconds.
            </p>

            <ul class="before-after-list">
                <li><strong>The Past:</strong> Sturdy walls, a family shop, and a barricade that kept the wildlife out.</li>
                <li><strong>The Present:</strong> A plastic tent, no income, and the nightly terror of wild elephants.</li>
            </ul>
        </div>
    </div>
</section>
```

**Step 2: Expand "Where the Land Goes"**

Replace the existing brief section with full script text (lines 192-204). Include Adani, iron ore, Advantage Assam 2.0, Karbi Anglong tribal transfers, Wire/Crosscurrent investigation, RBS Realtors, Vasistha Realtors.

**Step 3: Expand "The Displaced"**

Replace existing brief section with full script text (lines 206-226). Include Zain continued ("go back to Bangladesh"), Barik continued (High Court defiance), RSS context.

**Step 4: Expand "The Pattern" with Global Parallels**

Add global parallels (lines 242-250): Israel, Paraguay, Guatemala, UN Special Rapporteur quote.

**Step 5: Update CM closing**

Replace with script's final quote: "My job is to make the Miya people suffer" with link. Add Mir Wafa Raseeq credit.

**Step 6: Remove "Continue to Part II" section**

Delete the entire `continue-section` block and its CSS.

**Step 7: Update footer credits**

Add "Additional research: Mir Wafa Raseeq" to the credits column.

**Step 8: Add CSS for before-after list**

```css
.before-after-list {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0;
}

.before-after-list li {
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.before-after-list li strong {
    color: #ffffff;
}
```

**Step 9: Verify full article flow**

Run dev server and scroll through the entire article confirming all sections appear in order.

**Step 10: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Reorganize remaining sections to match final script order"
```

---

## Task 10: Final Cleanup

**Files:**
- Modify: `src/routes/cleared/+page.svelte`

**Step 1: Remove unused imports**

Check if any imports are no longer needed (e.g., if the inline CM video is gone, verify no unused references).

**Step 2: Remove unused CSS**

Delete CSS for removed elements:
- `.continue-section`, `.continue-link`, `.continue-content`, `.continue-label`, `.continue-title`, `.continue-subtitle`, `.continue-arrow` and all related styles
- `.cm-video-container`, `.cm-video`, `.cm-video-overlay`
- `.visual-placeholder` (if no longer used)

**Step 3: Remove unused state variables**

Check for any state variables that are no longer used after restructuring.

**Step 4: Final verification**

Run `yarn dev` and scroll through entire article. Verify:
- [ ] Hero: 5 steps with correct text
- [ ] Maiful Naysa intro appears after hero
- [ ] EvictionScrolly: 12 steps with script text
- [ ] Background: ~10 paragraphs of context
- [ ] Zain-ul-Abadin testimony with blockquote
- [ ] NoticeMosaic: 4 notices
- [ ] Abdul Barik testimony with blockquotes
- [ ] "Bulldozer justice" section with links
- [ ] CM Rhetoric with XNotificationStack tweets
- [ ] Supreme Court with pull quote and contempt timeline
- [ ] The Violence: 7 events + Barik continued
- [ ] MapScrolly: 7 steps
- [ ] DemolitionGallery
- [ ] Maiful Naysa continued with before/after
- [ ] SatelliteComparison
- [ ] Where the Land Goes (expanded with 18 Acres summary)
- [ ] The Displaced (expanded)
- [ ] HeadlineStack
- [ ] The Pattern + Global Parallels
- [ ] CM closing with final quote
- [ ] Footer with Mir Wafa Raseeq credit
- [ ] No "Continue to Part II" link
- [ ] No horizontal overflow
- [ ] Smooth transitions between sections

**Step 5: Commit**

```bash
git add src/routes/cleared/+page.svelte
git commit -m "Clean up unused imports, CSS, and state after reorganization"
```
