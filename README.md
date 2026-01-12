# TNH Storytelling SvelteKit

Interactive storytelling platform for **The New Humanitarian (TNH)**. This codebase powers data-driven visualizations, embeddable dashboards, and immersive editorial projects.

🌐 **Production**: [interactive.thenewhumanitarian.org](https://interactive.thenewhumanitarian.org)  
🧪 **Preview/Staging**: [preview.thenewhumanitarian.org](https://preview.thenewhumanitarian.org)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Projects](#projects)
- [Legacy Projects](#legacy-projects)
- [Deployment](#deployment)
- [Data Fetching](#data-fetching)
- [Embedding](#embedding)
- [Storybook](#storybook)

---

## Overview

This SvelteKit application serves as TNH's platform for:

- **Interactive maps** — Mapbox GL-powered visualizations (Gaza, Syria)
- **Data dashboards** — Embeddable, responsive data stories
- **Long-form narratives** — Immersive editorial experiences (Lebanon Displacement Diaries)
- **Embeddable widgets** — Timelines, counters, social embeds
- **Legacy projects** — Migrated content from a previous Gatsby JS codebase

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [SvelteKit](https://kit.svelte.dev/) with Svelte 5 |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Maps | [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) |
| Charts/Data | [D3.js](https://d3js.org/) |
| Animations | [GSAP](https://greensock.com/gsap/) |
| CMS | [Storyblok](https://www.storyblok.com/) |
| Hosting | [Vercel](https://vercel.com/) |
| Node Version | 22.17.0 (via NVM) |
| Package Manager | Yarn |

---

## Getting Started

### Prerequisites

- [NVM](https://github.com/nvm-sh/nvm) — Node Version Manager
- [Yarn](https://yarnpkg.com/) — Package manager
- Local SSL certificates (for HTTPS dev server)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd tnh-storytelling-sveltekit

# 2. Use the correct Node version
nvm use

# 3. Install dependencies
yarn install

# 4. Set up local SSL certificates (see HTTPS Setup below)

# 5. Start development server
yarn dev
```

The dev server runs at `https://localhost:5173` with HTTPS enabled.

### HTTPS Setup (Required)

The development server runs over **HTTPS** because the [Storyblok Visual Editor](https://www.storyblok.com/docs/editor/visual-editor) requires a secure connection to load your local preview. Without HTTPS, the Visual Editor iframe will be blocked by the browser.

**Generate certificates with mkcert:**

```bash
# 1. Install mkcert (macOS)
brew install mkcert
mkcert -install

# 2. Generate certificates for localhost
cd cert/
mkcert localhost

# 3. Rename to match expected filenames
mv localhost.pem localhost.pem
mv localhost-key.pem localhost-key.pem
```

The Vite config (`vite.config.ts`) expects these files at:
- `cert/localhost.pem`
- `cert/localhost-key.pem`

> 💡 **Tip**: If you see browser warnings about untrusted certificates, run `mkcert -install` to add the local CA to your system trust store.

### Environment Variables

Create a `.env` file in the project root:

```env
# Public (exposed to client)
PUBLIC_BASE_URL=https://interactive.thenewhumanitarian.org
PUBLIC_GA4_ID=G-XXXXXXXXXX

# Private (server-side only)
GA4_API_SECRET=your-ga4-api-secret
```

---

## Project Structure

```
tnh-storytelling-sveltekit/
├── src/
│   ├── lib/
│   │   ├── assets/          # Project-specific images & media
│   │   ├── components/      # Reusable Svelte components
│   │   │   ├── animations/  # Animation utilities
│   │   │   ├── gaza-map/    # Gaza dashboard components
│   │   │   ├── icons/       # Logo, share icons
│   │   │   ├── projects/    # Project-specific components
│   │   │   │   ├── LebanonDisplaced/
│   │   │   │   └── SyriaMap/
│   │   │   └── vendor/      # Third-party libraries (TimelineJS)
│   │   ├── data/            # Cached data (JSON, GeoJSON)
│   │   ├── stores/          # Svelte stores
│   │   └── utils/           # Helper functions
│   ├── routes/              # SvelteKit routes
│   │   ├── api/             # API endpoints
│   │   ├── dashboard/       # Admin dashboard
│   │   ├── embeddable/      # Embeddable widgets
│   │   │   ├── map/         # Map projects (Gaza, Syria)
│   │   │   ├── sharepoint/  # Social embeds
│   │   │   └── timeline-x/  # Timeline embeds
│   │   ├── login/           # Authentication
│   │   └── stories/         # Long-form narratives
│   └── stories/             # Storybook stories
├── static/                  # Static assets & legacy projects
│   └── scripts/             # Embeddable scripts
├── scripts/                 # Build-time data fetching
├── cert/                    # Local SSL certificates
└── .nvmrc                   # Node version (22.17.0)
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server with HTTPS |
| `yarn build` | Pre-fetch data and build for production |
| `yarn preview` | Preview production build locally |
| `yarn pre-fetch-data` | Fetch all project data (orchestrator) |
| `yarn pre-fetch-gaza` | Fetch Gaza map data only |
| `yarn check` | Run Svelte type checking |
| `yarn lint` | Run ESLint and Prettier |
| `yarn format` | Format code with Prettier |
| `yarn storybook` | Launch Storybook on port 6006 |
| `yarn build-storybook` | Build static Storybook |

---

## Projects

### Gaza Aid Seekers Dashboard

**Route**: `/embeddable/map/2025-09/gaza`  
**Live**: [interactive.thenewhumanitarian.org/embeddable/map/2025-09/gaza](https://interactive.thenewhumanitarian.org/embeddable/map/2025-09/gaza)

Interactive map and timeline showing incidents involving aid seekers in Gaza. Features:

- Mapbox GL map with markers and heatmap layers
- Animated timeline with weekly/monthly grouping
- Fullscreen mode (desktop) / new window (mobile)
- Embeddable via script tag
- Spotlight counter component for homepage features

### Lebanon Displacement Diaries

**Route**: `/stories/2025/05/22/lebanon-displacement-diaries`  
**Live**: [interactive.thenewhumanitarian.org/stories/2025/05/22/lebanon-displacement-diaries](https://interactive.thenewhumanitarian.org/stories/2025/05/22/lebanon-displacement-diaries)

Immersive long-form narrative with:

- Horizontal scroll sections
- Interactive scrapbook elements
- Arabic language support (`/ar`)
- Storyblok CMS integration
- GSAP animations

### Syria Map

**Route**: `/embeddable/map/2024-11/syria`  
**Live**: [interactive.thenewhumanitarian.org/embeddable/map/2024-11/syria](https://interactive.thenewhumanitarian.org/embeddable/map/2024-11/syria)

Interactive map of Syria with populated places data.

### Timeline Embeds

**Route**: `/embeddable/timeline-x/[sheetId]`

Dynamic timelines powered by Knight Lab's TimelineJS, configured via Google Sheets.

---

## Legacy Projects

This codebase consolidates projects from a previous **Gatsby JS** repository. Legacy static assets (HTML, CSS, JS, images) are hosted in the `/static` folder and served directly by Vercel.

These include older interactive pieces that were migrated to preserve their functionality without requiring a full rewrite. They are accessible via their original paths under the static directory.

---

## Deployment

The project is hosted on **Vercel** with automatic deployments:

| Branch | Environment | URL |
|--------|-------------|-----|
| `main` | Production | [interactive.thenewhumanitarian.org](https://interactive.thenewhumanitarian.org) |
| `preview` | Staging | [preview.thenewhumanitarian.org](https://preview.thenewhumanitarian.org) |
| Feature branches | Preview | Auto-generated Vercel preview URLs |

### Deployment Flow

1. Push to `main` or `preview` branch
2. Vercel triggers build automatically
3. Build script runs `pre-fetch-data.js` to cache external data
4. SvelteKit builds with `adapter-vercel`
5. Deployment goes live

---

## Data Fetching

The project uses a build-time data fetching system to cache external data sources.

### How It Works

- **Production**: Uses cached JSON data (fast, no external API calls)
- **Preview/Development**: Fetches fresh data on each build/request

### Adding New Data Sources

See [`scripts/README.md`](./scripts/README.md) for detailed documentation on:

- Creating new fetch scripts
- Adding data processors
- Configuring the orchestrator

---

## Embedding

Projects can be embedded on external websites using a simple script tag:

```html
<!-- Gaza Dashboard Embed -->
<div id="gaza-aid-killings"></div>
<script src="https://interactive.thenewhumanitarian.org/embeddable/map/2025-09/gaza/embed" defer></script>
```

The embed script:

- Injects responsive CSS (aspect ratios for different screen sizes)
- Creates an iframe with loading shimmer
- Sends anonymous usage tracking

### Custom Options

```html
<div id="my-custom-id"></div>
<script 
  src="https://interactive.thenewhumanitarian.org/embeddable/map/2025-09/gaza/embed"
  data-target="my-custom-id"
  data-src="https://custom-source-url"
  defer
></script>
```

---

## Storybook

Component development and documentation via Storybook:

```bash
yarn storybook
```

Opens at `http://localhost:6006`

---

## Demos

### SvelteKit Projects

| Project | URL |
|---------|-----|
| Gaza Aid Seekers Dashboard | [/embeddable/map/2025-09/gaza](https://interactive.thenewhumanitarian.org/embeddable/map/2025-09/gaza) |
| Gaza Spotlight Counter | [/embeddable/map/2025-09/gaza/spotlight](https://interactive.thenewhumanitarian.org/embeddable/map/2025-09/gaza/spotlight) |
| Lebanon Displacement Diaries (EN) | [/stories/.../lebanon-displacement-diaries/home](https://interactive.thenewhumanitarian.org/stories/2025/05/22/lebanon-displacement-diaries/home) |
| Lebanon Displacement Diaries (AR) | [/stories/.../lebanon-displacement-diaries/ar/home](https://interactive.thenewhumanitarian.org/stories/2025/05/22/lebanon-displacement-diaries/ar/home) |

### Legacy Projects (Gatsby)

| Project | URL |
|---------|-----|
| Year in Photos 2024 | [/stories/2024/12/27/year-in-photos](https://interactive.thenewhumanitarian.org/stories/2024/12/27/year-in-photos/) |
| Drawing Derna | [/stories/2023/11/28/art-time-crisis-drawing-derna](https://interactive.thenewhumanitarian.org/stories/2023/11/28/art-time-crisis-drawing-derna/) |
| WhatsApp Lebanon | [/stories/2022/07/28/whatsapp-lebanon](https://interactive.thenewhumanitarian.org/stories/2022/07/28/whatsapp-lebanon/) |
| Darién Gap Migration | [/stories/2022/05/10/us-asylum-darien-gap...](https://interactive.thenewhumanitarian.org/stories/2022/05/10/us-asylum-darien-gap-cuba-central-america-mexico/) |
| Rohingya Camp Women | [/stories/2021/12/21/bangladesh-rohinyga...](https://interactive.thenewhumanitarian.org/stories/2021/12/21/bangladesh-rohinyga-camp-women-illustration/) |
| Drawing Syria's Trauma | [/stories/2021/12/8/drawing-syrias-trauma](https://interactive.thenewhumanitarian.org/stories/2021/12/8/drawing-syrias-trauma/) |
| Mediterranean Migration | [/stories/2021/11/17/mediterranean-migration-europe](https://interactive.thenewhumanitarian.org/stories/2021/11/17/mediterranean-migration-europe/) |
| A Decade of War in Syria | [/stories/2021/a-decade-of-war-in-syria](https://interactive.thenewhumanitarian.org/stories/2021/a-decade-of-war-in-syria/) |
| Bangladesh Cyclone Amphan | [/stories/2020/bangladesh-amphan...](https://interactive.thenewhumanitarian.org/stories/2020/bangladesh-amphan-hidden-climate-costs/) |

### Annual Reports

| Report | URL |
|--------|-----|
| Annual Report 2023 | [/reports/2024/07/25/annual-report-2023](https://interactive.thenewhumanitarian.org/reports/2024/07/25/annual-report-2023/) |
| Annual Report 2022 | [/reports/2023/06/27/annual-report-2022](https://interactive.thenewhumanitarian.org/reports/2023/06/27/annual-report-2022/) |
| Our Strategy | [/reports/2022/12/05/our-strategy](https://interactive.thenewhumanitarian.org/reports/2022/12/05/our-strategy/) |
| Annual Report 2021 | [/reports/2022/06/27/annual-report-2021](https://interactive.thenewhumanitarian.org/reports/2022/06/27/annual-report-2021/) |

---

## Contributing

1. Create a feature branch from `preview`
2. Make changes and test locally
3. Push to trigger preview deployment
4. Merge to `preview` for staging
5. Merge to `main` for production

---

## License

© The New Humanitarian. All rights reserved.
