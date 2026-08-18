# TNH Storytelling SvelteKit

A storytelling platform for The New Humanitarian built with SvelteKit.

## Quick Start

```bash
nvm use            # Reads .nvmrc => Node 24 LTS
corepack enable    # Activates pnpm 11 pinned in package.json#packageManager
pnpm install       # Install dependencies
pnpm dev           # Start dev server (HTTPS)
```

Then open: `https://localhost:5173`

## Tech Stack

- **Framework**: SvelteKit 2.x with Svelte 5
- **Styling**: Tailwind CSS 4 (CSS-first via `@tailwindcss/vite`)
- **Animations**: GSAP 3.15 with ScrollTrigger
- **CMS**: Storyblok (headless CMS, pinned to v4 — v5/v6 migration is a separate task)
- **Maps**: Mapbox GL JS
- **Data Viz**: D3.js
- **Runtime**: Node 24 LTS (Vercel default)
- **Package Manager**: pnpm 11 (via Corepack)

## Project Structure

```
/src
  /lib
    /components     # Reusable Svelte components
      /animations   # FadeIn, scroll-triggered animations
      /projects     # Project-specific components (LebanonDisplaced, etc.)
      /gaza-map     # Gaza map components
    /stores         # Svelte stores (device, lightbox)
    /utils          # Utility functions (storyblok.ts)
    /assets         # Component assets (SVGs, patterns)
  /routes           # SvelteKit file-based routing
    /stories        # Long-form narrative projects
    /embeddable     # Embeddable widgets (maps, timelines)
    /api            # API endpoints
/static             # Static assets (images, fonts, audio, video)
/scripts            # Build-time data fetching scripts
```

## Commands

| Command          | Description                                 |
| ---------------- | ------------------------------------------- |
| `pnpm dev`       | Start HTTPS dev server                      |
| `pnpm build`     | Build for production (runs pre-fetch first) |
| `pnpm preview`   | Preview production build                    |
| `pnpm check`     | TypeScript type checking                    |
| `pnpm lint`      | ESLint + Prettier                           |
| `pnpm storybook` | Launch Storybook on port 6006               |

## Creating New Stories/Projects

### 1. Create a new route

```
/src/routes/your-project-name/+page.svelte
```

### 2. Use existing scroll patterns

**svelte-inview** (simple viewport detection):

```svelte
<script>
	import { inview } from 'svelte-inview';
	let isInView = $state(false);
</script>

<div use:inview={{ rootMargin: '-50%' }} oninview_change={(e) => (isInView = e.detail.inView)}>
	{#if isInView}
		<!-- Content appears when in view -->
	{/if}
</div>
```

**GSAP ScrollTrigger** (advanced animations):

```svelte
<script>
	import { onMount } from 'svelte';

	onMount(async () => {
		const gsap = (await import('gsap')).default;
		const ScrollTrigger = (await import('gsap/ScrollTrigger')).default;
		gsap.registerPlugin(ScrollTrigger);

		gsap.to('.element', {
			scrollTrigger: {
				trigger: '.container',
				start: 'top center',
				end: 'bottom center',
				scrub: 1
			},
			opacity: 1
		});
	});
</script>
```

### 3. Add static assets

Place images, audio, video in `/static/` - they're served at root path:

- `/static/images/my-project/photo.jpg` → `/images/my-project/photo.jpg`

## Deployment

- **Preview**: Push to `preview` branch → auto-deploys to `https://preview.thenewhumanitarian.org/`
- **Production**: Push to `main` branch → auto-deploys to production

Both are hosted on Vercel.

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `STORYBLOK_TOKEN` - Storyblok API token
- `PUBLIC_BASE_URL` - Base URL for the site

## Key Libraries Already Installed

- `svelte-inview` - Intersection observer for scroll triggers
- `gsap` - Animation library with ScrollTrigger
- `@storyblok/svelte` - CMS integration
- `mapbox-gl` - Interactive maps
- `d3` - Data visualization
- `swiper` - Carousel/slider
- `tippy.js` - Tooltips

## Storyblok Integration

Stories are fetched from Storyblok CMS. See `/src/lib/utils/storyblok.ts` for:

- `loadStory(slug, lang)` - Load a single story
- `loadAllStoriesExcept(slug, lang)` - Load multiple stories
- `useStoryblok()` - Enable visual editor

## Multi-language Support

RTL (Arabic) is supported. Check `isRtl` prop in components for layout adjustments.
Arabic routes typically live under `/ar/` subdirectory.

## Current Articles

### Cleared (`/src/routes/cleared/`)

Investigation into Assam's mass eviction campaign displacing 20,000+ families since 2021. Features:

- Scrollytelling with fixed background images
- EvictionScrolly data visualization (bubble chart + line graph)
- NoticeMosaic: scroll-triggered mosaic of eviction notice documents with scattered "evidence board" layout and animated text placard showing recipient names and excerpts

**Components:** All under `src/lib/components/cleared/`

- `cleared/evictions/` - EvictionScrolly, EvictionBubbles, EvictionLineGraph
- `cleared/scrolly/` - ScrollySection, ScrollyHelper, ScrollyTextBox, NoticeMosaic, HeadlineStack, HeadlineCard
- `cleared/` - XNotificationStack, XNotification, MapScrolly, StadiumWipeVisualization, SatelliteComparison, SatelliteScrolly, SatelliteSlider, VideoHeroVisualization, EditorialGallery, DemolitionGallery, ExpandableInfobox

**Data:** `src/lib/data/cleared/infoboxes-cleared.json`, `static/data/cleared/`

**Assets:** `static/images/cleared/` (notices/, miya/, satellite/, stadium/, villages/), `static/videos/cleared/`
