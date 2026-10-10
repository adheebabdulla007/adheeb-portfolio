# Adheeb Abdulla — portfolio release
A static portfolio inspired by Hitit's narrative transitions, with an original midnight-blue, ice and coral palette, Inter and Georgia typography, and an unaltered real portrait.

## Develop and verify
Node.js 22+, pnpm 10.13.1.
```
pnpm install --frozen-lockfile
pnpm run build
pnpm run check
pnpm exec playwright install chromium firefox webkit
pnpm run preview
pnpm run test:browser
```
Preview: http://127.0.0.1:8777/
The browser suite covers nine viewport sizes in Chromium, Firefox and WebKit, modal keyboard handling, links, assets, axe accessibility checks, reduced motion and JavaScript-disabled rendering. It saves screenshots and machine-readable results in ignored qa/.
The production build has an explicit asset allowlist. Only dist/ is published. It contains no third-party runtime dependencies or network font requests.

## Design and behavior
The opening leads into a real portrait, which moves from centre to left on sufficiently large and tall screens. Warm coral light yields to an ice background. Project chapters layer on desktop and remain normal vertical content on smaller screens. Scrolling is native, with a passive scroll listener scheduling one animation frame only when needed. Motion respects reduced-motion settings and background-tab visibility.
Design values are centralized in design-tokens.css. No photography is generated. Source facts and their limitations are retained in project detail dialogs and no-script disclosures.

## Release
A separate worktree preserves the previous dirty portfolio. Branch: codex/hitit-portfolio-final.
The check workflow runs on the release branch. Publishing is manual, through the Publish portfolio workflow, after the owner reviews and approves the release. Do not describe local emulation as physical-device or field performance.
The 404 home destination must follow the deployed base path if a custom domain is later configured.
