# Keep Haiti incident evidence private

Status: accepted and implemented for local review on 20 October 2026.

The investigation's contributors require anonymity because attribution could endanger their work or staff. Preserve original evidence for editorial checking, but omit provider identities, checking notes, source-linked identifiers, and links to the working evidence workbook from public feeds, browser payloads, generated public caches, and interface controls. Hiding a source button alone does not meet this requirement. Public methodology should use editor-approved wording; attribution for public geographic reference data remains separate and should be retained as required.

The `haiti-display-v1` schema explicitly projects display fields at the live-feed, snapshot and download boundaries. The restricted editorial archive was verified against the original workbook before changing Sheet1. Private backup tabs were removed from the public workbook after verification; Sheet1 and its existing published URL were retained. Original casualty data, evidence notes and the source-to-public-ID mapping are stored outside this repository. This change does not erase historical access or Google revision history.

The current testing edition is pinned to a sanitised snapshot containing only the supplied 2025 incidents, including the report with an unconfirmed date. Local, staging, build caches and CSV downloads all use that selection. The broader live feed is not fetched, preventing other years or context events from returning during a rebuild. Original source workbooks and private backups remain unchanged. Reimporting source changes requires an explicit editorial review.
