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

| Category        | Technology                                                                    | Version                                 |
| --------------- | ----------------------------------------------------------------------------- | --------------------------------------- |
| Framework       | [SvelteKit](https://kit.svelte.dev/)                                          | 2.x                                     |
| UI              | [Svelte](https://svelte.dev/)                                                 | 5.x                                     |
| Bundler         | [Vite](https://vite.dev/)                                                     | 7.x                                     |
| Styling         | [Tailwind CSS](https://tailwindcss.com/)                                      | 4.x (CSS-first via `@tailwindcss/vite`) |
| Maps            | [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)                         | 3.x                                     |
| Charts/Data     | [D3.js](https://d3js.org/)                                                    | 3.x / 4.x                               |
| Animations      | [GSAP](https://greensock.com/gsap/)                                           | 3.15                                    |
| CMS             | [Storyblok](https://www.storyblok.com/) (`@storyblok/svelte`)                 | 4.x                                     |
| Component docs  | [Storybook](https://storybook.js.org/)                                        | 10.x                                    |
| Linting         | ESLint + Prettier                                                             | 10.x / 3.x                              |
| Hosting         | [Vercel](https://vercel.com/) (`@sveltejs/adapter-vercel`)                    | Node 24.x                               |
| Runtime         | Node.js LTS                                                                   | **24.x** (see `.nvmrc`)                 |
| Package manager | [pnpm](https://pnpm.io/) via [Corepack](https://nodejs.org/api/corepack.html) | **11.x** (pinned in `package.json`)     |

---

## Getting Started

### Prerequisites

- **[NVM](https://github.com/nvm-sh/nvm)** — install Node **24 LTS** (`nvm install 24`)
- **[Corepack](https://nodejs.org/api/corepack.html)** — bundled with Node 24; activates the pinned pnpm version
- **[mkcert](https://github.com/FiloSottile/mkcert)** — trusted local HTTPS certificates (required for Storyblok Visual Editor)
- **`.env`** — create in project root with required tokens (see [Environment Variables](#environment-variables))

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd tnh-storytelling-sveltekit

# 2. Use Node 24 LTS (.nvmrc => 24)
nvm install    # first time only
nvm use

# 3. Enable Corepack and activate the pinned pnpm version (packageManager in package.json => pnpm@11.22.0)
corepack enable
corepack prepare pnpm@11.22.0 --activate

# 4. Install dependencies
pnpm install

# 5. Generate local SSL certificates (see HTTPS Setup below — each developer runs this once)

# 6. (Optional) Cache Gaza map data for local dev — file is gitignored; Vercel builds run this automatically
pnpm pre-fetch-gaza

# 7. Start the development server
pnpm dev
```

The dev server runs at **`https://localhost:5173`** with HTTPS enabled. If port 5173 is in use, Vite picks the next available port (e.g. `5174`).

### HTTPS Setup (mkcert)

The dev server runs over **HTTPS** because the [Storyblok Visual Editor](https://www.storyblok.com/docs/editor/visual-editor) requires a secure connection to load your local preview. Without HTTPS, the Visual Editor iframe is blocked by the browser.

Certificates are **per-developer** — they are signed by your local mkcert CA and are **gitignored** (`cert/*.pem`). Regenerate them on your machine (see `cert/README.md`).

**One-time setup:**

```bash
# macOS
brew install mkcert
mkcert -install          # adds mkcert's local CA to your system trust store

# Generate certs (from project root)
cd cert
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1
cd ..
```

Vite reads these files from `vite.config.ts`:

- `cert/localhost.pem` — certificate
- `cert/localhost-key.pem` — private key

**Troubleshooting**

| Symptom                                                            | Fix                                                                                                                                           |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Browser shows **"Not Secure"** with a red strikethrough on `https` | Certs were likely generated on another machine. Re-run the `mkcert` commands above on your Mac, restart `pnpm dev`, hard-refresh the browser. |
| Storyblok Visual Editor won't load localhost                       | Confirm you're using `https://` (not `http://`) and that mkcert CA is installed (`mkcert -install`).                                          |
| Certificate expired                                                | Re-run `mkcert` in `cert/` — new certs are valid for ~2 years.                                                                                |

> **Note:** HTTPS is only required for local dev. Production and staging on Vercel use Vercel's own TLS — no mkcert needed there.

### Environment Variables

Create a `.env` file in the project root:

```env
# Public (exposed to client)
PUBLIC_BASE_URL=https://interactive.thenewhumanitarian.org
PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_public_token
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
├── cert/                    # Local mkcert SSL certs (regenerate per developer — see HTTPS Setup)
├── pnpm-lock.yaml           # Lockfile (commit changes; use --frozen-lockfile on CI/Vercel)
└── .nvmrc                   # Node version pin (24)
```

---

## Available Scripts

| Command                          | Description                                   |
| -------------------------------- | --------------------------------------------- |
| `pnpm dev`                       | Start development server with HTTPS           |
| `pnpm build`                     | Pre-fetch data and build for production       |
| `pnpm preview`                   | Preview production build locally              |
| `pnpm install --frozen-lockfile` | CI/Vercel-style install (no lockfile changes) |
| `pnpm pre-fetch-data`            | Fetch all project data (orchestrator)         |
| `pnpm pre-fetch-gaza`            | Fetch Gaza map data only                      |
| `pnpm check`                     | Run Svelte type checking                      |
| `pnpm lint`                      | Run ESLint and Prettier                       |
| `pnpm format`                    | Format code with Prettier                     |
| `pnpm storybook`                 | Launch Storybook on port 6006                 |
| `pnpm build-storybook`           | Build static Storybook                        |

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

| Branch           | Environment | URL                                                                              |
| ---------------- | ----------- | -------------------------------------------------------------------------------- |
| `main`           | Production  | [interactive.thenewhumanitarian.org](https://interactive.thenewhumanitarian.org) |
| `preview`        | Staging     | [preview.thenewhumanitarian.org](https://preview.thenewhumanitarian.org)         |
| Feature branches | Preview     | Auto-generated Vercel preview URLs                                               |

### Vercel project settings

Configure these in the Vercel dashboard (Project → Settings → General / Build):

| Setting             | Value                            |
| ------------------- | -------------------------------- |
| **Node.js Version** | `24.x`                           |
| **Install Command** | `pnpm install --frozen-lockfile` |
| **Build Command**   | `pnpm build` (default)           |

Corepack reads the pinned pnpm version from `packageManager` in `package.json` (`pnpm@11.22.0`).

### Deployment flow

1. Push to `main` or `preview`
2. Vercel runs `pnpm install --frozen-lockfile` on Node 24
3. Build script runs `pre-fetch-data.js` to cache external data
4. SvelteKit builds with `@sveltejs/adapter-vercel`
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
<script
	src="https://interactive.thenewhumanitarian.org/embeddable/map/2025-09/gaza/embed"
	defer
></script>
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
pnpm storybook
```

Opens at `http://localhost:6006`

---

## Demos

### SvelteKit Projects

| Project                           | URL                                                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gaza Aid Seekers Dashboard        | [/embeddable/map/2025-09/gaza](https://interactive.thenewhumanitarian.org/embeddable/map/2025-09/gaza)                                                  |
| Gaza Spotlight Counter            | [/embeddable/map/2025-09/gaza/spotlight](https://interactive.thenewhumanitarian.org/embeddable/map/2025-09/gaza/spotlight)                              |
| Lebanon Displacement Diaries (EN) | [/stories/.../lebanon-displacement-diaries/home](https://interactive.thenewhumanitarian.org/stories/2025/05/22/lebanon-displacement-diaries/home)       |
| Lebanon Displacement Diaries (AR) | [/stories/.../lebanon-displacement-diaries/ar/home](https://interactive.thenewhumanitarian.org/stories/2025/05/22/lebanon-displacement-diaries/ar/home) |

### Legacy Projects (Gatsby)

| Project                   | URL                                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Year in Photos 2024       | [/stories/2024/12/27/year-in-photos](https://interactive.thenewhumanitarian.org/stories/2024/12/27/year-in-photos/)                                            |
| Drawing Derna             | [/stories/2023/11/28/art-time-crisis-drawing-derna](https://interactive.thenewhumanitarian.org/stories/2023/11/28/art-time-crisis-drawing-derna/)              |
| WhatsApp Lebanon          | [/stories/2022/07/28/whatsapp-lebanon](https://interactive.thenewhumanitarian.org/stories/2022/07/28/whatsapp-lebanon/)                                        |
| Darién Gap Migration      | [/stories/2022/05/10/us-asylum-darien-gap...](https://interactive.thenewhumanitarian.org/stories/2022/05/10/us-asylum-darien-gap-cuba-central-america-mexico/) |
| Rohingya Camp Women       | [/stories/2021/12/21/bangladesh-rohinyga...](https://interactive.thenewhumanitarian.org/stories/2021/12/21/bangladesh-rohinyga-camp-women-illustration/)       |
| Drawing Syria's Trauma    | [/stories/2021/12/8/drawing-syrias-trauma](https://interactive.thenewhumanitarian.org/stories/2021/12/8/drawing-syrias-trauma/)                                |
| Mediterranean Migration   | [/stories/2021/11/17/mediterranean-migration-europe](https://interactive.thenewhumanitarian.org/stories/2021/11/17/mediterranean-migration-europe/)            |
| A Decade of War in Syria  | [/stories/2021/a-decade-of-war-in-syria](https://interactive.thenewhumanitarian.org/stories/2021/a-decade-of-war-in-syria/)                                    |
| Bangladesh Cyclone Amphan | [/stories/2020/bangladesh-amphan...](https://interactive.thenewhumanitarian.org/stories/2020/bangladesh-amphan-hidden-climate-costs/)                          |

### Annual Reports

| Report             | URL                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Annual Report 2023 | [/reports/2024/07/25/annual-report-2023](https://interactive.thenewhumanitarian.org/reports/2024/07/25/annual-report-2023/) |
| Annual Report 2022 | [/reports/2023/06/27/annual-report-2022](https://interactive.thenewhumanitarian.org/reports/2023/06/27/annual-report-2022/) |
| Our Strategy       | [/reports/2022/12/05/our-strategy](https://interactive.thenewhumanitarian.org/reports/2022/12/05/our-strategy/)             |
| Annual Report 2021 | [/reports/2022/06/27/annual-report-2021](https://interactive.thenewhumanitarian.org/reports/2022/06/27/annual-report-2021/) |

---

## Contributing

1. `nvm use` — ensure Node 24 is active
2. Create a feature branch from `preview`
3. `pnpm install` && `pnpm dev` — test locally (regenerate mkcert certs if needed)
4. Push to trigger a Vercel preview deployment
5. Merge to `preview` for staging ([preview.thenewhumanitarian.org](https://preview.thenewhumanitarian.org))
6. Merge to `main` for production (release candidate after staging is verified)

---

## License

© The New Humanitarian. All rights reserved.
