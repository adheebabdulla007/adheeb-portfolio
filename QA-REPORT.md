# Portfolio release verification — updated 10 October 2026

## Technology ribbon and résumé update
- Existing headings retained. Modern .NET 10, ASP.NET Core and EF Core made explicit in introduction and Pursuit copy.
- Fifteen locally hosted, original-color logo assets; official modern .NET brand mark. Loop uses CSS transforms, pauses offscreen and in hidden tabs, includes pause/resume, and becomes a fully visible wrapped list for reduced motion or no JavaScript. Duplicate visual list is hidden from assistive technology.
- Supplied 7 October master résumé replaces the older PDF unchanged. View endpoint and actual browser downloads checked against SHA-256 5A751AA3F34DBCEC80103A72941FA2BF38739109B88A2CB3552181B4993945D2. The earlier reported viewer failure was not reproduced; an explicit download is now available as a fallback.
- Full 33-configuration responsive/accessibility suite rerun successfully; 12 additional Chromium/Firefox/WebKit scenarios at 320, 390, 768 and 1440px check animation, pause/resume, reduced motion, image decoding, overflow and résumé bytes.
- Desktop and phone ribbon screenshots visually inspected. Updated production build: 27 public files, approximately 627 KiB including résumé.
- Timing measurements below describe the earlier 9 October build, not a new performance measurement of the ribbon update.

## Local result
Passed: 5 source/build checks, 33 browser configurations, and 5 resilience scenarios.
Browser matrix: Chromium, Firefox and WebKit; 320×640, 390×844, 430×932, 768×1024, 812×375, 1366×768, 1440×1000, 1920×1080, 2560×1440. Reduced motion and JavaScript disabled were checked separately in all three engines.
Checked: no horizontal overflow, decoded portrait, project links and dialogs, focus return, escape handling, mobile menu, local résumé response and PDF signature, page errors and failed asset requests. Axe WCAG 2 A/AA and 2.1 AA checks reported no violations in the audited page and ERP dialog states.
Additional checks: direct #pursuit entry, 200% text at 720px, 404 return navigation, interaction after going offline following a successful load, and blocked image/font requests.
Visual review: desktop and phone hero, final portrait composition, and ERP chapter screenshots inspected.
Automated checks are not a substitute for a complete manual accessibility audit.

## Scrolling and weight
Native browser scrolling. No GSAP, Lenis, runtime framework, analytics or third-party font requests.
355 measured animation-frame intervals during a full-page scripted scroll, local headless Chromium:
- Median: 16.7 ms
- 95th percentile: 16.8 ms
- Maximum: 33.4 ms
- Frames above 34 ms: 0
- Long tasks during this scrolling sample: 0
This run used an approximately 60 Hz headless environment. It does not prove 120 Hz rendering or physical-device behavior.
Initial Chromium layout shift: 0 in all nine viewports. Local initial LCP ranged from 192–2,004 ms. One initial long task was observed per Chromium page. These are unthrottled localhost measurements, not field or mobile-network scores.
Production output: 11 files, 745,114 bytes including the supplied PDF résumé.

## Links
- Every internal anchor resolves to one target.
- Project navigation returns to the original flow position even after cards have stacked.
- Local assets and résumé return successfully.
- GitHub profile: HTTP 200.
- WhatsApp: HTTP 200; redirects to api.whatsapp.com/send with phone=919400727023.
- LinkedIn: correct supplied destination retained; automated HTTP request blocked with status 999. Profile accessibility is not independently certified.
- Email and telephone: correct mailto/tel syntax verified; no message or call sent. Handler availability depends on the visitor's device.
- No links to the private Pursuit source or nonexistent product demos.

## Integrity and publication
The approved portrait is unchanged. SHA-256: B43BCA6C92688232DB7304DE83C3A23015C602BF750E27C9FF3B7B01F945BF0E, identical to the original release asset.
The original dirty working tree remains unchanged. Legacy code and two superseded portraits were removed only from the new branch and are recoverable from Git history.
Pursuit claims explicitly use the supplied 8 October 2026 evidence snapshot; this task did not re-audit its source.
This report records local verification. Hosted CI, publication, live HTTPS and physical-phone approval are separate release steps. Publication requires the owner's review and explicit approval under the supplied handover.
