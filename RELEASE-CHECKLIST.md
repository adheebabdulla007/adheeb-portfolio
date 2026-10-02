# Release record: 2 October 2026

## Scope

Remove promotional copy, cap portrait enlargement, replace the rejected UI screenshot with diagrams, add finite transitions and prepare public static hosting.

## Architecture

Keep the dependency-free static implementation. Publish an explicit file allowlist. Credentials never enter source files. Use a fresh GitHub export to exclude discarded imagery and previous local history.

## Checks completed

- JavaScript syntax and eight Node content/structure tests.
- Build checks unique IDs, internal anchors, dialog targets and public assets.
- Desktop 1440px and emulated phone 390px inspected in Chromium, without document overflow in those checks.
- Test selector changes the diagram and exact source link.
- No UI screenshot or original photograph in the public build.

## Verification boundaries

- Physical Safari/iOS and Android performance is unmeasured.
- Portrait native resolution remains 1672 × 941.
- Verify CI and deployment remotely after upload.
- Contact testing must not send messages.

## Rollback

Revert the release commit, rebuild and republish. Alternatively redeploy a previously successful hosting version. Never force-push or rewrite public history.
