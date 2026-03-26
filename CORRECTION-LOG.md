# Correction Log — Cleared Investigation

## 25 March 2026: Factual correction to eviction rate statistic

### Issue

The Article 14 team flagged an inaccurate statistic in the opening of "The eviction machine" section:

> **Before:** "One eviction every three minutes, 24 hours a day, for an entire year."

This implied 175,200 evictions in a single year (525,600 minutes ÷ 3), which does not match the article's own data of ~101,935 people displaced over nearly five years (May 2021–March 2026).

### Correction

**Calculation based on the article's research data:**

| Metric | Value |
|--------|-------|
| Total people displaced | ~101,935 |
| Total homes demolished | ~22,000 |
| Timeframe | May 2021 – March 2026 (~4 years, 10 months) |
| Total minutes in period | ~2,539,000 |
| Minutes per person displaced | ~24.9 |
| Minutes per home demolished | ~115.4 |

The corrected line uses the per-person rate, which is both accurate and editorially impactful:

> **After:** "One person displaced every 25 minutes, 24 hours a day, for nearly five years."

**Verification:** 2,539,000 minutes ÷ 25 = 101,560 people — consistent with the reported total of ~101,935.

### File changed

- `src/routes/stories/2026/03/24/india-assam-evictions-forced-displacement/+page.svelte` (line 595)
