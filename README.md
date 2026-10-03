# Adheeb Abdulla V P — portfolio

A dependency-free static portfolio: HTML, CSS and JavaScript. No analytics, cookies, third-party fonts, runtime packages or backend.

## Develop and verify

Use Node.js 22 or newer.

```sh
node --check cinema.js
node --test tests/portfolio.test.mjs
node scripts/build.mjs
node scripts/serve.mjs
```

Preview: http://127.0.0.1:8766. The preview server binds to localhost, serves only dist, and is not a production server. The equivalent npm scripts are check, build and preview.

Optional browser regression checks require Playwright as a developer tool and an installed Chrome or Edge. With the preview running, execute `node tests/browser-check.mjs` (Chrome), or `node tests/browser-check.mjs msedge`. Set `PLAYWRIGHT_MODULE` to an external Playwright installation if it is not locally installed. `QA_SCREENSHOTS=1` saves optional captures into ignored `qa/`; captures never enter the build.

## Release

GitHub Actions checks syntax, content boundaries and the production build. Only deploy dist/. Seven files are allowlisted; original photographs, research, QA captures and documents cannot enter the build. All application URLs are relative, including responsive images, so project-path static hosting is supported. No environment variables or secrets are needed.

The manually dispatched Publish portfolio workflow deploys the verified artifact to GitHub Pages after Pages is configured to use GitHub Actions. A successful build does not mean the site has been published.

## Design and interactions

- Editorial portrait with two work fragments; face displayed at a bounded size. Responsive WebP sources at 544 and 1086 pixels wide.
- An engineering atlas links the four chapters in the requested order: ERP, GCC ownership, Pursuit, AI.
- ERP selectors trace downstream connections. The loading study contrasts 14 startup paths with on-demand access; individual paths can be selected.
- GCC visualizes record mapping, application ownership, 13 branches and one head office. The trophy can be inspected.
- Pursuit has request tracing, two source-linked test cases and a dated CI snapshot.
- Speech, transcription and SVM stages use different visual representations. The healthcare story shows research stages.
- Chapter handoffs branch, converge and change into a signal. Entry animations run once. There are no scroll handlers, wheel interception, pinned scenes or animation loops.
- Compact motion applies to touch/small screens, data-saving connections and low reported CPU counts. Reduced-motion preferences remove animation. This is a conservative heuristic, not a device performance benchmark.
- Native dialogs support Escape and return focus. Contact controls prepare drafts only.

## Evidence boundaries

ERP and GCC are company work with private source. Figures are supplied career facts, not publicly audited metrics. The 14-path comparison describes a loading strategy; no measured time improvement is claimed. The 130K+ figure is a point during the work, not a final total. Sole ownership refers to the GCC onboarding application within a wider team delivery.

Pursuit diagrams link to inspected commit 5a6c4139adac69606f55811e3430d034b4234c73. Company-access and refresh-token visuals summarize actual test assertions; the portfolio never runs the backend. The CI result is a dated snapshot (1 October 2026, run 36817898440). Newer commits may differ. Database/message writes are separate in the illustrated snapshot.

AI visuals explain methods; no accuracy, dataset-size or production deployment claim is made. No UI screenshots, customer records, patient data, group photographs or ID cards are included.

## Assets and QA

See ASSET-PROVENANCE.md for image treatment and the generation prompt. See RELEASE-CHECKLIST.md for verification coverage and limitations. Personal photographs, résumé and identifying content belong to Adheeb Abdulla V P.

## Rollback

Revert the release commit, rebuild, and redeploy a previously checked artifact. Do not rewrite public Git history.
