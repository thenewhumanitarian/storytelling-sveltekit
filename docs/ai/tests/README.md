# AI test reports

Timestamped smoke and browser comparison notes for local dev vs production.

| File | What it covers |
| ---- | -------------- |
| `YYYY-MM-DDTHHMMSSZ-url-smoke.md` | HTTP status check (`pnpm check:urls`) |
| `YYYY-MM-DDTHHMMSSZ-playwright.md` | Browser load + console errors (representative pages) |

## Regenerate

```bash
# Terminal 1
pnpm dev

# HTTP smoke (all URLs in scripts/url-manifest.json)
NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm check:urls

# Browser comparison (subset; slower)
node scripts/playwright-compare.mjs

# Copy reports into docs/ai/tests/ (or script writes there directly)
```

Production base: `https://interactive.thenewhumanitarian.org`  
Local base: `https://localhost:5173`

Full URL list: [`URLS.md`](../../../URLS.md) (repo root).

**Manual index:** open [`/debug/all-articles`](https://localhost:5173/debug/all-articles) for Local / Production / Both links for every path.
