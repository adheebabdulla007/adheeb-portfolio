# Portfolio release verification — 9 October 2026

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
