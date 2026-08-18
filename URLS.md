# URL inventory

Canonical list of public URLs served by this codebase.

| Environment | Base URL                                     |
| ----------- | -------------------------------------------- |
| Production  | `https://interactive.thenewhumanitarian.org` |
| Local dev   | `https://localhost:5173`                     |

**Machine-readable manifest:** [`scripts/url-manifest.json`](scripts/url-manifest.json) — used by `pnpm check:urls`.

**Smoke-test report:** Run `pnpm check:urls` (requires `pnpm dev`) to generate [`URL-CHECK-REPORT.md`](URL-CHECK-REPORT.md). That file is gitignored.

---

## Routing precedence

1. **SvelteKit routes** (`src/routes/`) win when a path matches.
2. **Static legacy HTML** (`static/`) is served at the same path on Vercel.
3. In **dev**, Vite middleware in [`vite.config.ts`](vite.config.ts) serves legacy Gatsby HTML from `static/` for `/stories/*`, `/reports/*`, and `/404`. Restart `pnpm dev` after changing that plugin.

Lebanon diaries and Cleared are SvelteKit-only. Legacy Gatsby projects live under `static/stories/` and `static/reports/`.

---

## SvelteKit — root and utilities

| Path         | Notes                                                           |
| ------------ | --------------------------------------------------------------- |
| `/`          | Dev landing page; also `static/index.html` (legacy Gatsby root) |
| `/login`     | Login page                                                      |
| `/dashboard` | Deploy dashboard (auth required; not in smoke test)             |

---

## SvelteKit — Lebanon Displacement Diaries

| Path                                                       | Notes                  |
| ---------------------------------------------------------- | ---------------------- |
| `/stories/2025/05/22/lebanon-displacement-diaries`         | Redirects → `/home`    |
| `/stories/2025/05/22/lebanon-displacement-diaries/home`    | English hub            |
| `/stories/2025/05/22/lebanon-displacement-diaries/ar`      | Redirects → `/ar/home` |
| `/stories/2025/05/22/lebanon-displacement-diaries/ar/home` | Arabic hub             |

### Diary pages (Storyblok)

Slugs are pinned in `url-manifest.json`. Update when new diaries are published in Storyblok.

| Slug    | English                                                            | Arabic                   |
| ------- | ------------------------------------------------------------------ | ------------------------ |
| abu-ali | `/stories/2025/05/22/lebanon-displacement-diaries/diaries/abu-ali` | `.../ar/diaries/abu-ali` |
| abbas   | `.../diaries/abbas`                                                | `.../ar/diaries/abbas`   |
| hassan  | `.../diaries/hassan`                                               | `.../ar/diaries/hassan`  |
| leo     | `.../diaries/leo`                                                  | `.../ar/diaries/leo`     |
| nour    | `.../diaries/nour`                                                 | `.../ar/diaries/nour`    |
| raghida | `.../diaries/raghida`                                              | `.../ar/diaries/raghida` |
| riham   | `.../diaries/riham`                                                | `.../ar/diaries/riham`   |
| robert  | `.../diaries/robert`                                               | `.../ar/diaries/robert`  |
| yasmina | `.../diaries/yasmina`                                              | `.../ar/diaries/yasmina` |
| zahraa  | `.../diaries/zahraa`                                               | `.../ar/diaries/zahraa`  |

---

## SvelteKit — Cleared (Assam evictions)

| Path                                                            |
| --------------------------------------------------------------- |
| `/stories/2026/03/24/india-assam-evictions-forced-displacement` |

Drupal stub: `thenewhumanitarian.org/interactive-storytelling/2026/03/24/cleared` should redirect to this URL.

---

## SvelteKit — Gaza embeds

| Path                                     | Notes                                       |
| ---------------------------------------- | ------------------------------------------- |
| `/embeddable/map/2025-09/gaza`           | Main dashboard                              |
| `/embeddable/map/2025-09/gaza/spotlight` | Spotlight counter                           |
| `/embeddable/map/2025-09/gaza/embed`     | Embed script (JavaScript, not HTML)         |
| `/embeddable/map/2025-09/gaza/track`     | Analytics POST endpoint (not in smoke test) |

---

## SvelteKit — Haiti explosive drones map

| Path                                  | Notes                                       |
| ------------------------------------- | ------------------------------------------- |
| `/embeddable/map/2026-08/haiti`       | Main dashboard (EN/FR via `?lang=fr`)       |
| `/embeddable/map/2026-08/haiti/embed` | Embed script (JavaScript, not HTML)         |
| `/embeddable/map/2026-08/haiti/track` | Analytics POST endpoint (not in smoke test) |

---

## SvelteKit — Syria map

| Path                              | Notes                                                          |
| --------------------------------- | -------------------------------------------------------------- |
| `/embeddable/map/2024-11/syria`   | **404** on production and locally (no route without marker ID) |
| `/embeddable/map/2024-11/syria/0` | Marker: Khaled Al-Faris                                        |
| `/embeddable/map/2024-11/syria/1` | Marker: Layla Hammoud                                          |
| `/embeddable/map/2024-11/syria/2` | Marker                                                         |
| `/embeddable/map/2024-11/syria/3` | Marker                                                         |
| `/embeddable/map/2024-11/syria/4` | Marker                                                         |

---

## SvelteKit — other embeds

| Path                               | Notes                                                  |
| ---------------------------------- | ------------------------------------------------------ |
| `/embeddable/sharepoint/bluesky`   | Bluesky SharePoint embed                               |
| `/embeddable/timeline-x/{sheetId}` | TimelineJS + Google Sheets (dynamic; not smoke-tested) |

---

## Legacy Gatsby — stories (`static/stories/`)

| Path                                                                   |
| ---------------------------------------------------------------------- |
| `/stories/2020/bangladesh-amphan-hidden-climate-costs`                 |
| `/stories/2021/a-decade-of-war-in-syria`                               |
| `/stories/2021/11/17/mediterranean-migration-europe`                   |
| `/stories/2021/12/8/drawing-syrias-trauma`                             |
| `/stories/2021/12/21/bangladesh-rohinyga-camp-women-illustration`      |
| `/stories/2022/05/10/us-asylum-darien-gap-cuba-central-america-mexico` |
| `/stories/2022/07/28/whatsapp-lebanon`                                 |
| `/stories/2022/07/28/wtsb-lbnn`                                        |
| `/stories/2023/11/28/art-time-crisis-drawing-derna`                    |
| `/stories/2024/12/27/year-in-photos`                                   |

---

## Legacy Gatsby — annual reports (`static/reports/`)

| Path                                     |
| ---------------------------------------- |
| `/reports/2022/06/27/annual-report-2021` |
| `/reports/2022/12/05/our-strategy`       |
| `/reports/2023/06/27/annual-report-2022` |
| `/reports/2024/07/25/annual-report-2023` |

---

## Static — misc

| Path                    | Notes                   |
| ----------------------- | ----------------------- |
| `/404`                  | `static/404/index.html` |
| `/404.html`             | `static/404.html`       |
| `/articles/264103.html` | Legacy article          |

---

## Excluded from smoke test

| Path                               | Reason                  |
| ---------------------------------- | ----------------------- |
| `/api/*`                           | POST / auth endpoints   |
| `/dashboard`                       | Requires session        |
| `/embeddable/timeline-x/{sheetId}` | Dynamic Google Sheet ID |
| `http://localhost:6006`            | Storybook (dev only)    |

---

## Regenerating the smoke test

```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm check:urls
```

Options:

```bash
LOCAL_BASE=https://localhost:5174 pnpm check:urls   # if Vite uses another port
PROD_BASE=https://interactive.thenewhumanitarian.org pnpm check:urls
```

Exit code `1` if any page fails locally while production succeeds, or local returns 5xx.

---

## Updating the inventory

1. Add paths to [`scripts/url-manifest.json`](scripts/url-manifest.json).
2. Mirror changes in this file (or regenerate sections from the manifest).
3. For new Lebanon diaries, add slugs to `lebanonDiarySlugs` in the manifest.
