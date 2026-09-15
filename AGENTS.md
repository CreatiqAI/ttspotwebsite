# TTSpot project instructions

## Source and publication
- This directory is the website repository. The editable static site is in `dist/`.
- GitHub `origin` is https://github.com/CreatiqAI/ttspotwebsite.git; the primary branch is `main`.
- The user has explicitly authorized automatic commit and push for every completed project change. After appropriate checks, stage the relevant files, commit, and verify the commit reached GitHub. Do not ask for repeat approval.
- `.githooks/post-commit` automatically pushes the committed branch to `origin` when `core.hooksPath=.githooks`. If the hook is unavailable, push explicitly. A failed push does not undo the local commit: diagnose and retry safely, and report any remaining blocker.
- Never force-push or overwrite remote changes. Fetch and integrate safely if GitHub has advanced.
- Do not commit unrelated files, logs, credentials, temporary archives, or historical one-off migration scripts. The Google Maps browser key is intentionally public client configuration; preserve its website/API restrictions in Google Cloud. Never store server secrets here.
- If Git author identity is unavailable, use per-command `-c user.name=Codex -c user.email=codex@openai.com` rather than changing the user's global identity.
- Sites hosting remains the live website deployment. Preserve `.openai/hosting.json`; its source push is separate from GitHub. Use Sites credentials only in a per-command authorization header and never replace the GitHub origin with the Sites source URL.
- Vercel is also supported by `vercel.json`: repository Root Directory `./`, static Output Directory `dist`, no install/build commands. Preserve this configuration; do not initialize a new framework or route every asset to index.html.

## Verification and important behavior
- Run `node check-events.cjs` and `node check-music.cjs` for relevant map/audio changes. These mock-based checks do not verify Google authorization or browser rendering.
- Run `node check-performance.cjs` for road/loading changes. Preserve lossless full-resolution assets and full-resolution detail images; use a new filename for changed media to invalidate its browser cache.
- `dist/continuous-highway.js` is also embedded in `dist/index.html`; keep both synchronized when editing the road.
- Preserve the existing intro, region backgrounds, road/car animation, music checkpoint, and CarPlay UI unless requested otherwise.
- Forms are currently previews, not a working signup backend. Do not claim signups are collected.
- Preserve accurate event dates, past-event labels, and unconfirmed-time notices. Listing a business does not imply a TTSpot partnership.
