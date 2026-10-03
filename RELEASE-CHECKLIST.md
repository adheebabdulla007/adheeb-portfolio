# Release record — 3 October 2026

## Approved scope

Editorial portrait composition (1C), connecting chapter transitions (2A), engineering atlas (3B), consistent visual story order for all viewers (revised 4), real before/after evidence (5C), storyboards (6B), ERP exploration (7A), adaptive motion (8A). No UI screenshots.

## Implementation

- Portrait composition uses a 1086 × 1448 editorial asset, bounded to 440 CSS pixels on desktop, with a 544-pixel responsive source.
- ERP, GCC, Pursuit and AI remain in the requested order. The atlas provides chapter navigation; each glyph reflects the work's structure.
- ERP has selectable workflow steps and a 14-path loading strategy comparison. No time improvement has been invented.
- Pursuit retains pinned architecture, test and dated CI evidence. AI graphics are explicitly illustrative.
- One stylesheet replaces the earlier base/override combination. Finite animations, native scrolling and observer-based chapter tracking; no animation framework or continuous JavaScript loop.
- Old studio portrait archived outside the repository and retained in Git history. Obsolete build stylesheet and portrait removed from dist.
- Seven public files, approximately 532 KiB including the résumé. The build excludes documents, QA captures and original photographs.

## Verification performed

- JavaScript syntax, all eight existing content/structure tests, build allowlist, internal anchors and dialog IDs, and git whitespace check.
- Chrome and Edge automated interaction checks at 1440 × 1000, 390 × 844, 320 × 640, 768 × 1024, 812 × 375 and 1920 × 1080.
- No horizontal document overflow, missing assets or page JavaScript errors in the final checks.
- ERP selected step and description, path 14 selection, Pursuit request trace, both source-linked test states, speech/words/class views, contact whitespace validation, Escape and focus return.
- Full and compact motion modes selected as expected. Changing the reduced-motion preference updates the site without reloading; request traces remain usable.
- Main content without JavaScript; keyboard entry and dialog flow; 200% CSS zoom; touch trophy dialog.
- Desktop and phone captures inspected for portrait, atlas, ERP, GCC, Pursuit, AI and award. Capture artifacts stay outside the public build.
- Local browser observations reported zero cumulative layout shift in the six viewport runs. These localhost, unthrottled observations are not field performance measurements.

## Findings resolved during QA

- The original floating navigation could cover a control on a short viewport. Desktop navigation moved into the outer margin; phone navigation moved to the top with scroll clearance.
- The atlas's minimum content size widened a 320-pixel mobile viewport to 332 pixels. The narrow grid was corrected; the final document width is 320 pixels.
- Reduced-motion browser testing waits for the media-change event before asserting state.

## Remaining verification limits

Physical iOS/Android devices, Safari/WebKit and Firefox were not available for verification. Chrome and Edge share the Chromium engine. No all-device smoothness guarantee or production Core Web Vitals claim is made. The owner should review facial likeness in the new editorial portrait.

## Publication

The local preview is http://127.0.0.1:8766. This revision is prepared on a separate Git branch. A local build or branch upload does not publish a live site. The GitHub Pages workflow is manual and deploys only a checked dist artifact.

## Rollback

Revert the release commit, build, and redeploy the previous checked artifact. Preserve Git history.
